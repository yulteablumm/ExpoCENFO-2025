# ESP32 Backend - Asistente IA Educativo Multiperfil

Este archivo corresponde al servidor local alojado en el ESP32. El objetivo principal es recibir preguntas desde una interfaz web, enviarlas a un modelo de lenguaje generativo vía OpenRouter, y entregar la respuesta a través de comunicación HTTP. Además, integra retroalimentación visual por medio de un NeoPixel que representa estados del sistema y perfiles.

## Funcionalidad General

1. Conexión a red WiFi utilizando credenciales predefinidas.
2. Montaje de sistema de archivos SPIFFS para servir archivos estáticos.
3. Configuración de mDNS para acceso por `http://esp32.local`.
4. Inicio del servidor web en el puerto 80 mediante `ESPAsyncWebServer`.
5. Gestión de modo activo: docente o estudiante.
6. Gestión de preguntas desde el frontend vía `/ask`, con arquitectura de polling para la respuesta.
7. Envío de preguntas al modelo DeepHermes 3 Llama 3 8B Preview (API OpenRouter).
8. Iluminación por NeoPixel según estados (modo activo, procesamiento, respuesta lista).

## Endpoints

| Endpoint       | Método | Propósito                                  |
|----------------|--------|---------------------------------------------|
| `/setmode`     | POST   | Cambia el perfil activo del sistema         |
| `/ask`         | POST   | Registra una pregunta, inicia procesamiento |
| `/result?id=…` | GET    | Consulta si la respuesta está disponible    |

## Gestión de Estados Visuales con NeoPixel

- Violeta: modo docente.
- Amarillo: modo estudiante.
- Arcoíris dinámico: pregunta en procesamiento.
- Parpadeo rojo: respuesta generada.

## Librerías Incluidas

- `WiFi.h` – conexión inalámbrica.
- `ESPAsyncWebServer.h` – servidor HTTP asincrónico.
- `SPIFFS.h` – almacenamiento de archivos.
- `ArduinoJson.h` – parseo de estructuras JSON.
- `HTTPClient.h` – cliente HTTP para consultas externas.
- `ESPmDNS.h` – acceso local mediante nombre de dominio.
- `Adafruit_NeoPixel.h` – control RGB de estados.
- `map` – gestión de preguntas pendientes.

## Variables Clave

- `currentMode`: define el perfil activo.
- `pendingRequests`: almacena temporalmente las preguntas y sus respuestas.
- `OPENROUTER_API_URL`: define el endpoint del modelo de lenguaje.
- `OPENROUTER_API_KEY`: clave de acceso para autenticar solicitudes.

## Diagrama de Flujo
- Diagrama de flujo entre frontend, servidor y modelo de lenguaje.
  <img width="60%" height="80%" alt="EXPOCENFO-version 1 diagrama main cpp drawio (1)" src="https://github.com/user-attachments/assets/095a589c-842a-40c8-b26a-1b88e8cde8cc" />


## Instrucciones de Implementación

1. Subir archivos frontend a `/data` mediante SPIFFS en PlatformIO.
2. Configurar credenciales WiFi y claves API.
3. Compilar y subir el código al ESP32.
4. Acceder vía navegador a `http://esp32.local` o a la IP local.
5. Interactuar con el sistema seleccionando el perfil y formulando preguntas.

## Requisitos Previos

- ESP32 DevKit
- NeoPixel RGB LED
- Plataforma PlatformIO o Arduino IDE configurada
- Acceso a API de OpenRouter con modelo habilitado
