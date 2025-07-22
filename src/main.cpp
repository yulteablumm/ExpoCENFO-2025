#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <SPIFFS.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <ESPmDNS.h>
#include <map>
#include <Adafruit_NeoPixel.h> // Librería para controlar NeoPixel
ngRequest {
  String question;
  String response;
  bool ready;
};
static std::map<String, PendingRequest> pendingRequests;

#define LED_PIN 2 // Pin de datos del NeoPixel
#define NUM_LEDS 1 // Solo un LED NeoPixel
Adafruit_NeoPixel strip(NUM_LEDS, LED_PIN, NEO_GRB + NEO_KHZ800);

// Cambia estos datos por los de tu red WiFi
const char* ssid = "Amigurumitos";
const char* password = "17032001";

// OpenRouter API endpoint y tu clave
const char* OPENROUTER_API_URL = "aqui se pone la URL del modelo de lenguaje";
const char* OPENROUTER_API_KEY = "aqui se pone la API key generada del modelo de lenguaje";

AsyncWebServer server(80);

// Prototipo de la función para evitar error de declaración
String callOpenRouterAPI(const char* question);

// Cambia el color del NeoPixel
void setLEDColor(uint8_t r, uint8_t g, uint8_t b) {
  strip.setPixelColor(0, strip.Color(r, g, b));
  strip.show();
}

// --- Efecto arcoíris ---
TaskHandle_t rainbowTaskHandle = NULL;
volatile bool rainbowActive = false;

void rainbowTask(void* parameter) {
  uint16_t j = 0;
  while (rainbowActive) {
    uint32_t color = strip.ColorHSV((j * 65536L) / 256, 255, 255);
    strip.setPixelColor(0, color);
    strip.show();
    j = (j + 1) % 256;
    vTaskDelay(20 / portTICK_PERIOD_MS);
  }
  vTaskDelete(NULL);
}

void startRainbow() {
  if (rainbowTaskHandle == NULL) {
    rainbowActive = true;
    xTaskCreatePinnedToCore(rainbowTask, "RainbowTask", 2048, NULL, 1, &rainbowTaskHandle, 1);
  }
}

void stopRainbow() {
  if (rainbowTaskHandle != NULL) {
    rainbowActive = false;
    TaskHandle_t handle = rainbowTaskHandle;
    rainbowTaskHandle = NULL;
    // Espera a que la tarea termine
    vTaskDelay(30 / portTICK_PERIOD_MS);
  }
}

// Variable global para el modo
String currentMode = "estudiante";

// Actualiza el color del LED según el modo
void updateModeLED() {
  if (currentMode == "estudiante") {
    setLEDColor(255, 255, 0); // Amarillo
  } else if (currentMode == "docente") {
    setLEDColor(128, 0, 128); // Violeta
  }
}

void setup() {
  Serial.begin(115200);
  Serial.println("Arrancando ESP32...");
  strip.begin();
  strip.show(); // Inicializa el LED apagado
  setLEDColor(0, 0, 0); // Apaga el LED al inicio

  // Inicializar SPIFFS
  if(!SPIFFS.begin(true)){
    Serial.println("Error al montar SPIFFS");
    setLEDColor(255, 0, 0); // Rojo si falla SPIFFS
    return;
  }

  // Conectar a WiFi
  WiFi.begin(ssid, password);
  Serial.print("Conectando a WiFi...");
  while(WiFi.status() != WL_CONNECTED){
    delay(500);
    Serial.print(".");
  }
  Serial.println("Conectado!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
  updateModeLED(); // Color según el modo al iniciar

  // Configurar mDNS
  if(!MDNS.begin("esp32")){
    Serial.println("Error iniciando mDNS");
  } else {
    Serial.println("mDNS iniciado. Puedes acceder via http://esp32.local");
  }

  // Servir archivos estáticos (HTML, CSS, JS) desde SPIFFS
  server.serveStatic("/", SPIFFS, "/").setDefaultFile("index.html");

  // Endpoint para cambiar el modo (POST /setmode con JSON {"mode":"estudiante"} o {"mode":"docente"})
  server.on("/setmode", HTTP_POST, [](AsyncWebServerRequest *request){}, NULL,
    [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
      String body = "";
      for(size_t i=0; i<len; i++) body += (char)data[i];
      DynamicJsonDocument doc(128);
      DeserializationError error = deserializeJson(doc, body);
      if(error || !doc.containsKey("mode")) {
        request->send(400, "application/json", "{\"error\":\"JSON inválido\"}");
        return;
      }
      String mode = doc["mode"].as<String>();
      if (mode != "estudiante" && mode != "docente") {
        request->send(400, "application/json", "{\"error\":\"Modo inválido\"}");
        return;
      }
      currentMode = mode;
      updateModeLED();
      request->send(200, "application/json", "{\"ok\":true,\"mode\":\"" + mode + "\"}");
    });

  // --- Polling architecture ---
// (declaración movida al inicio del archivo)

  // Endpoint para procesar preguntas (POST /ask)
  server.on("/ask", HTTP_POST, [](AsyncWebServerRequest *request){}, NULL,
    [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
      String body = "";
      for(size_t i=0; i<len; i++) body += (char)data[i];
      DynamicJsonDocument doc(512);
      DeserializationError error = deserializeJson(doc, body);
      if(error || !doc.containsKey("question")) {
        request->send(400, "application/json", "{\"error\":\"JSON inválido\"}");
        return;
      }
      String question = doc["question"].as<String>();
      // Generar un id único (timestamp + random)
      String id = String(millis()) + String(random(1000,9999));
      PendingRequest pr;
      pr.question = question;
      pr.response = "";
      pr.ready = false;
      pendingRequests[id] = pr;
      // Lanzar tarea para procesar la pregunta
      struct TaskData { String id; String question; };
      TaskData* tdata = new TaskData{id, question};
      // Inicia arcoíris mientras genera la respuesta
      startRainbow();
      xTaskCreatePinnedToCore(
        [](void* param) {
          TaskData* tdata = (TaskData*)param;
          String resp = callOpenRouterAPI(tdata->question.c_str());
          pendingRequests[tdata->id].response = resp;
          pendingRequests[tdata->id].ready = true;
          // Detiene arcoíris y restaura color de modo
          stopRainbow();
          updateModeLED();
          // Parpadeo rojo para indicar que la respuesta está lista
          for (int i = 0; i < 2; i++) {
            setLEDColor(255, 0, 0); // Rojo
            delay(200);
            updateModeLED();
            delay(200);
          }
          updateModeLED(); // Vuelve al color del modo
          delete tdata;
          vTaskDelete(NULL);
        },
        "API_Task", 8192, tdata, 1, NULL, 1
      );
      // Responder con el id
      DynamicJsonDocument respDoc(128);
      respDoc["id"] = id;
      String respJSON;
      serializeJson(respDoc, respJSON);
      request->send(200, "application/json", respJSON);
    });

  // Endpoint para consultar la respuesta (GET /result?id=...)
  server.on("/result", HTTP_GET, [](AsyncWebServerRequest *request){
    if (!request->hasParam("id")) {
      request->send(400, "application/json", "{\"error\":\"Falta id\"}");
      return;
    }
    String id = request->getParam("id")->value();
    if (pendingRequests.count(id) == 0) {
      request->send(404, "application/json", "{\"error\":\"ID no encontrado\"}");
      return;
    }
    PendingRequest& pr = pendingRequests[id];
    DynamicJsonDocument respDoc(8192);
    if (pr.ready) {
      respDoc["response"] = pr.response;
      pendingRequests.erase(id); // Borra la respuesta después de entregarla
    } else {
      respDoc["response"] = nullptr;
    }
    String respJSON;
    serializeJson(respDoc, respJSON);
    request->send(200, "application/json", respJSON);
  });
  // --- End polling architecture ---

  server.begin();
  Serial.println("Servidor web iniciado");
}

void loop() {
  // Nada aquí, todo manejado por AsyncWebServer
}

// Función para llamar a la API de OpenRouter (DeepHermes 3 Llama 3 8B Preview)
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
  doc["model"] = "nousresearch/deephermes-3-llama-3-8b-preview:free";
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

  http.end();
  return respuesta;
}
