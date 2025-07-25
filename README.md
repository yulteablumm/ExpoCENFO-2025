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

Por supuesto, Yuliana. A continuación te presento la sección **“Descripción General del Funcionamiento”** en el mismo estilo formal del documento PDF original, pero actualizada y explicada punto por punto con las mejoras y elementos nuevos integrados en la versión 2 según el código que me compartiste.

---

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

## Principios Computacionales Aplicados  
· Procesamiento distribuido con tareas asincrónicas en tiempo real.  
· Integración entre sistemas físicos (Edge Computing) y modelos de IA generativa.  
· Entropía informacional y variabilidad algorítmica en lenguaje natural.  
· Interacción estocástica y sensible al contexto mediante LLMs.  

## Tecnologías Utilizadas  
· Hardware: ESP32  
· Comunicación: HTTP  
· Interfaz Web: HTML, CSS y JavaScript básicos  
· Inteligencia Artificial: API externa (DeepHermes 3 Llama 3 vía OpenRouter)  
· Indicador visual: LED RGB  

## Imágenes y Otros Recursos
  •	Diagrama del flujo completo del sistema.
  •	Captura de pantalla de la interfaz web en modo docente.
  •	Captura de pantalla en modo estudiante con sugerencias de pregunta.
  •	Foto del hardware montado con el NeoPixel encendido.
  Docente:
  Estudiante:
  •	Captura de consola con registros del sistema. 
  •	Videos


## Estado Actual del Proyecto (versión 2)  
El sistema cuenta con una versión funcional mejorada. La página alojada en el ESP32 permite enviar preguntas y recibir respuestas diferenciadas por perfil. Se incluyen efectos visuales en el NeoPixel para mejorar la experiencia, así como una interfaz web multiperfil sencilla, pero sólida y lista para ser ampliada.

## Cambios para añadir en una próxima versión  
· Implementar autenticación por tipo de usuario (docente/estudiante).  
· Mejorar el diseño estético y accesibilidad de la interfaz web.  
· Incluir registro de sesiones y historial de preguntas.  

## Créditos y Autoría  
Desarrollado por CRTL+Grils grupo conformado por:  
Fiorela Perez, Mariana Cubero, Sharon Castro y Yuliana González.
