

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

### Implementado en main.cpp
```
String callOpenRouterAPI(const char* question) {
  HTTPClient http;
  String url = String(OPENROUTER_API_URL);
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", String("Bearer ") + OPENROUTER_API_KEY);
  http.addHeader("HTTP-Referer", "https://tusitio.com"); // Opcional, cambia por tu URL
  http.addHeader("X-Title", "ESP32-Project"); // Opcional, cambia por el nombre de tu sitio

  // Construir el payload según OpenRouter
  DynamicJsonDocument doc(2048);
  doc["model"] = "deepseek/deepseek-r1-0528-qwen3-8b:free";
  JsonArray messages = doc.createNestedArray("messages");
  JsonObject userMsg = messages.createNestedObject();
  userMsg["role"] = "user";
  userMsg["content"] = question;

  String payload;
  serializeJson(doc, payload);

  int httpCode = http.POST(payload);
  String respuesta = "⛔ Error al conectar con OpenRouter";

  if (httpCode == 200) {
    String responseBody = http.getString();
    Serial.println("Respuesta OpenRouter:");
    Serial.println(responseBody);

    DynamicJsonDocument resDoc(8192);
    DeserializationError error = deserializeJson(resDoc, responseBody);

    if (!error && resDoc.containsKey("choices")) {
      respuesta = resDoc["choices"][0]["message"]["content"].as<String>();
    } else {
      respuesta = "⛔ Error al interpretar la respuesta de OpenRouter";
    }
  } else {
    Serial.print("Error en llamada API: ");
    Serial.println(httpCode);
    respuesta = "⛔ Código HTTP: " + String(httpCode);
    if (httpCode > 0) {
      String errorBody = http.getString();
      Serial.println("Respuesta de error:");
      Serial.println(errorBody);
    }
  }

  http.end(); // Finaliza la conexión HTTP
  return respuesta;
}
```
---

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

#### **Gestión de Memoria**  
- **Técnicas**:  
  - Pool de buffers JSON (reutilización)  
  - Limpieza agresiva de `pendingRequests`  
  - SPIFFS con rotación automática  



