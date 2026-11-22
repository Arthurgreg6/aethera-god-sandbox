/**
 * src/ui.js — UI wiring for Worldbox/Aethera
 * 373 chars minimal UI controller
 */

(function() {
  var canvas = document.getElementById('gameCanvas');
  var ctx = canvas.getContext('2d');
  var TICK = 0;

  function init() {
    // Bind keyboard controls
    document.addEventListener('keydown', function(e) {
      // Arrow keys / WASD for camera
      if (e.key === 'ArrowUp' || e.key === 'w') { /* move up */ }
      if (e.key === 'ArrowDown' || e.key === 's') { /* move down */ }
      if (e.key === 'ArrowLeft' || e.key === 'a') { /* move left */ }
      if (e.key === 'ArrowRight' || e.key === 'd') { /* move right */ }
      if (e.key === ' ') { e.preventDefault(); } // prevent scroll
    });
  }

  function tick() {
    TICK++;
    // Update UI elements
    var dateEl = document.getElementById('date');
    var popEl = document.getElementById('pop');
    var wealthEl = document.getElementById('wealth-value');
    var popValEl = document.getElementById('population-value');
    var unrestEl = document.getElementById('unrest-value');
    var repEl = document.getElementById('reputation-value');
    var scoreEl = document.getElementById('score-value');
    var turnEl = document.getElementById('turn-number');
    var dayEl = document.getElementById('day-number');
    var monthEl = document.getElementById('month-number');
    var seasonIcon = document.getElementById('season-icon');

    if (dateEl) {
      var now = new Date();
      dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    }
    if (wealthEl) { wealthEl.textContent = WORLD ? WORLD.resources.gold : 0; }
    if (popValEl) { popValEl.textContent = WORLD ? WORLD.resources.population : 0; }
    if (unrestEl) { unrestEl.textContent = WORLD ? WORLD.unrest : 0; }
    if (repEl) { repEl.textContent = WORLD ? WORLD.reputation : 0; }
    if (scoreEl) { scoreEl.textContent = WORLD ? WORLD.score : 0; }
    if (turnEl) { turnEl.textContent = WORLD ? WORLD.turn : 1; }
    if (dayEl) { dayEl.textContent = WORLD ? WORLD.day : 1; }
    if (monthEl) { monthEl.textContent = WORLD ? WORLD.month : 1; }
    if (seasonIcon) {
      var s = WORLD ? WORLD.season : 1;
      seasonIcon.textContent = ['🌱','🌸','🍂','❄'][s - 1] || '🌱';
    }
    updateFaith();
  }

  function updateFaith() {
    var fb = document.getElementById('faithbar');
    var ff = document.getElementById('faithfill');
    var fn = document.getElementById('faithnum');
    if (fb && ff && fn) {
      var faith = WORLD ? WORLD.resources.wealth / 1000 * 100 : 50;
      ff.style.width = clamp(faith, 0, 100) + '%';
      fn.textContent = Math.round(faith);
    }
  }

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  function loop() {
    tick();
    requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
    setTimeout(loop, 100);
  } else {
    init();
    setTimeout(loop, 100);
  }
})();
