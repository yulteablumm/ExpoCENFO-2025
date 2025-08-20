

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
#### **Conceptos clave:**  
**API**
  - Analogia: como un mesero en un restaurante.
  - Tecnicamente: Interfaz que permite que dos aplicaciones se comuniquen entre si mediante      peticiones HTTP.    
    <img width="355" height="133" alt="image" src="https://github.com/user-attachments/assets/a7f94802-130a-4a54-9987-9f00fb4855b8" />

**ENDPOINT**
  - Analogia: como una direccion especifica.
  - Tecnicamente: URL especifica donde una API recibe peticiones para una funcion especifica.   
    <img width="354" height="132" alt="image" src="https://github.com/user-attachments/assets/ea2ec842-3d01-4623-9d2e-089fb9cccb0c" />

**JSON**
  - Analogia: Lista de compras organizadas.
  - Tecnicamente: Formato ligero para intercambio de datos basado en tenxo y legible por humanos.   
    <img width="308" height="117" alt="image" src="https://github.com/user-attachments/assets/ba42e77c-598c-494a-90d7-b775ce2a852b" />   
---
- #### **Evidencia visual:**

- Captura de pantalla de la interfaz web en modo docente.   
<img width="1915" height="912" alt="image" src="https://github.com/user-attachments/assets/6213de22-f8ae-40d9-8838-8be8540e2cdc" />   
<img width="1911" height="912" alt="image" src="https://github.com/user-attachments/assets/fb40072d-ce4b-48c8-8f81-e554a55e578f" />   
<img width="1919" height="911" alt="image" src="https://github.com/user-attachments/assets/a6bf7768-d183-4ad5-ba70-6316049342a6" />  
<img width="1916" height="907" alt="image" src="https://github.com/user-attachments/assets/c88a9639-798d-4743-9fc4-c36105c2e0de" />   
<img width="1915" height="913" alt="image" src="https://github.com/user-attachments/assets/f111a704-24da-4890-96d1-290e9b2d97ef" />  





- Captura de pantalla en modo estudiante.  
<img width="1919" height="963" alt="image" src="https://github.com/user-attachments/assets/04f217f4-30b3-4812-ae4e-4b5e5ef42665" />   
<img width="1913" height="967" alt="image" src="https://github.com/user-attachments/assets/79ec88bc-b71d-47f6-a1fb-32b06a54e7ed" />   
<img width="1913" height="967" alt="image" src="https://github.com/user-attachments/assets/434c4e2d-0847-48ff-8ae1-3d4cb5dae4d1" />  
<img width="1917" height="960" alt="image" src="https://github.com/user-attachments/assets/04ae5faf-4a88-4dc7-8123-99ea5173d2cd" />    
  <img width="1915" height="971" alt="image" src="https://github.com/user-attachments/assets/802bf545-727e-4758-b43a-ac8f799ccc13" />  


- Foto del hardware montado con el NeoPixel encendido.   
  Docente:    
<img width="1600" height="1200" alt="image" src="https://github.com/user-attachments/assets/f20f11de-c7d7-4e7a-8028-2420f7fb0f38" />  

 
   Estudiante:    
<img width="1600" height="1200" alt="image" src="https://github.com/user-attachments/assets/72cfd5cf-7a2e-45de-8095-d7ada5256981" />  


- Captura de consola con registros del sistema.   
<img width="1764" height="955" alt="image" src="https://github.com/user-attachments/assets/7283462d-71da-4704-9027-09ddb526d05b" />   
<img width="1269" height="536" alt="image" src="https://github.com/user-attachments/assets/674c7c32-2676-4760-ad50-591de3390bbb" />  

