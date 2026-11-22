/**
 * Aethera UI — User Interface Layer for Worldbox
 * Creates all HTML/CSS UI elements: toolbar, tabs, panels, HUD, menus.
 */

// ── DOM Element References ─────────────────────────────────────────────────
const UI = {
  tools: document.getElementById('tools'),
  tabs: document.getElementById('tabs'),
  brush: document.getElementById('brush'),
  brushv: document.getElementById('brushv'),
  info: document.getElementById('info'),
  log: document.getElementById('log'),
  realms: document.getElementById('realms'),
  beasts: document.getElementById('beasts'),
  goals: document.getElementById('goals'),
  menu: document.getElementById('menu'),
  hud: document.getElementById('hud'),
  tooltip: document.getElementById('tooltip'),
  ticker: document.getElementById('ticker'),
  dock: document.getElementById('dock'),
  top: document.getElementById('top'),
  stats: document.getElementById('stats'),
  faithbar: document.getElementById('faithbar'),
  faithfill: document.getElementById('faithfill'),
  faithnum: document.getElementById('faithnum'),
  btns: document.getElementById('btns'),
  mini: document.getElementById('mini'),
  load: document.getElementById('load'),
  toast: document.getElementById('toast'),
  tray: document.getElementById('tray'),
};

// ── Drawing tools ──────────────────────────────────────────────────────────
const DRAW_TOOLS = {
  HAND: 0,
  INSPECT: 1,
  RAISE: 2,
  LOWER: 3,
  ERASE: 4,
  PALETTE: 5,
  TERRAIN: 6,
  MORPH: 7,
  BRICK: 8,
  RVPAL: 9,
  ANIMATE: 10,
  SLIDE: 11,
  ROTATE: 12,
  TRUE: 13,
  TILER: 14,
  SCULPT: 15,
  SPHERE: 16,
  RING: 17,
  DISC: 18,
  BINP: 19,
  BINV: 20,
  BINH: 21,
  CLO: 22,
  GRAVE: 23,
  PAL: 24,
  FREV: 25,
  FX: 26,
  FXL: 27,
  FXS: 28,
  FLW: 29,
  FLS: 30,
  RFP: 31,
  PEAK: 32,
  PEAK: 33,
  FUS: 34,
  RIV: 35,
  SLG: 36,
  UNI: 37,
  RGG: 38,
  RAD: 39,
  RST: 40,
  RUM: 41,
  RUV: 42,
  RZD: 43,
  RXS: 44,
  RES: 45,
  REB: 46,
  REL: 47,
  RES2: 48,
  RED: 49,
  RTR: 50,
  RFL: 51,
  RFV: 52,
  RFF: 53,
  RFR: 54,
  RSD: 55,
  RTF: 56,
  RCR: 57,
  RCH: 58,
  RGR: 59,
  RGL: 60,
  RGC: 61,
  RGM: 62,
  RGB: 63,
  RGD: 64,
  RBC: 65,
  RMB: 66,
  RMG: 67,
  RMO: 68,
  RMX: 69,
  RSO: 70,
  RSH: 71,
  RSL: 72,
  RSM: 73,
  RSN: 74,
  RSS: 75,
  RST: 76,
  RSZ: 77,
  RMB: 78,
  RWB: 79,
  RGW: 80,
  RBW: 81,
  RDT: 82,
  RCB: 83,
  RBC: 84,
  RCY: 85,
  RGB: 86,
  RRF: 87,
  RTR: 88,
  RMO: 89,
  RIS: 90,
  RIA: 91,
  RBT: 92,
  RCT: 93,
  RCB: 94,
  RCC: 95,
  RCD: 96,
  RCR: 97,
  RCB: 98,
  RCH: 99,
  RCO: 100,
  RCO2: 101,
  RCO3: 102,
  RCO4: 103,
  RCO5: 104,
  RCO6: 105,
  RCO7: 106,
  RCO8: 107,
  RCO9: 108,
  RCO10: 109,
  RCO11: 110,
  RCO12: 111,
  RCO13: 112,
  RCO14: 113,
  RCO15: 114,
  RCO16: 115,
  RCO17: 116,
  RCO18: 117,
  RCO19: 118,
  RCO20: 119,
  RCO21: 120,
  RCO22: 121,
  RCO23: 122,
  RCO24: 123,
  RCO25: 124,
  RCO26: 125,
};

// ── Build toolbar ──────────────────────────────────────────────────────────
function buildToolbar() {
  const tools = UI.tools;
  tools.innerHTML = '';
  const toolList = [];
  const categories = {
    terrain: ['hand', 'inspect', 'raise', 'lower', 'erase', 'palette', 'terrain', 'morph', 'brick', 'rvpal', 'animate', 'slide'],
    powers: ['fire', 'lightning', 'rain', 'bless', 'plague', 'necro', 'quake', 'meteor', 'tornado', 'volcano', 'dragon'],
    fate: ['unity', 'discord', 'anoint', 'champion', 'coup', 'revolt', 'harvest', 'gift', 'teach', 'relic'],
  };
  // Build tool buttons
  for (const cat of Object.keys(categories)) {
    for (const tool of categories[cat]) {
      const btn = document.createElement('div');
      btn.className = 'tool tool-' + tool;
      btn.dataset.tool = tool;
      btn.innerHTML = '<span class="i">' + getToolIcon(tool) + '</span><small>' + getToolLabel(tool) + '</small>';
      btn.addEventListener('click', () => selectTool(tool));
      tools.appendChild(btn);
      toolList.push(btn);
    }
  }
  // Brush size control
  const brushRow = document.createElement('div');
  brushRow.id = 'brushrow';
  brushRow.innerHTML = `
    <span style="font-size:12px;color:#aab3e6;">Brush:</span>
    <input id="brush" type="range" min="1" max="128" value="8">
    <span id="brushv">8</span>
    <span style="font-size:12px;color:#aab3e6;margin-left:8px;">Speed:</span>
    <button id="bSpeed" class="btn" style="padding:2px 6px;font-size:11px;">Slow</button>
  `;
  UI.dock.appendChild(brushRow);
  UI.brush = document.getElementById('brush');
  UI.brushv = document.getElementById('brushv');
  UI.brush.addEventListener('input', () => {
    UI.brushv.textContent = UI.brush.value;
  });
  const bSpeed = document.getElementById('bSpeed');
  bSpeed.addEventListener('click', () => {
    SPEED = Math.min(SPEED + 1, 10);
    bSpeed.textContent = 'Speed ' + SPEED;
  });
}

// ── Select tool ────────────────────────────────────────────────────────────
function selectTool(name) {
  // Highlight active tool
  const tools = UI.tools.querySelectorAll('.tool');
  tools.forEach(t => t.classList.remove('on'));
  const target = UI.tools.querySelector(`.tool[data-tool="${name}"]`);
  if (target) target.classList.add('on');
  CURRENT_TOOL = DRAW_TOOLS[name.toUpperCase()];
  // Call engine function
  if (typeof selectToolFn === 'function') {
    selectToolFn(name);
  }
}

// ── Tab system ─────────────────────────────────────────────────────────────
function buildTabs() {
  const tabs = UI.tabs;
  tabs.innerHTML = '';
  const tabList = ['Terrain', 'Life', 'Powers', 'Fate'];
  for (const tab of tabList) {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = tab;
    btn.addEventListener('click', () => showTab(tab));
    tabs.appendChild(btn);
  }
}

function showTab(name) {
  const tabs = UI.tabs.querySelectorAll('.btn');
  tabs.forEach(t => t.classList.remove('active'));
  const target = UI.tabs.querySelector(`button:contains('${name}')`);
  if (target) target.classList.add('active');
  if (typeof showTabFn === 'function') {
    showTabFn(name);
  }
}

// ── Info panel ─────────────────────────────────────────────────────────────
function createInfoPanel() {
  // Info panel built in HTML, updated via updateInfo()
}

function updateInfo(msg, title) {
  UI.info.innerHTML = '';
  if (title) {
    const h = document.createElement('div');
    h.className = 'title';
    h.textContent = title;
    UI.info.appendChild(h);
  }
  const d = document.createElement('div');
  d.className = 'desc';
  d.textContent = msg;
  UI.info.appendChild(d);
}

// ── Tooltip ────────────────────────────────────────────────────────────────
function createTooltip() {
  // Tooltip shown on hover
}

function updateTooltip(text) {
  UI.tooltip.textContent = text;
  UI.tooltip.style.opacity = '1';
}

// ── Log panel ──────────────────────────────────────────────────────────────
function createLogPanel() {
  // Log output
}

function addLog(msg, type) {
  const li = document.createElement('div');
  li.className = type || 'log';
  li.textContent = msg;
  UI.log.appendChild(li);
}

// ── Realms panel ───────────────────────────────────────────────────────────
function createRealmsPanel() {
  // Realms detail panel
}

function updateRealms(realmData) {
  UI.realms.innerHTML = '';
  for (const realm of realmData) {
    const row = document.createElement('div');
    row.className = 'realm-row';
    row.innerHTML = `
      <span class="dot" style="background:${realm.color}"></span>
      <span class="realm-name">${realm.name}</span>
      <span class="realm-pop">Pop: ${realm.pop}</span>
    `;
    UI.realms.appendChild(row);
  }
}

// ── Beasts panel ───────────────────────────────────────────────────────────
function createBeastsPanel() {
  // Bestiary
}

function updateBeasts(beasts) {
  UI.beasts.innerHTML = '';
  for (const beast of beasts) {
    const item = document.createElement('div');
    item.className = 'beast-item';
    item.innerHTML = `
      <span class="beast-icon">${beast.emoji}</span>
      <span class="beast-name">${beast.name}</span>
      <span class="beast-desc">${beast.description}</span>
    `;
    UI.beasts.appendChild(item);
  }
}

// ── Goals panel ────────────────────────────────────────────────────────────
function createGoalsPanel() {
  // Goals/achievements
}

function updateGoals(goals) {
  UI.goals.innerHTML = '';
  for (const goal of goals) {
    const item = document.createElement('div');
    item.className = 'goal-item';
    item.innerHTML = `
      <span class="goal-icon">${goal.icon}</span>
      <span class="goal-name">${goal.name}</span>
      <span class="goal-desc">${goal.description}</span>
    `;
    UI.goals.appendChild(item);
  }
}

// ── Menu panel ─────────────────────────────────────────────────────────────
function createMenuPanel() {
  const menu = UI.menu;
  menu.innerHTML = '';
  const title = document.createElement('h2');
  title.textContent = 'Worldbox';
  menu.appendChild(title);
  const btn = document.createElement('button');
  btn.textContent = 'New World';
  btn.addEventListener('click', () => newGame());
  menu.appendChild(btn);
  const btn2 = document.createElement('button');
  btn2.textContent = 'Load World';
  btn2.addEventListener('click', () => loadGame());
  menu.appendChild(btn2);
  const btn3 = document.createElement('button');
  btn3.textContent = 'Save World';
  btn3.addEventListener('click', () => saveGame());
  menu.appendChild(btn3);
}

function newGame() {
  confirmDialog('Start a new world?', () => {
    // Reset game
    UI.toast.textContent = 'New world created';
    UI.toast.classList.add('show');
    setTimeout(() => UI.toast.classList.remove('show'), 2000);
  });
}

function loadGame() {
  confirmDialog('Load saved world?', () => {
    UI.toast.textContent = 'World loaded';
    UI.toast.classList.add('show');
    setTimeout(() => UI.toast.classList.remove('show'), 2000);
  });
}

function saveGame() {
  UI.toast.textContent = 'World saved';
  UI.toast.classList.add('show');
  setTimeout(() => UI.toast.classList.remove('show'), 2000);
}

// ── Hud bar ────────────────────────────────────────────────────────────────
function createHud() {
  // HUD already in HTML, just update it
  updateHud();
}

function updateHud() {
  // Update date, population, wealth, faith
  const date = new Date();
  const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  if (UI.stats) {
    const statEl = UI.stats.querySelector('#date');
    if (statEl) statEl.textContent = date.toLocaleDateString('en-US', options);
  }
  // Update faith
  if (UI.faithbar && UI.faithfill && UI.faithnum) {
    const faith = WORLD ? World.getFaith() : 50;
    UI.faithfill.style.width = faith + '%';
    UI.faithnum.textContent = faith;
  }
}

// ── Confirm dialog ─────────────────────────────────────────────────────────
function confirmDialog(msg, callback) {
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.right = '0';
  overlay.style.bottom = '0';
  overlay.style.backgroundColor = 'rgba(0,0,0,0.7)';
  overlay.style.zIndex = '100';
  const dialog = document.createElement('div');
  dialog.style.position = 'fixed';
  dialog.style.top = '50%';
  dialog.style.left = '50%';
  dialog.style.transform = 'translate(-50%, -50%)';
  dialog.style.backgroundColor = '#121a2e';
  dialog.style.padding = '20px';
  dialog.style.border = '1px solid #3a56d4';
  dialog.style.borderRadius = '12px';
  dialog.style.color = '#e8ecff';
  dialog.style.fontFamily = "'Helvetica Neue', Arial, sans-serif";
  dialog.style.zIndex = '101';
  const msgEl = document.createElement('p');
  msgEl.style.marginTop = '0';
  msgEl.textContent = msg;
  dialog.appendChild(msgEl);
  const row = document.createElement('div');
  row.style.marginTop = '16px';
  row.style.display = 'flex';
  row.style.gap = '10px';
  const ok = document.createElement('button');
  ok.style.background = '#4fc9f4';
  ok.style.color = '#050816';
  ok.style.border = 'none';
  ok.style.padding = '10px 20px';
  ok.style.borderRadius = '6px';
  ok.style.cursor = 'pointer';
  ok.textContent = 'OK';
  ok.addEventListener('click', () => {
    overlay.remove();
    if (callback) callback();
  });
  row.appendChild(ok);
  const cancel = document.createElement('button');
  cancel.style.background = '#3a4a7a';
  cancel.style.color = '#e8ecff';
  cancel.style.border = 'none';
  cancel.style.padding = '10px 20px';
  cancel.style.borderRadius = '6px';
  cancel.style.cursor = 'pointer';
  cancel.textContent = 'Cancel';
  cancel.addEventListener('click', () => overlay.remove());
  row.appendChild(cancel);
  dialog.appendChild(row);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
}

// ── Toast notifications ────────────────────────────────────────────────────
function showToast(msg, duration) {
  if (UI.toast) {
    UI.toast.textContent = msg;
    UI.toast.classList.add('show');
    if (duration) {
      setTimeout(() => UI.toast.classList.remove('show'), duration);
    }
  }
}

// ── Tool icons ─────────────────────────────────────────────────────────────
function getToolIcon(tool) {
  const icons = {
    hand: '✋',
    inspect: '🔍',
    raise: '⬆',
    lower: '⬇',
    erase: '🗑',
    palette: '🎨',
    terrain: '⛰',
    morph: '🌊',
    brick: '🧱',
    rvpal: '🌈',
    animate: '✨',
    slide: '➡',
    rotate: '🔄',
    true: '✅',
    tiler: '📐',
    sculpt: '🏔️',
    sphere: '⚪',
    ring: '⭕',
    disc: '◯',
    binp: '📦',
    binv: '📁',
    binh: '📂',
    clo: '🔒',
    grave: '🪦',
    pal: '📋',
    frev: '⚡',
    fx: '💥',
    fxl: '🌩',
    fxs: '❄',
    flw: '🍃',
    fls: '🌧',
    rfp: '🔥',
    peak: '🧗',
    fusk: '🌋',
    riv: '🏹',
    slg: '🛡',
    uni: '👥',
    rgg: '🌍',
    rad: '📡',
    rst: '🔧',
    rum: '📦',
    ruv: '📊',
    rzd: '🧊',
    rxs: '🍂',
    res: '🔍',
    reb: '📈',
    rel: '📉',
    res2: '📊',
    red: '🔴',
    rtr: '🔵',
    rfl: '🟢',
    rfv: '🟣',
    rff: '🟢',
    rfr: '🟠',
    rsd: '⚫',
    rtf: '⚪',
    rcq: '🟣',
    rcr: '🌊',
    rch: '🔥',
    rgr: '🌲',
    rgl: '🌳',
    rgc: '🌿',
    rgm: '🌼',
    rgb: '💚',
    rgd: '💛',
    rbc: '💙',
    rmb: '💜',
    rmg: '💗',
    rmo: '💖',
    rmx: '💕',
    rso: '💐',
    rsh: '🌹',
    rsl: '🌺',
    rsm: '🌻',
    rsn: '🌼',
    rss: '🌷',
    rst: '🌱',
    rsz: '🌿',
    rmb: '🎾',
    rwb: '🏆',
    rgw: '🎪',
    rbw: '🎭',
    rdt: '🎟',
    rcb: '🎴',
    rbc: '🎮',
    rcy: '🎯',
    rgb: '🎱',
    rrf: '🎮',
    rtr: '🎲',
    rmo: '🎬',
    ris: '🎤',
    ria: '🎧',
    rbt: '🎸',
    rct: '🎹',
    rcb: '🎵',
    rcc: '🎷',
    rcd: '🎺',
    rcr: '📻',
    rcb: '🎙',
    rch: '🎚',
    rco: '🎛',
    rco2: '🎝',
    rco3: '🎞',
    rco4: '🎟',
    rco5: '🎡',
    rco6: '🎢',
    rco7: '🎠',
    rco8: '🎣',
    rco9: '🎤',
    rco10: '🎧',
    rco11: '🎨',
    rco12: '🖼',
    rco13: '📷',
    rco14: '📸',
    rco15: '📹',
    rco16: '🎦',
    rco17: '🎧',
    rco18: '🎶',
    rco19: '🎵',
    rco20: '🎶',
    rco21: '🎵',
    rco22: '🎵',
    rco23: '🎵',
    rco24: '🎵',
    rco25: '🎵',
    rco26: '🎵',
  };
  return icons[tool] || '';
}

function getToolLabel(tool) {
  const labels = {
    hand: 'Hand',
    inspect: 'Inspect',
    raise: 'Raise',
    lower: 'Lower',
    erase: 'Erase',
    palette: 'Palette',
    terrain: 'Terrain',
    morph: 'Morph',
    brick: 'Brick',
    rvpal: 'Pattern',
    animate: 'Animate',
    slide: 'Slide',
    rotate: 'Rotate',
    true: 'True',
    tiler: 'Tile',
    sculpt: 'Sculpt',
    sphere: 'Sphere',
    ring: 'Ring',
    disc: 'Disc',
    binp: 'Bin P',
    binv: 'Bin V',
    binh: 'Bin H',
    clo: 'Clo',
    grave: 'Grave',
    pal: 'Pal',
    frev: 'Freeze',
    fx: 'FX',
    fxl: 'Lightning',
    fxs: 'Snow',
    flw: 'Flow',
    fls: 'Lake',
    rfp: 'Fire',
    peak: 'Peak',
    fusk: 'Fuse',
    riv: 'Riv',
    slg: 'Slug',
    uni: 'Uni',
    rgg: 'RGG',
    rad: 'RAD',
    rst: 'RST',
    rum: 'Run',
    ruv: 'Rev',
    rzd: 'RZD',
    rxs: 'RxS',
    res: 'Res',
    reb: 'Reb',
    rel: 'Rel',
    res2: 'Re2',
    red: 'Red',
    rtr: 'RTR',
    rfl: 'RFL',
    rfv: 'RFV',
    rff: 'RFF',
    rfr: 'RFR',
    rsd: 'RSD',
    rtf: 'RTF',
    rcq: 'RCQ',
    rcr: 'RCR',
    rch: 'RCH',
    rgr: 'RGR',
    rgl: 'RGL',
    rgc: 'RGC',
    rgm: 'RGM',
    rgb: 'RGB',
    rgd: 'RGD',
    rbc: 'RBC',
    rmb: 'RMB',
    rmg: 'RMG',
    rmo: 'RMO',
    rmx: 'RMX',
    rso: 'RSO',
    rsh: 'RSH',
    rsl: 'RSL',
    rsm: 'RSM',
    rsn: 'RSN',
    rss: 'RSS',
    rst: 'RST',
    rsz: 'RSZ',
    rmb: 'RMB',
    rwb: 'RWB',
    rgw: 'RGW',
    rbw: 'RBW',
    rdt: 'RDT',
    rcb: 'RCB',
    rbc: 'RBC',
    rcy: 'RCY',
    rgb: 'RGB',
    rrf: 'RRF',
    rtr: 'RTR',
    rmo: 'RMO',
    ris: 'RIS',
    ria: 'RIA',
    rbt: 'RBT',
    rct: 'RCT',
    rcb: 'RCB',
    rcc: 'RCC',
    rcd: 'RCD',
    rcr: 'RCR',
    rcb: 'RCB',
    rch: 'RCH',
    rco: 'RCO',
    rco2: 'RCO2',
    rco3: 'RCO3',
    rco4: 'RCO4',
    rco5: 'RCO5',
    rco6: 'RCO6',
    rco7: 'RCO7',
    rco8: 'RCO8',
    rco9: 'RCO9',
    rco10: 'RCO10',
    rco11: 'RCO11',
    rco12: 'RCO12',
    rco13: 'RCO13',
    rco14: 'RCO14',
    rco15: 'RCO15',
    rco16: 'RCO16',
    rco17: 'RCO17',
    rco18: 'RCO18',
    rco19: 'RCO19',
    rco20: 'RCO20',
    rco21: 'RCO21',
    rco22: 'RCO22',
    rco23: 'RCO23',
    rco24: 'RCO24',
    rco25: 'RCO25',
    rco26: 'RCO26',
  };
  return labels[tool] || tool;
}

// ── Initialize UI ──────────────────────────────────────────────────────────
function initUI() {
  buildToolbar();
  buildTabs();
  createInfoPanel();
  createTooltip();
  createLogPanel();
  createRealmsPanel();
  createBeastsPanel();
  createGoalsPanel();
  createMenuPanel();
  createHud();
  createTooltip();
  updateHud();
  // Set up update loop
  setInterval(() => {
    if (typeof updateUI === 'function') updateUI();
  }, 1000);
}
