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


### **Arquitectura del Sistema en el proceamiento**  

#### **1. Percepción (Sensores y Recolección de Datos)**  
**Componentes activos en el código enviado**:  
- **Entrada única**: Consultas HTTP POST a `/ask` con JSON:  
  ```json
  {
    "question": "...",
    "mode": "docente/estudiante"  // Sensor virtual de modo
  }
  ```
- **Feedback visual**: LED NeoPixel (GPIO2) como actuador de estado.    
- El "modo" se detecta vía software (`currentMode`).  

---

#### **2. Procesamiento Local (Microcontrolador)**  
**Funciones clave (extraídas del código)**:  
- **Manejo de memoria**:  
  ```cpp
  std::map<String, PendingRequest> pendingRequests;  // Almacena consultas en RAM
  ```
- **Multitarea**:  
  ```cpp
  xTaskCreatePinnedToCore(apiTask, "API_Task", 8192, NULL, 1, NULL, 1);  // Usa FreeRTOS
  ```
- **Preprocesamiento mínimo**:  
  ```cpp
  String generarPrompt(String pregunta) {
    return (currentMode == "docente") ? 
      "Explique para docentes: " + pregunta : 
      "Simplifique para niños: " + pregunta;
  }
  ```

---

#### **3. Comunicación con el LLM (API OpenRouter)**  
**Flujo exacto del código**:  
1. **Configuración HTTP**:  
   ```cpp
   http.begin(OPENROUTER_API_URL);
   http.addHeader("Authorization", "Bearer " + OPENROUTER_API_KEY);
   ```
2. **Estructura del payload**:  
   ```json
   {
     "model": "deepseek/deepseek-r1-0528-qwen3-8b:free",
     "messages": [{"role": "user", "content": "..."}]
   }
   ```
3. **Manejo de errores**:  
   ```cpp
   if (httpCode != 200) {
     respuesta = "⛔ Error HTTP: " + String(httpCode);
   }
   ```

---

#### **4. Toma de Decisiones y Acción**  
**Lógica implementada**:  
- **Modo docente vs. estudiante**:  
  ```cpp
  void updateModeLED() {
    if (currentMode == "estudiante") setLEDColor(255, 255, 0);  // Amarillo
    else setLEDColor(128, 0, 128);  // Violeta
  }
  ```
- **Acciones post-respuesta**:  
  - Almacenar en `pendingRequests`.  
  - Parpadear LED en rojo 2 veces.  
  - Liberar memoria al entregar respuesta.  

---

### **Diagrama de Flujo Exacto (Basado en el Código)**  

---
### **Funciones mas importantes**  
### **1. `setup()`**  
**Propósito**: Inicialización del sistema.  
**Componentes críticos**:  
```cpp
void setup() {
  Serial.begin(115200);
  strip.begin();  // Inicializa NeoPixel
  SPIFFS.begin(true);  // Monta sistema de archivos
  WiFi.begin(ssid, password);  // Conexión WiFi
  server.begin();  // Inicia servidor web
  MDNS.begin("esp32");  // Configura mDNS
  updateModeLED();  // Establece color inicial
}
```
**Flujo**:  
1. Configura comunicación serial para depuración.  
2. Inicializa hardware (LED, SPIFFS).  
3. Conecta a WiFi y activa servidor web (puerto 80).  
4. Establece modo inicial (docente/estudiante) via LED.

---

### **2. `callOpenRouterAPI(const char* question)`**  
**Propósito**: Consulta al modelo de IA.  
**Estructura clave**:  
```cpp
String callOpenRouterAPI(const char* question) {
  HTTPClient http;
  http.begin(OPENROUTER_API_URL);
  http.addHeader("Authorization", String("Bearer ") + OPENROUTER_API_KEY);
  
  DynamicJsonDocument doc(2048);
  doc["model"] = "deepseek/deepseek-r1-0528-qwen3-8b:free";
  // ... (construcción del JSON)
  
  int httpCode = http.POST(payload);
  if (httpCode == 200) {
    // Procesa respuesta JSON
  }
  http.end();
  return respuesta;
}
```
**Proceso**:  
1. Configura conexión HTTPS a OpenRouter.  
2. Construye payload con el prompt estructurado.  
3. Maneja errores HTTP y parsea respuesta JSON.  

---

### **3. `updateModeLED()`**  
**Propósito**: Feedback visual del modo actual.  
**Lógica**:  
```cpp
void updateModeLED() {
  if (currentMode == "estudiante") {
    setLEDColor(255, 255, 0);  // Amarillo
  } else {
    setLEDColor(128, 0, 128);  // Violeta
  }
}
```
**Uso**: Se llama al cambiar de modo (`/setmode`).

---

### **4. `setLEDColor(uint8_t r, uint8_t g, uint8_t b)`**  
**Propósito**: Controlar el NeoPixel.  
**Detalles**:  
```cpp
void setLEDColor(uint8_t r, uint8_t g, uint8_t b) {
  strip.setPixelColor(0, strip.Color(r, g, b));
  strip.show();
}
```
**Efectos**:  
- Rojo: Error  
- Arcoíris: Procesando consulta  
- Violeta/Amarillo: Modo activo  

---

### **5. Handlers de Endpoints**  
#### **POST `/ask`**  
```cpp
server.on("/ask", HTTP_POST, [](AsyncWebServerRequest *request){}, NULL,
  [](...){
    // Genera ID único
    String id = String(millis()) + String(random(1000,9999));
    pendingRequests[id] = {question, "", false};
    
    // Llama a la IA en segundo plano
    xTaskCreatePinnedToCore(apiTask, "API_Task", 8192, tdata, 1, NULL, 1);
  });
```
**Flujo**:  
1. Recibe pregunta via JSON.  
2. Crea tarea asíncrona para consultar IA.  
3. Devuelve ID para seguimiento.  

#### **GET `/result`**  
```cpp
server.on("/result", HTTP_GET, [](AsyncWebServerRequest *request){
  String id = request->getParam("id")->value();
  if (pendingRequests.count(id)) {
    request->send(200, "application/json", pendingRequests[id].response);
    pendingRequests.erase(id);  // Libera memoria
  }
});
```
**Propósito**: Polling para obtener respuestas listas.

---

### **6. Funciones de Efectos LED**  
#### `startRainbow()` / `stopRainbow()`  
**Uso**: Indicar procesamiento en curso.  
```cpp
void rainbowTask(void* parameter) {
  while (rainbowActive) {
    uint32_t color = strip.ColorHSV((j * 65536L) / 256);
    strip.setPixelColor(0, color);
    j = (j + 1) % 256;
    vTaskDelay(20 / portTICK_PERIOD_MS);
  }
  vTaskDelete(NULL);
}
```

---

### **7. Manejo de Memoria (`pendingRequests`)**  
**Estructura**:  
```cpp
struct PendingRequest {
  String question;
  String response;
  bool ready;
};
std::map<String, PendingRequest> pendingRequests;
```
**Función**:  
- Almacena consultas pendientes en RAM.  
- Se limpia al entregar respuesta (`/result`).  

---

### **Flujo Principal Resumido**  
1. **Inicio**: `setup()` configura hardware y servidor.  
2. **Consulta**: Usuario → POST `/ask` → ESP32 crea tarea para IA.  
3. **Procesamiento**: LED arcoíris + llamada a `callOpenRouterAPI()`.  
4. **Respuesta**: Almacena en `pendingRequests` → GET `/result` la recupera.  
5. **Feedback**: LED parpadea rojo al finalizar.  

---









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



