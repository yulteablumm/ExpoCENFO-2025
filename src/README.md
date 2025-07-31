
# ESP32 Backend

Este archivo corresponde al servidor local alojado en el ESP32 que atiende solicitudes de una interfaz web educativa. Su propósito es permitir que docentes y estudiantes formulen preguntas, que son procesadas por un modelo de lenguaje vía OpenRouter. Incluye visualización de estados mediante NeoPixel, estructuras asincrónicas y un frontend interactivo con diseño responsivo.

---

## Funcionalidad General

- Conexión a red WiFi usando credenciales definidas en el código.
- Montaje de SPIFFS para servir archivos estáticos (`index.html`, `style.css`, `script.js`, `/assets`).
- Activación de mDNS para acceso local tipo `http://esp32.local`.
- Inicio de servidor asíncrono usando `ESPAsyncWebServer` en el puerto 80.
- Cambio entre perfiles `"docente"` y `"estudiante"` mediante el endpoint `/setmode`.
- Registro de preguntas desde la interfaz usando el endpoint `/ask` con arquitectura de polling en `/result?id=...`.
- Comunicación con el modelo DeepHermes 3 Llama 3 8B Preview vía OpenRouter.
- Animación y color de NeoPixel para retroalimentación visual de estado.

---

## Endpoints 

| Endpoint       | Método | Descripción |
|----------------|--------|-------------|
| `/`            | `GET`  | Sirve archivos estáticos desde SPIFFS (frontend, estilos, scripts, assets). |
| `/setmode`     | `POST` | Cambia el modo del sistema: docente o estudiante. JSON esperado: `{ "mode": "docente" }`. |
| `/ask`         | `POST` | Envía una pregunta. Regresa un ID único para seguimiento. |
| `/result?id=X` | `GET`  | Verifica si la respuesta está disponible. Devuelve JSON con resultado o `null`. |

---

## Gestión de Estados Visuales con NeoPixel

| Estado                | Color / Efecto         |
|-----------------------|------------------------|
| Modo docente          | Violeta                |
| Modo estudiante       | Amarillo               |
| Pregunta en proceso   | Efecto arcoíris dinámico |
| Error en SPIFFS       | Rojo                   |
| Respuesta generada    | Parpadeo rojo          |

La tarea arcoíris se ejecuta en multitarea paralela (`xTaskCreatePinnedToCore`) para no bloquear el flujo principal.

---

## Librerías Incluidas

- `WiFi.h` – Conexión WiFi.
- `ESPAsyncWebServer.h` – Servidor HTTP asíncrono.
- `SPIFFS.h` – Sistema de archivos interno.
- `ArduinoJson.h` – Manejo de JSON.
- `HTTPClient.h` – Peticiones HTTP a APIs externas.
- `ESPmDNS.h` – Acceso local por nombre de red.
- `Adafruit_NeoPixel.h` – Control del LED RGB.
- `map` – Estructura para seguimiento de solicitudes.

---

## Variables Clave

| Variable              | Propósito                                  |
|-----------------------|---------------------------------------------|
| `currentMode`         | Modo activo (`"docente"` o `"estudiante"`). |
| `pendingRequests`     | Mapa que almacena preguntas en espera.      |
| `OPENROUTER_API_URL`  | Endpoint de OpenRouter.                     |
| `OPENROUTER_API_KEY`  | Clave privada para autenticación.           |

---

## Diagrama de Flujo
- Diagrama de flujo entre frontend, servidor y modelo de lenguaje.
 <img width="60%" height="80%" alt="EXPOCENFO-version 1 diagrama main cpp drawio (2)" src="https://github.com/user-attachments/assets/430e5898-050b-45b4-bff1-3208de621dca" />
 
---


## Instrucciones de Implementación

1. Subir contenido del frontend a `/data` usando SPIFFS (PlatformIO).
2. Configurar credenciales WiFi y API key directamente en el código.
3. Compilar y flashear el firmware en el ESP32.
4. Acceder vía navegador a `http://esp32.local` o IP local.
5. Interactuar seleccionando el perfil y escribiendo preguntas en el asistente.

---

## Requisitos Previos

 -ESP32 DevKit
 
 -NeoPixel RGB LED
 
 -Plataforma PlatformIO o Arduino IDE configurada
 
 -Acceso a API de OpenRouter con modelo habilitado
