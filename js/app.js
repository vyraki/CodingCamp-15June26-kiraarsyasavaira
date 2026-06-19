/* ─────────────────────────────────────────
   MY DASHBOARD  –  app.js
   Vanilla JS · Local Storage · No frameworks
───────────────────────────────────────── */

/* ══════════════════════════════════════════
   UTILITY
══════════════════════════════════════════ */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}


/* ══════════════════════════════════════════
   CHALLENGE 1 – LIGHT / DARK MODE
══════════════════════════════════════════ */
const STORAGE_THEME  = 'dashboard_theme';
const elHtml         = document.documentElement;
const btnTheme       = document.getElementById('theme-toggle');
const elThemeIcon    = btnTheme.querySelector('.theme-icon');
const elThemeLabel   = btnTheme.querySelector('.theme-label');

function applyTheme(theme) {
  elHtml.setAttribute('data-theme', theme);
  if (theme === 'light') {
    elThemeIcon.textContent  = '☀️';
    elThemeLabel.textContent = 'Light';
  } else {
    elThemeIcon.textContent  = '🌙';
    elThemeLabel.textContent = 'Dark';
  }
  localStorage.setItem(STORAGE_THEME, theme);
}

// Load saved theme (default: dark)
applyTheme(localStorage.getItem(STORAGE_THEME) || 'dark');

btnTheme.addEventListener('click', () => {
  const current = elHtml.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});


/* ══════════════════════════════════════════
   1. GREETING  +  CHALLENGE 2: CUSTOM NAME
══════════════════════════════════════════ */
const STORAGE_NAME    = 'dashboard_name';
const elDate          = document.getElementById('current-date');
const elTime          = document.getElementById('current-time');
const elGreeting      = document.getElementById('greeting-text');
const elNameDisplay   = document.getElementById('name-display');
const elNameDisplayRow = document.getElementById('name-display-row');
const elNameEditRow   = document.getElementById('name-edit-row');
const elNameInput     = document.getElementById('name-input');
const btnNameEdit     = document.getElementById('name-edit-btn');
const btnNameSave     = document.getElementById('name-save-btn');
const btnNameCancel   = document.getElementById('name-cancel-btn');

function getGreeting(hour) {
  if (hour >= 5  && hour < 12) return 'Good morning ☀️';
  if (hour >= 12 && hour < 17) return 'Good afternoon 🌤️';
  if (hour >= 17 && hour < 21) return 'Good evening 🌙';
  return 'Good night 🌟';
}

function getSavedName() {
  return localStorage.getItem(STORAGE_NAME) || '';
}

function saveName(name) {
  if (name) {
    localStorage.setItem(STORAGE_NAME, name);
  } else {
    localStorage.removeItem(STORAGE_NAME);
  }
}

function renderName() {
  const name = getSavedName();
  elNameDisplay.textContent = name ? `👋 Hey, ${name}!` : '';
}

function updateClock() {
  const now  = new Date();
  const hour = now.getHours();
  const mins = String(now.getMinutes()).padStart(2, '0');
  const secs = String(now.getSeconds()).padStart(2, '0');

  elTime.textContent     = `${String(hour).padStart(2, '0')}:${mins}:${secs}`;
  elGreeting.textContent = getGreeting(hour);
  elDate.textContent     = now.toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

// Show name edit form
btnNameEdit.addEventListener('click', () => {
  elNameInput.value = getSavedName();
  elNameDisplayRow.classList.add('hidden');
  elNameEditRow.classList.remove('hidden');
  elNameInput.focus();
});

// Save name
function commitNameSave() {
  const name = elNameInput.value.trim();
  saveName(name);
  renderName();
  elNameEditRow.classList.add('hidden');
  elNameDisplayRow.classList.remove('hidden');
}

btnNameSave.addEventListener('click', commitNameSave);
elNameInput.addEventListener('keydown', e => { if (e.key === 'Enter') commitNameSave(); });

// Cancel edit
btnNameCancel.addEventListener('click', () => {
  elNameEditRow.classList.add('hidden');
  elNameDisplayRow.classList.remove('hidden');
});

renderName();
updateClock();
setInterval(updateClock, 1000);


/* ══════════════════════════════════════════
   2. FOCUS TIMER  +  CHALLENGE 3: CUSTOM DURATION
══════════════════════════════════════════ */
const STORAGE_TIMER_MINS = 'dashboard_timer_mins';
const elTimerDisplay     = document.getElementById('timer-display');
const btnTimerStart      = document.getElementById('timer-start');
const btnTimerStop       = document.getElementById('timer-stop');
const btnTimerReset      = document.getElementById('timer-reset');
const elTimerCustomInput = document.getElementById('timer-custom-input');
const btnTimerSet        = document.getElementById('timer-set-btn');

function getSavedTimerMins() {
  const saved = parseInt(localStorage.getItem(STORAGE_TIMER_MINS), 10);
  return (!isNaN(saved) && saved >= 1 && saved <= 120) ? saved : 25;
}

let timerDurationSecs = getSavedTimerMins() * 60;
let timerSeconds      = timerDurationSecs;
let timerInterval     = null;
let timerRunning      = false;

// Reflect saved duration in the input placeholder
elTimerCustomInput.placeholder = getSavedTimerMins();

function formatTimer(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function renderTimer() {
  elTimerDisplay.textContent = formatTimer(timerSeconds);
  elTimerDisplay.classList.toggle('running', timerRunning && timerSeconds > 0);
  elTimerDisplay.classList.toggle('finished', timerSeconds === 0);
}

function tickTimer() {
  if (timerSeconds <= 0) {
    clearInterval(timerInterval);
    timerRunning = false;
    renderTimer();
    return;
  }
  timerSeconds--;
  renderTimer();
}

btnTimerStart.addEventListener('click', () => {
  if (timerRunning || timerSeconds <= 0) return;
  timerRunning   = true;
  timerInterval  = setInterval(tickTimer, 1000);
  renderTimer();
});

btnTimerStop.addEventListener('click', () => {
  if (!timerRunning) return;
  clearInterval(timerInterval);
  timerRunning = false;
  renderTimer();
});

btnTimerReset.addEventListener('click', () => {
  clearInterval(timerInterval);
  timerRunning  = false;
  timerSeconds  = timerDurationSecs;
  renderTimer();
});

// Set custom duration
function applyCustomTimer() {
  const raw  = parseInt(elTimerCustomInput.value, 10);
  const mins = (!isNaN(raw) && raw >= 1 && raw <= 120) ? raw : getSavedTimerMins();

  // Stop any running timer first
  clearInterval(timerInterval);
  timerRunning = false;

  timerDurationSecs = mins * 60;
  timerSeconds      = timerDurationSecs;
  localStorage.setItem(STORAGE_TIMER_MINS, mins);
  elTimerCustomInput.value       = '';
  elTimerCustomInput.placeholder = mins;
  renderTimer();
}

btnTimerSet.addEventListener('click', applyCustomTimer);
elTimerCustomInput.addEventListener('keydown', e => { if (e.key === 'Enter') applyCustomTimer(); });

renderTimer();


/* ══════════════════════════════════════════
   3. TO-DO LIST
      + CHALLENGE 4: PREVENT DUPLICATES
      + CHALLENGE 5: SORT TASKS
══════════════════════════════════════════ */
const STORAGE_TODOS    = 'dashboard_todos';
const STORAGE_SORT     = 'dashboard_sort';
const elTodoList       = document.getElementById('todo-list');
const elTodoInput      = document.getElementById('todo-input');
const btnTodoAdd       = document.getElementById('todo-add');
const elDupWarning     = document.getElementById('duplicate-warning');

// Modal elements
const elEditModal       = document.getElementById('edit-modal');
const elEditInput       = document.getElementById('edit-input');
const btnEditSave       = document.getElementById('edit-save');
const btnEditCancel     = document.getElementById('edit-cancel');
const elEditDupWarning  = document.getElementById('edit-duplicate-warning');
let   editingId         = null;

// Sort buttons
const sortButtons = document.querySelectorAll('.sort-btn');
let   currentSort = localStorage.getItem(STORAGE_SORT) || 'default';

/** Mark the active sort button */
function updateSortUI() {
  sortButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.sort === currentSort);
  });
}

/** Load tasks from Local Storage */
function loadTodos() {
  try { return JSON.parse(localStorage.getItem(STORAGE_TODOS)) || []; }
  catch { return []; }
}

/** Persist tasks */
function saveTodos(todos) {
  localStorage.setItem(STORAGE_TODOS, JSON.stringify(todos));
}

/** Return sorted copy according to currentSort */
function getSortedTodos(todos) {
  const copy = [...todos];
  if (currentSort === 'az') {
    copy.sort((a, b) => a.text.toLowerCase().localeCompare(b.text.toLowerCase()));
  } else if (currentSort === 'pending') {
    copy.sort((a, b) => {
      if (a.done === b.done) return 0;
      return a.done ? 1 : -1; // pending (done=false) first
    });
  }
  // 'default' keeps insertion order
  return copy;
}

/** Check if text duplicates an existing task (case-insensitive), optionally excluding one id */
function isDuplicate(text, excludeId = null) {
  return loadTodos().some(t =>
    t.id !== excludeId &&
    t.text.trim().toLowerCase() === text.trim().toLowerCase()
  );
}

/** Show/hide a warning element */
function showWarning(el, visible) {
  el.classList.toggle('hidden', !visible);
}

/** Render the full task list */
function renderTodos() {
  const sorted = getSortedTodos(loadTodos());
  elTodoList.innerHTML = '';

  if (sorted.length === 0) {
    elTodoList.innerHTML = '<li class="todo-empty">No tasks yet — add one above!</li>';
    return;
  }

  sorted.forEach(task => {
    const li = document.createElement('li');
    li.className = `todo-item${task.done ? ' done' : ''}`;
    li.dataset.id = task.id;

    li.innerHTML = `
      <input
        type="checkbox"
        class="todo-checkbox"
        aria-label="Mark task done"
        ${task.done ? 'checked' : ''}
      />
      <span class="todo-text">${escapeHtml(task.text)}</span>
      <div class="todo-actions">
        <button class="btn-icon" aria-label="Edit task"   data-action="edit">✏️</button>
        <button class="btn-danger" aria-label="Delete task" data-action="delete">🗑</button>
      </div>
    `;
    elTodoList.appendChild(li);
  });
}

/** Add a new task */
function addTodo() {
  const text = elTodoInput.value.trim();
  if (!text) return;

  // Duplicate check
  if (isDuplicate(text)) {
    showWarning(elDupWarning, true);
    elTodoInput.select();
    return;
  }
  showWarning(elDupWarning, false);

  const todos = loadTodos();
  todos.push({ id: uid(), text, done: false });
  saveTodos(todos);
  elTodoInput.value = '';
  renderTodos();
}

// Hide warning when user starts typing again
elTodoInput.addEventListener('input', () => showWarning(elDupWarning, false));

/** Toggle done state */
function toggleTodo(id) {
  const todos = loadTodos().map(t =>
    t.id === id ? { ...t, done: !t.done } : t
  );
  saveTodos(todos);
  renderTodos();
}

/** Delete a task */
function deleteTodo(id) {
  saveTodos(loadTodos().filter(t => t.id !== id));
  renderTodos();
}

/** Open edit modal */
function openEditModal(id) {
  const task = loadTodos().find(t => t.id === id);
  if (!task) return;
  editingId = id;
  elEditInput.value = task.text;
  showWarning(elEditDupWarning, false);
  elEditModal.classList.add('active');
  elEditInput.focus();
}

/** Close edit modal */
function closeEditModal() {
  elEditModal.classList.remove('active');
  editingId = null;
}

/** Save edited task with duplicate check */
function saveEditedTodo() {
  const text = elEditInput.value.trim();
  if (!text || !editingId) return;

  // Duplicate check — allow keeping the same text
  if (isDuplicate(text, editingId)) {
    showWarning(elEditDupWarning, true);
    return;
  }
  showWarning(elEditDupWarning, false);

  const todos = loadTodos().map(t =>
    t.id === editingId ? { ...t, text } : t
  );
  saveTodos(todos);
  closeEditModal();
  renderTodos();
}

elEditInput.addEventListener('input', () => showWarning(elEditDupWarning, false));

// Event delegation on the list
elTodoList.addEventListener('click', e => {
  const item = e.target.closest('.todo-item');
  if (!item) return;
  const id = item.dataset.id;

  if (e.target.classList.contains('todo-checkbox')) { toggleTodo(id); return; }
  const action = e.target.closest('[data-action]')?.dataset.action;
  if (action === 'edit')   openEditModal(id);
  if (action === 'delete') deleteTodo(id);
});

btnTodoAdd.addEventListener('click', addTodo);
elTodoInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTodo(); });
btnEditSave.addEventListener('click', saveEditedTodo);
btnEditCancel.addEventListener('click', closeEditModal);
elEditModal.addEventListener('click', e => { if (e.target === elEditModal) closeEditModal(); });
elEditInput.addEventListener('keydown', e => { if (e.key === 'Enter') saveEditedTodo(); });

// Sort buttons
sortButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    currentSort = btn.dataset.sort;
    localStorage.setItem(STORAGE_SORT, currentSort);
    updateSortUI();
    renderTodos();
  });
});

updateSortUI();
renderTodos();


/* ══════════════════════════════════════════
   4. QUICK LINKS
══════════════════════════════════════════ */
const STORAGE_LINKS = 'dashboard_links';
const elLinksGrid   = document.getElementById('links-grid');
const elLinkName    = document.getElementById('link-name-input');
const elLinkUrl     = document.getElementById('link-url-input');
const btnLinkAdd    = document.getElementById('link-add');

function loadLinks() {
  try { return JSON.parse(localStorage.getItem(STORAGE_LINKS)) || []; }
  catch { return []; }
}

function saveLinks(links) {
  localStorage.setItem(STORAGE_LINKS, JSON.stringify(links));
}

function normalizeUrl(raw) {
  raw = raw.trim();
  if (!raw) return null;
  if (!/^https?:\/\//i.test(raw)) raw = 'https://' + raw;
  try { new URL(raw); return raw; }
  catch { return null; }
}

function renderLinks() {
  const links = loadLinks();
  elLinksGrid.innerHTML = '';

  if (links.length === 0) {
    elLinksGrid.innerHTML = '<span class="links-empty">No links saved yet.</span>';
    return;
  }

  links.forEach(link => {
    const chip = document.createElement('div');
    chip.className = 'link-chip';
    chip.dataset.id = link.id;
    chip.innerHTML = `
      <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">
        ${escapeHtml(link.name)}
      </a>
      <button class="link-chip-delete" aria-label="Remove link">×</button>
    `;
    elLinksGrid.appendChild(chip);
  });
}

function addLink() {
  const name = elLinkName.value.trim();
  const url  = normalizeUrl(elLinkUrl.value);
  if (!name) { elLinkName.focus(); return; }
  if (!url)  { elLinkUrl.focus();  return; }

  const links = loadLinks();
  links.push({ id: uid(), name, url });
  saveLinks(links);
  elLinkName.value = '';
  elLinkUrl.value  = '';
  renderLinks();
}

function deleteLink(id) {
  saveLinks(loadLinks().filter(l => l.id !== id));
  renderLinks();
}

elLinksGrid.addEventListener('click', e => {
  const btn = e.target.closest('.link-chip-delete');
  if (!btn) return;
  deleteLink(btn.closest('.link-chip').dataset.id);
});

btnLinkAdd.addEventListener('click', addLink);
elLinkUrl.addEventListener('keydown', e => { if (e.key === 'Enter') addLink(); });

renderLinks();
