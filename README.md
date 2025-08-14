

# Guía para Documentar Proyectos de Inteligencia en el Borde con LLMs #
**Autor:** Tomás de Camino Beck, Ph.D.  
**Institución:** Universidad CENFOTEC

---

## 1. Estructura del Repositorio

```
/docs/           # Documentación extendida (diagramas, notas técnicas, PDFs)
/hardware/       # Esquemas, diagramas de conexión, archivos CAD/PCB
/software/       # Código fuente (microcontrolador, backend, scripts)
/models/         # Modelos, prompts y configuraciones de LLM
/tests/          # Pruebas unitarias y de integración
/examples/       # Ejemplos simples de uso del sistema
README.md        # Descripción general del proyecto
ARCHITECTURE.md  # Documentación detallada de la arquitectura
SETUP.md         # Guía de instalación y despliegue
CONTRIBUTING.md  # Normas para colaborar en el proyecto
LICENSE          # Licencia del proyecto
CHANGELOG.md     # Registro de cambios
```

---

## 2. Documentar el Diseño del Sistema

### a) Diagramas

- **Diagrama de arquitectura:** Usa herramientas como Mermaid, Draw.io, Lucidchart.
- **Diagrama de flujo de datos:** Describe cómo se transmite la información entre sensores, microcontrolador y LLM.
- **Esquemas eléctricos:** Incluye diagramas de conexión (pines, sensores, actuadores).

### b) Descripción de Componentes

Ubicar en `README.md` o `/docs/`:

- Microcontroladores utilizados.
- Sensores y actuadores conectados.
- LLM empleado (cloud/local).
- Librerías clave (con enlaces a documentación oficial).

---

## 3. Documentar el Código

### a) README principal

Debe incluir:

- Descripción breve del proyecto.
- Objetivo del sistema.
- Imagen o diagrama representativo.
- Ejemplo básico de funcionamiento.

### b) Comentarios y estilo

- Código comentado siguiendo guías como PEP8 (Python) o Arduino Style Guide (C++).
- Uso de docstrings para funciones y clases.

### c) Ejemplos reproducibles

- Scripts simples en `/examples/` para probar funcionalidades individuales.

### d) Registro de cambios

Ejemplo en `CHANGELOG.md`:

```markdown
## [1.0.1] - 2025-08-01
- Optimización del consumo de energía del ESP32.
- Soporte para prompts dinámicos en el LLM.
```

---

## 4. Documentar la Arquitectura

Ubicar en `ARCHITECTURE.md`:

- **Vista general:** Interacción entre componentes.
- **Capas del sistema:**
  - Percepción (sensores y recolección de datos).
  - Procesamiento local (microcontrolador).
  - Comunicación con el LLM (API/librerías).
  - Toma de decisiones y acción.
- **Decisiones de diseño:** Justificación y posibles mejoras.

---

## 5. Recomendaciones Generales

- **Licencia:** MIT, Apache 2.0 u otra abierta.
- **Etiquetas e Issues:** Organización clara de tareas.
- **Wiki del proyecto:** Para documentación extendida.
- **Visualizaciones:** Diagramas e imágenes para facilitar comprensión.
- **Ramas (branches):** `main`, `dev`, `feature/nueva-funcionalidad`.

---

## 6. Plantillas Útiles

### Pull Requests

- Descripción del cambio.
- Cómo probarlo.
- Impacto esperado.

### Issues

- Título claro.
- Descripción del problema o sugerencia.
- Pasos para reproducir (si aplica).
- Capturas o logs relevantes.

---



















# Proyecto educativo con ESP32  #

Universidad CENFOTEC
- **Equipo:** Fiorela Perez, Mariana Cubero, Sharon Castro y Yuliana González.
  - **Roles:**    
             - Fiorela Pérez: Responsable de desarrollo backend y frontend del sistema.  
             - Mariana Cubero: Coordinadora del proyecto y diseño de elementos decorativos en el Maker Space.   
             - Sharon Castro: Diseño conceptual y decoración para la exposición.   
             - Yuliana González: Documentación y gestión del repositorio GitHub.    
---

## 1. Estructura del Repositorio
/docs/                   # Documentación extendida (diagramas, notas técnicas, PDFs)
/hardware/               # Esquemas, diagramas de conexión, archivos CAD/PCB
/software/               # Código fuente (microcontrolador, backend, scripts)
/models/                 # Modelos, prompts y configuraciones de LLM
/tests/                  # Pruebas unitarias y de integración
/examples/               # Ejemplos simples de uso del sistema
README.md                # Descripción general del proyecto
ARCHITECTURE.md          # Documentación detallada de la arquitectura
SETUP.md                 # Guía de instalación y despliegue
CONTRIBUTING.md          # Normas para colaborar en el proyecto
LICENSE                  # Licencia del proyecto
CHANGELOG.md             # Registro de cambios





























# Avance Preliminar ExpoCENFO # 

---

### **1. Información del Proyecto**  
- **Nombre:** *Asistente Educativo con ESP32*  
- **Equipo:** Fiorela Perez, Mariana Cubero, Sharon Castro y Yuliana González.
  - **Roles:**    
             - Fiorela Pérez: Responsable de desarrollo backend y frontend del sistema.  
             - Mariana Cubero: Coordinadora del proyecto y diseño de elementos decorativos en el Maker Space.   
             - Sharon Castro: Diseño conceptual y decoración para la exposición.   
             - Yuliana González: Documentación y gestión del repositorio GitHub.    
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
|------------------------------|---------------|----------------|  
| **1. Desarrollo del Firmware**  | 14/julio - 17/julio | - Servidor web en ESP32<br>- Control básico del NeoPixel<br>- Conexion funcional a LLM|  
| **2. Integración con API**      | 18/julio - 18/julio | - Conexión funcional a la API junto con open router<br>- Manejo de respuestas JSON |  
| **3. Diseño Interfaz Web**      | 18/julio - 24/julio | - HTML/CSS/JS <br>- Modos docente/estudiante |  
| **4. Pruebas**                  | 14/julio - 25/julio | - Validación de partes del sistema conforme se iba creando |   
| **5. Documentación**            | DD/MM - 02/agosto     | - Manual de uso<br>- Guía de instalación<br>- Descripción del sistema|  

---

#### **Riesgos Identificados y Mitigaciones**  

| **Riesgo**                          | **Mitigación** |  
|-------------------------------------|----------------|  
| **1. ** | -  |  
| **2. **       | -  |  

---

### **7. Prototipos Conceptuales**
- #### **Código minímo de prueba:**   
**1. Conexión Básica ESP32 + NeoPixel**  
**(En main.cpp):**  
```#include <Adafruit_NeoPixel.h>
#include <WiFi.h>

#define LED_PIN 2
#define NUM_LEDS 1
Adafruit_NeoPixel strip(NUM_LEDS, LED_PIN, NEO_GRB + NEO_KHZ800);

// Declara las funciones primero (prototipos)
void setLEDColor(uint8_t r, uint8_t g, uint8_t b);
void startRainbowEffect();

void setup() {
  Serial.begin(115200);
  strip.begin();
  strip.show(); // Apagar LED inicialmente
  Serial.println("✅ NeoPixel listo");
}

void loop() {
  setLEDColor(128, 0, 128); // Violeta (Docente)
  delay(2000);
  setLEDColor(255, 255, 0); // Amarillo (Estudiante)
  delay(2000);
  startRainbowEffect();      // Arcoíris (Procesando)
  delay(5000);
}

// Implementación de funciones
void setLEDColor(uint8_t r, uint8_t g, uint8_t b) {
  strip.setPixelColor(0, strip.Color(r, g, b));
  strip.show();
}

void startRainbowEffect() {
  for(int j=0; j<256; j++) {
    strip.setPixelColor(0, strip.ColorHSV((j * 65536L) / 256));
    strip.show();
    delay(20);
  }
}
```


**(En platform.io:)**

```[env:esp32dev]
platform = espressif32
board = esp32dev
framework = arduino
lib_deps =
    adafruit/Adafruit NeoPixel@^1.15.1
    WiFi
```


- #### **Evidencia visual:**

- Captura de pantalla de la interfaz web en modo docente.   
<img width="50%" height="80%" alt="image" src="https://github.com/user-attachments/assets/bc57e6a3-6aea-4441-ac96-48d75702f2c7" />   
<img width="50%" height="80%" alt="image" src="https://github.com/user-attachments/assets/a500bc6f-3f2e-4f5b-af5b-1dcc04bb6b25" />   
<img width="50%" height="80%" alt="image" src="https://github.com/user-attachments/assets/885f118e-5baf-41f9-958a-9ab956efa717" />

- Captura de pantalla en modo estudiante.  
  <img width="50%" height="80%" alt="image" src="https://github.com/user-attachments/assets/93dfbcca-9cbd-46aa-8f39-a824e5369199" />   
  <img width="50%" height="80%" alt="image" src="https://github.com/user-attachments/assets/8078ecb0-e612-4c50-a59e-340b08285126" />   
  <img width="50%" height="80%" alt="image" src="https://github.com/user-attachments/assets/a7fcdb56-76da-4770-9b15-35e2b09a1545" />   
  <img width="50%" height="80%" alt="image" src="https://github.com/user-attachments/assets/889490d0-e43a-41b4-ae23-a19e0ce03c23" />


- Foto del hardware montado con el NeoPixel encendido.   
  Docente:   
   <img width="50%" height="80%" alt="image" src="https://github.com/user-attachments/assets/e6188533-5e66-4b83-a708-c35736fabb72" />
 
   Estudiante:   
   <img width="50%" height="80%" alt="image" src="https://github.com/user-attachments/assets/c60f17e2-9cb8-4abc-a285-c4231b7e5fb8" />

- Captura de consola con registros del sistema.   
<img width="50%" height="80%" alt="image" src="https://github.com/user-attachments/assets/24231e3e-bb5b-4770-955b-f2c15a0cf178" />

- Videos    


https://github.com/user-attachments/assets/9c1e3a11-6370-4321-8fb0-15abf03a4be1


https://github.com/user-attachments/assets/33ccf482-41cf-45e5-8d8f-7c1b8edbc111


https://github.com/user-attachments/assets/8d2a7c85-4868-4a07-96b4-028016183ebe
