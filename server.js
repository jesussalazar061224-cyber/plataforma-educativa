/**
 * AdaptiClass · Servidor
 * ------------------------------------------------------------
 * - Sirve la plataforma web (carpeta /public).
 * - Hace de intermediario con el proveedor de IA (Google Gemini,
 *   Groq u OpenRouter) para que la clave NUNCA llegue al navegador.
 *
 * Requisitos: Node.js 18 o superior. Sin dependencias externas.
 * Uso: npm start   (o doble clic en iniciar-windows.bat / iniciar-mac.command)
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

/* =========================================================
   Configuración
   ========================================================= */
const ARCHIVO_ENV = path.join(__dirname, ".env");
cargarEnv(ARCHIVO_ENV);

const PROVEEDORES = {
  gemini: {
    nombre: "Google Gemini",
    base: "https://generativelanguage.googleapis.com/v1beta/openai",
    modelos: ["gemini-3.8-flash", "gemini-2.5-flash"],
    verificar: "/models",
    extra: { reasoning_effort: "low" },
    pista: "Las claves de Google AI Studio suelen empezar con «AIza»."
  },
  groq: {
    nombre: "Groq",
    base: "https://api.groq.com/openai/v1",
    modelos: ["openai/gpt-oss-120b", "openai/gpt-oss-20b"],
    verificar: "/models",
    extra: {},
    secuencial: true, // su límite por minuto es bajo: mejor generar un perfil a la vez
    pista: "Las claves de Groq empiezan con «gsk_»."
  },
  openrouter: {
    nombre: "OpenRouter",
    base: "https://openrouter.ai/api/v1",
    modelos: ["openrouter/free"],
    verificar: "/key",
    extra: {},
    cabeceras: { "X-Title": "AdaptiClass" },
    pista: "Las claves de OpenRouter empiezan con «sk-or-v1-»."
  }
};

const PORT = Number(process.env.PORT) || 3000;
const URL_SITIO = process.env.SITE_URL || process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
const TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS) || 120000;
const PUBLIC_DIR = path.join(__dirname, "public");

// Compatibilidad con la versión anterior (OPENROUTER_API_KEY)
let config = leerConfig();

function leerConfig() {
  let proveedor = String(process.env.AI_PROVIDER || "").trim().toLowerCase();
  let clave = limpiarClave(process.env.AI_API_KEY);
  if (!clave && limpiarClave(process.env.OPENROUTER_API_KEY)) {
    clave = limpiarClave(process.env.OPENROUTER_API_KEY);
    proveedor = proveedor || "openrouter";
  }
  if (!PROVEEDORES[proveedor]) proveedor = detectarProveedor(clave) || "gemini";
  const modeloEnv = String(process.env.AI_MODEL || process.env.OPENROUTER_MODEL || "").trim();
  return { proveedor, clave, modeloEnv };
}

function detectarProveedor(clave) {
  if (/^sk-or-/.test(clave)) return "openrouter";
  if (/^gsk_/.test(clave)) return "groq";
  if (/^AIza/.test(clave)) return "gemini";
  return null;
}

function modelosActivos() {
  const p = PROVEEDORES[config.proveedor];
  return config.modeloEnv ? [config.modeloEnv, ...p.modelos.filter(m => m !== config.modeloEnv)] : p.modelos;
}

function limpiarClave(valor) {
  const clave = String(valor || "").trim();
  return /PEGA_AQUI|TU_CLAVE/i.test(clave) ? "" : clave;
}

function cargarEnv(archivo) {
  if (!fs.existsSync(archivo)) return;
  for (const linea of fs.readFileSync(archivo, "utf8").split(/\r?\n/)) {
    const m = linea.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m || linea.trim().startsWith("#")) continue;
    let valor = m[2];
    if (/^(['"]).*\1$/.test(valor)) valor = valor.slice(1, -1);
    if (process.env[m[1]] === undefined) process.env[m[1]] = valor;
  }
}

/** Guarda (o reemplaza) variables en .env conservando el resto del archivo. */
function escribirEnv(variables) {
  let lineas = fs.existsSync(ARCHIVO_ENV) ? fs.readFileSync(ARCHIVO_ENV, "utf8").split(/\r?\n/) : [];
  for (const [nombre, valor] of Object.entries(variables)) {
    const regex = new RegExp(`^\\s*#?\\s*${nombre}\\s*=`);
    const i = lineas.findIndex(l => regex.test(l));
    if (valor === null) { if (i >= 0) lineas.splice(i, 1); continue; }
    if (i >= 0) lineas[i] = `${nombre}=${valor}`; else lineas.unshift(`${nombre}=${valor}`);
  }
  fs.writeFileSync(ARCHIVO_ENV, lineas.join("\n").replace(/\n*$/, "\n"), "utf8");
}

/* =========================================================
   Errores legibles
   ========================================================= */
class ErrorIA extends Error {
  constructor(status, mensaje, detalle) { super(mensaje); this.status = status; this.detalle = detalle; }
}

function traducirError(status, cuerpo) {
  const p = PROVEEDORES[config.proveedor];
  const detalle = (Array.isArray(cuerpo) ? cuerpo[0] : cuerpo)?.error?.message || cuerpo?.message || "";
  if (status === 400 && /api key|api_key|invalid.*key/i.test(detalle)) status = 401;
  switch (status) {
    case 400: return new ErrorIA(400, `${p.nombre} rechazó la solicitud. Revisa el modelo configurado.`, detalle);
    case 401: return new ErrorIA(401, `La clave de ${p.nombre} no es válida o fue revocada. Pulsa «Configurar IA» y pega una clave nueva.`, detalle);
    case 402: return new ErrorIA(402, `La cuenta de ${p.nombre} no tiene créditos para este modelo.`, detalle);
    case 403: return new ErrorIA(403, `${p.nombre} no permite esta solicitud con tu clave (permisos o región).`, detalle);
    case 404: return new ErrorIA(404, "El modelo configurado no existe o no está disponible.", detalle);
    case 408: return new ErrorIA(408, "La IA tardó demasiado en responder. Intenta de nuevo.", detalle);
    case 413: return new ErrorIA(413, "La solicitud es demasiado larga para el límite gratuito. Prueba con menos puntos por perfil.", detalle);
    case 429: return new ErrorIA(429, `Se alcanzó el límite de uso gratuito de ${p.nombre}. Espera un minuto (o hasta mañana si es el límite diario) e intenta de nuevo.`, detalle);
    case 500: case 502: case 503: return new ErrorIA(503, `${p.nombre} no está disponible en este momento. Intenta de nuevo en unos minutos.`, detalle);
    default: return new ErrorIA(502, "La IA devolvió un error inesperado.", detalle || `HTTP ${status}`);
  }
}

/* =========================================================
   Verificación de la clave
   ========================================================= */
let estadoClave = { valida: null, motivo: "", uso: null, revisado: 0 };

async function verificarClave(proveedor, clave) {
  const p = PROVEEDORES[proveedor];
  const controlador = new AbortController();
  const t = setTimeout(() => controlador.abort(), 15000);
  try {
    const r = await fetch(`${process.env.AI_BASE_URL || p.base}${p.verificar}`, {
      headers: { Authorization: `Bearer ${clave}` }, signal: controlador.signal
    });
    const datos = await r.json().catch(() => ({}));
    const texto = JSON.stringify(datos).slice(0, 500);
    if (r.status === 401 || r.status === 403 || (r.status === 400 && /key/i.test(texto))) {
      return { valida: false, motivo: `La clave no es válida para ${p.nombre}. ${p.pista}` };
    }
    if (!r.ok) return { valida: null, motivo: `${p.nombre} respondió con un error (HTTP ${r.status}). Se intentará usar la clave igualmente.` };
    let uso = null;
    const f = datos?.data?.free_model_daily_requests;
    if (f && (f.limit != null || f.remaining != null)) uso = { usados: f.used ?? null, limite: f.limit ?? null, restantes: f.remaining ?? null };
    return { valida: true, motivo: "", uso };
  } catch {
    return { valida: null, motivo: `No se pudo comprobar la clave: no hay conexión con ${p.nombre}.` };
  } finally {
    clearTimeout(t);
  }
}

async function obtenerEstadoClave(forzar = false) {
  if (!config.clave) return { valida: false, motivo: "Todavía no hay una clave de IA configurada.", uso: null };
  if (forzar || Date.now() - estadoClave.revisado > 2 * 60 * 1000) {
    estadoClave = { ...(await verificarClave(config.proveedor, config.clave)), revisado: Date.now() };
  }
  return estadoClave;
}

function esLocal(req) {
  const ip = req.socket.remoteAddress || "";
  return !req.headers["x-forwarded-for"] && ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(ip);
}

/* =========================================================
   Llamada al proveedor de IA (formato compatible con OpenAI)
   ========================================================= */
const esperar = ms => new Promise(r => setTimeout(r, ms));

async function peticionIA(modelo, mensajes, opciones, sinExtras = false) {
  const p = PROVEEDORES[config.proveedor];
  const cuerpo = {
    model: modelo,
    messages: mensajes,
    max_tokens: opciones.maxTokens,
    temperature: opciones.temperatura,
    ...(sinExtras ? {} : p.extra)
  };
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(`${process.env.AI_BASE_URL || p.base}/chat/completions`, {
      method: "POST",
      signal: controlador.signal,
      headers: {
        Authorization: `Bearer ${config.clave}`,
        "Content-Type": "application/json",
        "HTTP-Referer": URL_SITIO,
        ...(p.cabeceras || {})
      },
      body: JSON.stringify(cuerpo)
    });
    const datos = await r.json().catch(() => ({}));
    return { r, datos };
  } catch (err) {
    if (err.name === "AbortError") throw traducirError(408);
    throw new ErrorIA(502, `No se pudo conectar con ${p.nombre}. Revisa la conexión a internet del servidor.`, err.message);
  } finally {
    clearTimeout(temporizador);
  }
}

async function llamarIA(mensajes, { maxTokens = 1500, temperatura = 0.6 } = {}) {
  if (!config.clave) {
    throw new ErrorIA(503, "La IA todavía no está configurada. Pulsa «Configurar IA» en la barra superior y pega tu clave.");
  }
  const opciones = { maxTokens, temperatura };
  let ultimoError;

  for (const modelo of modelosActivos()) {
    let sinExtras = false;
    for (let intento = 0; intento < 3; intento++) {
      const { r, datos } = await peticionIA(modelo, mensajes, opciones, sinExtras);
      const errorCuerpo = Array.isArray(datos) ? datos[0]?.error : datos.error;

      if (r.ok && !errorCuerpo) {
        estadoClave.revisado = 0; // refrescar el uso en la próxima consulta de estado
        const eleccion = datos.choices?.[0];
        let contenido = eleccion?.message?.content;
        if (Array.isArray(contenido)) contenido = contenido.map(x => x.text || "").join("");
        contenido = String(contenido || "").replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
        if (!contenido) {
          ultimoError = new ErrorIA(502, eleccion?.finish_reason === "length"
            ? "La respuesta se cortó antes de terminar. Prueba con menos puntos por perfil."
            : "La IA devolvió una respuesta vacía. Intenta de nuevo.");
          break;
        }
        return { contenido, modelo: datos.model || modelo };
      }

      const status = r.ok ? Number(errorCuerpo?.code) || 502 : r.status;
      const error = traducirError(status, datos);

      if (error.status === 401) {
        estadoClave = { valida: false, motivo: error.message, uso: null, revisado: Date.now() };
        throw error;
      }
      // Parámetro opcional no admitido por el modelo: reintentar sin él
      if (status === 400 && !sinExtras && Object.keys(PROVEEDORES[config.proveedor].extra).length) { sinExtras = true; continue; }
      // Límite por minuto: esperar lo que indique el proveedor (máx. 30 s) y reintentar
      if (status === 429 && intento < 2) {
        const espera = Number(r.headers.get("retry-after"));
        if (espera > 0 && espera <= 30) { await esperar(espera * 1000 + 300); continue; }
        if (!espera) { await esperar(4000 * (intento + 1)); continue; }
      }
      if (status === 500 || status === 502 || status === 503) { if (intento < 1) { await esperar(2000); continue; } }
      ultimoError = error;
      break;
    }
    // Probar el siguiente modelo solo si este no existe o no está disponible
    if (!ultimoError || ![400, 404, 503].includes(ultimoError.status)) break;
  }
  throw ultimoError || new ErrorIA(502, "La IA no respondió.");
}

/* =========================================================
   Extraer y validar el JSON de la IA
   ========================================================= */
function extraerJSON(texto) {
  const limpio = texto.trim();
  const recortar = s => {
    const ini = s.search(/[\[{]/);
    const fin = Math.max(s.lastIndexOf("}"), s.lastIndexOf("]"));
    if (ini === -1 || fin <= ini) throw new Error("sin JSON");
    return JSON.parse(s.slice(ini, fin + 1));
  };
  try { return recortar(limpio); } catch { /* sigue */ }
  const ini = limpio.search(/```(?:json)?\s*/i);
  if (ini !== -1) {
    const sinApertura = limpio.slice(ini).replace(/^```(?:json)?\s*/i, "");
    const fin = sinApertura.lastIndexOf("```");
    return recortar(fin > 0 ? sinApertura.slice(0, fin) : sinApertura);
  }
  throw new Error("sin JSON");
}

const texto = v => (typeof v === "string" ? v : v == null ? "" : String(v)).trim();

function normalizarPregunta(q) {
  if (!q || typeof q !== "object") return null;
  const enunciado = texto(q.enunciado || q.pregunta || q.question);
  let opciones = Array.isArray(q.opciones || q.options) ? (q.opciones || q.options).map(o => texto(typeof o === "object" ? o.texto || o.text : o)).filter(Boolean) : [];
  opciones = opciones.map(o => o.replace(/^[A-Da-d][\.\)]\s+/, "")).slice(0, 5);
  if (!enunciado || opciones.length < 3) return null;
  let c = q.correcta ?? q.respuesta ?? q.answer;
  if (typeof c === "string") {
    const letra = c.trim().match(/^([A-Ea-e])[\.\)]?$/);
    if (letra) c = letra[1].toUpperCase().charCodeAt(0) - 65;
    else if (/^\d+$/.test(c.trim())) c = Number(c);
    else c = opciones.findIndex(o => o.toLowerCase() === c.trim().toLowerCase().replace(/^[A-Da-d][\.\)]\s+/, ""));
  }
  c = Number(c);
  if (!Number.isInteger(c) || c < 0 || c >= opciones.length) return null;
  return { enunciado, opciones, correcta: c, explicacion: texto(q.explicacion || q.explanation) };
}

function normalizarActividades(json) {
  const lista = Array.isArray(json) ? json : (json.actividades || json.puntos || json.items || []);
  return lista.map(a => ({
    titulo: texto(a.titulo || a.title).replace(/^\d+[\.\-\)]\s*/, ""),
    explicacion: texto(a.explicacion || a.explicación || a.teoria),
    ejemplo: texto(a.ejemplo || a.example),
    tarea: texto(a.tarea || a.consigna || a.task),
    apoyo: texto(a.apoyo || a.pasos || a.ayuda),
    reto: texto(a.reto || a.desafio || a.desafío || a.challenge),
    pregunta: normalizarPregunta(a.pregunta || a.quiz || a.comprobacion)
  })).filter(a => a.titulo && a.explicacion);
}

/* =========================================================
   Prompts
   ========================================================= */
const ESTILOS = {
  practico: "PRÁCTICO: aprende haciendo. Prioriza ejercicios guiados, código o pasos ejecutables y retos concretos.",
  visual: "VISUAL: aprende con esquemas. Describe diagramas, tablas comparativas, flujos y analogías espaciales que el alumno pueda dibujar.",
  analitico: "ANALÍTICO: aprende desde la teoría. Prioriza definiciones formales, fundamentos, comparación de enfoques y razonamiento riguroso."
};

const NIVELES = {
  basico: "BÁSICO: está empezando o le está costando. Usa lenguaje sencillo, pasos pequeños, analogías cotidianas y ejemplos resueltos. Verifica que entendió antes de avanzar.",
  intermedio: "INTERMEDIO: maneja lo esencial. Da pistas en lugar de soluciones y conecta conceptos.",
  avanzado: "AVANZADO: domina el tema. Profundiza, plantea casos límite, buenas prácticas y retos adicionales; evita repetir lo básico."
};

function promptActividades(tema, estilo, contexto, cantidad) {
  return [
    {
      role: "system",
      content: "Eres un profesor universitario de ingeniería y sistemas experto en diseño instruccional y aprendizaje adaptativo. Escribes en español. Respondes SOLO con JSON válido, sin texto adicional."
    },
    {
      role: "user",
      content:
`Diseña exactamente ${cantidad} puntos de aprendizaje progresivos sobre el tema: "${tema}".
Estilo de aprendizaje del alumno: ${ESTILOS[estilo]}
${contexto ? `Contexto del curso indicado por el docente: ${contexto}\n` : ""}
Cada punto debe servir a alumnos de distinto nivel de capacidad, por eso incluye apoyo para quien va lento y un reto para quien va adelantado.

Devuelve un objeto JSON con esta forma exacta:
{"actividades":[{
  "titulo":"...",
  "explicacion":"...",
  "ejemplo":"...",
  "tarea":"...",
  "apoyo":"...",
  "reto":"...",
  "pregunta":{"enunciado":"...","opciones":["...","...","...","..."],"correcta":0,"explicacion":"..."}
}]}

Reglas:
- "titulo": breve y técnico (máx. 8 palabras), sin numeración.
- "explicacion": 3 a 5 oraciones con el fundamento correcto, comprensible para un alumno de nivel intermedio.
- "ejemplo": ejemplo concreto. Si incluye código, usa bloques Markdown con triple acento grave y el lenguaje (por ejemplo \`\`\`sql).
- "tarea": consigna verificable que el alumno entregará como evidencia (PDF o imagen).
- "apoyo": andamiaje para alumnos de nivel básico: 3 a 5 pasos numerados ("1. ...") que guían la tarea sin resolverla, con una analogía sencilla.
- "reto": extensión para alumnos avanzados (1 a 3 oraciones): un caso más complejo, una optimización o una variante.
- "pregunta": pregunta de opción múltiple que compruebe la comprensión del punto, con 4 opciones plausibles, "correcta" = índice (0-3) de la opción correcta, y "explicacion" breve de por qué es correcta. Varía la posición de la respuesta correcta.
- Ordena de lo básico a lo avanzado. Sin comentarios fuera del JSON.`
    }
  ];
}

function promptTutor(pregunta, estilo, nivel, contexto, historial) {
  const mensajes = [{
    role: "system",
    content:
`Eres el tutor académico de AdaptiClass. Respondes en español, con claridad y precisión.
Estilo de aprendizaje del alumno: ${ESTILOS[estilo] || ESTILOS.practico}
Nivel actual del alumno: ${NIVELES[nivel] || NIVELES.intermedio}
${contexto ? `El alumno está trabajando en: ${contexto}.` : ""}
Usa Markdown breve (listas, **negritas**, bloques de código cuando aplique). Máximo ~250 palabras salvo que pidan más.
Orienta al alumno para que razone: no entregues la tarea resuelta completa; da pistas acordes a su nivel, ejemplos parecidos y verifica su comprensión con una pregunta al final.`
  }];
  for (const m of (historial || []).slice(-8)) {
    if ((m.rol === "user" || m.rol === "assistant") && typeof m.texto === "string") {
      mensajes.push({ role: m.rol, content: m.texto.slice(0, 4000) });
    }
  }
  mensajes.push({ role: "user", content: pregunta });
  return mensajes;
}

/* =========================================================
   Rutas de la API
   ========================================================= */
async function rutaActividades(datos) {
  const tema = String(datos.tema || "").trim().slice(0, 200);
  const estilo = ESTILOS[datos.estilo] ? datos.estilo : "practico";
  const contexto = String(datos.contexto || "").trim().slice(0, 600);
  const cantidad = Math.min(Math.max(Number(datos.cantidad) || 8, 3), 12);
  if (!tema) throw new ErrorIA(400, "Escribe el tema de la actividad.");

  let ultimoError;
  for (let intento = 1; intento <= 2; intento++) {
    const { contenido, modelo } = await llamarIA(promptActividades(tema, estilo, contexto, cantidad), { maxTokens: 12000, temperatura: 0.5 });
    try {
      const actividades = normalizarActividades(extraerJSON(contenido)).slice(0, cantidad);
      if (actividades.length >= Math.min(3, cantidad)) return { actividades, modelo };
      ultimoError = new ErrorIA(502, "La IA devolvió menos puntos de los esperados. Intenta de nuevo.");
    } catch {
      ultimoError = new ErrorIA(502, "La IA respondió en un formato que no se pudo leer. Intenta de nuevo.");
    }
  }
  throw ultimoError;
}

async function rutaTutor(datos) {
  const pregunta = String(datos.pregunta || "").trim().slice(0, 2000);
  if (!pregunta) throw new ErrorIA(400, "Escribe una pregunta.");
  const { contenido, modelo } = await llamarIA(
    promptTutor(pregunta, datos.estilo, datos.nivel, String(datos.contexto || "").slice(0, 500), datos.historial),
    { maxTokens: 2000, temperatura: 0.6 }
  );
  return { respuesta: contenido, modelo };
}

async function rutaConfigurar(req) {
  if (!esLocal(req)) {
    throw new ErrorIA(403, "Por seguridad, la clave solo se puede cambiar desde la computadora donde corre el servidor. En un hosting, configúrala en sus variables de entorno (AI_PROVIDER y AI_API_KEY).");
  }
  const datos = await leerCuerpo(req, 4096);
  const proveedor = PROVEEDORES[datos.proveedor] ? datos.proveedor : null;
  const clave = String(datos.clave || "").trim();
  if (!proveedor) throw new ErrorIA(400, "Elige un proveedor de IA.");
  if (!/^\S{20,300}$/.test(clave)) throw new ErrorIA(400, `Esa no parece una clave completa. ${PROVEEDORES[proveedor].pista}`);
  const otro = detectarProveedor(clave);
  if (otro && otro !== proveedor) {
    throw new ErrorIA(400, `Esa clave parece de ${PROVEEDORES[otro].nombre}, no de ${PROVEEDORES[proveedor].nombre}. Cambia el proveedor en la lista.`);
  }
  const prueba = await verificarClave(proveedor, clave);
  if (prueba.valida === false) throw new ErrorIA(400, prueba.motivo);

  escribirEnv({ AI_PROVIDER: proveedor, AI_API_KEY: clave, AI_MODEL: null, OPENROUTER_API_KEY: null, OPENROUTER_MODEL: null });
  config = { proveedor, clave, modeloEnv: "" };
  estadoClave = { ...prueba, revisado: Date.now() };
  console.log(`  IA: ahora se usa ${PROVEEDORES[proveedor].nombre}.`);
  return { ok: true, ...prueba };
}

/* =========================================================
   Servidor HTTP
   ========================================================= */
const VENTANA_MS = 5 * 60 * 1000;
const MAX_PETICIONES = Number(process.env.AI_MAX_REQUESTS_PER_5MIN) || 60;
const contadorIP = new Map();
function excedeLimite(ip) {
  const ahora = Date.now();
  const reg = contadorIP.get(ip) || { inicio: ahora, total: 0 };
  if (ahora - reg.inicio > VENTANA_MS) { reg.inicio = ahora; reg.total = 0; }
  reg.total++;
  contadorIP.set(ip, reg);
  return reg.total > MAX_PETICIONES;
}

const TIPOS = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".ico": "image/x-icon", ".webp": "image/webp", ".woff2": "font/woff2"
};

function enviarJSON(res, status, objeto) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(objeto));
}

function leerCuerpo(req, limite = 100 * 1024) {
  return new Promise((resolve, reject) => {
    let tam = 0; const partes = [];
    req.on("data", c => {
      tam += c.length;
      if (tam > limite) { reject(new ErrorIA(413, "La solicitud es demasiado grande.")); req.destroy(); return; }
      partes.push(c);
    });
    req.on("end", () => {
      try { resolve(JSON.parse(Buffer.concat(partes).toString("utf8") || "{}")); }
      catch { reject(new ErrorIA(400, "JSON inválido.")); }
    });
    req.on("error", reject);
  });
}

function servirEstatico(req, res) {
  const ruta = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let archivo = path.normalize(path.join(PUBLIC_DIR, ruta === "/" ? "index.html" : ruta));
  if (!archivo.startsWith(PUBLIC_DIR)) { res.writeHead(403); return res.end(); }
  fs.stat(archivo, (err, info) => {
    if (err || !info.isFile()) archivo = path.join(PUBLIC_DIR, "index.html");
    fs.readFile(archivo, (err2, contenido) => {
      if (err2) { res.writeHead(404); return res.end("No encontrado"); }
      res.writeHead(200, {
        "Content-Type": TIPOS[path.extname(archivo).toLowerCase()] || "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-cache"
      });
      res.end(contenido);
    });
  });
}

const servidor = http.createServer(async (req, res) => {
  const { pathname, searchParams } = new URL(req.url, "http://x");
  if (!pathname.startsWith("/api/")) return servirEstatico(req, res);

  try {
    if (pathname === "/api/estado" && req.method === "GET") {
      const est = await obtenerEstadoClave(searchParams.has("revisar"));
      return enviarJSON(res, 200, {
        configurada: Boolean(config.clave), valida: est.valida, motivo: est.motivo, uso: est.uso,
        proveedor: config.proveedor, nombreProveedor: PROVEEDORES[config.proveedor].nombre,
        modelo: modelosActivos()[0], secuencial: Boolean(PROVEEDORES[config.proveedor].secuencial),
        puedeConfigurar: esLocal(req)
      });
    }
    if (req.method !== "POST") return enviarJSON(res, 405, { error: "Método no permitido." });
    if (pathname === "/api/configurar") return enviarJSON(res, 200, await rutaConfigurar(req));

    const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket.remoteAddress;
    if (excedeLimite(ip)) throw new ErrorIA(429, "Demasiadas solicitudes seguidas. Espera unos minutos.");

    const datos = await leerCuerpo(req);
    if (pathname === "/api/actividades") return enviarJSON(res, 200, await rutaActividades(datos));
    if (pathname === "/api/tutor") return enviarJSON(res, 200, await rutaTutor(datos));
    return enviarJSON(res, 404, { error: "Ruta no encontrada." });
  } catch (err) {
    const status = err instanceof ErrorIA ? err.status : 500;
    if (status >= 500 || status === 401) console.error(`[IA] ${status} ${err.message}`, err.detalle || "");
    return enviarJSON(res, status, { error: err.message || "Error interno.", detalle: err.detalle });
  }
});

servidor.on("error", err => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n  El puerto ${PORT} ya está en uso. Probablemente AdaptiClass ya está abierto en otra ventana.`);
    console.error(`  Abre http://localhost:${PORT} o cierra la otra ventana y vuelve a intentarlo.\n`);
  } else console.error(err);
  process.exit(1);
});

servidor.listen(PORT, async () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n  AdaptiClass está listo en ${url}`);
  console.log("  (Deja esta ventana abierta mientras usas la plataforma.)\n");
  if (process.argv.includes("--abrir")) abrirNavegador(url);

  const nombre = PROVEEDORES[config.proveedor].nombre;
  if (!config.clave) {
    console.log("  IA: sin clave. En el navegador pulsa «Configurar IA», elige el proveedor y pega tu clave.\n");
    return;
  }
  const est = await obtenerEstadoClave(true);
  if (est.valida === true) console.log(`  IA: conectada con ${nombre} (modelo ${modelosActivos()[0]})\n`);
  else if (est.valida === false) console.log(`  IA: ${est.motivo}\n  Pulsa «Configurar IA» en la plataforma para pegar una clave nueva.\n`);
  else console.log(`  IA: ${est.motivo}\n  Revisa la conexión a internet de esta computadora.\n`);
});

function abrirNavegador(url) {
  const { exec } = require("child_process");
  const cmd = process.platform === "win32" ? `start "" "${url}"` : process.platform === "darwin" ? `open "${url}"` : `xdg-open "${url}"`;
  exec(cmd, () => {});
}
