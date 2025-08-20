// ===== AI ASISTENTE EDUCATIVO - ESP32 PROJECT =====
// Diseño mejorado manteniendo funcionalidad original

// ===== VARIABLES GLOBALES =====
let currentMode = "docente";
let currentRole = localStorage.getItem('currentRole') || null; // 'docente' | 'estudiante'
let studentName = localStorage.getItem('studentName') || '';
let chatHistory = [];

// Duplicated legacy history handlers removed to avoid conflicts; unified versions exist below.
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
let studentChart = null;
let analyticsData = {};
let selectedStudentKey = null;
let selectedStudentName = '';

// ===== CONTROL DE TASA PARA LLAMADAS A IA =====
let aiAskQueue = Promise.resolve();
let suggestionsCooldownUntil = 0;
const SUGGESTIONS_COOLDOWN_MS = 30000; // 30s de espera tras 429

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ===== DATOS DE SUGERENCIAS =====
const sugeridasDocente = [
    "¿Cómo puedo adaptar mi clase para un niño con adecuacion significativa?",
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
    
    // Cambiar modo solo si ya estaba definido un rol previamente
    if(currentRole==='estudiante') switchMode('estudiante');
    else if(currentRole==='docente') switchMode('docente');
    
    // Mostrar u ocultar modal de rol según estado
    const roleModal = document.getElementById('role-modal');
    if (roleModal) {
        if (currentRole) {
            roleModal.classList.remove('show');
            roleModal.style.display = 'none';
            showLogout();
            updateTabsVisibility();
        } else {
            roleModal.classList.add('show');
        }
    }
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
function sanitizeName(name){
    return name.trim().toLowerCase().replace(/[^a-z0-9]/gi,'_');
}
function capitalizeWords(name){
    return name
        .trim()
        .split(/\s+/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}
function getHistoryKey() {
    if(currentRole==='docente') return 'chatHistoryDocente';
    const clean = studentName?sanitizeName(studentName):'anonimo';
    return `chatHistoryEstudiante_${clean}`;
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

// Renderiza el último intercambio con efecto de escritura
function addToHistoryAnimated(question, answer, imgUrl) {
    const extraEmojis = getRandomEmojis();
    const entry = { 
        question, 
        answer: answer + " " + extraEmojis, 
        imgUrl,
        timestamp: new Date().toLocaleString()
    };
    chatHistory.push(entry);
    saveHistory(chatHistory);

    const chatDiv = document.getElementById('chat-history');
    if (!chatDiv) return;

    // Burbuja de usuario
    const userBubble = document.createElement('div');
    userBubble.className = 'bubble-user';
    userBubble.innerHTML = `<strong>👤 Tú:</strong> ${entry.question}`;
    chatDiv.appendChild(userBubble);

    // Burbuja de IA con target para tipeo
    const aiBubble = document.createElement('div');
    aiBubble.className = 'bubble-ia';
    aiBubble.innerHTML = `
        <strong>🤖 IA:</strong> <span class="typing-target"></span>
        <small style="opacity: 0.7; font-size: 0.8em; display: block; margin-top: 0.5rem;">📅 ${entry.timestamp}</small>
    `;
    chatDiv.appendChild(aiBubble);

    const target = aiBubble.querySelector('.typing-target');
    // Efecto de tipeo y scroll
    typeWriter(entry.answer, target, 1, () => {
        if (entry.imgUrl) {
            const img = document.createElement('img');
            img.src = entry.imgUrl;
            img.alt = 'Imagen relacionada';
            img.loading = 'lazy';
            aiBubble.appendChild(img);
        }
        updateVoiceControls(true);
        smoothScrollToBottom(chatDiv);
    });

    // Scroll inicial
    smoothScrollToBottom(chatDiv);
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
    // Selector de tema (sidebar Docente) 
    const themeSelect = document.getElementById('sidebar-theme-select'); 
    if (themeSelect) { themeSelect.value = currentTheme; // Sincroniza el valor al cargar 
    themeSelect.addEventListener('change', (e) => {
        applyTheme(e.target.value); // Aplica el tema seleccionado 
        playSound('clic'); }); }
    
    // Botón parar respuesta
    const stopBtn = document.getElementById('stop-typing-btn');
    if (stopBtn) {
        stopBtn.addEventListener('click', stopTyping);
    }

    // Modal de selección de rol
    const btnRoleDoc = document.getElementById('btn-role-docente');
    const btnRoleEst = document.getElementById('btn-role-estudiante');
    if (btnRoleDoc) btnRoleDoc.addEventListener('click', () => showRoleStep('docente'));
    if (btnRoleEst) btnRoleEst.addEventListener('click', () => showRoleStep('estudiante'));

    const btnDocLogin = document.getElementById('btn-docente-login');
    if (btnDocLogin) btnDocLogin.addEventListener('click', () => {
        const email = (document.getElementById('docente-email') || {}).value || '';
        if (!email) { alert('Ingresa tu correo.'); return; }
        localStorage.setItem('teacherEmail', email.trim().toLowerCase());
        localStorage.setItem('currentRole', 'docente');
        currentRole = 'docente';
        currentMode = 'docente';
        hideRoleModal();
        showLogout();
        updateTabsVisibility();
        switchMode('docente');
    });

    const btnStuStart = document.getElementById('btn-student-start');
    if (btnStuStart) btnStuStart.addEventListener('click', () => {
        const name = (document.getElementById('student-name-input') || {}).value || '';
        if (!name.trim()) { alert('Ingresa tu nombre.'); return; }
        localStorage.setItem('studentName', capitalizeWords(name.trim()));
        localStorage.setItem('currentRole', 'estudiante');
        studentName = capitalizeWords(name.trim());
        currentRole = 'estudiante';
        currentMode = 'estudiante';
        hideRoleModal();
        showLogout();
        updateTabsVisibility();
        switchMode('estudiante');
    });
}


// ===== UTILIDADES VISIBILIDAD SEGÚN ROL =====
function updateTabsVisibility(){
    // Oculta botones de modo que no correspondan al rol
    document.getElementById('tab-docente').style.display = (currentRole==='docente') ? 'flex':'none';
    document.getElementById('tab-estudiante').style.display = (currentRole==='estudiante') ? 'flex':'none';
}

function renderStudents(){
    const container=document.getElementById('students-list');
    if(!container) return;
    const keys=Object.keys(localStorage).filter(k=>k.startsWith('chatHistoryEstudiante_'));
    if(keys.length===0){container.innerHTML='<p>No hay estudiantes registrados.</p>';return;}
    container.innerHTML=keys.map(k=>{
        const name=k.replace('chatHistoryEstudiante_','').replace(/_/g,' ');
        const displayName = capitalizeWords(name);
        return `<button class="suggestion-btn" data-student="${displayName}">${displayName}</button>`;
    }).join('');
    container.querySelectorAll('button').forEach(btn=>{
        btn.addEventListener('click',()=>{
            const sel=btn.getAttribute('data-student');
            const key=`chatHistoryEstudiante_${sel.replace(/\s+/g,'_').toLowerCase()}`;
            selectedStudentKey = key;
            selectedStudentName = sel;
            // Cargar historial SOLO para análisis, sin tocar el chat activo del docente
            const sHistory = JSON.parse(localStorage.getItem(key)||'[]');
            renderStudentAnalysisByHistory(sHistory, sel);
        });
    });
}

// ===== CAMBIO DE MODO =====
function switchMode(mode) {
    
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

    // Si el docente, actualizar lista de estudiantes
    if(currentRole==='docente') renderStudents();
    updateTabsVisibility();
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

// ===== SUGERENCIAS DINÁMICAS RELACIONADAS =====
function renderSuggestionButtons(containerId, suggestions) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = suggestions.slice(0, 6).map(s =>
        `<button class="suggestion-btn" onclick="setQuestion('${String(s).replace(/'/g, '')}')">${s}</button>`
    ).join('');
}

async function updateRelatedSuggestions(lastQuestion) {
    const containerId = currentMode === 'docente' ? 'suggestions-docente' : 'suggestions-estudiante';
    const container = document.getElementById(containerId);
    if (!container || !lastQuestion) return;

    // Cooldown activo => usar fallback para evitar 429
    if (Date.now() < suggestionsCooldownUntil) {
        renderSuggestionButtons(containerId, buildFallbackSuggestions(lastQuestion, currentMode));
        return;
    }

    // Placeholder de actualización
    container.innerHTML = '<div style="text-align:center;color: var(--dark-gray);">Actualizando sugerencias...</div>';

    let suggestions = [];
    try {
        suggestions = await getRelatedQuestionsAI(lastQuestion, currentMode);
    } catch (e) {
        console.warn('No se pudo obtener sugerencias con IA:', e);
        if (e && e.rateLimit) {
            suggestionsCooldownUntil = Date.now() + SUGGESTIONS_COOLDOWN_MS;
        }
    }

    if (!suggestions || suggestions.length === 0 || suggestions.length < 3) {
        suggestions = buildFallbackSuggestions(lastQuestion, currentMode);
    }

    renderSuggestionButtons(containerId, suggestions);
}

async function getRelatedQuestionsAI(question, mode) {
    const roleText = mode === 'docente' ? 'docente de educación inclusiva' : 'estudiante de primaria';
    const prompt = `Eres un ${roleText}. Dada la pregunta del usuario: "${question}", genera exactamente 6 temas o preguntas de seguimiento relacionadas, útiles y en español. Devuelve ÚNICAMENTE un JSON válido con el siguiente formato: ["tema 1", "pregunta 2", "tema 3", ...]. No incluyas texto adicional, explicaciones, ni la pregunta original. Asegúrate de que el JSON sea sintácticamente correcto.`;    const text = await askAIServer(prompt);
    return tryParseSuggestions(text, { topic: question, mode });
}

async function askAIServer(prompt) {
    // Encolar para que solo haya una llamada a la vez
    return aiAskQueue = aiAskQueue.then(async () => {
        // Reintentos con backoff ante 429/errores transitorios
        let attempt = 0;
        let lastErr = null;
        while (attempt < 3) {
            attempt++;
            try {
                const res = await fetch('/ask', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ question: prompt })
                });
                if (!res.ok) {
                    // 429 Too Many Requests
                    if (res.status === 429) {
                        const wait = 1000 * Math.pow(2, attempt - 1);
                        await sleep(wait);
                        const e = new Error('Rate limit /ask');
                        e.rateLimit = true;
                        lastErr = e;
                        continue; // retry
                    }
                    // Otros errores: intentar leer texto para log
                    const txt = await res.text().catch(() => '');
                    throw new Error(`Error /ask ${res.status}: ${txt.slice(0,200)}`);
                }

                let data;
                try {
                    data = await res.json();
                } catch (e) {
                    // Puede haber HTML de error pese a 200
                    const txt = await res.text().catch(() => '');
                    throw new Error(`Respuesta no JSON en /ask: ${txt.slice(0,200)}`);
                }
                if (!data || !data.id) throw new Error('ID no recibido para sugerencias');

                // Polling a /result con manejo de 429
                for (let i = 0; i < 20; i++) {
                    await sleep(1000);
                    const r2 = await fetch(`/result?id=${data.id}`);
                    if (r2.status === 429) {
                        // backoff ligero y continuar
                        await sleep(500);
                        continue;
                    }
                    if (!r2.ok) {
                        const txt2 = await r2.text().catch(() => '');
                        throw new Error(`Error /result ${r2.status}: ${txt2.slice(0,200)}`);
                    }
                    let d2;
                    try { d2 = await r2.json(); } catch (e) { d2 = null; }
                    if (d2 && d2.response !== null && d2.response !== undefined) {
                        return d2.response;
                    }
                }
                throw new Error('Timeout al obtener sugerencias');
            } catch (err) {
                lastErr = err;
                // Si 429, activar cooldown y seguir backoff
                if (err && (err.rateLimit || String(err.message||'').includes('429'))) {
                    suggestionsCooldownUntil = Date.now() + SUGGESTIONS_COOLDOWN_MS;
                    const wait = 1000 * Math.pow(2, attempt - 1);
                    await sleep(wait);
                    continue;
                }
                // Errores no recuperables
                break;
            }
        }
        if (lastErr) throw lastErr;
        throw new Error('Fallo desconocido al obtener sugerencias');
    });
}

function tryParseSuggestions(text, { topic = '', mode = 'docente' } = {}) {
    if (!text) return [];

    const ensureQuestion = (s) => {
        let q = String(s).trim();
        // descartar si es numérico o código de error simple
        if (/^[-+]?\d+$/.test(q)) return '';
        if (/\berror\b|\bcódigo\b|\bcode\b|\b429\b|\b-?11\b/i.test(q)) return '';
        // limpiar comillas externas
        q = q.replace(/^"|"$/g, '');
        // asegurar signo de interrogación al final
        if (!q.endsWith('?')) q = q + '?';
        // asegurar apertura de interrogación al inicio si falta
        if (!/^¿/.test(q)) q = '¿' + q;
        // capitalizar primera letra significativa
        q = q.replace(/^(¿)(\s*)([a-záéíóúñ])/i, (m, p1, p2, p3) => p1 + p2 + p3.toUpperCase());
        // rechazar preguntas muy cortas
        if (q.length < 10) return '';
        return q;
    };

    const sanitizeList = (arr) => {
        const out = [];
        arr.forEach(s => {
            const q = ensureQuestion(s);
            if (q && !out.includes(q)) out.push(q);
        });
        return out.slice(0, 6);
    };

    // Intento 1: JSON directo
    try {
        const arr = JSON.parse(text);
        if (Array.isArray(arr)) return sanitizeList(arr);
    } catch (e) {}

    // Intento 2: extraer el primer arreglo JSON del texto
    const match = String(text).match(/\[[\s\S]*\]/);
    if (match) {
        try {
            const arr = JSON.parse(match[0]);
            if (Array.isArray(arr)) return sanitizeList(arr);
        } catch (e) {}
    }

    // Intento 3: parsear líneas con numeración o viñetas
    const lines = String(text)
        .split(/\r?\n|•|\u2022|;|\s{2,}|\t|\|/)
        .map(l => l.replace(/^\s*\d+\.|^\s*[\-•]\s*/, '').trim())
        .filter(Boolean);

    let uniq = sanitizeList(lines);

    // Si aún es insuficiente, construir en base al tópico
    if (uniq.length < 3) {
        const base = buildFallbackSuggestions(topic, mode);
        // combinar sin duplicados y recortar a 6
        const combined = sanitizeList([...uniq, ...base]);
        return combined.length ? combined : base;
    }

    return uniq;
}

function buildFallbackSuggestions(q, mode) {
    const topic = (q || '').split(/[?!\.]/)[0].trim();
    return mode === 'docente' ? [
        `¿Qué estrategias inclusivas aplicar para ${topic}?`,
        `¿Cómo evaluar el progreso en ${topic}?`,
        `¿Materiales accesibles para ${topic}?`,
        `¿Adaptaciones para estudiantes con NEE en ${topic}?`,
        `¿Actividades prácticas para ${topic}?`,
        `¿Cómo integrar a la familia en ${topic}?`
    ] : [
        `¿Puedes darme un ejemplo sobre ${topic}?`,
        `¿Por qué es importante ${topic}?`,
        `¿Cómo puedo practicar ${topic} de forma divertida?`,
        `¿Qué curiosidad hay sobre ${topic}?`,
        `¿En qué me ayuda saber de ${topic}?`,
        `¿Qué palabras nuevas puedo aprender sobre ${topic}?`
    ];
}

function setQuestion(q) {
    document.getElementById('question').value = q.replace(/'/g, '');
    document.getElementById('question').focus();
    playSound('clic');
}

// ===== RECONOCIMIENTO DE VOZ =====
function setupSpeechRecognition() {
    // Eliminado reconocimiento de voz
    const vb = document.getElementById('voice-btn');
    if (vb) vb.remove();
    speechRecognition = null;
}

function startVoiceRecognition() {
    // Eliminado reconocimiento de voz
    return;
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
        
        if (!response.ok) {
            if (response.status === 429) {
                // Cooldown y fallback offline para no romper la UI
                suggestionsCooldownUntil = Date.now() + SUGGESTIONS_COOLDOWN_MS;
                const offlineResponse = getOfflineResponse(question);
                if (offlineResponse) {
                    setTimeout(() => {
                        addToHistoryAnimated(question, offlineResponse, '');
                        hideLoadingResponse();
                        playSound('respuesta');
                        updateStudentStats('question', question);
                        if (currentMode === 'estudiante') { celebrateResponse(); }
                        updateRelatedSuggestions(question);
                    }, 800);
                } else {
                    showErrorResponse('Servidor ocupado (429). Intenta de nuevo en unos segundos.');
                }
                return false;
            } else {
                const txt = await response.text().catch(() => '');
                console.warn('Error /ask:', response.status, txt.slice(0,200));
                showErrorResponse('No se pudo enviar la pregunta.');
                return false;
            }
        }
        
        let data;
        try {
            data = await response.json();
        } catch (e) {
            const txt = await response.text().catch(() => '');
            console.warn('Respuesta no JSON de /ask:', txt.slice(0,200));
            showErrorResponse('Respuesta inválida del servidor.');
            return false;
        }
        
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
                addToHistoryAnimated(question, offlineResponse, '');
                hideLoadingResponse();
                playSound('respuesta');
                updateStudentStats('question', question);
                
                if (currentMode === 'estudiante') {
                    celebrateResponse();
                }
                
                // Actualizar sugerencias relacionadas
                updateRelatedSuggestions(question);
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
            // Manejo de 429 durante polling: esperar al siguiente tick
            if (response.status === 429) {
                return;
            }
            if (!response.ok) {
                const txt = await response.text().catch(() => '');
                console.warn('Error /result:', response.status, txt.slice(0,200));
                return;
            }
            let data;
            try {
                data = await response.json();
            } catch (e) {
                return;
            }
            
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
                
                const finalAnswer = normalizeAIResponse(data.response, question);
                addToHistoryAnimated(question, finalAnswer, imgUrl);
                hideLoadingResponse();
                playSound('respuesta');
                
                // Actualizar estadísticas y logros
                updateStudentStats('question', question);
                updateAnalyticsData(question);
                
                // Celebrar para estudiantes
                if (currentMode === 'estudiante') {
                    celebrateResponse();
                }
                
                // Actualizar sugerencias relacionadas con IA
                updateRelatedSuggestions(question);
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

// ===== SESSION & PLAN HELPERS =====
function showLogout(){
    const btn=document.getElementById('logout-btn');
    if(btn) btn.style.display='inline-flex';
}
function logout(){
    localStorage.removeItem('currentRole');
    localStorage.removeItem('studentName');
    localStorage.removeItem('teacherEmail');
    location.reload();
}
// plan helpers
function togglePlanDone(id){
    calendarPlans=calendarPlans.map(p=>p.id===id?{...p,done:!p.done}:p);
    localStorage.setItem('calendarPlans',JSON.stringify(calendarPlans));
    renderCalendar();
}
function deletePlan(id){
    if(!confirm('¿Eliminar actividad?')) return;
    calendarPlans=calendarPlans.filter(p=>p.id!==id);
    localStorage.setItem('calendarPlans',JSON.stringify(calendarPlans));
    renderCalendar();
}
function editPlan(id){
    const plan=calendarPlans.find(p=>p.id===id);
    if(!plan) return;
    plan.title=prompt('Editar título',plan.title)||plan.title;
    plan.desc=prompt('Editar descripción',plan.desc)||plan.desc;
    localStorage.setItem('calendarPlans',JSON.stringify(calendarPlans));
    renderCalendar();
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
            <div style="background: var(--light-gray); border-left: 4px solid var(--primary-purple); padding: 1rem; margin: 0.5rem 0; border-radius: 10px; position:relative;">
                <div>
                    <strong>📅 ${new Date(plan.date).toLocaleDateString('es-ES')}</strong>
                    <h4 style="color: var(--primary-purple); margin: 0.5rem 0;">${plan.title}</h4>
                    <p style="margin: 0; color: var(--dark-gray);">${plan.desc}</p>
                </div>
                <div style="position:absolute;top:10px;right:10px;display:flex;gap:6px;">
                    <button onclick="togglePlanDone(${plan.id})" title="Marcar" style="background:var(--accent-green);color:#fff;border:none;border-radius:6px;padding:4px 6px;cursor:pointer;">✓</button>
                    <button onclick="editPlan(${plan.id})" title="Editar" style="background:var(--accent-orange);color:#fff;border:none;border-radius:6px;padding:4px 6px;cursor:pointer;">✎</button>
                    <button onclick="deletePlan(${plan.id})" title="Borrar" style="background:var(--accent-pink);color:#fff;border:none;border-radius:6px;padding:4px 6px;cursor:pointer;">✕</button>
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

// Normaliza la respuesta del servidor a texto legible y amigable
function normalizeAIResponse(raw, question = '') {
    try {
        if (raw === null || raw === undefined) {
            const fallback = getOfflineResponse(question);
            return `⚠️ No se recibió respuesta del servidor.\n\n${fallback}`;
        }
        if (typeof raw === 'number') {
            // Mapea códigos negativos a mensajes claros
            const map = {
                [-11]: 'El servidor está ocupado o alcanzó el límite de peticiones. Inténtalo de nuevo en breve.'
            };
            const base = map[raw] || `Se produjo un error al generar la respuesta (código ${raw}).`;
            const fallback = getOfflineResponse(question);
            return `⚠️ ${base}\n\n${fallback}`;
        }
        if (typeof raw === 'object') {
            if (raw.text) return String(raw.text);
            if (raw.message) return String(raw.message);
            // Como último recurso, formatea el JSON
            return JSON.stringify(raw, null, 2);
        }
        let text = String(raw);
        const looksLikeHTML = /<\s*html[\s>]|<\s*body[\s>]|<!DOCTYPE/i.test(text);
        if (looksLikeHTML) {
            const fallback = getOfflineResponse(question);
            return `⚠️ El servidor devolvió contenido inesperado.\n\n${fallback}`;
        }
        return text.trim();
    } catch (e) {
        const fallback = getOfflineResponse(question);
        return `⚠️ Ocurrió un problema al procesar la respuesta.\n\n${fallback}`;
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

    // Sincroniza el <select> del sidebar Docente con el tema actual
    const docSelect = document.getElementById('sidebar-theme-select');
    if (docSelect && docSelect.value !== theme) {
        docSelect.value = theme;
    }

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

// ===== MODAL DE ROL =====
function showRoleStep(step) {
    const s1 = document.getElementById('role-step-1');
    const sd = document.getElementById('role-step-docente');
    const se = document.getElementById('role-step-estudiante');
    if (!s1 || !sd || !se) return;
    const st = String(step);
    s1.style.display = (st==='1') ? 'grid' : 'none';
    sd.style.display = (st==='docente') ? 'block' : 'none';
    se.style.display = (st==='estudiante') ? 'block' : 'none';
    if (st==='1') {
        const em = document.getElementById('docente-email'); if (em) em.value='';
        const pw = document.getElementById('docente-pass'); if (pw) pw.value='';
        const nm = document.getElementById('student-name-input'); if (nm) nm.value='';
    }
}
function hideRoleModal() {
    const modal = document.getElementById('role-modal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
}

// ===== HERRAMIENTAS DE ADMINISTRACIÓN =====
function deleteStudentHistory() {
    if (!selectedStudentKey) { alert('Selecciona un estudiante primero.'); return; }
    if (!confirm(`¿Eliminar historial de ${selectedStudentName}?`)) return;
    localStorage.removeItem(selectedStudentKey);
    const container = document.getElementById('student-analysis-container');
    if (container) {
        container.innerHTML = `<div style="text-align: center; padding: 2rem;"><div style="font-size: 3rem; margin-bottom: 1rem;">📊</div><h4 style="color: var(--primary-purple); margin-bottom: 0.5rem;">${selectedStudentName}</h4><p style="color: var(--dark-gray);">Historial eliminado</p></div>`;
    }
    renderStudents();
    if (currentRole==='docente') {
        chatHistory = [];
        renderHistory();
    }
}
function showFullResetModal() {
    const msg = 'Esta acción reiniciará la aplicación: roles, nombres, historiales, recordatorios y temas. ¿Deseas continuar?';
    if (!confirm(msg)) return;
    try { localStorage.clear(); } catch(e) {}
    location.reload();
}

// ===== ANÁLISIS POR ESTUDIANTE =====
function renderStudentAnalysisByHistory(history, displayName) {
    const container = document.getElementById('student-analysis-container');
    if (!container) return;

    if (!history || history.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📊</div>
                <h4 style="color: var(--primary-purple); margin-bottom: 0.5rem;">${displayName}</h4>
                <p style="color: var(--dark-gray);">No hay consultas registradas para este estudiante</p>
            </div>
        `;
        if (studentChart) { studentChart.destroy(); studentChart = null; }
        return;
    }

    const totalQuestions = history.length;
    const dates = history.map(h => new Date(h.timestamp || Date.now()));
    const last = new Date(Math.max.apply(null, dates));
    const avgLen = Math.round(history.reduce((a,h)=>a+((h.question||'').split(/\s+/).filter(Boolean).length),0)/totalQuestions);

    // Últimos 7 días
    const last7 = getLast7Days();
    const dailyCounts = last7.map(d => {
        return history.filter(h => {
            const t = new Date(h.timestamp || Date.now()).toISOString().split('T')[0];
            return t === d;
        }).length;
    });

    // Temas
    const topics = ['matemáticas','colores','animales','emociones','juegos','música','arte','ciencia'];
    const topicCounts = {};
    topics.forEach(t => topicCounts[t] = 0);
    history.forEach(h => {
        const q = (h.question || '').toLowerCase();
        topics.forEach(t => { if (q.includes(t.slice(0,5))) topicCounts[t] += 1; });
    });
    const topTopics = Object.entries(topicCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);

    // Preguntas recientes
    const recent = history.slice(-5).reverse();

    container.innerHTML = `
        <div class="stats-summary" style="margin-bottom:1rem;">
            <div class="stat-item"><div class="stat-number">${totalQuestions}</div><div class="stat-label">Total Preguntas</div></div>
            <div class="stat-item"><div class="stat-number">${avgLen}</div><div class="stat-label">Promedio Palabras</div></div>
            <div class="stat-item"><div class="stat-number">${last.toLocaleDateString('es-ES')}</div><div class="stat-label">Última Actividad</div></div>
            <div class="stat-item"><div class="stat-number" style="font-size:1.8rem;">${topTopics.length>0?capitalizeWords(topTopics[0][0]):'N/A'}</div><div class="stat-label">Tema Destacado</div></div>
        </div>
        <div class="chart-container"><canvas id="student-chart" height="300"></canvas></div>
        <div class="content-grid" style="grid-template-columns: repeat(auto-fit,minmax(250px,1fr));">
            <div class="feature-card">
                <div class="card-header"><i class="fas fa-tags"></i><h3>Temas más consultados</h3></div>
                <div class="card-content">
                    ${topTopics.length 
                        ? (
                            '<div style="display:flex;flex-direction:column;gap:.25rem;">' +
                            topTopics.map(([t,c])=>
                                `<div style="display:flex;justify-content:space-between;align-items:center;padding:.25rem 0;border-bottom:1px dashed var(--medium-gray);">
                                    <span style="font-weight:600;">${capitalizeWords(t)}</span>
                                    <span style="color:var(--primary-purple);font-weight:700;">${c}</span>
                                </div>`
                            ).join('') +
                            '</div>'
                          )
                        : '<p>No hay datos de temas</p>'
                    }
                </div>
            </div>
            <div class="feature-card">
                <div class="card-header"><i class="fas fa-clock"></i><h3>Preguntas recientes</h3></div>
                <div class="card-content">
                    ${recent.map(r=>`<div style="margin-bottom:.5rem;">• ${r.question}</div>`).join('')}
                </div>
            </div>
        </div>
    `;

    const ctx = document.getElementById('student-chart');
    if (!ctx) return;
    if (studentChart) { studentChart.destroy(); }

    studentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: last7.map(d => {
                const dd = new Date(d);
                return dd.toLocaleDateString('es-ES',{ weekday:'short', day:'numeric' });
            }),
            datasets: [{
                label: 'Preguntas por día',
                data: dailyCounts,
                backgroundColor: 'rgba(37, 99, 235, 0.2)',
                borderColor: 'rgba(37, 99, 235, 0.9)',
                borderWidth: 2,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: `Actividad semanal de ${displayName}`, font: { size: 16, weight: 'bold' } },
                legend: { display: false }
            },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
    });
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
let typingStopped = false;
let typingTimeout = null;
function typeWriter(text, element, speed = 1, onComplete) {
    let i = 0;
    typingStopped = false;
    element.innerHTML = '';
    // Mostrar botón de parar
    const stopBtn = document.getElementById('stop-typing-btn');
    if (stopBtn) stopBtn.style.display = 'inline-block';
    function type() {
        if (typingStopped) {
            if (stopBtn) stopBtn.style.display = 'none';
            return;
        }
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            // auto-scroll durante el tipeo
            const chatDiv = document.getElementById('chat-history');
            if (chatDiv) chatDiv.scrollTop = chatDiv.scrollHeight;
            typingTimeout = setTimeout(type, speed);
        } else {
            if (stopBtn) stopBtn.style.display = 'none';
            if (typeof onComplete === 'function') onComplete();
        }
    }
    type();
}

function stopTyping() {
    typingStopped = true;
    if (typingTimeout) clearTimeout(typingTimeout);
    const stopBtn = document.getElementById('stop-typing-btn');
    if (stopBtn) stopBtn.style.display = 'none';
}

// ===== ROLE / SESSION MODAL LOGIC =====
function initRoleModal(){
    const modal=document.getElementById('role-modal');
    if(!modal) return;
    const btnRoleDocente=document.getElementById('btn-role-docente');
    const btnRoleEst=document.getElementById('btn-role-estudiante');
    const step1=document.getElementById('role-step-1');
    const stepDoc=document.getElementById('role-step-docente');
    const stepEst=document.getElementById('role-step-estudiante');

    btnRoleDocente.addEventListener('click',()=>{
        step1.style.display='none';
        stepDoc.style.display='block';
    });
    btnRoleEst.addEventListener('click',()=>{
        step1.style.display='none';
        stepEst.style.display='block';
    });

    document.getElementById('btn-docente-login').addEventListener('click',()=>{
        const email=document.getElementById('docente-email').value.trim().toLowerCase();
        const pass=document.getElementById('docente-pass').value.trim();
        if(!email||!pass){alert('Ingresa correo y contraseña');return;}
        // Credenciales simples en localStorage (solo demostración)
        const storedPass=localStorage.getItem(`teacherPass_${email}`);
        if(storedPass===null){
            // Primera vez: registra credencial
            localStorage.setItem(`teacherPass_${email}`,pass);
            alert('Cuenta creada');
        }
        if(localStorage.getItem(`teacherPass_${email}`)===pass){
            currentRole='docente';
            localStorage.setItem('currentRole',currentRole);
            localStorage.setItem('teacherEmail',email);
            modal.style.display='none';
            switchMode('docente');
            updateTabsVisibility();
        }else{
            alert('Credenciales incorrectas');
        }
    });
    document.getElementById('btn-student-start').addEventListener('click',()=>{
        const name=document.getElementById('student-name-input').value.trim();
        if(!name){alert('Ingresa tu nombre');return;}
        const displayName = capitalizeWords(name);
        studentName=displayName;
        localStorage.setItem('studentName',studentName);
        currentRole='estudiante';
        localStorage.setItem('currentRole',currentRole);
        modal.style.display='none';
        switchMode('estudiante');
        updateTabsVisibility();
    });
}

document.addEventListener('DOMContentLoaded',()=>{
    // si ya hay rol guardado, ocultar modal
    const savedRole=localStorage.getItem('currentRole');
    if(savedRole){
        currentRole=savedRole;
        if(savedRole==='estudiante') switchMode('estudiante');
        else switchMode('docente');
        document.getElementById('role-modal').style.display='none';
        updateTabsVisibility();
        showLogout(); // Mostrar botón de logout cuando hay sesión activa
    }else{
        initRoleModal();
    }

    // Agregar event listener al botón de logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});

// ===== IMAGE CAROUSEL FUNCTIONALITY =====
let currentSlideIndex = 0;
const slides = document.querySelectorAll('.carousel-slide');
const indicators = document.querySelectorAll('.carousel-indicator');
let carouselInterval = null;

function showSlide(index) {
    if (!slides.length) return;
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });
    indicators.forEach((indicator, i) => {
        indicator.classList.toggle('active', i === index);
    });
    currentSlideIndex = index;
}

function changeSlide(direction) {
    if (!slides.length) return;
    let newIndex = currentSlideIndex + direction;
    if (newIndex < 0) newIndex = slides.length - 1;
    if (newIndex >= slides.length) newIndex = 0;
    showSlide(newIndex);
    resetCarouselInterval();
}

function goToSlide(index) {
    if (!slides.length) return;
    showSlide(index);
    resetCarouselInterval();
}

function resetCarouselInterval() {
    if (carouselInterval) clearInterval(carouselInterval);
    carouselInterval = setInterval(() => {
        changeSlide(1);
    }, 5000);
}

// Initialize carousel interval on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    resetCarouselInterval();
});
