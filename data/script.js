// Sugerencias y minijuegos
const sugeridasDocente = [
  "¿Cómo puedo adaptar mi clase para un niño con autismo?",
  "Sugerencias para motivar a estudiantes con TDAH",
  "¿Qué actividades recomiendas para mejorar la inclusión?",
  "¿Cómo trabajar con padres de familia de niños con discapacidad?"
];
const sugeridasEstudiante = [
  "¿Qué es la amistad?",
  "¿Por qué es importante ayudar a los demás?",
  "¿Cómo puedo aprender jugando?",
  "¿Qué puedo hacer si me siento triste?"
];

const teacherJokes = [
  "¿Por qué el libro de matemáticas estaba triste? Porque tenía demasiados problemas.",
  "¿Cuál es el animal más antiguo? La cebra, porque está en blanco y negro.",
  "¿Por qué los profesores usan lentes? Porque mejoran su visión educativa.",
  "¿Qué le dice una pared a otra? Nos vemos en la esquina."
];

// Historial independiente por modo
let currentMode = "docente";
function getHistoryKey() {
  return currentMode === "docente" ? "chatHistoryDocente" : "chatHistoryEstudiante";
}
function loadHistory() {
  return JSON.parse(localStorage.getItem(getHistoryKey()) || '[]');
}
function saveHistory(history) {
  localStorage.setItem(getHistoryKey(), JSON.stringify(history));
}
let chatHistory = loadHistory();

function addToHistory(question, answer, imgUrl) {
  chatHistory.push({ question, answer, imgUrl });
  saveHistory(chatHistory);
  renderHistory();
}

function renderHistory() {
  const chatDiv = document.getElementById('chat-history');
  if (chatHistory.length === 0) {
    chatDiv.innerHTML = "<div style='text-align:center;color:#aaa;'>No hay conversaciones previas.</div>";
    document.getElementById('voice-read-btn').classList.remove('visible');
    document.getElementById('voice-pause-btn').classList.remove('visible');
    document.getElementById('voice-stop-btn').classList.remove('visible');
    return;
  }
  chatDiv.innerHTML = chatHistory.map(item =>
    `<div>
      <div class="bubble-user"><span>👤</span> Tú: ${item.question}</div>
      <div class="bubble-ia"><span>🤖</span> IA: ${item.answer}${item.imgUrl ? `<img src="${item.imgUrl}" alt="Imagen complementaria">` : ''}</div>
    </div>`
  ).join('');
  chatDiv.scrollTop = chatDiv.scrollHeight;
  document.getElementById('voice-read-btn').classList.add('visible');
  document.getElementById('voice-pause-btn').classList.add('visible');
  document.getElementById('voice-stop-btn').classList.add('visible');
}

document.getElementById('clear-history').onclick = function() {
  chatHistory = [];
  saveHistory(chatHistory);
  renderHistory();
};

function renderSuggestions() {
  const docenteDiv = document.getElementById('suggestions-docente');
  const estudianteDiv = document.getElementById('suggestions-estudiante');
  docenteDiv.innerHTML = '';
  estudianteDiv.innerHTML = '';
  sugeridasDocente.forEach(q => {
    docenteDiv.innerHTML += `<button class='suggestion-btn' onclick='setQuestion("${q}")'>${q}</button>`;
  });
  sugeridasEstudiante.forEach(q => {
    estudianteDiv.innerHTML += `<button class='suggestion-btn' onclick='setQuestion("${q}")'>${q}</button>`;
  });
}

function setQuestion(q) {
  document.getElementById('question').value = q;
  document.getElementById('question').focus();
  playSound('clic');
}

// Tabs y modo
document.getElementById('tab-docente').onclick = async function() {
  this.classList.add('active');
  document.getElementById('tab-estudiante').classList.remove('active');
  document.getElementById('section-docente').style.display = '';
  document.getElementById('section-estudiante').style.display = 'none';
  document.getElementById('sidebar-docente').classList.add('visible');
  document.getElementById('response').innerText = '';
  currentMode = "docente";
  chatHistory = loadHistory();
  renderHistory();
  document.getElementById('minigame-modal').style.display = 'none';
  // Chiste aleatorio
  const joke = teacherJokes[Math.floor(Math.random() * teacherJokes.length)];
  document.getElementById('teacher-emojis').innerHTML = `📚 🧑‍💻<br><span style="font-size:1em;color:#6c47a6;">${joke}</span>`;
  try {
    await fetch('/setmode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'docente' })
    });
  } catch (e) {}
};

document.getElementById('tab-estudiante').onclick = async function() {
  this.classList.add('active');
  document.getElementById('tab-docente').classList.remove('active');
  document.getElementById('section-docente').style.display = 'none';
  document.getElementById('section-estudiante').style.display = '';
  document.getElementById('sidebar-docente').classList.remove('visible');
  document.getElementById('response').innerText = '';
  currentMode = "estudiante";
  chatHistory = loadHistory();
  renderHistory();
  showMinigame();
  try {
    await fetch('/setmode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'estudiante' })
    });
  } catch (e) {}
};

// --- Minijuegos rotativos ---
let minigameIndex = 0;
const minigameTypes = ["dino", "memoria", "ingles"];

function showMinigame() {
  const type = minigameTypes[minigameIndex % minigameTypes.length];
  minigameIndex++;
  if (type === "dino") {
    showDinoGame();
  } else if (type === "memoria") {
    showMemoryGame();
  } else if (type === "ingles") {
    showEnglishGame();
  }
}
document.getElementById('random-game-btn').onclick = showMinigame;

// --- Juego 1: Dinosaurio ---
let dinoGameInterval = null;
let dino, obstacles, score, gravity, isJumping;
function showDinoGame() {
  document.getElementById('minigame-modal').style.display = 'flex';
  document.getElementById('minigame-content').innerHTML = `
    <canvas id="dino-canvas" width="320" height="120" style="background:#fffbe7;border-radius:12px;box-shadow:0 2px 8px #ffe066;"></canvas>
    <div style="margin-top:10px;">
      <button id="dino-jump-btn">Saltar (Espacio)</button>
      <button id="dino-exit-btn">Salir</button>
    </div>
    <div id="dino-score" style="margin-top:8px;font-weight:bold;color:#43a047;"></div>
  `;
  startDinoGame();
  document.getElementById('dino-exit-btn').onclick = function() {
    document.getElementById('minigame-modal').style.display = 'none';
    stopDinoGame();
  };
  document.getElementById('dino-jump-btn').onclick = function() {
    dinoJump();
  };
  document.addEventListener('keydown', dinoKeyListener);
}
function startDinoGame() {
  const canvas = document.getElementById('dino-canvas');
  const ctx = canvas.getContext('2d');
  dino = { x: 30, y: 90, vy: 0, width: 18, height: 18 };
  obstacles = [];
  score = 0;
  gravity = 1.2;
  isJumping = false;

  function drawDino() {
    ctx.fillStyle = "#6c47a6";
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
    ctx.fillStyle = "#ffe066";
    ctx.fillRect(dino.x + 12, dino.y + 4, 4, 4); // "ojo"
  }

  function drawObstacles() {
    ctx.fillStyle = "#43a047";
    obstacles.forEach(obs => {
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    });
  }

  function updateObstacles() {
    if (Math.random() < 0.03) {
      obstacles.push({ x: 320, y: 96, width: 12 + Math.random()*10, height: 24 });
    }
    obstacles.forEach(obs => obs.x -= 4);
    obstacles = obstacles.filter(obs => obs.x + obs.width > 0);
  }

  function checkCollision() {
    for (let obs of obstacles) {
      if (
        dino.x + dino.width > obs.x &&
        dino.x < obs.x + obs.width &&
        dino.y + dino.height > obs.y
      ) {
        return true;
      }
    }
    return false;
  }

  function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawDino();
    drawObstacles();
    updateObstacles();

    // Dino physics
    dino.y += dino.vy;
    if (dino.y < 90) {
      dino.vy += gravity;
    } else {
      dino.y = 90;
      dino.vy = 0;
      isJumping = false;
    }

    // Score
    score++;
    document.getElementById('dino-score').innerText = `Puntaje: ${score}`;

    // Collision
    if (checkCollision()) {
      ctx.fillStyle = "#ff0000";
      ctx.font = "bold 18px Arial";
      ctx.fillText("¡Game Over!", 110, 60);
      stopDinoGame();
      playSound('win');
      setTimeout(() => {
        document.getElementById('minigame-modal').style.display = 'none';
      }, 1200);
    }
  }

  dinoGameInterval = setInterval(gameLoop, 40);
}
function stopDinoGame() {
  clearInterval(dinoGameInterval);
  document.removeEventListener('keydown', dinoKeyListener);
}
function dinoJump() {
  if (!isJumping && dino.y >= 90) {
    dino.vy = -14;
    isJumping = true;
  }
}
function dinoKeyListener(e) {
  if (e.code === "Space") dinoJump();
}

// --- Juego 2: Memoria ---
function showMemoryGame() {
  document.getElementById('minigame-modal').style.display = 'flex';
  const emojis = ["🦄","🦄","🚀","🚀","🎨","🎨","🐻","🐻","🌈","🌈","📚","📚"];
  const shuffled = emojis.sort(() => Math.random() - 0.5);
  let revealed = Array(12).fill(false);
  let matched = Array(12).fill(false);
  let first = null, second = null, moves = 0, pairs = 0;

  function renderBoard() {
    let html = `<div style="display:grid;grid-template-columns:repeat(6,40px);gap:6px;">`;
    for (let i = 0; i < 12; i++) {
      html += `<button class="mem-card" data-idx="${i}" style="height:40px;width:40px;font-size:1.5em;">${revealed[i] || matched[i] ? shuffled[i] : "❓"}</button>`;
    }
    html += `</div><div style="margin-top:10px;">Movimientos: ${moves} | Parejas: ${pairs}/6</div>
      <button id="mem-exit-btn" style="margin-top:10px;">Salir</button>`;
    document.getElementById('minigame-content').innerHTML = html;
    document.querySelectorAll('.mem-card').forEach(btn => {
      btn.onclick = function() {
        const idx = Number(btn.dataset.idx);
        if (revealed[idx] || matched[idx] || second !== null) return;
        revealed[idx] = true;
        if (first === null) {
          first = idx;
        } else {
          second = idx;
          moves++;
          setTimeout(() => {
            if (shuffled[first] === shuffled[second]) {
              matched[first] = matched[second] = true;
              pairs++;
              if (pairs === 6) {
                document.getElementById('minigame-content').innerHTML += `<div style="color:#43a047;font-weight:bold;">¡Ganaste! 🎉</div>`;
                playSound('win');
              }
            }
            revealed[first] = revealed[second] = false;
            first = second = null;
            renderBoard();
          }, 700);
        }
        renderBoard();
      };
    });
    document.getElementById('mem-exit-btn').onclick = function() {
      document.getElementById('minigame-modal').style.display = 'none';
    };
  }
  renderBoard();
}

// --- Juego 3: Palabras en inglés ---
function showEnglishGame() {
  document.getElementById('minigame-modal').style.display = 'flex';
  const words = [
    {es:"gato", en:"cat"},
    {es:"perro", en:"dog"},
    {es:"libro", en:"book"},
    {es:"sol", en:"sun"},
    {es:"casa", en:"house"},
    {es:"árbol", en:"tree"},
    {es:"niño", en:"boy"},
    {es:"niña", en:"girl"}
  ];
  const idx = Math.floor(Math.random()*words.length);
  const correct = words[idx].en;
  let options = [correct];
  while (options.length < 4) {
    const opt = words[Math.floor(Math.random()*words.length)].en;
    if (!options.includes(opt)) options.push(opt);
  }
  options = options.sort(() => Math.random() - 0.5);
  let html = `<div style="font-size:1.3em;margin-bottom:10px;">¿Cómo se dice <b>${words[idx].es}</b> en inglés?</div>
    <div>`;
  options.forEach(opt => {
    html += `<button class="eng-opt" style="margin:4px 8px 4px 0;padding:8px 18px;font-size:1em;">${opt}</button>`;
  });
  html += `</div><div id="eng-result" style="margin-top:10px;font-weight:bold;"></div>
    <button id="eng-exit-btn" style="margin-top:10px;">Salir</button>`;
  document.getElementById('minigame-content').innerHTML = html;
  document.querySelectorAll('.eng-opt').forEach(btn => {
    btn.onclick = function() {
      if (btn.innerText === correct) {
        document.getElementById('eng-result').innerText = "¡Correcto! 🎉";
        playSound('win');
      } else {
        document.getElementById('eng-result').innerText = "Intenta de nuevo.";
      }
    };
  });
  document.getElementById('eng-exit-btn').onclick = function() {
    document.getElementById('minigame-modal').style.display = 'none';
  };
}

// Sonidos
function playSound(tipo) {
  if (tipo === 'clic') document.getElementById('snd-clic').play();
  if (tipo === 'respuesta') document.getElementById('snd-respuesta').play();
  if (tipo === 'win') document.getElementById('snd-win').play();
}

// Exportar respuestas útiles a PDF (jsPDF)
document.getElementById('export-history').onclick = function() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 10;
  chatHistory.forEach(item => {
    let pregunta = doc.splitTextToSize(`Pregunta: ${item.question}`, 180);
    let respuesta = doc.splitTextToSize(`Respuesta: ${item.answer}`, 180);
    doc.text(pregunta, 10, y);
    y += pregunta.length * 8;
    doc.text(respuesta, 10, y);
    y += respuesta.length * 8;
    if (item.imgUrl) {
      doc.text(doc.splitTextToSize(`Imagen: ${item.imgUrl}`, 180), 10, y);
      y += 8;
    }
    y += 4;
    if (y > 270) { doc.addPage(); y = 10; }
  });
  doc.save("respuestas_utiles.pdf");
};

// Calendario/planeamiento docente
let calendarPlans = JSON.parse(localStorage.getItem('calendarPlans') || '[]');
function addPlan() {
  const date = document.getElementById('plan-date').value;
  const title = document.getElementById('plan-title').value.trim();
  const desc = document.getElementById('plan-desc').value.trim();
  if (!date || !title) return alert("Completa la fecha y el título.");
  calendarPlans.push({date, title, desc});
  localStorage.setItem('calendarPlans', JSON.stringify(calendarPlans));
  renderCalendar();
  document.getElementById('plan-date').value = '';
  document.getElementById('plan-title').value = '';
  document.getElementById('plan-desc').value = '';
}
function renderCalendar() {
  const list = document.getElementById('calendar-list');
  if (!list) return;
  if (calendarPlans.length === 0) {
    list.innerHTML = "<div style='color:#888;'>No hay actividades planeadas.</div>";
    return;
  }
  list.innerHTML = calendarPlans.map(plan =>
    `<div style="background:#fafafa;border-radius:8px;padding:8px;margin-bottom:6px;">
      <b>${plan.date}</b> - <span style="color:#6c47a6;">${plan.title}</span><br>
      <span>${plan.desc}</span>
    </div>`
  ).join('');
}

// Exportar calendario a Google Calendar (.ics)
function exportCalendarICS() {
  let ics = "BEGIN:VCALENDAR\nVERSION:2.0\n";
  calendarPlans.forEach(plan => {
    ics += "BEGIN:VEVENT\n";
    ics += `DTSTART:${plan.date.replace(/-/g, "")}T090000Z\n`;
    ics += `SUMMARY:${plan.title}\n`;
    ics += `DESCRIPTION:${plan.desc}\n`;
    ics += "END:VEVENT\n";
  });
  ics += "END:VCALENDAR";
  let blob = new Blob([ics], {type: "text/calendar"});
  let link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = "calendario.ics";
  link.click();
}

// Enviar pregunta
let pollingInterval = null;
async function sendQuestion(event) {
  if (event) event.preventDefault();
  const question = document.getElementById('question').value.trim();
  if (!question) return false;
  document.getElementById('response').innerText = 'Consultando...';
  playSound('clic');
  try {
    const res = await fetch('/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
    const data = await res.json();
    if (data.id) {
      if (pollingInterval) clearInterval(pollingInterval);
      pollingInterval = setInterval(() => checkResult(data.id, question), 1000);
    } else {
      document.getElementById('response').innerText = 'Error: No se recibió ID.';
    }
  } catch (e) {
    document.getElementById('response').innerText = 'Error al consultar la IA.';
  }
  return false;
}

async function checkResult(id, question) {
  try {
    const res = await fetch(`/result?id=${id}`);
    const data = await res.json();
    if (data.response !== null && data.response !== undefined) {
      // Buscar imagen relacionada en Unsplash y agregar emojis extra
      let imgUrl = '';
      let extraEmojis = '';
      try {
        const keywords = encodeURIComponent(question.split(' ').slice(0,2).join(' '));
        const imgRes = await fetch(`https://source.unsplash.com/400x200/?${keywords}`);
        imgUrl = imgRes.url;
        extraEmojis = getRandomEmojis();
      } catch {}
      addToHistory(question, data.response + " " + extraEmojis, imgUrl);
      document.getElementById('response').innerText = '';
      clearInterval(pollingInterval);
      playSound('respuesta');
    }
  } catch (e) {
    document.getElementById('response').innerText = 'Error al consultar el resultado.';
    clearInterval(pollingInterval);
  }
}
function getRandomEmojis() {
  const emojis = ["🌟", "🚀", "🎉", "💡", "🦄", "✨", "🤩", "🎨", "📚", "🧠"];
  return emojis.sort(() => 0.5 - Math.random()).slice(0, 2).join(" ");
}

document.getElementById('ask-form').addEventListener('submit', sendQuestion);

// Preguntar por voz
let recognition;
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  document.getElementById('voice-btn').classList.add('visible');
  document.getElementById('voice-btn').onclick = function() {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'es-ES';
    recognition.onresult = function(event) {
      const texto = event.results[0][0].transcript;
      document.getElementById('question').value = texto;
      document.getElementById('question').focus();
    };
    recognition.start();
  };
} else {
  document.getElementById('voice-btn').style.display = 'none';
}

// Lectura en voz alta con controles
let utter;
document.getElementById('voice-read-btn').onclick = function() {
  if (!('speechSynthesis' in window)) {
    alert("Tu navegador no soporta síntesis de voz.");
    return;
  }
  let last = chatHistory[chatHistory.length-1];
  if (last && last.answer) {
    utter = new SpeechSynthesisUtterance(last.answer);
    utter.lang = 'es-ES';
    utter.rate = 1;
    window.speechSynthesis.speak(utter);
  }
};
document.getElementById('voice-pause-btn').onclick = function() {
  if ('speechSynthesis' in window) window.speechSynthesis.pause();
};
document.getElementById('voice-stop-btn').onclick = function() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
};

// Footer tip aleatorio
const tips = [
  "¿Sabías que puedes exportar tu calendario a Google Calendar?",
  "¡Usa el micrófono para preguntar sin escribir!",
  "Haz clic en 'Jugar ahora' para un mini juego motivacional.",
  "Las respuestas de la IA ahora incluyen imágenes y emojis.",
  "Puedes limpiar el historial en cualquier momento."
];
document.getElementById('footer-tip').innerText = tips[Math.floor(Math.random()*tips.length)];

renderSuggestions();
renderHistory();
renderCalendar();