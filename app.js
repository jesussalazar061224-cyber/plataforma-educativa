/**
 * Plataforma Educativa Adaptativa Completa (Soporte PNG, JPG, PDF + Panel Jerárquico Editable)
 */

// Dejamos la clave vacía para no exponer secretos en GitHub
const OPENROUTER_API_KEY = ""; 

let usuariosRegistradosDB = JSON.parse(localStorage.getItem("usuarios_registrados_db")) || [
    {
        correo: "profe@admin.com",
        nombre: "Profesor Evaluador",
        usuario: "admin",
        password: "123",
        rol: "docente"
    }
];

let baseDatosPlataforma = JSON.parse(localStorage.getItem("bd_plataforma_evidencias")) || {
    clases: [
        {
            codigo: "CLASE-DEMO",
            nombre: "Clase Demostración de Programación",
            modulos: [
                {
                    id: 1,
                    titulo: "Lógica y Variables",
                    contenido: {
                        practico: [
                            "1. 🛠️ **Reto de Código:** Declara una variable `nombre` con tu nombre.",
                            "2. 💻 **Práctica:** Usa `console.log` para mostrar un saludo.",
                            "3. 🛠️ **Mutabilidad:** Modifica el valor de una variable `let`.",
                            "4. 💻 **Tipos:** Crea un número, un texto y un booleano.",
                            "5. 🛠️ **Concatenación:** Une dos variables en un mensaje.",
                            "6. 💻 **Aritmética:** Calcula el doble de una variable numérica.",
                            "7. 🛠️ **Depuración:** Corrige una variable declarada con error.",
                            "8. 🛠️ **Scope:** Comprueba el alcance de una variable local.",
                            "9. 🛠️ **Mini-Reto:** Diseña un registro de usuario básico.",
                            "10. 💻 **Cierre:** Ejecuta tu script completo."
                        ],
                        visual: [
                            "1. 🎨 **Esquema:** Visualiza la variable como una caja rotulada.",
                            "2. 👁️ **Memoria:** Observa el almacenamiento en RAM.",
                            "3. 🎨 **Mapa Mental:** Conecta variables con la vida real.",
                            "4. 👁️ **Infografía:** Datos primitivos vs complejos.",
                            "5. 🎨 **Metáfora:** Tuberías de datos.",
                            "6. 👁️ **Diagrama:** El signo `=` como asignación.",
                            "7. 🎨 **Alcance:** Zonas permitidas y prohibidas.",
                            "8. 👁️ **Pila:** Gestión de Stack local.",
                            "9. 🎨 **Conceptual:** Resumen gráfico de lógica.",
                            "10. 👁️ **Cierre:** Infografía final."
                        ],
                        analitico: [
                            "1. 📚 **Definición:** Identificador simbólico de memoria.",
                            "2. 📖 **Taxonomía:** Tipos de datos formales.",
                            "3. 📚 **Análisis:** Reglas de nomenclatura.",
                            "4. 📖 **Técnico:** Memoria estática vs dinámica.",
                            "5. 📚 **Teoría:** Hoisting y alcance léxico.",
                            "6. 📖 **Estudio:** Referencia vs valor.",
                            "7. 📚 **Complejidad:** Costo computacional.",
                            "8. 📖 **Clean Code:** Inmutabilidad.",
                            "9. 📚 **Ensayo:** Variables en paradigmas modernos.",
                            "10. 📖 **Evaluación:** Cuestionario teórico."
                        ]
                    }
                }
            ]
        }
    ]
};

let evidenciasEstudiantes = JSON.parse(localStorage.getItem("evidencias_alumnos_db")) || [];
if (!Array.isArray(evidenciasEstudiantes)) {
    evidenciasEstudiantes = Object.values(evidenciasEstudiantes);
}

let sesionActual = JSON.parse(localStorage.getItem("sesion_usuario_activo")) || null;
let moduloActualId = 1;

document.addEventListener("DOMContentLoaded", () => {
    configurarTabsLoginRegistro();
    configurarRegistros();
    configurarRolesLogin();
    verificarSesion();
});

function configurarTabsLoginRegistro() {
    const btnIngresar = document.getElementById("btn-tab-ingresar");
    const btnRegAlumno = document.getElementById("btn-tab-reg-alumno");
    const btnRegDocente = document.getElementById("btn-tab-reg-docente");
    
    const formLogin = document.getElementById("form-login");
    const formRegAlumno = document.getElementById("form-registro-alumno");
    const formRegDocente = document.getElementById("form-registro-docente");
    const cardCredenciales = document.getElementById("card-credenciales-generadas");

    if (!btnIngresar || !btnRegAlumno || !btnRegDocente) return;

    btnIngresar.onclick = (e) => {
        e.preventDefault();
        btnIngresar.className = "font-bold text-indigo-400 border-b-2 border-indigo-500 pb-1 cursor-pointer";
        btnRegAlumno.className = "font-bold text-slate-400 hover:text-white pb-1 cursor-pointer";
        btnRegDocente.className = "font-bold text-slate-400 hover:text-white pb-1 cursor-pointer";
        
        formLogin.classList.remove("hidden");
        formRegAlumno.classList.add("hidden");
        formRegDocente.classList.add("hidden");
        cardCredenciales.classList.add("hidden");
    };

    btnRegAlumno.onclick = (e) => {
        e.preventDefault();
        btnRegAlumno.className = "font-bold text-indigo-400 border-b-2 border-indigo-500 pb-1 cursor-pointer";
        btnIngresar.className = "font-bold text-slate-400 hover:text-white pb-1 cursor-pointer";
        btnRegDocente.className = "font-bold text-slate-400 hover:text-white pb-1 cursor-pointer";
        
        formRegAlumno.classList.remove("hidden");
        formLogin.classList.add("hidden");
        formRegDocente.classList.add("hidden");
        cardCredenciales.classList.add("hidden");
    };

    btnRegDocente.onclick = (e) => {
        e.preventDefault();
        btnRegDocente.className = "font-bold text-indigo-400 border-b-2 border-indigo-500 pb-1 cursor-pointer";
        btnIngresar.className = "font-bold text-slate-400 hover:text-white pb-1 cursor-pointer";
        btnRegAlumno.className = "font-bold text-slate-400 hover:text-white pb-1 cursor-pointer";
        
        formRegDocente.classList.remove("hidden");
        formLogin.classList.add("hidden");
        formRegAlumno.classList.add("hidden");
        cardCredenciales.classList.add("hidden");
    };

    const btnIrIngresar = document.getElementById("btn-ir-a-ingresar");
    if (btnIrIngresar) {
        btnIrIngresar.onclick = (e) => {
            e.preventDefault();
            btnIngresar.click();
        };
    }
}

function configurarRegistros() {
    const formRegAlumno = document.getElementById("form-registro-alumno");
    if (formRegAlumno) {
        formRegAlumno.onsubmit = (e) => {
            e.preventDefault();
            const correo = document.getElementById("reg-correo-alumno").value.trim().toLowerCase();
            const nombre = document.getElementById("reg-nombre-alumno").value.trim();

            if (usuariosRegistradosDB.some(u => u.correo === correo)) {
                alert("⚠️ Este correo ya está registrado.");
                return;
            }

            const usuarioGen = `user_${Math.floor(1000 + Math.random() * 9000)}`;
            const passGen = `pass_${Math.floor(1000 + Math.random() * 9000)}`;

            usuariosRegistradosDB.push({
                correo, nombre, usuario: usuarioGen, password: passGen, rol: "alumno", testRealizado: false, estiloEstudiante: "practico"
            });
            localStorage.setItem("usuarios_registrados_db", JSON.stringify(usuariosRegistradosDB));

            mostrarCredencialesGeneradas(usuarioGen, passGen, "alumno");
        };
    }

    const formRegDocente = document.getElementById("form-registro-docente");
    if (formRegDocente) {
        formRegDocente.onsubmit = (e) => {
            e.preventDefault();
            const correo = document.getElementById("reg-correo-docente").value.trim().toLowerCase();
            const nombre = document.getElementById("reg-nombre-docente").value.trim();

            if (usuariosRegistradosDB.some(u => u.correo === correo)) {
                alert("⚠️ Este correo institucional ya está registrado.");
                return;
            }

            const usuarioGen = `doc_${Math.floor(1000 + Math.random() * 9000)}`;
            const passGen = `prof_${Math.floor(1000 + Math.random() * 9000)}`;

            usuariosRegistradosDB.push({
                correo, nombre, usuario: usuarioGen, password: passGen, rol: "docente"
            });
            localStorage.setItem("usuarios_registrados_db", JSON.stringify(usuariosRegistradosDB));

            mostrarCredencialesGeneradas(usuarioGen, passGen, "docente");
        };
    }
}

function mostrarCredencialesGeneradas(user, pass, rol) {
    document.getElementById("cred-user").innerText = user;
    document.getElementById("cred-pass").innerText = pass;

    document.getElementById("login-usuario").value = user;
    document.getElementById("login-password").value = pass;
    document.getElementById("login-rol").value = rol;

    document.getElementById("form-registro-alumno").classList.add("hidden");
    document.getElementById("form-registro-docente").classList.add("hidden");
    document.getElementById("card-credenciales-generadas").classList.remove("hidden");
}

function configurarRolesLogin() {
    const selectRol = document.getElementById("login-rol");
    const grupoCodigo = document.getElementById("grupo-codigo-clase");
    const inputCodigo = document.getElementById("login-codigo");

    if (!selectRol) return;

    selectRol.onchange = () => {
        if (selectRol.value === "docente") {
            grupoCodigo.classList.add("hidden");
            inputCodigo.removeAttribute("required");
        } else {
            grupoCodigo.classList.remove("hidden");
            inputCodigo.setAttribute("required", "true");
        }
    };
}

function verificarSesion() {
    const modalLogin = document.getElementById("modal-login");
    const modalTest = document.getElementById("modal-test");
    const panelDocente = document.getElementById("panel-docente");
    const txtUsuario = document.getElementById("usuario-actual-txt");
    const txtClase = document.getElementById("clase-actual-txt");
    const badgePerfil = document.getElementById("contenedor-perfil-badge");

    if (!sesionActual) {
        modalLogin.classList.remove("hidden");
        configurarEnvioLogin();
    } else {
        modalLogin.classList.add("hidden");
        txtUsuario.innerText = `${sesionActual.nombre} (${sesionActual.usuario})`;
        txtClase.innerText = sesionActual.codigoClase || "PANEL DOCENTE";

        if (sesionActual.rol === "docente") {
            badgePerfil.classList.add("hidden");
            panelDocente.classList.remove("hidden");
            configurarAccionesDocente();
            renderAlumnosRegistradosDocente();
            renderBuzonEvidenciasPorClaseDocente();
            renderEstructuraClasesDocente();
            document.getElementById("titulo-modulo").innerText = "Panel del Profesor";
            document.getElementById("contenido-adaptativo").innerHTML = `<p class="text-xs text-slate-300">Bienvenido Profesor. Administra tus clases, revisa tus alumnos, evalúa evidencias y modifica las actividades asignadas por IA.</p>`;
        } else {
            badgePerfil.classList.remove("hidden");
            panelDocente.classList.add("hidden");

            const alumnoInfo = usuariosRegistradosDB.find(u => u.usuario === sesionActual.usuario);
            if (alumnoInfo && !alumnoInfo.testRealizado) {
                modalTest.classList.remove("hidden");
                configurarTestDiagnostico();
            } else {
                sesionActual.estiloEstudiante = alumnoInfo ? alumnoInfo.estiloEstudiante : "practico";
                iniciarVistaAlumno();
            }
        }
    }

    document.getElementById("btn-cambiar-usuario").onclick = () => {
        localStorage.removeItem("sesion_usuario_activo");
        location.reload();
    };
}

function configurarEnvioLogin() {
    const formLogin = document.getElementById("form-login");
    if (!formLogin) return;

    formLogin.onsubmit = (e) => {
        e.preventDefault();
        const rol = document.getElementById("login-rol").value;
        const userInput = document.getElementById("login-usuario").value.trim();
        const passInput = document.getElementById("login-password").value.trim();

        let usuarioValido = usuariosRegistradosDB.find(u => u.rol === rol && (u.usuario === userInput || u.correo === userInput) && u.password === passInput);

        if (!usuarioValido) {
            alert("❌ Usuario, contraseña o rol incorrectos. Verifica tus credenciales.");
            return;
        }

        if (rol === "docente") {
            sesionActual = { rol: "docente", nombre: usuarioValido.nombre, usuario: usuarioValido.usuario, codigoClase: "DOCENTE" };
            localStorage.setItem("sesion_usuario_activo", JSON.stringify(sesionActual));
            location.reload();
        } else {
            const codigoClase = document.getElementById("login-codigo").value.trim().toUpperCase();
            const claseEncontrada = baseDatosPlataforma.clases.find(c => c.codigo === codigoClase);
            
            if (!claseEncontrada) {
                alert("❌ El código de clase no existe. Pídele un código válido a tu profesor.");
                return;
            }

            sesionActual = { 
                rol: "alumno", 
                nombre: usuarioValido.nombre, 
                usuario: usuarioValido.usuario, 
                codigoClase, 
                estiloEstudiante: usuarioValido.estiloEstudiante || "practico" 
            };
            localStorage.setItem("sesion_usuario_activo", JSON.stringify(sesionActual));
            location.reload();
        }
    };
}

function configurarTestDiagnostico() {
    const formTest = document.getElementById("form-test");
    const modalTest = document.getElementById("modal-test");

    formTest.onsubmit = (e) => {
        e.preventDefault();
        const p1 = document.querySelector('input[name="p1"]:checked').value;
        const p2 = document.querySelector('input[name="p2"]:checked').value;

        let estilo = "practico";
        if (p1 === "visual" || p2 === "visual") estilo = "visual";
        if (p1 === "analitico" || p2 === "analitico") estilo = "analitico";

        sesionActual.estiloEstudiante = estilo;

        const alumnoDB = usuariosRegistradosDB.find(u => u.usuario === sesionActual.usuario);
        if (alumnoDB) {
            alumnoDB.estiloEstudiante = estilo;
            alumnoDB.testRealizado = true;
            localStorage.setItem("usuarios_registrados_db", JSON.stringify(usuariosRegistradosDB));
        }

        localStorage.setItem("sesion_usuario_activo", JSON.stringify(sesionActual));
        modalTest.classList.add("hidden");
        iniciarVistaAlumno();
    };
}

function iniciarVistaAlumno() {
    document.getElementById("perfil-activo-txt").innerText = sesionActual.estiloEstudiante.toUpperCase();
    renderModulosAlumno();
    actualizarContenidoAlumno();
    configurarChat();
}

function renderModulosAlumno() {
    const contenedor = document.getElementById("lista-modulos");
    const clase = baseDatosPlataforma.clases.find(c => c.codigo === sesionActual.codigoClase);
    if (!contenedor || !clase) return;

    contenedor.innerHTML = "";
    clase.modulos.forEach(mod => {
        const card = document.createElement("div");
        const esActivo = mod.id === moduloActualId;
        
        card.className = `modulo-card p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 cursor-pointer hover:border-indigo-500/50 transition-all ${
            esActivo ? 'border-indigo-500 bg-slate-800/90 shadow-lg' : ''
        }`;
        card.onclick = () => {
            moduloActualId = mod.id;
            renderModulosAlumno();
            actualizarContenidoAlumno();
        };

        card.innerHTML = `
            <div class="flex items-center justify-between">
                <span class="text-sm font-medium ${esActivo ? 'text-white' : 'text-slate-300'}">${mod.titulo}</span>
                <span class="text-xs text-slate-500">Mód ${mod.id}</span>
            </div>
        `;
        contenedor.appendChild(card);
    });
    actualizarBarraProgresoAutomatica();
}

function actualizarBarraProgresoAutomatica() {
    const clase = baseDatosPlataforma.clases.find(c => c.codigo === sesionActual.codigoClase);
    if (!clase) return;

    let totalPuntos = 0;
    let puntosSubidos = 0;

    clase.modulos.forEach(mod => {
        const estilo = sesionActual.estiloEstudiante || "practico";
        const puntos = mod.contenido[estilo] || mod.contenido.practico;
        totalPuntos += puntos.length;

        puntos.forEach((_, index) => {
            const tieneEntrega = evidenciasEstudiantes.some(ev => 
                ev && ev.usuario === sesionActual.usuario && 
                ev.clase === sesionActual.codigoClase && 
                ev.modulo === mod.id && 
                ev.punto === (index + 1)
            );
            if (tieneEntrega) puntosSubidos++;
        });
    });

    const porcentaje = totalPuntos > 0 ? Math.round((puntosSubidos / totalPuntos) * 100) : 0;
    document.getElementById("barra-progreso").style.width = `${porcentaje}%`;
    document.getElementById("puntos-completados").innerText = puntosSubidos;
    document.getElementById("porcentaje-texto").innerText = `${porcentaje}%`;
}

function actualizarContenidoAlumno() {
    const clase = baseDatosPlataforma.clases.find(c => c.codigo === sesionActual.codigoClase);
    if (!clase) return;

    const modulo = clase.modulos.find(m => m.id === moduloActualId) || clase.modulos[0];
    if (!modulo) return;

    document.getElementById("tag-modulo").innerText = `Módulo ${modulo.id}`;
    document.getElementById("titulo-modulo").innerText = modulo.titulo;

    const estilo = sesionActual.estiloEstudiante || "practico";
    const puntos = modulo.contenido[estilo] || modulo.contenido.practico;

    let html = `<div class="text-xs text-indigo-400 font-semibold mb-3">📌 Plan de 10 puntos adaptado (${estilo.toUpperCase()}):</div>`;
    html += `<div class="space-y-4 max-h-[380px] overflow-y-auto pr-2">`;

    puntos.forEach((puntuacionTexto, index) => {
        const entregasPunto = evidenciasEstudiantes.filter(ev => 
            ev && ev.usuario === sesionActual.usuario && 
            ev.clase === sesionActual.codigoClase && 
            ev.modulo === modulo.id && 
            ev.punto === (index + 1)
        );
        const tieneEvidencia = entregasPunto.length > 0;
        const ultimaEvidencia = tieneEvidencia ? entregasPunto[entregasPunto.length - 1] : null;

        html += `
            <div class="p-4 bg-slate-900/90 rounded-xl border border-slate-800 text-xs space-y-2">
                <div class="text-slate-200 font-medium leading-relaxed">${puntuacionTexto}</div>
                <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                    <div>
                        ${tieneEvidencia 
                            ? `<span class="text-emerald-400 font-semibold">✓ ${entregasPunto.length} Archivo(s) Subido(s)</span> <span class="text-slate-400 text-[10px]">(${ultimaEvidencia.estado || 'En revisión'})</span>` 
                            : `<span class="text-amber-400 font-semibold">⏳ Pendiente de entrega</span>`}
                    </div>
                    <div class="flex items-center gap-2">
                        <input type="file" accept="image/png, image/jpeg, application/pdf" id="file-${modulo.id}-${index}" class="hidden" onchange="subirEvidencia(event, ${modulo.id}, ${index})">
                        <label for="file-${modulo.id}-${index}" class="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg cursor-pointer transition text-[11px] font-medium">
                            📁 ${tieneEvidencia ? '+ Agregar Archivo (PNG/JPG/PDF)' : 'Subir PNG, JPG o PDF'}
                        </label>
                        ${tieneEvidencia ? `<button type="button" onclick="verEvidenciaPorId('${ultimaEvidencia.idUnico}')" class="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg transition text-[11px]">Ver Último</button>` : ''}
                    </div>
                </div>
            </div>
        `;
    });
    html += `</div>`;

    document.getElementById("contenido-adaptativo").innerHTML = html;
}

function subirEvidencia(event, modId, puntoIndex) {
    const archivo = event.target.files[0];
    if (!archivo) return;

    const esImagen = archivo.type === "image/png" || archivo.type === "image/jpeg";
    const esPdf = archivo.type === "application/pdf";

    if (!esImagen && !esPdf) {
        alert("⚠️ Solo se permiten archivos en formato PNG, JPG o PDF.");
        return;
    }

    const lector = new FileReader();
    lector.onload = function(uploadevento) {
        const base64File = uploadevento.target.result;
        
        if (!Array.isArray(evidenciasEstudiantes)) {
            evidenciasEstudiantes = [];
        }

        evidenciasEstudiantes.push({
            idUnico: 'ev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
            alumno: sesionActual.nombre,
            usuario: sesionActual.usuario,
            clase: sesionActual.codigoClase,
            modulo: modId,
            punto: puntoIndex + 1,
            archivoBase64: base64File,
            tipoArchivo: esPdf ? 'pdf' : 'imagen',
            estado: "Pendiente"
        });

        localStorage.setItem("evidencias_alumnos_db", JSON.stringify(evidenciasEstudiantes));
        alert("✅ Archivo subido correctamente y registrado en el buzón.");
        actualizarContenidoAlumno();
        actualizarBarraProgresoAutomatica();
    };
    lector.readAsDataURL(archivo);
}

function verEvidenciaPorId(idUnico) {
    const ev = evidenciasEstudiantes.find(item => item && item.idUnico === idUnico);
    if (!ev) return;
    
    const ventana = window.open("");
    if (ev.tipoArchivo === 'pdf') {
        ventana.document.write(`<iframe src="${ev.archivoBase64}" style="width:100%; height:100vh; border:none;"></iframe>`);
    } else {
        ventana.document.write(`<img src="${ev.archivoBase64}" style="max-width:100%;"/>`);
    }
}

function evaluarEvidenciaPorId(idUnico, calificacion) {
    const ev = evidenciasEstudiantes.find(item => item && item.idUnico === idUnico);
    if (ev) {
        ev.estado = calificacion;
        localStorage.setItem("evidencias_alumnos_db", JSON.stringify(evidenciasEstudiantes));
        alert(`Evidencia actualizada a: ${calificacion}`);
        renderBuzonEvidenciasPorClaseDocente();
    }
}

function configurarAccionesDocente() {
    const formClase = document.getElementById("form-crear-clase");
    if (!formClase) return;

    formClase.onsubmit = (e) => {
        e.preventDefault();
        const nombre = document.getElementById("input-nombre-clase").value.trim();
        const codigoUnico = `CLASE-${Math.floor(1000 + Math.random() * 9000)}`;

        baseDatosPlataforma.clases.push({ codigo: codigoUnico, nombre: nombre, modulos: [] });
        localStorage.setItem("bd_plataforma_evidencias", JSON.stringify(baseDatosPlataforma));
        
        document.getElementById("txt-codigo-generado").innerText = codigoUnico;
        document.getElementById("resultado-codigo-clase").classList.remove("hidden");
        document.getElementById("input-nombre-clase").value = "";
        alert(`¡Clase Creada! Código: ${codigoUnico}`);
        renderBuzonEvidenciasPorClaseDocente();
        renderEstructuraClasesDocente();
    };

    const formTema = document.getElementById("form-nuevo-tema");
    formTema.onsubmit = async (e) => {
        e.preventDefault();
        const codigo = document.getElementById("input-codigo-asociado").value.trim().toUpperCase();
        const tituloTema = document.getElementById("input-titulo-tema").value.trim();

        const clase = baseDatosPlataforma.clases.find(c => c.codigo === codigo);
        if (!clase) {
            alert("❌ Código de clase no encontrado.");
            return;
        }

        alert("✨ Generando 10 puntos con IA...");
        const nuevoId = clase.modulos.length + 1;
        const pPractico = await generarPuntosIA(tituloTema, "practico");
        const pVisual = await generarPuntosIA(tituloTema, "visual");
        const pAnalitico = await generarPuntosIA(tituloTema, "analitico");

        clase.modulos.push({ id: nuevoId, titulo: tituloTema, contenido: { practico: pPractico, visual: pVisual, analitico: pAnalitico } });
        localStorage.setItem("bd_plataforma_evidencias", JSON.stringify(baseDatosPlataforma));
        document.getElementById("input-titulo-tema").value = "";
        document.getElementById("input-codigo-asociado").value = "";
        alert("¡Módulo agregado correctamente!");
        renderEstructuraClasesDocente();
    };
}

function renderAlumnosRegistradosDocente() {
    const contenedor = document.getElementById("contenedor-alumnos-registrados");
    if (!contenedor) return;

    const alumnos = usuariosRegistradosDB.filter(u => u.rol === "alumno");
    if (alumnos.length === 0) {
        contenedor.innerHTML = `<p class="text-slate-400 text-xs">Aún no hay alumnos registrados.</p>`;
        return;
    }

    let html = "";
    alumnos.forEach(a => {
        html += `
            <div class="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs flex justify-between items-center">
                <div>
                    <strong class="text-white">${a.nombre}</strong> <span class="text-slate-400">(${a.correo})</span>
                </div>
                <div class="font-mono text-[11px] text-slate-300">
                    User: <span class="text-indigo-400">${a.usuario}</span> | Pass: <span class="text-amber-400">${a.password}</span>
                </div>
            </div>
        `;
    });
    contenedor.innerHTML = html;
}

function renderEstructuraClasesDocente() {
    let contenedorEstructura = document.getElementById("contenedor-estructura-docente");
    if (!contenedorEstructura) {
        const panelDocente = document.getElementById("panel-docente");
        if (!panelDocente) return;
        contenedorEstructura = document.createElement("div");
        contenedorEstructura.id = "contenedor-estructura-docente";
        contenedorEstructura.className = "mt-6 space-y-4";
        panelDocente.appendChild(contenedorEstructura);
    }

    const clases = baseDatosPlataforma.clases;
    if (clases.length === 0) {
        contenedorEstructura.innerHTML = `<p class="text-slate-400 text-xs">No hay clases registradas.</p>`;
        return;
    }

    let html = `
        <div class="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
            <h3 class="text-white font-semibold text-sm flex items-center gap-2">📂 Estructura General de Clases, Temas y Actividades</h3>
            <p class="text-slate-400 text-xs">Aquí puedes visualizar y modificar directamente el contenido de las actividades generadas.</p>
            <div class="space-y-3 max-h-[400px] overflow-y-auto pr-1">
    `;

    clases.forEach(clase => {
        html += `
            <div class="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                <div class="flex justify-between items-center border-b border-slate-800 pb-2">
                    <div>
                        <strong class="text-indigo-400 text-xs">${clase.nombre}</strong> 
                        <span class="text-slate-400 font-mono text-[11px]">(${clase.codigo})</span>
                    </div>
                    <span class="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">${clase.modulos.length} Tema(s)</span>
                </div>
                <div class="space-y-2 pl-2">
        `;

        if (clase.modulos.length === 0) {
            html += `<p class="text-slate-500 text-[11px]">No hay temas creados en esta clase.</p>`;
        } else {
            clase.modulos.forEach(mod => {
                html += `
                    <div class="bg-slate-900/80 p-2.5 rounded border border-slate-800 space-y-1.5">
                        <div class="text-white font-medium text-xs flex justify-between items-center">
                            <span>📌 Módulo ${mod.id}: ${mod.titulo}</span>
                        </div>
                        <div class="space-y-1 pl-2 text-[11px] text-slate-300">
                `;

                ['practico', 'visual', 'analitico'].forEach(estilo => {
                    const acts = mod.contenido[estilo] || [];
                    html += `
                        <div class="text-indigo-300 font-semibold mt-1 uppercase text-[10px]">Estilo: ${estilo}</div>
                    `;
                    acts.forEach((actText, actIndex) => {
                        html += `
                            <div class="flex items-center gap-2 bg-slate-950 p-1.5 rounded border border-slate-800/60 my-1">
                                <span class="text-slate-400 font-mono text-[10px]">#${actIndex + 1}</span>
                                <input type="text" id="input-act-${clase.codigo}-${mod.id}-${estilo}-${actIndex}" value="${actText.replace(/"/g, '&quot;')}" class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-[11px] focus:outline-none focus:border-indigo-500">
                                <button type="button" onclick="guardarCambioActividad('${clase.codigo}', ${mod.id}, '${estilo}', ${actIndex})" class="bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded text-[10px] whitespace-nowrap">Guardar</button>
                            </div>
                        `;
                    });
                });

                html += `
                        </div>
                    </div>
                `;
            });
        }

        html += `
                </div>
            </div>
        `;
    });

    html += `
            </div>
        </div>
    `;

    contenedorEstructura.innerHTML = html;
}

function guardarCambioActividad(codigoClase, modId, estilo, actIndex) {
    const inputEl = document.getElementById(`input-act-${codigoClase}-${modId}-${estilo}-${actIndex}`);
    if (!inputEl) return;

    const nuevoTexto = inputEl.value.trim();
    const clase = baseDatosPlataforma.clases.find(c => c.codigo === codigoClase);
    if (!clase) return;

    const modulo = clase.modulos.find(m => m.id === modId);
    if (!modulo || !modulo.contenido[estilo]) return;

    modulo.contenido[estilo][actIndex] = nuevoTexto;
    localStorage.setItem("bd_plataforma_evidencias", JSON.stringify(baseDatosPlataforma));
    alert("✅ Actividad modificada y guardada correctamente.");
    renderEstructuraClasesDocente();
}

function renderBuzonEvidenciasPorClaseDocente() {
    const contenedor = document.getElementById("contenedor-clases-buzon");
    if (!contenedor) return;

    const clases = baseDatosPlataforma.clases;
    if (clases.length === 0) {
        contenedor.innerHTML = `<p class="text-slate-400 text-xs">No hay clases creadas.</p>`;
        return;
    }

    if (!Array.isArray(evidenciasEstudiantes)) {
        evidenciasEstudiantes = Object.values(evidenciasEstudiantes || {});
    }

    let html = "";
    clases.forEach(clase => {
        const listaEvidenciasClase = evidenciasEstudiantes.filter(ev => {
            if (!ev || !ev.clase) return false;
            return ev.clase.trim().toUpperCase() === clase.codigo.trim().toUpperCase();
        });

        html += `
            <div class="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                <button type="button" onclick="toggleTablaClase('${clase.codigo}')" class="w-full p-3 bg-slate-900/90 hover:bg-slate-800/80 flex justify-between items-center text-left cursor-pointer transition">
                    <div>
                        <strong class="text-white text-xs">${clase.nombre}</strong> 
                        <span class="text-indigo-400 font-mono text-[11px]">(${clase.codigo})</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded text-[10px] font-semibold">${listaEvidenciasClase.length} archivo(s)</span>
                        <span id="flecha-${clase.codigo}" class="text-slate-400 text-xs">▼</span>
                    </div>
                </button>

                <div id="tabla-clase-${clase.codigo}" class="hidden p-3 bg-slate-950/60 border-t border-slate-800 overflow-x-auto">
                    ${listaEvidenciasClase.length === 0 ? `
                        <p class="text-slate-400 text-xs text-center py-2">No hay archivos entregados en esta clase todavía.</p>
                    ` : `
                        <table class="w-full text-left text-xs text-slate-300">
                            <thead>
                                <tr class="border-b border-slate-800 text-slate-400">
                                    <th class="pb-2">Alumno</th>
                                    <th class="pb-2">Actividad / Tipo</th>
                                    <th class="pb-2">Estado</th>
                                    <th class="pb-2 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-800/60">
                    `}
        `;

        listaEvidenciasClase.forEach(ev => {
            const idKey = ev.idUnico;
            const nombreUsuario = ev.usuario || 'Alumno';
            const etiquetaTipo = ev.tipoArchivo === 'pdf' ? '📄 PDF' : '🖼️ Img';
            
            html += `
                                <tr class="hover:bg-slate-900/50">
                                    <td class="py-2 pr-2 font-medium text-white">${ev.alumno || 'Sin nombre'} <span class="text-slate-400 text-[10px]">(${nombreUsuario})</span></td>
                                    <td class="py-2 pr-2">Mód ${ev.modulo} - Punto ${ev.punto} <span class="ml-1 text-[10px] text-indigo-400">${etiquetaTipo}</span></td>
                                    <td class="py-2 pr-2">
                                        <span class="px-2 py-0.5 rounded text-[10px] font-semibold ${ev.estado && ev.estado.includes('Aprobado') ? 'bg-emerald-500/20 text-emerald-300' : ev.estado && ev.estado.includes('Rechazado') ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'}">
                                            ${ev.estado || 'Pendiente'}
                                        </span>
                                    </td>
                                    <td class="py-2 text-right space-x-1 whitespace-nowrap">
                                        <button type="button" onclick="verEvidenciaPorId('${idKey}')" class="bg-slate-800 hover:bg-slate-700 text-white px-2 py-1 rounded text-[11px]">Ver Archivo</button>
                                        <button type="button" onclick="evaluarEvidenciaPorId('${idKey}', 'Aprobado 🌟')" class="bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded text-[11px]">Aprobar</button>
                                        <button type="button" onclick="evaluarEvidenciaPorId('${idKey}', 'Rechazado ⚠️')" class="bg-rose-600 hover:bg-rose-500 text-white px-2 py-1 rounded text-[11px]">Rechazar</button>
                                    </td>
                                </tr>
            `;
        });

        if (listaEvidenciasClase.length > 0) {
            html += `
                            </tbody>
                        </table>
                    `;
        }

        html += `
                </div>
            </div>
        `;
    });

    contenedor.innerHTML = html;
}

function toggleTablaClase(codigoClase) {
    const tabla = document.getElementById(`tabla-clase-${codigoClase}`);
    const flecha = document.getElementById(`flecha-${codigoClase}`);
    if (tabla.classList.contains("hidden")) {
        tabla.classList.remove("hidden");
        flecha.innerText = "▲";
    } else {
        tabla.classList.add("hidden");
        flecha.innerText = "▼";
    }
}

async function generarPuntosIA(tema, estilo) {
    if (!OPENROUTER_API_KEY) {
        return Array.from({length: 10}, (_, i) => `${i+1}. Punto para ${tema} (${estilo})`);
    }
    try {
        const url = "https://openrouter.ai/api/v1/chat/completions";
        const prompt = `Crea exactamente 10 puntos de aprendizaje secuenciales sobre el tema "${tema}" adaptados al estilo "${estilo.toUpperCase()}". Devuelve cada punto en una línea separada comenzando con el número del 1 al 10.`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${OPENROUTER_API_KEY}` },
            body: JSON.stringify({ model: "openrouter/free", messages: [{ role: "user", content: prompt }] })
        });
        const data = await response.json();
        if (data.choices && data.choices[0].message) {
            return data.choices[0].message.content.split("\n").filter(l => l.trim() !== "").slice(0, 10);
        }
    } catch (err) { console.error(err); }
    return Array.from({length: 10}, (_, i) => `${i+1}. Punto para ${tema} (${estilo})`);
}

function configurarChat() {
    const chatForm = document.getElementById("chat-form");
    if (!chatForm) return;

    chatForm.onsubmit = async (e) => {
        e.preventDefault();
        const input = document.getElementById("chat-input");
        const mensaje = input.value.trim();
        if (!mensaje) return;

        agregarMensajeChat("Usuario", mensaje);
        input.value = "";
        const idCarga = agregarMensajeChat("Tutor IA", "🤖 Analizando...");

        try {
            const respuesta = await consultarOpenRouterAPI(mensaje, sesionActual.estiloEstudiante);
            actualizarMensajeChat(idCarga, "Tutor IA", respuesta);
        } catch (err) {
            actualizarMensajeChat(idCarga, "Tutor IA", "⚠️ Error de conexión.");
        }
    };
}

async function consultarOpenRouterAPI(pregunta, estilo) {
    if (!OPENROUTER_API_KEY) {
        return "Para usar las respuestas en vivo de OpenRouter debes configurar tu API Key de forma privada.";
    }
    const url = "https://openrouter.ai/api/v1/chat/completions";
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${OPENROUTER_API_KEY}` },
        body: JSON.stringify({
            model: "openrouter/free",
            messages: [{ role: "system", content: `Tutor IA experto en estilo ${estilo}.` }, { role: "user", content: pregunta }]
        })
    });
    const data = await response.json();
    return data.choices && data.choices[0].message ? data.choices[0].message.content : "Sin respuesta.";
}

let contadorMensajes = 0;
function agregarMensajeChat(autor, texto) {
    const chatBox = document.getElementById("chat-box");
    if (!chatBox) return;
    const msgDiv = document.createElement("div");
    msgDiv.id = `msg-${contadorMensajes++}`;
    const esUsuario = autor === "Usuario";
    msgDiv.className = esUsuario ? "bg-indigo-600/35 p-3 rounded-xl text-slate-100 max-w-[85%] ml-auto text-right text-xs" : "bg-slate-900 p-3 rounded-xl text-slate-300 max-w-[85%] text-xs";
    msgDiv.innerHTML = `<strong class="${esUsuario ? 'text-indigo-300' : 'text-emerald-400'}">${autor}:</strong> ${texto}`;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return msgDiv.id;
}

function actualizarMensajeChat(msgId, autor, texto) {
    const msgDiv = document.getElementById(msgId);
    if (!msgDiv) return;
    msgDiv.innerHTML = `<strong class="${autor === 'Usuario' ? 'text-indigo-300' : 'text-emerald-400'}">${autor}:</strong> ${texto}`;
}