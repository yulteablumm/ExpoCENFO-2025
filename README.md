# ESP32 Asistente IA educativo Multiperfil (Docente y Estudiante)

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

## Principios Computacionales Aplicados
- Procesamiento distribuido con tareas asincrónicas en tiempo real.
- Integración entre sistemas físicos (Edge Computing) y modelos de IA generativa.
- Entropía informacional y variabilidad algorítmica en lenguaje natural.
- Interacción estocástica y sensible al contexto mediante LLMs.

## Tecnologías Utilizadas:
- Hardware: ESP32
- Comunicación: HTTP
- Interfaz Web: HTML, CSS y JavaScript básicos
- Inteligencia Artificial: API externa (de momento se utiliza un modelo de IA de Deep seek.
- Indicador visual: LED RGB

## Imágenes y Otros Recursos

- Diagrama del flujo completo del sistema.
  
  <img width="50%" height="90%" alt="diagrama_flujo_esp32" src="https://github.com/user-attachments/assets/8c3f8375-768a-484b-a166-9212d5a22fc0" />

- Captura de pantalla de la interfaz web en modo docente.

  
  <img width="50%" height="30%" alt="Docente" src="https://github.com/user-attachments/assets/56ebfa70-dd5d-4cf7-aad3-9f389168b5c9" />
   
- Captura de pantalla en modo estudiante con sugerencias de pregunta.
  
  <img width="50%" height="20%" alt="Estudiante" src="https://github.com/user-attachments/assets/fbf47b94-1807-44f4-808b-c9d08a127752" />
 
- Foto del hardware montado con el NeoPixel encendido.


   Docente:<br>
   <img src="https://github.com/user-attachments/assets/20a0573d-2477-4e6c-94b6-e7dbcf249715" alt="LED-Docente" width="500"><br><br>

   Estudiante:<br>
   <img src="https://github.com/user-attachments/assets/eecc68fd-dd3a-449c-9d95-ebb605954f59" alt="LED-Estudiante" width="500">

- Captura de consola con registros del sistema.
  <img width="800" height="400" alt="Screenshot 2025-07-22 142158" src="https://github.com/user-attachments/assets/a0fe192e-edd5-42d4-ae1a-b71a690cac07" />

## Estado Actual del proyecto en esta version:
El sistema ya cuenta con una versión funcional básica. Se puede acceder a la página alojada en el ESP32, enviar mensajes a la IA, recibir respuestas, y observar los indicadores visuales LED correspondientes al estado del sistema. La interfaz es simple, pero funcional y lista para ser ampliada en futuras versiones.

## Cambios para añadir en una proxima version
- Agregar autenticación por tipo de usuario
- Mejorar diseño de la interfaz web

## Créditos y Autoría
Desarrollado por **CRTL+Grils** grupo conformado por:
Fiorela Perez, Mariana Cubero, Sharon Castro y Yuliana González.


