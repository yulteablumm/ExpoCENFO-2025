# Interfaz Web
## Descripción General del Funcionamiento

- La interfaz ofrece dos pestañas: “Docente” y “Estudiante”.
- Al seleccionar un perfil, se actualiza el modo operativo del servidor ESP32 mediante una solicitud POST al endpoint `/setmode`.
- En cada sección se presentan preguntas sugeridas que pueden ser seleccionadas por el usuario.
- El usuario puede formular una pregunta personalizada en el campo de entrada.
- Al hacer clic en “Preguntar”, se envía una solicitud POST al endpoint `/ask` con la pregunta.
- La respuesta es consultada periódicamente mediante polling al endpoint `/result?id=...` hasta que esté disponible.
- La respuesta se muestra en pantalla dentro del área `#response`.

---

## Archivos Incluidos

| Archivo         | Descripción |
|----------------|-------------|
| `index.html`   | Archivo principal que contiene la estructura de la interfaz. Se sirve desde SPIFFS en el ESP32. |
| `style.css`    | Archivo de estilos visuales: estructura responsive, animaciones, diseño visual inclusivo. |
| `script.js`    | Lógica de la aplicación: envío de preguntas, cambio de perfil, renderizado de historial, sugerencias, minijuegos, exportaciones. |

---

## Estructura de Código

### Pestañas de perfil

```javascript
document.getElementById('tab-docente').onclick = async function() { ... };
document.getElementById('tab-estudiante').onclick = async function() { ... };
```

Actualiza el modo de interacción del servidor entre “docente” y “estudiante”.

### Preguntas sugeridas

```javascript
const sugeridasDocente = [ ... ];
const sugeridasEstudiante = [ ... ];
```

Cada perfil tiene preguntas contextualizadas que pueden ser seleccionadas con un clic.

### Envío de pregunta

```javascript
document.getElementById('ask-form').addEventListener('submit', sendQuestion);
```

La pregunta se envía como JSON, iniciando el proceso de generación de respuesta en el servidor.

### Consulta de respuesta

```javascript
pollingInterval = setInterval(() => checkResult(data.id), 1000);
```

Se consulta al servidor cada segundo hasta que la respuesta esté lista.

### Historial

Las preguntas y respuestas se guardan por separado según el perfil activo, usando `localStorage`:

```javascript
function getHistoryKey() {
  return currentMode === "docente" ? "chatHistoryDocente" : "chatHistoryEstudiante";
}
```

### Calendario y exportación

Permite agregar eventos a un planificador y exportarlos en formato `.ics` compatible con Google Calendar.

```javascript
function exportCalendarICS() { ... }
function addPlan() { ... }
```

Las respuestas útiles pueden exportarse como documento `.pdf` mediante `jsPDF`.

```javascript
document.getElementById('export-history').onclick = function() {
  // Código que genera PDF con historial
};
```

### Minijuegos

El sistema integra juegos educativos adaptados a estudiantes:

- Dino: juego de salto con obstáculos
- Memoria: juego para reforzar reconocimiento visual
- Inglés: tarjetas con vocabulario básico

```javascript
const minigameTypes = ["dino", "memoria", "ingles"];
function showMinigame() { ... }
```

---

## Requisitos

- Dispositivo ESP32 con WiFi.
- Navegador moderno compatible con HTML5 y JavaScript.
- Archivos cargados en la partición SPIFFS del ESP32. Para esto debes cargar todos los documentos de la carpeta data, abriendo el archivo aqui un pequeño tutorial de como hacerlo.
    1. Selecciona el archivo.
       
       <img width="50%" height="70%" alt="image" src="https://github.com/user-attachments/assets/23e6cec1-f168-4805-a735-ea8d8981a609" />
    3. Ve a platform.io.
       
       <img width="40%" height="50%" alt="image" src="https://github.com/user-attachments/assets/956e657c-991e-4ec5-8798-9cf6d600cd1c" />
    5. Expande la carpeta del ideaboard, y la carpeta que dice Platform.
       
       <img width="40%" height="50%" alt="image" src="https://github.com/user-attachments/assets/3d89c455-2e23-487b-bce3-7e003a4e98ed" />
    7. Selecciona la opcion 'Upload Filesystem Image'
       
       <img width="30%" height="50%" alt="image" src="https://github.com/user-attachments/assets/de9c1733-8ea7-44fb-8490-ea04670a588c" />

    9. Y sigues los pasos anteriores con los demas archivos de data, seleccionas el archivo y lo subes a la placa...
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
- Esquema técnico de endpoints y comunicación HTTP entre frontend y ESP32.

---

## Consideraciones de Accesibilidad

- Botones con buen contraste para facilitar la visibilidad.
- Campos con texto de ayuda (`placeholder`) para guiar al usuario.
- Área de respuestas con tamaño y fondo adecuado para facilitar lectura.
- Diseño adaptable a pantallas móviles mediante `viewport`, márgenes centralizados y disposición responsiva.

---

## Licencia y Créditos

Proyecto diseñado por Yuliana, estudiante de Ingeniería en Tecnologías de Información y Comunicación, como parte de una propuesta educativa inclusiva basada en microcontroladores, IA y diseño accesible.

Este proyecto está disponible para fines educativos y no comerciales.

```

---

¿Te gustaría que agregue ejemplos de cómo se ven las capturas o un esquema de rutas de servidor en formato Markdown también? Si estás preparando un Wiki público, podríamos desglosarlo en secciones más técnicas.
