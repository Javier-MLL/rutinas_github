/**
 * APEIVEX ROUTINES - PARTE 1: NÚCLEO DE GAMIFICACIÓN Y PERSISTENCIA (75,600 XP EDICIÓN)
 * Desarrollado por Apeivex Studios
 */

// --- 1. MATRIZ DE RANGOS EXPONENCIALES ACTUALIZADA (MÁXIMO 75,600 XP) ---
const CONFIG_RANGOS = [
    { nombre: "Madera 1", icono: "🪵", minXp: 0 },
    { nombre: "Madera 2", icono: "🪵", minXp: 200 },
    { nombre: "Madera 3", icono: "🪵", minXp: 500 },
    
    { nombre: "Bronce 1", icono: "🥉", minXp: 1000 },
    { nombre: "Bronce 2", icono: "🥉", minXp: 1600 },
    { nombre: "Bronce 3", icono: "🥉", minXp: 2400 },
    
    { nombre: "Plata 1", icono: "🥈", minXp: 3400 },
    { nombre: "Plata 2", icono: "🥈", minXp: 4600 },
    { nombre: "Plata 3", icono: "🥈", minXp: 6000 },
    
    { nombre: "Oro 1", icono: "🥇", minXp: 7600 },
    { nombre: "Oro 2", icono: "🥇", minXp: 9400 },
    { nombre: "Oro 3", icono: "🥇", minXp: 11500 },
    
    { nombre: "Platino 1", icono: "💎", minXp: 13900 },
    { nombre: "Platino 2", icono: "💎", minXp: 16600 },
    { nombre: "Platino 3", icono: "💎", minXp: 19600 },
    
    { nombre: "Diamante 1", icono: "🔮", minXp: 23000 },
    { nombre: "Diamante 2", icono: "🔮", minXp: 26800 },
    { nombre: "Diamante 3", icono: "🔮", minXp: 31000 },
    
    { nombre: "Campeón 1", icono: "👑", minXp: 35600 },
    { nombre: "Campeón 2", icono: "👑", minXp: 40700 },
    { nombre: "Campeón 3", icono: "👑", minXp: 46300 },
    
    { nombre: "Titán 1", icono: "⚡", minXp: 52500 },
    { nombre: "Titán 2", icono: "⚡", minXp: 59300 },
    { nombre: "Titán 3", icono: "⚡", minXp: 66800 },
    
    { nombre: "Legendario 1", icono: "🦅", minXp: 71200 },
    { nombre: "Legendario 2", icono: "🦅", minXp: 72500 },
    { nombre: "Legendario 3", icono: "🦅", minXp: 73800 },
    
    { nombre: "Ultra-Legendario 1", icono: "🌌", minXp: 74700 },
    { nombre: "Ultra-Legendario 2", icono: "🌌", minXp: 75200 },
    { nombre: "Ultra-Legendario 3 (Máximo)", icono: "🌌", minXp: 75600 }
];

const XP_BASE = 30;
const MAX_XP_LIMIT = 75600; // Ajuste del límite máximo del servidor local

const MULTIPLICADORES = {
    facil: 0.5,
    normal: 1.0,
    dificil: 1.5,
    imposible: 2.0,
    dios: 3.0
};

// --- 2. ESTADO GLOBAL EN MEMORIA DE LA SESIÓN ---
let appState = {
    profile: {
        username: "Operador Apeivex",
        totalXp: 0,
        currentRank: "Madera 1",
        rankIcon: "🪵",
        lastConnectionDate: ""
    },
    tasks: []
};

// --- 3. ALGORITMO MATEMÁTICO DE RECOMPENSAS Y RANGOS ---
function calculateTaskValue(difficulty) {
    const multiplier = MULTIPLICADORES[difficulty] || 1.0;
    return XP_BASE * multiplier;
}

function processRankProgression() {
    // Protección contra desbordamiento o valores negativos (Actualizado a 75,600)
    if (appState.profile.totalXp > MAX_XP_LIMIT) appState.profile.totalXp = MAX_XP_LIMIT;
    if (appState.profile.totalXp < 0) appState.profile.totalXp = 0;

    let currentXp = appState.profile.totalXp;
    let rankIndex = 0;

    for (let i = 0; i < CONFIG_RANGOS.length; i++) {
        if (currentXp >= CONFIG_RANGOS[i].minXp) {
            rankIndex = i;
        } else {
            break;
        }
    }

    const currentRankObj = CONFIG_RANGOS[rankIndex];
    const nextRankObj = CONFIG_RANGOS[rankIndex + 1] || null;

    appState.profile.currentRank = currentRankObj.nombre;
    appState.profile.rankIcon = currentRankObj.icono;

    return { currentRankObj, nextRankObj };
}

// --- 4. CONTROLADORES DE ALMACENAMIENTO DE DATOS ---
function saveDataToLocalStorage() {
    localStorage.setItem('apeivex_routines_profile', JSON.stringify(appState.profile));
    localStorage.setItem('apeivex_routines_tasks', JSON.stringify(appState.tasks));
}

function initBaseProfile(currentDateStr) {
    appState.profile = {
        username: "Operador Alfa",
        totalXp: 0,
        currentRank: "Madera 1",
        rankIcon: "🪵",
        lastConnectionDate: currentDateStr
    };
    appState.tasks = [];
}
/**
 * APEIVEX ROUTINES - PARTE 2: GESTIÓN HORARIA, EVENTOS Y RENDERIZACIÓN
 * Desarrollado por Apeivex Studios
 */

// --- 5. SELECTORES DEL ÁRBOL DOM ---
const domDateDisplay = document.getElementById('current-date-display');
const domRankTitle = document.getElementById('rank-title-display');
const domRankIcon = document.getElementById('rank-icon');
const domCurrentXp = document.getElementById('current-xp-display');
const domNextLevelXp = document.getElementById('next-level-xp-display');
const domTotalXp = document.getElementById('total-xp-display');
const domProgressBar = document.getElementById('xp-progress-bar');
const domTaskNameInput = document.getElementById('task-name');
const domTaskDifficultySelect = document.getElementById('task-difficulty');
const domBtnAddTask = document.getElementById('btn-add-task');
const domTasksListContainer = document.getElementById('tasks-list-container');
const domEmptyStateMsg = document.getElementById('empty-state-msg');
const domTaskCount = document.getElementById('task-count');

// --- 6. RELOJ INTERNO (ZONA HORARIA ESPAÑA / MADRID) ---
function getSpainDateString() {
    const options = { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' };
    const formatter = new Intl.DateTimeFormat('es-ES', options);
    return formatter.format(new Date());
}

function checkMidnightReset() {
    const currentDateStr = getSpainDateString();
    domDateDisplay.textContent = currentDateStr;

    if (appState.profile.lastConnectionDate && appState.profile.lastConnectionDate !== currentDateStr) {
        appState.tasks.forEach(task => { task.completed = false; });
    }
    appState.profile.lastConnectionDate = currentDateStr;
    saveDataToLocalStorage();
}

// --- 7. ACTUALIZACIÓN VISUAL DEL MOTOR ---
function updateUI() {
    const { currentRankObj, nextRankObj } = processRankProgression();
    let currentXp = appState.profile.totalXp;

    domTotalXp.textContent = currentXp.toLocaleString();
    domRankTitle.textContent = currentRankObj.nombre;
    domRankIcon.textContent = currentRankObj.icono;

    if (nextRankObj) {
        let rangeFloor = currentRankObj.minXp;
        let rangeCeiling = nextRankObj.minXp;
        let xpInThisLevel = currentXp - rangeFloor;
        let totalXpRequiredForNext = rangeCeiling - rangeFloor;
        
        let percentage = (xpInThisLevel / totalXpRequiredForNext) * 100;
        
        domProgressBar.style.width = `${percentage}%`;
        domCurrentXp.textContent = `${xpInThisLevel} XP obtenidos`;
        domNextLevelXp.textContent = `Faltan ${rangeCeiling - currentXp} XP`;
    } else {
        domProgressBar.style.width = '100%';
        domCurrentXp.textContent = `¡NIVEL MÁXIMO ABSOLUTO!`;
        domNextLevelXp.textContent = `75,600 XP`;
    }
}

// --- 8. CONTROLADORES DE ACCIONES (INTERACCIÓN DEL USUARIO) ---
function sanitizeInput(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

function addNewTask() {
    const originalName = domTaskNameInput.value.trim();
    const difficulty = domTaskDifficultySelect.value;

    if (!originalName) {
        alert("El núcleo del sistema rechaza campos vacíos.");
        return;
    }

    const newTask = {
        id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: sanitizeInput(originalName),
        difficulty: difficulty,
        completed: false
    };

    appState.tasks.push(newTask);
    domTaskNameInput.value = "";
    domTaskDifficultySelect.value = "normal";

    saveDataToLocalStorage();
    renderTasks();
}

// Intercambia estados sumando o restando XP dinámicamente
function toggleTaskState(id) {
    const task = appState.tasks.find(t => t.id === id);
    if (task) {
        let xpValue = calculateTaskValue(task.difficulty);
        if (!task.completed) {
            task.completed = true;
            appState.profile.totalXp += xpValue;
        } else {
            task.completed = false;
            appState.profile.totalXp -= xpValue;
        }
        updateUI();
        saveDataToLocalStorage();
        renderTasks();
    }
}

function deleteTask(id) {
    const taskIndex = appState.tasks.findIndex(t => t.id === id);
    if (taskIndex > -1) {
        if (appState.tasks[taskIndex].completed) {
            let xpValue = calculateTaskValue(appState.tasks[taskIndex].difficulty);
            appState.profile.totalXp -= xpValue;
        }
        appState.tasks.splice(taskIndex, 1);
        updateUI();
        saveDataToLocalStorage();
        renderTasks();
    }
}

// --- 9. RENDERIZADOR DEL LISTADO DE RUTINAS ---
function renderTasks() {
    domTasksListContainer.innerHTML = "";

    if (appState.tasks.length === 0) {
        domTasksListContainer.appendChild(domEmptyStateMsg);
        domEmptyStateMsg.style.display = "block";
        domTaskCount.textContent = "0 activas";
        return;
    }

    domEmptyStateMsg.style.display = "none";
    const uncompletedCount = appState.tasks.filter(t => !t.completed).length;
    domTaskCount.textContent = `${uncompletedCount} activas`;

    appState.tasks.forEach(task => {
        const xpWorth = calculateTaskValue(task.difficulty);
        const taskCard = document.createElement('div');
        taskCard.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        taskCard.innerHTML = `
            <div class="task-left">
                <span class="task-title">${task.name}</span>
                <div class="task-meta">
                    <span class="difficulty-badge badge-${task.difficulty}">${task.difficulty}</span>
                    <span class="xp-badge">+${xpWorth} XP</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="btn-check" onclick="toggleTaskState('${task.id}')">
                    ${task.completed ? '✓ Completado' : 'Hacer'}
                </button>
                <button class="btn-delete" onclick="deleteTask('${task.id}')">✕</button>
            </div>
        `;
        domTasksListContainer.appendChild(taskCard);
    });
}

// --- 10. ORQUESTADOR DE ARRANQUE ---
function bootSystem() {
    const savedProfile = localStorage.getItem('apeivex_routines_profile');
    const savedTasks = localStorage.getItem('apeivex_routines_tasks');

    if (savedProfile && savedTasks) {
        appState.profile = JSON.parse(savedProfile);
        appState.tasks = JSON.parse(savedTasks);
    } else {
        initBaseProfile(getSpainDateString());
    }
    
    checkMidnightReset();
    updateUI();
    renderTasks();
}

// Inicialización de oyentes de eventos
domBtnAddTask.addEventListener('click', addNewTask);
domTaskNameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addNewTask(); });
document.addEventListener('DOMContentLoaded', bootSystem);
