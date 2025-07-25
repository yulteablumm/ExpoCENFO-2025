function setProfile(profile) {
  if (profile === 'docente') {
    document.getElementById('profileDocente').style.display = 'block';
    document.getElementById('profileEstudiante').style.display = 'none';
  } else {
    document.getElementById('profileDocente').style.display = 'none';
    document.getElementById('profileEstudiante').style.display = 'block';
  }
}

async function sendQuestion(profile) {
  let questionInput = profile === 'docente' ? 'questionDocente' : 'questionEstudiante';
  let answerDiv = profile === 'docente' ? 'answerDocente' : 'answerEstudiante';

  const question = document.getElementById(questionInput).value.trim();
  if (!question) {
    alert('Por favor escribe una pregunta');
    return;
  }

  document.getElementById(answerDiv).innerText = 'Procesando...';

  try {
    const response = await fetch('/ask', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({question: question})
    });

    if (!response.ok) {
      throw new Error('Error en la respuesta del servidor');
    }

    const data = await response.json();
    document.getElementById(answerDiv).innerText = data.response;
  } catch (error) {
    document.getElementById(answerDiv).innerText = 'Error: ' + error.message;
  }
}
