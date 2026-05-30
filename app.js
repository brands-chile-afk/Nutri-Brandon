/* ==========================================================================
   NUTRILIFE - LOGICA DE APLICACION CLIENT-SIDE COMPLETA
   ========================================================================== */

// 1. REGISTRO DE SERVICE WORKER PARA SOPORTE PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .then((reg) => console.log("PWA Service Worker registrado con éxito", reg.scope))
      .catch((err) => console.error("Error al registrar Service Worker PWA:", err));
  });
}

// 2. CONFIGURACIÓN Y ESTADO INICIAL
const STORAGE_KEYS = {
  SETTINGS: "nutrilife_settings",
  DAILY_LOGS: "nutrilife_daily_logs",
  WEIGHT_HISTORY: "nutrilife_weight_history",
  INBODY_HISTORY: "nutrilife_inbody_history",
  FAVORITES: "nutrilife_favorite_foods"
};

// Alimentos comunes predefinidos (Biblioteca de alimentos rápidos)
const QUICK_FOODS_LIBRARY = [
  { nombre: "Pechuga de Pollo a la plancha (150g)", calorias: 247, proteinas: 46, carbohidratos: 0, grasas: 6 },
  { nombre: "Huevo entero cocido (1 u / 50g)", calorias: 78, proteinas: 6.5, carbohidratos: 0.6, grasas: 5.3 },
  { nombre: "Avena en hojuelas (50g)", calorias: 195, proteinas: 7, carbohidratos: 33, grasas: 3.5 },
  { nombre: "Arroz blanco cocido (100g)", calorias: 130, proteinas: 2.7, carbohidratos: 28, grasas: 0.3 },
  { nombre: "Aguacate Haas (50g)", calorias: 80, proteinas: 1, carbohidratos: 4.3, grasas: 7.3 },
  { nombre: "Plátano/Banana (1 u mediana)", calorias: 105, proteinas: 1.3, carbohidratos: 27, grasas: 0.3 },
  { nombre: "Manzana verde (1 u mediana)", calorias: 95, proteinas: 0.5, carbohidratos: 25, grasas: 0.3 },
  { nombre: "Atún al agua en conserva (100g)", calorias: 116, proteinas: 26, carbohidratos: 0, grasas: 1 },
  { nombre: "Leche descremada (200ml)", calorias: 70, proteinas: 6.8, carbohidratos: 10, grasas: 0.2 },
  { nombre: "Almendras crudas (20g / ~15 u)", calorias: 116, proteinas: 4.2, carbohidratos: 4.3, grasas: 10 }
];

// Estado global en memoria
let state = {
  settings: {
    name: "Usuario",
    caloriesTarget: 2000,
    waterTarget: 2500,
    proteinTarget: 140,
    carbsTarget: 200,
    fatsTarget: 65,
    geminiApiKey: "",
    theme: "light"
  },
  dailyLogs: {}, // Clave: YYYY-MM-DD -> { foods: [], waterConsumed: 0 }
  weightHistory: [], // Lista de { date: "YYYY-MM-DD", weight: 75.4 }
  inbodyHistory: [], // Lista de InBody objects
  favoriteFoods: [] // Lista de comidas favoritas/predeterminadas
};

// Generar Datos de Inicio Premium con tus datos reales del CSV de InBody
function getMockInitialData() {
  const todayStr = getFormattedDateString(new Date());
  
  // Tu historial de pesos mensuales reales
  const weightMock = [
    { date: "2025-11-22", weight: 99.2 },
    { date: "2025-12-20", weight: 96.0 },
    { date: "2026-01-18", weight: 95.5 },
    { date: "2026-02-14", weight: 92.5 },
    { date: "2026-03-14", weight: 91.9 },
    { date: "2026-04-18", weight: 91.5 },
    { date: "2026-05-16", weight: 90.5 }
  ];

  // Tu historial de InBody real de 7 meses
  const inbodyMock = [
    { date: "2025-11-22", weight: 99.2, muscleMass: 44.0, bodyFatMass: 22.9, bodyFatPct: 23.1, visceralFat: 9 },
    { date: "2025-12-20", weight: 96.0, muscleMass: 42.8, bodyFatMass: 21.9, bodyFatPct: 22.8, visceralFat: 8 },
    { date: "2026-01-18", weight: 95.5, muscleMass: 44.0, bodyFatMass: 19.6, bodyFatPct: 20.5, visceralFat: 8 },
    { date: "2026-02-14", weight: 92.5, muscleMass: 43.3, bodyFatMass: 17.5, bodyFatPct: 18.9, visceralFat: 7 },
    { date: "2026-03-14", weight: 91.9, muscleMass: 42.7, bodyFatMass: 18.0, bodyFatPct: 19.6, visceralFat: 7 },
    { date: "2026-04-18", weight: 91.5, muscleMass: 43.1, bodyFatMass: 16.7, bodyFatPct: 18.2, visceralFat: 7 },
    { date: "2026-05-16", weight: 90.5, muscleMass: 42.3, bodyFatMass: 17.2, bodyFatPct: 19.0, visceralFat: 7 }
  ];

  // Comidas simuladas para el día de hoy
  const mockDailyLogs = {};
  mockDailyLogs[todayStr] = {
    waterConsumed: 1250,
    foods: [
      { id: Date.now() - 10, nombre: "Avena con plátano", calorias: 300, proteinas: 8, carbohidratos: 60, grasas: 4, categoria: "Desayuno" },
      { id: Date.now() - 9, nombre: "Huevos revueltos (2 unidades)", calorias: 156, proteinas: 13, carbohidratos: 1.2, grasas: 10.6, categoria: "Desayuno" },
      { id: Date.now() - 8, nombre: "Pechuga de pollo con arroz", calorias: 377, proteinas: 48.7, carbohidratos: 28, grasas: 6.3, categoria: "Almuerzo" }
    ]
  };

  return {
    settings: {
      name: "Brandon",
      caloriesTarget: 2050,
      waterTarget: 2500,
      proteinTarget: 150,
      carbsTarget: 210,
      fatsTarget: 60,
      geminiApiKey: "",
      theme: "light"
    },
    dailyLogs: mockDailyLogs,
    weightHistory: weightMock,
    inbodyHistory: inbodyMock,
    favoriteFoods: []
  };
}

// Inicialización de la Base de Datos Local
function initDatabase() {
  const cachedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  const cachedLogs = localStorage.getItem(STORAGE_KEYS.DAILY_LOGS);
  const cachedWeight = localStorage.getItem(STORAGE_KEYS.WEIGHT_HISTORY);
  const cachedInBody = localStorage.getItem(STORAGE_KEYS.INBODY_HISTORY);
  const cachedFavorites = localStorage.getItem(STORAGE_KEYS.FAVORITES);

  if (cachedSettings || cachedLogs || cachedWeight || cachedInBody || cachedFavorites) {
    // Cargar datos reales
    if (cachedSettings) state.settings = JSON.parse(cachedSettings);
    if (cachedLogs) state.dailyLogs = JSON.parse(cachedLogs);
    if (cachedWeight) state.weightHistory = JSON.parse(cachedWeight);
    if (cachedInBody) state.inbodyHistory = JSON.parse(cachedInBody);
    if (cachedFavorites) state.favoriteFoods = JSON.parse(cachedFavorites);
  } else {
    // Cargar datos reales como iniciales
    console.log("Inicializando NutriLife con tus datos reales de InBody...");
    state = getMockInitialData();
    saveStateToLocalStorage();
  }

  // Importación/Migración forzada de datos reales del CSV por si ya existía almacenamiento local previo
  const hasImportedCsv = localStorage.getItem("nutrilife_csv_imported_v2");
  if (!hasImportedCsv) {
    state.weightHistory = [
      { date: "2025-11-22", weight: 99.2 },
      { date: "2025-12-20", weight: 96.0 },
      { date: "2026-01-18", weight: 95.5 },
      { date: "2026-02-14", weight: 92.5 },
      { date: "2026-03-14", weight: 91.9 },
      { date: "2026-04-18", weight: 91.5 },
      { date: "2026-05-16", weight: 90.5 }
    ];
    state.inbodyHistory = [
      { date: "2025-11-22", weight: 99.2, muscleMass: 44.0, bodyFatMass: 22.9, bodyFatPct: 23.1, visceralFat: 9 },
      { date: "2025-12-20", weight: 96.0, muscleMass: 42.8, bodyFatMass: 21.9, bodyFatPct: 22.8, visceralFat: 8 },
      { date: "2026-01-18", weight: 95.5, muscleMass: 44.0, bodyFatMass: 19.6, bodyFatPct: 20.5, visceralFat: 8 },
      { date: "2026-02-14", weight: 92.5, muscleMass: 43.3, bodyFatMass: 17.5, bodyFatPct: 18.9, visceralFat: 7 },
      { date: "2026-03-14", weight: 91.9, muscleMass: 42.7, bodyFatMass: 18.0, bodyFatPct: 19.6, visceralFat: 7 },
      { date: "2026-04-18", weight: 91.5, muscleMass: 43.1, bodyFatMass: 16.7, bodyFatPct: 18.2, visceralFat: 7 },
      { date: "2026-05-16", weight: 90.5, muscleMass: 42.3, bodyFatMass: 17.2, bodyFatPct: 19.0, visceralFat: 7 }
    ];
    localStorage.setItem("nutrilife_csv_imported_v2", "true");
    saveStateToLocalStorage();
  }
  
  // Aplicar tema guardado
  applyTheme(state.settings.theme || "light");
}

let isCloudSyncing = false;

function saveStateToLocalStorage() {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
  localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(state.dailyLogs));
  localStorage.setItem(STORAGE_KEYS.WEIGHT_HISTORY, JSON.stringify(state.weightHistory));
  localStorage.setItem(STORAGE_KEYS.INBODY_HISTORY, JSON.stringify(state.inbodyHistory));
  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(state.favoriteFoods || []));

  // Sincronizar asíncronamente con la nube si hay inicio de sesión y no estamos ya sincronizando
  if (isFirebaseConnected && firebase.auth().currentUser && !isCloudSyncing) {
    saveDataToCloudSync();
  }
}

async function saveDataToCloudSync() {
  const user = firebase.auth().currentUser;
  if (!user || !db) return;

  const syncIndicator = document.getElementById("syncIndicator");
  const iconSuccess = document.getElementById("syncIconSuccess");
  const iconLoading = document.getElementById("syncIconLoading");
  const iconError = document.getElementById("syncIconError");

  // Mostrar loading
  syncIndicator.classList.remove("hidden");
  iconSuccess.classList.add("hidden");
  iconError.classList.add("hidden");
  iconLoading.classList.remove("hidden");

  isCloudSyncing = true;

  try {
    await db.collection("users").doc(user.uid).set({
      settings: state.settings,
      dailyLogs: state.dailyLogs,
      weightHistory: state.weightHistory,
      inbodyHistory: state.inbodyHistory,
      favoriteFoods: state.favoriteFoods || [],
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // Sincronización exitosa
    iconLoading.classList.add("hidden");
    iconSuccess.classList.remove("hidden");
  } catch (error) {
    console.error("Error al sincronizar con Firebase:", error);
    iconLoading.classList.add("hidden");
    iconError.classList.remove("hidden");
  } finally {
    isCloudSyncing = false;
  }
}

// 3. CONTROLADOR DE NAVEGACION POR PESTAÑAS (SPA)
let activeView = "dashboard-view";

function initNavigation() {
  const desktopLinks = document.querySelectorAll(".nav-link");
  const mobileLinks = document.querySelectorAll(".bottom-nav-link");
  
  const allLinks = [...desktopLinks, ...mobileLinks];
  
  allLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = link.getAttribute("data-target");
      if (target) switchTab(target);
    });
  });
}

function switchTab(targetViewId) {
  activeView = targetViewId;
  
  // Ocultar todas las pestañas
  const panes = document.querySelectorAll(".view-pane");
  panes.forEach(pane => pane.classList.remove("active"));
  
  // Mostrar la pestaña seleccionada
  const activePane = document.getElementById(targetViewId);
  if (activePane) activePane.classList.add("active");
  
  // Actualizar menús laterales e inferiores
  const desktopLinks = document.querySelectorAll(".nav-link");
  const mobileLinks = document.querySelectorAll(".bottom-nav-link");
  
  desktopLinks.forEach(link => {
    if (link.getAttribute("data-target") === targetViewId) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
  
  mobileLinks.forEach(link => {
    if (link.getAttribute("data-target") === targetViewId) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // Si cambiamos a pestañas específicas, forzar renderizado de gráficos/tablas
  if (targetViewId === "dashboard-view") {
    renderDashboard();
  } else if (targetViewId === "inbody-view") {
    renderInbodyView();
  } else if (targetViewId === "meals-view") {
    renderMealsView();
  } else if (targetViewId === "history-view") {
    renderHistoryView();
  } else if (targetViewId === "recipes-view") {
    initRecipesView();
  } else if (targetViewId === "settings-view") {
    populateSettingsInputs();
  }
}

// 4. RENDERS DE LA INTERFAZ DE USUARIO

// Dashboard principal
function renderDashboard() {
  const dateStr = getFormattedDateString(new Date());
  const log = getDayLog(dateStr);
  
  // Calcular calorías consumidas
  let caloriesConsumed = 0;
  let proteinConsumed = 0;
  let carbsConsumed = 0;
  let fatsConsumed = 0;
  
  log.foods.forEach(food => {
    caloriesConsumed += food.calorias;
    proteinConsumed += food.proteinas;
    carbsConsumed += food.carbohidratos;
    fatsConsumed += food.grasas;
  });

  caloriesConsumed = Math.round(caloriesConsumed);
  proteinConsumed = Math.round(proteinConsumed);
  carbsConsumed = Math.round(carbsConsumed);
  fatsConsumed = Math.round(fatsConsumed);

  // Metas
  const calGoal = state.settings.caloriesTarget;
  const pGoal = state.settings.proteinTarget;
  const cGoal = state.settings.carbsTarget;
  const fGoal = state.settings.fatsTarget;
  const wGoal = state.settings.waterTarget;

  // Calorías restantes
  const calRemaining = Math.max(0, calGoal - caloriesConsumed);

  // Actualizar valores de Calorías
  document.getElementById("dashCaloriesRemaining").innerText = calRemaining.toLocaleString();
  document.getElementById("dashCaloriesGoal").innerText = calGoal.toLocaleString();
  document.getElementById("dashCaloriesConsumed").innerText = caloriesConsumed.toLocaleString();

  // Actualizar Anillo de Progreso (r=85 -> perim=534)
  const ringOffset = calGoal > 0 ? 534 - (Math.min(caloriesConsumed, calGoal) / calGoal) * 534 : 534;
  document.getElementById("caloriesProgressRing").style.strokeDashoffset = ringOffset;

  // Actualizar Macros
  document.getElementById("dashProteinConsumed").innerText = proteinConsumed;
  document.getElementById("dashProteinGoal").innerText = pGoal;
  const pPct = pGoal > 0 ? Math.round((proteinConsumed / pGoal) * 100) : 0;
  document.getElementById("dashProteinFill").style.width = `${Math.min(pPct, 100)}%`;
  document.getElementById("dashProteinPct").innerText = `${pPct}%`;

  document.getElementById("dashCarbsConsumed").innerText = carbsConsumed;
  document.getElementById("dashCarbsGoal").innerText = cGoal;
  const cPct = cGoal > 0 ? Math.round((carbsConsumed / cGoal) * 100) : 0;
  document.getElementById("dashCarbsFill").style.width = `${Math.min(cPct, 100)}%`;
  document.getElementById("dashCarbsPct").innerText = `${cPct}%`;

  document.getElementById("dashFatsConsumed").innerText = fatsConsumed;
  document.getElementById("dashFatsGoal").innerText = fGoal;
  const fPct = fGoal > 0 ? Math.round((fatsConsumed / fGoal) * 100) : 0;
  document.getElementById("dashFatsFill").style.width = `${Math.min(fPct, 100)}%`;
  document.getElementById("dashFatsPct").innerText = `${fPct}%`;

  // Agua
  const waterVol = log.waterConsumed;
  document.getElementById("dashWaterVolume").innerText = waterVol;
  document.getElementById("dashWaterGoal").innerText = wGoal;
  const wPct = wGoal > 0 ? Math.round((waterVol / wGoal) * 100) : 0;
  document.getElementById("dashWaterPct").innerText = `${wPct}%`;
  document.getElementById("waterLiquidFill").style.height = `${Math.min(wPct, 100)}%`;

  // Widget Métricas Rápidas
  // Peso actual
  if (state.weightHistory.length > 0) {
    // Obtener el más reciente ordenando por fecha
    const sortedWeight = [...state.weightHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    const lastWeight = sortedWeight[0];
    document.getElementById("dashWeightVal").innerText = lastWeight.weight;
    document.getElementById("dashWeightDate").innerText = formatDateFriendly(lastWeight.date);
  } else {
    document.getElementById("dashWeightVal").innerText = "--";
    document.getElementById("dashWeightDate").innerText = "Sin registros";
  }

  // InBody actual
  if (state.inbodyHistory.length > 0) {
    const sortedInBody = [...state.inbodyHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    const lastIB = sortedInBody[0];
    document.getElementById("dashMuscleVal").innerText = lastIB.muscleMass;
    document.getElementById("dashFatVal").innerText = lastIB.bodyFatPct;
    document.getElementById("dashVisceralVal").innerText = lastIB.visceralFat;
    document.getElementById("dashInbodyDate").innerText = formatDateFriendly(lastIB.date);
    document.getElementById("dashInbodyFatDate").innerText = formatDateFriendly(lastIB.date);
  } else {
    document.getElementById("dashMuscleVal").innerText = "--";
    document.getElementById("dashFatVal").innerText = "--";
    document.getElementById("dashVisceralVal").innerText = "--";
    document.getElementById("dashInbodyDate").innerText = "InBody";
    document.getElementById("dashInbodyFatDate").innerText = "InBody";
  }
}

// 5. PESTAÑA: DIARIO DE COMIDAS (LOGIC & UI)
let mealsActiveDate = new Date();

function initMealsNavigation() {
  document.getElementById("mealsPrevDayBtn").addEventListener("click", () => {
    mealsActiveDate.setDate(mealsActiveDate.getDate() - 1);
    syncActiveDateUI();
  });
  
  document.getElementById("mealsNextDayBtn").addEventListener("click", () => {
    mealsActiveDate.setDate(mealsActiveDate.getDate() + 1);
    syncActiveDateUI();
  });

  const datePicker = document.getElementById("mealsActiveDatePicker");
  datePicker.addEventListener("change", (e) => {
    if (e.target.value) {
      mealsActiveDate = new Date(e.target.value + "T12:00:00");
      syncActiveDateUI();
    }
  });

  // Hacer que la tarjeta entera de picker dispare el click del picker oculto
  document.querySelector(".meals-date-picker-wrapper").addEventListener("click", () => {
    datePicker.showPicker();
  });

  // Inicializar triggers de agregar alimento
  const triggers = document.querySelectorAll(".add-food-trigger");
  triggers.forEach(btn => {
    btn.addEventListener("click", () => {
      const cat = btn.getAttribute("data-category");
      openFoodModal(cat);
    });
  });

  document.getElementById("closeFoodModalBtn").addEventListener("click", closeFoodModal);
  
  // Tabs del modal
  document.getElementById("tabQuickAdd").addEventListener("click", () => switchModalTab("quick"));
  document.getElementById("tabFavoritesAdd").addEventListener("click", () => switchModalTab("favorites"));
  document.getElementById("tabCustomAdd").addEventListener("click", () => switchModalTab("custom"));

  // Formulario personalizado
  document.getElementById("customFoodForm").addEventListener("submit", handleCustomFoodSubmit);

  // Iniciar aviso de API Key
  checkGeminiApiKeyWarning();

  // Registro por Voz con SpeechRecognition e IA
  initVoiceRecognition();
  
  // Botón enviar texto IA
  document.getElementById("aiProcessBtn").addEventListener("click", handleAITextSubmit);

  syncActiveDateUI();
}

function syncActiveDateUI() {
  const dateStr = getFormattedDateString(mealsActiveDate);
  
  // Actualizar etiqueta visual de fecha
  const activeDateInputVal = getFormattedDatePickerString(mealsActiveDate);
  document.getElementById("mealsActiveDatePicker").value = activeDateInputVal;

  const todayStr = getFormattedDateString(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getFormattedDateString(yesterday);

  let displayLabel = "";
  if (dateStr === todayStr) {
    displayLabel = "Hoy";
  } else if (dateStr === yesterdayStr) {
    displayLabel = "Ayer";
  } else {
    displayLabel = mealsActiveDate.toLocaleDateString("es-ES", { weekday: 'long', day: 'numeric', month: 'short' });
    // Capitalizar primera letra
    displayLabel = displayLabel.charAt(0).toUpperCase() + displayLabel.slice(1);
  }

  document.getElementById("mealsActiveDateLabel").innerText = displayLabel;
  renderMealsView();
}

function renderMealsView() {
  const dateStr = getFormattedDateString(mealsActiveDate);
  const log = getDayLog(dateStr);

  const categories = ["Desayuno", "Almuerzo", "Cena", "Snack"];
  
  categories.forEach(cat => {
    const listElement = document.getElementById(`meals${cat === "Snack" ? "Snack" : cat}List`);
    const countElement = document.getElementById(`meals${cat === "Snack" ? "Snack" : cat}Count`);
    const kcalElement = document.getElementById(`meals${cat === "Snack" ? "Snack" : cat}Kcal`);

    // Filtrar comidas
    const foods = log.foods.filter(f => f.categoria === cat);
    
    // Contadores
    countElement.innerText = `${foods.length} ${foods.length === 1 ? 'alimento' : 'alimentos'}`;
    const totalKcal = Math.round(foods.reduce((sum, f) => sum + f.calorias, 0));
    kcalElement.innerText = `${totalKcal} kcal`;

    // Renderizar lista
    if (foods.length === 0) {
      listElement.innerHTML = `<p class="empty-list-placeholder">No hay alimentos registrados en ${cat === 'Snack' ? 'snacks' : cat.toLowerCase()}.</p>`;
    } else {
      listElement.innerHTML = "";
      foods.forEach(food => {
        const isFav = state.favoriteFoods && state.favoriteFoods.some(f => f.nombre.toLowerCase() === food.nombre.toLowerCase());
        const row = document.createElement("div");
        row.className = "food-item-row";
        row.innerHTML = `
          <div class="food-info">
            <span class="food-name">${food.nombre}</span>
            <span class="food-macros-line">
              P: <span>${Math.round(food.proteinas)}g</span> &middot; 
              C: <span>${Math.round(food.carbohidratos)}g</span> &middot; 
              G: <span>${Math.round(food.grasas)}g</span>
            </span>
          </div>
          <div class="food-kcal-delete">
            <span class="food-kcal">${Math.round(food.calorias)} kcal</span>
            <button class="btn-food-favorite ${isFav ? 'active' : ''}" data-id="${food.id}" title="${isFav ? 'Quitar de favoritos' : 'Guardar como favorito'}">
              <i data-lucide="star"></i>
            </button>
            <button class="btn-food-delete" data-id="${food.id}" title="Eliminar alimento">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        `;
        listElement.appendChild(row);
        
        // Evento de favorito
        row.querySelector(".btn-food-favorite").addEventListener("click", () => {
          toggleFavoriteFood(food);
        });
        
        // Evento de eliminar
        row.querySelector(".btn-food-delete").addEventListener("click", () => {
          deleteFoodItem(dateStr, food.id);
        });
      });
    }
  });

  // Re-inicializar iconos de Lucide
  lucide.createIcons();
}

// 6. GESTION DE BASE DE DATOS LOCALES / ALIMENTOS
function getDayLog(dateStr) {
  if (!state.dailyLogs[dateStr]) {
    state.dailyLogs[dateStr] = {
      foods: [],
      waterConsumed: 0
    };
  }
  return state.dailyLogs[dateStr];
}

function addFoodItem(dateStr, food) {
  const log = getDayLog(dateStr);
  log.foods.push(food);
  saveStateToLocalStorage();
  renderMealsView();
  renderDashboard();
}

function deleteFoodItem(dateStr, id) {
  const log = getDayLog(dateStr);
  log.foods = log.foods.filter(f => f.id !== id);
  saveStateToLocalStorage();
  renderMealsView();
  renderDashboard();
}

// 7. DIALOGO MODAL: AGREGAR ALIMENTOS
let activeModalCategory = "Desayuno";

function openFoodModal(category) {
  activeModalCategory = category;
  document.getElementById("modalCategoryTitle").innerText = `Añadir a: ${category === "Snack" ? "Snacks" : category}`;
  
  // Limpiar formulario manual
  document.getElementById("customFoodForm").reset();
  
  // Cargar alimentos rápidos y favoritos
  renderQuickFoodsList();
  renderFavoriteFoodsList();

  // Abrir modal
  document.getElementById("addFoodModal").classList.remove("hidden");
  switchModalTab("quick");
}

function closeFoodModal() {
  document.getElementById("addFoodModal").classList.add("hidden");
}

function switchModalTab(tab) {
  const tabQuick = document.getElementById("tabQuickAdd");
  const tabFavorites = document.getElementById("tabFavoritesAdd");
  const tabCustom = document.getElementById("tabCustomAdd");
  const contentQuick = document.getElementById("tabContentQuick");
  const contentFavorites = document.getElementById("tabContentFavorites");
  const contentCustom = document.getElementById("tabContentCustom");

  // Reset active classes
  [tabQuick, tabFavorites, tabCustom].forEach(btn => btn.classList.remove("active"));
  [contentQuick, contentFavorites, contentCustom].forEach(cnt => cnt.classList.remove("active"));

  if (tab === "quick") {
    tabQuick.classList.add("active");
    contentQuick.classList.add("active");
  } else if (tab === "favorites") {
    tabFavorites.classList.add("active");
    contentFavorites.classList.add("active");
    renderFavoriteFoodsList(); // Refrescar la lista de favoritos al cambiar
  } else {
    tabCustom.classList.add("active");
    contentCustom.classList.add("active");
  }
}

function renderQuickFoodsList() {
  const grid = document.getElementById("quickFoodsGridList");
  grid.innerHTML = "";
  
  QUICK_FOODS_LIBRARY.forEach(food => {
    const card = document.createElement("button");
    card.className = "quick-food-card";
    card.type = "button";
    card.innerHTML = `
      <span class="qf-name">${food.nombre}</span>
      <span class="qf-kcal">${food.calorias} kcal</span>
      <span class="qf-macros">P: ${food.proteinas}g | C: ${food.carbohidratos}g | G: ${food.grasas}g</span>
    `;
    
    card.addEventListener("click", () => {
      const dateStr = getFormattedDateString(mealsActiveDate);
      const newFood = {
        id: Date.now() + Math.floor(Math.random() * 100),
        nombre: food.nombre.split(" (")[0], // Cortar peso para simplificar el nombre
        calorias: food.calorias,
        proteinas: food.proteinas,
        carbohidratos: food.carbohidratos,
        grasas: food.grasas,
        categoria: activeModalCategory
      };
      
      addFoodItem(dateStr, newFood);
      closeFoodModal();
    });
    
    grid.appendChild(card);
  });
}

function toggleFavoriteFood(food) {
  if (!state.favoriteFoods) state.favoriteFoods = [];
  const index = state.favoriteFoods.findIndex(f => f.nombre.toLowerCase() === food.nombre.toLowerCase());
  if (index > -1) {
    state.favoriteFoods.splice(index, 1);
  } else {
    state.favoriteFoods.push({
      id: Date.now() + Math.floor(Math.random() * 100),
      nombre: food.nombre,
      calorias: food.calorias,
      proteinas: food.proteinas,
      carbohidratos: food.carbohidratos,
      grasas: food.grasas
    });
  }
  saveStateToLocalStorage();
  saveDataToCloudSync();
  renderMealsView();
}

function renderFavoriteFoodsList() {
  const grid = document.getElementById("favoriteFoodsGridList");
  if (!grid) return;
  grid.innerHTML = "";
  
  if (!state.favoriteFoods || state.favoriteFoods.length === 0) {
    grid.innerHTML = `<p class="empty-list-placeholder" style="grid-column: 1 / -1; text-align: center; padding: 2rem 1rem; width: 100%;">No tienes alimentos favoritos guardados. ¡Haz clic en la estrella de tus comidas para guardarlas!</p>`;
    return;
  }
  
  state.favoriteFoods.forEach(food => {
    const cardWrapper = document.createElement("div");
    cardWrapper.className = "favorite-food-card-wrapper";
    
    cardWrapper.innerHTML = `
      <button type="button" class="quick-food-card btn-favorite-add-action" style="width: 100%; text-align: left;">
        <span class="qf-name">${food.nombre}</span>
        <span class="qf-kcal">${Math.round(food.calorias)} kcal</span>
        <span class="qf-macros">P: ${Math.round(food.proteinas)}g | C: ${Math.round(food.carbohidratos)}g | G: ${Math.round(food.grasas)}g</span>
      </button>
      <button type="button" class="btn-favorite-delete" title="Eliminar de favoritos">
        <i data-lucide="trash-2"></i>
      </button>
    `;
    
    cardWrapper.querySelector(".btn-favorite-add-action").addEventListener("click", () => {
      const dateStr = getFormattedDateString(mealsActiveDate);
      const newFood = {
        id: Date.now() + Math.floor(Math.random() * 100),
        nombre: food.nombre,
        calorias: food.calorias,
        proteinas: food.proteinas,
        carbohidratos: food.carbohidratos,
        grasas: food.grasas,
        categoria: activeModalCategory
      };
      addFoodItem(dateStr, newFood);
      closeFoodModal();
    });
    
    cardWrapper.querySelector(".btn-favorite-delete").addEventListener("click", (e) => {
      e.stopPropagation();
      const index = state.favoriteFoods.findIndex(f => f.id === food.id);
      if (index > -1) {
        state.favoriteFoods.splice(index, 1);
        saveStateToLocalStorage();
        saveDataToCloudSync();
        renderFavoriteFoodsList();
        renderMealsView();
      }
    });
    
    grid.appendChild(cardWrapper);
  });
  
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}


function handleCustomFoodSubmit(e) {
  e.preventDefault();
  
  const name = document.getElementById("customFoodName").value.trim();
  const kcal = parseFloat(document.getElementById("customFoodKcal").value);
  const p = parseFloat(document.getElementById("customFoodProtein").value);
  const c = parseFloat(document.getElementById("customFoodCarbs").value);
  const g = parseFloat(document.getElementById("customFoodFats").value);

  const dateStr = getFormattedDateString(mealsActiveDate);
  const newFood = {
    id: Date.now(),
    nombre: name,
    calorias: kcal,
    proteinas: p,
    carbohidratos: c,
    grasas: g,
    categoria: activeModalCategory
  };

  addFoodItem(dateStr, newFood);
  closeFoodModal();
}

// 8. RASTREADOR DE AGUA
function initWaterTracker() {
  document.getElementById("addWaterBtn").addEventListener("click", () => {
    const dateStr = getFormattedDateString(new Date());
    const log = getDayLog(dateStr);
    log.waterConsumed += 250; // Incrementar un vaso
    
    saveStateToLocalStorage();
    renderDashboard();
  });

  document.getElementById("resetWaterBtn").addEventListener("click", () => {
    const dateStr = getFormattedDateString(new Date());
    const log = getDayLog(dateStr);
    log.waterConsumed = 0;
    
    saveStateToLocalStorage();
    renderDashboard();
  });
}

// 9. INTEGRACION CON LA API DE GEMINI E IA DE VOZ CLIENT-SIDE
let speechRecognitionObj = null;
let isVoiceRecording = false;

function checkGeminiApiKeyWarning() {
  const warning = document.getElementById("geminiApiKeyWarning");
  if (!state.settings.geminiApiKey) {
    warning.classList.remove("hidden");
  } else {
    warning.classList.add("hidden");
  }
}

function initVoiceRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (SpeechRecognition) {
    speechRecognitionObj = new SpeechRecognition();
    speechRecognitionObj.continuous = false;
    speechRecognitionObj.lang = "es-ES";
    speechRecognitionObj.interimResults = false;
    
    const micBtn = document.getElementById("aiMicBtn");
    const micText = document.getElementById("aiMicBtnText");
    const recordingWaves = document.getElementById("aiVoiceRecordingWaves");
    const aiInput = document.getElementById("aiMealInput");
    
    speechRecognitionObj.onstart = () => {
      isVoiceRecording = true;
      micBtn.className = "btn btn-mic-active";
      micText.innerText = "Parar";
      recordingWaves.classList.remove("hidden");
    };
    
    speechRecognitionObj.onend = () => {
      isVoiceRecording = false;
      micBtn.className = "btn btn-mic-inactive";
      micText.innerText = "Hablar";
      recordingWaves.classList.add("hidden");
    };
    
    speechRecognitionObj.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      aiInput.value = transcript;
    };
    
    speechRecognitionObj.onerror = (err) => {
      console.error("Error en reconocimiento de voz:", err);
      isVoiceRecording = false;
      micBtn.className = "btn btn-mic-inactive";
      micText.innerText = "Hablar";
      recordingWaves.classList.add("hidden");
    };
    
    micBtn.addEventListener("click", () => {
      if (isVoiceRecording) {
        speechRecognitionObj.stop();
      } else {
        aiInput.value = "";
        speechRecognitionObj.start();
      }
    });
    
  } else {
    // Si el navegador no soporta SpeechRecognition (ej: Safari en algunas configuraciones antiguas)
    // Ocultar botón de voz y dejar el campo de texto de IA
    document.getElementById("aiMicBtn").classList.add("hidden");
    console.log("SpeechRecognition no está soportado en este navegador.");
  }
}

// Prompt estructurado para Gemini
const SYSTEM_PROMPT = `
Eres un asistente experto en nutrición y bases de datos de alimentos. 
Tu tarea es tomar una descripción textual de una o más comidas o alimentos en español, identificar CADA UNO de los ingredientes y alimentos consumidos sin omitir ninguno, estimar sus gramos/cantidades y devolver estrictamente un arreglo en formato JSON.

El JSON debe ser obligatoriamente un arreglo (array) de objetos que represente cada alimento o ingrediente de forma individual. Por ejemplo, si el usuario dice "comí 2 huevos y 100g de arroz", debes devolver un arreglo con dos objetos distintos (uno para el huevo y otro para el arroz).

Cada objeto dentro del arreglo debe tener exactamente las siguientes propiedades:
- "nombre": El nombre del alimento en español con la cantidad estimada (ej: "Pechuga de pollo a la plancha (150g)", "Manzana roja mediana (1u)", "Huevo frito (2u)").
- "calorias": Un número entero con el valor estimado de calorías (kcal).
- "proteinas": Un número con los gramos de proteínas.
- "carbohidratos": Un número con los gramos de carbohidratos.
- "grasas": Un número con los gramos de grasas.
- "categoria": Debe ser estrictamente uno de los siguientes valores según la hora u orden usual: "Desayuno", "Almuerzo", "Cena", "Snack".

Instrucciones Críticas:
1. Sé científicamente preciso en tus aproximaciones nutricionales. Si no se indica peso, asume una porción estándar saludable de cocina.
2. Si el usuario describe múltiples alimentos, ingredientes o comidas en la misma frase (ej: "comí 2 huevos, 100 gr de arroz y una manzana"), debes identificar, estimar y separar CADA UNO de ellos. Agrega todos los alimentos de la frase al arreglo JSON. ¡No dejes ninguno afuera!
3. Devuelve ÚNICAMENTE la estructura JSON cruda. No saludes, no te expliques, no uses bloques de código decorativos. Debe ser interpretable directamente por JSON.parse().
`;

async function handleGeminiResponseError(response) {
  try {
    const errorData = await response.json();
    if (errorData && errorData.error && errorData.error.message) {
      return new Error(`${errorData.error.message} (HTTP ${response.status})`);
    }
  } catch (e) {
    // Si la respuesta no es JSON, capturar error genérico
  }
  return new Error(`Error de red HTTP ${response.status}`);
}

async function parseMealWithGemini(text) {
  const apiKey = state.settings.geminiApiKey;
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [
      {
        parts: [
          { text: SYSTEM_PROMPT },
          { text: `Entrada del usuario: "${text}"` }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json"
    }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw await handleGeminiResponseError(response);
  }

  const data = await response.json();
  let jsonStringResult = data.candidates[0].content.parts[0].text;
  
  // Limpiar posibles bloques de código marcados en markdown
  if (jsonStringResult.includes("```json")) {
    jsonStringResult = jsonStringResult.split("```json")[1].split("```")[0].trim();
  } else if (jsonStringResult.includes("```")) {
    jsonStringResult = jsonStringResult.split("```")[1].split("```")[0].trim();
  }
  
  const parsedData = JSON.parse(jsonStringResult);
  return parsedData;
}

async function handleAITextSubmit() {
  const input = document.getElementById("aiMealInput");
  const text = input.value.trim();
  if (!text) return;

  const btn = document.getElementById("aiProcessBtn");
  const btnOriginalText = btn.innerHTML;
  
  btn.disabled = true;
  btn.innerHTML = `<i data-lucide="loader" class="shimmer-progress"></i><span>Procesando...</span>`;
  lucide.createIcons();

  try {
    const foods = await parseMealWithGemini(text);
    
    if (Array.isArray(foods)) {
      const dateStr = getFormattedDateString(mealsActiveDate);
      
      foods.forEach(food => {
        const item = {
          id: Date.now() + Math.floor(Math.random() * 1000),
          nombre: food.nombre,
          calorias: food.calorias,
          proteinas: food.proteinas,
          carbohidratos: food.carbohidratos,
          grasas: food.grasas,
          categoria: food.categoria || "Snack"
        };
        addFoodItem(dateStr, item);
      });

      input.value = "";
      
      // Feedback visual rápido
      btn.className = "btn btn-primary bg-protein";
      btn.innerHTML = `<i data-lucide="check"></i><span>¡Agregado!</span>`;
      lucide.createIcons();
      
      setTimeout(() => {
        btn.className = "btn btn-gemini";
        btn.disabled = false;
        btn.innerHTML = btnOriginalText;
        lucide.createIcons();
      }, 1500);
    }
  } catch (error) {
    console.error("Error al procesar con IA:", error);
    btn.className = "btn btn-primary bg-fats";
    
    if (error.message === "API_KEY_MISSING") {
      btn.innerHTML = `<i data-lucide="x"></i><span>Configura tu API Key</span>`;
      alert("Por favor, ingresa tu API Key de Gemini en la pestaña de Ajustes para activar esta función.");
    } else {
      btn.innerHTML = `<i data-lucide="x"></i><span>Error al analizar</span>`;
      alert("No se pudo analizar la frase. Asegúrate de tener conexión a Internet y una API Key de Gemini válida.");
    }
    
    lucide.createIcons();
    setTimeout(() => {
      btn.className = "btn btn-gemini";
      btn.disabled = false;
      btn.innerHTML = btnOriginalText;
      lucide.createIcons();
    }, 2500);
  }
}

// 10. PROCESAMIENTO MANOS LIBRES: INTEGRACION "OYE GOOGLE" (?quickadd)
async function checkAndProcessQuickAdd() {
  const params = new URLSearchParams(window.location.search);
  const quickMealText = params.get("quickadd");
  
  if (!quickMealText) return; // No hay parámetro de añadir

  // Activar overlay de carga
  const overlay = document.getElementById("quickAddOverlay");
  const textContainer = document.getElementById("quickAddText");
  const successCard = document.getElementById("quickAddSuccessCard");
  const errorCard = document.getElementById("quickAddErrorCard");
  
  overlay.classList.remove("hidden");
  textContainer.innerText = decodeURIComponent(quickMealText);
  
  // Forzar que los botones cierren el overlay y limpien la URL
  const clearUrlAndClose = () => {
    overlay.classList.add("hidden");
    // Limpiar el parámetro de la URL sin recargar la página
    const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.pushState({ path: cleanUrl }, '', cleanUrl);
    switchTab("dashboard-view");
  };

  document.getElementById("quickAddCloseBtn").addEventListener("click", clearUrlAndClose);
  document.getElementById("quickAddErrorCloseBtn").addEventListener("click", clearUrlAndClose);

  // Iniciar procesamiento asíncrono con Gemini
  try {
    const foods = await parseMealWithGemini(decodeURIComponent(quickMealText));
    
    if (Array.isArray(foods) && foods.length > 0) {
      const todayStr = getFormattedDateString(new Date());
      const detailsList = document.getElementById("quickAddDetails");
      detailsList.innerHTML = "";

      foods.forEach(food => {
        const item = {
          id: Date.now() + Math.floor(Math.random() * 1000),
          nombre: food.nombre,
          calorias: food.calorias,
          proteinas: food.proteinas,
          carbohidratos: food.carbohidratos,
          grasas: food.grasas,
          categoria: food.categoria || "Snack"
        };
        addFoodItem(todayStr, item);

        // Añadir detalle visual al reporte de éxito
        const detailRow = document.createElement("div");
        detailRow.className = "flex justify-between";
        detailRow.innerHTML = `
          <strong>${food.nombre}</strong> 
          <span style="float: right;">${food.calorias} kcal (${food.categoria})</span>
        `;
        detailsList.appendChild(detailRow);
      });

      // Mostrar tarjeta de éxito
      successCard.classList.remove("hidden");
      document.getElementById("quickAddTitle").innerText = "¡Ingreso completado!";
      document.getElementById("quickAddStatus").innerText = "La IA ha analizado y registrado tu comida.";
    } else {
      throw new Error("EMPTY_PARSED_ARRAY");
    }
  } catch (error) {
    console.error("Error procesando quickadd:", error);
    errorCard.classList.remove("hidden");
    document.getElementById("quickAddTitle").innerText = "Error de registro";
    
    if (error.message === "API_KEY_MISSING") {
      document.getElementById("quickAddErrorMsg").innerText = "Falta configurar la API Key de Gemini en los Ajustes.";
    } else {
      document.getElementById("quickAddErrorMsg").innerText = "No pudimos comprender los alimentos o la conexión falló.";
    }
  }
}

// 11. MONITOREO DE COMPOSICIÓN CORPORAL (INBODY) Y PESO
let weightChartInstance = null;
let inbodyChartInstance = null;

function initInBodyAndWeight() {
  // Ajustar inputs de fecha con la fecha de hoy por defecto
  const todayVal = getFormattedDatePickerString(new Date());
  document.getElementById("weightInputDate").value = todayVal;
  document.getElementById("inbodyDate").value = todayVal;

  // Formulario Peso
  document.getElementById("weightLogForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const date = document.getElementById("weightInputDate").value;
    const weightVal = parseFloat(document.getElementById("weightInputVal").value);
    
    logWeight(date, weightVal);
    
    document.getElementById("weightInputVal").value = "";
    renderInbodyView();
    renderDashboard();
  });

  // Formulario InBody
  document.getElementById("inbodyLogForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const date = document.getElementById("inbodyDate").value;
    const w = parseFloat(document.getElementById("inbodyWeight").value);
    const m = parseFloat(document.getElementById("inbodyMuscle").value);
    const f = parseFloat(document.getElementById("inbodyFatMass").value);
    const p = parseFloat(document.getElementById("inbodyFatPct").value);
    const v = parseInt(document.getElementById("inbodyVisceral").value);

    const record = {
      date: date,
      weight: w,
      muscleMass: m,
      bodyFatMass: f,
      bodyFatPct: p,
      visceralFat: v
    };

    logInbodyAnalysis(record);
    
    // Resetear formulario
    document.getElementById("inbodyWeight").value = "";
    document.getElementById("inbodyMuscle").value = "";
    document.getElementById("inbodyFatMass").value = "";
    document.getElementById("inbodyFatPct").value = "";
    document.getElementById("inbodyVisceral").value = "";
    
    renderInbodyView();
    renderDashboard();
  });
}

function logWeight(date, weight) {
  // Evitar duplicados para la misma fecha (actualizar)
  state.weightHistory = state.weightHistory.filter(w => w.date !== date);
  state.weightHistory.push({ date, weight });
  
  // Ordenar cronológicamente
  state.weightHistory.sort((a,b) => new Date(a.date) - new Date(b.date));
  
  saveStateToLocalStorage();
}

function logInbodyAnalysis(record) {
  state.inbodyHistory = state.inbodyHistory.filter(ib => ib.date !== record.date);
  state.inbodyHistory.push(record);
  
  // Al registrar un InBody, sincronizar opcionalmente el peso diario
  logWeight(record.date, record.weight);
  
  state.inbodyHistory.sort((a,b) => new Date(a.date) - new Date(b.date));
  
  saveStateToLocalStorage();
}

function renderInbodyView() {
  renderInBodyHistoryTable();
  renderWeightChart();
  renderInbodyChart();
}

function renderInBodyHistoryTable() {
  const body = document.getElementById("inbodyHistoryTableBody");
  
  if (state.inbodyHistory.length === 0) {
    body.innerHTML = `<tr><td colspan="8" class="text-center-placeholder">Aún no has registrado ningún análisis InBody.</td></tr>`;
    return;
  }

  body.innerHTML = "";
  
  // Ordenar descendente para la tabla (más reciente primero)
  const descHistory = [...state.inbodyHistory].sort((a,b) => new Date(b.date) - new Date(a.date));
  
  descHistory.forEach((record, index) => {
    // Calcular diferencias con el análisis anterior (que en descendente es index + 1)
    let diffHtml = '<span class="diff-badge diff-badge-neutral">-</span>';
    const prevRecord = descHistory[index + 1];
    
    if (prevRecord) {
      const muscleDiff = record.muscleMass - prevRecord.muscleMass;
      const fatDiff = record.bodyFatMass - prevRecord.bodyFatMass;
      
      const mText = muscleDiff >= 0 ? `+${muscleDiff.toFixed(1)}kg MME` : `${muscleDiff.toFixed(1)}kg MME`;
      const fText = fatDiff >= 0 ? `+${fatDiff.toFixed(1)}kg MGC` : `${fatDiff.toFixed(1)}kg MGC`;
      
      // Lógica de badges de éxito
      let mClass = muscleDiff >= 0 ? 'diff-badge-gain-muscle' : 'diff-badge-lost-muscle';
      let fClass = fatDiff <= 0 ? 'diff-badge-lost-fat' : 'diff-badge-gain-fat';

      diffHtml = `
        <div style="display: flex; flex-direction: column; gap: 0.25rem;">
          <span class="diff-badge ${mClass}">${mText}</span>
          <span class="diff-badge ${fClass}">${fText}</span>
        </div>
      `;
    }

    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>${formatDateFriendly(record.date)}</strong></td>
      <td>${record.weight} kg</td>
      <td class="text-blue"><strong>${record.muscleMass} kg</strong></td>
      <td class="text-pink"><strong>${record.bodyFatMass} kg</strong></td>
      <td>${record.bodyFatPct}%</td>
      <td><span class="badge badge-orange">${record.visceralFat}</span></td>
      <td>${diffHtml}</td>
      <td>
        <button class="btn-food-delete btn-delete-inbody" data-date="${record.date}" title="Eliminar registro Inbody">
          <i data-lucide="trash-2"></i>
        </button>
      </td>
    `;

    row.querySelector(".btn-delete-inbody").addEventListener("click", () => {
      if (confirm(`¿Estás seguro de eliminar el registro InBody del ${formatDateFriendly(record.date)}?`)) {
        state.inbodyHistory = state.inbodyHistory.filter(ib => ib.date !== record.date);
        saveStateToLocalStorage();
        renderInbodyView();
        renderDashboard();
      }
    });

    body.appendChild(row);
  });

  lucide.createIcons();
}

function renderWeightChart() {
  const ctx = document.getElementById("weightChartCanvas").getContext("2d");
  
  if (weightChartInstance) {
    weightChartInstance.destroy();
  }

  if (state.weightHistory.length === 0) {
    return; // No pintar nada
  }

  // Filtrar los últimos 15 registros para no saturar
  const cleanHistory = [...state.weightHistory].sort((a,b) => new Date(a.date) - new Date(b.date)).slice(-15);
  const labels = cleanHistory.map(w => formatDateShort(w.date));
  const data = cleanHistory.map(w => w.weight);

  const isDark = document.body.classList.contains("dark-mode");
  const textColor = isDark ? "#94a3b8" : "#64748b";
  const gridColor = isDark ? "#1e293b" : "#e2e8f0";

  weightChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Peso (kg)",
        data: data,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.05)",
        borderWidth: 3,
        tension: 0.35,
        fill: true,
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: isDark ? "#0f172a" : "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: textColor, font: { family: 'Outfit' } }
        },
        y: {
          grid: { color: gridColor },
          ticks: { color: textColor, font: { family: 'Outfit' } }
        }
      }
    }
  });
}

function renderInbodyChart() {
  const ctx = document.getElementById("inbodyChartCanvas").getContext("2d");

  if (inbodyChartInstance) {
    inbodyChartInstance.destroy();
  }

  if (state.inbodyHistory.length === 0) {
    return;
  }

  const cleanHistory = [...state.inbodyHistory].sort((a,b) => new Date(a.date) - new Date(b.date));
  const labels = cleanHistory.map(ib => formatDateShort(ib.date));
  const muscleData = cleanHistory.map(ib => ib.muscleMass);
  const fatData = cleanHistory.map(ib => ib.bodyFatMass);

  const isDark = document.body.classList.contains("dark-mode");
  const textColor = isDark ? "#94a3b8" : "#64748b";
  const gridColor = isDark ? "#1e293b" : "#e2e8f0";

  inbodyChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Masa Muscular (kg)",
          data: muscleData,
          borderColor: "#10b981",
          backgroundColor: "transparent",
          borderWidth: 3,
          tension: 0.35,
          pointBackgroundColor: "#10b981",
          pointBorderColor: isDark ? "#0f172a" : "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 5
        },
        {
          label: "Masa Grasa (kg)",
          data: fatData,
          borderColor: "#f43f5e",
          backgroundColor: "transparent",
          borderWidth: 3,
          tension: 0.35,
          pointBackgroundColor: "#f43f5e",
          pointBorderColor: isDark ? "#0f172a" : "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 5
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: { color: textColor, font: { family: 'Outfit', weight: '600' } }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: textColor, font: { family: 'Outfit' } }
        },
        y: {
          grid: { color: gridColor },
          ticks: { color: textColor, font: { family: 'Outfit' } }
        }
      }
    }
  });
}

// 12. PESTAÑA: CALCULADORA NUTRICIONAL INTERACTIVA
let activeGender = "male";

function initCalculator() {
  const gBtns = document.querySelectorAll(".gender-btn");
  gBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      gBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeGender = btn.getAttribute("data-gender");
    });
  });

  document.getElementById("calculatorForm").addEventListener("submit", (e) => {
    e.preventDefault();
    calculateMetabolicNeeds();
  });
  
  // Botón para aplicar objetivos directo al Dashboard
  document.getElementById("applyGoalsBtn").addEventListener("click", applyCalculatedGoalsToDashboard);
}

// Valores globales temporales del cálculo
let calculatedTargets = null;

function calculateMetabolicNeeds() {
  const age = parseInt(document.getElementById("calcAge").value);
  const height = parseFloat(document.getElementById("calcHeight").value);
  const weight = parseFloat(document.getElementById("calcWeight").value);
  const activity = parseFloat(document.getElementById("calcActivity").value);
  const goal = document.getElementById("calcGoal").value;

  // Mifflin-St Jeor
  let bmr = 0;
  if (activeGender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const tdee = bmr * activity;
  
  // Ajustes de Calorías Objetivo
  let targetCalories = 0;
  let desc = "";
  let pRatio = 0.3; // Ratios de macros (% de calorias)
  let cRatio = 0.4;
  let fRatio = 0.3;

  if (goal === "lose") {
    targetCalories = tdee - 500;
    // Evitar déficit extremo insalubre
    if (targetCalories < 1200) targetCalories = 1200;
    
    desc = "Se ha aplicado un déficit calórico controlado de -500 kcal diarias. Esta es la tasa estándar más saludable para promover la pérdida de tejido adiposo (grasa) mientras mantienes tu masa muscular. ¡Excelente para definición!";
    
    // Dieta alta en proteína para saciedad y conservación de músculo en definición
    pRatio = 0.40; // 40% protein
    cRatio = 0.30; // 30% carbs
    fRatio = 0.30; // 30% fat
  } else if (goal === "maintain") {
    targetCalories = tdee;
    desc = "Estás en balance energético (calorías de mantenimiento). Esto mantendrá tu peso estable, excelente si buscas mejorar tu rendimiento deportivo o realizar una recomposición corporal gradual sin variaciones drásticas de peso.";
    pRatio = 0.30;
    cRatio = 0.40;
    fRatio = 0.30;
  } else {
    targetCalories = tdee + 300;
    desc = "Se ha añadido un ligero superávit calórico de +300 kcal para facilitar un ambiente anabólico. Esto proveerá la energía necesaria para la síntesis de nuevas fibras musculares sin ganar exceso de grasa. ¡Perfecto para fase de volumen limpio!";
    pRatio = 0.30;
    cRatio = 0.45;
    fRatio = 0.25;
  }

  targetCalories = Math.round(targetCalories);
  bmr = Math.round(bmr);
  
  // Calcular gramos
  // 1g Protein = 4 kcal
  // 1g Carb = 4 kcal
  // 1g Fat = 9 kcal
  const pGrams = Math.round((targetCalories * pRatio) / 4);
  const cGrams = Math.round((targetCalories * cRatio) / 4);
  const fGrams = Math.round((targetCalories * fRatio) / 9);

  // Guardar cálculo temporal
  calculatedTargets = {
    calories: targetCalories,
    protein: pGrams,
    carbs: cGrams,
    fats: fGrams,
    water: Math.round(weight * 35) // Fórmula sugerida de agua: 35ml por kg de peso
  };

  // Mostrar resultados en UI
  document.getElementById("resBmr").innerHTML = `${bmr.toLocaleString()} <small>kcal</small>`;
  document.getElementById("resTdee").innerHTML = `${Math.round(tdee).toLocaleString()} <small>kcal</small>`;
  document.getElementById("resTargetCalories").innerHTML = `${targetCalories.toLocaleString()} <small>kcal/día</small>`;
  document.getElementById("resGoalDesc").innerText = desc;
  
  document.getElementById("resProtein").innerText = `${pGrams} g`;
  document.getElementById("resCarbs").innerText = `${cGrams} g`;
  document.getElementById("resFats").innerText = `${fGrams} g`;

  // Animaciones de las barras de porcentaje de resultados
  const fills = document.querySelectorAll(".mri-fill");
  fills[0].style.width = `${pRatio * 100}%`;
  fills[1].style.width = `${cRatio * 100}%`;
  fills[2].style.width = `${fRatio * 100}%`;

  // Cambiar pestaña del visualizador de resultados
  document.getElementById("resultsPlaceholder").classList.add("hidden");
  document.getElementById("resultsContent").classList.remove("hidden");
  
  // Scroll suave al card de resultados en móviles
  if (window.innerWidth <= 768) {
    document.getElementById("calcResultsCard").scrollIntoView({ behavior: "smooth" });
  }
}

function applyCalculatedGoalsToDashboard() {
  if (!calculatedTargets) return;

  state.settings.caloriesTarget = calculatedTargets.calories;
  state.settings.proteinTarget = calculatedTargets.protein;
  state.settings.carbsTarget = calculatedTargets.carbs;
  state.settings.fatsTarget = calculatedTargets.fats;
  state.settings.waterTarget = calculatedTargets.water;

  saveStateToLocalStorage();
  
  alert("¡Tus nuevos objetivos calóricos y de macronutrientes se han aplicado con éxito a tu Dashboard diario!");
  
  switchTab("dashboard-view");
}

// 13. PESTAÑA: CONFIGURACIÓN Y AJUSTES
function populateSettingsInputs() {
  document.getElementById("settingsGeminiKey").value = state.settings.geminiApiKey || "";
  
  // Objetivos manuales
  document.getElementById("setCalories").value = state.settings.caloriesTarget;
  document.getElementById("setWater").value = state.settings.waterTarget;
  document.getElementById("setProtein").value = state.settings.proteinTarget;
  document.getElementById("setCarbs").value = state.settings.carbsTarget;
  document.getElementById("setFats").value = state.settings.fatsTarget;

  updateApiKeyBadgeStatus();

  // Configurar enlace explicativo para Google Assistant
  const appUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
  document.getElementById("quickAddHelperUrl").innerText = `${appUrl}?quickadd=comida`;
}

function updateApiKeyBadgeStatus() {
  const badge = document.getElementById("apiKeyStatusMessage");
  const text = document.getElementById("apiKeyStatusText");

  if (state.settings.geminiApiKey) {
    badge.className = "api-status-badge active mt-3";
    text.innerText = "API Key Guardada y Activa";
  } else {
    badge.className = "api-status-badge inactive mt-3";
    text.innerText = "API Key no configurada";
  }
}

function initSettingsTab() {
  // Botón mostrar/ocultar clave
  document.getElementById("toggleShowKeyBtn").addEventListener("click", () => {
    const input = document.getElementById("settingsGeminiKey");
    const icon = document.getElementById("toggleKeyIcon");
    
    if (input.type === "password") {
      input.type = "text";
      icon.setAttribute("data-lucide", "eye-off");
    } else {
      input.type = "password";
      icon.setAttribute("data-lucide", "eye");
    }
    lucide.createIcons();
  });

  // Guardar clave API
  document.getElementById("saveApiKeyBtn").addEventListener("click", () => {
    const key = document.getElementById("settingsGeminiKey").value.trim();
    state.settings.geminiApiKey = key;
    saveStateToLocalStorage();
    updateApiKeyBadgeStatus();
    checkGeminiApiKeyWarning();
    alert("Clave de API de Gemini guardada correctamente de forma local.");
  });

  // Guardar objetivos manuales
  document.getElementById("settingsTargetsForm").addEventListener("submit", (e) => {
    e.preventDefault();
    state.settings.caloriesTarget = parseInt(document.getElementById("setCalories").value);
    state.settings.waterTarget = parseInt(document.getElementById("setWater").value);
    state.settings.proteinTarget = parseInt(document.getElementById("setProtein").value);
    state.settings.carbsTarget = parseInt(document.getElementById("setCarbs").value);
    state.settings.fatsTarget = parseInt(document.getElementById("setFats").value);

    saveStateToLocalStorage();
    alert("Tus metas nutricionales manuales han sido guardadas y aplicadas.");
    switchTab("dashboard-view");
  });

  // Opciones de Copia de Seguridad
  document.getElementById("exportJsonBtn").addEventListener("click", exportDataToJSON);
  
  // Disparar input de file oculto
  document.getElementById("importJsonTriggerBtn").addEventListener("click", () => {
    document.getElementById("importJsonFileInput").click();
  });

  document.getElementById("importJsonFileInput").addEventListener("change", importDataFromJSON);

  document.getElementById("exportCsvBtn").addEventListener("click", exportMealsToCSV);

  // Zona de peligro: Reiniciar app
  document.getElementById("resetAppBtn").addEventListener("click", () => {
    if (confirm("ATENCIÓN: Esto borrará de forma permanente todo tu historial de comidas, peso e InBody de este dispositivo. ¿Estás seguro de continuar?")) {
      if (confirm("Por favor, confirma una segunda vez. Esta acción es irreversible.")) {
        localStorage.clear();
        state = getMockInitialData();
        saveStateToLocalStorage();
        alert("La aplicación ha sido reiniciada a sus valores por defecto con éxito.");
        window.location.reload();
      }
    }
  });

  // Alternador de tema en barra lateral y cabecera
  document.getElementById("themeToggleBtnSide").addEventListener("click", toggleTheme);
  document.getElementById("themeToggleBtnHeader").addEventListener("click", toggleTheme);
}

// 14. EXPORTACIÓN / IMPORTACIÓN DE BACKUPS (JSON / CSV)
function exportDataToJSON() {
  const backup = {
    settings: state.settings,
    dailyLogs: state.dailyLogs,
    weightHistory: state.weightHistory,
    inbodyHistory: state.inbodyHistory
  };

  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = `nutrilife_backup_${getFormattedDateString(new Date())}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importDataFromJSON(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const backup = JSON.parse(evt.target.result);
      
      // Validar claves mínimas
      if (backup.settings && backup.dailyLogs && backup.weightHistory && backup.inbodyHistory) {
        state.settings = backup.settings;
        state.dailyLogs = backup.dailyLogs;
        state.weightHistory = backup.weightHistory;
        state.inbodyHistory = backup.inbodyHistory;
        
        saveStateToLocalStorage();
        alert("¡Copia de seguridad importada con éxito! La aplicación se actualizará.");
        window.location.reload();
      } else {
        throw new Error("Formato de respaldo JSON no válido.");
      }
    } catch (err) {
      console.error(err);
      alert("Error al leer el archivo de respaldo. Asegúrate de seleccionar un archivo JSON válido de NutriLife.");
    }
  };
  reader.readAsText(file);
}

function exportMealsToCSV() {
  let csvContent = "\uFEFF"; // BOM para asegurar caracteres especiales en Excel
  csvContent += "Fecha,Categoria,Alimento,Calorias(kcal),Proteinas(g),Carbohidratos(g),Grasas(g)\n";

  // Recorrer todas las fechas
  Object.keys(state.dailyLogs).sort().forEach(date => {
    const log = state.dailyLogs[date];
    if (log.foods && log.foods.length > 0) {
      log.foods.forEach(food => {
        // Escapar posibles comas en el nombre del alimento
        const nameEscaped = food.nombre.includes(",") ? `"${food.nombre}"` : food.nombre;
        csvContent += `${date},${food.categoria},${nameEscaped},${food.calorias},${food.proteinas},${food.carbohidratos},${food.grasas}\n`;
      });
    }
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = `nutrilife_comidas_export_${getFormattedDateString(new Date())}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 15. SOPORTE DE TEMAS CLARO Y OSCURO (THEMING)
function toggleTheme() {
  const currentTheme = document.body.classList.contains("dark-mode") ? "dark" : "light";
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  
  applyTheme(newTheme);
  
  state.settings.theme = newTheme;
  saveStateToLocalStorage();

  // Forzar redibujado de gráficos para adaptar colores de cuadrícula y etiquetas
  if (activeView === "inbody-view") {
    renderWeightChart();
    renderInbodyChart();
  }
}

function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark-mode");
    document.body.classList.remove("light-mode");
  } else {
    document.body.classList.add("light-mode");
    document.body.classList.remove("dark-mode");
  }
}

// 16. FUNCIONES DE UTILIDAD (FECHAS Y FORMATOS)

// Retorna YYYY-MM-DD
function getFormattedDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Retorna YYYY-MM-DD adecuado para inputs de tipo fecha
function getFormattedDatePickerString(date) {
  return getFormattedDateString(date);
}

// Formato dd/mm/aaaa
function formatDateFriendly(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// Formato dd/mm para etiquetas breves de gráficos
function formatDateShort(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}`;
}

// ==========================================================================
// 17. INICIALIZACIÓN GENERAL DE LA APP AL CARGAR LA PÁGINA
// ==========================================================================
document.addEventListener("DOMContentLoaded", async () => {
  // Cargar datos locales e inicializar variables
  initDatabase();
  
  // Inicializar Sincronización de Firebase (Login y Nube)
  initFirebaseSync();

  // Inicializar componentes
  initNavigation();
  initMealsNavigation();
  initInBodyAndWeight();
  initWaterTracker();
  initCalculator();
  initSettingsTab();
  
  // Renderizar vista inicial (Dashboard)
  renderDashboard();

  // Revisar si la app fue abierta por Oye Google / Asistente y procesar la comida asincrónicamente
  await checkAndProcessQuickAdd();
});

// ==========================================================================
// 18. INTEGRACIÓN E IMPLANTACIÓN DE LOGÍSTICA DE FIREBASE (CLOUD SYNC)
// ==========================================================================
const firebaseConfig = {
  apiKey: "AIzaSyCCTWC_cYybCA_vz8wbk3Bikt8x9LhDcNs",
  authDomain: "brandon-comidas.firebaseapp.com",
  projectId: "brandon-comidas",
  storageBucket: "brandon-comidas.firebasestorage.app",
  messagingSenderId: "539049735170",
  appId: "1:539049735170:web:49aa33cf2119a13738231b",
  measurementId: "G-7JEJLEJP9M"
};

let isFirebaseConnected = false;
let db = null;
let firebaseUnsubscribe = null;

function initFirebaseSync() {
  if (typeof firebase === "undefined") {
    console.warn("Firebase SDK no cargado. Funcionando en Modo Local.");
    return;
  }

  try {
    firebase.initializeApp(firebaseConfig);
    isFirebaseConnected = true;
    db = firebase.firestore();
    console.log("Firebase conectado exitosamente.");
    
    // Configurar escuchas de inicio de sesión
    firebase.auth().onAuthStateChanged(handleAuthStateChanged);
    
    // Capturar resultado de redirección de Google (muy importante para navegadores móviles/PWAs)
    firebase.auth().getRedirectResult().then((result) => {
      if (result && result.user) {
        console.log("Sesión iniciada vía redirección de Google:", result.user.email);
      }
    }).catch((error) => {
      console.error("Error al capturar redirección de Google:", error);
    });

    // Inicializar eventos de formularios de login
    initAuthUiEvents();
  } catch (error) {
    console.error("Error al inicializar Firebase:", error);
  }
}

function handleAuthStateChanged(user) {
  const body = document.body;
  const syncIndicator = document.getElementById("syncIndicator");
  const offlineModeActive = sessionStorage.getItem("nutrilife_offline_mode") === "true";

  if (user) {
    // Sesión iniciada
    body.classList.remove("auth-required");
    document.getElementById("authContainer").classList.add("hidden");
    syncIndicator.classList.remove("hidden");
    document.getElementById("cloudUserEmailText").innerText = `Sesión iniciada como: ${user.email}`;
    
    // Si se logueó con Google, guardar el nombre si no está configurado
    if (user.displayName && (!state.settings.name || state.settings.name === "Usuario")) {
      state.settings.name = user.displayName;
      saveStateToLocalStorage();
    }

    // Activar escucha en tiempo real de Firestore
    startRealtimeCloudSync(user.uid);
  } else {
    // Sesión no iniciada
    if (offlineModeActive) {
      // Si el usuario solicitó continuar sin cuenta
      body.classList.remove("auth-required");
      document.getElementById("authContainer").classList.add("hidden");
      syncIndicator.classList.add("hidden");
      document.getElementById("cloudUserEmailText").innerText = "Sesión iniciada como: local@offline";
    } else {
      // Requerir Login obligatoriamente
      body.classList.add("auth-required");
      document.getElementById("authContainer").classList.remove("hidden");
      
      // Asegurar que Lucide renderice los iconos del Login
      lucide.createIcons();
    }
  }
}

function initAuthUiEvents() {
  // Alternadores de contraseña
  document.getElementById("toggleShowLoginPassBtn").addEventListener("click", () => {
    const input = document.getElementById("loginPassword");
    const icon = document.getElementById("loginPassIcon");
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    icon.setAttribute("data-lucide", show ? "eye-off" : "eye");
    lucide.createIcons();
  });

  document.getElementById("toggleShowRegPassBtn").addEventListener("click", () => {
    const input = document.getElementById("registerPassword");
    const icon = document.getElementById("regPassIcon");
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    icon.setAttribute("data-lucide", show ? "eye-off" : "eye");
    lucide.createIcons();
  });

  // Alternadores de vista (Login vs Registro)
  document.getElementById("btnSwitchToRegister").addEventListener("click", () => {
    document.getElementById("authViewLogin").classList.add("hidden");
    document.getElementById("authViewRegister").classList.remove("hidden");
    lucide.createIcons();
  });

  document.getElementById("btnSwitchToLogin").addEventListener("click", () => {
    document.getElementById("authViewRegister").classList.add("hidden");
    document.getElementById("authViewLogin").classList.remove("hidden");
    lucide.createIcons();
  });

  // Continuar en Modo Local
  document.getElementById("btnContinueOffline").addEventListener("click", () => {
    sessionStorage.setItem("nutrilife_offline_mode", "true");
    document.body.classList.remove("auth-required");
    document.getElementById("syncIndicator").classList.add("hidden");
    document.getElementById("cloudUserEmailText").innerText = "Sesión iniciada como: local@offline";
    
    // Forzar renderizado
    renderDashboard();
  });

  // Iniciar Sesión con Google (Gmail)
  const btnGoogleLogin = document.getElementById("btnGoogleLogin");
  if (btnGoogleLogin) {
    btnGoogleLogin.addEventListener("click", async () => {
      if (typeof firebase === "undefined" || !isFirebaseConnected) {
        alert("El servicio de Firebase no está conectado o configurado correctamente.");
        return;
      }

      const provider = new firebase.auth.GoogleAuthProvider();
      btnGoogleLogin.disabled = true;
      const originalText = btnGoogleLogin.innerHTML;
      btnGoogleLogin.innerHTML = "<span>Iniciando sesión...</span>";

      try {
        sessionStorage.removeItem("nutrilife_offline_mode");
        // signInWithPopup funciona en la mayoría de navegadores de escritorio y celulares modernos
        await firebase.auth().signInWithPopup(provider);
        console.log("Sesión de Google iniciada exitosamente.");
        
        // Forzar recarga limpia para cargar Firestore desde cero con el nuevo usuario
        window.location.reload();
      } catch (err) {
        console.error("Error en Google Sign-In:", err);
        // Si el popup fue bloqueado por el navegador o cerrado, intentar con Redirección
        if (err.code === "auth/popup-blocked" || err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request") {
          try {
            await firebase.auth().signInWithRedirect(provider);
          } catch (redirectErr) {
            console.error("Error en Google Redirect:", redirectErr);
            alert(`Error de autenticación con Google (Redirección): ${redirectErr.message || redirectErr.code}`);
          }
        } else {
          alert(`Error al iniciar sesión con Google: ${err.message || err.code}`);
        }
      } finally {
        if (btnGoogleLogin) {
          btnGoogleLogin.disabled = false;
          btnGoogleLogin.innerHTML = originalText;
        }
      }
    });
  }

  // Iniciar Sesión Form
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const pass = document.getElementById("loginPassword").value;
    const btn = document.getElementById("btnLoginSubmit");
    
    btn.disabled = true;
    btn.innerText = "Ingresando...";

    try {
      await firebase.auth().signInWithEmailAndPassword(email, pass);
      sessionStorage.removeItem("nutrilife_offline_mode");
      document.getElementById("loginForm").reset();
      
      // Forzar recarga limpia
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert(`Error al ingresar: ${translateAuthError(err.code)}`);
    } finally {
      btn.disabled = false;
      btn.innerText = "Ingresar";
    }
  });

  // Crear Cuenta Form
  document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const pass = document.getElementById("registerPassword").value;
    const btn = document.getElementById("btnRegisterSubmit");
    
    btn.disabled = true;
    btn.innerText = "Registrando...";

    try {
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, pass);
      const user = userCredential.user;
      
      // Actualizar nombre en settings locales
      state.settings.name = name;
      
      // Crear base inicial en Firestore forzando migración local previa
      await db.collection("users").doc(user.uid).set({
        settings: state.settings,
        dailyLogs: state.dailyLogs,
        weightHistory: state.weightHistory,
        inbodyHistory: state.inbodyHistory,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      sessionStorage.removeItem("nutrilife_offline_mode");
      document.getElementById("registerForm").reset();
    } catch (err) {
      console.error(err);
      alert(`Error al registrarse: ${translateAuthError(err.code)}`);
    } finally {
      btn.disabled = false;
      btn.innerText = "Crear Cuenta";
    }
  });

  // Cerrar Sesión
  document.getElementById("logoutBtn").addEventListener("click", async () => {
    if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      try {
        if (firebaseUnsubscribe) firebaseUnsubscribe();
        await firebase.auth().signOut();
        sessionStorage.removeItem("nutrilife_offline_mode");
        // Forzar limpieza y redirección
        localStorage.clear();
        state = getMockInitialData();
        saveStateToLocalStorage();
        window.location.reload();
      } catch (err) {
        console.error("Error al cerrar sesión:", err);
      }
    }
  });
}

function translateAuthError(code) {
  switch (code) {
    case "auth/invalid-email": return "Correo electrónico no válido.";
    case "auth/user-disabled": return "Usuario deshabilitado.";
    case "auth/user-not-found": return "No se encontró ningún usuario con este correo.";
    case "auth/wrong-password": return "Contraseña incorrecta.";
    case "auth/email-already-in-use": return "Este correo electrónico ya está registrado.";
    case "auth/weak-password": return "La contraseña es muy débil (mínimo 6 caracteres).";
    default: return "Error de conexión con el servidor.";
  }
}

// Escucha en tiempo real sobre Firestore
function startRealtimeCloudSync(uid) {
  if (firebaseUnsubscribe) firebaseUnsubscribe();

  const syncIndicator = document.getElementById("syncIndicator");
  const iconSuccess = document.getElementById("syncIconSuccess");
  const iconLoading = document.getElementById("syncIconLoading");
  const iconError = document.getElementById("syncIconError");

  // Mostrar loading
  syncIndicator.classList.remove("hidden");
  iconSuccess.classList.add("hidden");
  iconLoading.classList.remove("hidden");

  // Suscribirse a los datos del documento del usuario en Firestore
  firebaseUnsubscribe = db.collection("users").doc(uid).onSnapshot((doc) => {
    isCloudSyncing = true;
    
    if (doc.exists) {
      const cloudData = doc.data();
      
      // Sincronizar en memoria y LocalStorage
      if (cloudData.settings) state.settings = cloudData.settings;
      if (cloudData.dailyLogs) state.dailyLogs = cloudData.dailyLogs;
      if (cloudData.weightHistory) state.weightHistory = cloudData.weightHistory;
      if (cloudData.inbodyHistory) state.inbodyHistory = cloudData.inbodyHistory;
      if (cloudData.favoriteFoods) state.favoriteFoods = cloudData.favoriteFoods;

      // Guardar localmente
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
      localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(state.dailyLogs));
      localStorage.setItem(STORAGE_KEYS.WEIGHT_HISTORY, JSON.stringify(state.weightHistory));
      localStorage.setItem(STORAGE_KEYS.INBODY_HISTORY, JSON.stringify(state.inbodyHistory));
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(state.favoriteFoods || []));

      // Actualizar visualizaciones
      if (activeView === "dashboard-view") renderDashboard();
      if (activeView === "meals-view") renderMealsView();
      if (activeView === "inbody-view") renderInbodyView();
      if (activeView === "settings-view") populateSettingsInputs();
      if (activeView === "history-view") renderHistoryView();
      
      // Aplicar tema dinámicamente si cambió externamente
      applyTheme(state.settings.theme || "light");
    } else {
      // Si el documento en la nube no existe, migrar datos locales inmediatamente
      db.collection("users").doc(uid).set({
        settings: state.settings,
        dailyLogs: state.dailyLogs,
        weightHistory: state.weightHistory,
        inbodyHistory: state.inbodyHistory,
        favoriteFoods: state.favoriteFoods || [],
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }

    isCloudSyncing = false;
    iconLoading.classList.add("hidden");
    iconSuccess.classList.remove("hidden");
  }, (error) => {
    console.error("Error en la escucha de Firestore:", error);
    isCloudSyncing = false;
    iconLoading.classList.add("hidden");
    iconError.classList.remove("hidden");
  });
}

function renderHistoryView() {
  const container = document.getElementById("historyTimelineList");
  if (!container) return;
  container.innerHTML = "";
  
  const dates = Object.keys(state.dailyLogs).sort().reverse();
  
  if (dates.length === 0) {
    container.innerHTML = `<p class="timeline-empty-day-text">No hay días registrados en tu historial de alimentación todavía.</p>`;
    return;
  }
  
  dates.forEach(dateStr => {
    const log = state.dailyLogs[dateStr];
    // Ignorar días sin comidas ni agua
    if ((!log.foods || log.foods.length === 0) && !log.waterConsumed) {
      return;
    }
    
    // Calcular totales de macros del día
    const totalKcal = Math.round(log.foods ? log.foods.reduce((sum, f) => sum + f.calorias, 0) : 0);
    const totalP = Math.round(log.foods ? log.foods.reduce((sum, f) => sum + f.proteinas, 0) : 0);
    const totalC = Math.round(log.foods ? log.foods.reduce((sum, f) => sum + f.carbohidratos, 0) : 0);
    const totalG = Math.round(log.foods ? log.foods.reduce((sum, f) => sum + f.grasas, 0) : 0);
    const totalW = log.waterConsumed || 0;
    
    // Metas
    const calGoal = state.settings.caloriesTarget || 2000;
    const pGoal = state.settings.proteinTarget || 140;
    const cGoal = state.settings.carbsTarget || 200;
    const fGoal = state.settings.fatsTarget || 65;
    const wGoal = state.settings.waterTarget || 2500;
    
    // Porcentajes
    const pctCal = Math.min(100, Math.round((totalKcal / calGoal) * 100)) || 0;
    const pctP = Math.min(100, Math.round((totalP / pGoal) * 100)) || 0;
    const pctC = Math.min(100, Math.round((totalC / cGoal) * 100)) || 0;
    const pctG = Math.min(100, Math.round((totalG / fGoal) * 100)) || 0;
    const pctW = Math.min(100, Math.round((totalW / wGoal) * 100)) || 0;
    
    const dayItem = document.createElement("div");
    dayItem.className = "timeline-day-item";
    
    // Parsear fecha legible
    let dateLabel = dateStr;
    try {
      const [y, m, d] = dateStr.split("-").map(Number);
      const dateObj = new Date(y, m - 1, d);
      const todayStr = getFormattedDateString(new Date());
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = getFormattedDateString(yesterday);
      
      if (dateStr === todayStr) {
        dateLabel = "Hoy";
      } else if (dateStr === yesterdayStr) {
        dateLabel = "Ayer";
      } else {
        const option = { weekday: 'long', day: 'numeric', month: 'short' };
        dateLabel = dateObj.toLocaleDateString("es-ES", option);
        dateLabel = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);
      }
    } catch (e) {
      console.error("Error al formatear fecha de historial:", e);
    }
    
    dayItem.innerHTML = `
      <div class="timeline-day-header">
        <span class="timeline-day-title">${dateLabel}</span>
        <div class="timeline-day-actions">
          <button type="button" class="btn-timeline-load" data-date="${dateStr}">Cargar Día</button>
          <div class="timeline-toggle-icon">
            <i data-lucide="chevron-down"></i>
          </div>
        </div>
      </div>
      
      <div class="timeline-day-summary">
        <div class="timeline-macro-stat">
          <span class="timeline-stat-label">Calorías</span>
          <span class="timeline-stat-val text-purple">${totalKcal} / ${calGoal} kcal</span>
          <div class="timeline-progress-mini">
            <div class="timeline-progress-fill" style="width: ${pctCal}%; background-color: var(--accent-purple);"></div>
          </div>
        </div>
        <div class="timeline-macro-stat">
          <span class="timeline-stat-label">Proteína</span>
          <span class="timeline-stat-val text-emerald">${totalP}g / ${pGoal}g</span>
          <div class="timeline-progress-mini">
            <div class="timeline-progress-fill" style="width: ${pctP}%; background-color: var(--accent-protein);"></div>
          </div>
        </div>
        <div class="timeline-macro-stat">
          <span class="timeline-stat-label">Carbos</span>
          <span class="timeline-stat-val text-orange">${totalC}g / ${cGoal}g</span>
          <div class="timeline-progress-mini">
            <div class="timeline-progress-fill" style="width: ${pctC}%; background-color: var(--accent-carbs);"></div>
          </div>
        </div>
        <div class="timeline-macro-stat">
          <span class="timeline-stat-label">Grasas</span>
          <span class="timeline-stat-val text-pink">${totalG}g / ${fGoal}g</span>
          <div class="timeline-progress-mini">
            <div class="timeline-progress-fill" style="width: ${pctG}%; background-color: var(--accent-fats);"></div>
          </div>
        </div>
        <div class="timeline-macro-stat">
          <span class="timeline-stat-label">Agua</span>
          <span class="timeline-stat-val text-blue">${totalW}ml / ${wGoal}ml</span>
          <div class="timeline-progress-mini">
            <div class="timeline-progress-fill" style="width: ${pctW}%; background-color: var(--accent-water);"></div>
          </div>
        </div>
      </div>
      
      <div class="timeline-day-details">
        <div class="timeline-meals-list">
          <!-- Populated dynamically -->
        </div>
      </div>
    `;
    
    // Rellenar lista de comidas por categoría
    const mealsList = dayItem.querySelector(".timeline-meals-list");
    const categories = ["Desayuno", "Almuerzo", "Cena", "Snack"];
    let hasAnyFood = false;
    
    categories.forEach(cat => {
      const catFoods = log.foods ? log.foods.filter(f => f.categoria === cat) : [];
      if (catFoods.length > 0) {
        hasAnyFood = true;
        const group = document.createElement("div");
        group.className = "timeline-meal-cat-group";
        
        let catIcon = "coffee";
        if (cat === "Almuerzo") catIcon = "utensils";
        if (cat === "Cena") catIcon = "moon";
        if (cat === "Snack") catIcon = "apple";
        
        let catTitleHtml = `
          <div class="timeline-meal-cat-title">
            <i data-lucide="${catIcon}" style="width: 14px; height: 14px;"></i>
            <span>${cat === "Snack" ? "Snacks" : cat}</span>
          </div>
        `;
        
        let foodsHtml = `<div class="timeline-meal-foods">`;
        catFoods.forEach(food => {
          foodsHtml += `<span class="timeline-food-tag">${food.nombre} (${Math.round(food.calorias)} kcal &middot; P: ${Math.round(food.proteinas)}g)</span>`;
        });
        foodsHtml += `</div>`;
        
        group.innerHTML = catTitleHtml + foodsHtml;
        mealsList.appendChild(group);
      }
    });
    
    if (!hasAnyFood) {
      mealsList.innerHTML = `<p class="timeline-empty-day-text">No se registraron alimentos (solo agua).</p>`;
    }
    
    // Toggle expandir
    const header = dayItem.querySelector(".timeline-day-header");
    header.addEventListener("click", (e) => {
      // Evitar que haga toggle si hicieron clic en el botón de Cargar Día
      if (e.target.classList.contains("btn-timeline-load")) return;
      dayItem.classList.toggle("expanded");
    });
    
    // Botón de Cargar Día
    const loadBtn = dayItem.querySelector(".btn-timeline-load");
    loadBtn.addEventListener("click", () => {
      const targetDateStr = loadBtn.getAttribute("data-date");
      const [y, m, d] = targetDateStr.split("-").map(Number);
      mealsActiveDate = new Date(y, m - 1, d);
      syncActiveDateUI();
      switchTab("meals-view");
    });
    
    container.appendChild(dayItem);
  });
  
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

let currentGeneratedRecipe = null;
let currentGeneratedMenu = null;

function initRecipesView() {
  if (window.recipesViewInitialized) return;
  window.recipesViewInitialized = true;

  document.getElementById("btnAiGenerateMenu").addEventListener("click", () => generateAiContent("menu"));
  document.getElementById("btnAiGenerateRemaining").addEventListener("click", () => generateAiContent("remaining"));
  document.getElementById("btnAiGenerateIngredients").addEventListener("click", () => generateAiContent("ingredients"));
}

async function generateAiContent(type) {
  const apiKey = state.settings.geminiApiKey;
  if (!apiKey) {
    alert("Por favor configure su Gemini API Key en la pestaña de Ajustes primero.");
    switchTab("settings-view");
    return;
  }

  const placeholder = document.getElementById("recipePlaceholder");
  const loader = document.getElementById("recipeLoader");
  const display = document.getElementById("recipeContentDisplay");

  placeholder.classList.add("hidden");
  display.classList.add("hidden");
  loader.classList.remove("hidden");
  
  // Custom loader messages based on action
  const statusText = loader.querySelector(".loader-status-text");
  if (type === "menu") statusText.innerText = "Diseñando un menú diario balanceado...";
  else if (type === "remaining") statusText.innerText = "Calculando receta para tus macros sobrantes...";
  else statusText.innerText = "Creando una receta gourmet con tus ingredientes...";

  try {
    let prompt = "";
    if (type === "menu") {
      const calGoal = state.settings.caloriesTarget || 2000;
      const pGoal = state.settings.proteinTarget || 140;
      const cGoal = state.settings.carbsTarget || 200;
      const fGoal = state.settings.fatsTarget || 65;
      
      prompt = `Diseña un menú diario completo y premium en español para un usuario con las siguientes metas diarias de nutrición:
      - Calorías objetivo: ${calGoal} kcal
      - Proteínas objetivo: ${pGoal}g
      - Carbohidratos objetivo: ${cGoal}g
      - Grasas objetivo: ${fGoal}g
      
      El menú debe constar de exactamente 4 comidas: "Desayuno", "Almuerzo", "Cena", y "Snack".
      Asegúrate de que cada comida tenga una descripción premium, ingredientes y macronutrientes realistas y coherentes.
      
      Devuelve un objeto JSON estructurado exactamente así:
      {
        "tipo": "menu",
        "titulo": "Menú Diario Premium Inteligente",
        "descripcion": "Una breve descripción del enfoque nutricional de este menú.",
        "caloriasTotales": ${calGoal},
        "proteinasTotales": ${pGoal},
        "carbohidratosTotales": ${cGoal},
        "grasasTotales": ${fGoal},
        "comidas": [
          {
            "categoria": "Desayuno",
            "nombre": "Nombre gourmet del desayuno",
            "calorias": 450,
            "proteinas": 30,
            "carbohidratos": 60,
            "grasas": 12,
            "detalles": "Detalles del plato, ingredientes principales y una pequeña descripción."
          },
          {
            "categoria": "Almuerzo",
            "nombre": "Nombre gourmet del almuerzo",
            "calorias": 650,
            "proteinas": 45,
            "carbohidratos": 60,
            "grasas": 18,
            "detalles": "Detalles..."
          },
          {
            "categoria": "Cena",
            "nombre": "Nombre gourmet de la cena",
            "calorias": 550,
            "proteinas": 40,
            "carbohidratos": 45,
            "grasas": 15,
            "detalles": "Detalles..."
          },
          {
            "categoria": "Snack",
            "nombre": "Nombre gourmet del snack",
            "calorias": 350,
            "proteinas": 25,
            "carbohidratos": 45,
            "grasas": 20,
            "detalles": "Detalles..."
          }
        ]
      }
      Devuelve estrictamente el JSON sin formato de código markdown o textos extras.`;
    } else if (type === "remaining") {
      const dateStr = getFormattedDateString(mealsActiveDate);
      const log = getDayLog(dateStr);
      
      const consumedKcal = Math.round(log.foods.reduce((sum, f) => sum + f.calorias, 0));
      const consumedP = Math.round(log.foods.reduce((sum, f) => sum + f.proteinas, 0));
      const consumedC = Math.round(log.foods.reduce((sum, f) => sum + f.carbohidratos, 0));
      const consumedG = Math.round(log.foods.reduce((sum, f) => sum + f.grasas, 0));
      
      const calGoal = state.settings.caloriesTarget || 2000;
      const pGoal = state.settings.proteinTarget || 140;
      const cGoal = state.settings.carbsTarget || 200;
      const fGoal = state.settings.fatsTarget || 65;
      
      const remainingKcal = Math.max(150, calGoal - consumedKcal);
      const remainingP = Math.max(10, pGoal - consumedP);
      const remainingC = Math.max(10, cGoal - consumedC);
      const remainingG = Math.max(5, fGoal - consumedG);
      
      prompt = `Crea una receta gourmet en español que se ajuste perfectamente a los siguientes macronutrientes restantes para el día del usuario:
      - Calorías restantes: ${remainingKcal} kcal
      - Proteínas restantes: ${remainingP}g
      - Carbohidratos restantes: ${remainingC}g
      - Grasas restantes: ${remainingG}g
      
      Devuelve un objeto JSON estructurado exactamente así:
      {
        "tipo": "receta",
        "titulo": "Nombre creativo gourmet de la receta",
        "calorias": ${remainingKcal},
        "proteinas": ${remainingP},
        "carbohidratos": ${remainingC},
        "grasas": ${remainingG},
        "descripcion": "Explicación de por qué este plato equilibra perfectamente tus metas de hoy.",
        "tiempoPreparacion": "25 min",
        "dificultad": "Fácil",
        "ingredientes": [
          "Ingrediente 1 con su porción o gramaje sugerido",
          "Ingrediente 2...",
          ...
        ],
        "preparacion": [
          "Paso 1 de preparación...",
          "Paso 2...",
          ...
        ]
      }
      Devuelve estrictamente el JSON sin formato de código markdown o textos extras.`;
    } else {
      const ingredientsText = document.getElementById("aiRecipeIngredients").value.trim();
      if (!ingredientsText) {
        alert("Por favor ingresa algunos ingredientes en el cuadro de búsqueda.");
        loader.classList.add("hidden");
        placeholder.classList.remove("hidden");
        return;
      }
      
      prompt = `Crea una receta de alta cocina saludable en español utilizando preferentemente los siguientes ingredientes o combinándolos de forma lógica y sabrosa: "${ingredientsText}".
      
      Devuelve un objeto JSON estructurado exactamente así:
      {
        "tipo": "receta",
        "titulo": "Nombre creativo gourmet de la receta",
        "calorias": 450,
        "proteinas": 30,
        "carbohidratos": 45,
        "grasas": 15,
        "descripcion": "Descripción del plato y cómo aprovecha los ingredientes aportados.",
        "tiempoPreparacion": "20 min",
        "dificultad": "Media",
        "ingredientes": [
          "Ingrediente 1 con su porción sugerida",
          "Ingrediente 2...",
          ...
        ],
        "preparacion": [
          "Paso 1 de preparación...",
          "Paso 2...",
          ...
        ]
      }
      Devuelve estrictamente el JSON sin formato de código markdown o textos extras.`;
    }

    const result = await callGeminiAPI(prompt);
    renderRecipeResult(result);
  } catch (error) {
    console.error("Error al generar contenido con Gemini:", error);
    alert("Hubo un error al generar la receta o menú con la IA de Gemini:\n\n" + error.message + "\n\nPor favor, verifica que tu nueva API Key de Gemini esté guardada correctamente en la pestaña de Ajustes y que tenga los permisos adecuados.");
    loader.classList.add("hidden");
    placeholder.classList.remove("hidden");
  }
}

async function callGeminiAPI(prompt) {
  const apiKey = state.settings.geminiApiKey;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json"
    }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw await handleGeminiResponseError(response);
  }

  const data = await response.json();
  let jsonStringResult = data.candidates[0].content.parts[0].text;
  
  if (jsonStringResult.includes("```json")) {
    jsonStringResult = jsonStringResult.split("```json")[1].split("```")[0].trim();
  } else if (jsonStringResult.includes("```")) {
    jsonStringResult = jsonStringResult.split("```")[1].split("```")[0].trim();
  }
  
  return JSON.parse(jsonStringResult);
}

function renderRecipeResult(data) {
  const loader = document.getElementById("recipeLoader");
  const display = document.getElementById("recipeContentDisplay");
  
  loader.classList.add("hidden");
  display.classList.remove("hidden");
  display.innerHTML = "";
  
  if (data.tipo === "receta") {
    currentGeneratedRecipe = data;
    currentGeneratedMenu = null;
    
    const time = data.tiempoPreparacion || "25 min";
    const difficulty = data.dificultad || "Fácil";
    
    display.innerHTML = `
      <div class="recipe-header-card">
        <h3 class="recipe-title-ia">${data.titulo}</h3>
        <p class="card-subtitle" style="margin-top: 0.25rem;">${data.descripcion}</p>
        
        <div class="recipe-meta-badges">
          <span class="recipe-badge recipe-badge-time">
            <i data-lucide="clock"></i>
            <span>${time}</span>
          </span>
          <span class="recipe-badge recipe-badge-difficulty">
            <i data-lucide="award"></i>
            <span>${difficulty}</span>
          </span>
        </div>
      </div>
      
      <div class="recipe-macros-strip">
        <div class="rm-item">
          <span class="rm-label">Calorías</span>
          <span class="rm-val kcal">${Math.round(data.calorias)} kcal</span>
        </div>
        <div class="rm-item">
          <span class="rm-label">Proteínas</span>
          <span class="rm-val prot">${Math.round(data.proteinas)}g</span>
        </div>
        <div class="rm-item">
          <span class="rm-label">Carbos</span>
          <span class="rm-val carb">${Math.round(data.carbohidratos)}g</span>
        </div>
        <div class="rm-item">
          <span class="rm-label">Grasas</span>
          <span class="rm-val gras">${Math.round(data.grasas)}g</span>
        </div>
      </div>
      
      <div>
        <div class="recipe-section-title">
          <i data-lucide="shopping-bag"></i>
          <span>Ingredientes</span>
        </div>
        <div class="recipe-ingredients-checklist">
          ${data.ingredientes.map((ing, i) => `
            <label class="recipe-ingredient-item">
              <input type="checkbox">
              <span>${ing}</span>
            </label>
          `).join("")}
        </div>
      </div>
      
      <div>
        <div class="recipe-section-title">
          <i data-lucide="chef-hat"></i>
          <span>Preparación</span>
        </div>
        <div class="recipe-prep-steps">
          ${data.preparacion.map((step, idx) => `
            <div class="recipe-step-item">
              <span class="recipe-step-num">${idx + 1}</span>
              <span class="recipe-step-text">${step}</span>
            </div>
          `).join("")}
        </div>
      </div>
      
      <div class="recipe-action-footer">
        <span class="recipe-action-label">¿Deseas añadir esta receta a tu diario de comidas?</span>
        <div class="recipe-add-btns">
          <button type="button" class="btn-recipe-add-journal" data-category="Desayuno">
            <i data-lucide="coffee"></i>
            <span>Desayuno</span>
          </button>
          <button type="button" class="btn-recipe-add-journal" data-category="Almuerzo">
            <i data-lucide="utensils"></i>
            <span>Almuerzo</span>
          </button>
          <button type="button" class="btn-recipe-add-journal" data-category="Cena">
            <i data-lucide="moon"></i>
            <span>Cena</span>
          </button>
          <button type="button" class="btn-recipe-add-journal" data-category="Snack">
            <i data-lucide="apple"></i>
            <span>Snack</span>
          </button>
        </div>
      </div>
    `;
    
    // Add event listeners to category buttons
    const addBtns = display.querySelectorAll(".btn-recipe-add-journal");
    addBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const cat = btn.getAttribute("data-category");
        addGeneratedRecipeToJournal(cat);
      });
    });
    
  } else if (data.tipo === "menu") {
    currentGeneratedMenu = data;
    currentGeneratedRecipe = null;
    
    display.innerHTML = `
      <div class="recipe-header-card">
        <h3 class="recipe-title-ia">${data.titulo}</h3>
        <p class="card-subtitle" style="margin-top: 0.25rem;">${data.descripcion}</p>
      </div>
      
      <div class="recipe-macros-strip">
        <div class="rm-item">
          <span class="rm-label">Total Kcal</span>
          <span class="rm-val kcal">${Math.round(data.caloriasTotales)} kcal</span>
        </div>
        <div class="rm-item">
          <span class="rm-label">Proteínas</span>
          <span class="rm-val prot">${Math.round(data.proteinasTotales)}g</span>
        </div>
        <div class="rm-item">
          <span class="rm-label">Carbos</span>
          <span class="rm-val carb">${Math.round(data.carbohidratosTotales)}g</span>
        </div>
        <div class="rm-item">
          <span class="rm-label">Grasas</span>
          <span class="rm-val gras">${Math.round(data.grasasTotales)}g</span>
        </div>
      </div>
      
      <div class="recipes-daily-menu">
        <div class="recipe-section-title">
          <i data-lucide="calendar"></i>
          <span>Distribución de Comidas</span>
        </div>
        
        ${data.comidas.map((meal, idx) => {
          let icon = "coffee";
          if (meal.categoria === "Almuerzo") icon = "utensils";
          if (meal.categoria === "Cena") icon = "moon";
          if (meal.categoria === "Snack") icon = "apple";
          
          return `
            <div class="recipe-menu-card">
              <div class="recipe-menu-card-header">
                <span class="recipe-menu-category">
                  <i data-lucide="${icon}" style="width:12px; height:12px; display:inline-block; vertical-align:middle; margin-right:4px;"></i>
                  ${meal.categoria}
                </span>
                <span class="text-purple font-semibold text-xs">${Math.round(meal.calorias)} kcal</span>
              </div>
              <h4 class="recipe-menu-title">${meal.nombre}</h4>
              <p class="text-sm mt-1" style="color: var(--text-secondary); line-height: 1.4;">${meal.detalles}</p>
              <div class="mt-2 text-xs font-medium" style="color: var(--text-muted);">
                P: ${Math.round(meal.proteinas)}g &middot; C: ${Math.round(meal.carbohidratos)}g &middot; G: ${Math.round(meal.grasas)}g
              </div>
              <div class="mt-3 flex justify-end">
                <button type="button" class="btn-recipe-add-journal btn-add-menu-meal-to-journal" data-index="${idx}">
                  <i data-lucide="plus" style="width:12px; height:12px;"></i>
                  <span>Añadir a ${meal.categoria}</span>
                </button>
              </div>
            </div>
          `;
        }).join("")}
      </div>
      
      <div class="recipe-action-footer mt-4">
        <span class="recipe-action-label">¿Deseas registrar todo el menú completo en tu diario?</span>
        <button type="button" class="btn btn-primary btn-full-width" id="btnAiAddEntireMenuToJournal">
          <i data-lucide="check-square"></i>
          <span>Registrar Menú Diario Completo</span>
        </button>
      </div>
    `;
    
    // Individual meals listeners
    const individualBtns = display.querySelectorAll(".btn-add-menu-meal-to-journal");
    individualBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-index"));
        addMenuMealToJournal(idx);
      });
    });
    
    // Entire menu listener
    document.getElementById("btnAiAddEntireMenuToJournal").addEventListener("click", addEntireMenuToJournal);
  }
  
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

function addGeneratedRecipeToJournal(category) {
  if (!currentGeneratedRecipe) return;
  const dateStr = getFormattedDateString(mealsActiveDate);
  
  const newFood = {
    id: Date.now(),
    nombre: currentGeneratedRecipe.titulo,
    calorias: currentGeneratedRecipe.calorias,
    proteinas: currentGeneratedRecipe.proteinas,
    carbohidratos: currentGeneratedRecipe.carbohidratos,
    grasas: currentGeneratedRecipe.grasas,
    categoria: category
  };
  
  addFoodItem(dateStr, newFood);
  alert(`"${currentGeneratedRecipe.titulo}" agregada con éxito a tu ${category.toLowerCase()}.`);
}

function addMenuMealToJournal(index) {
  if (!currentGeneratedMenu || !currentGeneratedMenu.comidas[index]) return;
  const meal = currentGeneratedMenu.comidas[index];
  const dateStr = getFormattedDateString(mealsActiveDate);
  
  const newFood = {
    id: Date.now() + Math.floor(Math.random() * 100),
    nombre: meal.nombre,
    calorias: meal.calorias,
    proteinas: meal.proteinas,
    carbohidratos: meal.carbohidratos,
    grasas: meal.grasas,
    categoria: meal.categoria
  };
  
  addFoodItem(dateStr, newFood);
  alert(`"${meal.nombre}" añadida a tu ${meal.categoria.toLowerCase()}.`);
}

function addEntireMenuToJournal() {
  if (!currentGeneratedMenu) return;
  const dateStr = getFormattedDateString(mealsActiveDate);
  
  currentGeneratedMenu.comidas.forEach((meal, idx) => {
    const newFood = {
      id: Date.now() + idx + Math.floor(Math.random() * 100),
      nombre: meal.nombre,
      calorias: meal.calorias,
      proteinas: meal.proteinas,
      carbohidratos: meal.carbohidratos,
      grasas: meal.grasas,
      categoria: meal.categoria
    };
    addFoodItem(dateStr, newFood);
  });
  
  alert("Todo el menú diario ha sido registrado exitosamente en tu diario de comidas.");
}


