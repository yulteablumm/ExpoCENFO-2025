
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
