/**
 * Plataforma Educativa Adaptativa Completa (Comentarios de Retroalimentación al Rechazar, Modal y Gestión)
 */

const OPENROUTER_API_KEY = "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"; 

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
            creador: "admin",
            materiales: [],
            modulos: [
                {
                    id: 1,
                    titulo: "Lógica y Variables",
                    contenido: {
                        practico: [
                            "Reto de Código | Una variable es un espacio reservado en la memoria RAM del equipo que funciona como una 'caja' con nombre propio. Nos permite almacenar valores que podrán cambiar o ser consultados a lo largo de la ejecución. | Ejemplo: Si escribes `let puntaje = 10;`, estás creando una caja llamada 'puntaje' y guardando el número 10. | Declara una variable llamada `nombreUsuario` y asígnale tu propio nombre utilizando comillas.",
                            "Práctica en Consola | La consola del navegador o del entorno de desarrollo es la herramienta fundamental que nos permite imprimir resultados visuales, verificar datos y detectar errores en tiempo real. | Ejemplo: Al ejecutar `console.log('Hola Mundo');`, la consola procesa el texto y muestra el mensaje en pantalla. | Utiliza la instrucción `console.log` para mostrar un mensaje de bienvenida personalizado en la consola.",
                            "Mutabilidad | En programación, la palabra clave `let` define una variable mutable, lo que significa que su contenido inicial puede ser modificado o actualizado cuantas veces sea necesario. | Ejemplo: Si declaras `let vidas = 3;` y el usuario pierde una partida, puedes actualizar el valor escribiendo `vidas = 2;`. | Modifica el valor de una variable `let` previamente declarada asignándole un nuevo resultado.",
                            "Tipos de Datos Primitivos | Los datos primitivos son los bloques de construcción más elementales. Incluyen textos (strings), números (numbers) y booleanos (booleans para verdadero o falso). | Ejemplo: `let nombre = 'Ana';`, `let edad = 20;`, y `let esMayor = true;`. | Crea tres variables independientes que contengan un número, un texto y un booleano.",
                            "Concatenación | La concatenación es el proceso mediante el cual unimos dos o más cadenas de texto o combinamos textos con variables para formar mensajes dinámicos. | Ejemplo: Si `let user = 'Carlos';`, al escribir `let saludo = 'Bienvenido ' + user;` obtendremos 'Bienvenido Carlos'. | Diseña un script que una dos variables de texto diferentes en un solo mensaje impreso.",
                            "Aritmética Básica | Los lenguajes permiten realizar cálculos matemáticos directos utilizando operadores estándar como `+`, `-`, `*` y `/` aplicados sobre variables numéricas. | Ejemplo: Si `let precio = 50;` y `let descuento = 10;`, puedes calcular el total escribiendo `let total = precio - descuento;`. | Calcula el doble de una variable numérica dada utilizando multiplicación.",
                            "Depuración de Errores | La depuración consiste en analizar el código paso a paso para localizar fallos sintácticos (como olvidar un punto y coma `;`) y corregirlos para que el programa compile. | Ejemplo: Si olvidas cerrar una línea, el intérprete arrojará un error; agregando el símbolo faltante el programa vuelve a funcionar. | Localiza y corrige un error sintáctico intencional en la declaración de una variable.",
                            "Scope o Alcance | El alcance léxico determina la zona de visibilidad de una variable declarada dentro de bloques específicos o funciones, protegiéndola de conflictos globales. | Ejemplo: Una variable declarada dentro de una función no puede ser leída por funciones ajenas a ese bloque. | Comprueba el comportamiento del alcance local declarando una variable dentro de un bloque.",
                            "Mini-Reto Integrador | Un script integrador combina la declaración de variables, asignación de tipos y operaciones básicas para resolver un caso real, como simular el registro de un usuario. | Ejemplo: Guardar el nombre, correo y estado activo de un nuevo cliente e imprimir un resumen. | Diseña un script completo que simule el registro básico de un usuario.",
                            "Cierre y Ejecución | La fase de cierre implica ejecutar el script completo en el entorno de pruebas para verificar que todas las instrucciones se ejecuten en orden secuencial sin fallos. | Ejemplo: Verificar la salida completa en consola asegurando que el flujo funcione de principio a fin. | Ejecuta y valida el funcionamiento total de tu script en el entorno de desarrollo."
                        ],
                        visual: [
                            "Esquema de Cajas | Visualiza las variables como pequeños casilleros o cajas rotuladas. La etiqueta es el nombre de la variable y lo que guardas dentro es su valor. | Ejemplo: Una caja con la etiqueta 'puntaje' que contiene fichas con el número 100. | Visualiza el concepto creando un esquema mental de cajas rotuladas.",
                            "Mapa de Memoria RAM | Las variables ocupan físicamente direcciones específicas dentro de los bancos de la memoria RAM de tu computadora mientras el programa está activo. | Ejemplo: Representación gráfica de celdas de memoria numeradas donde cada celda retiene un dato. | Comprende el almacenamiento visual de los datos en la memoria RAM.",
                            "Mapa Mental Cotidiano | Relacionar conceptos informáticos con objetos de nuestra vida diaria, como una agenda de contactos o un fichero físico. | Ejemplo: Una libreta donde anotas nombres de amigos asociados a su número telefónico. | Conecta la teoría de variables con un objeto de la vida real mediante analogías.",
                            "Infografía Comparativa | Una infografía visual nos ayuda a contrastar de manera inmediata las diferencias estructurales entre los datos simples y los complejos. | Ejemplo: Iconos gráficos donde un texto es un pergamino y un número es un ábaco digital. | Analiza la diferencia gráfica entre tipos de datos primitivos y complejos.",
                            "Metáfora de Tuberías | Imagina que los datos viajan a través de una red de tuberías. Las variables actúan como depósitos intermedios que almacenan temporalmente el contenido. | Ejemplo: Agua fluyendo desde un tanque principal hacia diferentes llaves de salida. | Representa el flujo de las variables como un sistema interconectado de tuberías.",
                            "Diagrama de Asignación | El operador de asignación `=` se visualiza como una flecha direccional que toma el valor de la derecha y lo deposita dentro del contenedor de la izquierda. | Ejemplo: El número `5` viaja a través de una flecha ➔ para instalarse en la variable `X`. | Esquematiza el signo `=` como una flecha de asignación.",
                            "Zonas Restringidas (Scope) | Imagina un edificio corporativo donde existen áreas de acceso público y oficinas con acceso restringido (variables locales). | Ejemplo: Planos arquitectónicos divididos por zonas de seguridad y permisos. | Visualiza el alcance del código como un conjunto de zonas permitidas y restringidas.",
                            "Pila de Ejecución Gráfica | La pila (Stack) es una estructura vertical donde las variables locales se apilan una encima de otra como libros en una mesa de trabajo. | Exemplos: Una torre de bloques donde cada bloque representa una variable activa. | Comprende la gestión visual de la pila de memoria local.",
                            "Resumen Gráfico Conceptual | Un mapa sinóptico o infografía general que une de forma visual todos los pilares fundamentales del módulo sobre la lógica de variables. | Ejemplo: Un diagrama de flujo que conecta la declaración, mutabilidad y salida. | Analiza el resumen gráfico conceptual completo del tema.",
                            "Cierre Visual | Consolidación visual final donde se repasan los esquemas gráficos aprendidos para garantizar la retención del conocimiento. | Ejemplo: Diagrama resumen de validación visual de conceptos aprendidos. | Realiza la revisión visual de cierre del módulo."
                        ],
                        analitico: [
                            "Definición Formal | Una variable es un identificador simbólico enlazado a una ubicación de memoria específica que almacena un valor tipado durante la ejecución. | Ejemplo: Definición estricta documentada en las especificaciones formales de los lenguajes. | Analiza la definición formal de identificador simbólico de memoria.",
                            "Taxonomía de Tipos | La taxonomía de tipos clasifica los datos según su representación a bajo nivel, diferenciando entre tipado estático y dinámico. | Ejemplo: Estudio teórico comparativo entre lenguajes tipados (Java) y dinámicos (JavaScript). | Estudia la taxonomía formal y la clasificación de los tipos de datos.",
                            "Análisis Sintáctico | El análisis sintáctico formal evalúa las reglas gramaticales estrictas que rigen la nomenclatura y sensibilidad a mayúsculas. | Ejemplo: Estudio de las reglas formales que validan si un identificador cumple con la gramática. | Analiza rigurosamente las reglas formales de nomenclatura y sintaxis.",
                            "Gestión de Memoria | Estudio técnico de la arquitectura de almacenamiento, contrastando la Pila (Stack) frente al Montículo (Heap). | Ejemplo: Análisis analítico del rendimiento de asignación de memoria estática vs dinámica. | Examina técnicamente la gestión de memoria en Stack y Heap.",
                            "Teoría de Hoisting | El hoisting es un mecanismo analítico donde las declaraciones de variables son elevadas conceptualmente al inicio de su ámbito antes de compilar. | Ejemplo: Análisis del comportamiento interno al invocar una variable antes de su declaración. | Estudia formalmente el concepto de hoisting y alcance léxico.",
                            "Paso por Valor vs Referencia | Análisis comparativo sobre cómo los lenguajes transfieren los datos: por valor (copiando el contenido) o por referencia (otorgando la dirección de memoria). | Ejemplo: Demostración analítica de mutaciones en arreglos al pasarlos como parámetros. | Analiza formalmente la diferencia entre asignación por referencia y por valor.",
                            "Complejidad Computacional | Evaluación algorítmica del costo en tiempo y recursos que implica acceder o modificar una variable en memoria. | Ejemplo: Demostración de que el acceso directo a una variable indexada posee una complejidad $O(1)$. | Evalúa la complejidad computacional asociada al manejo de variables.",
                            "Principios de Clean Code | Estudio analítico de las normativas enfocadas en la legibilidad, inmutabilidad preventiva y reducción de efectos secundarios. | Ejemplo: Análisis de priorizar el uso de constantes (`const`) sobre variables mutables (`let`). | Analiza los principios de inmutabilidad y buenas prácticas de Clean Code.",
                            "Ensayo Paradigmático | Análisis crítico sobre la evolución de la gestión de estados en la programación imperativa frente a la programación funcional. | Ejemplo: Ensayo comparativo sobre mutabilidad de estados en arquitecturas modernas. | Redacta un análisis crítico sobre el uso de variables en paradigmas modernos.",
                            "Evaluación Teórica | Cuestionario técnico formal diseñado para poner a prueba el dominio absoluto de los conceptos teóricos y arquitectónicos. | Ejemplo: Examen técnico riguroso de opción múltiple y resolución de casos. | Resuelve la evaluación teórica formal del módulo."
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
            const codigoClaseIngresado = document.getElementById("reg-codigo-clase-alumno") ? document.getElementById("reg-codigo-clase-alumno").value.trim().toUpperCase() : "";

            if (usuariosRegistradosDB.some(u => u.correo === correo)) {
                alert("⚠️ Este correo ya está registrado.");
                return;
            }

            let claseValida = null;
            if (codigoClaseIngresado) {
                claseValida = baseDatosPlataforma.clases.find(c => c.codigo === codigoClaseIngresado);
                if (!claseValida) {
                    alert("❌ El código de clase ingresado no existe. Pídele un código válido a tu profesor.");
                    return;
                }
            }

            const usuarioGen = `user_${Math.floor(1000 + Math.random() * 9000)}`;
            const passGen = `pass_${Math.floor(1000 + Math.random() * 9000)}`;

            usuariosRegistradosDB.push({
                correo, 
                nombre, 
                usuario: usuarioGen, 
                password: passGen, 
                rol: "alumno", 
                codigoClaseAsociada: claseValida ? claseValida.codigo : "",
                testRealizado: false, 
                estiloEstudiante: "practico"
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
            renderTarjetaAccesoClasesDocente();
            document.getElementById("titulo-modulo").innerText = "Panel del Profesor";
            document.getElementById("contenido-adaptativo").innerHTML = `<p class="text-xs text-slate-300">Bienvenido Profesor. Haz clic en cualquiera de tus clases registradas a la izquierda para abrir la ventana modal de edición y contenidos multimedia.</p>`;
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

            usuarioValido.codigoClaseAsociada = codigoClase;
            localStorage.setItem("usuarios_registrados_db", JSON.stringify(usuariosRegistradosDB));

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
    renderAccesoClasesAlumno();
    actualizarContenidoAlumno();
    renderMaterialesAlumno();
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
        
        card.className = `modulo-card p-3 rounded-xl border border-slate-700/60 bg-slate-900/40 cursor-pointer hover:border-indigo-500/50 transition-all ${
            esActivo ? 'border-indigo-500 bg-slate-800/90 shadow-lg' : ''
        }`;
        card.onclick = () => {
            moduloActualId = mod.id;
            renderModulosAlumno();
            actualizarContenidoAlumno();
        };

        card.innerHTML = `
            <div class="flex items-center justify-between">
                <span class="text-xs font-medium ${esActivo ? 'text-white' : 'text-slate-300'}">📚 Módulo ${mod.id}: ${mod.titulo}</span>
                <span class="text-[10px] bg-indigo-600/30 text-indigo-300 px-2 py-0.5 rounded">Ver</span>
            </div>
        `;
        contenedor.appendChild(card);
    });
    actualizarBarraProgresoAutomatica();
}

function renderAccesoClasesAlumno() {
    let contenedorModulosPadre = document.getElementById("lista-modulos")?.parentElement;
    if (!contenedorModulosPadre) return;

    let contenedorAcceso = document.getElementById("contenedor-acceso-clases");
    if (!contenedorAcceso) {
        contenedorAcceso = document.createElement("div");
        contenedorAcceso.id = "contenedor-acceso-clases";
        contenedorModulosPadre.insertAdjacentElement('afterend', contenedorAcceso);
    }

    const claseActual = baseDatosPlataforma.clases.find(c => c.codigo === sesionActual.codigoClase);
    const todasLasClases = baseDatosPlataforma.clases;

    let html = `
        <div class="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3 mt-4">
            <h3 class="text-white font-semibold text-xs tracking-wider uppercase">ACCESO A LAS CLASES</h3>
            <div class="space-y-2 text-xs text-slate-300">
                <div class="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                    <div>
                        <span class="text-[10px] text-slate-400 block">Clase Actual:</span>
                        <strong class="text-indigo-400 text-xs">${claseActual ? claseActual.nombre : 'Sin clase'}</strong>
                    </div>
                    <span class="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono">${sesionActual.codigoClase}</span>
                </div>

                <div class="space-y-1.5 pt-1">
                    <span class="text-[10px] text-slate-400 block font-medium">Otras materias disponibles:</span>
    `;

    todasLasClases.forEach(clase => {
        const esActual = clase.codigo === sesionActual.codigoClase;
        if (!esActual) {
            html += `
                <button type="button" onclick="cambiarClaseAlumno('${clase.codigo}')" class="w-full text-left bg-slate-950 hover:bg-slate-800 p-2 rounded-lg border border-slate-800 text-xs text-slate-200 flex justify-between items-center transition cursor-pointer">
                    <span class="truncate pr-2">📖 ${clase.nombre}</span>
                    <span class="text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-0.5 rounded font-medium whitespace-nowrap">Ingresar</span>
                </button>
            `;
        }
    });

    html += `
                </div>
            </div>
        </div>
    `;

    contenedorAcceso.innerHTML = html;
}

function cambiarClaseAlumno(nuevoCodigoClase) {
    const claseValida = baseDatosPlataforma.clases.find(c => c.codigo === nuevoCodigoClase);
    if (!claseValida) return;

    sesionActual.codigoClase = nuevoCodigoClase;
    
    const alumnoEnDB = usuariosRegistradosDB.find(u => u.usuario === sesionActual.usuario);
    if (alumnoEnDB) {
        alumnoEnDB.codigoClaseAsociada = nuevoCodigoClase;
        localStorage.setItem("usuarios_registrados_db", JSON.stringify(usuariosRegistradosDB));
    }

    localStorage.setItem("sesion_usuario_activo", JSON.stringify(sesionActual));
    location.reload();
}

function renderTarjetaAccesoClasesDocente() {
    let contenedorDocentePadre = document.getElementById("panel-docente");
    if (!contenedorDocentePadre) return;

    let contenedorAccesoDocente = document.getElementById("contenedor-acceso-clases-docente");
    if (!contenedorAccesoDocente) {
        contenedorAccesoDocente = document.createElement("div");
        contenedorAccesoDocente.id = "contenedor-acceso-clases-docente";
        contenedorAccesoDocente.className = "mt-4 space-y-4";
        contenedorDocentePadre.appendChild(contenedorAccesoDocente);
    }

    const clasesDelDocente = baseDatosPlataforma.clases.filter(c => (c.creador || "admin") === sesionActual.usuario);

    let html = `
        <div class="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
            <h3 class="text-white font-semibold text-xs tracking-wider uppercase">ACCESO Y GESTIÓN DE CLASES</h3>
            <p class="text-slate-400 text-xs">Selecciona cualquier clase para abrir su panel de edición en una ventana flotante:</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
    `;

    if (clasesDelDocente.length === 0) {
        html += `<p class="text-slate-500 text-xs">No has creado clases aún.</p>`;
    } else {
        clasesDelDocente.forEach(clase => {
            html += `
                <div class="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
                    <div>
                        <strong class="text-white block font-medium">${clase.nombre}</strong>
                        <span class="text-indigo-400 font-mono text-[10px]">${clase.codigo}</span>
                    </div>
                    <button type="button" onclick="abrirModalClaseDocente('${clase.codigo}')" class="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition">
                        🛠️ Administrar
                    </button>
                </div>
            `;
        });
    }

    html += `</div></div>`;
    contenedorAccesoDocente.innerHTML = html;
}

function abrirModalClaseDocente(codigoClase) {
    const clase = baseDatosPlataforma.clases.find(c => c.codigo === codigoClase && (c.creador || "admin") === sesionActual.usuario);
    if (!clase) return;
    if (!clase.materiales) clase.materiales = [];

    let modal = document.getElementById("modal-administrar-clase");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "modal-administrar-clase";
        modal.className = "fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto";
        document.body.appendChild(modal);
    }

    let html = `
        <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl relative">
            <div class="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                    <h2 class="text-white font-bold text-lg">📚 Administrando: ${clase.nombre}</h2>
                    <span class="text-indigo-400 font-mono text-xs">Código único: ${clase.codigo}</span>
                </div>
                <button type="button" onclick="cerrarModalClaseDocente()" class="text-slate-400 hover:text-white text-xl font-bold px-2 py-1">✕</button>
            </div>

            <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div class="flex flex-wrap justify-between items-center gap-2">
                    <span class="text-xs font-bold text-emerald-400">📚 Material Multimedia y Recursos</span>
                    <div class="flex flex-wrap gap-1.5">
                        <label class="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded text-[11px] cursor-pointer transition font-medium">
                            📁 Archivo (PDF/Img)
                            <input type="file" accept="application/pdf, image/png, image/jpeg" class="hidden" onchange="subirArchivoMaterialDocente('${clase.codigo}', event)">
                        </label>
                        <button type="button" onclick="subirMaterialMultimediaDocente('${clase.codigo}', 'youtube')" class="bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1 rounded text-[11px] font-semibold">▶️ YouTube</button>
                        <button type="button" onclick="subirMaterialMultimediaDocente('${clase.codigo}', 'enlace')" class="bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded text-[11px] font-semibold">🔗 Enlace Web</button>
                    </div>
                </div>
                <div class="space-y-1.5">
    `;

    if (clase.materiales.length === 0) {
        html += `<p class="text-slate-500 text-xs">No hay materiales cargados para esta clase.</p>`;
    } else {
        clase.materiales.forEach(mat => {
            let iconoTipo = mat.tipo === 'youtube' ? '▶️' : mat.tipo === 'enlace' ? '🔗' : mat.tipo === 'imagen' ? '🖼️' : '📄';
            html += `
                <div class="flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-800 text-xs">
                    <span class="text-slate-300 truncate max-w-[350px]">${iconoTipo} ${mat.titulo}</span>
                    <button type="button" onclick="eliminarMaterialDocente('${clase.codigo}', '${mat.id}')" class="text-rose-400 hover:text-rose-300 text-xs px-2">Eliminar</button>
                </div>
            `;
        });
    }

    html += `
                </div>
            </div>

            <div class="space-y-3">
                <h3 class="text-white font-semibold text-xs uppercase tracking-wider text-indigo-300">📌 Módulos y Actividades Editables</h3>
    `;

    if (clase.modulos.length === 0) {
        html += `<p class="text-slate-500 text-xs">Aún no hay temas o módulos en esta clase.</p>`;
    } else {
        clase.modulos.forEach(mod => {
            html += `
                <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div class="text-white font-bold text-xs flex justify-between items-center border-b border-slate-800 pb-2">
                        <span>Módulo ${mod.id}: ${mod.titulo}</span>
                    </div>
                    <div class="space-y-3 text-xs text-slate-300">
            `;

            ['practico', 'visual', 'analitico'].forEach(estilo => {
                const acts = mod.contenido[estilo] || [];
                html += `
                    <div class="text-indigo-400 font-bold uppercase text-[10px] tracking-wide pt-1 border-b border-indigo-500/20 pb-0.5">Perfil: ${estilo}</div>
                `;
                acts.forEach((actText, actIndex) => {
                    const partes = actText.split('|');
                    const t = (partes[0] || `Actividad ${actIndex + 1}`).trim();
                    const e = (partes[1] || `Explicación teórica profunda sobre los fundamentos necesarios.`).trim();
                    const ej = (partes[2] || `Ejemplo práctico paso a paso demostrando la resolución correcta.`).trim();
                    const tr = (partes[3] || partes[0] || actText).trim();

                    html += `
                        <div class="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2">
                            <div class="text-slate-400 font-mono text-[10px] font-bold">Actividad #${actIndex + 1}</div>
                            <div class="space-y-1.5">
                                <label class="text-[10px] text-slate-400 font-medium">Título:</label>
                                <input type="text" id="input-t-${clase.codigo}-${mod.id}-${estilo}-${actIndex}" value="${t.replace(/"/g, '&quot;')}" class="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-white text-xs focus:outline-none focus:border-indigo-500">
                                
                                <label class="text-[10px] text-emerald-400 font-medium">Explicación Teórica Profunda:</label>
                                <textarea id="input-e-${clase.codigo}-${mod.id}-${estilo}-${actIndex}" rows="2" class="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-white text-xs focus:outline-none focus:border-indigo-500">${e.replace(/"/g, '&quot;')}</textarea>
                                
                                <label class="text-[10px] text-amber-400 font-medium">Ejemplo Práctico Detallado:</label>
                                <textarea id="input-ej-${clase.codigo}-${mod.id}-${estilo}-${actIndex}" rows="2" class="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-white text-xs focus:outline-none focus:border-indigo-500">${ej.replace(/"/g, '&quot;')}</textarea>
                                
                                <label class="text-[10px] text-indigo-400 font-medium">Tarea a Realizar:</label>
                                <textarea id="input-tr-${clase.codigo}-${mod.id}-${estilo}-${actIndex}" rows="2" class="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-white text-xs focus:outline-none focus:border-indigo-500">${tr.replace(/"/g, '&quot;')}</textarea>
                            </div>
                            <div class="text-right pt-1">
                                <button type="button" onclick="guardarCambioActividad('${clase.codigo}', ${mod.id}, '${estilo}', ${actIndex})" class="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded text-[11px] font-semibold transition cursor-pointer">Guardar Actividad</button>
                            </div>
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
            <div class="text-right border-t border-slate-800 pt-3">
                <button type="button" onclick="cerrarModalClaseDocente()" class="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer">Cerrar Ventana</button>
            </div>
        </div>
    `;

    modal.innerHTML = html;
    modal.classList.remove("hidden");
}

function cerrarModalClaseDocente() {
    const modal = document.getElementById("modal-administrar-clase");
    if (modal) modal.classList.add("hidden");
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

    let html = `<div class="text-xs text-indigo-400 font-semibold mb-3">📌 Plan de 10 puntos adaptado con Explicación Teórica Profunda y Ejemplos (${estilo.toUpperCase()}):</div>`;
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

        const partes = puntuacionTexto.split('|').map(p => p.trim());
        
        let tituloAct = partes[0] || `Actividad ${index + 1}`;
        let explicacion = partes[1] || "";
        let ejemplo = partes[2] || "";
        let tarea = partes[3] || "";

        if (!explicacion || explicacion === "") {
            explicacion = `Explicación teórica profunda sobre los fundamentos clave de ${tituloAct} para comprender su arquitectura y aplicación.`;
        }
        if (!ejemplo || ejemplo === "") {
            ejemplo = `Ejemplo práctico paso a paso: Analizamos la sintaxis y aplicamos el concepto de manera controlada para verificar el resultado.`;
        }
        if (!tarea || tarea === "") {
            tarea = partes[1] || tituloAct;
        }

        explicacion = explicacion.replace(/^(Explicación.*?:\s*)/i, '').trim();
        ejemplo = ejemplo.replace(/^(Ejemplo.*?:\s*)/i, '').trim();
        tarea = tarea.replace(/^(Tarea.*?:\s*)/i, '').trim();

        // Verificamos si hay comentarios del profesor en esta entrega
        let htmlComentarioProfesor = "";
        if (ultimaEvidencia && ultimaEvidencia.comentarioDocente) {
            htmlComentarioProfesor = `
                <div class="bg-rose-950/40 p-3 rounded-lg border border-rose-900/50 text-rose-300 space-y-1 mt-2">
                    <strong class="text-rose-400 block">💬 Comentario / Correcciones del Profesor:</strong>
                    <p class="text-slate-200">${ultimaEvidencia.comentarioDocente}</p>
                </div>
            `;
        }

        html += `
            <div class="p-4 bg-slate-900/90 rounded-xl border border-slate-800 text-xs space-y-3">
                <div class="flex items-center justify-between">
                    <span class="font-bold text-indigo-300">#${index + 1}. ${tituloAct.replace(/^\d+[\.\-\)]\s*/, '')}</span>
                </div>

                <div class="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800/80 space-y-2.5 text-slate-300 leading-relaxed">
                    <div><strong class="text-emerald-400">📖 Explicación Teórica Profunda:</strong> ${explicacion}</div>
                    <div class="border-t border-slate-800 pt-2"><strong class="text-amber-400">💡 Ejemplo Práctico Detallado:</strong> ${ejemplo}</div>
                </div>

                <div class="text-slate-100 font-medium leading-relaxed border-t border-slate-800 pt-2">
                    <strong class="text-indigo-400">🛠️ Tarea a Realizar:</strong> ${tarea}
                </div>

                ${htmlComentarioProfesor}

                <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                    <div>
                        ${tieneEvidencia 
                            ? `<span class="text-emerald-400 font-semibold">✓ ${entregasPunto.length} Archivo(s) Subido(s)</span> <span class="text-slate-400 text-[10px]">(${ultimaEvidencia.estado || 'En revisión'})</span>` 
                            : `<span class="text-amber-400 font-semibold">⏳ Pendiente de entrega</span>`}
                    </div>
                    <div class="flex items-center gap-2">
                        <input type="file" accept="image/png, image/jpeg, application/pdf" id="file-${modulo.id}-${index}" class="hidden" onchange="subirEvidencia(event, ${modulo.id}, ${index})">
                        <label for="file-${modulo.id}-${index}" class="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg cursor-pointer transition text-[11px] font-medium">
                            📁 ${tieneEvidencia ? '+ Reenviar / Agregar Archivo' : 'Subir Evidencia (PNG, JPG, PDF)'}
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

function renderMaterialesAlumno() {
    let contenedorModulosPadre = document.getElementById("lista-modulos")?.parentElement;
    if (!contenedorModulosPadre) return;

    let contenedorMat = document.getElementById("contenedor-materiales-alumno");
    if (!contenedorMat) {
        contenedorMat = document.createElement("div");
        contenedorMat.id = "contenedor-materiales-alumno";
        contenedorModulosPadre.appendChild(contenedorMat);
    }

    const clase = baseDatosPlataforma.clases.find(c => c.codigo === sesionActual.codigoClase);
    if (!clase || !clase.materiales || clase.materiales.length === 0) {
        contenedorMat.innerHTML = "";
        return;
    }

    let html = `<div class="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-3 mt-4">
                    <h3 class="text-white font-semibold text-xs flex items-center gap-2">📚 Material de Apoyo y Recursos</h3>
                    <div class="space-y-2">`;

    clase.materiales.forEach(mat => {
        if (mat.tipo === 'enlace' || mat.tipo === 'youtube') {
            let embedUrl = mat.contenido;
            if (mat.tipo === 'youtube') {
                let videoId = "";
                if (mat.contenido.includes("youtu.be/")) {
                    videoId = mat.contenido.split("youtu.be/")[1]?.split("?")[0];
                } else if (mat.contenido.includes("watch?v=")) {
                    videoId = mat.contenido.split("watch?v=")[1]?.split("&")[0];
                }
                if (videoId) {
                    embedUrl = `https://www.youtube.com/embed/${videoId}`;
                }
            }

            if (mat.tipo === 'youtube' && embedUrl.includes("youtube.com/embed/")) {
                html += `
                    <div class="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                        <span class="text-[11px] text-indigo-300 font-semibold block">▶️ ${mat.titulo}</span>
                        <div class="w-full">
                            <iframe src="${embedUrl}" class="w-full h-32 rounded" allowfullscreen></iframe>
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div class="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex flex-col justify-between space-y-1.5">
                        <span class="text-[11px] text-slate-300 font-medium">🔗 ${mat.titulo}</span>
                        <a href="${mat.contenido}" target="_blank" class="bg-indigo-600 hover:bg-indigo-500 text-white text-center py-1 rounded text-[10px] font-semibold">Abrir Enlace Web</a>
                    </div>
                `;
            }
        } else {
            html += `
                <div class="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between space-x-2">
                    <span class="text-[11px] text-slate-300 font-medium truncate">📄 ${mat.titulo}</span>
                    <button type="button" onclick="verMaterialAlumno('${mat.id}')" class="bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded text-[10px] font-semibold whitespace-nowrap">Ver Archivo</button>
                </div>
            `;
        }
    });

    html += `</div></div>`;
    contenedorMat.innerHTML = html;
}

function verMaterialAlumno(matId) {
    const clase = baseDatosPlataforma.clases.find(c => c.codigo === sesionActual.codigoClase);
    if (!clase || !clase.materiales) return;

    const material = clase.materiales.find(m => m.id === matId);
    if (!material) return;

    const ventana = window.open("");
    if (material.tipo === 'imagen') {
        ventana.document.write(`<img src="${material.contenido}" style="max-width:100%; display:block; margin:auto;"/>`);
    } else {
        ventana.document.write(`<iframe src="${material.contenido}" style="width:100%; height:100vh; border:none;"></iframe>`);
    }
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
            estado: "Pendiente",
            comentarioDocente: ""
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

/**
 * NUEVA FUNCIÓN: Permite evaluar (Aprobar o Rechazar) solicitando un comentario opcional de corrección
 */
function evaluarEvidenciaPorId(idUnico, calificacion) {
    const ev = evidenciasEstudiantes.find(item => item && item.idUnico === idUnico);
    if (!ev) return;

    let mensajePrompt = calificacion.includes("Rechazado") 
        ? "⚠️ Indica las correcciones correspondientes o qué faltó complementar para el alumno:" 
        : "💬 Escribe un comentario opcional de felicitación o retroalimentación:";

    let comentario = prompt(mensajePrompt, ev.comentarioDocente || "");
    if (comentario === null) return; // Si cancela el prompt

    ev.estado = calificacion;
    ev.comentarioDocente = comentario.trim();

    localStorage.setItem("evidencias_alumnos_db", JSON.stringify(evidenciasEstudiantes));
    alert(`Evidencia actualizada a: ${calificacion}`);
    renderBuzonEvidenciasPorClaseDocente();
}

function configurarAccionesDocente() {
    const formClase = document.getElementById("form-crear-clase");
    if (!formClase) return;

    formClase.onsubmit = (e) => {
        e.preventDefault();
        const nombre = document.getElementById("input-nombre-clase").value.trim();
        const codigoUnico = `CLASE-${Math.floor(1000 + Math.random() * 9000)}`;

        if (!baseDatosPlataforma.clases) {
            baseDatosPlataforma.clases = [];
        }

        baseDatosPlataforma.clases.push({ 
            codigo: codigoUnico, 
            nombre: nombre, 
            creador: sesionActual.usuario, 
            materiales: [],
            modulos: [] 
        });
        
        localStorage.setItem("bd_plataforma_evidencias", JSON.stringify(baseDatosPlataforma));
        
        document.getElementById("txt-codigo-generado").innerText = codigoUnico;
        document.getElementById("resultado-codigo-clase").classList.remove("hidden");
        document.getElementById("input-nombre-clase").value = "";
        alert(`¡Clase Creada! Código: ${codigoUnico}`);
        renderBuzonEvidenciasPorClaseDocente();
        renderTarjetaAccesoClasesDocente();
    };

    const formTema = document.getElementById("form-nuevo-tema");
    if (formTema) {
        formTema.onsubmit = async (e) => {
            e.preventDefault();
            const codigo = document.getElementById("input-codigo-asociado").value.trim().toUpperCase();
            const tituloTema = document.getElementById("input-titulo-tema").value.trim();

            const clase = baseDatosPlataforma.clases.find(c => c.codigo === codigo && (c.creador || "admin") === sesionActual.usuario);
            if (!clase) {
                alert("❌ Código de clase no encontrado o no pertenece a tu cuenta.");
                return;
            }

            alert("✨ Generando 10 puntos con explicación profunda y ejemplo vía IA...");
            const nuevoId = clase.modulos.length + 1;
            const pPractico = await generarPuntosIA(tituloTema, "practico");
            const pVisual = await generarPuntosIA(tituloTema, "visual");
            const pAnalitico = await generarPuntosIA(tituloTema, "analitico");

            clase.modulos.push({ id: nuevoId, titulo: tituloTema, contenido: { practico: pPractico, visual: pVisual, analitico: pAnalitico } });
            localStorage.setItem("bd_plataforma_evidencias", JSON.stringify(baseDatosPlataforma));
            document.getElementById("input-titulo-tema").value = "";
            document.getElementById("input-codigo-asociado").value = "";
            alert("¡Módulo agregado correctamente!");
            renderTarjetaAccesoClasesDocente();
        };
    }
}

function subirMaterialMultimediaDocente(codigoClase, tipo) {
    const clase = baseDatosPlataforma.clases.find(c => c.codigo === codigoClase && (c.creador || "admin") === sesionActual.usuario);
    if (!clase) return;
    if (!clase.materiales) clase.materiales = [];

    if (tipo === 'enlace' || tipo === 'youtube') {
        const urlInput = prompt(tipo === 'youtube' ? "Pega el enlace del video de YouTube:" : "Pega el enlace de la página web:");
        if (!urlInput) return;
        const tituloInput = prompt("Escribe un título descriptivo para este recurso:") || "Recurso Web";

        clase.materiales.push({
            id: 'mat_' + Date.now(),
            titulo: tituloInput,
            tipo: tipo,
            contenido: urlInput.trim()
        });

        localStorage.setItem("bd_plataforma_evidencias", JSON.stringify(baseDatosPlataforma));
        alert("🔗 Enlace agregado correctamente.");
        abrirModalClaseDocente(codigoClase);
    }
}

function subirArchivoMaterialDocente(codigoClase, event) {
    const archivo = event.target.files[0];
    if (!archivo) return;

    const esImagen = archivo.type.includes("image");
    const esPdf = archivo.type.includes("pdf");

    if (!esImagen && !esPdf) {
        alert("⚠️ Solo se permiten imágenes (PNG, JPG) o documentos PDF.");
        return;
    }

    const lector = new FileReader();
    lector.onload = function(e) {
        const base64File = e.target.result;
        
        const clase = baseDatosPlataforma.clases.find(c => c.codigo === codigoClase && (c.creador || "admin") === sesionActual.usuario);
        if (!clase) return;

        if (!clase.materiales) clase.materiales = [];

        clase.materiales.push({
            id: 'mat_' + Date.now(),
            titulo: archivo.name,
            tipo: esImagen ? 'imagen' : 'pdf',
            contenido: base64File
        });

        localStorage.setItem("bd_plataforma_evidencias", JSON.stringify(baseDatosPlataforma));
        alert("📁 Archivo multimedia subido correctamente.");
        abrirModalClaseDocente(codigoClase);
    };
    lector.readAsDataURL(archivo);
}

function eliminarMaterialDocente(codigoClase, matId) {
    const clase = baseDatosPlataforma.clases.find(c => c.codigo === codigoClase && (c.creador || "admin") === sesionActual.usuario);
    if (!clase || !clase.materiales) return;

    if (!confirm("¿Deseas eliminar este material de apoyo?")) return;

    clase.materiales = clase.materiales.filter(m => m.id !== matId);
    localStorage.setItem("bd_plataforma_evidencias", JSON.stringify(baseDatosPlataforma));
    alert("🗑️ Material eliminado.");
    abrirModalClaseDocente(codigoClase);
}

function eliminarClase(codigoClase) {
    const clase = baseDatosPlataforma.clases.find(c => c.codigo === codigoClase && (c.creador || "admin") === sesionActual.usuario);
    if (!clase) return;

    const confirmacion = confirm(`⚠️ ¿Estás seguro de que deseas eliminar la clase "${clase.nombre}" (${codigoClase})?\n\nEsta acción borrará todos sus temas, actividades y evidencias entregadas.`);
    if (!confirmacion) return;

    baseDatosPlataforma.clases = baseDatosPlataforma.clases.filter(c => c.codigo !== codigoClase);
    localStorage.setItem("bd_plataforma_evidencias", JSON.stringify(baseDatosPlataforma));

    evidenciasEstudiantes = evidenciasEstudiantes.filter(ev => ev && ev.clase !== codigoClase);
    localStorage.setItem("evidencias_alumnos_db", JSON.stringify(evidenciasEstudiantes));

    cerrarModalClaseDocente();
    alert("🗑️ Clase y evidencias eliminadas correctamente.");
    renderBuzonEvidenciasPorClaseDocente();
    renderTarjetaAccesoClasesDocente();
}

function renderAlumnosRegistradosDocente() {
    const contenedor = document.getElementById("contenedor-alumnos-registrados");
    if (!contenedor) return;

    if (!baseDatosPlataforma.clases) baseDatosPlataforma.clases = [];

    const codigosClasesDocente = baseDatosPlataforma.clases
        .filter(c => (c.creador || "admin") === sesionActual.usuario)
        .map(c => c.codigo);

    const alumnos = usuariosRegistradosDB.filter(u => u.rol === "alumno" && codigosClasesDocente.includes(u.codigoClaseAsociada));

    if (alumnos.length === 0) {
        contenedor.innerHTML = `<p class="text-slate-400 text-xs">Aún no hay alumnos inscritos en tus clases.</p>`;
        return;
    }

    let html = "";
    alumnos.forEach(a => {
        html += `
            <div class="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs flex justify-between items-center">
                <div>
                    <strong class="text-white">${a.nombre}</strong> <span class="text-slate-400">(${a.correo})</span>
                    <div class="text-[10px] text-indigo-400 mt-0.5">Clase: ${a.codigoClaseAsociada}</div>
                </div>
                <div class="font-mono text-[11px] text-slate-300">
                    User: <span class="text-indigo-400">${a.usuario}</span> | Pass: <span class="text-amber-400">${a.password}</span>
                </div>
            </div>
        `;
    });
    contenedor.innerHTML = html;
}

function guardarCambioActividad(codigoClase, modId, estilo, actIndex) {
    const tEl = document.getElementById(`input-t-${codigoClase}-${modId}-${estilo}-${actIndex}`);
    const eEl = document.getElementById(`input-e-${codigoClase}-${modId}-${estilo}-${actIndex}`);
    const ejEl = document.getElementById(`input-ej-${codigoClase}-${modId}-${estilo}-${actIndex}`);
    const trEl = document.getElementById(`input-tr-${codigoClase}-${modId}-${estilo}-${actIndex}`);
    
    if (!tEl || !eEl || !ejEl || !trEl) return;

    const nuevoTexto = `${tEl.value.trim()} | ${eEl.value.trim()} | ${ejEl.value.trim()} | ${trEl.value.trim()}`;
    
    const clase = baseDatosPlataforma.clases.find(c => c.codigo === codigoClase && (c.creador || "admin") === sesionActual.usuario);
    if (!clase) return;

    const modulo = clase.modulos.find(m => m.id === modId);
    if (!modulo || !modulo.contenido[estilo]) return;

    modulo.contenido[estilo][actIndex] = nuevoTexto;
    localStorage.setItem("bd_plataforma_evidencias", JSON.stringify(baseDatosPlataforma));
    alert("✅ Actividad modificada y guardada correctamente.");
    abrirModalClaseDocente(codigoClase);
}

function renderBuzonEvidenciasPorClaseDocente() {
    const contenedor = document.getElementById("contenedor-clases-buzon");
    if (!contenedor) return;

    if (!baseDatosPlataforma.clases) baseDatosPlataforma.clases = [];

    const clasesDelDocente = baseDatosPlataforma.clases.filter(c => (c.creador || "admin") === sesionActual.usuario);

    if (clasesDelDocente.length === 0) {
        contenedor.innerHTML = `<p class="text-slate-400 text-xs">No hay clases creadas en tu cuenta para recibir evidencias.</p>`;
        return;
    }

    if (!Array.isArray(evidenciasEstudiantes)) {
        evidenciasEstudiantes = Object.values(evidenciasEstudiantes || {});
    }

    let html = "";
    clasesDelDocente.forEach(clase => {
        const listaEvidenciasClase = evidenciasEstudiantes.filter(ev => {
            if (!ev || !ev.clase) return false;
            return ev.clase.trim().toUpperCase() === clase.codigo.trim().toUpperCase();
        });

        html += `
            <div class="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden mb-3">
                <div class="w-full p-3 bg-slate-900/90 flex justify-between items-center text-left transition border-b border-slate-800">
                    <button type="button" onclick="toggleTablaClase('${clase.codigo}')" class="flex-1 flex justify-between items-center cursor-pointer pr-4">
                        <div>
                            <strong class="text-white text-xs">${clase.nombre}</strong> 
                            <span class="text-indigo-400 font-mono text-[11px]">(${clase.codigo})</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded text-[10px] font-semibold">${listaEvidenciasClase.length} archivo(s)</span>
                            <span id="flecha-${clase.codigo}" class="text-slate-400 text-xs">▼</span>
                        </div>
                    </button>
                    <button type="button" onclick="eliminarClase('${clase.codigo}')" class="bg-rose-600/80 hover:bg-rose-500 text-white px-2.5 py-1 rounded text-[10px] font-semibold transition cursor-pointer">
                        🗑️ Eliminar
                    </button>
                </div>

                <div id="tabla-clase-${clase.codigo}" class="hidden p-3 bg-slate-950/60 overflow-x-auto">
                    ${listaEvidenciasClase.length === 0 ? `
                        <p class="text-slate-400 text-xs text-center py-2">No hay archivos entregados en esta clase todavía.</p>
                    ` : `
                        <table class="w-full text-left text-xs text-slate-300">
                            <thead>
                                <tr class="border-b border-slate-800 text-slate-400">
                                    <th class="pb-2">Alumno</th>
                                    <th class="pb-2">Actividad / Tipo</th>
                                    <th class="pb-2">Estado / Comentario</th>
                                    <th class="pb-2 text-right">Acciones de Evaluación</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-800/60">
                    `}
        `;

        listaEvidenciasClase.forEach(ev => {
            const idKey = ev.idUnico;
            const nombreUsuario = ev.usuario || 'Alumno';
            const etiquetaTipo = ev.tipoArchivo === 'pdf' ? '📄 PDF' : '🖼️ Img';
            const comentarioActual = ev.comentarioDocente ? `<div class="text-[10px] text-rose-300 mt-1">💬 "${ev.comentarioDocente}"</div>` : '';
            
            html += `
                                <tr class="hover:bg-slate-900/50 align-top">
                                    <td class="py-2.5 pr-2 font-medium text-white">${ev.alumno || 'Sin nombre'} <span class="text-slate-400 text-[10px]">(${nombreUsuario})</span></td>
                                    <td class="py-2.5 pr-2">Mód ${ev.modulo} - Punto ${ev.punto} <span class="ml-1 text-[10px] text-indigo-400">${etiquetaTipo}</span></td>
                                    <td class="py-2.5 pr-2">
                                        <span class="px-2 py-0.5 rounded text-[10px] font-semibold ${ev.estado && ev.estado.includes('Aprobado') ? 'bg-emerald-500/20 text-emerald-300' : ev.estado && ev.estado.includes('Rechazado') ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'}">
                                            ${ev.estado || 'Pendiente'}
                                        </span>
                                        ${comentarioActual}
                                    </td>
                                    <td class="py-2.5 text-right space-x-1 whitespace-nowrap">
                                        <button type="button" onclick="verEvidenciaPorId('${idKey}')" class="bg-slate-800 hover:bg-slate-700 text-white px-2 py-1 rounded text-[11px]">Ver</button>
                                        <button type="button" onclick="evaluarEvidenciaPorId('${idKey}', 'Aprobado 🌟')" class="bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded text-[11px]">Aprobar</button>
                                        <button type="button" onclick="evaluarEvidenciaPorId('${idKey}', 'Rechazado ⚠️')" class="bg-rose-600 hover:bg-rose-500 text-white px-2 py-1 rounded text-[11px]">Rechazar con Comentario</button>
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
    try {
        const url = "https://openrouter.ai/api/v1/chat/completions";
        const prompt = `Actúa como un profesor experto y didáctico. Crea exactamente 10 puntos detallados sobre el tema "${tema}" para el estilo de aprendizaje "${estilo.toUpperCase()}".
        
        REQUISITO OBLIGATORIO DE FORMATO: Cada uno de los 10 puntos debe estar compuesto estrictamente por 4 partes separadas por el carácter pleca vertical (|). No uses saltos de línea dentro del mismo punto.
        Estructura exacta requerida por línea:
        [Título corto] | [Explicación teórica profunda y completa] | [Ejemplo práctico detallado paso a paso] | [Tarea a entregar]

        Devuelve únicamente las 10 líneas con ese formato exacto, una por cada punto, sin numeración externa y sin introducciones.`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${OPENROUTER_API_KEY}` },
            body: JSON.stringify({ model: "openrouter/free", messages: [{ role: "user", content: prompt }] })
        });
        const data = await response.json();
        
        if (data.choices && data.choices[0].message) {
            let contenidoPlano = data.choices[0].message.content;
            let lineas = contenidoPlano.split("\n").filter(l => l.trim() !== "");
            
            return lineas.slice(0, 10).map((linea, index) => {
                let partes = linea.split('|').map(p => p.trim());
                if (partes.length < 4) {
                    let textoLimpio = linea.replace(/^\d+[\.\-\)]\s*/, '');
                    return `${textoLimpio} | Explicación teórica profunda sobre los fundamentos necesarios para dominar este punto de ${tema}. | Ejemplo práctico paso a paso demostrando la resolución correcta del ejercicio. | Realiza la actividad práctica correspondiente a: ${textoLimpio}`;
                }
                return `${partes[0]} | ${partes[1]} | ${partes[2]} | ${partes[3]}`;
            });
        }
    } catch (err) { console.error(err); }
    
    return Array.from({length: 10}, (_, i) => `Actividad ${i+1} de ${tema} | Explicación teórica detallada sobre los conceptos clave de este bloque de aprendizaje. | Ejemplo práctico paso a paso analizando la estructura correcta. | Desarrolla la tarea asignada para este punto.`);
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
