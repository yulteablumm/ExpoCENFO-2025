# Avance Preliminar ExpoCENFO # 

---

### **1. Información del Proyecto**  
- **Nombre:** *Asistente Educativo con ESP32*  
- **Equipo:** Fiorela Perez, Mariana Cubero, Sharon Castro y Yuliana González.
  - **Roles:**    
             - Fiorela Perez: Desarrollo del backend y frontend.   
             - Mariana Cubero: Coordinadora, encargada de realizar objetos para decoracion en el Maker Space.   
             - Sharon Castro: Encargada de buscar ideas para decoracion el dia de la exposicion.   
             - Yuliana González: Creación de la documentación en GitHub.
---

### **2. Descripción y Justificación**  

#### **Problema que se aborda:**  
Los docentes que trabajan con estudiantes que requieren adecuaciones curriculares significativas (ej: discapacidad cognitiva, autismo) o no significativas (ej: ajustes en ritmo o formato) enfrentan desafíos clave:  
1. **Falta de tiempo** para crear material adaptado a cada necesidad.  
2. **Dificultad para explicar conceptos** de manera personalizada dentro del mismo grupo.  
3. **Limitaciones de recursos** pedagógicos inclusivos listos para usar.  

---

#### **Importancia y contexto:**  

Al permitir que el docente consulte a la IA directamente desde una interfaz física o web, se optimiza el tiempo de planificación, se fomenta la personalización del material y se promueve una participación más equitativa dentro del grupo. Esto contribuye a:
- Responder rápidamente a dudas pedagógicas específicas.
- Generar explicaciones, ejemplos y actividades según las necesidades del estudiante.
- Alinear el contenido que se trabaja en clase de manera que todo el grupo avance en los mismos temas, respetando los ritmos individuales.
- Promover la autonomía del docente en la creación de recursos sin depender de repositorios externos o procesos de búsqueda extensos.
- Cumple con lo establecido en la Ley 7600 (Costa Rica) y los Objetivos de Desarrollo Sostenible (ODS 4) para una educación inclusiva.  

**Ejemplo de impacto:**  
Un docente puede preguntar: *"¿Cómo enseñar los volcanes a un estudiante con TEA?"* y recibir:  
- Una explicación con lenguaje claro.  
- Una actividad sensorial (ej: maqueta con texturas).  
- Un juego de asociación para el grupo.  

**Importante:** Realizar la consulta a la IA siendo claros  y concisos en lo que se quiere preguntar o recibir.

---

#### **Usuarios/beneficiarios:**  
| Grupo | Beneficio | Limitación |  
|-------|----------|------------|  
| **Docentes** | Acceso rápido a IA pedagógica. | Requiere conexión para consultas. |  
| **Estudiantes con adecuaciones** | Reciben material adaptado para fortalecer su aprendizaje. | Depende de que el docente planifique con conexión si no tiene una conexion estable en el momento. |   

**Alternativas para mitigar la dependencia offline:**  
- **Exportación de respuestas**: El docente puede exportar en formato PDF las consultas y guardarlas para acceder a ellas luego.  
- **Base de datos local mínima**: Almacena respuestas básicas (ej: definiciones pedagógicas) en el ESP32 (SPIFFS).  

---

### **3. Objetivos del Proyecto**  

#### **Objetivo General:**  
Desarrollar un asistente educativo con IA basado en ESP32 que, mediante una interfaz accesible y señales visuales (NeoPixel), facilite la creación de material pedagógico adaptado para estudiantes con adecuaciones curriculares, aprovechando modelos de lenguaje generativo (OpenRouter u otros) en entornos con conexión a Internet.  

---

#### **Objetivos Específicos:**  

- Permitir que un microcontrolador como el ESP32 interactúe en tiempo real con un modelo de lenguaje generativo.
- Establecer un servidor web alojado directamente en la placa ESP32 para actuar de forma local.
- Ofrecer un entorno multiperfil accesible para docentes y estudiantes.
- Visualizar estados y respuestas del sistema mediante señales físicas (LED RGB) y web (interfaz HTML).

---

### **3. Requisitos Iniciales**  

1. **Modo Docente:**  
   - Consultas pedagógicas a la IA y que devuelva una respuesta.  
   - Generador de actividades diferenciadas (ej: *"3 ejercicios de suma con apoyo visual"*).  
2. **Modo Estudiante:**  
   - Explicaciones con lenguaje simple.  
   - Mini-juegos para reforzar aprendizajes (ej: memoria de conceptos).  
3. **Señales Visuales:**  
   - NeoPixel:  
     - **Violeta:** Modo docente activo.  
     - **Amarillo:** Modo estudiante.  
     - **Arcoíris:** Procesando consulta.
  
---

### **4. Diseño Preliminar del Sistema**  
- #### **Arquitectura inicial(diagrama)**  
<img width="60%" height="80%" alt="deepseek_mermaid_20250802_72daa3" src="https://github.com/user-attachments/assets/049060dc-e5a0-4a91-bdca-79824cad7a0b" />
 
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
   OpenRouter (DeepHermes 3 - Llama 3 8B)  
  Gratuito para uso educativo (hasta 1,000 consultas/día).
  
  Ejemplo de consulta:
  
  json   
  {   
    "model": "nousresearch/deephermes-3-llama-3-8b-preview",    
    "messages": [{"role": "user", "content": "Explica la fotosíntesis para un niño de 5 años"}]  
  }   
  
  ---
  
  - **Librerías y herramientas:**  
     En `platformio.ini`:
  
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

- #### **Bocetos o Esquemas**
  - Diagrama de flujo de la interacción entre interfaz y backend.  
    <img width="20%" height="50%" alt="EXPOCENFO drawio" src="https://github.com/user-attachments/assets/c12e9ae9-4991-4bae-81f6-bf31225c1841" />
  
  - Diagrama de flujo entre frontend, servidor y modelo de lenguaje.  
   <img width="60%" height="80%" alt="EXPOCENFO-version 1 diagrama main cpp drawio (2)" src="https://github.com/user-attachments/assets/430e5898-050b-45b4-bff1-3208de621dca" />
---

### **6. Plan de Trabajo**  

- **Cronograma Preliminar**  

| **Actividad**                     | **Fecha Estimada** | **Qué se logró hacer** |  
|------------------------------|---------------|-------------------|----------------|  
| **1. Desarrollo del Firmware**  | 14/julio - 17/julio | - Servidor web en ESP32<br>- Control básico del NeoPixel<br>- Conexion funcional a LLM|  
| **2. Integración con API**      | 18/julio - 18/julio | - Conexión funcional a OpenRouter<br>- Manejo de respuestas JSON |  
| **3. Diseño Interfaz Web**      | 18/julio - 24/julio | - HTML/CSS/JS responsive<br>- Modos docente/estudiante |  
| **4. Pruebas**                  | 14/julio - 25/julio | - Validación de partes del sistema conforme se iba creando |   
| **5. Documentación**            | DD/MM - 02/agosto     | - Manual de uso<br>- Guía de instalación<br>- Descripción del sistema|  

---

#### **Riesgos Identificados y Mitigaciones**  

| **Riesgo**                          | **Mitigación** |  
|-------------------------------------|----------------|  
| **1. ** | - Implementar caché local con respuestas predefinidas<br>- Usar mensajes claros de error ("Reintentar más tarde") |  
| **2. **       | - Limitar tiempo de operación continua<br>- Añadir disipador pasivo |  

---

### **7. Prototipos Conceptuales**
### **7. Prototipos Conceptuales**  

#### **Código Mínimo de Prueba**  

**1. Conexión Básica ESP32 + NeoPixel** *(Feedback visual)*  
```arduino
#include <Adafruit_NeoPixel.h>
#define LED_PIN 2
#define NUM_LEDS 1

Adafruit_NeoPixel strip(NUM_LEDS, LED_PIN, NEO_GRB + NEO_KHZ800);

void setup() {
  strip.begin();
  strip.show(); // Inicializa LED apagado
}

void loop() {
  // Modo Docente (Violeta)
  strip.setPixelColor(0, strip.Color(150, 0, 150)); 
  strip.show();
  delay(2000);
  
  // Procesando (Arcoíris)
  for(int i=0; i<256; i++) {
    strip.setPixelColor(0, strip.ColorHSV((i * 65536L) / 256));
    strip.show();
    delay(20);
  }
}
```

**2. Consulta a OpenRouter API** *(Conexión con IA)*  
```arduino
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "TuRedWiFi";
const char* password = "TuContraseña";
const char* apiKey = "sk-or-v1-tu-api-key";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Conectado!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin("https://openrouter.ai/api/v1/chat/completions");
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Authorization", String("Bearer ") + apiKey);
    
    String payload = "{\"model\":\"nousresearch/deephermes-3-llama-3-8b-preview\",\"messages\":[{\"role\":\"user\",\"content\":\"Explica el ciclo del agua para un niño con adecuacion no significativa\"}]}";
    
    int httpCode = http.POST(payload);
    if (httpCode == 200) {
      String response = http.getString();
      Serial.println("Respuesta IA:");
      Serial.println(response);
    } else {
      Serial.println("Error: " + String(httpCode));
    }
    http.end();
  }
  delay(10000); // Espera 10 segundos entre consultas
}
```

---


---

### **Cómo Probarlo**  
1. **Hardware**:  
   - Conecta el NeoPixel al pin GPIO2 del ESP32.  
   - Alimenta el sistema via USB (5V).  

2. **Software**:  
   - Carga el código en Arduino IDE con las librerías instaladas.  
   - Abre el Monitor Serial (115200 baudios) para ver respuestas.  

3. **Interfaz**:  
   - Accede a `http://192.168.4.1` desde cualquier dispositivo en la red WiFi del ESP32.  

---

### **Próximos Pasos**  
- [ ] Añadir caché local para preguntas frecuentes.  
- [ ] Implementar reconocimiento de voz con el micrófono.  
- [ ] Crear un PCB personalizado para integración física.  

¿Necesitas el código completo o ajustar algún componente? 🚀
