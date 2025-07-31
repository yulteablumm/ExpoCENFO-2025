
# Interfaz Web

## Descripción General del Funcionamiento

La interfaz está diseñada para usarse con un servidor ESP32 y permite seleccionar entre dos perfiles: “Docente” y “Estudiante”.

- Al seleccionar un perfil, se actualiza el modo operativo del servidor mediante una solicitud POST al endpoint `/setmode`.
- Se presentan preguntas sugeridas, personalizadas por rol, que el usuario puede seleccionar o reemplazar con preguntas propias.
- Al hacer clic en “Preguntar”, la interfaz envía una solicitud POST al endpoint `/ask`.
- La respuesta se consulta mediante polling al endpoint `/result?id=...` hasta ser procesada.
- Las respuestas son mostradas en pantalla y pueden ser leídas en voz alta.
- El sistema incluye un calendario con exportación `.ics`, exportación de respuestas a PDF y minijuegos motivacionales.

---

## Archivos Incluidos

| Archivo        | Descripción |
|----------------|-------------|
| `index.html`   | Estructura de la interfaz web: pestañas de perfil, área de preguntas, respuestas, historial, calendario y minijuegos. |
| `style.css`    | Hoja de estilos con diseño responsivo, colores contrastantes, animaciones y tipografía accesible. |
| `script.js`    | Código funcional: selección de perfil, envío de preguntas, procesamiento de respuestas, calendario, exportaciones, minijuegos, reconocimiento y síntesis de voz. |

---

## Componentes Funcionales

### Selección de Perfil

```javascript
document.getElementById('tab-docente').onclick = async function() { ... };
document.getElementById('tab-estudiante').onclick = async function() { ... };
```

Envía una solicitud al backend para cambiar el modo entre `docente` y `estudiante`.

### Preguntas Sugeridas

```javascript
const sugeridasDocente = [...];
const sugeridasEstudiante = [...];
```

Se muestran botones de sugerencias que el usuario puede seleccionar para enviar directamente como pregunta.

### Envío de Pregunta y Consulta de Respuesta

```javascript
document.getElementById('ask-form').addEventListener('submit', sendQuestion);
pollingInterval = setInterval(() => checkResult(data.id, question), 1000);
```

Se inicia el proceso de pregunta y luego se consulta periódicamente la respuesta mediante el ID devuelto.

### Renderizado de Historial

```javascript
function getHistoryKey() {
  return currentMode === "docente" ? "chatHistoryDocente" : "chatHistoryEstudiante";
}
```

Permite segmentar el historial por perfil y almacenarlo en `localStorage`.

---

## Calendario y Exportación

### Registro y Visualización de Actividades

```javascript
function addPlan() { ... }
function renderCalendar() { ... }
```

Permite crear eventos personalizados y visualizarlos con fecha, título y descripción.

### Exportación en Formato `.ics`

```javascript
function exportCalendarICS() { ... }
```

Genera un archivo compatible con Google Calendar.

### Exportación de Historial en PDF

```javascript
document.getElementById('export-history').onclick = function() {
  // Generación de documento PDF con jsPDF
};
```

Convierte el historial de respuestas útiles en un archivo descargable.

---

## Funcionalidad de Voz

### Reconocimiento de Voz

```javascript
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) { ... }
```

Permite convertir voz en texto para realizar preguntas sin escribir.

### Lectura de Respuestas

```javascript
window.speechSynthesis.speak(utter);
```

Usa síntesis de voz para leer en voz alta la última respuesta generada.

---

## Minijuegos

El sistema incluye un modal interactivo con juegos simples diseñados para motivar o relajar a estudiantes.

```javascript
const minigameTypes = ["dino", "memoria", "ingles"];
function showMinigame() { ... }
```

El contenido del juego se presenta en un contenedor animado con estilo visual contrastante.

---

## Requisitos

- Dispositivo ESP32 con WiFi.
- Navegador moderno compatible con HTML5 y JavaScript.
- Archivos cargados en la partición SPIFFS del ESP32. Para esto debes cargar todos los documentos de la carpeta data, abriendo el archivo aqui una pequeña guia de como hacerlo.
    1. Selecciona el archivo.
       
       <img width="50%" height="80%" alt="image" src="https://github.com/user-attachments/assets/23e6cec1-f168-4805-a735-ea8d8981a609" />
    2. Ve a platform.io.
       
       <img width="40%" height="50%" alt="image" src="https://github.com/user-attachments/assets/956e657c-991e-4ec5-8798-9cf6d600cd1c" />
    3. Expande la carpeta del ideaboard, y la carpeta que dice Platform.
       
       <img width="40%" height="50%" alt="image" src="https://github.com/user-attachments/assets/3d89c455-2e23-487b-bce3-7e003a4e98ed" />
    4. Selecciona la opcion 'Upload Filesystem Image'
       
       <img width="50%" height="80%" alt="image" src="https://github.com/user-attachments/assets/de9c1733-8ea7-44fb-8490-ea04670a588c" />

    5. Y sigues los pasos anteriores con los demas archivos de data, seleccionas el archivo y lo subes a la placa...
  - Conexión a la red local donde el ESP32 está operativo.


---

## Instrucciones de Uso

1. Encender el ESP32 con los archivos del proyecto cargados vía SPIFFS.
2. Acceder desde el navegador web a `http://[IP_DEL_ESP32]` o `http://esp32.local` si se usa mDNS.
3. Seleccionar el perfil deseado: “Docente” o “Estudiante”.
4. Elegir una pregunta sugerida o escribir una nueva.
5. Hacer clic en “Preguntar”.
6. Esperar la respuesta generada por el motor de IA.
---

## Imágenes y Recursos

- Captura de pantalla de la interfaz web en modo docente.


- Captura de pantalla en modo estudiante con respuesta activa.


- Diagrama de flujo de la interacción entre interfaz y backend.
  
  <img width="20%" height="50%" alt="EXPOCENFO drawio" src="https://github.com/user-attachments/assets/c12e9ae9-4991-4bae-81f6-bf31225c1841" />

- Esquema técnico de endpoints y comunicación HTTP entre frontend y ESP32.
  La comunicación entre la interfaz web y el servidor ESP32 se realiza mediante peticiones HTTP locales. El sistema está compuesto por los siguientes endpoints:

| Método | Endpoint         | Descripción |
|--------|------------------|-------------|
| `POST` | `/setmode`       | Cambia el modo del sistema entre `"docente"` y `"estudiante"`. Se envía un cuerpo JSON: `{ "mode": "docente" }` o `{ "mode": "estudiante" }`. |
| `POST` | `/ask`           | Envía la pregunta formulada por el usuario al servidor ESP32. El cuerpo contiene un JSON con la estructura `{ "question": "..." }`. Devuelve un identificador único de la solicitud. |
| `GET`  | `/result?id=XYZ` | Consulta periódicamente si la respuesta generada por la IA está disponible. Se recibe la respuesta en formato JSON o `null` si aún no ha sido procesada. |
| `GET`  | `/calendar.ics`  | Descarga el archivo de planeamiento educativo en formato `.ics`, generado desde el calendario del perfil docente. |
| `GET`  | `/assets/`       | Sirve archivos estáticos desde SPIFFS: `index.html`, `style.css` y `script.js`, utilizados por la interfaz web. |

## Consideraciones de Accesibilidad

- Botones con buen contraste para facilitar la visibilidad.
- Campos con texto de ayuda (`placeholder`) para guiar al usuario.
- Área de respuestas con tamaño y fondo adecuado para facilitar lectura.
- Diseño adaptable a pantallas móviles mediante `viewport`, márgenes centralizados y disposición responsiva.

---
