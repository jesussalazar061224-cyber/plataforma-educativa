# AdaptiClass

Plataforma educativa que adapta el aprendizaje a cada alumno en dos dimensiones:

- **Cómo aprende** (estilo): práctico, visual o analítico.
- **Qué tan preparado está** (nivel): básico, intermedio o avanzado, ajustado automáticamente según su desempeño real.

Los docentes escriben un tema y la IA genera las actividades; cada alumno ve la versión que corresponde a su estilo y a su nivel, responde preguntas de comprobación, entrega evidencias y consulta a un tutor IA que le explica según su nivel.

![Vista del alumno](docs/vista-alumno.png)

## Cómo se adapta a cada alumno

1. **Diagnóstico inicial** (8 preguntas): 5 detectan su estilo de aprendizaje y 3 su punto de partida (experiencia, autonomía y ritmo).
2. **Cada punto de una actividad trae**: explicación, ejemplo, tarea, un *paso a paso* para quien va empezando, un *reto* para quien va adelantado y una *pregunta de comprobación* que se corrige sola.
3. **Lo que ve cada nivel**:
   | Nivel | Qué cambia |
   |---|---|
   | Básico | El paso a paso aparece abierto antes de la tarea; tras un error ve la explicación de inmediato; el tutor usa pasos pequeños y analogías. |
   | Intermedio | El paso a paso queda disponible como pista; el reto es opcional; el tutor da pistas en lugar de soluciones. |
   | Avanzado | El reto aparece destacado; el tutor profundiza con casos límite y buenas prácticas. |
4. **El nivel se recalcula** en cada grupo con el *dominio*: aciertos en las preguntas (más valor si acierta al primer intento) y entregas aprobadas o devueltas por el docente. Con 80 % o más pasa a avanzado; por debajo de 50 %, a básico.
5. **El alumno recibe su siguiente paso recomendado** (la primera pregunta sin resolver o evidencia pendiente) y un aviso cuando sube o baja de nivel.

### Para el docente

- Tabla de alumnos con nivel, dominio, porcentaje de aciertos y avance; puede **fijar el nivel a mano** si conoce mejor al alumno.
- Aviso cuando un alumno **necesita apoyo** (dominio menor a 50 %).
- En cada grupo: reparto de alumnos por nivel y el **punto con más errores**, para repasarlo en clase.
- Edición de cada punto (incluidos el paso a paso, el reto y la pregunta), fechas límite, materiales y revisión de entregas con comentarios.

![Panel del docente](docs/vista-docente.png)

## Inteligencia artificial

La plataforma funciona con cualquiera de estos proveedores (se elige en **Configurar IA**):

| Proveedor | Costo | Notas |
|---|---|---|
| **Google Gemini** (recomendado) | Gratis con cuenta de Google | Buen español y respuestas largas. En el plan gratuito, Google puede usar los datos enviados para mejorar sus productos. |
| **Groq** | Gratis | Muy rápido y no entrena con tus datos. Límite por minuto bajo: genera un estilo a la vez. |
| **OpenRouter** | Gratis (modelos `:free`) | Unas 50 consultas al día sin saldo. |

La clave **nunca** está en el código: vive en `.env` (que Git ignora) o en las variables de entorno del hosting. El navegador solo habla con `server.js`.

> No escribas tu clave en ningún archivo que subas a GitHub. Los proveedores detectan claves publicadas y las desactivan.

## Usarlo en tu computadora

1. Instala [Node.js](https://nodejs.org/es/download) (versión LTS).
2. Descarga este repositorio (**Code → Download ZIP**) y descomprímelo.
3. Doble clic en `iniciar-windows.bat` (en Mac: clic derecho en `iniciar-mac.command` → Abrir). Se abre el navegador en http://localhost:3000.
4. Entra como docente con `admin` / `123`.
5. Pulsa **Configurar IA**, elige el proveedor, sigue los pasos para obtener la clave, pégala y pulsa **Guardar y probar**.

![Asistente para configurar la IA](docs/configurar-ia.png)

Desde la terminal también funciona: `npm start`.

## Publicarlo en internet (Render, gratis)

GitHub Pages no sirve: solo publica archivos estáticos y la IA necesita el servidor para proteger la clave. [Render](https://render.com) sí lo ejecuta y se conecta con GitHub:

1. Crea una cuenta en https://render.com con tu cuenta de GitHub.
2. **New → Blueprint** y elige este repositorio. Render lee `render.yaml`.
3. Cuando te pida `AI_API_KEY`, pega tu clave. Si no usas Gemini, cambia también `AI_PROVIDER` (`groq` u `openrouter`).
4. Pulsa **Deploy**. En unos minutos tendrás una dirección como `https://adapticlass.onrender.com`.

En el plan gratuito de Render el servidor se duerme tras 15 minutos sin uso; la primera visita después tarda unos 30 segundos.

## Configuración

| Variable | Para qué sirve | Por defecto |
|---|---|---|
| `AI_PROVIDER` | `gemini`, `groq` u `openrouter` | `gemini` |
| `AI_API_KEY` | Clave del proveedor | — (obligatoria) |
| `AI_MODEL` | Forzar un modelo concreto | el recomendado del proveedor |
| `PORT` | Puerto del servidor | `3000` |
| `SITE_URL` | URL pública del sitio | automática |
| `AI_TIMEOUT_MS` | Tiempo máximo de espera de la IA | `120000` |
| `AI_MAX_REQUESTS_PER_5MIN` | Límite de peticiones por IP | `60` |

`OPENROUTER_API_KEY` de versiones anteriores sigue funcionando.

## Estructura

```
├── server.js              Servidor: archivos web + API de IA (sin dependencias)
├── public/
│   ├── index.html         Estructura de la interfaz
│   ├── styles.css         Diseño
│   └── app.js             Lógica de la plataforma y motor adaptativo
├── render.yaml            Despliegue en Render
├── .env.example           Plantilla de configuración
├── iniciar-windows.bat    Inicio con doble clic (Windows)
└── iniciar-mac.command    Inicio con doble clic (Mac)
```

## Limitaciones

Usuarios, grupos, respuestas y entregas se guardan en el navegador (`localStorage`). Por eso cada navegador tiene sus propios datos: un alumno en su computadora no ve los grupos creados en la del docente, aunque usen la misma dirección. Las contraseñas tampoco están cifradas y los archivos están limitados a 2 MB.

Para usarlo con un grupo real, el siguiente paso es guardar los datos en una base de datos del servidor (por ejemplo SQLite, PostgreSQL o Supabase) con contraseñas cifradas.
