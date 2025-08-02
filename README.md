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

### **3. Requisitos Adaptados**  
#### **Funcionales:**  
1. **Modo Docente:**  
   - Consultas pedagógicas (ej: *"¿Cómo explicar fracciones a un estudiante con TEA?"*).  
   - Generador de actividades diferenciadas (ej: *"3 ejercicios de suma con apoyo visual"*).  
2. **Modo Estudiante:**  
   - Explicaciones con lenguaje simple y emojis.  
   - Mini-juegos para reforzar aprendizajes (ej: memoria de conceptos).  
3. **Señales Visuales:**  
   - NeoPixel:  
     - **Violeta:** Modo docente activo.  
     - **Amarillo:** Modo estudiante.  
     - **Arcoíris:** Procesando consulta.  

#### **No Funcionales:**  
- **Offline:** Respuestas predefinidas para términos pedagógicos comunes (ej: inclusión, TDAH).  
- **Accesibilidad:** Compatibilidad con lectores de pantalla en la interfaz web.  

---

### **4. Diseño Preliminar Actualizado**  
#### **Flujo de Uso:**  
```mermaid
sequenceDiagram
  Docente->>ESP32: Pregunta pedagógica (voz/texto)
  ESP32->>OpenRouter: Consulta a la IA
  OpenRouter-->>ESP32: Respuesta adaptada
  ESP32->>NeoPixel: Feedback visual (color/movimiento)
  ESP32->>Interfaz Web: Muestra respuesta + actividades sugeridas
  Docente->>Estudiante: Material personalizado
```  

#### **Componentes Clave:**  
- **Base de Datos Offline:**  
  - Almacena respuestas para términos frecuentes (ej: *"ejercicios sensoriales"*).  
- **API OpenRouter:**  
  - Modelo *DeepHermes* (optimizado para pedagogía y lenguaje simple).  
- **Interfaz Física:**  
  - Botón para alternar entre modos + micrófono opcional.  

---

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
