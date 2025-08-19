### **Guía de Instalación y Desplieguea**

---

#### ** Requisitos Previos**
| **Componente**       | **Detalle**                                                                 |
|----------------------|----------------------------------------------------------------------------|
| **Hardware**         | ESP32-WROOM (recomendado) + LED NeoPixel (WS2812B)                        |
| **Software**         | PlatformIO IDE (VS Code) o Arduino IDE                                     |
| **Cuentas**          | API Key de [OpenRouter.ai](https://openrouter.ai/) (gratis para pruebas)   |
| **Conexión**         | WiFi 2.4GHz con acceso a internet                                          |

---

### ** Pasos para Instalar**

#### **1. Clonar el Repositorio**
- Clonar el repositorio desde GitHub o descargar todos los archivos directamente para tenerlos de forma local.

#### **2. Configurar PlatformIO**
- Abre el proyecto en VS Code con la extensión **PlatformIO** instalada.
- Verifica el archivo `platformio.ini` (ajusta si es necesario):
  ```ini
  lib_deps = 
    ESP32Async/ESPAsyncWebServer @ ^3.3.0
    adafruit/Adafruit NeoPixel @ ^1.15.1
    bblanchon/ArduinoJson @ ^7.4.2
  ```

#### **3. Configurar Credenciales**
En `main.cpp`, actualiza:
```cpp
const char* ssid = "TU_RED_WIFI";
const char* password = "TU_PASSWORD";
const char* OPENROUTER_API_KEY = "sk-or-v1-...";  // Clave de OpenRouter
```

---

### ** Despliegue en el ESP32**
#### **1. Subir archivos de /data/ a la placa**

1. Subir contenido del frontend a `/data` usando SPIFFS (PlatformIO).
2. Configurar credenciales WiFi y API key directamente en el código.
3. Subir archivos de data a la placa ESP32. Aqui una pequeña guia de como hacerlo:
   - Selecciona el archivo.
       
       <img width="50%" height="80%" alt="image" src="https://github.com/user-attachments/assets/23e6cec1-f168-4805-a735-ea8d8981a609" />
   - Ve a platform.io.
       
       <img width="40%" height="50%" alt="image" src="https://github.com/user-attachments/assets/956e657c-991e-4ec5-8798-9cf6d600cd1c" />
       
   - Expande la carpeta del ideaboard, y la carpeta que dice Platform.
       
       <img width="40%" height="50%" alt="image" src="https://github.com/user-attachments/assets/3d89c455-2e23-487b-bce3-7e003a4e98ed" />
   - Selecciona la opcion 'Upload Filesystem Image'
       
       <img width="50%" height="80%" alt="image" src="https://github.com/user-attachments/assets/de9c1733-8ea7-44fb-8490-ea04670a588c" />

   - Y sigues los pasos anteriores con los demas archivos de data, seleccionas el archivo y lo subes a la placa...

#### **2. Compilar y Subir el Código**
- Conecta el ESP32 vía USB.
- En PlatformIO:
  - Click en **Build** (✔️).
  - Luego en **Upload** (→).

#### **3. Conectar al WiFi**
- Monitorea el puerto serial (`115200 bauds`):
  ```
  Conectando a WiFi...
  IP asignada: 192.168.1.100
  mDNS iniciado: http://esp32.local
  ```

#### **4. Acceder a la Interfaz Web**
- Abre en tu navegador:
  - `http://esp32.local` (vía mDNS) **o**
  - `http://<IP-del-ESP32>` (ej: `http://192.168.1.100`).
---

