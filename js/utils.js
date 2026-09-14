// Shared helpers for all topic pages. Plain globals (no bundler, no build step)
// so the site can be opened straight from GitHub Pages or a static file server.

// Two palettes, kept in sync with the CSS custom properties in style.css.
// Canvas drawing can't read var(--x) directly, so COLORS is a plain object
// whose values get overwritten in place on theme switch — every page reads
// COLORS.xxx fresh on each animation frame, so a toggle repaints instantly.
const PALETTE = {
  dark: {
    amber: '#ffb454', cyan: '#56c8f5', violet: '#a78bfa', green: '#6fdd8b', red: '#ff6b6b',
    fg: '#e6edf3', dim: '#9aa7b4', mute: '#6e7d8c', line: '#2a323d', panel2: '#1b222c',
  },
  light: {
    amber: '#c2650c', cyan: '#0a7ea4', violet: '#7c3aed', green: '#15803d', red: '#dc2626',
    fg: '#1b2430', dim: '#4a5568', mute: '#71808f', line: '#dbe1e7', panel2: '#eef1f4',
  },
};
const COLORS = { ...PALETTE.dark };

function setTheme(theme) {
  theme = theme === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem('et-theme', theme); } catch (e) { /* private browsing */ }
  Object.assign(COLORS, PALETTE[theme]);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'light' ? '🌙 Dunkler Modus' : '☀️ Heller Modus';
}

function initTheme() {
  let theme = 'dark';
  try { theme = localStorage.getItem('et-theme') || 'dark'; } catch (e) { /* private browsing */ }
  setTheme(theme);
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  }
  for (const c of [].concat(children)) {
    if (c == null) continue;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return node;
}

// Sets up a canvas for crisp rendering on HiDPI screens and returns the 2D context.
// cssHeight is fixed; width tracks the container responsively via ResizeObserver.
function setupCanvas(canvas, cssHeight) {
  const ctx = canvas.getContext('2d');
  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(320, rect.width);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(cssHeight * dpr);
    canvas.style.height = cssHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);
  canvas._ro = ro;
  return ctx;
}

function cssW(canvas) {
  return canvas.parentElement.getBoundingClientRect().width;
}
function cssH(canvas) {
  return parseFloat(canvas.style.height);
}

// ---------- Small reusable UI builders ----------

function slider({ id, label, min, max, step, value, unit = '', format }) {
  const fmt = format || ((v) => v);
  const row = el('div', { class: 'slider-row' });
  const lab = el('label', {}, [
    document.createTextNode(label + ' '),
    el('span', { class: 'val', id: id + '-val' }, fmt(value) + unit),
  ]);
  const input = el('input', {
    type: 'range', min, max, step, value, id,
  });
  input.addEventListener('input', () => {
    document.getElementById(id + '-val').textContent = fmt(parseFloat(input.value)) + unit;
  });
  row.appendChild(lab);
  row.appendChild(input);
  return { row, input };
}

function readout(label, id, initial = '–') {
  return el('div', { class: 'readout' }, [
    el('div', { class: 'rlabel' }, label),
    el('div', { class: 'rval', id }, initial),
  ]);
}

function legendItem(color, text, shape = 'dot') {
  return el('div', { class: 'legend-item' }, [
    el('span', { class: shape === 'dot' ? 'legend-dot' : 'legend-line', style: `background:${color}` }),
    document.createTextNode(text),
  ]);
}

// ---------- Canvas drawing primitives for circuit diagrams ----------

function drawWire(ctx, x1, y1, x2, y2, color = COLORS.dim, width = 2) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// horizontal zig-zag resistor centered at (cx, cy), total length "len"
function drawResistor(ctx, cx, cy, len, color = COLORS.fg, label = '') {
  const bodyLen = Math.min(len * 0.55, 60);
  const x0 = cx - len / 2, x1 = cx + len / 2;
  const bx0 = cx - bodyLen / 2, bx1 = cx + bodyLen / 2;
  drawWire(ctx, x0, cy, bx0, cy, color);
  drawWire(ctx, bx1, cy, x1, cy, color);
  const teeth = 6;
  const seg = bodyLen / teeth;
  const amp = 9;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(bx0, cy);
  for (let i = 0; i < teeth; i++) {
    const x = bx0 + seg * (i + 1);
    const y = cy + (i % 2 === 0 ? -amp : amp);
    ctx.lineTo(x, i === teeth - 1 ? cy : y);
  }
  ctx.stroke();
  if (label) {
    ctx.fillStyle = COLORS.dim;
    ctx.font = '12px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, cx, cy - amp - 8);
  }
}

// battery symbol centered at (cx,cy), vertical, height "len"
function drawBattery(ctx, cx, cy, len, color = COLORS.fg, label = '') {
  const y0 = cy - len / 2, y1 = cy + len / 2;
  drawWire(ctx, cx, y0, cx, cy - 12, color);
  drawWire(ctx, cx, cy + 12, cx, y1, color);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(cx - 14, cy - 8); ctx.lineTo(cx + 14, cy - 8); ctx.stroke();
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx - 8, cy + 8); ctx.lineTo(cx + 8, cy + 8); ctx.stroke();
  if (label) {
    ctx.fillStyle = COLORS.dim;
    ctx.font = '12px ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(label, cx + 18, cy + 4);
  }
}

// parallel-plate capacitor centered at (cx,cy), vertical orientation, gap "len"
function drawCapacitor(ctx, cx, cy, len, color = COLORS.fg, label = '', chargeFrac = 0) {
  const half = len / 2;
  drawWire(ctx, cx, cy - 40, cx, cy - half, color);
  drawWire(ctx, cx, cy + half, cx, cy + 40, color);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(cx - 16, cy - half); ctx.lineTo(cx + 16, cy - half); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - 16, cy + half); ctx.lineTo(cx + 16, cy + half); ctx.stroke();
  if (Math.abs(chargeFrac) > 0.02) {
    const n = Math.round(Math.abs(chargeFrac) * 7) + 1;
    const posColor = chargeFrac > 0 ? COLORS.amber : COLORS.cyan;
    const negColor = chargeFrac > 0 ? COLORS.cyan : COLORS.amber;
    ctx.font = '11px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = posColor;
    for (let i = 0; i < n; i++) ctx.fillText('+', cx - 16 + (32 / (n + 1)) * (i + 1), cy - half - 6);
    ctx.fillStyle = negColor;
    for (let i = 0; i < n; i++) ctx.fillText('–', cx - 16 + (32 / (n + 1)) * (i + 1), cy + half + 14);
  }
  if (label) {
    ctx.fillStyle = COLORS.dim;
    ctx.font = '12px ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(label, cx + 24, cy + 4);
  }
}

// same zig-zag resistor, but rotated by "angle" radians around (cx,cy) — used for
// vertical or diagonal branches. Caller draws its own label (position varies by layout).
function drawResistorRot(ctx, cx, cy, len, angle, color = COLORS.fg) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  drawResistor(ctx, 0, 0, len, color, '');
  ctx.restore();
}

function drawArrowHead(ctx, x, y, angle, size = 7, color = COLORS.fg) {
  ctx.fillStyle = color;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size, size * 0.55);
  ctx.lineTo(-size, -size * 0.55);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawArrow(ctx, x1, y1, x2, y2, color = COLORS.fg, width = 2) {
  drawWire(ctx, x1, y1, x2, y2, color, width);
  drawArrowHead(ctx, x2, y2, Math.atan2(y2 - y1, x2 - x1), 6 + width, color);
}

// rounded rect helper
function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// ---------- Mini strip-chart plotter for u(t)/i(t) curves ----------
// series: [{data:[{t,v}], color}], all in a simple auto-scaled axes box.
function drawStripChart(ctx, x, y, w, h, series, opts = {}) {
  ctx.save();
  ctx.strokeStyle = COLORS.line;
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);

  let tMin = Infinity, tMax = -Infinity, vMin = opts.vMin ?? Infinity, vMax = opts.vMax ?? -Infinity;
  const autoV = opts.vMin === undefined;
  for (const s of series) {
    for (const p of s.data) {
      tMin = Math.min(tMin, p.t); tMax = Math.max(tMax, p.t);
      if (autoV) { vMin = Math.min(vMin, p.v); vMax = Math.max(vMax, p.v); }
    }
  }
  if (!isFinite(tMin)) { ctx.restore(); return; }
  if (tMax === tMin) tMax = tMin + 1;
  if (vMax === vMin) { vMax += 1; vMin -= 1; }
  const pad = (vMax - vMin) * 0.12;
  vMin -= pad; vMax += pad;

  // zero line
  if (vMin < 0 && vMax > 0) {
    const zy = y + h - ((0 - vMin) / (vMax - vMin)) * h;
    ctx.strokeStyle = COLORS.line;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(x, zy); ctx.lineTo(x + w, zy); ctx.stroke();
    ctx.setLineDash([]);
  }

  for (const s of series) {
    if (s.data.length < 2) continue;
    ctx.strokeStyle = s.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    s.data.forEach((p, i) => {
      const px = x + ((p.t - tMin) / (tMax - tMin)) * w;
      const py = y + h - ((p.v - vMin) / (vMax - vMin)) * h;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.stroke();
  }
  ctx.restore();
  return { tMin, tMax, vMin, vMax };
}

// Builds a lookup path from a list of {x1,y1,x2,y2} segments so a scalar t in [0,1)
// can be mapped to a point + direction angle, proportional to segment length.
// Used to animate current-flow dots along a wire loop.
function makePath(segments) {
  const lens = segments.map((s) => Math.hypot(s.x2 - s.x1, s.y2 - s.y1));
  const total = lens.reduce((a, b) => a + b, 0);
  return {
    total,
    at(t) {
      let d = ((t % 1) + 1) % 1 * total;
      for (let i = 0; i < segments.length; i++) {
        if (d <= lens[i] || i === segments.length - 1) {
          const s = segments[i];
          const f = lens[i] === 0 ? 0 : d / lens[i];
          return {
            x: s.x1 + (s.x2 - s.x1) * f,
            y: s.y1 + (s.y2 - s.y1) * f,
            angle: Math.atan2(s.y2 - s.y1, s.x2 - s.x1),
          };
        }
        d -= lens[i];
      }
      return { x: segments[0].x1, y: segments[0].y1, angle: 0 };
    },
  };
}

// Renders one or more LaTeX lines (a string, or an array of strings for a
// multi-line formula block) as a ".formula" box via KaTeX. Falls back to
// plain text if katex.js failed to load or a line has a syntax error, so a
// broken formula never blanks out the page.
function formulaBlock(latex) {
  const lines = Array.isArray(latex) ? latex : [latex];
  const box = el('div', { class: 'formula' });
  lines.forEach((line) => {
    const row = el('div', { class: 'formula-line' });
    if (window.katex) {
      try {
        row.innerHTML = katex.renderToString(line, { displayMode: true, throwOnError: false, strict: false });
      } catch (e) {
        row.textContent = line;
      }
    } else {
      row.textContent = line;
    }
    box.appendChild(row);
  });
  return box;
}

// Builds a "Beispielaufgabe" (worked example) block in PVK style:
// given values, numbered solution steps (each optionally with a formula line), a boxed result.
// given: [[label, value], ...]   steps: [string | {text, formula}]   result: {label, value}
function exampleBox({ given, steps, result }) {
  const box = el('div', { class: 'example-box' });
  box.appendChild(el('span', { class: 'example-tag' }, 'Beispielaufgabe (PVK-Stil)'));

  const givenGrid = el('div', { class: 'example-given' });
  given.forEach(([label, value]) => {
    givenGrid.appendChild(el('div', {}, [
      el('div', { class: 'eg-label' }, label),
      el('div', {}, value),
    ]));
  });
  box.appendChild(givenGrid);

  const ol = el('ol', { class: 'example-steps' });
  steps.forEach((step) => {
    const isObj = typeof step === 'object';
    const li = el('li', {}, isObj ? step.text : step);
    if (isObj && step.formula) li.appendChild(formulaBlock(step.formula));
    ol.appendChild(li);
  });
  box.appendChild(ol);

  box.appendChild(el('div', { class: 'example-result' }, [
    el('span', { class: 'er-label' }, result.label || 'Ergebnis'),
    el('span', { class: 'er-value' }, result.value),
  ]));
  return box;
}

function fmtNum(v, digits = 2) {
  if (!isFinite(v)) return '–';
  if (Math.abs(v) >= 1000 || (Math.abs(v) < 0.001 && v !== 0)) return v.toExponential(digits);
  return v.toFixed(digits);
}
