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

/* Inject SVG gradient for the timer ring */
(function injectRingGradient() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.position = 'absolute';
  svg.innerHTML = `
    <defs>
      <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"   stop-color="#7c3aed"/>
        <stop offset="100%" stop-color="#38bdf8"/>
      </linearGradient>
    </defs>`;
  document.body.prepend(svg);
})();


/* ══════════════════════════════════════════
   CHALLENGE 1 – LIGHT / DARK MODE
══════════════════════════════════════════ */
const STORAGE_THEME = 'dashboard_theme';
const elHtml        = document.documentElement;
const btnTheme      = document.getElementById('theme-toggle');
const elThemeIcon   = btnTheme.querySelector('.theme-icon');
const elThemeLabel  = btnTheme.querySelector('.theme-label');

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

applyTheme(localStorage.getItem(STORAGE_THEME) || 'dark');

btnTheme.addEventListener('click', () => {
  applyTheme(elHtml.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});


/* ══════════════════════════════════════════
   1. GREETING  +  CHALLENGE 2: CUSTOM NAME
══════════════════════════════════════════ */
const STORAGE_NAME     = 'dashboard_name';
const elDate           = document.getElementById('current-date');
const elTime           = document.getElementById('current-time');
const elGreeting       = document.getElementById('greeting-text');
const elNameDisplay    = document.getElementById('name-display');
const elNameDisplayRow = document.getElementById('name-display-row');
const elNameEditRow    = document.getElementById('name-edit-row');
const elNameInput      = document.getElementById('name-input');
const btnNameEdit      = document.getElementById('name-edit-btn');
const btnNameSave      = document.getElementById('name-save-btn');
const btnNameCancel    = document.getElementById('name-cancel-btn');

function getGreeting(hour) {
  if (hour >= 5  && hour < 12) return 'Good morning ☀️';
  if (hour >= 12 && hour < 17) return 'Good afternoon 🌤️';
  if (hour >= 17 && hour < 21) return 'Good evening 🌙';
  return 'Good night 🌟';
}

function getSavedName() { return localStorage.getItem(STORAGE_NAME) || ''; }

function saveName(name) {
  name ? localStorage.setItem(STORAGE_NAME, name) : localStorage.removeItem(STORAGE_NAME);
}

function renderName() {
  const name = getSavedName();
  elNameDisplay.textContent = name ? `👋 Hey, ${name}!` : '';
}

function updateClock() {
  const now  = new Date();
  const h    = now.getHours();
  const mins = String(now.getMinutes()).padStart(2, '0');
  const secs = String(now.getSeconds()).padStart(2, '0');

  elTime.textContent     = `${String(h).padStart(2,'0')}:${mins}:${secs}`;
  elGreeting.textContent = getGreeting(h);
  elDate.textContent     = now.toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

btnNameEdit.addEventListener('click', () => {
  elNameInput.value = getSavedName();
  elNameDisplayRow.classList.add('hidden');
  elNameEditRow.classList.remove('hidden');
  elNameInput.focus();
});

function commitNameSave() {
  saveName(elNameInput.value.trim());
  renderName();
  elNameEditRow.classList.add('hidden');
  elNameDisplayRow.classList.remove('hidden');
}

btnNameSave.addEventListener('click', commitNameSave);
elNameInput.addEventListener('keydown', e => { if (e.key === 'Enter') commitNameSave(); });
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
const elRingProgress     = document.getElementById('ring-progress');
const btnTimerStart      = document.getElementById('timer-start');
const btnTimerStop       = document.getElementById('timer-stop');
const btnTimerReset      = document.getElementById('timer-reset');
const elTimerCustomInput = document.getElementById('timer-custom-input');
const btnTimerSet        = document.getElementById('timer-set-btn');

const RING_CIRCUMFERENCE = 2 * Math.PI * 52; // r=52  ≈ 326.7

function getSavedTimerMins() {
  const v = parseInt(localStorage.getItem(STORAGE_TIMER_MINS), 10);
  return (!isNaN(v) && v >= 1 && v <= 120) ? v : 25;
}

let timerDurationSecs = getSavedTimerMins() * 60;
let timerSeconds      = timerDurationSecs;
let timerInterval     = null;
let timerRunning      = false;

elTimerCustomInput.placeholder = getSavedTimerMins();

function formatTimer(s) {
  return `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
}

function updateRing(seconds) {
  const progress  = seconds / timerDurationSecs;        // 1 → 0
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress);
  elRingProgress.style.strokeDasharray  = RING_CIRCUMFERENCE;
  elRingProgress.style.strokeDashoffset = dashOffset;

  // Change ring color when finished
  if (seconds === 0) {
    elRingProgress.style.stroke = '#f59e0b';
    elRingProgress.style.filter = 'drop-shadow(0 0 6px rgba(245,158,11,0.5))';
  } else if (timerRunning) {
    elRingProgress.style.stroke = 'url(#ringGrad)';
    elRingProgress.style.filter = 'drop-shadow(0 0 6px rgba(124,58,237,0.45))';
  } else {
    elRingProgress.style.stroke = 'url(#ringGrad)';
    elRingProgress.style.filter = 'none';
  }
}

function renderTimer() {
  elTimerDisplay.textContent = formatTimer(timerSeconds);
  elTimerDisplay.classList.toggle('running',  timerRunning && timerSeconds > 0);
  elTimerDisplay.classList.toggle('finished', timerSeconds === 0);
  updateRing(timerSeconds);
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
  timerRunning  = true;
  timerInterval = setInterval(tickTimer, 1000);
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

function applyCustomTimer() {
  const raw  = parseInt(elTimerCustomInput.value, 10);
  const mins = (!isNaN(raw) && raw >= 1 && raw <= 120) ? raw : getSavedTimerMins();
  clearInterval(timerInterval);
  timerRunning      = false;
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
const STORAGE_TODOS   = 'dashboard_todos';
const STORAGE_SORT    = 'dashboard_sort';
const elTodoList      = document.getElementById('todo-list');
const elTodoInput     = document.getElementById('todo-input');
const btnTodoAdd      = document.getElementById('todo-add');
const elDupWarning    = document.getElementById('duplicate-warning');

// Modal
const elEditModal      = document.getElementById('edit-modal');
const elEditInput      = document.getElementById('edit-input');
const btnEditSave      = document.getElementById('edit-save');
const btnEditCancel    = document.getElementById('edit-cancel');    // × header button
const btnEditCancel2   = document.getElementById('edit-cancel-2');  // Cancel footer button
const elEditDupWarn    = document.getElementById('edit-duplicate-warning');
let   editingId        = null;

// Sort pills
const pillBtns    = document.querySelectorAll('.pill-btn');
let   currentSort = localStorage.getItem(STORAGE_SORT) || 'default';

function updateSortUI() {
  pillBtns.forEach(b => b.classList.toggle('active', b.dataset.sort === currentSort));
}

function loadTodos() {
  try { return JSON.parse(localStorage.getItem(STORAGE_TODOS)) || []; }
  catch { return []; }
}
function saveTodos(t) { localStorage.setItem(STORAGE_TODOS, JSON.stringify(t)); }

function getSorted(todos) {
  const copy = [...todos];
  if (currentSort === 'az')      copy.sort((a,b) => a.text.toLowerCase().localeCompare(b.text.toLowerCase()));
  if (currentSort === 'pending') copy.sort((a,b) => a.done === b.done ? 0 : a.done ? 1 : -1);
  return copy;
}

function isDuplicate(text, excludeId = null) {
  return loadTodos().some(t =>
    t.id !== excludeId &&
    t.text.trim().toLowerCase() === text.trim().toLowerCase()
  );
}

function showWarn(el, show) { el.classList.toggle('hidden', !show); }

function renderTodos() {
  const todos = getSorted(loadTodos());
  elTodoList.innerHTML = '';

  if (todos.length === 0) {
    elTodoList.innerHTML = `
      <li class="todo-empty">
        <span class="todo-empty-icon">📋</span>
        No tasks yet — add one above!
      </li>`;
    return;
  }

  todos.forEach(task => {
    const li = document.createElement('li');
    li.className = `todo-item${task.done ? ' done' : ''}`;
    li.dataset.id = task.id;
    li.innerHTML = `
      <input type="checkbox" class="todo-checkbox" aria-label="Mark done" ${task.done ? 'checked' : ''} />
      <span class="todo-text">${escapeHtml(task.text)}</span>
      <div class="todo-actions">
        <button class="btn-icon" aria-label="Edit" data-action="edit">✏️</button>
        <button class="btn-danger" aria-label="Delete" data-action="delete">🗑</button>
      </div>`;
    elTodoList.appendChild(li);
  });
}

function addTodo() {
  const text = elTodoInput.value.trim();
  if (!text) return;
  if (isDuplicate(text)) { showWarn(elDupWarning, true); elTodoInput.select(); return; }
  showWarn(elDupWarning, false);
  const todos = loadTodos();
  todos.push({ id: uid(), text, done: false });
  saveTodos(todos);
  elTodoInput.value = '';
  renderTodos();
}

elTodoInput.addEventListener('input', () => showWarn(elDupWarning, false));

function toggleTodo(id) {
  saveTodos(loadTodos().map(t => t.id === id ? { ...t, done: !t.done } : t));
  renderTodos();
}
function deleteTodo(id) { saveTodos(loadTodos().filter(t => t.id !== id)); renderTodos(); }

function openEditModal(id) {
  const task = loadTodos().find(t => t.id === id);
  if (!task) return;
  editingId = id;
  elEditInput.value = task.text;
  showWarn(elEditDupWarn, false);
  elEditModal.classList.add('active');
  elEditInput.focus();
}
function closeEditModal() { elEditModal.classList.remove('active'); editingId = null; }

function saveEditedTodo() {
  const text = elEditInput.value.trim();
  if (!text || !editingId) return;
  if (isDuplicate(text, editingId)) { showWarn(elEditDupWarn, true); return; }
  showWarn(elEditDupWarn, false);
  saveTodos(loadTodos().map(t => t.id === editingId ? { ...t, text } : t));
  closeEditModal();
  renderTodos();
}

elEditInput.addEventListener('input', () => showWarn(elEditDupWarn, false));

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
btnEditCancel2.addEventListener('click', closeEditModal);
elEditModal.addEventListener('click', e => { if (e.target === elEditModal) closeEditModal(); });
elEditInput.addEventListener('keydown', e => { if (e.key === 'Enter') saveEditedTodo(); });

pillBtns.forEach(btn => {
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
function saveLinks(l) { localStorage.setItem(STORAGE_LINKS, JSON.stringify(l)); }

function normalizeUrl(raw) {
  raw = raw.trim();
  if (!raw) return null;
  if (!/^https?:\/\//i.test(raw)) raw = 'https://' + raw;
  try { new URL(raw); return raw; } catch { return null; }
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
      <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.name)}</a>
      <button class="link-chip-delete" aria-label="Remove link">×</button>`;
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

function deleteLink(id) { saveLinks(loadLinks().filter(l => l.id !== id)); renderLinks(); }

elLinksGrid.addEventListener('click', e => {
  const btn = e.target.closest('.link-chip-delete');
  if (btn) deleteLink(btn.closest('.link-chip').dataset.id);
});

btnLinkAdd.addEventListener('click', addLink);
elLinkUrl.addEventListener('keydown', e => { if (e.key === 'Enter') addLink(); });

renderLinks();
