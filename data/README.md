# Interfaz Web holahola
## Descripción General del Funcionamiento

1. La interfaz ofrece dos pestañas: “Docente” y “Estudiante”.
2. Al seleccionar un perfil, se actualiza el modo operativo del servidor ESP32 mediante una solicitud POST al endpoint `/setmode`.
3. En cada sección se presentan preguntas sugeridas que pueden ser seleccionadas por el usuario.
4. El usuario puede formular una pregunta personalizada en el campo de entrada.
5. Al hacer clic en “Preguntar”, se envía una solicitud POST al endpoint `/ask` con la pregunta.
6. La respuesta es consultada periódicamente mediante polling al endpoint `/result?id=...` hasta que esté disponible.
7. La respuesta se muestra en pantalla dentro del área `#response`.

## Archivos Incluidos

- `index.html`: archivo principal que contiene la estructura de la interfaz, se sirve desde SPIFFS en el ESP32.
- Estilos embebidos en `<style>` para simplificar la gestión de archivos en SPIFFS.
- Código JavaScript embebido para interacción con el backend, envío de solicitudes, polling de respuestas y manejo de la lógica de interfaz.

## Estructura de Código

### Pestañas de perfil

```js
document.getElementById('tab-docente').onclick = async function() { ... };
document.getElementById('tab-estudiante').onclick = async function() { ... };
```

Actualiza el modo de interacción del servidor entre “docente” y “estudiante”.

### Preguntas sugeridas

```js
const sugeridasDocente = [ ... ];
const sugeridasEstudiante = [ ... ];
```

Cada perfil tiene preguntas contextualizadas que pueden ser seleccionadas con un clic.

### Envío de pregunta
 
```js
document.getElementById('ask-form').addEventListener('submit', sendQuestion);
```

La pregunta se envía como JSON, iniciando el proceso de generación de respuesta en el servidor.

### Consulta de respuesta

```js
pollingInterval = setInterval(() => checkResult(data.id), 1000);
```

Se consulta al servidor cada segundo hasta que la respuesta esté lista.

## Requisitos

- Acceso a la red local donde el ESP32 esté conectado.
- Navegador actualizado compatible con HTML5 y JavaScript.
- El servidor ESP32 debe estar corriendo y sirviendo los archivos desde SPIFFS.

## Instrucciones de Uso

1. Encender el ESP32 conectado y con archivos cargados vía SPIFFS.
2. Acceder desde el navegador a `http://[IP_DEL_ESP32]` o `http://esp32.local` si se usa mDNS.
3. Seleccionar el perfil deseado.
4. Elegir una pregunta sugerida o escribir una nueva.
5. Hacer clic en “Preguntar”.
6. Esperar la respuesta generada por la IA.

## Imágenes y Recursos 

- Captura de pantalla de la interfaz web en modo docente.
- Captura de pantalla en modo estudiante con respuesta activa.
- Diagrama de flujo de la interacción entre interfaz y backend.
  <img width="324" height="956" alt="Diagrama de flujo qu" src="https://github.com/user-attachments/assets/150f3f9a-0366-43b0-a10e-2164f65135c1" />


- Esquema técnico de endpoints y comunicación HTTP.

## Consideraciones de Accesibilidad

- Botones con buen contraste para visibilidad.
- Campos con texto de ayuda (placeholder).
- Respuesta con tamaño y fondo adecuado para facilitar lectura.
- Adaptable a pantallas de dispositivos móviles mediante `viewport` y diseño centralizado.

