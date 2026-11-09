// Prüfungsaufgabe FS 25 (c): Stab auf Schienen neben einem unendlich langen Draht.
// Wird am Ende von pages/induktion.js über renderInduktionFS25(container) eingehängt.
//
// Ablauf für die Übungsstunde (Phasen-Buttons oben im Panel):
//   ① Aufgabe     – nur die Animation (Feld, wachsende Fläche A(t)), Graphen verdeckt
//   ② Lösungsweg  – Rechenschritte einzeln aufdecken
//   ③ Graphen     – Φ(t), u_ind(t), i_stab(t) laufen live mit, Stromrichtung im Stab sichtbar
//
// Physik:  B(x) = μ0·I0/(2πx) (ins Blatt, −e_z)
//          Φ(t) = −(μ0·I0·l/2π)·ln(1 + vt/a)      (dA in +e_z wie in der Musterlösung)
//          u_ind = −dΦ/dt = (μ0·I0·l/2π)·v/(a+vt),  i_stab = u_ind/R,  Richtung im Stab: +y

function renderInduktionFS25(container) {
  const X_MAX_CM = 40;   // sichtbarer Bereich rechts vom Draht (cm)
  const I0 = 100;        // A
  const L_M = 0.10;      // Schleifenhöhe l = 10 cm
  const K_UWB = 2e-7 * I0 * L_M * 1e6; // μ0·I0·l/(2π) in µWb  (= 2 µWb)

  container.appendChild(el('h2', {}, [el('span', { class: 'h2-num' }, '4 ·'), 'Prüfungsaufgabe FS 25: Stab neben einem stromdurchflossenen Draht']));
  container.appendChild(el('p', {}, 'Hier ist das Feld nicht homogen: B fällt mit 1/x ab. Erst die Situation anschauen, dann gemeinsam lösen, dann die Graphen aufdecken.'));

  // ---------- Aufgabenstellung ----------
  const task = el('div', { class: 'example-box' });
  task.appendChild(el('span', { class: 'example-tag' }, 'Prüfung FS 25 · Teilaufgabe (c) · 3 P'));
  task.appendChild(el('p', { style: 'margin:4px 0 10px;color:var(--fg-dim);font-size:14px' },
    'Ein perfekt leitender Stab (Masse m) gleitet reibungsfrei mit konstanter Geschwindigkeit v nach rechts. Er schliesst zusammen mit zwei Schienen und dem Widerstand R eine rechteckige Schleife der Höhe l. Links liegt bei x = 0 ein unendlich langer Draht parallel zur y-Achse mit dem konstanten Strom I₀. Der Widerstand sitzt bei x = a.'));
  task.appendChild(el('p', { style: 'margin:0;font-size:14.5px' }, [
    el('strong', {}, 'Frage: '),
    'Zum Zeitpunkt t = 0 befindet sich der Stab bei x = a. Wie gross ist der Strom i_stab(t) im Stab, und in welche Richtung fliesst er?',
  ]));
  container.appendChild(task);

  // ---------- Simulationspanel ----------
  const panel = el('div', { class: 'sim-panel' });
  const toolbar = el('div', { class: 'sim-toolbar' });
  const stageBtns = [
    el('button', { class: 'btn active' }, '① Aufgabe'),
    el('button', { class: 'btn' }, '② Lösungsweg'),
    el('button', { class: 'btn' }, '③ Graphen & Stromrichtung'),
  ];
  stageBtns.forEach((b) => toolbar.appendChild(b));
  toolbar.appendChild(el('span', { style: 'flex:1' }));
  const playBtn = el('button', { class: 'btn primary' }, '⏸ läuft');
  const resetBtn = el('button', { class: 'btn' }, '↺ von vorn');
  toolbar.appendChild(playBtn); toolbar.appendChild(resetBtn);
  panel.appendChild(toolbar);

  const wrap = el('div', { class: 'two-col' });
  const leftWrap = el('div', { class: 'sim-canvas-wrap' });
  const sceneCanvas = el('canvas');
  leftWrap.appendChild(sceneCanvas);
  const rightWrap = el('div', { class: 'sim-canvas-wrap' });
  const chartCanvas = el('canvas');
  rightWrap.appendChild(chartCanvas);
  wrap.appendChild(leftWrap); wrap.appendChild(rightWrap);
  panel.appendChild(wrap);

  const roT = 'fs25-ro-t', roX = 'fs25-ro-x', roPhi = 'fs25-ro-phi', roU = 'fs25-ro-u', roI = 'fs25-ro-i';
  panel.appendChild(el('div', { class: 'readout-row' }, [
    readout('Zeit t', roT), readout('Stab bei x', roX),
    readout('Fluss Φ', roPhi, '?'), readout('Spannung u_ind', roU, '?'), readout('Strom i_stab', roI, '?'),
  ]));

  const grid = el('div', { class: 'controls-grid' });
  const sA = slider({ id: 'fs25-a', label: 'Abstand a', min: 3, max: 10, step: 0.5, value: 5, unit: ' cm' });
  const sV = slider({ id: 'fs25-v', label: 'Geschwindigkeit v', min: 1, max: 8, step: 0.5, value: 4, unit: ' cm/s' });
  const sR = slider({ id: 'fs25-r', label: 'Widerstand R', min: 0.1, max: 2, step: 0.1, value: 0.5, unit: ' Ω', format: (v) => v.toFixed(1) });
  [sA, sV, sR].forEach((s) => grid.appendChild(s.row));
  panel.appendChild(grid);
  panel.appendChild(el('p', { class: 'note', style: 'margin:10px 0 0' },
    `Feste Werte: I₀ = ${I0} A, l = ${L_M * 100} cm  →  μ₀I₀l/(2π) = ${K_UWB} µWb. Das Kreuzraster zeigt B ins Blatt — je grösser das ×, desto stärker das Feld.`));
  container.appendChild(panel);

  // ---------- Lösungsweg (Schritt für Schritt) ----------
  const solBox = el('div', { class: 'example-box', style: 'display:none' });
  solBox.appendChild(el('span', { class: 'example-tag' }, 'Lösungsweg'));
  const steps = [
    { text: 'Ansatz: Der Stab ist ideal leitend, also liegt die ganze induzierte Spannung am Widerstand (Ohm).',
      formula: 'i_{stab} = \\dfrac{u_{ind}}{R}' },
    { text: 'Induktionsgesetz: Die Spannung kommt von der Flussänderung — hier ändert sich nur die Fläche A(t), aber B ist nicht überall gleich!',
      formula: 'u_{ind} = -\\dfrac{d\\Phi}{dt}, \\qquad \\Phi = \\iint_{A(t)} \\vec B \\cdot d\\vec A' },
    { text: 'Feld des unendlich langen Drahts (Ampère, rechte Hand): rechts vom Draht zeigt B ins Blatt.',
      formula: '\\vec B(x) = -\\dfrac{\\mu_0 I_0}{2\\pi x}\\,\\vec e_z' },
    { text: 'Fluss: Weil B von x abhängt, muss über x integriert werden (nicht einfach B·A!). Mit dA = dx·dy in +e_z:',
      formula: '\\Phi(t) = \\int_a^{a+vt}\\!\\int_0^{l} -\\dfrac{\\mu_0 I_0}{2\\pi x}\\,dy\\,dx = -\\dfrac{\\mu_0 I_0\\, l}{2\\pi}\\,\\ln\\!\\left(1+\\dfrac{vt}{a}\\right)' },
    { text: 'Ableiten (Kettenregel):',
      formula: 'u_{ind} = -\\dfrac{d\\Phi}{dt} = \\dfrac{\\mu_0 I_0\\, l}{2\\pi}\\cdot\\dfrac{v}{a+vt}' },
    { text: 'Strom im Stab:',
      formula: 'i_{stab}(t) = \\dfrac{\\mu_0 I_0\\, l}{2\\pi R}\\cdot\\dfrac{v}{a+vt}' },
    { text: 'Richtung (Lenz): Der Fluss ins Blatt wächst → der induzierte Strom erzeugt ein Gegenfeld aus dem Blatt heraus → Strom im Gegenuhrzeigersinn → im Stab nach oben (+y). Check mit Lorentzkraft: q·v·e_x × (−B·e_z) = +q·v·B·e_y ✓' },
  ];
  const ol = el('ol', { class: 'example-steps' });
  const lis = steps.map((s) => {
    const li = el('li', { style: 'display:none' }, s.text);
    if (s.formula) li.appendChild(formulaBlock(s.formula));
    ol.appendChild(li);
    return li;
  });
  solBox.appendChild(ol);
  const result = el('div', { class: 'example-result', style: 'display:none' }, [
    el('span', { class: 'er-label' }, 'Ergebnis'),
    el('span', { class: 'er-value' }, 'i_stab(t) = μ₀I₀l·v / (2πR·(a+vt)),  im Stab nach oben (Gegenuhrzeigersinn)'),
  ]);
  solBox.appendChild(result);
  const stepBar = el('div', { class: 'sim-toolbar', style: 'margin:12px 0 0' });
  const prevStep = el('button', { class: 'btn' }, '◂ zurück');
  const nextStep = el('button', { class: 'btn primary' }, 'Nächster Schritt ▸');
  const allStep = el('button', { class: 'btn' }, 'Alle zeigen');
  const stepInfo = el('span', { class: 'note', style: 'margin:0 0 0 6px' }, '');
  [prevStep, nextStep, allStep, stepInfo].forEach((b) => stepBar.appendChild(b));
  solBox.appendChild(stepBar);
  container.appendChild(solBox);

  let shownSteps = 0;
  function updateSteps() {
    lis.forEach((li, i) => { li.style.display = i < shownSteps ? '' : 'none'; });
    result.style.display = shownSteps >= steps.length ? '' : 'none';
    stepInfo.textContent = `Schritt ${shownSteps} / ${steps.length}`;
  }
  prevStep.addEventListener('click', () => { shownSteps = Math.max(0, shownSteps - 1); updateSteps(); });
  nextStep.addEventListener('click', () => { shownSteps = Math.min(steps.length, shownSteps + 1); updateSteps(); });
  allStep.addEventListener('click', () => { shownSteps = steps.length; updateSteps(); });
  updateSteps();

  const insight = el('div', { class: 'callout info', style: 'display:none' }, [
    el('span', { class: 'callout-label' }, 'Was die Graphen zeigen'),
    el('ul', {}, [
      el('li', {}, ['|Φ| wächst, aber nur ', el('strong', {}, 'logarithmisch'), ': jeder neue Streifen der Fläche liegt weiter weg vom Draht, wo B schwächer ist.']),
      el('li', {}, ['u_ind und i_stab fallen wie ', el('strong', {}, '1/(a+vt)'), ' — obwohl v konstant ist. Die gestrichelte Linie zeigt, was ein homogenes Feld B(a) liefern würde: dort wäre u = B·l·v konstant.']),
      el('li', {}, ['Schneller Kontrollweg: u_ind = B(x_stab)·l·v — die Bewegungsinduktion am Stab liefert direkt dasselbe Ergebnis.']),
      el('li', {}, ['Weiterdenken: Welche Kraft braucht es, damit v konstant bleibt? (F = i_stab·l·B(x) ∝ 1/(a+vt)², bremsend nach Lenz.)']),
    ]),
  ]);
  container.appendChild(insight);

  // ---------- Zustand ----------
  const ctxS = setupCanvas(sceneCanvas, 300);
  const ctxG = setupCanvas(chartCanvas, 300);
  let stage = 1, running = true, simT = 0, last = performance.now(), dotOffset = 0;

  const p = () => ({ a: parseFloat(sA.input.value), v: parseFloat(sV.input.value), R: parseFloat(sR.input.value) });
  const tEnd = ({ a, v }) => (X_MAX_CM - a) / v;
  const phiAt = (t, { a, v }) => -K_UWB * Math.log(1 + (v * t) / a);       // µWb
  const uAt = (t, { a, v }) => K_UWB * v / (a + v * t);                     // µV (v/a in 1/s)
  const iAt = (t, q) => uAt(t, q) / q.R;                                    // µA

  function restart() { simT = 0; running = true; playBtn.textContent = '⏸ läuft'; }
  function setStage(s) {
    stage = s;
    stageBtns.forEach((b, i) => { b.className = 'btn' + (i + 1 === s ? ' active' : ''); });
    solBox.style.display = s >= 2 ? '' : 'none';
    insight.style.display = s >= 3 ? '' : 'none';
    if (s === 3) restart();
  }
  stageBtns.forEach((b, i) => b.addEventListener('click', () => setStage(i + 1)));
  playBtn.addEventListener('click', () => {
    if (simT >= tEnd(p())) { restart(); return; }
    running = !running; playBtn.textContent = running ? '⏸ läuft' : '▶ pausiert';
  });
  resetBtn.addEventListener('click', restart);
  [sA, sV, sR].forEach((s) => s.input.addEventListener('input', restart));

  function frame(now) {
    if (!sceneCanvas.isConnected) return;
    const dt = Math.min(0.04, (now - last) / 1000); last = now;
    const q = p();
    const T = tEnd(q);
    if (running) {
      simT += dt;
      if (simT >= T) { simT = T; running = false; playBtn.textContent = '↺ nochmal'; }
    }
    const xcm = q.a + q.v * simT;
    const reveal = stage >= 3;

    document.getElementById(roT).textContent = simT.toFixed(2) + ' s';
    document.getElementById(roX).textContent = xcm.toFixed(1) + ' cm';
    document.getElementById(roPhi).textContent = reveal ? fmtNum(phiAt(simT, q), 2) + ' µWb' : '?';
    document.getElementById(roU).textContent = reveal ? fmtNum(uAt(simT, q), 2) + ' µV' : '?';
    document.getElementById(roI).textContent = reveal ? fmtNum(iAt(simT, q), 2) + ' µA' : '?';

    if (running && reveal) dotOffset += dt * 70 * (uAt(simT, q) / uAt(0, q));
    drawScene(q, xcm, reveal);
    drawCharts(q, reveal);
    requestAnimationFrame(frame);
  }

  function drawScene(q, xcm, reveal) {
    const W = cssW(sceneCanvas), H = 300;
    const c = ctxS;
    c.clearRect(0, 0, W, H);
    const Xw = 40;
    const ppc = (W - Xw - 22) / X_MAX_CM;          // px pro cm
    const X = (cm) => Xw + cm * ppc;
    const cy = 135, lPx = 130, topY = cy - lPx / 2, botY = cy + lPx / 2;
    const xa = X(q.a), xr = X(xcm);

    // Fläche A(t)
    c.fillStyle = 'rgba(255,180,84,0.13)';
    c.fillRect(xa, topY, xr - xa, lPx);

    // B-Feld: Kreuze, Grösse ~ 1/x
    for (let gx = Xw + 16; gx < W - 6; gx += 22) {
      const xc = (gx - Xw) / ppc;
      const k = Math.min(1, 3 / xc);
      const s = 2 + 6 * k;
      c.globalAlpha = 0.25 + 0.6 * k;
      c.strokeStyle = COLORS.violet; c.lineWidth = 1.4;
      for (let gy = 22; gy < H - 52; gy += 22) {
        c.beginPath();
        c.moveTo(gx - s, gy - s); c.lineTo(gx + s, gy + s);
        c.moveTo(gx + s, gy - s); c.lineTo(gx - s, gy + s);
        c.stroke();
      }
    }
    c.globalAlpha = 1;

    // Draht bei x = 0 mit I0 nach oben
    c.setLineDash([5, 4]);
    drawWire(c, Xw, 8, Xw, H - 40, COLORS.fg, 2);
    c.setLineDash([]);
    drawArrow(c, Xw, cy + 30, Xw, cy - 30, COLORS.amber, 2.5);
    c.fillStyle = COLORS.amber; c.font = '13px ui-monospace, monospace'; c.textAlign = 'right';
    c.fillText('I₀', Xw - 8, cy + 4);

    // Schienen (laufen weiter nach rechts), Widerstand
    drawWire(c, xa, topY, W - 8, topY, COLORS.dim, 2);
    drawWire(c, xa, botY, W - 8, botY, COLORS.dim, 2);
    drawResistorRot(c, xa, cy, lPx, Math.PI / 2, COLORS.fg);
    c.fillStyle = COLORS.dim; c.font = '12px ui-monospace, monospace'; c.textAlign = 'right';
    c.fillText('R', xa - 12, cy + 4);

    // Stromfluss (nur in Phase 3): Gegenuhrzeigersinn
    if (reveal && xr - xa > 4) {
      const path = makePath([
        { x1: xr, y1: botY, x2: xr, y2: topY },
        { x1: xr, y1: topY, x2: xa, y2: topY },
        { x1: xa, y1: topY, x2: xa, y2: botY },
        { x1: xa, y1: botY, x2: xr, y2: botY },
      ]);
      const spacing = 20, n = Math.max(1, Math.floor(path.total / spacing));
      c.fillStyle = COLORS.amber;
      for (let k = 0; k < n; k++) {
        const pt = path.at((dotOffset + k * path.total / n) / path.total);
        c.beginPath(); c.arc(pt.x, pt.y, 3, 0, Math.PI * 2); c.fill();
      }
    }

    // Stab
    c.fillStyle = reveal ? COLORS.amber : COLORS.fg;
    c.fillRect(xr - 3.5, topY - 14, 7, lPx + 28);

    // v-Pfeil
    drawArrow(c, xr + 8, topY - 22, xr + 42, topY - 22, COLORS.cyan, 2);
    c.fillStyle = COLORS.cyan; c.font = '12px ui-monospace, monospace'; c.textAlign = 'left';
    c.fillText('v', xr + 46, topY - 18);

    // Stromrichtung im Stab
    if (reveal) {
      const ax = Math.min(xr + 16, W - 14);
      drawArrow(c, ax, cy + 22, ax, cy - 22, COLORS.amber, 2.5);
      c.fillStyle = COLORS.amber; c.textAlign = ax > W - 80 ? 'right' : 'left';
      c.fillText('i_stab', ax > W - 80 ? ax - 8 : ax + 8, cy + 4);
    }

    // Beschriftungen
    if (xr - xa > 34) {
      c.fillStyle = COLORS.dim; c.font = '12px ui-monospace, monospace'; c.textAlign = 'center';
      c.fillText('A(t)', (xa + xr) / 2, cy + 4);
    }
    const dimY = botY + 26;
    drawArrow(c, Xw + 2, dimY, xa - 2, dimY, COLORS.mute, 1.2);
    drawArrow(c, xa - 2, dimY, Xw + 2, dimY, COLORS.mute, 1.2);
    c.fillStyle = COLORS.mute; c.font = '11.5px ui-monospace, monospace'; c.textAlign = 'center';
    c.fillText('a', (Xw + xa) / 2, dimY - 5);
    c.textAlign = 'left';
    c.fillText('x = 0', Xw - 18, H - 24);
    c.textAlign = 'center';
    c.fillText('x = ' + xcm.toFixed(1) + ' cm', xr, botY + 48);
    c.textAlign = 'right';
    c.fillText('B ⊗ ins Blatt, |B| ~ 1/x', W - 10, H - 8);
  }

  function drawPanel(c, x, y, w, h, o) {
    // o: {title, color, fn, tEnd, tNow, yMin, yMax, unit, ghost, reveal}
    c.strokeStyle = COLORS.line; c.lineWidth = 1;
    c.strokeRect(x, y, w, h);
    c.fillStyle = o.color; c.font = '11px ui-monospace, monospace'; c.textAlign = 'left';
    c.fillText(o.title, x, y - 5);
    if (o.reveal) { c.fillStyle = COLORS.mute; c.textAlign = 'right'; c.fillText('[' + o.unit + ']', x + w, y - 5); }
    if (!o.reveal) {
      c.fillStyle = COLORS.mute; c.font = '22px ui-monospace, monospace'; c.textAlign = 'center';
      c.fillText('?', x + w / 2, y + h / 2 + 8);
      return;
    }
    const Y = (v) => y + h - ((v - o.yMin) / (o.yMax - o.yMin)) * h;
    const Xt = (t) => x + (t / o.tEnd) * w;
    // Nulllinie
    if (o.yMin < 0 && o.yMax >= 0) {
      c.setLineDash([3, 3]); c.strokeStyle = COLORS.line;
      c.beginPath(); c.moveTo(x, Y(0)); c.lineTo(x + w, Y(0)); c.stroke(); c.setLineDash([]);
    }
    // Achsenwerte
    c.fillStyle = COLORS.mute; c.font = '10px ui-monospace, monospace'; c.textAlign = 'right';
    const ext = Math.abs(o.yMin) > Math.abs(o.yMax) ? o.yMin : o.yMax;
    c.fillText(ext.toFixed(1), x - 4, Y(ext) + 4);
    c.fillText('0', x - 4, Y(0) + 4);
    // Vergleichslinie
    if (o.ghost !== undefined) {
      c.setLineDash([5, 4]); c.strokeStyle = COLORS.mute; c.lineWidth = 1.3;
      c.beginPath(); c.moveTo(x, Y(o.ghost)); c.lineTo(x + w, Y(o.ghost)); c.stroke(); c.setLineDash([]);
      c.fillStyle = COLORS.mute; c.textAlign = 'right';
      c.fillText('B homogen = B(a)', x + w - 4, Y(o.ghost) + 13);
    }
    // ganze Kurve blass, gelaufener Teil kräftig
    const N = 160;
    const curve = (t1, alpha, lw) => {
      c.globalAlpha = alpha; c.strokeStyle = o.color; c.lineWidth = lw;
      c.beginPath();
      for (let k = 0; k <= N; k++) {
        const t = (t1 * k) / N;
        const px = Xt(t), py = Y(o.fn(t));
        if (k === 0) c.moveTo(px, py); else c.lineTo(px, py);
      }
      c.stroke(); c.globalAlpha = 1;
    };
    curve(o.tEnd, 0.18, 1.5);
    if (o.tNow > 0) curve(o.tNow, 1, 2.2);
    c.fillStyle = o.color;
    c.beginPath(); c.arc(Xt(o.tNow), Y(o.fn(o.tNow)), 4, 0, Math.PI * 2); c.fill();
  }

  function drawCharts(q, reveal) {
    const W = cssW(chartCanvas), H = 300;
    const c = ctxG;
    c.clearRect(0, 0, W, H);
    const pl = 40, pr = 10, pt = 18, gap = 22, pb = 20;
    const w = W - pl - pr, h = (H - pt - pb - 2 * gap) / 3;
    const T = tEnd(q);
    const phiMin = phiAt(T, q), u0 = uAt(0, q), i0 = iAt(0, q);
    drawPanel(c, pl, pt, w, h, {
      title: 'Φ(t) = −(μ₀I₀l/2π)·ln(1+vt/a)', color: COLORS.violet, reveal,
      fn: (t) => phiAt(t, q), tEnd: T, tNow: simT, yMin: phiMin * 1.12, yMax: 0, unit: 'µWb',
    });
    drawPanel(c, pl, pt + h + gap, w, h, {
      title: 'u_ind(t) ~ 1/(a+vt)', color: COLORS.cyan, reveal,
      fn: (t) => uAt(t, q), tEnd: T, tNow: simT, yMin: 0, yMax: u0 * 1.15, unit: 'µV', ghost: u0,
    });
    drawPanel(c, pl, pt + 2 * (h + gap), w, h, {
      title: 'i_stab(t) = u_ind/R', color: COLORS.amber, reveal,
      fn: (t) => iAt(t, q), tEnd: T, tNow: simT, yMin: 0, yMax: i0 * 1.15, unit: 'µA',
    });
    c.fillStyle = COLORS.mute; c.font = '10px ui-monospace, monospace';
    if (reveal) {
      c.textAlign = 'left'; c.fillText('t = 0', pl, H - 6);
      c.textAlign = 'right'; c.fillText('t → ' + T.toFixed(1) + ' s', pl + w, H - 6);
    } else {
      c.textAlign = 'center'; c.fillStyle = COLORS.dim; c.font = '12px ui-monospace, monospace';
      c.fillText('Erst skizzieren — dann mit ③ aufdecken', pl + w / 2, H - 6);
    }
  }

  setStage(1);
  requestAnimationFrame(frame);
}
