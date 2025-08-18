

### **1. Diagrama General de la Arquitectura Completa**

<img width="743" height="1441" alt="image" src="https://github.com/user-attachments/assets/052d24b9-a08f-4fb2-aded-8b6e8f5dccc9" />


---

### **2. Capas del Sistema**  

#### **2.1 Capa de Presentación**  
- **Componentes**:  
  - Interfaz web (HTML/CSS/JS servida desde SPIFFS)  
  - LED NeoPixel (feedback visual)  
- **Protocolos**:  
  - HTTP/HTTPS (puerto 80)  
  - mDNS (`esp32.local`)  

#### **2.2 Capa de Lógica de Negocio**  
<img width="1980" height="1020" alt="prueba corta(progra) - Copy of expo 1" src="https://github.com/user-attachments/assets/7a7719e4-c95d-40a7-9fff-867d533aac72" />

---

### **3. Flujo de Datos Detallado**  

#### **3.1 Consulta a la IA**  
1. **Paso 1**: Cliente envía pregunta via POST `/ask`  
   ```json
   {"question":"¿Cómo enseñar el ciclo del agua?"}
   ```
2. **Paso 2**: ESP32:  
   - Genera ID único (`ABC123`)  
   - Almacena en `pendingRequests`  
   - Llama a la API:  
   ```cpp
   http.POST("{\"model\":\"...\",\"messages\":[...]}");
   ```
3. **Paso 3**: Procesamiento:  
   - LED → Efecto arcoíris  
   - Timeout: 15 segundos  

---
### **Diagrama de interaccion**  

---


### **5. Toma de desiciones y accion**  

#### **6.1 Asincronía**  
- **Problema**: Bloqueo durante consultas HTTP  
- **Solución**:  
  ```cpp
  xTaskCreatePinnedToCore(
    taskConsultaAPI,  // Función
    "API_Task",      // Nombre
    8192,            // Stack size
    (void*)&data,    // Parámetros
    1,               // Prioridad
    NULL,            // Handle
    1                // Core
  );
  ```

#### **6.2 Gestión de Memoria**  
- **Técnicas**:  
  - Pool de buffers JSON (reutilización)  
  - Limpieza agresiva de `pendingRequests`  
  - SPIFFS con rotación automática  

#### **6.3 Seguridad**  
| Capa               | Implementación                     |
|--------------------|------------------------------------|
| Red                | WiFi WPA2                          |
| API                | Claves en código (no recomendado para producción) |
| Web                | CORS restringido                   |

---

