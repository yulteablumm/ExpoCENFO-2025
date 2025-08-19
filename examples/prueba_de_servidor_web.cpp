
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


