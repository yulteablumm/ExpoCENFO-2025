# ESP32 Asistente IA educativo Multiperfil (Docente y Estudiante)  
**Versión 2**

## Público Meta y Propósito Educativo  
Este proyecto está diseñado para apoyar a docentes que trabajan con estudiantes de escuela con adecuaciones significativas y no significativas en sus procesos de aprendizaje. Su principal objetivo es facilitar la generación de material educativo adaptado, aprovechando la inteligencia artificial para responder preguntas contextualizadas y generar contenido útil. Al permitir que el maestro consulte a la IA directamente desde una interfaz física o web, se optimiza el tiempo de planificación, se fomenta la personalización del material y se promueve una participación más equitativa dentro del grupo. Esto contribuye a:  
· Responder rápidamente a dudas pedagógicas específicas.  
· Generar explicaciones, ejemplos y actividades según las necesidades del estudiante.  
· Alinear el contenido que se trabaja en clase de manera que todo el grupo avance en los mismos temas, respetando los ritmos individuales.  
· Promover la autonomía del docente en la creación de recursos sin depender de repositorios externos o procesos de búsqueda extensos.  

Este enfoque busca fortalecer prácticas educativas inclusivas mediante herramientas tecnológicas accesibles y funcionales. Este proyecto implementa una arquitectura distribuida entre hardware y web que permite la interacción con un modelo de lenguaje generativo alojado en OpenRouter. Mediante un ESP32, se construye un servidor web que ofrece dos perfiles de interacción: docente y estudiante. Al realizar una pregunta, el sistema genera una respuesta utilizando IA, la cual se presenta en una interfaz web y se acompaña de señales visuales mediante un NeoPixel.

## Objetivos del Proyecto  
· Permitir que un microcontrolador como el ESP32 interactúe en tiempo real con un modelo de lenguaje generativo.  
· Establecer un servidor web alojado directamente en la placa ESP32 para actuar de forma local.  
· Ofrecer un entorno multiperfil accesible para docentes y estudiantes.  
· Visualizar estados y respuestas del sistema mediante señales físicas (LED RGB) y web (interfaz HTML).  

## Descripción General del Funcionamiento
1. **Conexión inicial del ESP32 a una red WiFi**  
El microcontrolador utiliza las credenciales definidas en el código (`ssid` y `password`) para establecer la conexión con una red inalámbrica.  
Una vez conectada, se imprime en la consola serie la dirección IP local obtenida por el dispositivo, y se inicializa el servicio mDNS (`esp32.local`) para permitir el acceso desde navegadores por nombre, sin depender de una IP fija.  
Esta conexión es esencial para interactuar con la API de OpenRouter, así como para permitir la comunicación con navegadores dentro de la misma red local.

2. **Inicialización del servidor web local y montaje de SPIFFS**  
Se configura `ESPAsyncWebServer` en el puerto 80.  
Se monta el sistema de archivos SPIFFS, desde donde se sirven archivos estáticos como `index.html`, `style.css` y `script.js`.  
Esto permite que el ESP32 actúe como servidor web y ofrezca la interfaz multiperfil accesible desde cualquier navegador, sin requerir infraestructura adicional.  
Además, la funcionalidad mDNS integrada permite acceder al servidor usando `http://esp32.local` en lugar de la IP numérica.

3. **Gestión de peticiones asincrónicas mediante arquitectura de polling distribuido**  
Se expone el endpoint `/ask`, que recibe preguntas en formato JSON desde el navegador.  
Cada solicitud es procesada en una tarea independiente creada con `xTaskCreatePinnedToCore`, permitiendo que la interacción con la IA no bloquee el funcionamiento del servidor.  
La pregunta se almacena temporalmente junto a un identificador único (`id` generado por timestamp + número aleatorio) en una estructura tipo `map`, garantizando acceso individualizado.  
Durante el procesamiento, se activa el efecto visual **arcoíris dinámico** con NeoPixel, como indicador de actividad.  
La respuesta se obtiene desde la API de OpenRouter usando el modelo `DeepHermes 3 Llama 3 8B Preview`, y se almacena hasta que el cliente la solicite desde `/result?id=...`.

4. **Cambio dinámico de perfil mediante el endpoint `/setmode`**  
El sistema permite alternar entre dos perfiles funcionales (`"docente"` y `"estudiante"`), que se actualizan dinámicamente desde la interfaz web mediante una solicitud `POST`.  
Al recibir la solicitud, se actualiza la variable `currentMode`, y se modifica tanto la lógica del flujo como los efectos visuales del NeoPixel:  
· Violeta indica el modo docente  
· Amarillo indica el modo estudiante  
Este cambio también modifica las preguntas sugeridas en la interfaz, y puede ser extendido para producir respuestas adaptadas según el perfil.

5. **Interacción visual y registro de estado**  
Se emplea un LED RGB tipo NeoPixel como dispositivo de retroalimentación visual, con los siguientes estados:
· Modo estudiante: Amarillo fijo  
· Modo docente: Violeta fijo  
· Procesamiento en curso: Arcoíris dinámico  
· Respuesta lista: Parpadeo rojo intermitente  
El sistema se encarga de encender, cambiar de color y apagar el LED según la actividad. Una vez la respuesta ha sido generada, el LED parpadea en rojo y luego retorna al color del modo activo.

6. **Entrega de respuestas generadas por IA**  
Las preguntas son enviadas a la API de OpenRouter mediante `HTTPClient`, utilizando encabezados personalizados (Authorization, Referer, Title).  
La respuesta se recibe en formato JSON y se almacena en el servidor hasta que el cliente consulta su `id` correspondiente.  
Una vez consultada, se elimina del mapa de almacenamiento temporal.  
La lógica de frontend realiza polling cada segundo y actualiza la interfaz con la respuesta correspondiente.

## Componentes Principales  

### Backend (ESP32)  
· Control de estados: Gestión de colores con NeoPixel según actividad o perfil.  
· Polling distribuido: El servidor gestiona la pregunta y genera un ID único. Una tarea separada llama al modelo y publica la respuesta para ser consultada posteriormente.  
· Gestión de modos: Permite alternar entre perfiles con retroalimentación visual y lógica en el sistema.  
· Integración con OpenRouter: Utiliza `HTTPClient` para enviar preguntas y recibir respuestas JSON estructuradas desde el modelo DeepHermes 3 Llama 3 8B Preview.  
· mDNS: Servicio iniciado en el ESP32 para facilitar acceso desde el navegador sin necesidad de IP directa.  

### Frontend (HTML + JavaScript)  
**Cambios realizados:**  
· Se mejoró el diseño visual manteniendo una estructura simple y funcional.  
· Se añadieron pestañas para alternar entre perfiles docente y estudiante.  
· Preguntas sugeridas se adaptan al perfil activo.  
· Se implementó lógica de polling para consultar respuestas según el ID generado por el backend.  
· Se agregó retroalimentación en tiempo real en el campo de respuesta.  

## Librerías Utilizadas  

**En `platformio.ini`:**  
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

**Función de cada librería:**  

| Librería              | Función                                                                 |
|-----------------------|-------------------------------------------------------------------------|
| ESPAsyncWebServer     | Servidor web asincrónico para manejar múltiples conexiones HTTP         |
| AsyncTCP              | Soporte para conexiones TCP no bloqueantes                             |
| ArduinoJson           | Manejo de estructuras JSON para la API y el frontend                   |
| Adafruit NeoPixel     | Control del LED RGB para visualizar estados del sistema                |

## Archivos del Proyecto  
· `/src/main.cpp`: Lógica central de backend ESP32  
· `/data/index.html`: Interfaz web para el usuario  
· `/data/styles.css`: Estilos de la página  
· `/data/script.js`: Lógica cliente para interacción web  
· `platformio.ini`: Configuración del entorno PlatformIO  

## Tecnologías Utilizadas  
· Hardware: ESP32  
· Comunicación: HTTP  
· Interfaz Web: HTML, CSS y JavaScript básicos  
· Inteligencia Artificial: API externa (DeepHermes 3 Llama 3 vía OpenRouter)  
· Indicador visual: LED RGB  

## Imágenes y Otros Recursos
  •	Diagrama del flujo completo del sistema.
  
  •	Captura de pantalla de la interfaz web en modo docente.
  <img width="80%" height="50%" alt="image" src="https://github.com/user-attachments/assets/fa8f9219-9bf1-4abd-a8e0-2f4cdc25852b" />


  •	Captura de pantalla en modo estudiante con sugerencias de pregunta.
  <img width="80%" height="50%" alt="image" src="https://github.com/user-attachments/assets/88ee24bf-2add-4177-af5b-7237cce6b3de" />


  •	Foto del hardware montado con el NeoPixel encendido.
  
  Docente:
  
  <img width="80%" height="50%" alt="image" src="https://github.com/user-attachments/assets/26f9b80a-d4c5-43a6-aea7-2c14976c591a" />

  Estudiante:
  
<img width="80%" height="501%" alt="image" src="https://github.com/user-attachments/assets/f32563ba-877c-4cd4-af5c-6b3a3e7015dc" />



  •	Captura de consola con registros del sistema. 
  •	Videos

## Cambios en esta versióm
1. Historial de conversación segmentado por perfil:
   - El sistema ahora distingue entre historial del docente y del estudiante, almacenando cada uno por separado en el navegador mediante localStorage.
   - Cada entrada incluye pregunta realizada, respuesta generada, enlace a imagen contextual y registro visual.

2. Imágenes automáticas relacionadas:
   - Se integra Unsplash para generar imágenes temáticas basadas en las palabras clave de la pregunta.
   - Las imágenes se incorporan junto a la respuesta en la interfaz web y también en la exportación PDF.

3. Decoración contextual con íconos visuales:
   - Se añade una función que selecciona íconos decorativos relacionados con la pregunta para enriquecer la presentación de la respuesta en la interfaz.

4. Exportación extendida de historial a PDF:
   - La función para guardar conversaciones como documento PDF incluye ahora las imágenes obtenidas dinámicamente y mejoras en la paginación.

5. Exportación de actividades docentes a calendario (.ics):
   - Las actividades planeadas se pueden exportar en formato .ics, compatible con Google Calendar.
   - Incluye campos de fecha, título y descripción configurados por el usuario.

6. Mini juego motivacional:
   - Se incorporó un componente lúdico con ventana emergente que muestra mensajes positivos.
   - Se activa desde el panel docente y utiliza estilos visuales diferenciados.

7. Interacción por voz:
   - Se habilita el dictado de preguntas mediante reconocimiento de voz (SpeechRecognition), si el navegador lo permite.
   - Mejora la accesibilidad, especialmente para estudiantes con dificultades de motricidad.

8. Lectura automática de respuestas:
   - Se activa la lectura en voz alta de la última respuesta mediante SpeechSynthesis, con controles para pausar y detener.

9. Arquitectura de polling asincrónico refinada:
   - Las respuestas IA se generan en segundo plano y se entregan mediante el endpoint /result, que verifica periódicamente la disponibilidad.
   - Se elimina automáticamente la solicitud del sistema una vez respondida.

10. Función dedicada para llamadas IA mediante OpenRouter:
    - Se implementó `callOpenRouterAPI()` para interactuar con el modelo DeepHermes 3 Llama 3 8B Preview.
    - Se estructuran los mensajes en formato JSON, se envía por POST, y se valida la respuesta antes de ser entregada.

11. Estilo visual ampliado y adaptado:
    - Se agregaron animaciones diferenciadas por perfil, estilos gráficos renovados y jerarquía visual para elementos clave.
    - Se mejora la experiencia de usuario manteniendo claridad, orden y contraste en la interfaz.

12. Tip de ayuda aleatorio en el pie de página:
    - Se genera una sugerencia o recordatorio cada vez que se recarga la página para reforzar el uso funcional del sistema.

Estado: La versión 2 del sistema se encuentra operativa y estable. Integra funcionalidades ampliadas para accesibilidad, exportación, interacción lúdica y refinamiento técnico en la comunicación con el modelo de IA.
## Estado Actual del Proyecto (versión 2)  

## Cambios para añadir en una próxima versión  
  

## Créditos y Autoría  
Desarrollado por CRTL+Grils grupo conformado por:  
Fiorela Perez, Mariana Cubero, Sharon Castro y Yuliana González.
