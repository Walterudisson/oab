const STORAGE_KEY = "cadernoOabProgressV1";

const defaultProgress = {
  resolved: 0,
  review: 0,
  correct: 0,
  weeklyDone: 0,
  streak: 0,
  lastAccess: null
};

const pageTitles = {
  inicio: "Visão geral",
  treino: "Meu treino",
  questoes: "Banco de questões",
  revisao: "Revisão",
  plano: "Plano de estudo"
};

let progress = loadProgress();
let questions = [];
let toastTimer;

const elements = {
  sidebar: document.querySelector("#sidebar"),
  menuButton: document.querySelector("#menuButton"),
  pageTitle: document.querySelector("#pageTitle"),
  navItems: [...document.querySelectorAll(".nav-item")],
  pages: [...document.querySelectorAll(".page")],
  startTrainingButton: document.querySelector("#startTrainingButton"),
  resetDemoButton: document.querySelector("#resetDemoButton"),
  openNextQuestion: document.querySelector("#openNextQuestion"),
  todayLabel: document.querySelector("#todayLabel"),
  resolvedCount: document.querySelector("#resolvedCount"),
  reviewCount: document.querySelector("#reviewCount"),
  accuracyValue: document.querySelector("#accuracyValue"),
  weeklyDone: document.querySelector("#weeklyDone"),
  streakValue: document.querySelector("#streakValue"),
  questionTotal: document.querySelector("#questionTotal"),
  sidebarProgressText: document.querySelector("#sidebarProgressText"),
  sidebarProgressBar: document.querySelector("#sidebarProgressBar"),
  donutChart: document.querySelector("#donutChart"),
  donutPercent: document.querySelector("#donutPercent"),
  legendResolved: document.querySelector("#legendResolved"),
  legendReview: document.querySelector("#legendReview"),
  legendPending: document.querySelector("#legendPending"),
  nextQuestionNumber: document.querySelector("#nextQuestionNumber"),
  nextQuestionTitle: document.querySelector("#nextQuestionTitle"),
  nextQuestionTheme: document.querySelector("#nextQuestionTheme"),
  toast: document.querySelector("#toast")
};

init();

async function init() {
  setTodayLabel();
  registerEvents();
  await loadQuestions();
  updateAccessStreak();
  renderDashboard();
}

function registerEvents() {
  elements.navItems.forEach((item) => {
    item.addEventListener("click", () => navigateTo(item.dataset.page));
  });

  elements.menuButton.addEventListener("click", () => {
    elements.sidebar.classList.toggle("open");
  });

  elements.startTrainingButton.addEventListener("click", () => navigateTo("treino"));
  elements.openNextQuestion.addEventListener("click", () => navigateTo("treino"));

  elements.resetDemoButton.addEventListener("click", () => {
    progress = { ...defaultProgress, lastAccess: new Date().toISOString().slice(0, 10) };
    saveProgress();
    renderDashboard();
    showToast("Progresso local zerado.");
  });

  document.addEventListener("click", (event) => {
    if (window.innerWidth > 820) return;
    if (!elements.sidebar.classList.contains("open")) return;
    if (elements.sidebar.contains(event.target) || elements.menuButton.contains(event.target)) return;
    elements.sidebar.classList.remove("open");
  });
}

function navigateTo(pageName) {
  elements.navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.page === pageName);
  });

  elements.pages.forEach((page) => {
    page.classList.toggle("active", page.id === `page-${pageName}`);
  });

  elements.pageTitle.textContent = pageTitles[pageName] ?? "Caderno OAB";
  elements.sidebar.classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function loadQuestions() {
  try {
    const response = await fetch("./data/questoes.json");
    if (!response.ok) throw new Error("Falha ao carregar questões");
    questions = await response.json();
  } catch (error) {
    questions = createFallbackQuestions();
    console.warn(error);
  }
}

function renderDashboard() {
  const total = questions.length || 60;
  const resolved = Math.min(progress.resolved, total);
  const review = Math.min(progress.review, resolved);
  const pending = Math.max(total - resolved, 0);
  const accuracy = resolved > 0 ? Math.round((progress.correct / resolved) * 100) : 0;
  const completion = total > 0 ? Math.round((resolved / total) * 100) : 0;

  elements.resolvedCount.textContent = resolved;
  elements.reviewCount.textContent = review;
  elements.accuracyValue.textContent = `${accuracy}%`;
  elements.weeklyDone.textContent = Math.min(progress.weeklyDone, 10);
  elements.streakValue.textContent = progress.streak;
  elements.questionTotal.textContent = total;

  elements.sidebarProgressText.textContent = `${completion}%`;
  elements.sidebarProgressBar.style.width = `${completion}%`;

  elements.donutPercent.textContent = `${completion}%`;
  elements.donutChart.style.setProperty("--progress", `${completion * 3.6}deg`);

  elements.legendResolved.textContent = resolved;
  elements.legendReview.textContent = review;
  elements.legendPending.textContent = pending;

  const nextQuestion = questions[resolved] ?? questions[0];
  if (nextQuestion) {
    elements.nextQuestionNumber.textContent = String(nextQuestion.numero).padStart(2, "0");
    elements.nextQuestionTitle.textContent = nextQuestion.titulo;
    elements.nextQuestionTheme.textContent = nextQuestion.tema;
  }
}

function setTodayLabel() {
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short"
  });

  const formatted = formatter.format(new Date()).replace(".", "");
  elements.todayLabel.textContent = formatted;
}

function updateAccessStreak() {
  const today = new Date();
  const todayKey = formatDateKey(today);

  if (!progress.lastAccess) {
    progress.streak = 1;
    progress.lastAccess = todayKey;
    saveProgress();
    return;
  }

  if (progress.lastAccess === todayKey) return;

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  progress.streak = progress.lastAccess === formatDateKey(yesterday)
    ? Math.max(progress.streak, 0) + 1
    : 1;

  progress.lastAccess = todayKey;
  saveProgress();
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function loadProgress() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...defaultProgress, ...stored };
  } catch {
    return { ...defaultProgress };
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function showToast(message) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("show");

  toastTimer = setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 2200);
}

function createFallbackQuestions() {
  return Array.from({ length: 60 }, (_, index) => ({
    numero: index + 1,
    titulo: "Questão discursiva",
    tema: "Direito do Trabalho"
  }));
}
