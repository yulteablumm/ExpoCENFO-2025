

### ** Flujo de Datos Detallado**  


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

---
### Diagrama general del proyecto
<img width="50%" height="80%" alt="prueba corta(progra) - expo 1" src="https://github.com/user-attachments/assets/2c7bffe1-2ee9-406b-94bd-ad7a66aa6491" />




### **3. Requisitos Iniciales**  

1. **Modo Docente:**  
   - Consultas pedagógicas a la IA y que devuelva una respuesta.  
   - Generador de actividades diferenciadas (ej: *"3 ejercicios de suma con apoyo visual"*).  
2. **Modo Estudiante:**  
   - Explicaciones con lenguaje simple.  
   - Mini-juegos para reforzar aprendizajes (ej: memoria de conceptos).  
3. **Señales Visuales:**  
   - NeoPixel:  
     - **Violeta:** Modo docente activo.  
     - **Amarillo:** Modo estudiante.  
     - **Arcoíris:** Procesando consulta.
  
---

### **4. Diseño Preliminar del Sistema**  
- #### **Arquitectura inicial(diagrama)**  
<img width="1980" height="1020" alt="prueba corta(progra) - Copy of expo 1" src="https://github.com/user-attachments/assets/7a7719e4-c95d-40a7-9fff-867d533aac72" />
 
---

- #### **Componentes previstos:**  
  - Microcontrolador: ESP32  
  - Sensores/actuadores:  
    | Componente          | Función                             |
    |---------------------|-------------------------------------|  
    | **NeoPixel RGB**    | Feedback visual (colores/estados)   |
    | **Botón en interfaz**    | Cambiar modos (docente/estudiante)  | 
  
  ---
  
  - **LLM/API:**  
  En esta version se uso: deepseek/deepseek-r1-0528-qwen3-8b:free 

  Implementacion
  
  ```
 fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": "Bearer <OPENROUTER_API_KEY>",
    "HTTP-Referer": "<YOUR_SITE_URL>", // Optional. Site URL for rankings on openrouter.ai.
    "X-Title": "<YOUR_SITE_NAME>", // Optional. Site title for rankings on openrouter.ai.
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    "model": "deepseek/deepseek-r1-0528-qwen3-8b:free",
    "messages": [
      {
        "role": "user",
        "content": "What is the meaning of life?"
      }
    ]
  })
});
  ```
  
  **Función de cada librería**
  
  | Librería | Función |
  |---------|--------|
  | ESPAsyncWebServer | Servidor web asincrónico para manejar múltiples conexiones HTTP simultáneas |
  | AsyncTCP | Soporte para conexiones TCP no bloqueantes |
  | ArduinoJson | Manejo de estructuras JSON para la API y el frontend |
  | Adafruit NeoPixel | Control del LED RGB para visualizar estados del sistema |
  
  ---
  
  - **Archivos del Proyecto**
  
     `/src/main.cpp`: Lógica central de backend ESP32  
     `/data/index.html`: Interfaz web para el usuario  
     `/data/styles.css`: Estilos de la página  
     `/data/script.js`: Lógica cliente para interacción web  
     `platformio.ini`: Configuración del entorno PlatformIO  
  
    * **Backend (ESP32)**
      - **Control de estados:** Gestión de colores con NeoPixel según actividad o perfil (amarillo para estudiante, violeta para docente, rojo intermitente cuando hay respuesta disponible).
      - **Polling distribuido:** El servidor gestiona la pregunta y genera un `ID` único. Una tarea separada llama al modelo y publica la respuesta para ser consultada posteriormente.
      - **Gestión de modos:** Permite alternar entre perfiles con retroalimentación visual y lógica en el sistema.
      - **Integración con OpenRouter:** Utiliza `HTTPClient` para enviar preguntas y recibir respuestas JSON estructuradas.
    
    * **Frontend (HTML + JavaScript)**
      - Interfaz web intuitiva con pestañas para docentes y estudiantes.
      - Preguntas sugeridas según el perfil.
      - Campo de entrada y botón de envío que realiza POST a `/ask`.
      - Lógica de polling en JavaScript para mostrar la respuesta una vez esté lista.

---


### **5. Toma de desiciones y accion**  

#### **6.1 Asincronía**  
- **Problema**: Bloqueo durante consultas HTTP  
- **Solución**:  
  ```cpp
  xTaskCreatePinnedToCore(
    taskConsultaAPI,  // Función
    "API_Task",      // Nombre
    8192,            // Stack size
    (void*)&data,    // Parámetros
    1,               // Prioridad
    NULL,            // Handle
    1                // Core
  );
  ```

#### **6.2 Gestión de Memoria**  
- **Técnicas**:  
  - Pool de buffers JSON (reutilización)  
  - Limpieza agresiva de `pendingRequests`  
  - SPIFFS con rotación automática  

#### **6.3 Seguridad**  
| Capa               | Implementación                     |
|--------------------|------------------------------------|
| Red                | WiFi WPA2                          |
| API                | Claves en código (no recomendado para producción) |
| Web                | CORS restringido                   |

---

