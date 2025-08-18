

# Proyecto educativo | ExpoCENFO 2025 # 

---

### **1. Información del Proyecto**  
- **Nombre:** *Asistente Educativo con ESP32*  
- **Equipo:** CTRL+Girls → Fiorela Perez, Mariana Cubero, Sharon Castro y Yuliana González.

---

### **2. Descripción y Justificación**  

#### **Problema que se aborda:**  
Los docentes que trabajan con estudiantes que requieren adecuaciones curriculares significativas (ej: discapacidad cognitiva, autismo) o no significativas (ej: ajustes en ritmo o formato) enfrentan desafíos clave:  
1. **Falta de tiempo** para crear material adaptado a cada necesidad.  
2. **Dificultad para explicar conceptos** de manera personalizada dentro del mismo grupo.  
3. **Limitaciones de recursos** pedagógicos inclusivos listos para usar.  

---


**Ejemplo de funcionamiento:**  
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

## Componentes Principales

### Backend (ESP32)
- **Control de estados:** Gestión de colores con NeoPixel según actividad o perfil (amarillo para estudiante, violeta para docente, rojo intermitente cuando hay respuesta disponible).
- **Polling distribuido:** El servidor gestiona la pregunta y genera un `ID` único. Una tarea separada llama al modelo y publica la respuesta para ser consultada posteriormente.
- **Gestión de modos:** Permite alternar entre perfiles con retroalimentación visual y lógica en el sistema.
- **Integración con OpenRouter:** Utiliza `HTTPClient` para enviar preguntas y recibir respuestas JSON estructuradas.

### Frontend (HTML + JavaScript)
- Interfaz web intuitiva con pestañas para docentes y estudiantes.
- Preguntas sugeridas según el perfil.
- Campo de entrada y botón de envío que realiza POST a `/ask`.
- Lógica de polling en JavaScript para mostrar la respuesta una vez esté lista.

---
### Diagrama general del proyecto
<img width="50%" height="80%" alt="prueba corta(progra) - expo 1" src="https://github.com/user-attachments/assets/2c7bffe1-2ee9-406b-94bd-ad7a66aa6491" />




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
