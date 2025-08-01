# ESP32 Asistente IA educativo Multiperfil (Docente y Estudiante)
**Versión 3**

## Público Meta y Propósito Educativo
Este proyecto está diseñado para apoyar a docentes que trabajan con estudiantes de escuela con adecuaciones significativas y no significativas en sus procesos de aprendizaje. Su principal objetivo es facilitar la generación de material educativo adaptado, aprovechando la inteligencia artificial para responder preguntas contextualizadas y generar contenido útil.
Al permitir que el maestro consulte a la IA directamente desde una interfaz física o web, se optimiza el tiempo de planificación, se fomenta la personalización del material y se promueve una participación más equitativa dentro del grupo. Esto contribuye a:
- Responder rápidamente a dudas pedagógicas específicas.
- Generar explicaciones, ejemplos y actividades según las necesidades del estudiante.
- Alinear el contenido que se trabaja en clase de manera que todo el grupo avance en los mismos temas, respetando los ritmos individuales.
- Promover la autonomía del docente en la creación de recursos sin depender de repositorios externos o procesos de búsqueda extensos.

Este enfoque busca fortalecer prácticas educativas inclusivas mediante herramientas tecnológicas accesibles y funcionales.
Este proyecto implementa una arquitectura distribuida entre hardware y web que permite la interacción con un modelo de lenguaje generativo alojado en OpenRouter. Mediante un ESP32, se construye un servidor web que ofrece dos perfiles de interacción: docente y estudiante. Al realizar una pregunta, el sistema genera una respuesta utilizando IA, la cual se presenta en una interfaz web y se acompaña de señales visuales mediante un NeoPixel.

## Objetivos del Proyecto
- Permitir que un microcontrolador como el ESP32 interactúe en tiempo real con un modelo de lenguaje generativo.
- Establecer un servidor web alojado directamente en la placa ESP32 para actuar de forma local.
- Ofrecer un entorno multiperfil accesible para docentes y estudiantes.
- Visualizar estados y respuestas del sistema mediante señales físicas (LED RGB) y web (interfaz HTML).

## Descripción General del Funcionamiento
1. **Conexión inicial del ESP32 a una red WiFi**
   - El microcontrolador utiliza las credenciales definidas en el código para conectarse a una red inalámbrica.
   - Una vez establecida la conexión, se imprime la dirección IP local en la consola serie.
   - Esta conexión es fundamental para acceder a la API de OpenRouter y permitir la comunicación con navegadores en la misma red.

2. **Inicialización del servidor web local y montaje de SPIFFS**
   - Se configura `ESPAsyncWebServer` en el puerto 80.
   - Se monta el sistema de archivos SPIFFS para servir archivos estáticos como `index.html`, `style.css` y `script.js`.
   - Esto permite que el ESP32 funcione como un servidor web accesible desde cualquier navegador de la red local, sin requerir servidores externos.

3. **Gestión de peticiones asincrónicas mediante arquitectura de polling**
   - El sistema expone un endpoint `/ask` que acepta preguntas en formato JSON.
   - Cada pregunta se procesa en una tarea separada utilizando `xTaskCreatePinnedToCore`, lo cual permite paralelismo sin bloquear el hilo principal.
   - Se asigna un identificador único (`id`) a cada solicitud, que puede ser consultado posteriormente en `/result` para obtener la respuesta generada.
   - Durante la generación de la respuesta, se activa un efecto visual con NeoPixel (arcoíris dinámico), indicando que el sistema está procesando.

4. **Cambio dinámico de perfil mediante el endpoint `/setmode`**
   - El sistema permite alternar entre dos perfiles funcionales: “docente” y “estudiante”.
   - Al recibir una solicitud válida, se actualiza la variable de estado `currentMode`, ajustando la lógica del flujo y los colores del NeoPixel:
     - Violeta para modo docente
     - Amarillo para modo estudiante
   - Esto también impacta en los textos sugeridos en la interfaz web y puede ser extendido a respuestas diferenciadas por perfil.

5. **Interacción visual y registro de estado**
   - Se utiliza un NeoPixel como dispositivo de retroalimentación visual:
     - Indica el estado actual del sistema (perfil activo, procesamiento en curso, respuesta lista).
     - Cambia de color y parpadea para marcar eventos importantes.
  
6. **Entrega de respuestas generadas por IA**
   - Las preguntas son enviadas a la API de OpenRouter utilizando `HTTPClient` y encabezados personalizados.
   - El modelo utilizado es “DeepHermes 3 Llama 3 8B Preview”, lo que asegura generación de lenguaje coherente y contextual.
   - Las respuestas se reciben en formato JSON, se extraen y almacenan temporalmente hasta que el cliente las consulta por `id`.

Este diseño es centrado en el usuario, tanto en la interacción física con el microcontrolador como en la experiencia web, integrando la IA de manera accesible.


## Componentes Principales

### Backend (ESP32)
- **Control de estados:** Gestión de colores con NeoPixel según actividad o perfil (amarillo para estudiante, violeta para docente, rojo intermitente cuando hay respuesta disponible).
- **Polling distribuido:** El servidor gestiona la pregunta y genera un `ID` único. Una tarea separada llama al modelo y publica la respuesta para ser consultada posteriormente.
- **Gestión de modos:** Permite alternar entre perfiles con retroalimentación visual y lógica en el sistema.
- **Integración con OpenRouter:** Utiliza `HTTPClient` para enviar preguntas y recibir respuestas JSON estructuradas.

### Frontend (HTML + JavaScript)
- Interfaz web intuitiva con pestañas para docentes y estudiantes.
- Preguntas sugeridas según el perfil.
- Campo de entrada y botón de envío que realiza POST a `/ask`.
- Lógica de polling en JavaScript para mostrar la respuesta una vez esté lista.

## Librerías Utilizadas

### En `platformio.ini`:

```ini
[env:esp32dev]
platform = espressif32
board = esp32dev
framework = arduino
monitor_speed = 115200
lib_deps =
  ESPAsyncWebServer
  AsyncTCP
  bblanchon/ArduinoJson@^7.4.2
  adafruit/Adafruit NeoPixel@^1.15.1
```

### Función de cada librería

| Librería | Función |
|---------|--------|
| ESPAsyncWebServer | Servidor web asincrónico para manejar múltiples conexiones HTTP simultáneas |
| AsyncTCP | Soporte para conexiones TCP no bloqueantes |
| ArduinoJson | Manejo de estructuras JSON para la API y el frontend |
| Adafruit NeoPixel | Control del LED RGB para visualizar estados del sistema |

## Archivos del Proyecto

- `/src/main.cpp`: Lógica central de backend ESP32
- `/data/index.html`: Interfaz web para el usuario
- `/data/styles.css`: Estilos de la página
- `/data/script.js`: Lógica cliente para interacción web
- `platformio.ini`: Configuración del entorno PlatformIO


## Tecnologías Utilizadas:
- Hardware: ESP32
- Comunicación: HTTP
- Interfaz Web: HTML, CSS y JavaScript básicos
- Inteligencia Artificial: API externa (de momento se utiliza un modelo de IA de Deep seek.
- Indicador visual: LED RGB

## Imágenes y Otros Recursos

- Diagrama del flujo completo del sistema.
 <img width="50%" height="90%" alt="image" src="https://github.com/user-attachments/assets/12b44e23-714a-40a6-838d-fb15b9479b85" />

- Captura de pantalla de la interfaz web en modo docente.

<img width="50%" height="80%" alt="image" src="https://github.com/user-attachments/assets/bc57e6a3-6aea-4441-ac96-48d75702f2c7" />


<img width="50%" height="80%" alt="image" src="https://github.com/user-attachments/assets/a500bc6f-3f2e-4f5b-af5b-1dcc04bb6b25" />


<img width="50%" height="80%" alt="image" src="https://github.com/user-attachments/assets/885f118e-5baf-41f9-958a-9ab956efa717" />

- Captura de pantalla en modo estudiante.
  
  <img width="50%" height="80%" alt="image" src="https://github.com/user-attachments/assets/93dfbcca-9cbd-46aa-8f39-a824e5369199" />

<img width="50%" height="80%" alt="image" src="https://github.com/user-attachments/assets/8078ecb0-e612-4c50-a59e-340b08285126" />

<img width="50%" height="80%" alt="image" src="https://github.com/user-attachments/assets/a7fcdb56-76da-4770-9b15-35e2b09a1545" />

<img width="50%" height="80%" alt="image" src="https://github.com/user-attachments/assets/889490d0-e43a-41b4-ae23-a19e0ce03c23" />


- Foto del hardware montado con el NeoPixel encendido.

  Docente:
  
   <img width="50%" height="80%" alt="image" src="https://github.com/user-attachments/assets/e6188533-5e66-4b83-a708-c35736fabb72" />

 
   Estudiante:
  
   <img width="50%" height="80%" alt="image" src="https://github.com/user-attachments/assets/c60f17e2-9cb8-4abc-a285-c4231b7e5fb8" />


- Captura de consola con registros del sistema.

<img width="50%" height="80%" alt="image" src="https://github.com/user-attachments/assets/24231e3e-bb5b-4770-955b-f2c15a0cf178" />

- Videos
   

https://github.com/user-attachments/assets/cdf8cd0f-599a-4581-9e31-f6405b9b8482



https://github.com/user-attachments/assets/6fafd910-5a34-46d5-afcf-4755e3546ff6


---

## Requisitos previos

   - Dispositivo ESP32 con WiFi.
   - Navegador moderno compatible con HTML5 y JavaScript.
   - ESP32 DevKit
   - NeoPixel RGB LED
   - Plataforma PlatformIO o Arduino IDE configurada
   - Acceso a API de OpenRouter con modelo habilitado
   - Conexión a la red local donde el ESP32 está operativo.


---

## Instrucciones de Implementación

1. Subir contenido del frontend a `/data` usando SPIFFS (PlatformIO).
2. Configurar credenciales WiFi y API key directamente en el código.
3. Subir archivos de data a la placa ESP32. Aqui una pequeña guia de como hacerlo:
   - Selecciona el archivo.
       
       <img width="50%" height="80%" alt="image" src="https://github.com/user-attachments/assets/23e6cec1-f168-4805-a735-ea8d8981a609" />
   - Ve a platform.io.
       
       <img width="40%" height="50%" alt="image" src="https://github.com/user-attachments/assets/956e657c-991e-4ec5-8798-9cf6d600cd1c" />
       
   - Expande la carpeta del ideaboard, y la carpeta que dice Platform.
       
       <img width="40%" height="50%" alt="image" src="https://github.com/user-attachments/assets/3d89c455-2e23-487b-bce3-7e003a4e98ed" />
   - Selecciona la opcion 'Upload Filesystem Image'
       
       <img width="50%" height="80%" alt="image" src="https://github.com/user-attachments/assets/de9c1733-8ea7-44fb-8490-ea04670a588c" />

   - Y sigues los pasos anteriores con los demas archivos de data, seleccionas el archivo y lo subes a la placa...
4. Compilar y flashear el firmware en el ESP32.
5. Acceder vía navegador a `http://esp32.local` o IP local.
6. Interactuar seleccionando el perfil y escribiendo preguntas en el asistente.

---

## Instrucciones de Uso

1. Encender el ESP32 con los archivos del proyecto cargados vía SPIFFS.
2. Acceder desde el navegador web a `http://[IP_DEL_ESP32]` o `http://esp32.local` si se usa mDNS.
3. Seleccionar el perfil deseado: “Docente” o “Estudiante”.
4. Elegir una pregunta sugerida o escribir una nueva.
5. Hacer clic en “Preguntar”.
6. Esperar la respuesta generada por el motor de IA.
   
---

## Estado Actual del proyecto (version 3):
La versión 3 del sistema se encuentra operativa y estable. Implementa un backend sobre ESP32 que permite crear una herramienta educativa interactiva. A través de su interfaz web local servida desde SPIFFS, el usuario puede realizar preguntas que son procesadas mediante la API de OpenRouter, mostrando las respuestas tanto visualmente con NeoPixels como en la interfaz. La arquitectura incluye gestión de estados, comunicación HTTP, análisis de respuestas en JSON, y control del sistema desde cualquier navegador en la misma red local. Además, está diseñado para ser modular y fácilmente replicable en entornos educativos.

## Cambios para añadir en una proxima version


## Créditos
Desarrollado por **CRTL+Girls** grupo conformado por:
Fiorela Perez, Mariana Cubero, Sharon Castro y Yuliana González.


