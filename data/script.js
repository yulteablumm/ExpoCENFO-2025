// ===== AI ASISTENTE EDUCATIVO - ESP32 PROJECT =====
// Diseño mejorado manteniendo funcionalidad original

// ===== VARIABLES GLOBALES =====
let currentMode = "docente";
let chatHistory = [];
let calendarPlans = [];
let pollingInterval = null;
let dinoGameInterval = null;
let speechSynthesis = window.speechSynthesis;
let speechRecognition = null;
let studentStats = {};
let achievements = [];
let currentTheme = 'default';
let reminders = [];
let reminderIntervals = [];
let progressChart = null;
let analyticsData = {};

// ===== DATOS DE SUGERENCIAS =====
const sugeridasDocente = [
    "¿Cómo puedo adaptar mi clase para un niño con autismo?",
    "Sugerencias para motivar a estudiantes con TDAH",
    "¿Qué actividades recomiendas para mejorar la inclusión?",
    "¿Cómo trabajar con padres de familia de niños con discapacidad?",
    "Estrategias para la educación diferenciada",
    "¿Cómo crear un ambiente de aula inclusivo?"
];

const sugeridasEstudiante = [
    "¿Qué es la amistad? 🤗",
    "¿Por qué es importante ayudar a los demás? 💝",
    "¿Cómo puedo aprender jugando? 🎮",
    "¿Qué puedo hacer si me siento triste? 😢",
    "¿Por qué son importantes las emociones? 💭",
    "¿Cómo puedo ser más creativo? 🎨"
];

const teacherJokes = [
    "¿Por qué el libro de matemáticas estaba triste? Porque tenía demasiados problemas. 📚😄",
    "¿Cuál es el animal más antiguo? La cebra, porque está en blanco y negro. 🦓⚫⚪",
    "¿Por qué los profesores usan lentes? Porque mejoran su visión educativa. 👓📖",
    "¿Qué le dice una pared a otra? Nos vemos en la esquina. 🧱👋",
    "¿Por qué el lápiz fue al médico? Porque tenía punta. ✏️🏥"
];

const tips = [
    "💡 Usa el micrófono para preguntar sin escribir",
    "🎮 Los juegos ayudan a reforzar el aprendizaje",
    "📄 Puedes exportar tus mejores respuestas a PDF",
    "📅 Planifica tus clases y expórtalas a Google Calendar",
    "🎨 Los colores y animaciones mejoran la concentración",
    "🤖 La IA está aquí para ayudarte las 24 horas"
];

// ===== SISTEMA DE LOGROS =====
// ===== RESPUESTAS OFFLINE =====
const offlineResponses = {
    saludos: {
        keywords: ['hola', 'buenos días', 'buenas tardes', 'buenas noches', 'como estas'],
        responses: [
            '¡Hola! 😊 Aunque no tengo conexión a internet ahora, sigo aquí para ayudarte con algunas preguntas básicas.',
            '¡Buenos días! 🌅 Estoy en modo offline, pero puedo responder algunas cosas simples.',
            '¡Hola querido estudiante! 🤖 Sin internet, pero con ganas de ayudarte.'
        ]
    },
    matematicas: {
        keywords: ['suma', 'resta', 'multiplicar', 'dividir', 'matemáticas', 'números'],
        responses: [
            '¡Las matemáticas son divertidas! 🔢 Puedes practicar sumas como 2+2=4, o restas como 5-3=2.',
            'Los números están en todas partes. Cuenta cuántos dedos tienes: ¡10! 🖐️🖐️',
            '¿Sabías que si tienes 3 manzanas y comes 1, te quedan 2? ¡Eso es resta! 🍎'
        ]
    },
    colores: {
        keywords: ['color', 'colores', 'rojo', 'azul', 'verde', 'amarillo'],
        responses: [
            '¡Los colores son maravillosos! 🌈 El rojo es como las fresas, el azul como el cielo.',
            'Puedes mezclar colores: rojo + amarillo = naranja. ¡Es como magia! 🎨',
            'Mi color favorito es el arcoíris porque tiene todos los colores juntos. 🌈'
        ]
    },
    animales: {
        keywords: ['animal', 'animales', 'perro', 'gato', 'león', 'elefante'],
        responses: [
            '¡Me encantan los animales! 🐶 Los perros dicen "guau", los gatos "miau".',
            'Los elefantes son enormes y tienen una trompa muy larga. 🐘',
            '¿Sabías que las jirafas son los animales más altos del mundo? 🦒'
        ]
    },
    emociones: {
        keywords: ['triste', 'feliz', 'enojado', 'emoción', 'sentir'],
        responses: [
            'Es normal sentir diferentes emociones. Si estás triste, recuerda que siempre viene algo bueno. 💝',
            'Cuando te sientas feliz, ¡comparte esa alegría con otros! 😊',
            'Si estás enojado, respira profundo y cuenta hasta 10. Te ayudará a calmarte. 🧘‍♀️'
        ]
    },
    default: [
        'Sin conexión a internet, pero aquí estoy contigo. 🤖 Pregúntame sobre colores, números, animales o emociones.',
        'Estoy en modo offline, pero puedo ayudarte con temas básicos como matemáticas simples, colores o animales. 📚',
        'No tengo internet ahora, pero recuerda: ¡eres increíble y puedes lograr todo lo que te propongas! ⭐'
    ]
};

const achievementsData = [
    {
        id: 'first_question',
        name: 'Primera Pregunta',
        description: 'Haz tu primera pregunta',
        icon: '🌟',
        requirement: { type: 'questions', count: 1 }
    },
    {
        id: 'curious_mind',
        name: 'Mente Curiosa',
        description: 'Haz 5 preguntas',
        icon: '🧠',
        requirement: { type: 'questions', count: 5 }
    },
    {
        id: 'explorer',
        name: 'Explorador',
        description: 'Haz 10 preguntas',
        icon: '🚀',
        requirement: { type: 'questions', count: 10 }
    },
    {
        id: 'game_player',
        name: 'Jugador',
        description: 'Juega un mini-juego',
        icon: '🎮',
        requirement: { type: 'games', count: 1 }
    },
    {
        id: 'voice_user',
        name: 'Hablador',
        description: 'Usa el micrófono',
        icon: '🎤',
        requirement: { type: 'voice', count: 1 }
    },
    {
        id: 'scholar',
        name: 'Estudiante Estrella',
        description: 'Haz 25 preguntas',
        icon: '⭐',
        requirement: { type: 'questions', count: 25 }
    },
    {
        id: 'friend_bot',
        name: 'Amigo del Robot',
        description: 'Pregunta sobre amistad',
        icon: '🤖',
        requirement: { type: 'keyword', keyword: 'amistad' }
    },
    {
        id: 'creative',
        name: 'Creativo',
        description: 'Pregunta sobre creatividad',
        icon: '🎨',
        requirement: { type: 'keyword', keyword: 'creativo' }
    }
];

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🤖 Iniciando AI Asistente Educativo...');
    
    // Cargar datos guardados
    loadSavedData();
    
    // Configurar eventos
    setupEventListeners();
    setupSpeechRecognition();
    setupThemeSelector();
    setupAnalytics();
    
    // Renderizar elementos
    renderSuggestions();
    renderHistory();
    renderCalendar();
    initAchievements();
    renderReminders();
    startReminderSystem();
    
    // Mostrar pantalla de carga
    showLoadingScreen();
    
    // Configurar tip aleatorio
    setRandomTip();
    
    // Inicializar modo docente
    switchMode('docente');
    
    console.log('✅ Aplicación inicializada correctamente');
});

function loadSavedData() {
    chatHistory = loadHistory();
    calendarPlans = JSON.parse(localStorage.getItem('calendarPlans') || '[]');
    studentStats = JSON.parse(localStorage.getItem('studentStats') || '{"questions": 0, "games": 0, "voice": 0, "keywords": []}');
    achievements = JSON.parse(localStorage.getItem('achievements') || '[]');
    currentTheme = localStorage.getItem('currentTheme') || 'default';
    reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
    analyticsData = JSON.parse(localStorage.getItem('analyticsData') || '{"daily": {}, "topics": {}}');
    applyTheme(currentTheme);
}

function showLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    
    setTimeout(() => {
        loadingScreen.classList.add('fade-out');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 2000);
}

// ===== GESTIÓN DE HISTORIAL =====
function getHistoryKey() {
    return currentMode === "docente" ? "chatHistoryDocente" : "chatHistoryEstudiante";
}

function loadHistory() {
    return JSON.parse(localStorage.getItem(getHistoryKey()) || '[]');
}

function saveHistory(history) {
    localStorage.setItem(getHistoryKey(), JSON.stringify(history));
}

function addToHistory(question, answer, imgUrl) {
    const extraEmojis = getRandomEmojis();
    chatHistory.push({ 
        question, 
        answer: answer + " " + extraEmojis, 
        imgUrl,
        timestamp: new Date().toLocaleString()
    });
    saveHistory(chatHistory);
    renderHistory();
    updateVoiceControls();
}

function renderHistory() {
    const chatDiv = document.getElementById('chat-history');
    
    if (chatHistory.length === 0) {
        chatDiv.innerHTML = '';
        updateVoiceControls(false);
        return;
    }
    
    chatDiv.innerHTML = chatHistory.map(item => `
        <div class="bubble-user">
            <strong>👤 Tú:</strong> ${item.question}
        </div>
        <div class="bubble-ia">
            <strong>🤖 IA:</strong> ${item.answer}
            ${item.imgUrl ? `<img src="${item.imgUrl}" alt="Imagen relacionada" loading="lazy">` : ''}
            <small style="opacity: 0.7; font-size: 0.8em; display: block; margin-top: 0.5rem;">
                📅 ${item.timestamp || 'Fecha no disponible'}
            </small>
        </div>
    `).join('');
    
    chatDiv.scrollTop = chatDiv.scrollHeight;
    updateVoiceControls(true);
}

function updateVoiceControls(show = true) {
    const controls = ['voice-read-btn', 'voice-pause-btn', 'voice-stop-btn'];
    controls.forEach(id => {
        document.getElementById(id).classList.toggle('visible', show);
    });
}

// ===== CONFIGURACIÓN DE EVENTOS =====
function setupEventListeners() {
    // Cambio de modo
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            switchMode(mode);
            playSound('clic');
        });
    });
    
    // Formulario de pregunta
    document.getElementById('ask-form').addEventListener('submit', sendQuestion);
    
    // Botón de voz
    document.getElementById('voice-btn').addEventListener('click', startVoiceRecognition);
    
    // Controles de voz
    document.getElementById('voice-read-btn').addEventListener('click', readLastResponse);
    document.getElementById('voice-pause-btn').addEventListener('click', pauseSpeech);
    document.getElementById('voice-stop-btn').addEventListener('click', stopSpeech);
    
    // Limpiar historial
    document.getElementById('clear-history').addEventListener('click', clearHistory);
    
    // Cerrar modal
    document.querySelector('.modal-close').addEventListener('click', closeModal);
    document.getElementById('minigame-modal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });
    
    // Juego aleatorio
    document.getElementById('random-game-btn').addEventListener('click', showRandomGame);
}

// ===== CAMBIO DE MODO =====
function switchMode(mode) {
    if (currentMode === mode) return;
    
    currentMode = mode;
    
    // Actualizar UI
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.toggle('active', section.id === `section-${mode}`);
    });
    
    // Mostrar/ocultar sidebar
    const sidebar = document.getElementById('sidebar-docente');
    if (mode === 'docente') {
        sidebar.classList.add('visible');
        showRandomJoke();
    } else {
        sidebar.classList.remove('visible');
        closeModal(); // Cerrar modal si está abierto
    }
    
    // Cargar datos del modo
    chatHistory = loadHistory();
    renderHistory();
    
    // Actualizar placeholder
    const input = document.getElementById('question');
    input.placeholder = mode === 'docente' 
        ? 'Escribe tu consulta profesional aquí...' 
        : '¡Pregúntame algo divertido! 🌟';
    
    // Enviar modo al ESP32
    sendModeToESP32(mode);
    
    // Limpiar respuesta
    document.getElementById('response').innerHTML = '';
    
    console.log(`📡 Cambiado a modo ${mode}`);
}

async function sendModeToESP32(mode) {
    try {
        await fetch('/setmode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode })
        });
        console.log(`📡 Modo ${mode} enviado a ESP32`);
    } catch (error) {
        console.warn('⚠️ No se pudo conectar con ESP32:', error);
    }
}

// ===== SUGERENCIAS =====
function renderSuggestions() {
    renderDocenteSuggestions();
    renderEstudianteSuggestions();
}

function renderDocenteSuggestions() {
    const container = document.getElementById('suggestions-docente');
    container.innerHTML = sugeridasDocente.map(suggestion => 
        `<button class="suggestion-btn" onclick="setQuestion('${suggestion}')">
            <i class="fas fa-lightbulb"></i> ${suggestion}
        </button>`
    ).join('');
}

function renderEstudianteSuggestions() {
    const container = document.getElementById('suggestions-estudiante');
    container.innerHTML = sugeridasEstudiante.map(suggestion => 
        `<button class="suggestion-btn" onclick="setQuestion('${suggestion}')">${suggestion}</button>`
    ).join('');
}

function setQuestion(q) {
    document.getElementById('question').value = q.replace(/'/g, '');
    document.getElementById('question').focus();
    playSound('clic');
}

// ===== RECONOCIMIENTO DE VOZ =====
function setupSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        speechRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        speechRecognition.lang = 'es-ES';
        speechRecognition.continuous = false;
        speechRecognition.interimResults = false;
        
        document.getElementById('voice-btn').classList.add('visible');
    } else {
        document.getElementById('voice-btn').style.display = 'none';
        console.warn('⚠️ Speech Recognition no disponible');
    }
}

function startVoiceRecognition() {
    if (!speechRecognition) return;
    
    const voiceBtn = document.getElementById('voice-btn');
    voiceBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
    voiceBtn.style.background = 'var(--accent-pink)';
    
    speechRecognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        document.getElementById('question').value = transcript;
        playSound('clic');
        
        // Actualizar estadísticas de voz
        updateStudentStats('voice');
    };
    
    speechRecognition.onerror = function(event) {
        console.error('Error de reconocimiento de voz:', event.error);
    };
    
    speechRecognition.onend = function() {
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        voiceBtn.style.background = 'var(--secondary-yellow)';
    };
    
    speechRecognition.start();
}

// ===== SÍNTESIS DE VOZ =====
function readLastResponse() {
    if (!speechSynthesis || chatHistory.length === 0) return;
    
    const lastEntry = chatHistory[chatHistory.length - 1];
    const utterance = new SpeechSynthesisUtterance(lastEntry.answer);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    utterance.pitch = currentMode === 'estudiante' ? 1.2 : 1.0;
    
    speechSynthesis.speak(utterance);
}

function pauseSpeech() {
    if (speechSynthesis) speechSynthesis.pause();
}

function stopSpeech() {
    if (speechSynthesis) speechSynthesis.cancel();
}

// ===== ENVÍO DE PREGUNTAS =====
async function sendQuestion(event) {
    if (event) event.preventDefault();
    
    const questionInput = document.getElementById('question');
    const question = questionInput.value.trim();
    
    if (!question) return false;
    
    // Mostrar estado de carga
    showLoadingResponse();
    questionInput.value = '';
    
    playSound('clic');
    
    try {
        const response = await fetch('/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question })
        });
        
        const data = await response.json();
        
        if (data.id) {
            startPolling(data.id, question);
        } else {
            showErrorResponse('Error: No se recibió ID de consulta');
        }
    } catch (error) {
        console.error('Error al enviar pregunta:', error);
        
        // Intentar respuesta offline
        const offlineResponse = getOfflineResponse(question);
        if (offlineResponse) {
            setTimeout(() => {
                addToHistory(question, offlineResponse, '');
                hideLoadingResponse();
                playSound('respuesta');
                updateStudentStats('question', question);
                
                if (currentMode === 'estudiante') {
                    celebrateResponse();
                }
            }, 1500); // Simular tiempo de respuesta
        } else {
            showErrorResponse('Sin conexión. Intenta con preguntas sobre colores, números, animales o emociones.');
        }
    }
    
    return false;
}

function startPolling(id, question) {
    if (pollingInterval) clearInterval(pollingInterval);
    
    pollingInterval = setInterval(async () => {
        try {
            const response = await fetch(`/result?id=${id}`);
            const data = await response.json();
            
            if (data.response !== null && data.response !== undefined) {
                clearInterval(pollingInterval);
                
                // Obtener imagen relacionada
                let imgUrl = '';
                try {
                    const keywords = encodeURIComponent(question.split(' ').slice(0, 2).join(' '));
                    const imgResponse = await fetch(`https://source.unsplash.com/400x200/?${keywords}`);
                    imgUrl = imgResponse.url;
                } catch (error) {
                    console.log('No se pudo cargar imagen:', error);
                }
                
                addToHistory(question, data.response, imgUrl);
                hideLoadingResponse();
                playSound('respuesta');
                
                // Actualizar estadísticas y logros
                updateStudentStats('question', question);
                updateAnalyticsData(question);
                
                // Celebrar para estudiantes
                if (currentMode === 'estudiante') {
                    celebrateResponse();
                }
            }
        } catch (error) {
            console.error('Error al obtener resultado:', error);
            clearInterval(pollingInterval);
            showErrorResponse('Error al consultar el resultado');
        }
    }, 1000);
}

function showLoadingResponse() {
    const responseBox = document.getElementById('response');
    responseBox.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem;">
            <div class="loading-animation">
                <i class="fas fa-brain fa-spin"></i>
            </div>
            <span>🤖 Pensando... Esto puede tomar unos segundos</span>
        </div>
    `;
    responseBox.style.display = 'block';
}

function hideLoadingResponse() {
    document.getElementById('response').innerHTML = '';
}

function showErrorResponse(message) {
    const responseBox = document.getElementById('response');
    responseBox.innerHTML = `
        <div style="color: var(--accent-pink); display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
        </div>
    `;
}

// ===== LIMPIAR HISTORIAL =====
function clearHistory() {
    if (confirm('¿Estás seguro de que quieres limpiar el historial?')) {
        chatHistory = [];
        saveHistory(chatHistory);
        renderHistory();
        document.getElementById('response').innerHTML = '';
        playSound('clic');
    }
}

// ===== CALENDARIO =====
function addPlan() {
    const date = document.getElementById('plan-date').value;
    const title = document.getElementById('plan-title').value.trim();
    const desc = document.getElementById('plan-desc').value.trim();
    
    if (!date || !title) {
        alert("Completa la fecha y el título.");
        return;
    }
    
    const plan = {
        id: Date.now(),
        date,
        title,
        desc,
        created: new Date().toLocaleString()
    };
    
    calendarPlans.push(plan);
    localStorage.setItem('calendarPlans', JSON.stringify(calendarPlans));
    
    // Limpiar formulario
    document.getElementById('plan-date').value = '';
    document.getElementById('plan-title').value = '';
    document.getElementById('plan-desc').value = '';
    
    renderCalendar();
    playSound('win');
}

function renderCalendar() {
    const container = document.getElementById('calendar-list');
    
    if (calendarPlans.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = calendarPlans
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(plan => `
            <div style="background: var(--light-gray); border-left: 4px solid var(--primary-purple); padding: 1rem; margin: 0.5rem 0; border-radius: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>📅 ${new Date(plan.date).toLocaleDateString('es-ES')}</strong>
                        <h4 style="color: var(--primary-purple); margin: 0.5rem 0;">${plan.title}</h4>
                        <p style="margin: 0; color: var(--dark-gray);">${plan.desc}</p>
                    </div>
                </div>
            </div>
        `).join('');
}

function exportCalendarICS() {
    if (calendarPlans.length === 0) {
        alert("No hay actividades para exportar.");
        return;
    }
    
    let ics = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//AI Asistente//ESP32//ES\n";
    
    calendarPlans.forEach(plan => {
        const date = plan.date.replace(/-/g, '');
        ics += `BEGIN:VEVENT\n`;
        ics += `DTSTART:${date}T090000Z\n`;
        ics += `DTEND:${date}T100000Z\n`;
        ics += `SUMMARY:${plan.title}\n`;
        ics += `DESCRIPTION:${plan.desc}\n`;
        ics += `UID:${plan.id}@ai-asistente-esp32\n`;
        ics += `END:VEVENT\n`;
    });
    
    ics += "END:VCALENDAR";
    
    const blob = new Blob([ics], { type: "text/calendar" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "calendario_ai_asistente.ics";
    link.click();
}

function exportHistoryPDF() {
    if (chatHistory.length === 0) {
        alert("No hay conversaciones para exportar.");
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(16);
    doc.text('AI Asistente Educativo - Historial de Respuestas', 14, 20);
    doc.setFontSize(10);
    doc.text(`Modo: ${currentMode} | Fecha: ${new Date().toLocaleDateString('es-ES')}`, 14, 30);
    
    let y = 45;
    
    chatHistory.forEach((item, index) => {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        const questionLines = doc.splitTextToSize(`${index + 1}. Pregunta: ${item.question}`, 180);
        doc.text(questionLines, 14, y);
        y += questionLines.length * 6;
        
        doc.setFont(undefined, 'normal');
        const answerLines = doc.splitTextToSize(`Respuesta: ${item.answer}`, 180);
        doc.text(answerLines, 14, y);
        y += answerLines.length * 6 + 10;
    });
    
    doc.save(`respuestas_${currentMode}_${new Date().toISOString().split('T')[0]}.pdf`);
}

// ===== MINIJUEGOS =====
function showRandomGame() {
    const games = ['dino', 'memory', 'english'];
    const randomGame = games[Math.floor(Math.random() * games.length)];
    showMiniGame(randomGame);
    playSound('clic');
}

function showMiniGame(gameType) {
    const modal = document.getElementById('minigame-modal');
    const content = document.getElementById('minigame-content');
    
    modal.style.display = 'flex';
    
    // Actualizar estadísticas de juego
    updateStudentStats('game');
    
    switch (gameType) {
        case 'dino':
            showDinoGame(content);
            break;
        case 'memory':
            showMemoryGame(content);
            break;
        case 'english':
            showEnglishGame(content);
            break;
    }
    
    playSound('win');
}

function showDinoGame(content) {
    content.innerHTML = `
        <h2 style="color: var(--accent-green); text-align: center; margin-bottom: 2rem;">
            🦖 Juego del Dinosaurio
        </h2>
        <div style="text-align: center;">
            <canvas id="dino-canvas" width="400" height="150" 
                style="border: 3px solid var(--secondary-yellow); border-radius: 15px; background: linear-gradient(135deg, #87CEEB, #98FB98);"></canvas>
            <div style="margin: 1rem 0; font-size: 1.2rem; font-weight: bold;">
                Puntaje: <span id="dino-score" style="color: var(--accent-green);">0</span>
            </div>
            <button onclick="dinoJump()" style="margin: 0.5rem; padding: 1rem 2rem; background: var(--primary-purple); color: white; border: none; border-radius: 10px; cursor: pointer;">
                <i class="fas fa-arrow-up"></i> Saltar (Espacio)
            </button>
            <button onclick="closeModal()" style="margin: 0.5rem; padding: 1rem 2rem; background: var(--accent-pink); color: white; border: none; border-radius: 10px; cursor: pointer;">
                <i class="fas fa-times"></i> Salir
            </button>
        </div>
    `;
    
    startDinoGame();
}

// Variables globales del juego
let currentDino = null;
let dinoKeyHandler = null;

function startDinoGame() {
    const canvas = document.getElementById('dino-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    currentDino = { x: 50, y: 120, vy: 0, width: 20, height: 20, jumping: false };
    let obstacles = [];
    let score = 0;
    let gameSpeed = 3;
    
    // Función para hacer saltar al dino
    const jumpDino = () => {
        if (!currentDino.jumping && currentDino.y >= 120) {
            currentDino.vy = -12;
            currentDino.jumping = true;
        }
    };
    
    // Asignar función global
    window.dinoJump = jumpDino;
    
    // Crear handler de teclado
    dinoKeyHandler = function(e) {
        if (e.code === 'Space' || e.key === ' ') {
            e.preventDefault();
            jumpDino();
        }
    };
    
    // Agregar listener de teclado
    document.addEventListener('keydown', dinoKeyHandler);
    
    function gameLoop() {
        // Limpiar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar suelo
        ctx.fillStyle = '#475569';
        ctx.fillRect(0, 140, canvas.width, 10);
        
        // Actualizar dino
        if (currentDino.jumping) {
            currentDino.vy += 0.8;
            currentDino.y += currentDino.vy;
            
            if (currentDino.y >= 120) {
                currentDino.y = 120;
                currentDino.vy = 0;
                currentDino.jumping = false;
            }
        }
        
        // Dibujar dino
        ctx.fillStyle = '#10b981';
        ctx.fillRect(currentDino.x, currentDino.y, currentDino.width, currentDino.height);
        
        // Agregar obstáculos
        if (Math.random() < 0.02) {
            obstacles.push({ x: canvas.width, y: 125, width: 15, height: 15 });
        }
        
        // Actualizar y dibujar obstáculos
        ctx.fillStyle = '#ef4444';
        for (let i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].x -= gameSpeed;
            ctx.fillRect(obstacles[i].x, obstacles[i].y, obstacles[i].width, obstacles[i].height);
            
            // Remover obstáculos fuera de pantalla
            if (obstacles[i].x + obstacles[i].width < 0) {
                obstacles.splice(i, 1);
                score++;
                const scoreElement = document.getElementById('dino-score');
                if (scoreElement) scoreElement.textContent = score;
                
                // Aumentar velocidad cada 10 puntos
                if (score % 10 === 0) gameSpeed += 0.5;
            }
            
            // Verificar colisión
            if (obstacles[i] && 
                currentDino.x < obstacles[i].x + obstacles[i].width &&
                currentDino.x + currentDino.width > obstacles[i].x &&
                currentDino.y < obstacles[i].y + obstacles[i].height &&
                currentDino.y + currentDino.height > obstacles[i].y) {
                
                // Game over
                ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = 'white';
                ctx.font = 'bold 24px Inter';
                ctx.textAlign = 'center';
                ctx.fillText('¡Game Over!', canvas.width/2, canvas.height/2);
                ctx.font = '16px Inter';
                ctx.fillText(`Puntaje Final: ${score}`, canvas.width/2, canvas.height/2 + 30);
                
                // Detener juego
                clearInterval(dinoGameInterval);
                document.removeEventListener('keydown', dinoKeyHandler);
                playSound('win');
                celebrateResponse();
                return;
            }
        }
    }
    
    dinoGameInterval = setInterval(gameLoop, 20);
}

// Esta función se define dinámicamente en startDinoGame

function showMemoryGame(content) {
    const emojis = ['🦄', '🚀', '🎨', '🐻', '🌈', '📚'];
    const gameEmojis = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    
    content.innerHTML = `
        <h2 style="color: var(--accent-blue); text-align: center; margin-bottom: 2rem;">
            🧠 Juego de Memoria
        </h2>
        <div id="memory-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 2rem;">
            ${gameEmojis.map((emoji, index) => 
                `<button class="memory-card" data-emoji="${emoji}" data-index="${index}" onclick="flipMemoryCard(${index})" 
                 style="width: 60px; height: 60px; background: var(--primary-purple); color: white; border: none; border-radius: 10px; font-size: 1.5rem; cursor: pointer;">
                    ❓
                </button>`
            ).join('')}
        </div>
        <div style="text-align: center; margin-bottom: 1rem;">
            <span style="font-size: 1.2rem; font-weight: bold;">
                Movimientos: <span id="memory-moves" style="color: var(--accent-blue);">0</span> | 
                Parejas: <span id="memory-pairs" style="color: var(--accent-green);">0</span>/6
            </span>
        </div>
        <div style="text-align: center;">
            <button onclick="closeModal()" style="padding: 1rem 2rem; background: var(--accent-pink); color: white; border: none; border-radius: 10px; cursor: pointer;">
                <i class="fas fa-times"></i> Salir
            </button>
        </div>
    `;
    
    initializeMemoryGame(gameEmojis);
}

function initializeMemoryGame(emojis) {
    let flippedCards = [];
    let moves = 0;
    let pairs = 0;
    let canFlip = true;
    
    window.flipMemoryCard = function(index) {
        if (!canFlip || flippedCards.includes(index)) return;
        
        const card = document.querySelector(`[data-index="${index}"]`);
        const emoji = card.dataset.emoji;
        
        card.textContent = emoji;
        card.style.background = 'var(--secondary-yellow)';
        flippedCards.push(index);
        
        if (flippedCards.length === 2) {
            canFlip = false;
            moves++;
            document.getElementById('memory-moves').textContent = moves;
            
            const [first, second] = flippedCards;
            const firstEmoji = document.querySelector(`[data-index="${first}"]`).dataset.emoji;
            const secondEmoji = document.querySelector(`[data-index="${second}"]`).dataset.emoji;
            
            setTimeout(() => {
                if (firstEmoji === secondEmoji) {
                    // Match encontrado
                    pairs++;
                    document.getElementById('memory-pairs').textContent = pairs;
                    
                    document.querySelector(`[data-index="${first}"]`).style.background = 'var(--accent-green)';
                    document.querySelector(`[data-index="${second}"]`).style.background = 'var(--accent-green)';
                    
                    if (pairs === 6) {
                        setTimeout(() => {
                            alert('🎉 ¡Felicidades! Completaste el juego');
                            celebrateResponse();
                        }, 500);
                    }
                } else {
                    // No match
                    document.querySelector(`[data-index="${first}"]`).textContent = '❓';
                    document.querySelector(`[data-index="${second}"]`).textContent = '❓';
                    document.querySelector(`[data-index="${first}"]`).style.background = 'var(--primary-purple)';
                    document.querySelector(`[data-index="${second}"]`).style.background = 'var(--primary-purple)';
                }
                
                flippedCards = [];
                canFlip = true;
            }, 1000);
        }
    };
}

function showEnglishGame(content) {
    const words = [
        { es: 'gato', en: 'cat', emoji: '🐱' },
        { es: 'perro', en: 'dog', emoji: '🐕' },
        { es: 'libro', en: 'book', emoji: '📚' },
        { es: 'sol', en: 'sun', emoji: '☀️' },
        { es: 'casa', en: 'house', emoji: '🏠' },
        { es: 'árbol', en: 'tree', emoji: '🌳' }
    ];
    
    const currentWord = words[Math.floor(Math.random() * words.length)];
    const options = [currentWord.en];
    
    // Agregar 3 opciones incorrectas
    while (options.length < 4) {
        const randomWord = words[Math.floor(Math.random() * words.length)];
        if (!options.includes(randomWord.en)) {
            options.push(randomWord.en);
        }
    }
    
    options.sort(() => Math.random() - 0.5);
    
    content.innerHTML = `
        <h2 style="color: var(--accent-orange); text-align: center; margin-bottom: 2rem;">
            🇬🇧 Aprende Inglés
        </h2>
        <div style="text-align: center; margin-bottom: 2rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">${currentWord.emoji}</div>
            <h3 style="color: var(--primary-purple); margin-bottom: 2rem;">
                ¿Cómo se dice "${currentWord.es}" en inglés?
            </h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 2rem;">
                ${options.map(option => 
                    `<button class="english-option" onclick="checkEnglishAnswer('${option}', '${currentWord.en}')" 
                     style="padding: 1rem; font-size: 1.2rem; font-weight: bold; border: 3px solid var(--secondary-yellow); border-radius: 15px; background: white; cursor: pointer; transition: all 0.3s;">
                        ${option}
                    </button>`
                ).join('')}
            </div>
            <div id="english-result" style="font-size: 1.3rem; font-weight: bold; min-height: 2rem;"></div>
        </div>
        <div style="text-align: center;">
            <button onclick="closeModal()" style="padding: 1rem 2rem; background: var(--accent-pink); color: white; border: none; border-radius: 10px; cursor: pointer;">
                <i class="fas fa-times"></i> Salir
            </button>
        </div>
    `;
}

window.checkEnglishAnswer = function(selected, correct) {
    const resultDiv = document.getElementById('english-result');
    const buttons = document.querySelectorAll('.english-option');
    
    buttons.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent.trim() === correct) {
            btn.style.background = 'var(--accent-green)';
            btn.style.color = 'white';
        } else if (btn.textContent.trim() === selected && selected !== correct) {
            btn.style.background = 'var(--accent-pink)';
            btn.style.color = 'white';
        }
    });
    
    if (selected === correct) {
        resultDiv.innerHTML = '🎉 ¡Correcto! ¡Excelente trabajo!';
        resultDiv.style.color = 'var(--accent-green)';
        playSound('win');
        celebrateResponse();
    } else {
        resultDiv.innerHTML = `❌ Incorrecto. La respuesta correcta es: <strong>${correct}</strong>`;
        resultDiv.style.color = 'var(--accent-pink)';
    }
};

function closeModal() {
    document.getElementById('minigame-modal').style.display = 'none';
    if (dinoGameInterval) {
        clearInterval(dinoGameInterval);
        dinoGameInterval = null;
    }
    if (dinoKeyHandler) {
        document.removeEventListener('keydown', dinoKeyHandler);
        dinoKeyHandler = null;
    }
    currentDino = null;
}

// ===== FUNCIONES AUXILIARES =====
function playSound(type) {
    const audio = document.getElementById(`snd-${type}`);
    if (audio) {
        audio.volume = 0.5;
        audio.currentTime = 0;
        audio.play().catch(e => console.log('Audio error:', e));
    }
}

function getRandomEmojis() {
    const emojis = ["🌟", "🚀", "🎉", "💡", "🦄", "✨", "🤩", "🎨", "📚", "🧠", "💝", "🌈", "🎪", "🎭"];
    return emojis.sort(() => 0.5 - Math.random()).slice(0, 2).join(" ");
}

function showRandomJoke() {
    const joke = teacherJokes[Math.floor(Math.random() * teacherJokes.length)];
    document.getElementById('teacher-emojis').innerHTML = `
        <i class="fas fa-smile"></i> ${joke}
    `;
}

function setRandomTip() {
    const tip = tips[Math.floor(Math.random() * tips.length)];
    document.getElementById('footer-tip').textContent = tip;
}

function celebrateResponse() {
    if (typeof confetti !== 'undefined') {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
}

// ===== MANEJO DE ERRORES =====
window.addEventListener('error', function(e) {
    console.error('Error global:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Promise rechazada:', e.reason);
});

// ===== FUNCIONES ADICIONALES =====

// Contador de palabras para estadísticas
function updateStats() {
    const totalQuestions = chatHistory.length;
    const totalWords = chatHistory.reduce((acc, item) => {
        return acc + item.question.split(' ').length + item.answer.split(' ').length;
    }, 0);
    
    // Mostrar estadísticas en el footer si hay conversaciones
    if (totalQuestions > 0) {
        const footerTip = document.getElementById('footer-tip');
        footerTip.textContent = `📊 ${totalQuestions} preguntas | ${totalWords} palabras intercambiadas`;
    }
}

// ===== SISTEMA DE LOGROS =====
function initAchievements() {
    renderAchievements();
    updateProgress();
}

function renderAchievements() {
    const grid = document.getElementById('achievements-grid');
    if (!grid) return;
    
    grid.innerHTML = achievementsData.map(achievement => {
        const isUnlocked = achievements.includes(achievement.id);
        return `
            <div class="achievement-item ${isUnlocked ? 'unlocked' : 'locked'}" 
                 onclick="showAchievementDetails('${achievement.id}')">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
            </div>
        `;
    }).join('');
}

function updateProgress() {
    const progressBar = document.getElementById('student-progress');
    const progressText = document.getElementById('progress-text');
    
    if (!progressBar || !progressText) return;
    
    const totalAchievements = achievementsData.length;
    const unlockedCount = achievements.length;
    const progressPercent = (unlockedCount / totalAchievements) * 100;
    
    progressBar.style.width = `${progressPercent}%`;
    progressText.textContent = `${unlockedCount}/${totalAchievements} logros desbloqueados - ¡${progressPercent.toFixed(0)}% completado!`;
}

function checkAchievements(question = '') {
    const newAchievements = [];
    
    achievementsData.forEach(achievement => {
        if (achievements.includes(achievement.id)) return;
        
        let shouldUnlock = false;
        
        switch (achievement.requirement.type) {
            case 'questions':
                shouldUnlock = studentStats.questions >= achievement.requirement.count;
                break;
            case 'games':
                shouldUnlock = studentStats.games >= achievement.requirement.count;
                break;
            case 'voice':
                shouldUnlock = studentStats.voice >= achievement.requirement.count;
                break;
            case 'keyword':
                shouldUnlock = question.toLowerCase().includes(achievement.requirement.keyword);
                if (shouldUnlock) {
                    studentStats.keywords.push(achievement.requirement.keyword);
                }
                break;
        }
        
        if (shouldUnlock) {
            newAchievements.push(achievement);
            achievements.push(achievement.id);
        }
    });
    
    // Guardar progreso
    localStorage.setItem('achievements', JSON.stringify(achievements));
    localStorage.setItem('studentStats', JSON.stringify(studentStats));
    
    // Mostrar notificaciones
    newAchievements.forEach((achievement, index) => {
        setTimeout(() => showAchievementNotification(achievement), index * 1000);
    });
    
    if (newAchievements.length > 0) {
        renderAchievements();
        updateProgress();
    }
}

function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-title">${achievement.icon} ¡Logro Desbloqueado!</div>
        <div class="achievement-message">${achievement.name}</div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 500);
    }, 3000);
    
    playSound('win');
    celebrateResponse();
}

function showAchievementDetails(achievementId) {
    const achievement = achievementsData.find(a => a.id === achievementId);
    if (!achievement) return;
    
    const isUnlocked = achievements.includes(achievementId);
    const message = isUnlocked 
        ? `¡Has desbloqueado este logro! ${achievement.icon}`
        : `Logro bloqueado: ${achievement.description}`;
    
    alert(`${achievement.name}\n\n${message}`);
}

function updateStudentStats(type, question = '') {
    if (currentMode !== 'estudiante') return;
    
    switch (type) {
        case 'question':
            studentStats.questions++;
            checkAchievements(question);
            break;
        case 'game':
            studentStats.games++;
            checkAchievements();
            break;
        case 'voice':
            studentStats.voice++;
            checkAchievements();
            break;
    }
}

// ===== MODO OFFLINE =====
function getOfflineResponse(question) {
    const questionLower = question.toLowerCase();
    
    // Buscar en categorías específicas
    for (const [category, data] of Object.entries(offlineResponses)) {
        if (category === 'default') continue;
        
        if (data.keywords.some(keyword => questionLower.includes(keyword))) {
            const randomResponse = data.responses[Math.floor(Math.random() * data.responses.length)];
            return `🤖 [Modo Offline] ${randomResponse}`;
        }
    }
    
    // Respuesta por defecto
    const defaultResponse = offlineResponses.default[Math.floor(Math.random() * offlineResponses.default.length)];
    return `🤖 [Modo Offline] ${defaultResponse}`;
}

// ===== SISTEMA DE TEMAS =====
function setupThemeSelector() {
    const themeBtn = document.getElementById('theme-btn');
    const themeDropdown = document.getElementById('theme-dropdown');
    const themeOptions = document.querySelectorAll('.theme-option');
    
    // Toggle dropdown
    themeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        themeDropdown.classList.toggle('show');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        themeDropdown.classList.remove('show');
    });
    
    // Theme selection
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.dataset.theme;
            applyTheme(theme);
            themeDropdown.classList.remove('show');
        });
    });
}

function applyTheme(theme) {
    currentTheme = theme;
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('currentTheme', theme);
    
    // Actualizar indicador visual
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.style.background = option.dataset.theme === theme ? 'rgba(139, 69, 19, 0.2)' : '';
    });
    
    // Mostrar notificación de cambio de tema
    showThemeNotification(theme);
}

function showThemeNotification(theme) {
    const themeNames = {
        default: 'Clásico',
        ocean: 'Océano',
        forest: 'Bosque',
        sunset: 'Atardecer',
        space: 'Espacial'
    };
    
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-title">🎨 Tema Cambiado</div>
        <div class="achievement-message">Ahora usando: ${themeNames[theme]}</div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 500);
    }, 2000);
}

// ===== SISTEMA DE RECORDATORIOS =====
function addReminder() {
    const timeInput = document.getElementById('reminder-time');
    const messageInput = document.getElementById('reminder-message');
    
    const time = timeInput.value;
    const message = messageInput.value.trim();
    
    if (!time || !message) {
        alert('Por favor completa todos los campos');
        return;
    }
    
    const reminder = {
        id: Date.now(),
        time: time,
        message: message,
        active: true
    };
    
    reminders.push(reminder);
    localStorage.setItem('reminders', JSON.stringify(reminders));
    
    // Limpiar campos
    timeInput.value = '';
    messageInput.value = '';
    
    renderReminders();
    setupReminderAlert(reminder);
    
    // Mostrar confirmación
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-title">⏰ Recordatorio Creado</div>
        <div class="achievement-message">${time} - ${message}</div>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 500);
    }, 2000);
}

function renderReminders() {
    const list = document.getElementById('reminders-list');
    if (!list) return;
    
    list.innerHTML = reminders.map(reminder => `
        <div class="reminder-item">
            <div class="reminder-info">
                <div class="reminder-time">${reminder.time}</div>
                <div class="reminder-message">${reminder.message}</div>
            </div>
            <div class="reminder-actions">
                <button class="btn-reminder-delete" onclick="deleteReminder(${reminder.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function deleteReminder(id) {
    reminders = reminders.filter(r => r.id !== id);
    localStorage.setItem('reminders', JSON.stringify(reminders));
    renderReminders();
    
    // Cancelar intervalo si existe
    const intervalIndex = reminderIntervals.findIndex(interval => interval.id === id);
    if (intervalIndex !== -1) {
        clearTimeout(reminderIntervals[intervalIndex].timeout);
        reminderIntervals.splice(intervalIndex, 1);
    }
}

function startReminderSystem() {
    reminders.forEach(reminder => {
        setupReminderAlert(reminder);
    });
}

function setupReminderAlert(reminder) {
    const now = new Date();
    const [hours, minutes] = reminder.time.split(':');
    const reminderTime = new Date();
    reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    // Si la hora ya pasó hoy, programar para mañana
    if (reminderTime <= now) {
        reminderTime.setDate(reminderTime.getDate() + 1);
    }
    
    const timeUntilReminder = reminderTime.getTime() - now.getTime();
    
    const timeout = setTimeout(() => {
        showReminderAlert(reminder);
        // Programar para el día siguiente
        setupReminderAlert(reminder);
    }, timeUntilReminder);
    
    reminderIntervals.push({
        id: reminder.id,
        timeout: timeout
    });
}

function showReminderAlert(reminder) {
    // Crear notificación visual
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.style.background = 'linear-gradient(135deg, #FF6347, #FFD700)';
    notification.innerHTML = `
        <div class="achievement-title">🔔 ¡Recordatorio!</div>
        <div class="achievement-message">${reminder.message}</div>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Mantener visible por más tiempo
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 500);
    }, 5000);
    
    // Sonido
    playSound('win');
    
    // Notificación del navegador si está disponible
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🤖 AI Asistente - Recordatorio', {
            body: reminder.message,
            icon: '/favicon.ico'
        });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification('🤖 AI Asistente - Recordatorio', {
                    body: reminder.message,
                    icon: '/favicon.ico'
                });
            }
        });
    }
}

// ===== ANÁLISIS DE PROGRESO =====
function setupAnalytics() {
    const tabs = document.querySelectorAll('.analytics-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            updateChart(tab.dataset.tab);
        });
    });
    
    // Inicializar gráfico
    initChart();
    updateChart('daily');
}

function initChart() {
    const ctx = document.getElementById('progress-chart');
    if (!ctx) return;
    
    progressChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Actividad',
                data: [],
                backgroundColor: 'rgba(139, 69, 19, 0.6)',
                borderColor: 'rgba(139, 69, 19, 1)',
                borderWidth: 2,
                borderRadius: 10,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function updateChart(type) {
    if (!progressChart) return;
    
    let labels = [];
    let data = [];
    let title = '';
    
    switch (type) {
        case 'daily':
            const last7Days = getLast7Days();
            labels = last7Days.map(date => {
                const d = new Date(date);
                return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
            });
            data = last7Days.map(date => analyticsData.daily[date] || 0);
            title = 'Preguntas por día (última semana)';
            break;
            
        case 'weekly':
            const last4Weeks = getLast4Weeks();
            labels = last4Weeks.map((week, index) => `Semana ${index + 1}`);
            data = last4Weeks.map(week => {
                return week.reduce((sum, date) => sum + (analyticsData.daily[date] || 0), 0);
            });
            title = 'Preguntas por semana (último mes)';
            break;
            
        case 'topics':
            const topicsCount = Object.entries(analyticsData.topics || {})
                .sort(([,a], [,b]) => b - a)
                .slice(0, 6);
            labels = topicsCount.map(([topic]) => topic);
            data = topicsCount.map(([,count]) => count);
            title = 'Temas más consultados';
            break;
    }
    
    progressChart.data.labels = labels;
    progressChart.data.datasets[0].data = data;
    progressChart.options.plugins.title = {
        display: true,
        text: title,
        font: { size: 16, weight: 'bold' }
    };
    
    progressChart.update();
    updateStatsSummary(type);
}

function updateStatsSummary(type) {
    const summary = document.getElementById('stats-summary');
    if (!summary) return;
    
    const totalQuestions = chatHistory.length;
    const totalAchievements = achievements.length;
    const avgPerDay = totalQuestions > 0 ? (totalQuestions / 7).toFixed(1) : 0;
    const mostActiveDay = getMostActiveDay();
    
    summary.innerHTML = `
        <div class="stat-item">
            <div class="stat-number">${totalQuestions}</div>
            <div class="stat-label">Total Preguntas</div>
        </div>
        <div class="stat-item">
            <div class="stat-number">${totalAchievements}</div>
            <div class="stat-label">Logros Desbloqueados</div>
        </div>
        <div class="stat-item">
            <div class="stat-number">${avgPerDay}</div>
            <div class="stat-label">Promedio Diario</div>
        </div>
        <div class="stat-item">
            <div class="stat-number">${mostActiveDay}</div>
            <div class="stat-label">Día Más Activo</div>
        </div>
    `;
}

function updateAnalyticsData(question) {
    const today = new Date().toISOString().split('T')[0];
    
    // Actualizar datos diarios
    analyticsData.daily[today] = (analyticsData.daily[today] || 0) + 1;
    
    // Actualizar temas (palabras clave simples)
    const words = question.toLowerCase().split(' ');
    const topics = ['matemáticas', 'colores', 'animales', 'emociones', 'juegos', 'música', 'arte', 'ciencia'];
    
    topics.forEach(topic => {
        if (words.some(word => word.includes(topic.slice(0, 5)))) {
            analyticsData.topics[topic] = (analyticsData.topics[topic] || 0) + 1;
        }
    });
    
    // Guardar datos
    localStorage.setItem('analyticsData', JSON.stringify(analyticsData));
    
    // Actualizar gráfico si está visible
    if (currentMode === 'docente' && progressChart) {
        const activeTab = document.querySelector('.analytics-tab.active');
        if (activeTab) {
            updateChart(activeTab.dataset.tab);
        }
    }
}

function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toISOString().split('T')[0]);
    }
    return days;
}

function getLast4Weeks() {
    const weeks = [];
    for (let i = 3; i >= 0; i--) {
        const week = [];
        for (let j = 6; j >= 0; j--) {
            const date = new Date();
            date.setDate(date.getDate() - (i * 7) - j);
            week.push(date.toISOString().split('T')[0]);
        }
        weeks.push(week);
    }
    return weeks;
}

function getMostActiveDay() {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const dayCount = {};
    
    Object.keys(analyticsData.daily).forEach(dateStr => {
        const dayOfWeek = new Date(dateStr).getDay();
        const dayName = days[dayOfWeek];
        dayCount[dayName] = (dayCount[dayName] || 0) + analyticsData.daily[dateStr];
    });
    
    const mostActive = Object.entries(dayCount).sort(([,a], [,b]) => b - a)[0];
    return mostActive ? mostActive[0] : 'N/A';
}

// Auto-scroll suave para nuevas respuestas
function smoothScrollToBottom(element) {
    if (element) {
        element.scrollTo({
            top: element.scrollHeight,
            behavior: 'smooth'
        });
    }
}

// Efecto de escribiendo (typing) para las respuestas de IA
function typeWriter(text, element, speed = 50) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Detección de inactividad para mostrar sugerencias
let inactivityTimer;
function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        if (chatHistory.length === 0) {
            const suggestions = currentMode === 'docente' ? sugeridasDocente : sugeridasEstudiante;
            const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
            
            // Pulsar sugerencia aleatoria
            const suggestionBtns = document.querySelectorAll('.suggestion-btn');
            suggestionBtns.forEach(btn => {
                if (btn.textContent.includes(randomSuggestion.substring(0, 20))) {
                    btn.style.animation = 'pulse 1s ease-in-out 3';
                }
            });
        }
    }, 30000); // 30 segundos de inactividad
}

// Eventos de actividad del usuario
document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);
document.addEventListener('click', resetInactivityTimer);

// Mejorar la función de renderHistory con estadísticas
const originalRenderHistory = renderHistory;
renderHistory = function() {
    originalRenderHistory();
    updateStats();
    
    // Smooth scroll
    const chatDiv = document.getElementById('chat-history');
    setTimeout(() => smoothScrollToBottom(chatDiv), 100);
};

console.log('🚀 AI Asistente Educativo cargado completamente');
