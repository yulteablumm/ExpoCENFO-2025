# Avance Preliminar ExpoCENFO # 

---

### **1. Información del Proyecto**  
- **Nombre:** *AI Asistente Educativo Inclusivo con ESP32*  
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
#### **Arquitectura inicial(diagrama)**  
<img width="60%" height="80%" alt="deepseek_mermaid_20250802_72daa3" src="https://github.com/user-attachments/assets/049060dc-e5a0-4a91-bdca-79824cad7a0b" />
 
---

- **Componentes previstos:**  
  - Microcontrolador: ESP32  
  - Sensores/actuadores:  
    | Componente          | Función                             | Conexión ESP32 |  
    |---------------------|-------------------------------------|----------------|  
    | **NeoPixel RGB**    | Feedback visual (colores/estados)   | GPIO2          |  
    | **Botón en interfaz**    | Cambiar modos (docente/estudiante)  | GPIO0          |  
  
  ---
  
  - LLM/API:  
   OpenRouter (DeepHermes 3 - Llama 3 8B)  
  Gratuito para uso educativo (hasta 1,000 consultas/día).
  
  Ejemplo de consulta:
  
  json   
  {   
    "model": "nousresearch/deephermes-3-llama-3-8b-preview",    
    "messages": [{"role": "user", "content": "Explica la fotosíntesis para un niño de 5 años"}]  
  }   
  
  ---
  
  - Librerías y herramientas:  
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
  
  - Archivos del Proyecto
  
    - `/src/main.cpp`: Lógica central de backend ESP32
    - `/data/index.html`: Interfaz web para el usuario
    - `/data/styles.css`: Estilos de la página
    - `/data/script.js`: Lógica cliente para interacción web
    - `platformio.ini`: Configuración del entorno PlatformIO
  
  - ### Backend (ESP32)
    - **Control de estados:** Gestión de colores con NeoPixel según actividad o perfil (amarillo para estudiante, violeta para docente, rojo intermitente cuando hay respuesta disponible).
    - **Polling distribuido:** El servidor gestiona la pregunta y genera un `ID` único. Una tarea separada llama al modelo y publica la respuesta para ser consultada posteriormente.
    - **Gestión de modos:** Permite alternar entre perfiles con retroalimentación visual y lógica en el sistema.
    - **Integración con OpenRouter:** Utiliza `HTTPClient` para enviar preguntas y recibir respuestas JSON estructuradas.
  
  - ### Frontend (HTML + JavaScript)
    - Interfaz web intuitiva con pestañas para docentes y estudiantes.
    - Preguntas sugeridas según el perfil.
    - Campo de entrada y botón de envío que realiza POST a `/ask`.
    - Lógica de polling en JavaScript para mostrar la respuesta una vez esté lista.

---

- Bocetos o Esquemas
### **5. Prototipos Conceptuales**  
#### **Ejemplo de Consulta Docente:**  
```python
# Pregunta: "Actividades para enseñar el ciclo del agua a un estudiante con discapacidad visual"
Respuesta IA:
1. Usar texturas (ej: algodón para nubes, gel frío para lluvia).
2. Relato sonoro con efectos de agua.
3. Maqueta 3D con piezas movibles.
```  
**Señal NeoPixel:** Parpadeo azul al generar actividades.  

#### **Ejemplo de Interfaz Web:**  
![Modo Docente](https://ejemplo.com/docente.png)  
*(Captura: Panel con opciones para "simplificar explicación" o "generar ejercicio práctico")*  

---

### **6. Plan de Trabajo con Enfoque Inclusivo**  
| Hito | Actividades |  
|------|------------|  
| **Validación con Docentes** | Talleres para probar consultas pedagógicas reales. |  
| **Pruebas de Accesibilidad** | Evaluar interfaz con estudiantes con discapacidad. |  
| **Optimización Offline** | Ampliar base de datos de respuestas predefinidas. |  

#### **Riesgos:**  
- **Baja conectividad en escuelas:** Mitigación con modo offline robusto.  
- **Respuestas no contextualizadas:** Mitigación con *prompt engineering* para educación especial.  

--- 

**Nota:** Este proyecto prioriza la **inclusión real** mediante tecnología accesible y centrada en el docente como facilitador.
