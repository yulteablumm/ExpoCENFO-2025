
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

- ESP32 con conectividad WiFi.
- Navegador moderno compatible con HTML5, JavaScript y Web Speech API.
- Archivos cargados correctamente en la partición SPIFFS del ESP32 mediante PlatformIO.

### Carga SPIFFS con PlatformIO

1. Abre PlatformIO.
2. Ve a la carpeta del proyecto y selecciona `Platform`.
3. Ejecuta “Upload Filesystem Image” desde el menú.
4. Carga todos los archivos dentro de la carpeta `data`.

---

## Instrucciones de Uso

1. Encender el ESP32 con los archivos cargados.
2. Acceder desde el navegador a `http://[IP_DEL_ESP32]` o `http://esp32.local` si se usa mDNS.
3. Seleccionar el perfil deseado.
4. Elegir una pregunta sugerida o formular una nueva.
5. Hacer clic en “Preguntar”.
6. Revisar la respuesta y usar controles de voz o exportación según necesidad.
