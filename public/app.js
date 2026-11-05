/**
 * AdaptiClass · Aplicación web
 * ------------------------------------------------------------
 * La IA se consulta a través del servidor (/api/...). La clave de
 * proveedor de IA vive solo en el servidor (archivo .env), nunca aquí.
 *
 * Los datos se guardan en localStorage con las mismas claves de la
 * versión anterior, así que grupos, usuarios y entregas existentes
 * se conservan.
 */
"use strict";

/* =========================================================
   1. Persistencia
   ========================================================= */
const CLAVES = {
  usuarios: "usuarios_registrados_db",
  plataforma: "bd_plataforma_evidencias",
  evidencias: "evidencias_alumnos_db",
  notificaciones: "notificaciones_plataforma_db",
  respuestas: "respuestas_comprobacion_db",
  sesion: "sesion_usuario_activo"
};

const NIVELES = {
  basico: { nombre: "Básico", descripcion: "Verás cada punto con apoyo paso a paso y ejemplos guiados." },
  intermedio: { nombre: "Intermedio", descripcion: "Verás pistas cuando las necesites y retos opcionales." },
  avanzado: { nombre: "Avanzado", descripcion: "Verás retos de mayor complejidad para profundizar." }
};
const ORDEN_NIVEL = ["basico", "intermedio", "avanzado"];
const MIN_SENALES = 3; // evidencias mínimas antes de ajustar el nivel automáticamente

const MAX_ARCHIVO_MB = 2;
const ESTILOS = {
  practico: { nombre: "Práctico", descripcion: "Aprendes haciendo: ejercicios guiados, código y retos concretos." },
  visual: { nombre: "Visual", descripcion: "Aprendes con esquemas: diagramas, tablas comparativas y flujos." },
  analitico: { nombre: "Analítico", descripcion: "Aprendes desde la teoría: definiciones formales y razonamiento riguroso." }
};

function leer(clave, porDefecto) {
  try {
    const crudo = localStorage.getItem(clave);
    return crudo ? JSON.parse(crudo) : porDefecto;
  } catch {
    return porDefecto;
  }
}

function guardar(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
    return true;
  } catch (err) {
    const lleno = err && (err.name === "QuotaExceededError" || err.code === 22);
    toast(lleno
      ? "El almacenamiento del navegador está lleno. Elimina materiales o entregas antiguas e intenta de nuevo."
      : "No se pudieron guardar los cambios en este navegador.", "error");
    return false;
  }
}

const guardarUsuarios = () => guardar(CLAVES.usuarios, usuarios);
const guardarPlataforma = () => guardar(CLAVES.plataforma, plataforma);
const guardarEvidencias = () => guardar(CLAVES.evidencias, evidencias);
const guardarNotificaciones = () => guardar(CLAVES.notificaciones, notificaciones);
const guardarRespuestas = () => guardar(CLAVES.respuestas, respuestas);
const guardarSesion = () => sesion ? guardar(CLAVES.sesion, sesion) : localStorage.removeItem(CLAVES.sesion);

/* Apoyo, reto y pregunta de comprobación del grupo demo (en grupos nuevos los genera la IA) */
const q = (enunciado, opciones, correcta, explicacion) => ({ enunciado, opciones, correcta, explicacion });
const EXTRAS_DEMO = {
  "Modelado entidad-relación": {
    apoyo: "1. Piensa en una tabla como una hoja de cálculo: cada fila es un libro.\n2. Elige qué datos describe cada libro (columnas).\n3. Decide cuál columna identifica a cada libro sin repetirse: esa es la llave primaria.\n4. Escribe `CREATE TABLE` con esas columnas y su tipo de dato.",
    reto: "Agrega una tabla `autores` y relaciónala con `libros` mediante una llave foránea con `ON DELETE RESTRICT`. Explica qué pasa si intentas borrar un autor con libros.",
    pregunta: q("¿Para qué sirve la llave primaria de una tabla?", ["Para identificar cada fila de forma única", "Para ordenar la tabla alfabéticamente", "Para cifrar los datos sensibles", "Para conectar con el servidor"], 0, "La llave primaria identifica cada registro sin repetirse; por eso no admite valores duplicados ni nulos.")
  },
  "Consultas con JOIN": {
    apoyo: "1. Identifica las dos tablas y el campo que comparten (por ejemplo `categoria_id`).\n2. Escribe `SELECT` con las columnas que quieres ver de ambas.\n3. Agrega `FROM tabla1 INNER JOIN tabla2`.\n4. Completa con `ON tabla1.campo = tabla2.campo`.",
    reto: "Reescribe tu consulta con `LEFT JOIN` y explica qué filas nuevas aparecen. Luego agrega `GROUP BY` para contar productos por categoría.",
    pregunta: q("¿Qué filas devuelve un INNER JOIN?", ["Todas las filas de la tabla izquierda", "Solo las filas con coincidencia en ambas tablas", "Todas las filas de ambas tablas", "Solo las filas sin coincidencia"], 1, "INNER JOIN conserva únicamente las combinaciones donde la condición ON se cumple en las dos tablas.")
  },
  "Procedimientos almacenados": {
    apoyo: "1. Cambia el delimitador con `DELIMITER //` para que el `;` interno no corte el bloque.\n2. Escribe `CREATE PROCEDURE nombre()`.\n3. Pon la consulta entre `BEGIN` y `END //`.\n4. Prueba con `CALL nombre();`.",
    reto: "Crea un procedimiento con un parámetro `IN p_categoria INT` y otro `OUT p_total INT` que devuelva el total de libros de esa categoría.",
    pregunta: q("¿Cómo se ejecuta un procedimiento almacenado en MySQL?", ["RUN nombre;", "EXEC nombre();", "CALL nombre();", "SELECT nombre;"], 2, "En MySQL los procedimientos se invocan con CALL seguido del nombre y sus parámetros.")
  },
  "Índices y optimización": {
    apoyo: "1. Busca una consulta que filtre con `WHERE` por una columna.\n2. Ejecuta `EXPLAIN` antes de crear el índice y anota el tipo de búsqueda.\n3. Crea el índice con `CREATE INDEX`.\n4. Repite `EXPLAIN` y compara.",
    reto: "Diseña un índice compuesto para una consulta que filtra por dos columnas y justifica el orden de las columnas en el índice.",
    pregunta: q("¿Cuál es una desventaja de crear demasiados índices?", ["Las consultas SELECT se vuelven más lentas", "Las inserciones y actualizaciones se vuelven más lentas", "Se pierden datos al reiniciar", "No se pueden usar JOIN"], 1, "Cada índice debe actualizarse en cada INSERT, UPDATE o DELETE, lo que agrega costo a las escrituras.")
  },
  "Transacciones ACID": {
    apoyo: "1. Abre la transacción con `START TRANSACTION`.\n2. Resta el monto de la cuenta origen.\n3. Suma el monto a la cuenta destino.\n4. Si todo salió bien, `COMMIT`; si algo falló, `ROLLBACK`.",
    reto: "Simula dos transferencias simultáneas sobre la misma cuenta y explica qué nivel de aislamiento evita leer saldos inconsistentes.",
    pregunta: q("¿Qué hace ROLLBACK dentro de una transacción?", ["Guarda los cambios de forma permanente", "Deshace todos los cambios de la transacción", "Bloquea la tabla para siempre", "Repite la última consulta"], 1, "ROLLBACK revierte la transacción completa, garantizando la atomicidad: todo o nada.")
  },
  "Normalización": {
    apoyo: "1. Busca datos que se repiten en muchas filas (por ejemplo, el nombre del cliente en cada pedido).\n2. Mueve esos datos a una tabla propia.\n3. Deja en la tabla original solo el identificador (`cliente_id`).\n4. Verifica que cada columna dependa solo de la llave de su tabla.",
    reto: "Identifica una dependencia transitiva en tu diseño y explica por qué viola la 3FN y cómo la corregiste.",
    pregunta: q("¿Cuál es el objetivo principal de normalizar una base de datos?", ["Aumentar el tamaño de las tablas", "Eliminar redundancia y anomalías de actualización", "Evitar el uso de llaves", "Acelerar todas las consultas"], 1, "Normalizar reduce datos duplicados y evita inconsistencias al insertar, actualizar o borrar.")
  }
};

function datosDemo() {
  const act = (titulo, explicacion, ejemplo, tarea) => ({ titulo, explicacion, ejemplo, tarea, ...(EXTRAS_DEMO[titulo] || {}) });
  return {
    clases: [{
      codigo: "CLASE-DEMO",
      nombre: "Bases de Datos Relacionales",
      creador: "admin",
      materiales: [],
      modulos: [{
        id: 1,
        titulo: "Arquitectura de datos y consultas relacionales",
        fechaLimite: "2026-12-31T23:59",
        contenido: {
          practico: [
            act("Modelado entidad-relación", "Las bases de datos relacionales organizan la información en tablas de filas (tuplas) y columnas (atributos). La integridad referencial se garantiza con llaves primarias y foráneas.", "```sql\nCREATE TABLE usuarios (\n  id INT AUTO_INCREMENT PRIMARY KEY,\n  nombre VARCHAR(50) NOT NULL\n);\n```", "Escribe un script SQL que cree la tabla `libros` con identificador único, título y stock."),
            act("Consultas con JOIN", "Los operadores JOIN combinan registros de dos o más tablas relacionadas mediante un campo común.", "```sql\nSELECT b.titulo, a.nombre\nFROM libros b\nINNER JOIN autores a ON b.autor_id = a.id;\n```", "Escribe una consulta con INNER JOIN que relacione inventarios y categorías."),
            act("Procedimientos almacenados", "Un procedimiento almacenado es un bloque SQL guardado en el servidor que encapsula lógica de negocio reutilizable.", "```sql\nDELIMITER //\nCREATE PROCEDURE sp_contar_libros()\nBEGIN\n  SELECT COUNT(*) FROM libros;\nEND //\n```", "Crea un procedimiento que devuelva el total de registros activos."),
            act("Índices y optimización", "Los índices (normalmente árboles B-Tree) aceleran las búsquedas porque evitan recorrer toda la tabla.", "```sql\nCREATE INDEX idx_usuario_correo ON usuarios(correo);\n```", "Crea un índice sobre una columna de consulta frecuente y compara el plan con `EXPLAIN`."),
            act("Transacciones ACID", "Una transacción garantiza atomicidad, consistencia, aislamiento y durabilidad: todo el bloque se ejecuta o se revierte con ROLLBACK.", "```sql\nSTART TRANSACTION;\nUPDATE cuentas SET saldo = saldo - 100 WHERE id = 1;\nUPDATE cuentas SET saldo = saldo + 100 WHERE id = 2;\nCOMMIT;\n```", "Implementa una transferencia entre cuentas con manejo de errores y ROLLBACK."),
            act("Normalización", "La normalización elimina redundancia dividiendo tablas según las formas normales (1FN, 2FN, 3FN).", "Separar los datos de contacto del cliente en una tabla propia, ligada por `cliente_id`.", "Normaliza hasta 3FN una tabla de pedidos que repite datos del cliente."),
            act("Conexión desde el backend", "La aplicación se conecta al gestor (MySQL/MariaDB) mediante controladores como JDBC o PDO.", "```java\nConnection cn = DriverManager.getConnection(\n  \"jdbc:mysql://localhost/biblioteca\", \"root\", \"\");\n```", "Programa una conexión funcional y una consulta de prueba."),
            act("Control de excepciones SQL", "El manejo de errores intercepta fallos de sintaxis, llaves duplicadas o pérdida de conexión.", "```sql\nDECLARE CONTINUE HANDLER FOR SQLEXCEPTION\n  SELECT 'Error en la transacción';\n```", "Agrega manejo de excepciones a tu script de transferencia."),
            act("Vistas", "Una vista es una consulta SELECT almacenada que actúa como tabla virtual y limita el acceso a columnas sensibles.", "```sql\nCREATE VIEW vista_stock AS\nSELECT titulo, stock FROM libros WHERE stock > 0;\n```", "Crea una vista para un reporte de inventario disponible."),
            act("Seguridad y privilegios", "GRANT y REVOKE definen qué usuarios y roles pueden leer o modificar cada tabla.", "```sql\nGRANT SELECT, INSERT ON biblioteca.* TO 'operador'@'localhost';\n```", "Configura un usuario con permisos solo de lectura.")
          ],
          visual: [
            act("Diagrama entidad-relación", "Las entidades se dibujan como rectángulos, los atributos como óvalos y las relaciones como rombos con su cardinalidad (1:N, N:M).", "Cliente —(1:N)— Factura —(N:M)— Producto.", "Dibuja el diagrama ER de un sistema de biblioteca."),
            act("Arquitectura cliente-servidor", "Tres capas: la interfaz envía peticiones al servidor de aplicaciones, que consulta al motor de base de datos.", "Navegador → API (Node/PHP) → MySQL.", "Diagrama el recorrido de una petición de búsqueda de libros.")
          ],
          analitico: [
            act("Complejidad de consultas", "Una búsqueda sin índice es O(n); con un índice B-Tree es O(log n).", "Comparar un *full table scan* contra una búsqueda indexada en 1 000 000 de filas.", "Calcula el costo aproximado de una consulta multitabla con y sin índices."),
            act("Álgebra relacional", "Estudio formal de los operadores sobre relaciones: selección (σ), proyección (π), producto cartesiano y join natural.", "σ edad>18 (usuarios)", "Resuelve tres expresiones de álgebra relacional y tradúcelas a SQL.")
          ]
        }
      }]
    }]
  };
}

let usuarios, plataforma, evidencias, notificaciones, respuestas, sesion;

function cargarDatos() {
  usuarios = leer(CLAVES.usuarios, null);
  if (!Array.isArray(usuarios) || !usuarios.length) {
    usuarios = [{ correo: "profe@admin.com", nombre: "Profesor Evaluador", usuario: "admin", password: "123", rol: "docente" }];
  }
  plataforma = leer(CLAVES.plataforma, null) || datosDemo();
  if (!Array.isArray(plataforma.clases)) plataforma.clases = [];
  plataforma.clases.forEach(c => {
    c.materiales = Array.isArray(c.materiales) ? c.materiales : [];
    c.modulos = Array.isArray(c.modulos) ? c.modulos : [];
    c.creador = c.creador || "admin";
  });
  evidencias = leer(CLAVES.evidencias, []);
  if (!Array.isArray(evidencias)) evidencias = Object.values(evidencias || {});
  evidencias = evidencias.filter(Boolean);
  notificaciones = leer(CLAVES.notificaciones, []);
  if (!Array.isArray(notificaciones)) notificaciones = [];
  respuestas = leer(CLAVES.respuestas, []);
  if (!Array.isArray(respuestas)) respuestas = [];
  sesion = leer(CLAVES.sesion, null);
}

/* =========================================================
   2. Utilidades
   ========================================================= */
const $ = (sel, raiz = document) => raiz.querySelector(sel);
const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];

function esc(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
const icono = (nombre, clase = "i") => `<svg class="${clase}" aria-hidden="true"><use href="#i-${nombre}"/></svg>`;

function aleatorio(longitud, alfabeto) {
  const bytes = new Uint32Array(longitud);
  crypto.getRandomValues(bytes);
  return [...bytes].map(b => alfabeto[b % alfabeto.length]).join("");
}
const uid = prefijo => `${prefijo}_${Date.now().toString(36)}${aleatorio(4, "abcdefghijklmnopqrstuvwxyz0123456789")}`;

function iniciales(nombre) {
  return String(nombre || "?").replace(/^(prof\.?|dr\.?|ing\.?|lic\.?)\s+/i, "").split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]).join("").toUpperCase() || "?";
}

function fmtFecha(valor, opciones = { dateStyle: "medium", timeStyle: "short" }) {
  if (!valor) return "";
  const d = new Date(valor);
  return isNaN(d) ? String(valor) : d.toLocaleString("es", opciones);
}

function tiempoRestante(fechaLimite) {
  if (!fechaLimite) return { texto: "Sin fecha límite", clase: "neutra", vencida: false };
  const diff = new Date(fechaLimite) - new Date();
  if (isNaN(diff)) return { texto: "Sin fecha límite", clase: "neutra", vencida: false };
  if (diff < 0) return { texto: `Venció el ${fmtFecha(fechaLimite, { dateStyle: "medium" })}`, clase: "peligro", vencida: true };
  const dias = Math.floor(diff / 86400000);
  const horas = Math.floor(diff / 3600000);
  if (horas < 24) return { texto: `Vence en ${Math.max(horas, 1)} h`, clase: "alerta", vencida: false };
  if (dias <= 3) return { texto: `Vence en ${dias} día${dias === 1 ? "" : "s"}`, clase: "alerta", vencida: false };
  return { texto: `Entrega: ${fmtFecha(fechaLimite, { dateStyle: "medium" })}`, clase: "neutra", vencida: false };
}

function urlSegura(texto) {
  try {
    const u = new URL(String(texto).trim());
    return (u.protocol === "https:" || u.protocol === "http:") ? u.href : null;
  } catch { return null; }
}

function idYoutube(url) {
  const m = String(url).match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/)([\w-]{11})/);
  return m ? m[1] : null;
}

const cacheBlobs = new Map();
function blobDesdeDataURL(dataUrl) {
  if (cacheBlobs.has(dataUrl)) return cacheBlobs.get(dataUrl);
  try {
    const [meta, base64] = dataUrl.split(",");
    const tipo = (meta.match(/data:([^;]+)/) || [])[1] || "application/octet-stream";
    const binario = atob(base64);
    const bytes = new Uint8Array(binario.length);
    for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
    const url = URL.createObjectURL(new Blob([bytes], { type: tipo }));
    cacheBlobs.set(dataUrl, url);
    return url;
  } catch { return dataUrl; }
}

function copiar(texto, mensaje = "Copiado al portapapeles.") {
  (navigator.clipboard?.writeText(texto) || Promise.reject())
    .then(() => toast(mensaje, "exito"))
    .catch(() => toast(`Copia manualmente: ${texto}`, "aviso"));
}

/** Markdown mínimo y seguro (escapa todo el HTML antes de dar formato). */
function md(texto) {
  const bloques = [];
  let t = String(texto ?? "").replace(/\r/g, "").replace(/<think>[\s\S]*?<\/think>/gi, "");
  t = t.replace(/```[\w+-]*[^\S\n]*\n?([\s\S]*?)```/g, (_, codigo) => {
    bloques.push(`<pre><code>${esc(codigo.replace(/\n$/, ""))}</code></pre>`);
    return `\n\u0000${bloques.length - 1}\u0000\n`;
  });
  const enLinea = s => esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[\s(])\*(?!\s)([^*]+?)\*(?=[\s).,;:!?]|$)/g, "$1<em>$2</em>");

  const salida = [];
  let lista = null, parrafo = [];
  const cerrarParrafo = () => { if (parrafo.length) { salida.push(`<p>${parrafo.join("<br>")}</p>`); parrafo = []; } };
  const cerrarLista = () => { if (lista) { salida.push(`<${lista.tipo}>${lista.items.map(i => `<li>${i}</li>`).join("")}</${lista.tipo}>`); lista = null; } };

  for (const linea of t.split("\n")) {
    const l = linea.trim();
    const bloque = l.match(/^\u0000(\d+)\u0000$/);
    const vineta = l.match(/^[-*•]\s+(.*)$/);
    const numero = l.match(/^\d+[.)]\s+(.*)$/);
    const titulo = l.match(/^#{1,6}\s+(.*)$/);
    if (bloque) { cerrarParrafo(); cerrarLista(); salida.push(bloques[+bloque[1]]); }
    else if (!l) { cerrarParrafo(); cerrarLista(); }
    else if (titulo) { cerrarParrafo(); cerrarLista(); salida.push(`<h5>${enLinea(titulo[1])}</h5>`); }
    else if (vineta || numero) {
      cerrarParrafo();
      const tipo = vineta ? "ul" : "ol";
      if (!lista || lista.tipo !== tipo) { cerrarLista(); lista = { tipo, items: [] }; }
      lista.items.push(enLinea((vineta || numero)[1]));
    } else { cerrarLista(); parrafo.push(enLinea(l)); }
  }
  cerrarParrafo(); cerrarLista();
  return salida.join("");
}

/* =========================================================
   3. Modelo de dominio
   ========================================================= */
/** Acepta el formato nuevo (objeto) y el anterior ("título | explicación | ejemplo | tarea"). */
function preguntaValida(p) {
  return p && p.enunciado && Array.isArray(p.opciones) && p.opciones.length >= 2 &&
    Number.isInteger(p.correcta) && p.correcta >= 0 && p.correcta < p.opciones.length ? p : null;
}

function parsearActividad(item, indice = 0) {
  if (item && typeof item === "object") {
    return {
      titulo: item.titulo || `Actividad ${indice + 1}`,
      explicacion: item.explicacion || "",
      ejemplo: item.ejemplo || "",
      tarea: item.tarea || "",
      apoyo: item.apoyo || "",
      reto: item.reto || "",
      pregunta: preguntaValida(item.pregunta)
    };
  }
  const partes = String(item || "").split("|").map(p => p.trim());
  const titulo = (partes[0] || `Actividad ${indice + 1}`).replace(/^\d+[.\-)]\s*/, "");
  const vacio = { apoyo: "", reto: "", pregunta: null };
  if (partes.length > 4) {
    return { titulo, explicacion: partes[1], ejemplo: partes.slice(2, -1).join(" | "), tarea: partes[partes.length - 1], ...vacio };
  }
  return { titulo, explicacion: partes[1] || "", ejemplo: partes[2] || "", tarea: partes[3] || "", ...vacio };
}

function plantillaActividades(tema, cantidad = 10) {
  return Array.from({ length: cantidad }, (_, i) => ({
    titulo: `${tema}: punto ${i + 1}`,
    explicacion: "Completa la explicación teórica de este punto.",
    ejemplo: "Agrega un ejemplo práctico.",
    tarea: "Describe la evidencia que el alumno debe entregar.",
    apoyo: "",
    reto: "",
    pregunta: null
  }));
}

const usuarioActual = () => usuarios.find(u => u.usuario === sesion?.usuario);
const clasePorCodigo = codigo => plataforma.clases.find(c => c.codigo === codigo);
const esMia = clase => clase && (clase.creador || "admin") === sesion?.usuario;
const clasesDocente = () => plataforma.clases.filter(esMia);
const alumnosDeClase = codigo => usuarios.filter(u => u.rol === "alumno" && (u.gruposInscritos || []).includes(codigo));
const puntosModulo = (modulo, estilo) => {
  const lista = modulo.contenido?.[estilo];
  return (Array.isArray(lista) && lista.length ? lista : modulo.contenido?.practico || []);
};

function estadoDe(ev) {
  const e = String(ev?.estado || "").toLowerCase();
  if (e.includes("aprob")) return "aprobado";
  if (e.includes("rechaz")) return "rechazado";
  return "pendiente";
}
const ETIQUETA_ESTADO = {
  aprobado: { texto: "Aprobada", clase: "exito", icono: "check" },
  rechazado: { texto: "Requiere corrección", clase: "peligro", icono: "alert" },
  pendiente: { texto: "En revisión", clase: "alerta", icono: "clock" }
};
const insigniaEstado = ev => {
  const e = ETIQUETA_ESTADO[estadoDe(ev)];
  return `<span class="insignia insignia--${e.clase}">${icono(e.icono)}${e.texto}</span>`;
};

function entregasDe(usuario, codigo, modId, punto) {
  return evidencias.filter(ev => ev.usuario === usuario && ev.clase === codigo && ev.modulo === modId && ev.punto === punto);
}

function progresoAlumno(usuario, clase, estilo) {
  let total = 0, entregados = 0, aprobados = 0;
  for (const mod of clase.modulos) {
    puntosModulo(mod, estilo).forEach((_, i) => {
      total++;
      const lista = entregasDe(usuario, clase.codigo, mod.id, i + 1);
      if (lista.length) {
        entregados++;
        if (estadoDe(lista[lista.length - 1]) === "aprobado") aprobados++;
      }
    });
  }
  return { total, entregados, aprobados, porcentaje: total ? Math.round(entregados / total * 100) : 0 };
}

/* ---------- Motor adaptativo: dominio y nivel ---------- */
function estadoPregunta(usuario, codigo, modId, punto) {
  const lista = respuestas.filter(r => r.usuario === usuario && r.clase === codigo && r.modulo === modId && r.punto === punto);
  if (!lista.length) return null;
  const acierto = lista.findIndex(r => r.correcta);
  return { intentos: lista.length, resuelta: acierto !== -1, primerIntento: acierto === 0, ultima: lista[lista.length - 1] };
}

/**
 * Dominio = promedio de señales de desempeño en el grupo:
 *  - pregunta de comprobación: 1 si acierta al primer intento, 0.5 si acierta después, 0 si aún no acierta
 *  - entrega revisada: 1 si fue aprobada, 0.25 si pidió corrección
 */
function dominioAlumno(usuario, clase, estilo) {
  const senales = [];
  let preguntas = 0, aciertosPrimera = 0;
  for (const mod of clase.modulos) {
    puntosModulo(mod, estilo).forEach((_, i) => {
      const ep = estadoPregunta(usuario, clase.codigo, mod.id, i + 1);
      if (ep) {
        preguntas++;
        if (ep.primerIntento) aciertosPrimera++;
        senales.push(ep.primerIntento ? 1 : ep.resuelta ? 0.5 : 0);
      }
      const lista = entregasDe(usuario, clase.codigo, mod.id, i + 1);
      const ultima = lista[lista.length - 1];
      if (ultima) {
        const e = estadoDe(ultima);
        if (e === "aprobado") senales.push(1);
        else if (e === "rechazado") senales.push(0.25);
      }
    });
  }
  return {
    dominio: senales.length ? senales.reduce((a, b) => a + b, 0) / senales.length : null,
    senales: senales.length,
    preguntas,
    precision: preguntas ? aciertosPrimera / preguntas : null
  };
}

function nivelAlumno(usuario, codigo) {
  const cuenta = usuarios.find(u => u.usuario === usuario);
  const clase = clasePorCodigo(codigo);
  const base = NIVELES[cuenta?.nivelBase] ? cuenta.nivelBase : "intermedio";
  const manual = NIVELES[cuenta?.nivelManual?.[codigo]] ? cuenta.nivelManual[codigo] : null;
  const d = clase ? dominioAlumno(usuario, clase, cuenta?.estiloEstudiante || "practico") : { dominio: null, senales: 0, preguntas: 0, precision: null };
  let automatico = base;
  let origen = "diagnóstico inicial";
  if (d.senales >= MIN_SENALES && d.dominio != null) {
    automatico = d.dominio >= 0.8 ? "avanzado" : d.dominio >= 0.5 ? "intermedio" : "basico";
    origen = "tu desempeño";
  }
  return { ...d, nivel: manual || automatico, automatico, manual, origen: manual ? "tu docente" : origen };
}

const necesitaApoyo = n => n.senales >= MIN_SENALES && n.dominio != null && n.dominio < 0.5;

/** Avisa al alumno (y al docente) cuando el nivel cambia. */
function revisarCambioNivel(usuario, codigo) {
  const cuenta = usuarios.find(u => u.usuario === usuario);
  const clase = clasePorCodigo(codigo);
  if (!cuenta || !clase) return;
  const n = nivelAlumno(usuario, codigo);
  cuenta.nivelesVistos = cuenta.nivelesVistos || {};
  cuenta.apoyoAvisado = cuenta.apoyoAvisado || {};
  const anterior = cuenta.nivelesVistos[codigo] || (NIVELES[cuenta.nivelBase] ? cuenta.nivelBase : "intermedio");
  cuenta.nivelesVistos[codigo] = n.nivel;

  // Aviso al docente la primera vez que el alumno entra en zona de apoyo
  const apoyo = necesitaApoyo(n);
  if (apoyo && !cuenta.apoyoAvisado[codigo]) {
    notificar(clase.creador, `${cuenta.nombre} necesita apoyo en ${clase.nombre}: su dominio es de ${Math.round(n.dominio * 100)} %. Ya ve el contenido con apoyo paso a paso.`);
  }
  cuenta.apoyoAvisado[codigo] = apoyo;
  guardarUsuarios();
  if (anterior === n.nivel) return;

  const sube = ORDEN_NIVEL.indexOf(n.nivel) > ORDEN_NIVEL.indexOf(anterior);
  notificar(usuario, sube
    ? `¡Subiste a nivel ${NIVELES[n.nivel].nombre.toLowerCase()} en ${clase.nombre}! ${NIVELES[n.nivel].descripcion}`
    : `Ajustamos tu nivel en ${clase.nombre} a ${NIVELES[n.nivel].nombre.toLowerCase()}. ${NIVELES[n.nivel].descripcion}`);
  if (usuario === sesion?.usuario) toast(sube ? `Subiste a nivel ${NIVELES[n.nivel].nombre.toLowerCase()}.` : `Tu nivel cambió a ${NIVELES[n.nivel].nombre.toLowerCase()}: verás más apoyo paso a paso.`, sube ? "exito" : "aviso");
}

/** Primer punto pendiente del módulo: pregunta sin resolver, sin entrega o con corrección pedida. */
function siguientePaso(usuario, clase, modulo, estilo) {
  const puntos = puntosModulo(modulo, estilo);
  for (let i = 0; i < puntos.length; i++) {
    const act = parsearActividad(puntos[i], i);
    const ep = estadoPregunta(usuario, clase.codigo, modulo.id, i + 1);
    const lista = entregasDe(usuario, clase.codigo, modulo.id, i + 1);
    const ultima = lista[lista.length - 1];
    if (act.pregunta && !ep?.resuelta) return { indice: i, motivo: "Responde la pregunta de comprobación", act };
    if (!ultima) return { indice: i, motivo: "Sube tu evidencia", act };
    if (estadoDe(ultima) === "rechazado") return { indice: i, motivo: "Corrige tu entrega", act };
  }
  return null;
}

function tituloPunto(clase, modId, punto, estilo) {
  const mod = clase?.modulos.find(m => m.id === modId);
  if (!mod) return `Actividad ${modId} · punto ${punto}`;
  const item = puntosModulo(mod, estilo)[punto - 1];
  return item ? parsearActividad(item, punto - 1).titulo : `Punto ${punto}`;
}

/* =========================================================
   4. Interfaz: toasts y modales
   ========================================================= */
function toast(mensaje, tipo = "exito", duracion = 4200) {
  const contenedor = $("#toasts");
  if (!contenedor) return;
  const nombreIcono = { exito: "check", error: "alert", aviso: "alert" }[tipo] || "check";
  const el = document.createElement("div");
  el.className = `toast toast--${tipo}`;
  el.setAttribute("role", tipo === "error" ? "alert" : "status");
  el.innerHTML = `${icono(nombreIcono)}<span>${esc(mensaje)}</span>`;
  contenedor.appendChild(el);
  setTimeout(() => el.remove(), tipo === "error" ? Math.max(duracion, 7000) : duracion);
}

let modalAlCerrar = null;
let modalBloqueado = false;
let focoPrevio = null;

function abrirModal({ titulo, cuerpo, pie = "", ancho = false, bloqueado = false, alCerrar = null }) {
  const modal = $("#modal");
  focoPrevio = document.activeElement;
  $("#modal-titulo").textContent = titulo;
  $("#modal-cuerpo").innerHTML = cuerpo;
  $("#modal-pie").innerHTML = pie;
  modal.classList.toggle("modal--ancho", ancho);
  modal.classList.toggle("modal--sin-cerrar", bloqueado);
  modalBloqueado = bloqueado;
  modalAlCerrar = alCerrar;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  const enfocable = $("#modal-cuerpo input:not([type=hidden]), #modal-cuerpo textarea, #modal-cuerpo select, #modal-pie .boton--primario", modal);
  (enfocable || $(".modal__caja", modal)).focus?.({ preventScroll: true });
}

function cerrarModal(forzar = false) {
  if (modalBloqueado && !forzar) return;
  $("#modal").hidden = true;
  document.body.style.overflow = "";
  const cb = modalAlCerrar;
  modalAlCerrar = null;
  modalBloqueado = false;
  cb?.();
  focoPrevio?.focus?.({ preventScroll: true });
}

function confirmar({ titulo, mensaje, textoOk = "Confirmar", peligro = false }) {
  return new Promise(resolve => {
    let resuelto = false;
    abrirModal({
      titulo,
      cuerpo: `<p style="white-space:pre-line">${esc(mensaje)}</p>`,
      pie: `<button type="button" class="boton boton--secundario" data-modal-resp="no">Cancelar</button>
            <button type="button" class="boton ${peligro ? "boton--peligro-solido" : "boton--primario"}" data-modal-resp="si">${esc(textoOk)}</button>`,
      alCerrar: () => { if (!resuelto) resolve(false); }
    });
    $$("[data-modal-resp]").forEach(b => b.addEventListener("click", () => {
      resuelto = true;
      resolve(b.dataset.modalResp === "si");
      cerrarModal(true);
    }));
  });
}

/* =========================================================
   5. API de IA (a través del servidor)
   ========================================================= */
async function api(ruta, cuerpo) {
  if (location.protocol === "file:") {
    throw new Error("Abriste el archivo directamente. Inicia el servidor con «npm start» y entra a http://localhost:3000 para usar la IA.");
  }
  let respuesta;
  try {
    respuesta = await fetch(`/api/${ruta}`, {
      method: cuerpo ? "POST" : "GET",
      headers: cuerpo ? { "Content-Type": "application/json" } : undefined,
      body: cuerpo ? JSON.stringify(cuerpo) : undefined
    });
  } catch {
    throw new Error("No hay conexión con el servidor de AdaptiClass. Verifica que esté en ejecución.");
  }
  const datos = await respuesta.json().catch(() => null);
  if (!datos) throw new Error(`El servidor respondió sin datos válidos (HTTP ${respuesta.status}). ¿Está corriendo server.js?`);
  if (!respuesta.ok) throw new Error(datos.error || `Error ${respuesta.status}`);
  return datos;
}

let estadoIA = null;        // último estado recibido de /api/estado
let avisoIAMostrado = false;

const iaLista = () => Boolean(estadoIA?.configurada && estadoIA.valida !== false);

async function comprobarIA(forzar = false) {
  const pill = $("#estado-ia");
  const texto = $(".estado-ia__txt", pill);
  try {
    estadoIA = await api(forzar ? "estado?revisar=1" : "estado");
  } catch (err) {
    estadoIA = { error: err.message, configurada: false, valida: false };
  }
  pill.classList.remove("is-ok", "is-error");
  if (iaLista()) {
    pill.classList.add("is-ok");
    texto.textContent = "IA conectada";
    const r = estadoIA.uso?.restantes;
    pill.title = `${estadoIA.nombreProveedor} · modelo ${estadoIA.modelo}${r != null ? `. Consultas gratuitas restantes hoy: ${r}` : ""}`;
  } else {
    pill.classList.add("is-error");
    texto.textContent = estadoIA.error ? "Servidor apagado" : "Configurar IA";
    pill.title = estadoIA.error || estadoIA.motivo || "La IA necesita una clave";
  }

  // Al docente se le ofrece el asistente una vez por visita si la IA no está lista
  if (!iaLista() && !estadoIA.error && sesion?.rol === "docente" && estadoIA.puedeConfigurar && !avisoIAMostrado && $("#modal").hidden) {
    avisoIAMostrado = true;
    abrirConfigIA();
  }
  if (sesion?.rol === "docente" && estado.vistaDocente === "resumen" && (!iaLista() || $(".aviso-ia"))) vistaResumen();
  return estadoIA;
}

function htmlEstadoConfig() {
  if (!estadoIA) return "";
  if (estadoIA.error) return `<div class="estado-config is-error">${icono("alert")}<span>${esc(estadoIA.error)}</span></div>`;
  if (iaLista()) {
    const u = estadoIA.uso;
    const uso = u?.restantes != null ? ` Te quedan <strong>${esc(u.restantes)}</strong>${u.limite != null ? ` de ${esc(u.limite)}` : ""} consultas gratuitas hoy.` : "";
    return `<div class="estado-config is-ok">${icono("check")}<span>La IA está conectada con <strong>${esc(estadoIA.nombreProveedor || "")}</strong>${estadoIA.valida === null ? " (no se pudo verificar la clave ahora; se usará igualmente)" : ""}.${uso}</span></div>`;
  }
  return `<div class="estado-config is-aviso">${icono("alert")}<span>${esc(estadoIA.motivo || "Falta la clave de la IA.")}</span></div>`;
}

const PROVEEDORES_IA = {
  gemini: {
    nombre: "Google Gemini", etiqueta: "Google Gemini (recomendado)", enlace: "https://aistudio.google.com/apikey", prefijo: "AIza…",
    nota: "Gratis con tu cuenta de Google. Con el plan gratuito, Google puede usar lo que envías para mejorar sus productos: no escribas datos personales de alumnos en el tutor.",
    pasos: [
      `Entra a <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey</a> e inicia sesión con tu cuenta de Google.`,
      "Acepta los términos si te los pide y pulsa <strong>Create API key</strong> (Crear clave de API).",
      "Copia la clave que aparece (suele empezar con <code>AIza</code>).",
      "Pégala aquí abajo y pulsa <strong>Guardar y probar</strong>."
    ]
  },
  groq: {
    nombre: "Groq", etiqueta: "Groq (muy rápido)", enlace: "https://console.groq.com/keys", prefijo: "gsk_…",
    nota: "Gratis y no usa tus datos para entrenar. Su límite por minuto es bajo: las actividades se generan un estilo a la vez y tardan un poco más.",
    pasos: [
      `Entra a <a href="https://console.groq.com/keys" target="_blank" rel="noopener">console.groq.com/keys</a> y crea una cuenta (puedes usar Google).`,
      "Pulsa <strong>Create API Key</strong>, ponle de nombre <em>AdaptiClass</em> y confirma.",
      "Copia la clave (empieza con <code>gsk_</code>). Solo se muestra una vez.",
      "Pégala aquí abajo y pulsa <strong>Guardar y probar</strong>."
    ]
  },
  openrouter: {
    nombre: "OpenRouter", etiqueta: "OpenRouter", enlace: "https://openrouter.ai/settings/keys", prefijo: "sk-or-v1-…",
    nota: "Usa modelos gratuitos al azar. Unas 50 consultas al día sin saldo en la cuenta.",
    pasos: [
      `Entra a <a href="https://openrouter.ai/settings/keys" target="_blank" rel="noopener">openrouter.ai/settings/keys</a> e inicia sesión con Google.`,
      "Pulsa <strong>Create API Key</strong>, ponle un nombre y créala.",
      "Copia la clave (empieza con <code>sk-or-v1-</code>). Solo se muestra una vez.",
      "Pégala aquí abajo y pulsa <strong>Guardar y probar</strong>."
    ]
  }
};

function htmlPasosProveedor(id) {
  const p = PROVEEDORES_IA[id];
  return `<ol class="pasos">${p.pasos.map(x => `<li>${x}</li>`).join("")}</ol>
    <p class="ayuda">${esc(p.nota)}</p>`;
}

function abrirConfigIA() {
  const local = estadoIA?.puedeConfigurar !== false;
  const actual = PROVEEDORES_IA[estadoIA?.proveedor] ? estadoIA.proveedor : "gemini";
  abrirModal({
    titulo: iaLista() ? "Inteligencia artificial" : "Conectar la inteligencia artificial",
    cuerpo: `
      <div class="pila">
        <div id="estado-config">${htmlEstadoConfig()}</div>
        ${estadoIA?.error ? `
          <p>Para que la plataforma funcione con IA, el servidor debe estar encendido:</p>
          <ol class="pasos">
            <li>En Windows, haz doble clic en <strong>iniciar-windows.bat</strong> (en Mac, en <strong>iniciar-mac.command</strong>).</li>
            <li>Deja abierta la ventana negra que aparece.</li>
            <li>Usa la plataforma desde <strong>http://localhost:3000</strong>.</li>
          </ol>` : local ? `
          <form class="formulario" data-form="config-ia" autocomplete="off">
            <label class="campo"><span class="campo__etiqueta">Proveedor de IA</span>
              <select class="entrada" name="proveedor" data-proveedor-ia>
                ${Object.entries(PROVEEDORES_IA).map(([id, p]) => `<option value="${id}" ${id === actual ? "selected" : ""}>${esc(p.etiqueta)}</option>`).join("")}
              </select></label>
            <div id="pasos-proveedor">${htmlPasosProveedor(actual)}</div>
            <label class="campo"><span class="campo__etiqueta">${iaLista() ? "Nueva clave" : "Clave"}</span>
              <input class="entrada" name="clave" type="password" placeholder="${esc(PROVEEDORES_IA[actual].prefijo)}" spellcheck="false" required></label>
            <p class="aviso-form" data-error-config hidden></p>
            <div><button type="submit" class="boton boton--primario">Guardar y probar</button></div>
            <p class="ayuda">La clave se guarda en el archivo <code>.env</code> de esta computadora y nunca llega a los navegadores de tus alumnos.</p>
          </form>`
        : `<p>Por seguridad, la clave solo puede cambiarse desde la computadora donde corre el servidor. Si publicaste la plataforma en un hosting (como Render), edita sus variables de entorno <code>AI_PROVIDER</code> y <code>AI_API_KEY</code>.</p>`}
      </div>`,
    pie: `<button type="button" class="boton boton--secundario" data-accion="revisar-ia">Comprobar de nuevo</button>
          <button type="button" class="boton boton--fantasma" data-accion="cerrar-modal">Cerrar</button>`
  });
}

async function guardarClaveIA(form) {
  const boton = form.querySelector("button[type=submit]");
  const error = form.querySelector("[data-error-config]");
  error.hidden = true;
  boton.disabled = true;
  boton.innerHTML = `<span class="spinner"></span>Probando la clave…`;
  try {
    await api("configurar", { proveedor: form.proveedor.value, clave: form.clave.value.trim() });
    await comprobarIA(true);
    toast(`Listo: la IA quedó conectada con ${PROVEEDORES_IA[form.proveedor.value].nombre}.`);
    abrirConfigIA();
  } catch (err) {
    error.textContent = err.message;
    error.hidden = false;
    boton.disabled = false;
    boton.textContent = "Guardar y probar";
  }
}

/* =========================================================
   6. Notificaciones
   ========================================================= */
function notificar(usuario, mensaje) {
  notificaciones.push({ id: uid("notif"), usuario, mensaje, fecha: new Date().toISOString(), leida: false });
  if (notificaciones.length > 500) notificaciones = notificaciones.slice(-500);
  guardarNotificaciones();
  actualizarContadorNotif();
}

function actualizarContadorNotif() {
  const badge = $("#notif-contador");
  if (!sesion || !badge) return;
  const n = notificaciones.filter(x => x.usuario === sesion.usuario && !x.leida).length;
  badge.textContent = n > 99 ? "99+" : n;
  badge.hidden = n === 0;
}

function renderNotificaciones() {
  const mias = notificaciones.filter(n => n.usuario === sesion.usuario).slice().reverse();
  $("#notif-lista").innerHTML = mias.length
    ? mias.map(n => `
        <button type="button" class="notif__item ${n.leida ? "" : "is-nueva"}" data-accion="leer-notif" data-id="${esc(n.id)}">
          ${esc(n.mensaje)}
          <time>${esc(fmtFecha(n.fecha))}</time>
        </button>`).join("")
    : `<div class="notif__vacio">No tienes notificaciones por ahora.</div>`;
}

function alternarNotificaciones(forzar) {
  const panel = $("#notif-panel");
  const abrir = forzar ?? panel.hidden;
  panel.hidden = !abrir;
  $("#btn-notif").setAttribute("aria-expanded", String(abrir));
  if (abrir) renderNotificaciones();
}

/* =========================================================
   7. Acceso y registro
   ========================================================= */
function mostrarAuth() {
  $("#vista-app").hidden = true;
  $("#vista-auth").hidden = false;
  cambiarTabAuth("login");
}

function cambiarTabAuth(tab) {
  $$("[data-auth-tab]").forEach(b => {
    const activo = b.dataset.authTab === tab;
    b.classList.toggle("is-activo", activo);
    b.setAttribute("aria-selected", String(activo));
  });
  $("#form-login").hidden = tab !== "login";
  $("#form-registro").hidden = tab !== "registro";
  $("#credenciales").hidden = true;
  $("#error-login").hidden = true;
  $("#error-registro").hidden = true;
}

function errorForm(id, mensaje) {
  const el = $(id);
  el.textContent = mensaje;
  el.hidden = false;
}

function alEnviarLogin(e) {
  e.preventDefault();
  const rol = $("input[name=login-rol]:checked").value;
  const usuarioTxt = $("#login-usuario").value.trim();
  const usuarioMin = usuarioTxt.toLowerCase();
  const password = $("#login-password").value;
  const codigo = $("#login-codigo").value.trim().toUpperCase();

  if (!usuarioTxt || !password) return errorForm("#error-login", "Escribe tu usuario y contraseña.");

  const cuenta = usuarios.find(u =>
    u.rol === rol && (u.usuario.toLowerCase() === usuarioMin || (u.correo || "").toLowerCase() === usuarioMin) && u.password === password);
  if (!cuenta) {
    const otroRol = usuarios.find(u => (u.usuario.toLowerCase() === usuarioMin || (u.correo || "").toLowerCase() === usuarioMin) && u.password === password);
    return errorForm("#error-login", otroRol
      ? `Esta cuenta es de ${otroRol.rol}. Cambia la opción «Entro como».`
      : "Usuario o contraseña incorrectos.");
  }

  if (rol === "docente") {
    sesion = { rol: "docente", nombre: cuenta.nombre, usuario: cuenta.usuario, codigoClase: "DOCENTE" };
  } else {
    cuenta.gruposInscritos = (cuenta.gruposInscritos || []).filter(c => clasePorCodigo(c));
    let activo = cuenta.gruposInscritos[cuenta.gruposInscritos.length - 1];
    if (codigo) {
      if (!clasePorCodigo(codigo)) return errorForm("#error-login", `No existe un grupo con el código ${codigo}. Pídele el código correcto a tu docente.`);
      if (!cuenta.gruposInscritos.includes(codigo)) cuenta.gruposInscritos.push(codigo);
      activo = codigo;
    }
    if (!activo) return errorForm("#error-login", "Escribe el código de grupo que te dio tu docente para inscribirte.");
    guardarUsuarios();
    sesion = { rol: "alumno", nombre: cuenta.nombre, usuario: cuenta.usuario, codigoClase: activo, estiloEstudiante: cuenta.estiloEstudiante || "practico" };
  }
  guardarSesion();
  $("#form-login").reset();
  mostrarApp();
}

function alEnviarRegistro(e) {
  e.preventDefault();
  const rol = $("input[name=reg-rol]:checked").value;
  const nombre = $("#reg-nombre").value.trim().replace(/\s+/g, " ");
  const correo = $("#reg-correo").value.trim().toLowerCase();

  if (nombre.length < 3) return errorForm("#error-registro", "Escribe tu nombre completo.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return errorForm("#error-registro", "Escribe un correo electrónico válido.");
  if (usuarios.some(u => (u.correo || "").toLowerCase() === correo)) return errorForm("#error-registro", "Ya existe una cuenta con este correo. Inicia sesión.");

  const prefijo = rol === "docente" ? "doc" : "alu";
  let usuario;
  do { usuario = `${prefijo}_${aleatorio(4, "0123456789")}`; } while (usuarios.some(u => u.usuario === usuario));
  const password = aleatorio(10, "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789");

  const nuevo = { correo, nombre, usuario, password, rol, fechaRegistro: new Date().toISOString() };
  if (rol === "alumno") Object.assign(nuevo, { gruposInscritos: [], testRealizado: false, estiloEstudiante: "practico" });
  usuarios.push(nuevo);
  if (!guardarUsuarios()) return;

  $("#form-registro").reset();
  $("#form-registro").hidden = true;
  $("#cred-usuario").textContent = usuario;
  $("#cred-password").textContent = password;
  const cred = $("#credenciales");
  cred.hidden = false;
  cred.dataset.usuario = usuario;
  cred.dataset.password = password;
  cred.dataset.rol = rol;
}

function irALoginConCredenciales() {
  const cred = $("#credenciales");
  cambiarTabAuth("login");
  $("#login-usuario").value = cred.dataset.usuario || "";
  $("#login-password").value = cred.dataset.password || "";
  const radio = $(`input[name=login-rol][value="${cred.dataset.rol || "alumno"}"]`);
  if (radio) radio.checked = true;
  actualizarCampoCodigo();
  (cred.dataset.rol === "alumno" ? $("#login-codigo") : $("#form-login button[type=submit]")).focus();
}

function actualizarCampoCodigo() {
  const esDocente = $("input[name=login-rol]:checked")?.value === "docente";
  $("#campo-codigo-login").hidden = esDocente;
}

function cerrarSesion() {
  sesion = null;
  guardarSesion();
  estado.chats = {};
  estado.abiertas.clear();
  estado.vistaDocente = "resumen";
  alternarNotificaciones(false);
  cerrarModal(true);
  mostrarAuth();
}

/* =========================================================
   8. Estructura principal
   ========================================================= */
const estado = {
  moduloActualId: null,
  vistaDocente: "resumen",
  filtroGrupo: "",
  filtroEstado: "pendiente",
  abiertas: new Set(),
  chats: {},
  enviandoChat: false
};

function mostrarApp() {
  const cuenta = usuarioActual();
  if (!sesion || !cuenta) { sesion = null; guardarSesion(); return mostrarAuth(); }

  $("#vista-auth").hidden = true;
  $("#vista-app").hidden = false;
  $("#nombre-usuario").textContent = cuenta.nombre;
  $("#rol-usuario").textContent = cuenta.rol === "docente" ? "Docente" : `Alumno · ${cuenta.usuario}`;
  $("#avatar-usuario").textContent = iniciales(cuenta.nombre);
  actualizarContadorNotif();
  comprobarIA();
  renderTodo();

  if (cuenta.rol === "alumno" && !cuenta.testRealizado) abrirDiagnostico();
}

function renderTodo() {
  if (!sesion) return;
  if (sesion.rol === "docente") renderDocente(); else renderAlumno();
}

function fijarTitulo(titulo, subtitulo = "") {
  $("#titulo-pagina").textContent = titulo;
  $("#subtitulo-pagina").textContent = subtitulo;
  document.title = `${titulo} · AdaptiClass`;
}

function cerrarMenuMovil() { $("#vista-app").classList.remove("menu-abierto"); }

/* =========================================================
   9. Vista del alumno
   ========================================================= */
function renderAlumno() {
  const cuenta = usuarioActual();
  cuenta.gruposInscritos = (cuenta.gruposInscritos || []).filter(c => clasePorCodigo(c));
  if (!cuenta.gruposInscritos.includes(sesion.codigoClase)) {
    sesion.codigoClase = cuenta.gruposInscritos[cuenta.gruposInscritos.length - 1] || null;
    guardarSesion();
  }
  sesion.estiloEstudiante = cuenta.estiloEstudiante || "practico";
  const clase = clasePorCodigo(sesion.codigoClase);
  const estilo = sesion.estiloEstudiante;

  if (clase && !clase.modulos.some(m => m.id === estado.moduloActualId)) {
    estado.moduloActualId = clase.modulos[0]?.id ?? null;
  }

  renderLateralAlumno(cuenta, clase, estilo);

  if (!clase) {
    fijarTitulo("Mi aprendizaje", "Sin grupo activo");
    $("#contenido").innerHTML = `
      <div class="panel"><div class="vacio">
        <div class="vacio__icono">${icono("users")}</div>
        <h3>Aún no estás inscrito en ningún grupo</h3>
        <p>Pídele a tu docente el código del grupo y escríbelo en la barra lateral, en «Unirme a un grupo».</p>
      </div></div>`;
    return;
  }

  const prog = progresoAlumno(sesion.usuario, clase, estilo);
  const niv = nivelAlumno(sesion.usuario, clase.codigo);
  estado.nivelActual = niv.nivel;
  fijarTitulo(clase.nombre, `Nivel ${NIVELES[niv.nivel].nombre.toLowerCase()} · estilo ${ESTILOS[estilo].nombre.toLowerCase()}`);
  const modulo = clase.modulos.find(m => m.id === estado.moduloActualId);

  $("#contenido").innerHTML = `
    <section class="curso">
      <div>
        <div class="curso__meta">
          <span class="etiqueta-oscura">Grupo <code>${esc(clase.codigo)}</code></span>
          <span class="etiqueta-oscura">Estilo ${esc(ESTILOS[estilo].nombre.toLowerCase())}
            <button type="button" class="enlace" data-accion="repetir-diagnostico">cambiar</button></span>
        </div>
        <h2 class="curso__nombre">${esc(clase.nombre)}</h2>
        <p class="texto-suave">${clase.modulos.length} actividad${clase.modulos.length === 1 ? "" : "es"} publicada${clase.modulos.length === 1 ? "" : "s"} · ${prog.entregados} de ${prog.total} puntos entregados</p>
      </div>
      <div class="curso__progreso">
        <div class="curso__porcentaje">${prog.porcentaje}%</div>
        <div class="curso__detalle">de avance</div>
      </div>
      <div class="barra-tiza" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${prog.porcentaje}" aria-label="Avance en el grupo"><span style="width:${prog.porcentaje}%"></span></div>
      <div class="nivel-alumno">
        <div class="escalera" aria-label="Nivel ${esc(NIVELES[niv.nivel].nombre)}">
          ${ORDEN_NIVEL.map(n => `<span class="escalera__paso ${ORDEN_NIVEL.indexOf(n) <= ORDEN_NIVEL.indexOf(niv.nivel) ? "is-lleno" : ""} ${n === niv.nivel ? "is-actual" : ""}">${NIVELES[n].nombre}</span>`).join("")}
        </div>
        <p class="nivel-alumno__texto">
          <strong>Nivel ${esc(NIVELES[niv.nivel].nombre.toLowerCase())}</strong>, según ${esc(niv.origen)}${niv.dominio != null ? ` · dominio ${Math.round(niv.dominio * 100)} %` : ""}.
          ${esc(NIVELES[niv.nivel].descripcion)}
          ${!niv.manual && niv.senales < MIN_SENALES ? `Responde las preguntas de comprobación para que tu nivel se ajuste a ti.` : ""}
        </p>
      </div>
    </section>

    <div class="disposicion">
      <section id="zona-modulo">${modulo ? htmlModuloAlumno(clase, modulo, estilo) : `
        <div class="panel"><div class="vacio">
          <div class="vacio__icono">${icono("book")}</div>
          <h3>Tu docente todavía no publica actividades</h3>
          <p>Te avisaremos con una notificación cuando haya una nueva actividad en este grupo.</p>
        </div></div>`}
      </section>
      <aside class="disposicion__lateral">
        ${htmlTutor(clase, modulo)}
        ${htmlMaterialesAlumno(clase)}
      </aside>
    </div>`;

  pintarChat();
}

function renderLateralAlumno(cuenta, clase, estilo) {
  const grupos = cuenta.gruposInscritos.map(codigo => {
    const c = clasePorCodigo(codigo);
    const activo = codigo === sesion.codigoClase;
    return `<button type="button" class="nav-item ${activo ? "is-activo" : ""}" data-accion="cambiar-grupo" data-codigo="${esc(codigo)}" ${activo ? 'aria-current="true"' : ""}>
      ${icono("book")}<span class="nav-item__texto">${esc(c.nombre)}</span></button>`;
  }).join("");

  const modulos = clase ? clase.modulos.map(mod => {
    const puntos = puntosModulo(mod, estilo);
    const hechos = puntos.filter((_, i) => entregasDe(sesion.usuario, clase.codigo, mod.id, i + 1).length).length;
    const pct = puntos.length ? Math.round(hechos / puntos.length * 100) : 0;
    const limite = tiempoRestante(mod.fechaLimite);
    const activo = mod.id === estado.moduloActualId;
    return `<button type="button" class="nav-item ${activo ? "is-activo" : ""}" data-accion="ver-modulo" data-id="${mod.id}" style="display:block">
      <span class="modulo-nav" style="padding:0">
        <span class="nav-item__texto" style="white-space:normal">${esc(mod.titulo)}</span>
        <span class="modulo-nav__meta"><span class="${limite.vencida ? "vencida" : ""}">${esc(limite.texto)}</span><span>${hechos}/${puntos.length}</span></span>
        <span class="mini-progreso"><span style="width:${pct}%"></span></span>
      </span></button>`;
  }).join("") : "";

  $("#lateral-contenido").innerHTML = `
    <div class="lateral__seccion">
      <div class="lateral__titulo">Mis grupos</div>
      ${grupos || `<p class="lateral__titulo" style="font-weight:400">Sin grupos todavía.</p>`}
      <form class="unirse" data-form="unirse" autocomplete="off">
        <input name="codigo" placeholder="Unirme a un grupo" aria-label="Código de grupo" required>
        <button type="submit">Unirme</button>
      </form>
    </div>
    ${clase && clase.modulos.length ? `<div class="lateral__seccion"><div class="lateral__titulo">Actividades</div>${modulos}</div>` : ""}`;
}

function htmlModuloAlumno(clase, modulo, estilo) {
  const limite = tiempoRestante(modulo.fechaLimite);
  const puntos = puntosModulo(modulo, estilo);
  const nivel = estado.nivelActual || "intermedio";
  const sig = siguientePaso(sesion.usuario, clase, modulo, estilo);

  const items = puntos.map((item, i) => {
    const act = parsearActividad(item, i);
    const lista = entregasDe(sesion.usuario, clase.codigo, modulo.id, i + 1);
    const ultima = lista[lista.length - 1];
    const est = ultima ? estadoDe(ultima) : null;
    const ep = estadoPregunta(sesion.usuario, clase.codigo, modulo.id, i + 1);
    const clave = `${clase.codigo}-${modulo.id}-${i}`;
    const abierta = estado.abiertas.has(clave) || (sig?.indice === i && !estado.abiertas.size);
    const idInput = `archivo-${modulo.id}-${i}`;
    const completo = est === "aprobado" && (!act.pregunta || ep?.resuelta);

    // Bloques que cambian según el nivel del alumno
    const apoyo = act.apoyo
      ? (nivel === "basico"
          ? `<div class="bloque bloque--apoyo"><h4>Paso a paso</h4><div class="md">${md(act.apoyo)}</div></div>`
          : `<details class="desplegable"><summary>¿Te atoraste? Ver paso a paso</summary><div class="md">${md(act.apoyo)}</div></details>`)
      : "";
    const reto = act.reto
      ? (nivel === "avanzado"
          ? `<div class="bloque bloque--reto"><h4>Reto avanzado</h4><div class="md">${md(act.reto)}</div></div>`
          : `<details class="desplegable"><summary>${nivel === "basico" ? "Reto opcional, para cuando te sientas listo" : "Reto opcional"}</summary><div class="md">${md(act.reto)}</div></details>`)
      : "";

    return `
      <details class="actividad ${completo ? "is-hecha" : est === "rechazado" ? "is-rechazada" : ""}" data-clave="${esc(clave)}" id="punto-${modulo.id}-${i}" ${abierta ? "open" : ""}>
        <summary>
          <span class="actividad__num">${completo ? icono("check") : i + 1}</span>
          <span class="actividad__titulo">${esc(act.titulo)}</span>
          ${act.pregunta && ep?.resuelta ? `<span class="insignia insignia--accion" title="Pregunta de comprobación resuelta">${icono("check")}Comprendido</span>` : ""}
          ${ultima ? insigniaEstado(ultima) : ""}
          ${icono("chev", "i actividad__chev")}
        </summary>
        <div class="actividad__cuerpo">
          ${act.explicacion ? `<div class="bloque"><h4>Explicación</h4><div class="md">${md(act.explicacion)}</div></div>` : ""}
          ${act.ejemplo ? `<div class="bloque"><h4>Ejemplo</h4><div class="md">${md(act.ejemplo)}</div></div>` : ""}
          ${nivel === "basico" ? apoyo : ""}
          ${act.pregunta ? htmlPregunta(act.pregunta, ep, modulo.id, i + 1, nivel) : ""}
          ${act.tarea ? `<div class="bloque bloque--tarea"><h4>Tu tarea</h4><div class="md">${md(act.tarea)}</div></div>` : ""}
          ${nivel !== "basico" ? apoyo : ""}
          ${reto}
          ${ultima?.comentarioDocente ? `
            <div class="bloque bloque--comentario ${est === "aprobado" ? "is-ok" : ""}">
              <h4>Comentario de tu docente</h4><div class="md">${md(ultima.comentarioDocente)}</div>
            </div>` : ""}
          <div class="actividad__pie">
            <span class="texto-suave">${ultima
              ? `${lista.length} entrega${lista.length === 1 ? "" : "s"} · última ${esc(fmtFecha(ultima.fechaEntrega) || "registrada")}${ultima.tarde ? " (fuera de plazo)" : ""}`
              : "Sube un PDF o una imagen de hasta 2 MB."}</span>
            <div class="fila">
              ${ultima ? `<button type="button" class="boton boton--secundario boton--sm" data-accion="ver-evidencia" data-id="${esc(ultima.idUnico)}">${icono("eye")}Ver mi entrega</button>` : ""}
              <input type="file" id="${idInput}" accept="application/pdf,image/png,image/jpeg,image/webp" hidden
                data-accion="subir-evidencia" data-modulo="${modulo.id}" data-punto="${i + 1}">
              <label for="${idInput}" class="boton ${ultima && est !== "rechazado" ? "boton--secundario" : "boton--primario"} boton--sm" tabindex="0" role="button" data-accion="activar-archivo">
                ${icono("upload")}${ultima ? (est === "rechazado" ? "Subir corrección" : "Reemplazar entrega") : "Subir evidencia"}
              </label>
            </div>
          </div>
        </div>
      </details>`;
  }).join("");

  return `
    <div class="modulo-cabecera">
      <div>
        <p class="texto-suave">Actividad ${modulo.id}</p>
        <h2>${esc(modulo.titulo)}</h2>
      </div>
      <span class="insignia insignia--${limite.clase}">${icono("clock")}${esc(limite.texto)}</span>
    </div>
    ${sig ? `<div class="siguiente">
        <div><span class="texto-suave">Tu siguiente paso</span>
          <strong>Punto ${sig.indice + 1}: ${esc(sig.act.titulo)}</strong>
          <span class="texto-suave">${esc(sig.motivo)}</span></div>
        <button type="button" class="boton boton--primario boton--sm" data-accion="ir-punto" data-modulo="${modulo.id}" data-indice="${sig.indice}">Continuar</button>
      </div>`
      : puntos.length ? `<div class="siguiente siguiente--hecho"><div><strong>Completaste todos los puntos de esta actividad.</strong>
          <span class="texto-suave">Espera la revisión de tu docente o elige otra actividad en el menú.</span></div></div>` : ""}
    <div class="actividades">${items || `<div class="panel"><div class="vacio"><p>Esta actividad no tiene puntos para tu perfil.</p></div></div>`}</div>`;
}

function htmlPregunta(p, ep, modId, punto, nivel) {
  const resuelta = ep?.resuelta;
  const fallos = ep ? ep.intentos - (resuelta ? 1 : 0) : 0;
  const ultimaMala = ep && !ep.ultima.correcta ? ep.ultima.opcion : null;
  // A nivel básico se muestra la explicación tras el primer error; en otros niveles, tras el segundo
  const mostrarExplicacion = resuelta || fallos >= (nivel === "basico" ? 1 : 2);

  const opciones = p.opciones.map((o, k) => {
    const clases = resuelta ? (k === p.correcta ? "is-correcta" : "") : (k === ultimaMala ? "is-incorrecta" : "");
    return `<label class="opcion ${clases}">
      <input type="radio" name="resp-${modId}-${punto}" value="${k}" ${resuelta ? "disabled" : ""} ${resuelta && k === p.correcta ? "checked" : ""}>
      <span class="md">${md(o)}</span></label>`;
  }).join("");

  return `<form class="comprobacion ${resuelta ? "is-resuelta" : ""}" data-form="pregunta" data-modulo="${modId}" data-punto="${punto}">
    <h4>${icono("spark")}Comprueba lo que aprendiste</h4>
    <div class="md comprobacion__enunciado">${md(p.enunciado)}</div>
    <fieldset class="pregunta" ${resuelta ? "disabled" : ""}><legend class="sr-only">Opciones</legend>${opciones}</fieldset>
    ${resuelta
      ? `<p class="comprobacion__resultado is-ok">${icono("check")}${ep.primerIntento ? "¡Correcto al primer intento!" : `Correcto después de ${ep.intentos} intentos.`}</p>`
      : ultimaMala != null ? `<p class="comprobacion__resultado is-error">${icono("alert")}Esa no es la respuesta. ${mostrarExplicacion ? "Lee la explicación y vuelve a intentarlo." : nivel === "basico" ? "" : "Revisa la explicación del punto e inténtalo de nuevo."}</p>` : ""}
    ${mostrarExplicacion && p.explicacion ? `<div class="md comprobacion__explicacion">${md(p.explicacion)}</div>` : ""}
    <div class="fila">
      ${resuelta ? "" : `<button type="submit" class="boton boton--primario boton--sm">${ultimaMala != null ? "Intentar de nuevo" : "Comprobar"}</button>`}
      ${ultimaMala != null && !resuelta ? `<button type="button" class="boton boton--secundario boton--sm" data-accion="preguntar-tutor" data-modulo="${modId}" data-punto="${punto}">${icono("chat")}Pídele ayuda al tutor</button>` : ""}
    </div>
  </form>`;
}

function htmlMaterialesAlumno(clase) {
  if (!clase.materiales.length) return "";
  const items = clase.materiales.map(mat => {
    if (mat.tipo === "youtube") {
      const id = idYoutube(mat.contenido);
      return `<div class="material" style="display:block">
        <div class="fila"><span class="material__icono">${icono("play")}</span><span class="material__titulo">${esc(mat.titulo)}</span></div>
        ${id ? `<iframe class="video" src="https://www.youtube-nocookie.com/embed/${id}" title="${esc(mat.titulo)}" loading="lazy" allow="encrypted-media; picture-in-picture" allowfullscreen></iframe>` : ""}
      </div>`;
    }
    if (mat.tipo === "enlace") {
      const url = urlSegura(mat.contenido);
      return `<div class="material"><span class="material__icono">${icono("link")}</span><span class="material__titulo">${esc(mat.titulo)}</span>
        ${url ? `<a class="boton boton--secundario boton--sm" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Abrir</a>` : ""}</div>`;
    }
    return `<div class="material"><span class="material__icono">${icono(mat.tipo === "imagen" ? "image" : "file")}</span><span class="material__titulo">${esc(mat.titulo)}</span>
      <button type="button" class="boton boton--secundario boton--sm" data-accion="ver-material" data-clase="${esc(clase.codigo)}" data-id="${esc(mat.id)}">Ver</button></div>`;
  }).join("");
  return `<section class="panel">
    <div class="panel__cabecera"><h3>${icono("book")}Material de apoyo</h3></div>
    <div class="materiales">${items}</div></section>`;
}

async function subirEvidencia(input) {
  const archivo = input.files?.[0];
  input.value = "";
  if (!archivo) return;
  const modId = Number(input.dataset.modulo);
  const punto = Number(input.dataset.punto);

  if (!/^(application\/pdf|image\/(png|jpeg|webp))$/.test(archivo.type)) {
    return toast("Formato no admitido. Sube un PDF o una imagen PNG, JPG o WebP.", "error");
  }
  if (archivo.size > MAX_ARCHIVO_MB * 1024 * 1024) {
    return toast(`El archivo pesa ${(archivo.size / 1048576).toFixed(1)} MB. El máximo es ${MAX_ARCHIVO_MB} MB: comprímelo e intenta de nuevo.`, "error");
  }

  const base64 = await new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result);
    lector.onerror = reject;
    lector.readAsDataURL(archivo);
  }).catch(() => null);
  if (!base64) return toast("No se pudo leer el archivo.", "error");

  const clase = clasePorCodigo(sesion.codigoClase);
  const modulo = clase?.modulos.find(m => m.id === modId);
  const tarde = Boolean(modulo?.fechaLimite && new Date() > new Date(modulo.fechaLimite));

  const ev = {
    idUnico: uid("ev"),
    alumno: sesion.nombre,
    usuario: sesion.usuario,
    clase: sesion.codigoClase,
    modulo: modId,
    punto,
    archivoBase64: base64,
    tipoArchivo: archivo.type === "application/pdf" ? "pdf" : "imagen",
    nombreArchivo: archivo.name,
    fechaEntrega: new Date().toISOString(),
    tarde,
    estado: "Pendiente",
    comentarioDocente: ""
  };
  evidencias.push(ev);
  if (!guardarEvidencias()) { evidencias.pop(); return; }

  if (clase) {
    const titulo = tituloPunto(clase, modId, punto, sesion.estiloEstudiante);
    notificar(clase.creador, `${sesion.nombre} entregó «${titulo}» en ${clase.nombre}${tarde ? " (fuera de plazo)" : ""}.`);
  }
  estado.abiertas.add(`${sesion.codigoClase}-${modId}-${punto - 1}`);
  toast(tarde ? "Entrega enviada fuera de plazo. Tu docente la verá marcada." : "Entrega enviada. Tu docente ya fue notificado.", tarde ? "aviso" : "exito");
  renderAlumno();
}

function responderPregunta(form) {
  const elegido = form.querySelector("input[type=radio]:checked");
  if (!elegido) return toast("Elige una opción.", "aviso");
  const modId = Number(form.dataset.modulo);
  const punto = Number(form.dataset.punto);
  const clase = clasePorCodigo(sesion.codigoClase);
  const modulo = clase?.modulos.find(m => m.id === modId);
  const act = modulo && parsearActividad(puntosModulo(modulo, sesion.estiloEstudiante)[punto - 1], punto - 1);
  if (!act?.pregunta) return;

  const opcion = Number(elegido.value);
  const correcta = opcion === act.pregunta.correcta;
  respuestas.push({
    id: uid("resp"), usuario: sesion.usuario, clase: clase.codigo, modulo: modId, punto,
    estilo: sesion.estiloEstudiante, opcion, correcta, fecha: new Date().toISOString()
  });
  if (!guardarRespuestas()) { respuestas.pop(); return; }

  estado.abiertas.add(`${clase.codigo}-${modId}-${punto - 1}`);
  const y = window.scrollY;
  revisarCambioNivel(sesion.usuario, clase.codigo);
  renderAlumno();
  window.scrollTo({ top: y });
}

function irAPunto(modId, indice) {
  const clave = `${sesion.codigoClase}-${modId}-${indice}`;
  estado.abiertas.add(clave);
  const el = document.getElementById(`punto-${modId}-${indice}`);
  if (el) { el.open = true; el.scrollIntoView({ behavior: "smooth", block: "start" }); el.querySelector("summary")?.focus({ preventScroll: true }); }
}

function pedirAyudaTutor(modId, punto) {
  const clase = clasePorCodigo(sesion.codigoClase);
  const modulo = clase?.modulos.find(m => m.id === modId);
  const act = modulo && parsearActividad(puntosModulo(modulo, sesion.estiloEstudiante)[punto - 1], punto - 1);
  if (!act?.pregunta) return;
  const ep = estadoPregunta(sesion.usuario, clase.codigo, modId, punto);
  const elegida = ep ? act.pregunta.opciones[ep.ultima.opcion] : "";
  const texto = `En el punto ${punto} («${act.titulo}») no entiendo esta pregunta: «${act.pregunta.enunciado}». Respondí «${elegida}» y no era correcto. ¿Me ayudas a razonarlo sin darme la respuesta directamente?`;
  document.querySelector(".chat")?.scrollIntoView({ behavior: "smooth", block: "center" });
  enviarChat(texto);
}

function unirseAGrupo(form) {
  const codigo = form.codigo.value.trim().toUpperCase();
  const clase = clasePorCodigo(codigo);
  if (!clase) return toast(`No existe un grupo con el código ${codigo}.`, "error");
  const cuenta = usuarioActual();
  cuenta.gruposInscritos = cuenta.gruposInscritos || [];
  if (cuenta.gruposInscritos.includes(codigo)) {
    toast("Ya estás inscrito en ese grupo.", "aviso");
  } else {
    cuenta.gruposInscritos.push(codigo);
    guardarUsuarios();
    notificar(clase.creador, `${cuenta.nombre} se unió al grupo ${clase.nombre}.`);
    toast(`Te uniste a ${clase.nombre}.`);
  }
  cambiarGrupo(codigo);
}

function cambiarGrupo(codigo) {
  sesion.codigoClase = codigo;
  estado.moduloActualId = null;
  guardarSesion();
  cerrarMenuMovil();
  renderAlumno();
  $("#contenido").focus({ preventScroll: true });
  window.scrollTo({ top: 0 });
}

/* ---------- Diagnóstico de estilo de aprendizaje ---------- */
const PREGUNTAS = [
  { tipo: "estilo", texto: "Cuando aprendes un concepto nuevo, prefieres…", opciones: {
    practico: "Probarlo de inmediato con un ejercicio.",
    visual: "Ver un diagrama o esquema que lo explique.",
    analitico: "Leer la definición formal y entender por qué funciona." } },
  { tipo: "estilo", texto: "Para recordar algo importante…", opciones: {
    practico: "Lo repito practicando varias veces.",
    visual: "Me hago una imagen mental, un mapa o un dibujo.",
    analitico: "Hago un resumen ordenado con mis propias palabras." } },
  { tipo: "estilo", texto: "Ante un problema técnico que no conoces, tu primer paso es…", opciones: {
    practico: "Probar soluciones y ajustar sobre la marcha.",
    visual: "Dibujar cómo se conectan las partes del problema.",
    analitico: "Investigar la teoría y planear antes de actuar." } },
  { tipo: "estilo", texto: "El material de estudio que más te sirve es…", opciones: {
    practico: "Guías paso a paso y laboratorios.",
    visual: "Videos, infografías y presentaciones con gráficos.",
    analitico: "Libros, artículos y documentación técnica." } },
  { tipo: "estilo", texto: "En clase, lo que más te ayuda es…", opciones: {
    practico: "Resolver ejercicios durante la sesión.",
    visual: "Que el docente explique con la pizarra o diapositivas.",
    analitico: "Discutir el razonamiento detrás de cada tema." } },
  { tipo: "nivel", texto: "¿Cuánta experiencia tienes con los temas técnicos de tus cursos?", opciones: {
    basico: "Poca: estoy empezando y muchas cosas son nuevas para mí.",
    intermedio: "Algo: he hecho ejercicios o proyectos pequeños.",
    avanzado: "Bastante: los aplico con soltura en proyectos propios." } },
  { tipo: "nivel", texto: "Cuando una tarea se complica, normalmente…", opciones: {
    basico: "Necesito un ejemplo resuelto paso a paso para avanzar.",
    intermedio: "Me basta con una pista para seguir solo.",
    avanzado: "Lo resuelvo por mi cuenta y busco retos extra." } },
  { tipo: "nivel", texto: "Si te explican un tema nuevo una sola vez…", opciones: {
    basico: "Suelo necesitar que me lo repitan o ver más ejemplos.",
    intermedio: "Entiendo la idea general, pero practico para dominarlo.",
    avanzado: "Normalmente lo entiendo y puedo explicárselo a otros." } }
];

function masVotado(lista, claves, desempate) {
  const votos = Object.fromEntries(claves.map(k => [k, 0]));
  lista.forEach(r => { if (r in votos) votos[r]++; });
  const max = Math.max(...Object.values(votos));
  const empatados = claves.filter(k => votos[k] === max);
  return empatados.includes(desempate) ? desempate : empatados[0];
}

function abrirDiagnostico(paso = 0, elecciones = []) {
  const cuenta = usuarioActual();
  const obligatorio = !cuenta.testRealizado;

  if (paso >= PREGUNTAS.length) {
    const deEstilo = elecciones.filter((_, i) => PREGUNTAS[i].tipo === "estilo");
    const deNivel = elecciones.filter((_, i) => PREGUNTAS[i].tipo === "nivel");
    const estilo = masVotado(deEstilo, Object.keys(ESTILOS), deEstilo[0]);
    const nivel = masVotado(deNivel, ORDEN_NIVEL, "intermedio");

    cuenta.estiloEstudiante = estilo;
    cuenta.nivelBase = nivel;
    cuenta.testRealizado = true;
    guardarUsuarios();
    sesion.estiloEstudiante = estilo;
    guardarSesion();

    abrirModal({
      titulo: "Tu plan de aprendizaje",
      cuerpo: `<div class="resultado-perfil">
          <p class="texto-suave">Tus actividades se mostrarán con estilo</p>
          <div class="resultado-perfil__nombre">${ESTILOS[estilo].nombre}</div>
          <p>${esc(ESTILOS[estilo].descripcion)}</p>
          <p class="texto-suave" style="margin-top:.6rem">y empezarás en nivel</p>
          <div class="resultado-perfil__nombre">${NIVELES[nivel].nombre}</div>
          <p>${esc(NIVELES[nivel].descripcion)}</p>
          <p class="texto-suave">Tu nivel se ajustará en cada grupo según tus respuestas y tus entregas aprobadas.</p>
        </div>`,
      pie: `<button type="button" class="boton boton--primario" data-accion="cerrar-modal-forzado">Ver mis actividades</button>`,
      bloqueado: true
    });
    renderAlumno();
    return;
  }

  const p = PREGUNTAS[paso];
  abrirModal({
    titulo: p.tipo === "nivel" ? "Diagnóstico: tu punto de partida" : "Diagnóstico: cómo aprendes",
    bloqueado: obligatorio,
    cuerpo: `
      <form id="form-diagnostico" class="pila">
        <div class="pila" style="gap:.4rem">
          <span class="paso-diagnostico">Pregunta ${paso + 1} de ${PREGUNTAS.length}</span>
          <div class="barra-pasos"><span style="width:${(paso / PREGUNTAS.length) * 100}%"></span></div>
        </div>
        <fieldset class="pregunta">
          <legend>${esc(p.texto)}</legend>
          ${Object.entries(p.opciones).map(([valor, texto]) => `
            <label class="opcion"><input type="radio" name="resp" value="${valor}" ${elecciones[paso] === valor ? "checked" : ""} required><span>${esc(texto)}</span></label>`).join("")}
        </fieldset>
      </form>`,
    pie: `${paso > 0 ? `<button type="button" class="boton boton--fantasma" id="diag-atras">Atrás</button>` : ""}
          <button type="submit" form="form-diagnostico" class="boton boton--primario">${paso === PREGUNTAS.length - 1 ? "Ver mi plan" : "Siguiente"}</button>`
  });

  $("#form-diagnostico").addEventListener("submit", e => {
    e.preventDefault();
    const elegido = $("#form-diagnostico input[name=resp]:checked");
    if (!elegido) return toast("Elige una opción para continuar.", "aviso");
    const nuevas = elecciones.slice();
    nuevas[paso] = elegido.value;
    abrirDiagnostico(paso + 1, nuevas);
  });
  $("#diag-atras")?.addEventListener("click", () => abrirDiagnostico(paso - 1, elecciones));
}

/* ---------- Tutor IA ---------- */
const claveChat = () => `${sesion.usuario}:${sesion.codigoClase}`;

function htmlTutor(clase, modulo) {
  const sugerencias = modulo
    ? ["Explícame el punto 1 con otro ejemplo", "¿Cómo debo presentar mi evidencia?", "Dame un ejercicio extra para practicar"]
    : ["¿Cómo puedo organizar mi estudio?", "¿Qué es el aprendizaje adaptativo?"];
  return `<section class="panel chat" aria-label="Tutor IA">
    <div class="panel__cabecera"><h3>${icono("spark")}Tutor IA</h3><span class="texto-suave">Se adapta a tu nivel ${esc(NIVELES[estado.nivelActual || "intermedio"].nombre.toLowerCase())}</span></div>
    <div class="chat__mensajes" id="chat-mensajes" aria-live="polite"></div>
    <div class="chat__sugerencias" id="chat-sugerencias">
      ${sugerencias.map(s => `<button type="button" class="chip" data-accion="sugerencia">${esc(s)}</button>`).join("")}
    </div>
    <form class="chat__form" data-form="chat">
      <textarea class="entrada" name="pregunta" rows="1" placeholder="Escribe tu duda…" aria-label="Pregunta para el tutor" maxlength="2000" required></textarea>
      <button type="submit" class="boton boton--primario" aria-label="Enviar">${icono("send")}</button>
    </form>
  </section>`;
}

function pintarChat() {
  const caja = $("#chat-mensajes");
  if (!caja) return;
  const historial = estado.chats[claveChat()] || [];
  const saludo = `Hola, ${esc(sesion.nombre.split(" ")[0])}. Pregúntame lo que no te quede claro de las actividades; te lo explico a tu manera.`;
  caja.innerHTML = `<div class="burbuja burbuja--ia"><div class="md"><p>${saludo}</p></div></div>` +
    historial.map(m => m.rol === "user"
      ? `<div class="burbuja burbuja--yo">${esc(m.texto)}</div>`
      : m.error
        ? `<div class="burbuja burbuja--error">${esc(m.texto)}</div>`
        : `<div class="burbuja burbuja--ia"><div class="md">${md(m.texto)}</div></div>`).join("") +
    (estado.enviandoChat ? `<div class="burbuja burbuja--ia burbuja--cargando" aria-label="El tutor está escribiendo"><span></span><span></span><span></span></div>` : "");
  $("#chat-sugerencias").hidden = historial.length > 0;
  caja.scrollTop = caja.scrollHeight;
}

async function enviarChat(texto) {
  const pregunta = texto.trim();
  if (!pregunta || estado.enviandoChat) return;
  const clave = claveChat();
  const historial = (estado.chats[clave] = estado.chats[clave] || []);
  const previo = historial.filter(m => !m.error).map(({ rol, texto }) => ({ rol, texto }));
  historial.push({ rol: "user", texto: pregunta });
  estado.enviandoChat = true;
  pintarChat();

  const clase = clasePorCodigo(sesion.codigoClase);
  const modulo = clase?.modulos.find(m => m.id === estado.moduloActualId);
  const contexto = clase ? `${clase.nombre}${modulo ? `, actividad «${modulo.titulo}» (puntos: ${puntosModulo(modulo, sesion.estiloEstudiante).map((p, i) => `${i + 1}. ${parsearActividad(p, i).titulo}`).join("; ")})` : ""}` : "";

  try {
    const datos = await api("tutor", { pregunta, estilo: sesion.estiloEstudiante, nivel: estado.nivelActual || "intermedio", contexto, historial: previo });
    historial.push({ rol: "assistant", texto: datos.respuesta });
  } catch (err) {
    historial.push({ rol: "assistant", texto: err.message, error: true });
  } finally {
    estado.enviandoChat = false;
    pintarChat();
    $("#chat-mensajes")?.closest(".panel")?.querySelector("textarea")?.focus();
  }
}

/* =========================================================
   10. Vista del docente
   ========================================================= */
function evidenciasDocente() {
  const codigos = new Set(clasesDocente().map(c => c.codigo));
  return evidencias.filter(ev => codigos.has(ev.clase));
}

function ultimasEntregas(lista) {
  // Solo la última entrega de cada alumno por punto (las anteriores quedan como historial)
  const mapa = new Map();
  for (const ev of lista) mapa.set(`${ev.usuario}|${ev.clase}|${ev.modulo}|${ev.punto}`, ev);
  return [...mapa.values()];
}

function renderDocente() {
  const vistas = { resumen: vistaResumen, grupos: vistaGrupos, entregas: vistaEntregas, alumnos: vistaAlumnos };
  if (!vistas[estado.vistaDocente]) estado.vistaDocente = "resumen";
  renderLateralDocente();
  vistas[estado.vistaDocente]();
}

function renderLateralDocente() {
  const pendientes = ultimasEntregas(evidenciasDocente()).filter(ev => estadoDe(ev) === "pendiente").length;
  const clases = clasesDocente();
  const alumnos = new Set(clases.flatMap(c => alumnosDeClase(c.codigo).map(a => a.usuario))).size;
  const item = (vista, ic, texto, extra = "") => `
    <button type="button" class="nav-item ${estado.vistaDocente === vista ? "is-activo" : ""}" data-accion="vista-docente" data-vista="${vista}" ${estado.vistaDocente === vista ? 'aria-current="page"' : ""}>
      ${icono(ic)}<span class="nav-item__texto">${texto}</span>${extra}</button>`;

  $("#lateral-contenido").innerHTML = `
    <div class="lateral__seccion">
      ${item("resumen", "grid", "Resumen")}
      ${item("grupos", "layers", "Grupos", `<span class="nav-item__extra">${clases.length}</span>`)}
      ${item("entregas", "inbox", "Entregas", pendientes ? `<span class="nav-item__contador">${pendientes}</span>` : "")}
      ${item("alumnos", "users", "Alumnos", `<span class="nav-item__extra">${alumnos}</span>`)}
    </div>
    ${clases.length ? `<div class="lateral__seccion">
      <div class="lateral__titulo">Mis grupos</div>
      ${clases.map(c => `<button type="button" class="nav-item" data-accion="administrar-grupo" data-codigo="${esc(c.codigo)}">
        ${icono("book")}<span class="nav-item__texto">${esc(c.nombre)}</span></button>`).join("")}
    </div>` : ""}`;
}

/** Una fila por cada alumno en cada grupo del docente, con su nivel y avance. */
function filasAlumnoGrupo() {
  const filas = [];
  for (const clase of clasesDocente()) {
    for (const a of alumnosDeClase(clase.codigo)) {
      const estilo = a.estiloEstudiante || "practico";
      filas.push({ alumno: a, clase, niv: nivelAlumno(a.usuario, clase.codigo), prog: progresoAlumno(a.usuario, clase, estilo) });
    }
  }
  return filas;
}

/** Punto con menor porcentaje de aciertos al primer intento en un grupo. */
function puntoMasDificil(clase) {
  const stats = new Map();
  for (const r of respuestas.filter(x => x.clase === clase.codigo)) {
    const k = `${r.usuario}|${r.modulo}|${r.punto}|${r.estilo}`;
    if (!stats.has(k)) stats.set(k, r);   // primer intento de cada alumno
  }
  const porPunto = new Map();
  for (const r of stats.values()) {
    const k = `${r.modulo}|${r.punto}|${r.estilo}`;
    const p = porPunto.get(k) || { modulo: r.modulo, punto: r.punto, estilo: r.estilo, total: 0, aciertos: 0 };
    p.total++; if (r.correcta) p.aciertos++;
    porPunto.set(k, p);
  }
  const lista = [...porPunto.values()].filter(p => p.total >= 2).sort((a, b) => a.aciertos / a.total - b.aciertos / b.total);
  const peor = lista[0];
  if (!peor || peor.aciertos / peor.total >= 0.7) return null;
  return { ...peor, titulo: tituloPunto(clase, peor.modulo, peor.punto, peor.estilo), porcentaje: Math.round(peor.aciertos / peor.total * 100) };
}

function vistaResumen() {
  const cuenta = usuarioActual();
  fijarTitulo(`Hola, ${cuenta.nombre.split(" ")[0]}`, "Resumen de tus grupos");
  const clases = clasesDocente();
  const ultimas = ultimasEntregas(evidenciasDocente());
  const pendientes = ultimas.filter(ev => estadoDe(ev) === "pendiente");
  const alumnos = new Set(clases.flatMap(c => alumnosDeClase(c.codigo).map(a => a.usuario))).size;
  const apoyo = filasAlumnoGrupo().filter(f => necesitaApoyo(f.niv));

  $("#contenido").innerHTML = `
    ${estadoIA && !iaLista() ? `<div class="aviso-ia">
      <div><strong>La IA todavía no está lista</strong>${esc(estadoIA.error || estadoIA.motivo || "Falta conectar tu clave de IA.")}</div>
      <button type="button" class="boton boton--primario" data-accion="configurar-ia">${icono("spark")}Configurar IA</button>
    </div>` : ""}
    <div class="estadisticas">
      <div class="estadistica estadistica--destacada"><div class="estadistica__valor">${pendientes.length}</div><div class="estadistica__etiqueta">Entregas por revisar</div></div>
      <div class="estadistica"><div class="estadistica__valor">${clases.length}</div><div class="estadistica__etiqueta">Grupos</div></div>
      <div class="estadistica"><div class="estadistica__valor">${alumnos}</div><div class="estadistica__etiqueta">Alumnos inscritos</div></div>
      <div class="estadistica ${apoyo.length ? "estadistica--alerta" : ""}"><div class="estadistica__valor">${apoyo.length}</div><div class="estadistica__etiqueta">Necesitan apoyo</div></div>
    </div>
    <div class="disposicion">
      <section class="panel">
        <div class="panel__cabecera"><h2>${icono("spark")}Publicar actividad con IA</h2></div>
        <div class="panel__cuerpo">${clases.length ? htmlFormPublicar() : `
          <div class="vacio" style="padding:1.5rem 0">
            <h3>Primero crea un grupo</h3>
            <p>Las actividades se publican dentro de un grupo. Crea uno y comparte su código con tus alumnos.</p>
            <button type="button" class="boton boton--primario" data-accion="vista-docente" data-vista="grupos">${icono("plus")}Crear grupo</button>
          </div>`}</div>
      </section>
      <aside class="disposicion__lateral">
        <section class="panel">
          <div class="panel__cabecera"><h3>${icono("inbox")}Por revisar</h3>
            ${pendientes.length ? `<button type="button" class="enlace" data-accion="vista-docente" data-vista="entregas">Ver todas</button>` : ""}</div>
          ${pendientes.length ? `<div class="materiales">${pendientes.slice(-6).reverse().map(ev => {
            const clase = clasePorCodigo(ev.clase);
            return `<div class="material">
              <span class="avatar" style="width:34px;height:34px;font-size:.75rem">${esc(iniciales(ev.alumno))}</span>
              <div style="flex:1;min-width:0"><div class="material__titulo">${esc(ev.alumno)}</div>
                <div class="texto-suave" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(clase?.nombre || ev.clase)} · punto ${ev.punto}</div></div>
              <button type="button" class="boton boton--secundario boton--sm" data-accion="revisar" data-id="${esc(ev.idUnico)}">Revisar</button>
            </div>`;
          }).join("")}</div>` : `<div class="vacio" style="padding:2rem 1rem"><div class="vacio__icono">${icono("check")}</div><p>Estás al día. No hay entregas pendientes.</p></div>`}
        </section>
        ${apoyo.length ? `<section class="panel">
          <div class="panel__cabecera"><h3>${icono("users")}Necesitan apoyo</h3>
            <button type="button" class="enlace" data-accion="vista-docente" data-vista="alumnos">Ver alumnos</button></div>
          <div class="materiales">${apoyo.slice(0, 6).map(f => `<div class="material">
            <span class="avatar" style="width:34px;height:34px;font-size:.75rem">${esc(iniciales(f.alumno.nombre))}</span>
            <div style="flex:1;min-width:0"><div class="material__titulo">${esc(f.alumno.nombre)}</div>
              <div class="texto-suave" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(f.clase.nombre)} · dominio ${Math.round(f.niv.dominio * 100)} %</div></div>
          </div>`).join("")}</div>
          <p class="ayuda" style="padding:.8rem 1.25rem">Ya ven el apoyo paso a paso. Revisa sus entregas con prioridad o ajusta su nivel en «Alumnos».</p>
        </section>` : ""}
      </aside>
    </div>`;
}

function htmlFormPublicar(codigoPreseleccionado = "") {
  const manana = new Date(Date.now() + 7 * 86400000);
  manana.setHours(23, 59, 0, 0);
  const porDefecto = new Date(manana.getTime() - manana.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  return `
    <form class="formulario" data-form="publicar">
      <div class="rejilla-2">
        <label class="campo"><span class="campo__etiqueta">Grupo</span>
          <select class="entrada" name="codigo" required>
            ${clasesDocente().map(c => `<option value="${esc(c.codigo)}" ${c.codigo === codigoPreseleccionado ? "selected" : ""}>${esc(c.nombre)} (${esc(c.codigo)})</option>`).join("")}
          </select></label>
        <label class="campo"><span class="campo__etiqueta">Fecha límite de entrega</span>
          <input class="entrada" type="datetime-local" name="fecha" value="${porDefecto}" required></label>
      </div>
      <label class="campo"><span class="campo__etiqueta">Tema</span>
        <input class="entrada" name="tema" maxlength="200" required placeholder="Ej.: Configuración básica de routers Cisco"></label>
      <label class="campo"><span class="campo__etiqueta">Indicaciones para la IA <span class="texto-suave">(opcional)</span></span>
        <textarea class="entrada" name="contexto" maxlength="600" rows="2" placeholder="Nivel del curso, herramientas que usan, enfoque que prefieres…"></textarea></label>
      <div class="fila fila--entre">
        <label class="fila" style="gap:.5rem"><span class="campo__etiqueta">Puntos por estilo</span>
          <select class="entrada" name="cantidad" style="width:auto;min-height:38px">
            <option value="5">5</option><option value="8" selected>8</option><option value="10">10</option>
          </select></label>
        <button type="submit" class="boton boton--primario">${icono("spark")}Generar y publicar</button>
      </div>
      <p class="ayuda">La IA crea cada punto en tres estilos (práctico, visual y analítico). Cada punto trae un paso a paso para quien va empezando, un reto para quien va adelantado y una pregunta de comprobación que ajusta el nivel de cada alumno. Podrás editar todo en «Administrar grupo».</p>
      <div class="progreso-ia" data-progreso hidden></div>
    </form>`;
}

async function publicarActividad(form) {
  const codigo = form.codigo.value;
  const tema = form.tema.value.trim();
  const fecha = form.fecha.value;
  const contexto = form.contexto.value.trim();
  const cantidad = Number(form.cantidad.value) || 10;
  const clase = clasePorCodigo(codigo);
  if (!esMia(clase)) return toast("Elige uno de tus grupos.", "error");
  if (!tema) return toast("Escribe el tema de la actividad.", "aviso");

  const boton = form.querySelector("button[type=submit]");
  const progreso = form.querySelector("[data-progreso]");
  const controles = [...form.elements];
  controles.forEach(c => c.disabled = true);
  boton.innerHTML = `<span class="spinner"></span>Generando…`;
  progreso.hidden = false;

  const estilos = Object.keys(ESTILOS);
  const pintarPaso = (estilo, estadoPaso, detalle = "") => {
    let el = progreso.querySelector(`[data-estilo="${estilo}"]`);
    if (!el) { el = document.createElement("div"); el.dataset.estilo = estilo; progreso.appendChild(el); }
    el.className = `progreso-ia__paso ${estadoPaso === "ok" ? "is-ok" : estadoPaso === "error" ? "is-error" : ""}`;
    el.innerHTML = `${estadoPaso === "cargando" ? '<span class="spinner"></span>' : icono(estadoPaso === "ok" ? "check" : "alert")}
      <span>Estilo ${ESTILOS[estilo].nombre.toLowerCase()}${detalle ? `: ${esc(detalle)}` : ""}</span>`;
  };
  progreso.innerHTML = "";
  estilos.forEach(e => pintarPaso(e, "cargando"));

  const generar = estilo => api("actividades", { tema, estilo, contexto, cantidad })
    .then(r => { pintarPaso(estilo, "ok", `${r.actividades.length} puntos`); return r.actividades; })
    .catch(err => { pintarPaso(estilo, "error", err.message); throw err; });

  let resultados;
  if (estadoIA?.secuencial) {
    // Proveedores con límite por minuto bajo (Groq): un estilo a la vez
    resultados = [];
    for (const e of estilos) resultados.push(await generar(e).then(value => ({ status: "fulfilled", value }), reason => ({ status: "rejected", reason })));
  } else {
    resultados = await Promise.allSettled(estilos.map(generar));
  }

  const fallidos = resultados.map((r, i) => r.status === "rejected" ? estilos[i] : null).filter(Boolean);
  const restaurar = () => {
    controles.forEach(c => c.disabled = false);
    boton.innerHTML = `${icono("spark")}Generar y publicar`;
  };

  if (fallidos.length) {
    const motivo = resultados.find(r => r.status === "rejected").reason.message;
    const todos = fallidos.length === estilos.length;
    const seguir = await confirmar({
      titulo: todos ? "La IA no pudo generar la actividad" : "Algunos perfiles no se generaron",
      mensaje: `${motivo}\n\n${todos
        ? "Puedes intentarlo de nuevo más tarde o publicar ahora una plantilla editable y completarla a mano."
        : `Faltan: ${fallidos.map(f => ESTILOS[f].nombre).join(", ")}. Puedes publicar con plantillas editables para esos perfiles.`}`,
      textoOk: "Publicar con plantilla editable"
    });
    if (!seguir) { restaurar(); return; }
  }

  const contenido = {};
  estilos.forEach((estilo, i) => {
    contenido[estilo] = resultados[i].status === "fulfilled" ? resultados[i].value : plantillaActividades(tema, cantidad);
  });

  const nuevoId = clase.modulos.reduce((max, m) => Math.max(max, Number(m.id) || 0), 0) + 1;
  clase.modulos.push({ id: nuevoId, titulo: tema, fechaLimite: fecha, contexto, creado: new Date().toISOString(), contenido });
  if (!guardarPlataforma()) { clase.modulos.pop(); restaurar(); return; }

  alumnosDeClase(codigo).forEach(a =>
    notificar(a.usuario, `Nueva actividad en ${clase.nombre}: «${tema}». Fecha límite: ${fmtFecha(fecha)}.`));

  toast(fallidos.length ? "Actividad publicada. Completa las plantillas pendientes en «Administrar grupo»." : `Actividad publicada en ${clase.nombre}.`, fallidos.length ? "aviso" : "exito");
  if (!$("#modal").hidden) cerrarModal(true);
  renderDocente();
}

function vistaGrupos() {
  fijarTitulo("Grupos", "Crea grupos y comparte el código con tus alumnos");
  const clases = clasesDocente();
  $("#contenido").innerHTML = `
    <section class="panel" style="margin-bottom:1.5rem">
      <div class="panel__cuerpo">
        <form class="fila" data-form="crear-grupo" style="align-items:flex-end">
          <label class="campo" style="flex:1;min-width:220px"><span class="campo__etiqueta">Nuevo grupo</span>
            <input class="entrada" name="nombre" maxlength="80" required placeholder="Ej.: 02SC151 Redes de computadoras"></label>
          <button type="submit" class="boton boton--primario">${icono("plus")}Crear grupo</button>
        </form>
      </div>
    </section>
    ${clases.length ? `<div class="grupos">${clases.map(c => {
      const alumnos = alumnosDeClase(c.codigo).length;
      const pend = ultimasEntregas(evidencias.filter(ev => ev.clase === c.codigo)).filter(ev => estadoDe(ev) === "pendiente").length;
      const reparto = { basico: 0, intermedio: 0, avanzado: 0 };
      alumnosDeClase(c.codigo).forEach(a => reparto[nivelAlumno(a.usuario, c.codigo).nivel]++);
      const dificil = puntoMasDificil(c);
      return `<article class="grupo">
        <div class="pila" style="gap:.5rem">
          <h3>${esc(c.nombre)}</h3>
          <div><button type="button" class="codigo-copiable" data-accion="copiar-codigo" data-codigo="${esc(c.codigo)}" title="Copiar código">${esc(c.codigo)}${icono("copy")}</button></div>
        </div>
        <div class="grupo__datos">
          <span><strong>${alumnos}</strong> alumno${alumnos === 1 ? "" : "s"}</span>
          <span><strong>${c.modulos.length}</strong> actividad${c.modulos.length === 1 ? "" : "es"}</span>
          <span><strong>${pend}</strong> por revisar</span>
        </div>
        ${alumnos ? `<div class="reparto" aria-label="Alumnos por nivel">
          <div class="reparto__barra">${ORDEN_NIVEL.map(n => reparto[n] ? `<span class="reparto__${n}" style="flex:${reparto[n]}"></span>` : "").join("")}</div>
          <div class="reparto__leyenda">${ORDEN_NIVEL.map(n => `<span><i class="reparto__${n}"></i>${NIVELES[n].nombre}: ${reparto[n]}</span>`).join("")}</div>
        </div>` : ""}
        ${dificil ? `<p class="dificil">${icono("alert")}<span>Punto con más errores: <strong>${esc(dificil.titulo)}</strong> (${dificil.porcentaje} % de aciertos). Conviene repasarlo en clase.</span></p>` : ""}
        <div class="fila">
          <button type="button" class="boton boton--primario boton--sm" data-accion="publicar-en" data-codigo="${esc(c.codigo)}">${icono("spark")}Publicar actividad</button>
          <button type="button" class="boton boton--secundario boton--sm" data-accion="administrar-grupo" data-codigo="${esc(c.codigo)}">${icono("edit")}Administrar</button>
        </div>
      </article>`;
    }).join("")}</div>` : `<div class="panel"><div class="vacio">
      <div class="vacio__icono">${icono("layers")}</div>
      <h3>Todavía no tienes grupos</h3>
      <p>Escribe el nombre de tu materia arriba. Se generará un código que tus alumnos usarán para inscribirse.</p>
    </div></div>`}`;
}

function crearGrupo(form) {
  const nombre = form.nombre.value.trim();
  if (!nombre) return;
  let codigo;
  do { codigo = `CLASE-${aleatorio(4, "0123456789")}`; } while (clasePorCodigo(codigo));
  plataforma.clases.push({ codigo, nombre, creador: sesion.usuario, materiales: [], modulos: [], creado: new Date().toISOString() });
  if (!guardarPlataforma()) { plataforma.clases.pop(); return; }
  toast(`Grupo creado. Código de inscripción: ${codigo}`);
  renderDocente();
}

function vistaEntregas() {
  fijarTitulo("Entregas", "Revisa y retroalimenta el trabajo de tus alumnos");
  const clases = clasesDocente();
  let lista = ultimasEntregas(evidenciasDocente());
  if (estado.filtroGrupo) lista = lista.filter(ev => ev.clase === estado.filtroGrupo);
  if (estado.filtroEstado) lista = lista.filter(ev => estadoDe(ev) === estado.filtroEstado);
  lista.sort((a, b) => String(b.fechaEntrega || "").localeCompare(String(a.fechaEntrega || "")));

  $("#contenido").innerHTML = `
    <section class="panel">
      <div class="panel__cabecera">
        <h2>${icono("inbox")}${lista.length} entrega${lista.length === 1 ? "" : "s"}</h2>
        <div class="filtros">
          <select class="entrada" data-filtro="grupo" aria-label="Filtrar por grupo">
            <option value="">Todos los grupos</option>
            ${clases.map(c => `<option value="${esc(c.codigo)}" ${estado.filtroGrupo === c.codigo ? "selected" : ""}>${esc(c.nombre)}</option>`).join("")}
          </select>
          <select class="entrada" data-filtro="estado" aria-label="Filtrar por estado">
            <option value="">Todos los estados</option>
            <option value="pendiente" ${estado.filtroEstado === "pendiente" ? "selected" : ""}>En revisión</option>
            <option value="aprobado" ${estado.filtroEstado === "aprobado" ? "selected" : ""}>Aprobadas</option>
            <option value="rechazado" ${estado.filtroEstado === "rechazado" ? "selected" : ""}>Requieren corrección</option>
          </select>
        </div>
      </div>
      ${lista.length ? `<div class="tabla-envoltura"><table class="tabla">
        <thead><tr><th>Alumno</th><th>Actividad</th><th>Entregado</th><th>Estado</th><th></th></tr></thead>
        <tbody>${lista.map(ev => {
          const clase = clasePorCodigo(ev.clase);
          const alumno = usuarios.find(u => u.usuario === ev.usuario);
          const titulo = tituloPunto(clase, ev.modulo, ev.punto, alumno?.estiloEstudiante || "practico");
          const modulo = clase?.modulos.find(m => m.id === ev.modulo);
          return `<tr>
            <td><div class="persona"><span class="avatar">${esc(iniciales(ev.alumno))}</span><div>${esc(ev.alumno || ev.usuario)}<small>${esc(clase?.nombre || ev.clase)}</small></div></div></td>
            <td>${esc(titulo)}<small class="texto-suave" style="display:block">${esc(modulo?.titulo || `Actividad ${ev.modulo}`)} · punto ${ev.punto}</small></td>
            <td style="white-space:nowrap">${esc(fmtFecha(ev.fechaEntrega, { dateStyle: "short", timeStyle: "short" }) || "—")}${ev.tarde ? `<br><span class="insignia insignia--peligro">Fuera de plazo</span>` : ""}</td>
            <td>${insigniaEstado(ev)}</td>
            <td class="tabla__acciones"><button type="button" class="boton ${estadoDe(ev) === "pendiente" ? "boton--primario" : "boton--secundario"} boton--sm" data-accion="revisar" data-id="${esc(ev.idUnico)}">${estadoDe(ev) === "pendiente" ? "Revisar" : "Ver"}</button></td>
          </tr>`;
        }).join("")}</tbody></table></div>` : `<div class="vacio">
          <div class="vacio__icono">${icono("inbox")}</div>
          <h3>${estado.filtroEstado === "pendiente" ? "No hay entregas por revisar" : "No hay entregas con estos filtros"}</h3>
          <p>Cuando un alumno suba una evidencia aparecerá aquí y recibirás una notificación.</p>
        </div>`}
    </section>`;
}

function abrirRevision(idUnico) {
  const ev = evidencias.find(e => e.idUnico === idUnico);
  if (!ev) return toast("No se encontró la entrega.", "error");
  const clase = clasePorCodigo(ev.clase);
  const alumno = usuarios.find(u => u.usuario === ev.usuario);
  const estilo = alumno?.estiloEstudiante || "practico";
  const modulo = clase?.modulos.find(m => m.id === ev.modulo);
  const act = modulo ? parsearActividad(puntosModulo(modulo, estilo)[ev.punto - 1], ev.punto - 1) : null;
  const historial = entregasDe(ev.usuario, ev.clase, ev.modulo, ev.punto);
  const url = blobDesdeDataURL(ev.archivoBase64);
  const niv = nivelAlumno(ev.usuario, ev.clase);
  const ep = estadoPregunta(ev.usuario, ev.clase, ev.modulo, ev.punto);

  abrirModal({
    titulo: `Entrega de ${ev.alumno}`,
    ancho: true,
    cuerpo: `
      <div class="disposicion" style="grid-template-columns:minmax(0,1.4fr) minmax(0,1fr)">
        <div class="pila">
          ${ev.tipoArchivo === "pdf"
            ? `<iframe class="vista-previa" src="${esc(url)}" title="Evidencia en PDF"></iframe>`
            : `<img class="vista-previa" src="${esc(url)}" alt="Evidencia entregada por ${esc(ev.alumno)}">`}
          <a class="enlace" href="${esc(url)}" target="_blank" rel="noopener" download="${esc(ev.nombreArchivo || `evidencia-${ev.usuario}.${ev.tipoArchivo === "pdf" ? "pdf" : "png"}`)}">Descargar archivo</a>
        </div>
        <div class="pila">
          <div class="pila" style="gap:.3rem">
            <span class="texto-suave">${esc(clase?.nombre || ev.clase)} · ${esc(modulo?.titulo || "")} · punto ${ev.punto} · estilo ${esc(ESTILOS[estilo]?.nombre.toLowerCase() || estilo)}</span>
            <h3 style="font-size:1.1rem">${esc(act?.titulo || "Actividad")}</h3>
            <div class="fila">${insigniaEstado(ev)}${ev.tarde ? `<span class="insignia insignia--peligro">Fuera de plazo</span>` : ""}
              <span class="texto-suave">${esc(fmtFecha(ev.fechaEntrega) || "")}</span></div>
          </div>
          <div class="ficha-alumno">
            <span class="insignia insignia--nivel-${niv.nivel}">Nivel ${esc(NIVELES[niv.nivel].nombre.toLowerCase())}</span>
            ${niv.dominio != null ? `<span class="texto-suave">Dominio ${Math.round(niv.dominio * 100)} %</span>` : ""}
            ${act?.pregunta ? `<span class="texto-suave">· Comprobación: ${ep ? (ep.primerIntento ? "acertó al primer intento" : ep.resuelta ? `acertó en ${ep.intentos} intentos` : `${ep.intentos} intento${ep.intentos === 1 ? "" : "s"} sin acertar`) : "sin responder"}</span>` : ""}
          </div>
          ${act?.tarea ? `<div class="bloque bloque--tarea"><h4>Tarea asignada</h4><div class="md">${md(act.tarea)}</div></div>` : ""}
          ${historial.length > 1 ? `<p class="texto-suave">Esta es la entrega ${historial.indexOf(ev) + 1} de ${historial.length} para este punto.</p>` : ""}
          <label class="campo"><span class="campo__etiqueta">Comentario para el alumno</span>
            <textarea class="entrada" id="comentario-revision" rows="5" placeholder="Qué hizo bien y qué debe corregir…">${esc(ev.comentarioDocente || "")}</textarea>
            <span class="ayuda">Obligatorio si pides corrección.</span></label>
        </div>
      </div>`,
    pie: `<button type="button" class="boton boton--peligro" data-accion="calificar" data-id="${esc(ev.idUnico)}" data-resultado="rechazado">${icono("alert")}Pedir corrección</button>
          <button type="button" class="boton boton--primario" data-accion="calificar" data-id="${esc(ev.idUnico)}" data-resultado="aprobado">${icono("check")}Aprobar</button>`
  });
}

function calificar(idUnico, resultado) {
  const ev = evidencias.find(e => e.idUnico === idUnico);
  if (!ev) return;
  const comentario = $("#comentario-revision").value.trim();
  if (resultado === "rechazado" && !comentario) {
    $("#comentario-revision").focus();
    return toast("Escribe qué debe corregir el alumno antes de pedir corrección.", "aviso");
  }
  ev.estado = resultado === "aprobado" ? "Aprobado" : "Rechazado";
  ev.comentarioDocente = comentario;
  ev.fechaRevision = new Date().toISOString();
  if (!guardarEvidencias()) return;

  const clase = clasePorCodigo(ev.clase);
  const alumno = usuarios.find(u => u.usuario === ev.usuario);
  const titulo = tituloPunto(clase, ev.modulo, ev.punto, alumno?.estiloEstudiante || "practico");
  notificar(ev.usuario, resultado === "aprobado"
    ? `Tu entrega «${titulo}» fue aprobada${comentario ? `: «${comentario.slice(0, 120)}»` : "."}`
    : `Tu entrega «${titulo}» requiere corrección: «${comentario.slice(0, 160)}»`);

  revisarCambioNivel(ev.usuario, ev.clase);
  cerrarModal(true);
  toast(resultado === "aprobado" ? "Entrega aprobada. El alumno fue notificado." : "Corrección solicitada. El alumno fue notificado.");
  renderDocente();
}

function vistaAlumnos() {
  fijarTitulo("Alumnos", "Nivel y avance de cada alumno en tus grupos");
  const clases = clasesDocente();
  let filas = filasAlumnoGrupo();
  if (estado.filtroGrupo) filas = filas.filter(f => f.clase.codigo === estado.filtroGrupo);
  filas.sort((a, b) => (necesitaApoyo(b.niv) - necesitaApoyo(a.niv)) || ((a.niv.dominio ?? 1) - (b.niv.dominio ?? 1)));

  $("#contenido").innerHTML = `<section class="panel">
    <div class="panel__cabecera">
      <h2>${icono("users")}${filas.length} inscripci${filas.length === 1 ? "ón" : "ones"}</h2>
      <div class="filtros"><select class="entrada" data-filtro="grupo-alumnos" aria-label="Filtrar por grupo">
        <option value="">Todos los grupos</option>
        ${clases.map(c => `<option value="${esc(c.codigo)}" ${estado.filtroGrupo === c.codigo ? "selected" : ""}>${esc(c.nombre)}</option>`).join("")}
      </select></div>
    </div>
    <p class="ayuda" style="padding:.9rem 1.25rem 0">El nivel se calcula solo con las preguntas de comprobación y las entregas revisadas. Si conoces mejor a un alumno, fíjalo a mano: verá el contenido de ese nivel.</p>
    ${filas.length ? `<div class="tabla-envoltura"><table class="tabla">
      <thead><tr><th>Alumno</th><th>Grupo</th><th>Nivel</th><th>Dominio</th><th>Aciertos</th><th>Avance</th></tr></thead>
      <tbody>${filas.map(({ alumno: a, clase, niv, prog }) => {
        const dom = niv.dominio != null ? Math.round(niv.dominio * 100) : null;
        return `<tr>
          <td><div class="persona"><span class="avatar">${esc(iniciales(a.nombre))}</span><div>${esc(a.nombre)}
            <small>${esc(a.usuario)} · estilo ${esc(ESTILOS[a.estiloEstudiante]?.nombre.toLowerCase() || "sin diagnóstico")}</small></div></div>
            ${necesitaApoyo(niv) ? `<span class="insignia insignia--peligro" style="margin-top:.35rem">Necesita apoyo</span>` : ""}</td>
          <td>${esc(clase.nombre)}</td>
          <td><select class="entrada selector-nivel" data-nivel-manual data-usuario="${esc(a.usuario)}" data-codigo="${esc(clase.codigo)}" aria-label="Nivel de ${esc(a.nombre)}">
              <option value="" ${niv.manual ? "" : "selected"}>Automático: ${esc(NIVELES[niv.automatico].nombre)}</option>
              ${ORDEN_NIVEL.map(n => `<option value="${n}" ${niv.manual === n ? "selected" : ""}>Fijar en ${NIVELES[n].nombre.toLowerCase()}</option>`).join("")}
            </select></td>
          <td style="min-width:130px">${dom != null ? `<div class="fila" style="gap:.5rem;flex-wrap:nowrap"><div class="barra-pasos barra-dominio" style="flex:1"><span style="width:${dom}%"></span></div><span class="texto-suave">${dom}%</span></div>` : `<span class="texto-suave">Sin datos aún</span>`}</td>
          <td>${niv.preguntas ? `${Math.round(niv.precision * 100)} %<small class="texto-suave" style="display:block">${niv.preguntas} pregunta${niv.preguntas === 1 ? "" : "s"}</small>` : `<span class="texto-suave">—</span>`}</td>
          <td>${prog.porcentaje} %<small class="texto-suave" style="display:block">${prog.entregados}/${prog.total} entregas</small></td>
        </tr>`;
      }).join("")}</tbody></table></div>` : `<div class="vacio">
        <div class="vacio__icono">${icono("users")}</div>
        <h3>Aún no hay alumnos inscritos</h3>
        <p>Comparte el código de tus grupos. Los alumnos lo escriben al iniciar sesión o desde «Unirme a un grupo».</p>
      </div>`}
  </section>`;
}

function fijarNivelManual(select) {
  const cuenta = usuarios.find(u => u.usuario === select.dataset.usuario);
  const clase = clasePorCodigo(select.dataset.codigo);
  if (!cuenta || !esMia(clase)) return;
  cuenta.nivelManual = cuenta.nivelManual || {};
  if (select.value) cuenta.nivelManual[clase.codigo] = select.value;
  else delete cuenta.nivelManual[clase.codigo];
  guardarUsuarios();
  revisarCambioNivel(cuenta.usuario, clase.codigo);
  toast(select.value
    ? `${cuenta.nombre} verá el contenido de nivel ${NIVELES[select.value].nombre.toLowerCase()} en ${clase.nombre}.`
    : `El nivel de ${cuenta.nombre} vuelve a ajustarse automáticamente.`);
  vistaAlumnos();
}

/* ---------- Administrar grupo ---------- */
function abrirAdministrar(codigo) {
  const clase = clasePorCodigo(codigo);
  if (!esMia(clase)) return;
  cerrarMenuMovil();

  const actividades = clase.modulos.map(mod => `
    <div class="editor-item">
      <div class="fila fila--entre">
        <strong>${esc(mod.titulo)}</strong>
        <div class="fila">
          <button type="button" class="boton boton--secundario boton--sm" data-accion="editar-modulo" data-codigo="${esc(codigo)}" data-id="${mod.id}">${icono("edit")}Editar contenido</button>
          <button type="button" class="boton boton--peligro boton--sm" data-accion="eliminar-modulo" data-codigo="${esc(codigo)}" data-id="${mod.id}" aria-label="Eliminar actividad">${icono("trash")}</button>
        </div>
      </div>
      <div class="fila">
        <label class="fila" style="gap:.5rem"><span class="campo__etiqueta">Fecha límite</span>
          <input class="entrada" type="datetime-local" style="width:auto;min-height:36px" value="${esc(mod.fechaLimite || "")}" data-fecha-modulo="${mod.id}"></label>
        <button type="button" class="boton boton--secundario boton--sm" data-accion="guardar-fecha" data-codigo="${esc(codigo)}" data-id="${mod.id}">Guardar fecha</button>
      </div>
    </div>`).join("");

  const materiales = clase.materiales.map(mat => `
    <div class="material" style="padding:.6rem 0">
      <span class="material__icono">${icono(mat.tipo === "youtube" ? "play" : mat.tipo === "enlace" ? "link" : mat.tipo === "imagen" ? "image" : "file")}</span>
      <span class="material__titulo">${esc(mat.titulo)}</span>
      <button type="button" class="boton boton--peligro boton--sm" data-accion="eliminar-material" data-codigo="${esc(codigo)}" data-id="${esc(mat.id)}" aria-label="Eliminar material">${icono("trash")}</button>
    </div>`).join("");

  abrirModal({
    titulo: clase.nombre,
    ancho: true,
    cuerpo: `
      <div class="pila" style="gap:1.75rem">
        <div class="fila fila--entre">
          <div class="fila"><span class="texto-suave">Código de inscripción</span>
            <button type="button" class="codigo-copiable" data-accion="copiar-codigo" data-codigo="${esc(codigo)}">${esc(codigo)}${icono("copy")}</button></div>
          <button type="button" class="boton boton--primario boton--sm" data-accion="publicar-en" data-codigo="${esc(codigo)}">${icono("spark")}Publicar actividad</button>
        </div>

        <section class="pila">
          <h3 style="font-size:1rem">Actividades</h3>
          ${actividades || `<p class="texto-suave">Aún no hay actividades publicadas en este grupo.</p>`}
        </section>

        <section class="pila">
          <h3 style="font-size:1rem">Material de apoyo</h3>
          <div>${materiales || `<p class="texto-suave">Sin materiales. Agrega PDFs, imágenes, videos o enlaces para tus alumnos.</p>`}</div>
          <form class="pila" data-form="material" data-codigo="${esc(codigo)}" style="gap:.75rem">
            <div class="rejilla-2">
              <label class="campo"><span class="campo__etiqueta">Tipo</span>
                <select class="entrada" name="tipo">
                  <option value="archivo">Archivo (PDF o imagen)</option>
                  <option value="youtube">Video de YouTube</option>
                  <option value="enlace">Enlace web</option>
                </select></label>
              <label class="campo"><span class="campo__etiqueta">Título</span>
                <input class="entrada" name="titulo" maxlength="120" placeholder="Ej.: Guía de laboratorio 1"></label>
            </div>
            <label class="campo" data-campo="url" hidden><span class="campo__etiqueta">Dirección (URL)</span>
              <input class="entrada" name="url" type="url" placeholder="https://"></label>
            <label class="campo" data-campo="archivo"><span class="campo__etiqueta">Archivo (máx. ${MAX_ARCHIVO_MB} MB)</span>
              <input class="entrada" name="archivo" type="file" accept="application/pdf,image/png,image/jpeg,image/webp"></label>
            <div><button type="submit" class="boton boton--secundario">${icono("plus")}Agregar material</button></div>
          </form>
        </section>

        <section class="pila" style="padding-top:1.25rem;border-top:1px solid var(--linea)">
          <div class="fila fila--entre">
            <div><strong>Eliminar grupo</strong><p class="texto-suave">Borra el grupo, sus actividades y todas las entregas. No se puede deshacer.</p></div>
            <button type="button" class="boton boton--peligro" data-accion="eliminar-grupo" data-codigo="${esc(codigo)}">${icono("trash")}Eliminar grupo</button>
          </div>
        </section>
      </div>`
  });
}

function abrirEditorModulo(codigo, modId, estiloSel = "practico") {
  const clase = clasePorCodigo(codigo);
  const mod = clase?.modulos.find(m => m.id === modId);
  if (!esMia(clase) || !mod) return;
  const items = (mod.contenido[estiloSel] || []).map((it, i) => {
    const a = parsearActividad(it, i);
    return `<div class="editor-item" data-indice="${i}">
      <label class="campo"><span class="campo__etiqueta">Punto ${i + 1} · título</span><input class="entrada" name="titulo" value="${esc(a.titulo)}"></label>
      <label class="campo"><span class="campo__etiqueta">Explicación</span><textarea class="entrada" name="explicacion">${esc(a.explicacion)}</textarea></label>
      <label class="campo"><span class="campo__etiqueta">Ejemplo <span class="texto-suave">(admite bloques de código con \`\`\`)</span></span><textarea class="entrada" name="ejemplo" style="font-family:var(--fuente-mono);font-size:.84rem">${esc(a.ejemplo)}</textarea></label>
      <label class="campo"><span class="campo__etiqueta">Tarea</span><textarea class="entrada" name="tarea">${esc(a.tarea)}</textarea></label>
      <div class="rejilla-2">
        <label class="campo"><span class="campo__etiqueta">Paso a paso <span class="texto-suave">(lo ven abierto los de nivel básico)</span></span><textarea class="entrada" name="apoyo">${esc(a.apoyo)}</textarea></label>
        <label class="campo"><span class="campo__etiqueta">Reto <span class="texto-suave">(destacado para nivel avanzado)</span></span><textarea class="entrada" name="reto">${esc(a.reto)}</textarea></label>
      </div>
      <fieldset class="editor-pregunta">
        <legend class="campo__etiqueta">Pregunta de comprobación <span class="texto-suave">(ajusta el nivel automáticamente; déjala vacía si no quieres usarla)</span></legend>
        <input class="entrada" name="p-enunciado" placeholder="Enunciado" value="${esc(a.pregunta?.enunciado || "")}">
        <textarea class="entrada" name="p-opciones" rows="4" placeholder="Una opción por línea (mínimo 3)">${esc((a.pregunta?.opciones || []).join("\n"))}</textarea>
        <div class="rejilla-2">
          <label class="campo"><span class="campo__etiqueta">Respuesta correcta</span>
            <select class="entrada" name="p-correcta">${[0, 1, 2, 3, 4].map(k => `<option value="${k}" ${a.pregunta?.correcta === k ? "selected" : ""}>Opción ${k + 1}</option>`).join("")}</select></label>
          <label class="campo"><span class="campo__etiqueta">Por qué es correcta</span><input class="entrada" name="p-explicacion" value="${esc(a.pregunta?.explicacion || "")}"></label>
        </div>
      </fieldset>
    </div>`;
  }).join("");

  abrirModal({
    titulo: `Editar: ${mod.titulo}`,
    ancho: true,
    cuerpo: `
      <div class="editor-estilos" role="tablist">
        ${Object.entries(ESTILOS).map(([k, v]) => `<button type="button" class="boton boton--sm ${k === estiloSel ? "boton--primario" : "boton--secundario"}" data-accion="editor-estilo" data-codigo="${esc(codigo)}" data-id="${modId}" data-estilo="${k}">Estilo ${v.nombre.toLowerCase()}</button>`).join("")}
      </div>
      <p class="ayuda" style="margin-bottom:1rem">Los cambios de cada perfil se guardan por separado. Guarda antes de cambiar de perfil.</p>
      <form id="form-editor">${items || `<p class="texto-suave">Este perfil no tiene puntos.</p>`}</form>`,
    pie: `<button type="button" class="boton boton--fantasma" data-accion="administrar-grupo" data-codigo="${esc(codigo)}">Volver</button>
          <button type="button" class="boton boton--primario" data-accion="guardar-editor" data-codigo="${esc(codigo)}" data-id="${modId}" data-estilo="${estiloSel}">Guardar cambios</button>`
  });
}

function guardarEditor(codigo, modId, estilo) {
  const clase = clasePorCodigo(codigo);
  const mod = clase?.modulos.find(m => m.id === modId);
  if (!esMia(clase) || !mod) return;
  const valor = (el, n) => el.querySelector(`[name="${n}"]`).value.trim();
  let error = null;
  const nuevos = $$("#form-editor .editor-item").map((el, i) => {
    const enunciado = valor(el, "p-enunciado");
    const opciones = valor(el, "p-opciones").split("\n").map(o => o.trim()).filter(Boolean);
    const correcta = Number(valor(el, "p-correcta"));
    let pregunta = null;
    if (enunciado || opciones.length) {
      if (!enunciado || opciones.length < 3) error = error || `Punto ${i + 1}: la pregunta necesita enunciado y al menos 3 opciones.`;
      else if (correcta >= opciones.length) error = error || `Punto ${i + 1}: la respuesta correcta apunta a una opción que no existe.`;
      else pregunta = { enunciado, opciones, correcta, explicacion: valor(el, "p-explicacion") };
    }
    return {
      titulo: valor(el, "titulo"), explicacion: valor(el, "explicacion"), ejemplo: valor(el, "ejemplo"),
      tarea: valor(el, "tarea"), apoyo: valor(el, "apoyo"), reto: valor(el, "reto"), pregunta
    };
  });
  if (error) return toast(error, "aviso");
  mod.contenido[estilo] = nuevos;
  if (guardarPlataforma()) toast(`Estilo ${ESTILOS[estilo].nombre.toLowerCase()} guardado.`);
}

async function agregarMaterial(form) {
  const codigo = form.dataset.codigo;
  const clase = clasePorCodigo(codigo);
  if (!esMia(clase)) return;
  const tipo = form.tipo.value;
  let titulo = form.titulo.value.trim();

  if (tipo === "archivo") {
    const archivo = form.archivo.files?.[0];
    if (!archivo) return toast("Elige un archivo.", "aviso");
    if (!/^(application\/pdf|image\/(png|jpeg|webp))$/.test(archivo.type)) return toast("Solo se admiten PDF o imágenes PNG, JPG o WebP.", "error");
    if (archivo.size > MAX_ARCHIVO_MB * 1048576) return toast(`El archivo supera ${MAX_ARCHIVO_MB} MB.`, "error");
    const base64 = await new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => res(null); r.readAsDataURL(archivo); });
    if (!base64) return toast("No se pudo leer el archivo.", "error");
    clase.materiales.push({ id: uid("mat"), titulo: titulo || archivo.name, tipo: archivo.type === "application/pdf" ? "pdf" : "imagen", contenido: base64 });
  } else {
    const url = urlSegura(form.url.value);
    if (!url) return toast("Escribe una dirección válida que empiece con https://", "aviso");
    if (tipo === "youtube" && !idYoutube(url)) return toast("Ese enlace no parece ser un video de YouTube.", "aviso");
    clase.materiales.push({ id: uid("mat"), titulo: titulo || (tipo === "youtube" ? "Video" : new URL(url).hostname), tipo, contenido: url });
  }
  if (!guardarPlataforma()) { clase.materiales.pop(); return; }
  alumnosDeClase(codigo).forEach(a => notificar(a.usuario, `Nuevo material en ${clase.nombre}: «${clase.materiales.at(-1).titulo}».`));
  toast("Material agregado.");
  abrirAdministrar(codigo);
}

function verArchivo(titulo, dataUrl, tipo) {
  const url = blobDesdeDataURL(dataUrl);
  abrirModal({
    titulo,
    ancho: true,
    cuerpo: tipo === "pdf"
      ? `<iframe class="vista-previa" src="${esc(url)}" title="${esc(titulo)}"></iframe>`
      : `<img class="vista-previa" src="${esc(url)}" alt="${esc(titulo)}">`,
    pie: `<a class="boton boton--secundario" href="${esc(url)}" target="_blank" rel="noopener">Abrir en otra pestaña</a>`
  });
}

/* =========================================================
   11. Eventos (delegación)
   ========================================================= */
async function manejarAccion(el, e) {
  const { accion, codigo, id } = el.dataset;
  const idNum = Number(id);

  switch (accion) {
    /* Generales */
    case "cerrar-modal": return cerrarModal();
    case "cerrar-modal-forzado": return cerrarModal(true);
    case "cerrar-sesion": return cerrarSesion();
    case "configurar-ia": return abrirConfigIA();
    case "revisar-ia": {
      el.disabled = true;
      await comprobarIA(true);
      const caja = $("#estado-config");
      if (caja) caja.innerHTML = htmlEstadoConfig(); else abrirConfigIA();
      el.disabled = false;
      return;
    }
    case "abrir-menu": return $("#vista-app").classList.add("menu-abierto");
    case "cerrar-menu": return cerrarMenuMovil();
    case "ir-login": return irALoginConCredenciales();
    case "copiar-credenciales": {
      const c = $("#credenciales").dataset;
      return copiar(`Usuario: ${c.usuario}\nContraseña: ${c.password}`, "Credenciales copiadas.");
    }
    case "leer-notif": {
      const n = notificaciones.find(x => x.id === id);
      if (n) { n.leida = true; guardarNotificaciones(); actualizarContadorNotif(); renderNotificaciones(); }
      return;
    }
    case "leer-todas":
      notificaciones.forEach(n => { if (n.usuario === sesion.usuario) n.leida = true; });
      guardarNotificaciones(); actualizarContadorNotif(); renderNotificaciones();
      return;
    case "activar-archivo":
      if (e.type === "keydown") { e.preventDefault(); document.getElementById(el.getAttribute("for"))?.click(); }
      return;

    /* Alumno */
    case "cambiar-grupo": return cambiarGrupo(codigo);
    case "ver-modulo":
      estado.moduloActualId = idNum;
      cerrarMenuMovil();
      renderAlumno();
      $("#zona-modulo")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    case "repetir-diagnostico": return abrirDiagnostico();
    case "ir-punto": return irAPunto(Number(el.dataset.modulo), Number(el.dataset.indice));
    case "preguntar-tutor": return pedirAyudaTutor(Number(el.dataset.modulo), Number(el.dataset.punto));
    case "sugerencia": return enviarChat(el.textContent);
    case "ver-evidencia": {
      const ev = evidencias.find(x => x.idUnico === id);
      return ev && verArchivo(`Tu entrega · punto ${ev.punto}`, ev.archivoBase64, ev.tipoArchivo);
    }
    case "ver-material": {
      const mat = clasePorCodigo(el.dataset.clase)?.materiales.find(m => m.id === id);
      return mat && verArchivo(mat.titulo, mat.contenido, mat.tipo);
    }

    /* Docente */
    case "vista-docente":
      estado.vistaDocente = el.dataset.vista;
      cerrarMenuMovil();
      renderDocente();
      $("#contenido").focus({ preventScroll: true });
      return window.scrollTo({ top: 0 });
    case "copiar-codigo": return copiar(codigo, `Código ${codigo} copiado.`);
    case "administrar-grupo": return abrirAdministrar(codigo);
    case "publicar-en":
      return abrirModal({ titulo: "Publicar actividad con IA", ancho: true, cuerpo: htmlFormPublicar(codigo) });
    case "revisar": return abrirRevision(id);
    case "calificar": return calificar(id, el.dataset.resultado);
    case "editar-modulo": return abrirEditorModulo(codigo, idNum);
    case "editor-estilo": return abrirEditorModulo(codigo, idNum, el.dataset.estilo);
    case "guardar-editor": return guardarEditor(codigo, idNum, el.dataset.estilo);
    case "guardar-fecha": {
      const mod = clasePorCodigo(codigo)?.modulos.find(m => m.id === idNum);
      const valor = $(`[data-fecha-modulo="${idNum}"]`)?.value;
      if (!mod || !valor) return toast("Elige una fecha válida.", "aviso");
      mod.fechaLimite = valor;
      if (guardarPlataforma()) {
        alumnosDeClase(codigo).forEach(a => notificar(a.usuario, `La fecha límite de «${mod.titulo}» cambió a ${fmtFecha(valor)}.`));
        toast("Fecha límite actualizada.");
      }
      return;
    }
    case "eliminar-modulo": {
      const clase = clasePorCodigo(codigo);
      const mod = clase?.modulos.find(m => m.id === idNum);
      if (!mod) return;
      const ok = await confirmar({ titulo: "Eliminar actividad", mensaje: `Se eliminará «${mod.titulo}» y sus entregas. Esta acción no se puede deshacer.`, textoOk: "Eliminar actividad", peligro: true });
      if (!ok) return abrirAdministrar(codigo);
      clase.modulos = clase.modulos.filter(m => m.id !== idNum);
      evidencias = evidencias.filter(ev => !(ev.clase === codigo && ev.modulo === idNum));
      guardarPlataforma(); guardarEvidencias();
      toast("Actividad eliminada.");
      renderDocente();
      return abrirAdministrar(codigo);
    }
    case "eliminar-material": {
      const clase = clasePorCodigo(codigo);
      clase.materiales = clase.materiales.filter(m => m.id !== id);
      guardarPlataforma();
      toast("Material eliminado.");
      return abrirAdministrar(codigo);
    }
    case "eliminar-grupo": {
      const clase = clasePorCodigo(codigo);
      const ok = await confirmar({ titulo: "Eliminar grupo", mensaje: `Se eliminará «${clase.nombre}» con todas sus actividades y entregas. Los alumnos dejarán de verlo. No se puede deshacer.`, textoOk: "Eliminar grupo", peligro: true });
      if (!ok) return abrirAdministrar(codigo);
      plataforma.clases = plataforma.clases.filter(c => c.codigo !== codigo);
      evidencias = evidencias.filter(ev => ev.clase !== codigo);
      usuarios.forEach(u => { if (u.gruposInscritos) u.gruposInscritos = u.gruposInscritos.filter(g => g !== codigo); });
      guardarPlataforma(); guardarEvidencias(); guardarUsuarios();
      toast("Grupo eliminado.");
      return renderDocente();
    }
  }
}

function conectarEventos() {
  // Pestañas de acceso
  $$("[data-auth-tab]").forEach(b => b.addEventListener("click", () => cambiarTabAuth(b.dataset.authTab)));
  $("#form-login").addEventListener("submit", alEnviarLogin);
  $("#form-registro").addEventListener("submit", alEnviarRegistro);
  $$("input[name=login-rol]").forEach(r => r.addEventListener("change", actualizarCampoCodigo));
  ["#login-usuario", "#login-password", "#login-codigo"].forEach(s => $(s).addEventListener("input", () => { $("#error-login").hidden = true; }));
  ["#reg-nombre", "#reg-correo"].forEach(s => $(s).addEventListener("input", () => { $("#error-registro").hidden = true; }));

  // Notificaciones
  $("#btn-notif").addEventListener("click", e => { e.stopPropagation(); alternarNotificaciones(); });

  // Clics con data-accion
  document.addEventListener("click", e => {
    const panel = $("#notif-panel");
    if (!panel.hidden && !e.target.closest(".notif")) alternarNotificaciones(false);
    const el = e.target.closest("[data-accion]");
    if (!el || el.matches("input[type=file]") || el.dataset.accion === "activar-archivo") return;
    manejarAccion(el, e);
  });

  // Teclado
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      if (!$("#modal").hidden) cerrarModal();
      else alternarNotificaciones(false);
    }
    const el = e.target.closest?.("[data-accion=activar-archivo]");
    if (el && (e.key === "Enter" || e.key === " ")) manejarAccion(el, e);
    if (e.target.matches?.(".chat__form textarea") && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.target.form.requestSubmit();
    }
  });

  // Formularios
  document.addEventListener("submit", e => {
    const form = e.target.closest("[data-form]");
    if (!form) return;
    e.preventDefault();
    switch (form.dataset.form) {
      case "unirse": return unirseAGrupo(form);
      case "chat": {
        const texto = form.pregunta.value;
        form.pregunta.value = "";
        form.pregunta.style.height = "";
        return enviarChat(texto);
      }
      case "publicar": return publicarActividad(form);
      case "crear-grupo": return crearGrupo(form);
      case "material": return agregarMaterial(form);
      case "config-ia": return guardarClaveIA(form);
      case "pregunta": return responderPregunta(form);
    }
  });

  // Cambios
  document.addEventListener("change", e => {
    const t = e.target;
    if (t.matches("input[type=file][data-accion=subir-evidencia]")) return subirEvidencia(t);
    if (t.matches("[data-filtro=grupo]")) { estado.filtroGrupo = t.value; return vistaEntregas(); }
    if (t.matches("[data-filtro=estado]")) { estado.filtroEstado = t.value; return vistaEntregas(); }
    if (t.matches("[data-filtro=grupo-alumnos]")) { estado.filtroGrupo = t.value; return vistaAlumnos(); }
    if (t.matches("[data-nivel-manual]")) return fijarNivelManual(t);
    if (t.matches("[data-proveedor-ia]")) {
      $("#pasos-proveedor").innerHTML = htmlPasosProveedor(t.value);
      t.form.clave.placeholder = PROVEEDORES_IA[t.value].prefijo;
    }
    if (t.matches("[data-form=material] [name=tipo]")) {
      const form = t.form;
      form.querySelector("[data-campo=url]").hidden = t.value === "archivo";
      form.querySelector("[data-campo=archivo]").hidden = t.value !== "archivo";
    }
  });

  // Auto-altura del cuadro de chat
  document.addEventListener("input", e => {
    if (e.target.matches(".chat__form textarea")) {
      e.target.style.height = "auto";
      e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
    }
  });

  // Recordar actividades abiertas
  document.addEventListener("toggle", e => {
    const d = e.target;
    if (!d.matches?.(".actividad")) return;
    d.open ? estado.abiertas.add(d.dataset.clave) : estado.abiertas.delete(d.dataset.clave);
  }, true);

  // Sincronizar entre pestañas (p. ej. docente y alumno abiertos a la vez)
  window.addEventListener("storage", e => {
    if (!Object.values(CLAVES).includes(e.key)) return;
    cargarDatos();
    if (!sesion) return mostrarAuth();
    actualizarContadorNotif();
    if ($("#modal").hidden) renderTodo();
  });
}

/* =========================================================
   12. Inicio
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  cargarDatos();
  conectarEventos();
  actualizarCampoCodigo();
  if (sesion && usuarioActual()) mostrarApp(); else mostrarAuth();
});
