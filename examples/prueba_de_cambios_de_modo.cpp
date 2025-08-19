
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

**Importante:** Cada ejemplo debe incluir su propio platformio.ini con las dependencias mínimas requer
