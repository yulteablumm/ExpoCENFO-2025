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

### Prueba uso de API
```
import requests

url = "https://openrouter.ai/api/v1/chat/completions"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer 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"
}
data = {
    "model": "deepseek/deepseek-chat-v3-0324:free",
    "messages": [
        {"role": "user", "content": "¿Cuál es la capital de Francia?"}
    ]
}

response = requests.post(url, headers=headers, json=data)
print("Status code:", response.status_code)
print("Raw response:")
print(response.text)
if response.status_code == 200:
    try:
        result = response.json()
        print("Respuesta IA:")
        print(result["choices"][0]["message"]["content"])
    except Exception as e:
        print("Error al decodificar JSON:", e)
else:
    print("No se recibió respuesta JSON válida.")

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
