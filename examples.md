### Prueba Básica de NeoPixel
```
#include <Adafruit_NeoPixel.h>
#define PIN 2
#define NUMPIXELS 1

Adafruit_NeoPixel pixels(NUMPIXELS, PIN, NEO_GRB + NEO_KHZ800);

void setup() {
  pixels.begin();
  pixels.setBrightness(50); // 50% brillo
}

void loop() {
  // Ciclo de colores básicos
  pixels.setPixelColor(0, pixels.Color(255, 0, 0)); // Rojo
  pixels.show(); delay(1000);
  pixels.setPixelColor(0, pixels.Color(0, 255, 0)); // Verde
  pixels.show(); delay(1000);
  pixels.setPixelColor(0, pixels.Color(0, 0, 255)); // Azul
  pixels.show(); delay(1000);
}
```
---

### Prueba de servidor web
```
#include <WiFi.h>
#include <ESPAsyncWebServer.h>

const char* ssid = "TuRedWiFi";
const char* password = "TuPassword";

AsyncWebServer server(80);

void setup() {
  Serial.begin(115200);
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) delay(500);
  Serial.print("IP: "); Serial.println(WiFi.localIP());

  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(200, "text/plain", "¡Servidor funcionando!");
  });

  server.begin();
}

void loop() {} // Nada aquí, todo es asíncrono
```

---
### Prueba de SPIFFS(servicio de almacenamiento de archivos)
```
#include <SPIFFS.h>

void setup() {
  Serial.begin(115200);
  
  if(!SPIFFS.begin(true)){
    Serial.println("Error al montar SPIFFS");
    return;
  }

  // Escribe un archivo de prueba
  File file = SPIFFS.open("/test.txt", FILE_WRITE);
  file.println("Datos de prueba " + String(millis()));
  file.close();

  // Lee el archivo
  file = SPIFFS.open("/test.txt");
  while(file.available()) Serial.write(file.read());
  file.close();
}

void loop() {}
```

### Prueba uso de IA
```
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* apiUrl = "https://openrouter.ai/api/v1/chat/completions";
const char* apiKey = "tu_api_key";

void setup() {
  Serial.begin(115200);
  WiFi.begin("TuRedWiFi", "TuPassword");
  while(WiFi.status() != WL_CONNECTED) delay(500);

  HTTPClient http;
  http.begin(apiUrl);
  http.addHeader("Authorization", String("Bearer ") + apiKey);
  http.addHeader("Content-Type", "application/json");

  DynamicJsonDocument doc(512);
  doc["model"] = "deepseek/deepseek-r1-0528-qwen3-8b:free";
  JsonArray messages = doc.createNestedArray("messages");
  JsonObject msg = messages.createNestedObject();
  msg["role"] = "user";
  msg["content"] = "Di hola en español";

  String payload;
  serializeJson(doc, payload);

  int httpCode = http.POST(payload);
  if(httpCode == 200) {
    String response = http.getString();
    Serial.println(response);
  }
  http.end();
}

void loop() {}
```
---
### Prueba de cambios de modo
```
#include <Adafruit_NeoPixel.h>
#define PIN 2
Adafruit_NeoPixel pixel(1, PIN, NEO_GRB + NEO_KHZ800);

String currentMode = "estudiante";

void setMode(String mode) {
  currentMode = mode;
  if(mode == "estudiante") pixel.setPixelColor(0, pixel.Color(255, 255, 0)); // Amarillo
  else pixel.setPixelColor(0, pixel.Color(128, 0, 128)); // Violeta
  pixel.show();
}

void setup() {
  pixel.begin();
  Serial.begin(115200);
}

void loop() {
  if(Serial.available()) {
    String input = Serial.readStringUntil('\n');
    if(input == "docente" || input == "estudiante") setMode(input);
  }
  delay(100);
}
```

---
**Importante:** Cada ejemplo debe incluir su propio platformio.ini con las dependencias mínimas requeridas.
