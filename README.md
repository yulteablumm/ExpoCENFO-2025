# Avance Preliminar ExpoCENFO # 

---

### **1. Información del Proyecto**  
- **Nombre:** *AI Asistente Educativo Inclusivo con ESP32*  
- **Equipo:** Fiorela Perez, Mariana Cubero, Sharon Castro y Yuliana González.
  - **Roles:**
             - Fiorela Perez: Desarrollo del backend y frontend.
             - Mariana Cubero:
             - Sharon Castro: 
             - Yuliana González: Creación de la documentación en GitHub.
---

### **2. Público Meta y Propósito Educativo**  
#### **Beneficiarios Directos:**  
- **Docentes** de educación regular o especial que requieran:  
  - Generar material adaptado a adecuaciones significativas (ej: estudiantes con discapacidad cognitiva).  
  - Crear actividades paralelas para adecuaciones no significativas (ej: ajustes en tiempo o formato).  
- **Estudiantes** con necesidades educativas diversas, promoviendo su participación en el mismo tema de clase con recursos personalizados.  

#### **Objetivos Educativos:**  
| Propósito | Implementación Técnica |  
|-----------|------------------------|  
| **Generar material adaptado** | IA contextualiza respuestas (ej: simplificar lenguaje o proponer ejemplos táctiles). |  
| **Optimizar tiempo docente** | Interfaz física/web para consultas rápidas (sin búsquedas manuales). |  
| **Equidad en el aula** | Mismo tema para todos con variaciones en profundidad/complejidad. |  
| **Autonomía del docente** | Respuestas instantáneas sin depender de repositorios externos. |  

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
