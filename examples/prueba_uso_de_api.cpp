
import requests

url = "tu_url_de_api"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer tu_api_key"
}
data = {
    "model": "tu_modelo_LLM",
    "messages": [
        {"role": "user", "content": "¿Cuál es la capital de Francia?"}
    ]
}

response = requests.post(url, headers=headers, json=data)
print("Status code:", response.status_code)
print("Raw response:")
print(response.text)
if response.status_code == 200:
    try:
        result = response.json()
        print("Respuesta IA:")
        print(result["choices"][0]["message"]["content"])
    except Exception as e:
        print("Error al decodificar JSON:", e)
else:
    print("No se recibió respuesta JSON válida.")

