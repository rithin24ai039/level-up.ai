const STORAGE_KEY = "levelup-dashboard-v1";
const defaultTasks = [
  { id: 1, title: "Plan today's priorities", category: "PERSONAL", done: false },
  { id: 2, title: "Complete a workout", category: "FITNESS", done: false },
  { id: 3, title: "Eat a protein-rich meal", category: "NUTRITION", done: false },
  { id: 4, title: "Learn something new for 30 minutes", category: "LEARNING", done: false },
  { id: 5, title: "Review today's progress", category: "PERSONAL", done: false }
];
let state = loadState();

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.tasks)) return saved;
  } catch (error) { console.warn("Could not load saved dashboard data.", error); }
  return { tasks: defaultTasks, history: {} };
}
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function todayKey(date = new Date()) {
  return [date.getFullYear(), String(date.getMonth()+1).padStart(2,"0"), String(date.getDate()).padStart(2,"0")].join("-");
}
function recordToday() {
  const total = state.tasks.length;
  const done = state.tasks.filter(task => task.done).length;
  state.history[todayKey()] = total ? Math.round(done / total * 100) : 0;
  saveState();
}
function renderTasks() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";
  if (!state.tasks.length) {
    list.innerHTML = '<div class="empty-state">No tasks yet. Add your first task below.</div>';
  }
  state.tasks.forEach(task => {
    const row = document.createElement("div");
    row.className = "task-row" + (task.done ? " done" : "");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox"; checkbox.className = "task-check";
    checkbox.checked = task.done; checkbox.setAttribute("aria-label", "Mark " + task.title + " complete");
    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      recordToday(); render();
    });
    const title = document.createElement("span");
    title.className = "task-name"; title.textContent = task.title;
    const category = document.createElement("span");
    category.className = "task-category"; category.textContent = task.category || "TASK";
    const remove = document.createElement("button");
    remove.className = "delete-task"; remove.type = "button"; remove.textContent = "×";
    remove.setAttribute("aria-label", "Delete " + task.title);
    remove.addEventListener("click", () => {
      state.tasks = state.tasks.filter(item => item.id !== task.id);
      recordToday(); render();
    });
    row.append(checkbox, title, category, remove);
    list.append(row);
  });
}
function renderProgress() {
  const total = state.tasks.length;
  const done = state.tasks.filter(task => task.done).length;
  const percent = total ? Math.round(done / total * 100) : 0;
  document.getElementById("completionText").textContent = percent + "% completed";
  document.getElementById("completionFraction").textContent = done + " of " + total + " tasks";
  document.getElementById("progressFill").style.width = percent + "%";
  document.getElementById("taskCount").textContent = total + (total === 1 ? " TASK" : " TASKS");
  document.getElementById("miniCompleted").textContent = done;
  drawChart();
}
function drawChart() {
  const labels = [];
  const values = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(); date.setDate(date.getDate() - i);
    const key = todayKey(date);
    labels.push(date.toLocaleDateString("en", { weekday: "short" }));
    values.push(key === todayKey() ? (state.tasks.length ? Math.round(state.tasks.filter(t=>t.done).length/state.tasks.length*100) : 0) : (state.history[key] ?? 0));
  }
  const width = 700, height = 180, pad = 8;
  const points = values.map((value, index) => ({ x: pad + index * (width - pad*2) / 6, y: height - pad - (value/100)*(height-pad*2) }));
  const line = points.map((p,i) => (i ? "L" : "M") + p.x.toFixed(1) + " " + p.y.toFixed(1)).join(" ");
  const area = line + " L " + points[6].x + " " + height + " L " + points[0].x + " " + height + " Z";
  document.getElementById("chartLine").setAttribute("d", line);
  document.getElementById("chartArea").setAttribute("d", area);
  document.getElementById("chartLabels").innerHTML = labels.map(label => "<span>" + label + "</span>").join("");
}
function render() { renderTasks(); renderProgress(); }
document.getElementById("addTaskForm").addEventListener("submit", event => {
  event.preventDefault();
  const input = document.getElementById("newTaskInput");
  const title = input.value.trim();
  if (!title) return;
  state.tasks.push({ id: Date.now(), title, category: "PERSONAL", done: false });
  input.value = "";
  recordToday(); render(); input.focus();
});
document.getElementById("todayDate").textContent = new Date().toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" });
document.getElementById("menuToggle").addEventListener("click", () => document.getElementById("sidebar").classList.toggle("open"));
document.querySelectorAll(".nav-item").forEach(link => link.addEventListener("click", () => {
  document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
  link.classList.add("active");
  document.getElementById("sidebar").classList.remove("open");
}));
const initialStreak = Object.values(state.history).filter(value => value > 0).length;
document.getElementById("streakValue").textContent = initialStreak + (initialStreak === 1 ? " day streak" : " active days");
recordToday();
render();