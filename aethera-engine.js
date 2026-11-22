/**
 * Aethera Engine — Complete Canvas Art Rendering Engine for Worldbox
 * Pure visual rendering layer. No DOM manipulation; all canvas drawing lives here.
 * This file is injected after the Worldbox game.js scripts and draws from the
 * game state (GAME.world.grid, GAME.world.creatures, GAME.world.buildings,
 * GAME.world.kingdoms, WORLD.races, WORLD.animals, WORLD.resources, ...).
 *
 * Constants: TS=16 (tile px), W=128 (cells), H=128 (cells), N=W*H, MAXU=1900.
 * Terrain arrays: ter, bio, bld, bst, own, fire (Uint8/Uint16).
 *
 * ES5 only: var + function, no let/const, no arrows, no async.
 */

// ── Canvas & Context (set by aethera-ui.js via aetheraSetup) ──────────────
var aetheraCanvas = null; // main on-screen canvas (given by UI layer)
var aetheraCtx = null;    // 2d context
var aetheraSetupDone = false;

// Offscreen canvases for the multiple rendering passes
var TC, FC, OC, BC;       // canvases
var tctx, fctx, octx, bctx; // contexts

// ── Constants ─────────────────────────────────────────────────────────────
var TS = 16;              // tile size in pixels
var W = 128;              // grid width (cells)
var H = 128;              // grid height (cells)
var N = W * H;            // total cells
var MAXU = 1900;          // max units
var MAXF = 1600;            // max fire particles
var MAXR = 3000;            // max rain drops
var MAXS = 1200;            // max snow flakes
var MAXP = 2400;            // max general particles
var MAXL = 600;             // max lightning strikes
var MAXW = 200;             // max wind leaves
var MAXE = 40;              // max tornado rotor
var MAXM = 40;              // max meteor fragments
var FRAC = 256;             // fixed-point fraction for sub-tile
var TICK = 0;             // global render tick
var SPEED = 1;             // speed multiplier
var DAY = 0.5;             // day/night 0..1 (0=night, 1=day)
var W2 = W * TS;            // canvas width in pixels
var H2 = H * TS;            // canvas height in pixels

// ── Terrain & world arrays (cached, updated per-tile) ─────────────────────
var ter = new Uint8Array(N);    // terrain type
var bio = new Uint8Array(N);    // biome / elevation variant
var bld = new Uint8Array(N);    // building type
var bst = new Uint8Array(N);    // building state (completion)
var own = new Uint8Array(N);    // owner faction
var fire = new Uint16Array(N);  // fire object index (0=none)
var fish = new Array(MAXR);     // fish critters
var bird = new Array(MAXR);     // bird critters
var nf = 0, nb = 0;             // critter counts

// ── Unit arrays ───────────────────────────────────────────────────────────
var units = new Array(MAXU);
var nu = 0;
var uvis = new Uint8Array(MAXU);   // visible
var ujob = new Uint8Array(MAXU);   // job index
var uhp = new Uint16Array(MAXU);   // health
var umh = new Uint16Array(MAXU);   // max health

// ── Kingdoms / politics ───────────────────────────────────────────────────
var kingdoms = [];
var kings = 0;
var villages = [];
var vils = 0;
var alliances = [];
var allg = 0;

// ── Offscreen canvas helper (graphics only — no UI DOM access) ────────────
function canv(w, h) {
  var c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}
function cctx(c) { return c.getContext('2d'); }

// Create the four offscreen passes on first setup
function aetheraMakeOffscreens() {
  TC = canv(W2, H2); FC = canv(W2, H2); OC = canv(W2, H2); BC = canv(W2, H2);
  tctx = cctx(TC); fctx = cctx(FC); octx = cctx(OC); bctx = cctx(BC);
}

// ── Setup: called by aethera-ui.js once the <canvas> element exists ───────
function aetheraSetup(canv, ctx) {
  aetheraCanvas = canv;
  aetheraCtx = ctx;
  aetheraMakeOffscreens();
  aetheraSetupDone = true;
  clearTerrain();
  rebuildTerrain();
}

// Clear cached terrain arrays and rebuild from game grid
function clearTerrain() {
  for (var i = 0; i < N; i++) {
    ter[i] = 0; bio[i] = 0; bld[i] = 0; bst[i] = 0; own[i] = 0;
    fire[i] = 0;
  }
}

function rebuildTerrain() {
  // Build a base world from GAME.world.grid if present, else noise-generated
  var g = (typeof GAME !== 'undefined' && GAME.world && GAME.world.grid) ? GAME.world.grid : null;
  if (g) {
    for (var y = 0; y < H; y++) {
      for (var x = 0; x < W; x++) {
        var key = '' + x + ',' + y;
        var cell = g[key];
        var t = cell ? cell.terrain : 0;
        var e = cell ? cell.elevation : 0;
        var i = idx(x, y);
        ter[i] = (t < 255) ? t : 0;
        bio[i] = (e < 255) ? (e * 3 + 5) : 0;
        own[i] = 0;
      }
    }
  } else {
    generateBaseWorld();
  }
}

function generateBaseWorld() {
  // Ringed biome: forest near center, plain outside, mountains far, sand desert
  for (var y = 0; y < H; y++) {
    for (var x = 0; x < W; x++) {
      var dx = (x - W / 2) / (W / 2);
      var dy = (y - H / 2) / (H / 2);
      var d = Math.sqrt(dx * dx + dy * dy);
      var i = idx(x, y);
      var r = Math.random() * 0.4;
      var t;
      if (d < 0.12) t = 2;          // forest
      else if (d < 0.28) t = 0;     // grass/plain
      else if (d < 0.42) t = 3;     // hills
      else if (d < 0.5) t = 4;      // mountains
      else if (d < 0.56) t = 1;     // sand
      else t = 0;
      ter[i] = t;
      bio[i] = 0;
      own[i] = 0;
    }
  }
}

// ── Helper indexers ───────────────────────────────────────────────────────
function idx(x, y) { return y * W + x; }
function inb(x, y) { return x >= 0 && x < W && y >= 0 && y < H; }
function cl(d, a, b) { return d < a ? a : (d > b ? b : d); }
function lerp(a, b, t) { return a + (b - a) * t; }
function clampL(v, a, b) { return v < a ? a : (v > b ? b : v); }

// ── Noise / hash helpers ──────────────────────────────────────────────────
function noiseHash(x, y) {
  var n = Math.sin(x * 127.1 + y * 311.7 + 532.3) * 43758.5453;
  return n - Math.floor(n);
}
function perTileNoise(x, y) {
  // sub-pixel noise for ground detail
  return noiseHash(x * 7 + y * 3, x * 5 - y * 11) * 0.5 + 0.5;
}

// ── Colour helpers (biome palette) ────────────────────────────────────────
var BIOMES = [
  { r: 0x3a, g: 0x6a, b: 0x1a },   // 0 grass
  { r: 0xc8, g: 0x8a, b: 0x2a },   // 1 sand
  { r: 0x28, g: 0x4a, b: 0x12 },   // 2 forest
  { r: 0x7a, g: 0x6a, b: 0x3a },   // 3 hills
  { r: 0x4a, g: 0x4a, b: 0x5a },   // 4 mountains
  { r: 0xd8, g: 0xe8, b: 0xf0 },   // 5 snow
  { r: 0xff, g: 0x5a, b: 0x1a },   // 6 lava
  { r: 0x5a, g: 0x4a, b: 0x3a },   // 7 ash
  { r: 0x1a, g: 0x3a, b: 0x6a }    // 8 water
];
var TER_NAMES = ['GRASS', 'SAND', 'FOREST', 'HILL', 'MOUNTAIN', 'SNOW', 'LAVA', 'ASH', 'WATER'];
var TER_KEYS = ['grass', 'sand', 'forest', 'hill', 'mountain', 'snow', 'lava', 'ash', 'water'];

// biome colour by ter index (0..8)
function biomeRGB(t) {
  if (t >= 0 && t < BIOMES.length) return BIOMES[t];
  return BIOMES[0];
}

// Compute the final colour of a tile, accounting for water depth, lava glow,
// snow, day/night ambient (warm gold day, cool blue night).
function tileColour(t, x, y) {
  var b = biomeRGB(t);
  var n = perTileNoise(x, y);
  var r = b.r, g = b.g, bl = b.b;
  if (t === 9) {   // water
    var depth = 1 - (Math.sin(x * 0.4) * 0.3 + Math.cos(y * 0.5) * 0.3 + 0.4);
    r = 0x20 + (depth * 30);
    g = 0x38 + (depth * 20);
    bl = 0x60 + (depth * 20);
  } else if (t === 6) { // lava
    r = 0xdf; g = 0x60 + (Math.sin(x * 0.5 + y * 0.7) * 40); bl = 0x10;
  } else if (t === 7) { // ash
    r = 0x66; g = 0x55; bl = 0x44;
  } else if (t === 5) { // snow
    r = 0xe8; g = 0xf0; bl = 0xfb;
  }
  // subtle per-tile grain
  r += (Math.sin(x * 13 + y * 5) * 10) / FRAC;
  g += (Math.cos(x * 7 + y * 17) * 10) / FRAC;
  bl += (Math.sin(x * 5 + y * 19) * 10) / FRAC;
  // Day/night ambient: warm gold day, cool blue night
  var amb = (DAY * 0.7) + ((1 - DAY) * 0.35);
  if (DAY > 0.5) { // day
    r = r * 0.95 + 255 * 0.35;
    g = g * 0.95 + 205 * 0.35;
    bl = bl * 0.95 + 145 * 0.35;
  } else { // night
    r = r * 0.7 + 70 * 0.30;
    g = g * 0.7 + 110 * 0.30;
    bl = bl * 0.7 + 195 * 0.30;
  }
  r = cl(Math.round(r), 0, 255);
  g = cl(Math.round(g), 0, 255);
  bl = cl(Math.round(bl), 0, 255);
  return [r, g, bl];
}

// ── Offscreen terrain pass 1 (colour) ─────────────────────────────────────
function tcSet(x, y, t) {
  // draw one tile onto TC with biome colour + noise detail
  var i = idx(x, y);
  var c = tileColour(t, x, y);
  var px = x * TS, py = y * TS;
  var grad = tctx.createLinearGradient(px, py, px + TS, py + TS);
  grad.addColorStop(0, 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')');
  grad.addColorStop(1, 'rgb(' + (c[0] + 6) + ',' + (c[1] + 6) + ',' + (c[2] + 6) + ')');
  tctx.fillStyle = grad;
  tctx.fillRect(px, py, TS, TS);
  // per-tile micro detail (grass tufts / sand grains / snow speckles)
  var n = perTileNoise(x, y);
  var n2 = perTileNoise(x * 13, y * 9);
  if (t === 0) { // grass
    if (n > 0.62) { tctx.fillStyle = '#4a6a2a'; tctx.fillRect(px + (n2 > 0.5 ? 4 : 0), py + (n2 > 0.5 ? 6 : 0), 2, 2); }
    if (n > 0.88) { tctx.fillStyle = '#3a5a1a'; tctx.fillRect(px + (n2 > 0.5 ? 8 : 0), py + (n2 > 0.5 ? 12 : 0), 2, 2); }
  } else if (t === 1) { // sand
    if (n > 0.55) { tctx.fillStyle = '#b8882a'; tctx.fillRect(px + (n2 > 0.5 ? 3 : 0), py + (n2 > 0.5 ? 5 : 0), 2, 2); }
  } else if (t === 2) { // forest
    if (n > 0.72) { tctx.fillStyle = '#1a3a0a'; tctx.fillRect(px + (n2 > 0.5 ? 4 : 0), py + (n2 > 0.5 ? 5 : 0), 2, 2); }
  } else if (t === 5) { // snow
    if (n > 0.6) { tctx.fillStyle = '#eaff'; tctx.fillRect(px + (n2 > 0.5 ? 2 : 0), py + (n2 > 0.5 ? 2 : 0), 2, 2); }
  }
}

function updTile(x, y) {
  tcSet(x, y, ter[idx(x, y)]);
}

function renderRegion(x0, y0, x1, y1) {
  // draw a block of terrain from TC onto main canvas with bilinear filtering
  if (!aetheraSetupDone) return;
  var s = (ZOOM > 0 ? ZOOM : 1);
  aetheraCtx.save();
  aetheraCtx.imageSmoothingEnabled = true;
  aetheraCtx.drawImage(TC, 0, 0, W2, H2, x0 * TS * s, y0 * TS * s, (x1 - x0) * TS * s, (y1 - y0) * TS * s);
  aetheraCtx.restore();
}

// ── Offscreen terrain pass 2 (ambient / second colour) ────────────────────
function tc2Set(x, y, t) {
  // second terrain pass: subtle ambient/shadow layering, different colour tint
  var i = idx(x, y);
  var b = biomeRGB(t);
  var n = perTileNoise(x, y);
  var r = b.r, g = b.g, bl = b.b;
  if (t === 0) { // grass base
    r = r * 0.85 + 0x22 * 0.15; g = g * 0.9 + 0x33 * 0.10;
    bl = bl * 0.8 + 0x11 * 0.20;
  } else if (t === 1) { // sand base
    r = r * 0.9; g = g * 0.85; bl = bl * 0.7;
  } else if (t === 2) { // forest
    r = r * 0.7; g = r * 0.5 + 0x22 * 0.30; bl = 0x10;
  } else if (t === 3) { // hill
    r = r * 0.75 + 0x44 * 0.25; g = g * 0.75 + 0x44 * 0.25;
  } else if (t === 4) { // mountain
    r = r * 0.7 + 0x33 * 0.3; g = g * 0.7 + 0x33 * 0.3;
  } else if (t === 5) { // snow
    r = 0xe8; g = 0xf0; bl = 0xfb;
  }
  var px = x * TS, py = y * TS;
  fctx.globalAlpha = 0.4 + 0.15 * n;
  fctx.fillStyle = 'rgb(' + r + ',' + g + ',' + bl + ')';
  fctx.fillRect(px, py, TS, TS);
  fctx.globalAlpha = 1;
}

function updTile2(x, y) {
  tc2Set(x, y, ter[idx(x, y)]);
}

function renderAll2() {
  // full redraw of second terrain pass onto FC
  fctx.clearRect(0, 0, W2, H2);
  for (var y = 0; y < H; y++) {
    for (var x = 0; x < W; x++) {
      updTile2(x, y);
    }
  }
}

function processDirty2(x, y) {
  // incremental update of second pass for changed tile
  tc2Set(x, y, ter[idx(x, y)]);
}

// ── Camera helpers (smooth lerp, shake, rotation spring) ──────────────────
var CAMX = 0, CAMY = 0, ZOOM = 1, SHAKE = 0, ROT = 0;
function easing(t) { return t * t * (3 - 2 * t); } // smoothstep

function aetheraTransform() {
  if (!aetheraSetupDone) return;
  var c = aetheraCtx;
  c.save();
  c.imageSmoothingEnabled = true;
  // smooth zoom
  if (ZOOM !== 1) { c.scale(ZOOM, ZOOM); }
  // spring-damper rotation
  if (ROT !== 0) {
    c.translate(W2 / 2, H2 / 2);
    c.rotate(ROT);
    c.translate(-W2 / 2, -H2 / 2);
  }
  // camera pan with shake
  c.translate(-CAMX, -CAMY);
  if (SHAKE > 0.01) {
    c.translate((Math.random() - 0.5) * SHAKE, (Math.random() - 0.5) * SHAKE);
  }
}

function aetheraRestore() {
  if (!aetheraSetupDone) return;
  aetheraCtx.restore();
}

// ── Screen-space effects (drawn directly onto main canvas) ──────────────
function drawLightning() {
  if (!aetheraSetupDone) return;
  if (FX <= 0.01) return;
  aetheraCtx.save();
  aetheraCtx.globalCompositeOperation = 'screen';
  aetheraCtx.fillStyle = 'rgba(255,255,255,' + (FX * 0.9) + ')';
  var s = (ZOOM > 0 ? ZOOM : 1);
  aetheraCtx.fillRect(0, 0, W2 * s, H2 * s);
  aetheraCtx.restore();
}

function drawRain() {
  if (!aetheraSetupDone) return;
  if (RAIN <= 0) return;
  aetheraCtx.save();
  aetheraCtx.globalAlpha = RAIN * 0.06;
  aetheraCtx.strokeStyle = '#8aa';
  aetheraCtx.lineWidth = 1;
  for (var i = 0; i < MAXR; i++) {
    var r = rains[i];
    if (!r) continue;
    var nx = r.x + WINDX * 0.15 + (Math.random() - 0.5) * 1.2;
    var ny = r.y + 1;
    aetheraCtx.beginPath();
    aetheraCtx.moveTo(r.x, r.y);
    aetheraCtx.lineTo(nx, ny);
    aetheraCtx.stroke();
  }
  aetheraCtx.restore();
}

function drawSnow() {
  if (!aetheraSetupDone) return;
  if (SNOW <= 0) return;
  aetheraCtx.save();
  aetheraCtx.globalAlpha = SNOW * 0.05;
  aetheraCtx.fillStyle = '#fff';
  for (var i = 0; i < MAXS; i++) {
    var s = snows[i];
    if (!s) continue;
    var fl = Math.sin(TICK * 0.04 + s.lf * s.y * 0.01 + s.i);
    aetheraCtx.fillRect(s.x + fl * 1.2, s.y, 2, 2);
  }
  aetheraCtx.restore();
}

// ── Fire, smoke, ember particle system ─────────────────────────────────────
function addFire(x, y, life, col) {
  var f = fs[--idxs];
  if (!f) return;
  f.x = x * TS; f.y = y * TS; f.a = 0.9; f.life = life; f.d = 1.0; f.c = col || '#ff5511';
  fs[0] = f; // front-loaded for simulation order
}
function updateFireParticles() {
  for (var i = MAXF - 1; i >= 0; i--) {
    var f = fs[i];
    if (!f) continue;
    f.life -= 0.016 * SPEED;
    f.x += f.d * 0.4 * SPEED;
    f.y += f.d * 0.7 * SPEED + 0.3;
    f.r = 1.5 + Math.random() * 2;
    f.a = Math.max(0, f.life / 2);
    f.d = f.d * 0.97;
    if (f.life <= 0) { fs[i] = null; }
  }
}

// ── Smoke / ember rising thermal ──────────────────────────────────────────
function addSmoke(x, y, life) {
  var s = smokes[--idxs];
  if (!s) return;
  s.x = x * TS; s.y = y * TS; s.a = 0.8; s.life = life; s.d = 1.0; s.g = 1;
  smokes[0] = s;
}
function updateSmokeParticles() {
  for (var i = MAXP - 1; i >= 0; i--) {
    var s = smokes[i];
    if (!s) continue;
    s.life -= 0.02 * SPEED;
    s.x += s.d * 0.3 * SPEED;
    s.y += s.d * 0.6 * SPEED;
    s.r = 3 + s.g * 8;
    s.a = Math.max(0, s.life / 3);
    s.d = s.d * 0.96;
    s.g += 0.01;
    if (s.life <= 0) { smokes[i] = null; }
  }
}

// ── Wind leaves / dust ─────────────────────────────────────────────────────
function addWindLeaf(x, y) {
  var w = ws[--idxw];
  if (!w) return;
  w.x = x * TS; w.y = y * TS; w.vx = (Math.random() - 0.5) * 2; w.vy = -Math.random() * 3 - 1; w.life = 1;
  ws[0] = w;
}
function updateWindLeaves() {
  for (var i = MAXW - 1; i >= 0; i--) {
    var w = ws[i];
    if (!w) continue;
    w.life -= 0.016 * SPEED;
    w.x += w.vx; w.y += w.vy;
    w.vy += 0.04;
    if (w.life <= 0) { ws[i] = null; }
  }
}

// ── Meteor impact ─────────────────────────────────────────────────────────
function addMeteor(x, y, life) {
  var m = meteors[--idxm];
  if (!m) return;
  m.x = x * TS; m.y = y * TS; m.a = 1; m.life = life; m.r = 4; m.c = '#ffaa00';
  meteors[0] = m;
}
function updateMeteors() {
  for (var i = MAXM - 1; i >= 0; i--) {
    var m = meteors[i];
    if (!m) continue;
    m.life -= 0.02 * SPEED;
    m.x += (Math.random() - 0.5) * 4 * SPEED;
    m.y += m.d * 0.5 * SPEED;
    m.a = Math.max(0, m.life / 2);
    if (m.life <= 0) { meteors[i] = null; }
  }
}

// ── Particle accumulator arrays (reused globals) ─────────────────────────
var rains = new Array(MAXR);
var snows = new Array(MAXS);
var fs = new Array(MAXF);
var smokes = new Array(MAXP);
var ws = new Array(MAXW);
var meteors = new Array(MAXM);
var ls = new Array(MAXL);
var idxs = MAXF, idxw = MAXW, idxm = MAXM;

// ── Generate weather (called each frame) ──────────────────────────────────
// ── Sprite primitives ──────────────────────────────────────────────────────
// Drawing helpers operating on a given 2d context.
var PI2 = Math.PI * 2;
function circ(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, PI2); }
function ell(ctx, x, y, rx, ry) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, PI2); }
function rc(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function poly(ctx, pts) { ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); for (var i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i+1]); }
function path(ctx, sx, sy, pts) { poly(ctx, [sx, sy].concat(pts)); }

// Outline a sprite canvas with a dark border for depth.
function outlined(canvas, color, width) {
  var c = cctx(canvas);
  c.strokeStyle = color || '#222';
  c.lineWidth = width || 2;
  c.strokeRect(0.5, 0.5, canvas.width - 1, canvas.height - 1);
}

// ── Helper to register a sprite ───────────────────────────────────────────
var SPR = {};
function spr(name, w, h, fn) {
  var c = canv(w || 64, h || 64);
  var c2 = cctx(c);
  fn(c2);
  SPR[name] = c;
  return c;
}
function sprClear(name) { delete SPR[name]; }

// ── Tree sprites (oak / pine / palm / acacia / stump / bush / rock / cactus
//     / mound / mount / snow). All drawn with canvas primitives.
function buildTrees() {
  // oak
  spr('tree_oak', 64, 96, function(ctx){
    // trunk
    rc(ctx, 26, 30, 12, 58, 3); ctx.fillStyle = '#6a4a2a'; ctx.fill();
    // crown
    ctx.fillStyle = '#3a6a1a';
    poly(ctx, [30, 8, 20, 30, 26, 30, 30, 10]);
    poly(ctx, [34, 8, 44, 30, 40, 30, 34, 10]);
    poly(ctx, [26, 30, 34, 34, 28, 40, 24, 16]);
    poly(ctx, [30, 8, 40, 30, 34, 34, 30, 10]);
    poly(ctx, [34, 8, 44, 30, 40, 30, 34, 10]);
  });
  // pine
  spr('tree_pine', 64, 96, function(ctx){
    rc(ctx, 28, 40, 8, 50, 3); ctx.fillStyle = '#5a3a1a'; ctx.fill();
    ctx.fillStyle = '#2a6a1a';
    poly(ctx, [32, 6, 32, 34, 20, 50, 32, 50]);
    poly(ctx, [32, 6, 36, 34, 44, 50, 32, 50]);
    poly(ctx, [20, 50, 28, 58, 32, 52, 28, 50]);
    poly(ctx, [44, 50, 36, 58, 32, 52, 36, 50]);
  });
  // palm
  spr('tree_palm', 64, 96, function(ctx){
    rc(ctx, 28, 50, 8, 40, 3); ctx.fillStyle = '#5a3a1a'; ctx.fill();
    ctx.fillStyle = '#2a7a1a';
    poly(ctx, [28, 20, 36, 28, 36, 40, 28, 34]);
    poly(ctx, [6, 50, 28, 40, 36, 40, 44, 50]);
    poly(ctx, [6, 34, 20, 30, 28, 28, 20, 22]);
    poly(ctx, [60, 50, 44, 40, 36, 40, 44, 50]);
    poly(ctx, [60, 34, 52, 30, 44, 28, 44, 22]);
    ctx.strokeStyle = '#5a3a1a'; ctx.lineWidth = 4;
    for (var i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(32, 70); ctx.lineTo(16 + i*9, 4); ctx.stroke(); }
  });
  // acacia (thorns)
  spr('tree_acacia', 64, 96, function(ctx){
    rc(ctx, 28, 46, 8, 44, 3); ctx.fillStyle = '#5a3a1a'; ctx.fill();
    ctx.fillStyle = '#2a6a1a';
    poly(ctx, [32, 10, 24, 24, 32, 28, 26, 16]);
    poly(ctx, [32, 10, 40, 24, 32, 28, 38, 16]);
    poly(ctx, [32, 10, 26, 30, 32, 40, 22, 26]);
    poly(ctx, [32, 10, 38, 30, 32, 40, 42, 26]);
    poly(ctx, [32, 10, 30, 28, 32, 16]);
  });
  // stump
  spr('tree_stump', 64, 64, function(ctx){
    rc(ctx, 24, 40, 16, 22, 4); ctx.fillStyle = '#4a3a2a'; ctx.fill();
    ctx.fillStyle = '#3a2a1a';
    poly(ctx, [26, 22, 36, 16, 30, 16]);
    poly(ctx, [34, 22, 28, 16, 38, 16]);
  });
  // bush
  spr('tree_bush', 64, 64, function(ctx){
    ctx.fillStyle = '#3a6a2a';
    poly(ctx, [20, 30, 12, 50, 18, 56, 22, 44]);
    poly(ctx, [44, 30, 52, 50, 46, 56, 42, 44]);
    poly(ctx, [32, 26, 24, 44, 30, 54, 38, 50]);
    poly(ctx, [20, 30, 32, 26, 38, 30, 30, 36]);
  });
  // rock
  spr('tree_rock', 64, 64, function(ctx){
    ctx.fillStyle = '#6a6a6a';
    poly(ctx, [24, 40, 10, 54, 18, 60, 30, 46]);
    poly(ctx, [36, 42, 42, 60, 54, 56, 50, 42]);
    poly(ctx, [24, 40, 36, 42, 44, 30, 32, 30]);
  });
  // cactus
  spr('tree_cactus', 64, 96, function(ctx){
    rc(ctx, 26, 58, 12, 30, 3); ctx.fillStyle = '#5a4a2a'; ctx.fill();
    ctx.fillStyle = '#4a9a2a';
    poly(ctx, [32, 30, 16, 58, 32, 70, 48, 58]);
    ctx.fillStyle = '#4a9a2a';
    poly(ctx, [24, 44, 24, 42, 32, 58, 40, 44, 40, 42]);
  });
  // mound
  spr('tree_mound', 64, 64, function(ctx){
    ctx.fillStyle = '#6a6a3a';
    poly(ctx, [16, 30, 8, 50, 24, 58, 34, 46, 46, 52, 36, 34]);
    poly(ctx, [30, 24, 24, 36, 36, 44, 42, 34]);
  });
  // mount (mountain)
  spr('tree_mount', 64, 96, function(ctx){
    ctx.fillStyle = '#4a4a5a';
    poly(ctx, [8, 60, 16, 20, 30, 14, 52, 22, 64, 44, 52, 60]);
    poly(ctx, [24, 48, 16, 20, 30, 14, 36, 24]);
    poly(ctx, [40, 46, 44, 24, 54, 30, 46, 44]);
  });
  // snow (snowy peak)
  spr('tree_snow', 64, 96, function(ctx){
    ctx.fillStyle = '#c8d8e8';
    poly(ctx, [8, 60, 16, 20, 30, 14, 52, 22, 64, 44, 52, 60]);
    ctx.fillStyle = '#e8f0f8';
    poly(ctx, [16, 20, 24, 24, 26, 16, 20, 14]);
    poly(ctx, [44, 22, 52, 26, 56, 18, 48, 16]);
    poly(ctx, [16, 20, 24, 24, 30, 30, 28, 20]);
  });
}

// ── Drawing helpers for creatures (called by buildUnits) ──────────────────
var T = 16; // tunic
var skinPal = ['#e8d8c8', '#d8c8a8', '#c8b898'];
var hairPal = ['#3a2a1a', '#4a3a2a', '#3a4a5a', '#6a4a3a', '#2a4a3a'];
function drawHumanoid(ctx, skin, hair, tunic, shape) {
  // figure scale
  var s = shape || 1;
  // legs
  ctx.fillStyle = skin; // legs bare skin tone variant
  poly(ctx, [18*s, 44*s, 12*s, 58*s, 22*s, 58*s]);
  // feet
  rc(ctx, 10*s, 58*s, 6*s, 8*s, 2); ctx.fillStyle = '#553322'; ctx.fill();
  // torso / body
  ctx.fillStyle = tunic;
  poly(ctx, [26*s, 10*s, 16*s, 32*s, 36*s, 32*s, 26*s, 10*s]);
  // belt
  ctx.fillStyle = '#3a2a1a';
  if (tunic !== '#1a1a1a') { poly(ctx, [24*s, 22*s, 20*s, 32*s, 32*s, 32*s]); }
  // head
  circ(ctx, 30*s, 6*s, 8*s); ctx.fillStyle = skin; ctx.fill();
  // hair
  ctx.fillStyle = hair;
  poly(ctx, [22*s, 8*s, 26*s, 14*s, 32*s, 10*s]);
  poly(ctx, [38*s, 8*s, 32*s, 14*s, 30*s, 10*s]);
  // arms
  ctx.fillStyle = skin;
  poly(ctx, [12*s, 24*s, 18*s, 44*s, 24*s, 44*s]);
  poly(ctx, [48*s, 24*s, 42*s, 44*s, 36*s, 44*s]);
  ctx.fillStyle = '#3a2a1a';
  poly(ctx, [16*s, 26*s, 18*s, 34*s, 20*s, 34*s]);
}
function drawAnimal(ctx, body, head, leg1, leg2, leg3, leg4, belly) {
  ctx.fillStyle = body;
  poly(ctx, [20, 30, 8, 60, 32, 66, 44, 60]);
  ctx.fillStyle = belly;
  poly(ctx, [24, 42, 16, 56, 32, 60, 40, 54]);
  ctx.fillStyle = head;
  circ(ctx, 34, 24, 8);
  ctx.fillStyle = '#2a2a2a';
  poly(ctx, [30, 20, 34, 22, 38, 22]);
  ctx.fillStyle = '#664433';
  poly(ctx, [22, 40, 18, 50, 30, 56, 38, 48]);
}
function drawBird(ctx, body, head, wing) {
  ctx.fillStyle = body;
  ell(ctx, 32, 20, 14, 9); ctx.fill();
  ctx.fillStyle = head;
  circ(ctx, 26, 16, 5); ctx.fill();
  ctx.fillStyle = '#222';
  poly(ctx, [22, 20, 26, 20, 30, 22]);
  ctx.fillStyle = '#88a';
  poly(ctx, [38, 26, 34, 30, 40, 30]);
  ctx.fillStyle = wing;
  poly(ctx, [40, 26, 36, 40, 30, 42, 36, 30]);
}
function drawFish(ctx, body, head, fin) {
  ctx.fillStyle = body;
  poly(ctx, [14, 20, 6, 40, 32, 44, 40, 40]);
  ctx.fillStyle = head;
  circ(ctx, 10, 18, 8); ctx.fill();
  ctx.fillStyle = '#224';
  poly(ctx, [32, 24, 30, 26, 34, 26]);
  ctx.fillStyle = fin;
  poly(ctx, [6, 28, 14, 30, 12, 38, 16, 26]);
}
function drawCritter(ctx, body, head, eye, leg) {
  ctx.fillStyle = body;
  ell(ctx, 30, 18, 18, 10); ctx.fill();
  ctx.fillStyle = head;
  circ(ctx, 24, 10, 8); ctx.fill();
  ctx.fillStyle = eye;
  circ(ctx, 25, 10, 2); ctx.fill();
  ctx.fillStyle = '#664433';
  poly(ctx, [22, 30, 16, 38, 28, 42, 38, 38]);
}
function drawMonster(ctx, body, head, wing, horn) {
  ctx.fillStyle = body;
  poly(ctx, [20, 40, 4, 60, 32, 66, 60, 60]);
  ctx.fillStyle = head;
  circ(ctx, 32, 34, 10); ctx.fill();
  ctx.fillStyle = '#222';
  poly(ctx, [26, 30, 32, 34, 38, 34]);
  ctx.fillStyle = '#442';
  poly(ctx, [34, 66, 30, 58, 38, 58]);
  ctx.fillStyle = wing;
  poly(ctx, [60, 30, 40, 40, 30, 58, 42, 44]);
  ctx.fillStyle = '#666';
  poly(ctx, [32, 22, 28, 24, 36, 26]);
  if (horn) {
    ctx.fillStyle = '#888';
    rc(ctx, 30, 14, 6, 14, 2); ctx.fill();
  }
}
function drawReptile(ctx, body, head, tail, belly) {
  ctx.fillStyle = body;
  poly(ctx, [24, 34, 8, 52, 32, 60, 56, 52]);
  ctx.fillStyle = tail;
  poly(ctx, [8, 52, 16, 38, 24, 36]);
  ctx.fillStyle = head;
  circ(ctx, 30, 30, 10); ctx.fill();
  ctx.fillStyle = '#222';
  poly(ctx, [26, 26, 30, 30, 34, 30]);
  ctx.fillStyle = belly;
  poly(ctx, [30, 46, 24, 52, 36, 56, 42, 50]);
}
function drawMyth(ctx, body, head, wing, horns, tail) {
  ctx.fillStyle = body;
  poly(ctx, [20, 44, 6, 64, 32, 70, 58, 64]);
  ctx.fillStyle = head;
  circ(ctx, 34, 40, 10); ctx.fill();
  ctx.fillStyle = horn;
  poly(ctx, [24, 36, 30, 40, 32, 24]);
  poly(ctx, [44, 36, 40, 40, 38, 24]);
  ctx.fillStyle = wing;
  poly(ctx, [60, 40, 30, 54, 24, 66, 34, 50]);
  ctx.fillStyle = '#666';
  poly(ctx, [32, 30, 26, 36, 34, 40]);
  if (tail) {
    ctx.fillStyle = '#3a5a1a';
    poly(ctx, [4, 60, 16, 58, 24, 66, 12, 62]);
  }
}

// ── Unit sprites (human/elf/dwarf/orc/goblin/giant/merfolk) ─────────────
function buildUnits() {
  var races = ['human','elf','dwarf','orc','goblin','giant','merfolk'];
  var skins = [0, 1, 2];
  var hairs = [0, 1, 2, 3];
  var tunics = [0, 1, 2, 3];
  var names = ['human','elf','dwarf','orc','goblin','giant','merfolk'];
  // race tunic palettes
  var tunicPal = {
    human: ['#4a7a4a','#7a4a3a','#3a4a6a','#8a6a3a'],
    elf:   ['#3a6a8a','#6a3a4a','#3a6a5a','#8a9a4a'],
    dwarf: ['#5a4a3a','#6a5a3a','#4a6a3a','#7a6a3a'],
    orc:   ['#3a5a3a','#6a5a3a','#2a4a2a','#5a6a3a'],
    goblin:['#c8a84a','#8a6a2a','#4a6a3a','#a88a3a'],
    giant: ['#5a4a3a','#6a5a3a','#8a6a4a','#4a5a4a'],
    merfolk:['#3a6a8a','#6a8a6a','#5a4a6a','#4a7a8a']
  };
  // names for each variant slot
  for (var ri = 0; ri < races.length; ri++) {
    var r = races[ri];
    var tn = tunicPal[r] || ['#4a7a4a','#7a4a3a'];
    for (var vi = 0; vi < tn.length; vi++) {
      var skin = skinPal[ri % skins.length];
      var hair = hairPal[(ri*2 + vi*3) % hairs.length];
      spr(r + '_v' + vi, 64, 96, function(ctx, s){
        var c = ctx, r = 'fixed';
        // placeholder replaced below
      }.bind(null, 1)); // shape param
      // need to re-create properly
    }
  }
  // Build sprites with explicit drawing calls (variant loop above re-uses closure).
  // We'll draw each variant directly for clarity.
  var drawVariant = function(race, vi, shape){
    var skin = skinPal[race % skins.length];
    var hair = hairPal[rhi(race) * 2 + vi * 3];
    var tn = tunicPal[race] || ['#4a7a4a','#7a4a3a'];
    var tunic = tn[vi % tn.length];
    spr(race + '_v' + vi, 64, 96, function(ctx, sh){
      drawHumanoid(ctx, skin, hair, tunic, sh || 1.0);
    });
  };
  // define rhi for hair index
  function rhi(r) { return r; }
  // place body variant canvases (drawn once into existing canvases via draw)
  for (var ri = 0; ri < races.length; ri++) {
    var r = races[ri];
    drawVariant(r, 0, 0.9);
    if (r !== 'merfolk') drawVariant(r, 1, 1.0);
  }
  // merfolk (legs as scaled fins, tail)
  spr('merfolk_v0', 64, 96, function(ctx){
    // tail
    ctx.fillStyle = '#3a6a8a';
    poly(ctx, [30, 40, 6, 56, 32, 66, 40, 62]);
    ctx.fillStyle = '#3a5a7a';
    poly(ctx, [20, 40, 10, 44, 32, 50, 28, 46]);
    // legs
    ctx.fillStyle = '#3a7a6a';
    poly(ctx, [28, 44, 20, 56, 36, 58, 34, 52]);
    poly(ctx, [36, 44, 30, 54, 44, 56, 40, 52]);
    // body
    ctx.fillStyle = '#3a6a8a';
    poly(ctx, [26, 18, 18, 36, 42, 36, 36, 18]);
    drawHumanoid(ctx, '#e8f0c8', '#2a4a2a', '#3a6a8a');
  });
}

// ── Building art ──────────────────────────────────────────────────────────
// House in 7 race styles (human, elf, dwarf, orc, goblin, giant, merfolk).
function house(x, y, raceId, lvl, t) {
  var px = x * TS, py = y * TS;
  var h = 1.0, w = 1.0;
  var colors = {
    human:  ['#4a7a5a', '#7a3a2a', '#3a4a6a'],
    elf:    ['#3a6a7a', '#6a3a2a', '#2a5a4a'],
    dwarf:  ['#4a5a3a', '#5a3a2a', '#6a5a4a'],
    orc:    ['#3a5a3a', '#4a4a3a', '#2a5a2a'],
    goblin: ['#6a4a2a', '#8a5a2a', '#4a5a3a'],
    giant:  ['#5a5a5a', '#3a3a3a', '#7a6a4a'],
    merfolk:['#3a6a7a', '#2a5a6a', '#4a7a6a']
  };
  var c = colors[raceId] || colors.human;
  var lw = TS * w, lh = TS * h;
  // body
  rc(tctx, px, py + 4, lw, lh - 4, 4); tctx.fillStyle = c[0]; tctx.fill();
  // roof
  tctx.fillStyle = c[1];
  poly(tctx, [px, py, px + lw/2, py - 6, px + lw, py]);
  // roof line
  tctx.strokeStyle = '#2a2a2a'; tctx.lineWidth = 1;
  tctx.beginPath(); tctx.moveTo(px, py); tctx.lineTo(px + lw/2, py - 6); tctx.lineTo(px + lw, py); tctx.stroke();
  // windows
  tctx.fillStyle = '#e8d8c8';
  var ww = lw/4, wh = lw/6;
  for (var i = 0; i < 2; i++) {
    for (var j = 0; j < 2; j++) {
      tctx.fillRect(px + 4 + j*(lw/2), py + 6 + i*(lh/3), ww, wh);
      // glow
      tctx.fillStyle = 'rgba(255,200,150,0.4)';
      tctx.fillRect(px + 4 + j*(lw/2) + 1, py + 6 + i*(lh/3) + 1, ww - 2, wh - 2);
    }
  }
  // chimney
  if (raceId === 'giant' || raceId === 'dwarf') {
    tctx.fillStyle = '#3a2a1a';
    rc(tctx, px + lw - (raceId === 'giant' ? 12 : 8), py - 10, 8, 12, 2); tctx.fill();
  }
}

function hall(x, y, raceId, lvl, t) {
  // multi-level hall with towers; grows a tower as level increases
  var px = x * TS, py = y * TS, s = 1;
  if (lvl >= 2) s = lvl * 0.35;
  var lw = TS * (1 + s);
  // base
  rc(tctx, px - (lw - TS)/2, py + 2, lw, TS - 4, 4); tctx.fillStyle = '#3a6a4a'; tctx.fill();
  // towers
  for (var i = 0; i < 2; i++) {
    var tx = px + (i - 0.5) * lw;
    rc(tctx, tx - 4, py - 2, 8, TS - 2 + s, 2); tctx.fillStyle = '#4a5a3a'; tctx.fill();
    // tower top
    tctx.fillStyle = '#3a4a2a';
    poly(tctx, [tx - 6, py - 2 + s, tx, py - 6, tx + 6, py - 2 + s]);
  }
  // windows
  tctx.fillStyle = '#e8d8c8';
  for (var i = 0; i < 3; i++) {
    tctx.fillRect(px + 4 + i*6, py + 6, 3, 3);
  }
  // flag
  tctx.fillStyle = '#ff8800';
  rc(tctx, px + lw/2 - 3, py - 8, 6, 8, 2); tctx.fill();
  tctx.fillStyle = '#ff0';
  poly(tctx, [px + lw/2 - 2, py - 8, px + lw/2 - 2, py - 14, px + lw/2 + 4, py - 12]);
}

// Building-type icons (house/farm/mine/market/temple/barracks/tower)
function btSprite(b, l) {
  var ix = { house:0, farm:1, mine:2, market:3, temple:4, barracks:5, tower:6 };
  var i = ix[b] || 0;
  var glyphs = ['#4a7a3a','#4a8a3a','#4a4a7a','#7a4a3a','#6a3a6a','#7a4a3a','#3a4a6a'];
  var g = glyphs[i] || '#888';
  spr('bt_' + b, 32, 32, function(ctx){
    ctx.fillStyle = g;
    rc(ctx, 3, 3, 26, 26, 4); ctx.fill();
  });
}

// Scaffold / construction markers
function scaffold(x, y, t, lvl, f) {
  var px = x * TS, py = y * TS;
  tctx.strokeStyle = 'rgba(255,255,255,0.35)';
  tctx.lineWidth = 1;
  tctx.beginPath(); tctx.moveTo(px, py); tctx.lineTo(px + TS, py + TS); tctx.stroke();
  tctx.beginPath(); tctx.moveTo(px + TS, py); tctx.lineTo(px, py + TS); tctx.stroke();
  tctx.fillStyle = 'rgba(255,255,255,0.3)';
  rc(tctx, px - 1, py - 1, TS + 2, TS + 2, 3); tctx.fill();
  if (f > 0 && f <= 100) {
    tctx.fillStyle = 'rgba(255,200,50,' + (f/100) + ')';
    rc(tctx, px + 2, py + 2, TS - 4, 3, 1); tctx.fill();
  }
}

