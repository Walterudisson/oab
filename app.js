const STORAGE_KEY = "cadernoOabProgressV2";
const LEGACY_STORAGE_KEY = "cadernoOabProgressV1";

const defaultProgress = {
  questionStates: {},
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
let currentQuestionId = null;
let activeFilter = "all";
let toastTimer;
let timerSeconds = 0;
let timerInterval = null;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const elements = {
  sidebar: $("#sidebar"),
  menuButton: $("#menuButton"),
  pageTitle: $("#pageTitle"),
  navItems: $$(".nav-item"),
  pages: $$(".page"),
  startTrainingButton: $("#startTrainingButton"),
  resetDemoButton: $("#resetDemoButton"),
  openNextQuestion: $("#openNextQuestion"),
  goToQuestionsButton: $("#goToQuestionsButton"),
  todayLabel: $("#todayLabel"),
  resolvedCount: $("#resolvedCount"),
  reviewCount: $("#reviewCount"),
  accuracyValue: $("#accuracyValue"),
  weeklyDone: $("#weeklyDone"),
  streakValue: $("#streakValue"),
  questionTotal: $("#questionTotal"),
  sidebarProgressText: $("#sidebarProgressText"),
  sidebarProgressBar: $("#sidebarProgressBar"),
  donutChart: $("#donutChart"),
  donutPercent: $("#donutPercent"),
  legendResolved: $("#legendResolved"),
  legendReview: $("#legendReview"),
  legendPending: $("#legendPending"),
  nextQuestionNumber: $("#nextQuestionNumber"),
  nextQuestionTitle: $("#nextQuestionTitle"),
  nextQuestionTheme: $("#nextQuestionTheme"),
  questionList: $("#questionList"),
  questionListEmpty: $("#questionListEmpty"),
  questionSearch: $("#questionSearch"),
  statusFilters: $("#statusFilters"),
  questionSummaryCount: $("#questionSummaryCount"),
  filterAllCount: $("#filterAllCount"),
  filterNewCount: $("#filterNewCount"),
  filterResolvedCount: $("#filterResolvedCount"),
  filterReviewCount: $("#filterReviewCount"),
  reviewPageCount: $("#reviewPageCount"),
  reviewQuestionList: $("#reviewQuestionList"),
  reviewEmpty: $("#reviewEmpty"),
  trainingBackButton: $("#trainingBackButton"),
  trainingEmpty: $("#trainingEmpty"),
  trainingContent: $("#trainingContent"),
  trainingExam: $("#trainingExam"),
  trainingQuestionNumber: $("#trainingQuestionNumber"),
  trainingTitle: $("#trainingTitle"),
  trainingTheme: $("#trainingTheme"),
  trainingStatus: $("#trainingStatus"),
  trainingStatement: $("#trainingStatement"),
  trainingItems: $("#trainingItems"),
  markResolvedButton: $("#markResolvedButton"),
  markReviewButton: $("#markReviewButton"),
  selfEvaluation: $("#selfEvaluation"),
  scoreButtons: $$(".score-buttons button"),
  previousQuestionButton: $("#previousQuestionButton"),
  nextQuestionButton: $("#nextQuestionButton"),
  questionPosition: $("#questionPosition"),
  timerDisplay: $("#timerDisplay"),
  timerToggle: $("#timerToggle"),
  timerReset: $("#timerReset"),
  toast: $("#toast")
};

init();

async function init() {
  setTodayLabel();
  registerEvents();
  await loadQuestions();
  migrateLegacyProgress();
  updateAccessStreak();
  renderAll();
}

function registerEvents() {
  elements.navItems.forEach((item) => item.addEventListener("click", () => navigateTo(item.dataset.page)));
  elements.menuButton.addEventListener("click", () => elements.sidebar.classList.toggle("open"));
  elements.startTrainingButton.addEventListener("click", openRecommendedQuestion);
  elements.openNextQuestion.addEventListener("click", openRecommendedQuestion);
  elements.goToQuestionsButton.addEventListener("click", () => navigateTo("questoes"));
  elements.trainingBackButton.addEventListener("click", () => navigateTo("questoes"));

  elements.resetDemoButton.addEventListener("click", () => {
    progress = { ...defaultProgress, questionStates: {}, lastAccess: formatDateKey(new Date()), streak: 1 };
    saveProgress();
    stopTimer();
    resetTimer();
    currentQuestionId = null;
    renderAll();
    renderTraining();
    showToast("Progresso local zerado.");
  });

  elements.questionSearch.addEventListener("input", renderQuestionList);
  elements.statusFilters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    activeFilter = button.dataset.filter;
    $$(".filter-chip").forEach((chip) => chip.classList.toggle("active", chip === button));
    renderQuestionList();
  });

  elements.questionList.addEventListener("click", handleQuestionCardClick);
  elements.reviewQuestionList.addEventListener("click", handleQuestionCardClick);
  elements.markResolvedButton.addEventListener("click", markCurrentResolved);
  elements.markReviewButton.addEventListener("click", toggleCurrentReview);
  elements.scoreButtons.forEach((button) => button.addEventListener("click", () => setSelfScore(Number(button.dataset.score))));
  elements.previousQuestionButton.addEventListener("click", () => moveQuestion(-1));
  elements.nextQuestionButton.addEventListener("click", () => moveQuestion(1));
  elements.timerToggle.addEventListener("click", toggleTimer);
  elements.timerReset.addEventListener("click", resetTimer);

  document.addEventListener("click", (event) => {
    if (window.innerWidth > 820) return;
    if (!elements.sidebar.classList.contains("open")) return;
    if (elements.sidebar.contains(event.target) || elements.menuButton.contains(event.target)) return;
    elements.sidebar.classList.remove("open");
  });
}

function navigateTo(pageName) {
  elements.navItems.forEach((item) => item.classList.toggle("active", item.dataset.page === pageName));
  elements.pages.forEach((page) => page.classList.toggle("active", page.id === `page-${pageName}`));
  elements.pageTitle.textContent = pageTitles[pageName] ?? "Caderno OAB";
  elements.sidebar.classList.remove("open");
  if (pageName === "questoes") renderQuestionList();
  if (pageName === "revisao") renderReviewList();
  if (pageName === "treino") renderTraining();
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

function renderAll() {
  renderDashboard();
  renderFilterCounts();
  renderQuestionList();
  renderReviewList();
}

function renderDashboard() {
  const total = questions.length || 60;
  const states = questions.map((q) => getQuestionState(q.id));
  const resolved = states.filter((s) => s.status === "resolved" || s.status === "review").length;
  const review = states.filter((s) => s.status === "review").length;
  const scored = states.filter((s) => Number.isInteger(s.score) && s.score > 0);
  const scorePoints = scored.reduce((sum, s) => sum + s.score, 0);
  const accuracy = scored.length ? Math.round((scorePoints / (scored.length * 2)) * 100) : 0;
  const pending = Math.max(total - resolved, 0);
  const completion = total ? Math.round((resolved / total) * 100) : 0;

  elements.resolvedCount.textContent = resolved;
  elements.reviewCount.textContent = review;
  elements.accuracyValue.textContent = `${accuracy}%`;
  elements.weeklyDone.textContent = Math.min(progress.weeklyDone || 0, 10);
  elements.streakValue.textContent = progress.streak || 0;
  elements.questionTotal.textContent = total;
  elements.sidebarProgressText.textContent = `${completion}%`;
  elements.sidebarProgressBar.style.width = `${completion}%`;
  elements.donutPercent.textContent = `${completion}%`;
  elements.donutChart.style.setProperty("--progress", `${completion * 3.6}deg`);
  elements.legendResolved.textContent = resolved;
  elements.legendReview.textContent = review;
  elements.legendPending.textContent = pending;

  const nextQuestion = getRecommendedQuestion();
  if (nextQuestion) {
    elements.nextQuestionNumber.textContent = String(nextQuestion.numero).padStart(2, "0");
    elements.nextQuestionTitle.textContent = nextQuestion.titulo;
    elements.nextQuestionTheme.textContent = nextQuestion.tema;
  }
}

function renderFilterCounts() {
  const statuses = questions.map((q) => getQuestionState(q.id).status);
  elements.questionSummaryCount.textContent = questions.length;
  elements.filterAllCount.textContent = questions.length;
  elements.filterNewCount.textContent = statuses.filter((s) => s === "new").length;
  elements.filterResolvedCount.textContent = statuses.filter((s) => s === "resolved").length;
  elements.filterReviewCount.textContent = statuses.filter((s) => s === "review").length;
  elements.reviewPageCount.textContent = statuses.filter((s) => s === "review").length;
}

function renderQuestionList() {
  const search = normalize(elements.questionSearch.value.trim());
  const filtered = questions.filter((question) => {
    const status = getQuestionState(question.id).status;
    const matchesFilter = activeFilter === "all" || status === activeFilter;
    const haystack = normalize(`${question.titulo} ${question.tema} ${question.exame} ${(question.tags || []).join(" ")}`);
    return matchesFilter && (!search || haystack.includes(search));
  });

  elements.questionList.innerHTML = filtered.map(questionCardTemplate).join("");
  elements.questionListEmpty.classList.toggle("hidden", filtered.length > 0);
}

function renderReviewList() {
  const reviewQuestions = questions.filter((q) => getQuestionState(q.id).status === "review");
  elements.reviewQuestionList.innerHTML = reviewQuestions.map(questionCardTemplate).join("");
  elements.reviewEmpty.classList.toggle("hidden", reviewQuestions.length > 0);
}

function questionCardTemplate(question) {
  const state = getQuestionState(question.id);
  const statusLabel = state.status === "resolved" ? "Resolvida" : state.status === "review" ? "Revisar" : "Nova";
  const actionLabel = state.status === "new" ? "Resolver" : "Abrir";
  const statusClass = state.status === "resolved" ? "status-resolved" : state.status === "review" ? "status-review" : "status-new";
  const tags = (question.tags || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");

  return `
    <article class="question-card" data-question-id="${escapeHtml(question.id)}">
      <div class="question-card-top">
        <div><span class="question-exam">${escapeHtml(question.exame)}</span><span class="question-number">Questão ${String(question.numero).padStart(2, "0")}</span></div>
        <span class="question-status ${statusClass}">${statusLabel}</span>
      </div>
      <div class="question-card-body">
        <h3>${escapeHtml(question.tema)}</h3>
        <p>${escapeHtml(question.resumo || question.titulo)}</p>
        <div class="tag-row">${tags}</div>
      </div>
      <div class="question-card-footer">
        <span>${state.score === 2 ? "Autoavaliação: boa" : state.score === 1 ? "Autoavaliação: parcial" : "Direito do Trabalho"}</span>
        <button class="card-action" data-action="open">${actionLabel} →</button>
      </div>
    </article>`;
}

function handleQuestionCardClick(event) {
  const button = event.target.closest("[data-action='open']");
  if (!button) return;
  const card = button.closest("[data-question-id]");
  openQuestion(card.dataset.questionId);
}

function openRecommendedQuestion() {
  const question = getRecommendedQuestion();
  if (question) openQuestion(question.id);
}

function getRecommendedQuestion() {
  return questions.find((q) => getQuestionState(q.id).status === "new")
    || questions.find((q) => getQuestionState(q.id).status === "review")
    || questions[0];
}

function openQuestion(questionId) {
  currentQuestionId = questionId;
  stopTimer();
  resetTimer();
  renderTraining();
  navigateTo("treino");
}

function renderTraining() {
  const question = questions.find((q) => q.id === currentQuestionId);
  elements.trainingEmpty.classList.toggle("hidden", Boolean(question));
  elements.trainingContent.classList.toggle("hidden", !question);
  if (!question) return;

  const state = getQuestionState(question.id);
  const index = questions.findIndex((q) => q.id === question.id);
  elements.trainingExam.textContent = question.exame;
  elements.trainingQuestionNumber.textContent = `Questão ${String(question.numero).padStart(2, "0")}`;
  elements.trainingTitle.textContent = question.titulo;
  elements.trainingTheme.textContent = question.tema;
  elements.trainingStatement.innerHTML = question.enunciado.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
  elements.trainingItems.innerHTML = question.itens.map((item, itemIndex) => `<div class="question-item"><span>${String.fromCharCode(65 + itemIndex)}</span><p>${escapeHtml(item)}</p></div>`).join("");
  elements.questionPosition.textContent = `${index + 1} de ${questions.length}`;
  elements.previousQuestionButton.disabled = index <= 0;
  elements.nextQuestionButton.disabled = index >= questions.length - 1;

  applyTrainingStatus(state);
}

function applyTrainingStatus(state) {
  const label = state.status === "resolved" ? "Resolvida" : state.status === "review" ? "Revisar" : "Nova";
  elements.trainingStatus.textContent = label;
  elements.trainingStatus.className = `question-status ${state.status === "resolved" ? "status-resolved" : state.status === "review" ? "status-review" : "status-new"}`;
  elements.markReviewButton.textContent = state.status === "review" ? "✓ Remover da revisão" : "↻ Marcar para revisão";
  elements.markResolvedButton.textContent = state.status === "new" ? "✓ Concluí minha resposta manuscrita" : "✓ Marcar como resolvida";
  elements.selfEvaluation.classList.toggle("hidden", state.status === "new");
  elements.scoreButtons.forEach((button) => button.classList.toggle("selected", Number(button.dataset.score) === state.score));
}

function markCurrentResolved() {
  if (!currentQuestionId) return;
  const state = getQuestionState(currentQuestionId);
  const firstCompletion = state.status === "new";
  setQuestionState(currentQuestionId, { status: "resolved", completedAt: new Date().toISOString() });
  if (firstCompletion) progress.weeklyDone = (progress.weeklyDone || 0) + 1;
  saveProgress();
  renderAll();
  renderTraining();
  showToast("Questão marcada como resolvida.");
}

function toggleCurrentReview() {
  if (!currentQuestionId) return;
  const state = getQuestionState(currentQuestionId);
  const firstCompletion = state.status === "new";
  const newStatus = state.status === "review" ? "resolved" : "review";
  setQuestionState(currentQuestionId, { status: newStatus, completedAt: state.completedAt || new Date().toISOString() });
  if (firstCompletion) progress.weeklyDone = (progress.weeklyDone || 0) + 1;
  saveProgress();
  renderAll();
  renderTraining();
  showToast(newStatus === "review" ? "Questão adicionada à revisão." : "Questão removida da revisão.");
}

function setSelfScore(score) {
  if (!currentQuestionId) return;
  setQuestionState(currentQuestionId, { score });
  saveProgress();
  renderDashboard();
  renderQuestionList();
  renderReviewList();
  renderTraining();
  showToast(score === 2 ? "Autoavaliação registrada: boa." : score === 1 ? "Autoavaliação registrada: parcial." : "Autoavaliação limpa.");
}

function moveQuestion(direction) {
  const index = questions.findIndex((q) => q.id === currentQuestionId);
  const next = questions[index + direction];
  if (!next) return;
  currentQuestionId = next.id;
  stopTimer();
  resetTimer();
  renderTraining();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getQuestionState(questionId) {
  return { status: "new", score: 0, completedAt: null, ...(progress.questionStates[questionId] || {}) };
}

function setQuestionState(questionId, patch) {
  progress.questionStates[questionId] = { ...getQuestionState(questionId), ...patch };
}

function toggleTimer() {
  if (timerInterval) {
    stopTimer();
    return;
  }
  timerInterval = window.setInterval(() => {
    timerSeconds += 1;
    renderTimer();
  }, 1000);
  elements.timerToggle.textContent = "Pausar";
}

function stopTimer() {
  if (timerInterval) window.clearInterval(timerInterval);
  timerInterval = null;
  elements.timerToggle.textContent = "Iniciar";
}

function resetTimer() {
  stopTimer();
  timerSeconds = 0;
  renderTimer();
}

function renderTimer() {
  const minutes = String(Math.floor(timerSeconds / 60)).padStart(2, "0");
  const seconds = String(timerSeconds % 60).padStart(2, "0");
  elements.timerDisplay.textContent = `${minutes}:${seconds}`;
}

function setTodayLabel() {
  const formatter = new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
  elements.todayLabel.textContent = formatter.format(new Date()).replace(".", "");
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
  progress.streak = progress.lastAccess === formatDateKey(yesterday) ? Math.max(progress.streak || 0, 0) + 1 : 1;
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
    return { ...defaultProgress, ...stored, questionStates: stored?.questionStates || {} };
  } catch {
    return { ...defaultProgress, questionStates: {} };
  }
}

function migrateLegacyProgress() {
  if (Object.keys(progress.questionStates).length) return;
  try {
    const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY));
    if (!legacy || !legacy.resolved) return;
    questions.slice(0, Math.min(legacy.resolved, questions.length)).forEach((question, index) => {
      progress.questionStates[question.id] = {
        status: index < (legacy.review || 0) ? "review" : "resolved",
        score: index < (legacy.correct || 0) ? 2 : 0,
        completedAt: null
      };
    });
    progress.weeklyDone = legacy.weeklyDone || 0;
    progress.streak = legacy.streak || 0;
    progress.lastAccess = legacy.lastAccess || null;
    saveProgress();
  } catch {
    // Migração opcional: se o dado legado estiver inválido, seguimos com o V2 vazio.
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function showToast(message) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  toastTimer = setTimeout(() => elements.toast.classList.remove("show"), 2200);
}

function normalize(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" }[char]));
}

function createFallbackQuestions() {
  return Array.from({ length: 60 }, (_, index) => ({
    id: `q${String(index + 1).padStart(2, "0")}`,
    numero: index + 1,
    exame: "Banco de treino",
    titulo: "Questão discursiva",
    tema: "Direito do Trabalho",
    resumo: "Questão de treino.",
    tags: ["Trabalho"],
    enunciado: ["Conteúdo indisponível no momento."],
    itens: ["Apresente a solução jurídica adequada e fundamente."]
  }));
}
