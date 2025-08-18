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
