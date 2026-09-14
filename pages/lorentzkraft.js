window.PAGES = window.PAGES || [];
window.PAGES.push({
  id: 'lorentzkraft',
  category: 'Elektrische & magnetische Felder',
  order: 4,
  num: '2.2',
  week: 'Woche 5 / 6',
  formelsammlung: 'Kap. 4 „Das stationäre Magnetfeld", S. 8',
  navTitle: 'Magnetfeld & Lorentzkraft',
  title: 'Magnetfeld und Lorentzkraft: warum geladene Teilchen Kreise fliegen',
  subtitle: 'Eine Kraft, die immer senkrecht zur Geschwindigkeit steht, kann kein Tempo ändern — nur die Richtung. Das Ergebnis ist immer eine Kreisbahn.',
  teaser: 'Ladungen im homogenen Magnetfeld — Radius und Drehsinn live einstellen.',

  render(container) {
    container.appendChild(el('div', { class: 'callout warn' }, [
      el('span', { class: 'callout-label' }, 'Warum das verwirrt'),
      el('p', {}, 'Die Lorentzkraft F = q·v×B ist die einzige alltägliche Kraft, die von der Geschwindigkeit selbst abhängt — steht das Teilchen still, gibt es keine Kraft, egal wie stark B ist. Und weil F immer senkrecht zu v steht, verrichtet sie nie Arbeit: die Bahngeschwindigkeit bleibt konstant, nur die Richtung ändert sich laufend. Genau das erzeugt eine Kreisbahn mit konstantem Radius — keine Spirale, keine Beschleunigung des Betrags.'),
    ]));

    container.appendChild(el('h2', {}, [el('span', { class: 'h2-num' }, '1 ·'), 'Ein Teilchen im homogenen Feld']));
    container.appendChild(el('p', {}, 'Das Feld steht senkrecht zur Zeichenebene (Punkte = aus der Ebene heraus, Kreuze = in die Ebene hinein). Verändere Ladung, Feldstärke, Masse und Startgeschwindigkeit — und kehre gezielt eine einzelne Grösse um, um zu sehen, was den Drehsinn beeinflusst und was nur den Radius.'));

    const panel = el('div', { class: 'sim-panel' });
    const toolbar = el('div', { class: 'sim-toolbar' });
    const playBtn = el('button', { class: 'btn primary' }, '⏸ läuft');
    const qBtn = el('button', { class: 'btn active' }, 'q: positiv');
    const bBtn = el('button', { class: 'btn active' }, 'B: aus der Ebene (•)');
    const resetBtn = el('button', { class: 'btn' }, '↺ zurücksetzen');
    toolbar.appendChild(playBtn); toolbar.appendChild(qBtn); toolbar.appendChild(bBtn); toolbar.appendChild(resetBtn);
    panel.appendChild(toolbar);

    const canvasWrap = el('div', { class: 'sim-canvas-wrap' });
    const canvas = el('canvas');
    canvasWrap.appendChild(canvas);
    panel.appendChild(canvasWrap);

    panel.appendChild(el('div', { class: 'legend' }, [
      legendItem(COLORS.amber, 'Geschwindigkeit v', 'line'),
      legendItem(COLORS.red, 'Kraft F = qv×B', 'line'),
      legendItem(COLORS.cyan, 'Bahnkurve', 'line'),
    ]));

    const readoutRow = el('div', { class: 'readout-row' }, [
      readout('Radius r', 'ro-r'), readout('Umlaufzeit T', 'ro-t'), readout('|v|', 'ro-v'),
    ]);
    panel.appendChild(readoutRow);

    const grid = el('div', { class: 'controls-grid' });
    const sV = slider({ id: 'lf-v', label: 'Startgeschwindigkeit v', min: 60, max: 220, step: 5, value: 140, unit: '' });
    const sB = slider({ id: 'lf-b', label: 'Feldstärke B', min: 0.3, max: 2.5, step: 0.05, value: 1, unit: '' });
    const sM = slider({ id: 'lf-m', label: 'Masse m', min: 0.4, max: 2.5, step: 0.05, value: 1, unit: '' });
    [sV, sB, sM].forEach((s) => grid.appendChild(s.row));
    panel.appendChild(grid);
    container.appendChild(panel);

    // ---- physics ----
    const ctx = setupCanvas(canvas, 300);
    let running = true, qSign = 1, bSign = 1;
    let vx = 0, vy = 0, px = 0, py = 0, trail = [];
    let last = performance.now();

    function launch() {
      const W = cssW(canvas), H = 300;
      px = 60; py = H / 2;
      vx = parseFloat(sV.input.value); vy = 0;
      trail = [{ x: px, y: py }];
    }

    playBtn.addEventListener('click', () => { running = !running; playBtn.textContent = running ? '⏸ läuft' : '▶ pausiert'; });
    qBtn.addEventListener('click', () => { qSign *= -1; qBtn.textContent = 'q: ' + (qSign > 0 ? 'positiv' : 'negativ'); launch(); });
    bBtn.addEventListener('click', () => {
      bSign *= -1;
      bBtn.textContent = 'B: ' + (bSign > 0 ? 'aus der Ebene (•)' : 'in die Ebene (×)');
      launch();
    });
    resetBtn.addEventListener('click', launch);

    launch();

    function frame(now) {
      if (!canvas.isConnected) return;
      const dt = Math.min(0.03, (now - last) / 1000); last = now;
      const W = cssW(canvas), H = 300;
      const B = parseFloat(sB.input.value), m = parseFloat(sM.input.value);
      const omega = (qSign * bSign * B) / m; // rad/s, sign sets rotation sense

      if (running) {
        // exact rotation of the velocity vector (energy-conserving, no drift)
        const theta = -omega * dt;
        const c = Math.cos(theta), s = Math.sin(theta);
        const nvx = vx * c - vy * s, nvy = vx * s + vy * c;
        vx = nvx; vy = nvy;
        px += vx * dt; py += vy * dt;
        trail.push({ x: px, y: py });
        if (trail.length > 600) trail.shift();
        if (px < -30 || px > W + 30 || py < -30 || py > H + 30) launch();
      }

      const speed = Math.hypot(vx, vy);
      const r = speed / Math.max(Math.abs(omega), 1e-6);
      const T = (2 * Math.PI) / Math.max(Math.abs(omega), 1e-6);
      document.getElementById('ro-r').textContent = fmtNum(r, 0) + ' px';
      document.getElementById('ro-t').textContent = fmtNum(T, 2) + ' s';
      document.getElementById('ro-v').textContent = fmtNum(speed, 0);

      draw(W, H, B, m, omega);
      requestAnimationFrame(frame);
    }

    function draw(W, H, B, m, omega) {
      ctx.clearRect(0, 0, W, H);
      // field glyphs
      ctx.strokeStyle = COLORS.mute; ctx.fillStyle = COLORS.mute;
      const step = 44;
      for (let gx = step / 2; gx < W; gx += step) {
        for (let gy = step / 2; gy < H; gy += step) {
          if (bSign > 0) {
            ctx.beginPath(); ctx.arc(gx, gy, 2.4, 0, Math.PI * 2); ctx.fill();
          } else {
            ctx.lineWidth = 1.3;
            ctx.beginPath(); ctx.moveTo(gx - 4, gy - 4); ctx.lineTo(gx + 4, gy + 4); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(gx - 4, gy + 4); ctx.lineTo(gx + 4, gy - 4); ctx.stroke();
          }
        }
      }
      // trail
      if (trail.length > 1) {
        ctx.strokeStyle = COLORS.cyan; ctx.lineWidth = 2;
        ctx.beginPath();
        trail.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.stroke();
      }
      // particle
      ctx.fillStyle = qSign > 0 ? COLORS.amber : COLORS.cyan;
      ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0d1117'; ctx.font = 'bold 11px ui-monospace, monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(qSign > 0 ? '+' : '–', px, py + 0.5);
      ctx.textBaseline = 'alphabetic';

      // velocity arrow
      const speed = Math.hypot(vx, vy) || 1;
      const vlen = 42;
      drawArrow(ctx, px, py, px + (vx / speed) * vlen, py + (vy / speed) * vlen, COLORS.amber, 2.2);
      // force arrow F = q v x B (perpendicular to v, sign = omega sign)
      const fdir = omega >= 0 ? 1 : -1;
      const fx = -vy / speed, fy = vx / speed; // perpendicular
      drawArrow(ctx, px, py, px + fx * fdir * 30, py + fy * fdir * 30, COLORS.red, 2.2);
    }

    requestAnimationFrame(frame);

    container.appendChild(el('div', { class: 'callout info' }, [
      el('span', { class: 'callout-label' }, 'Was du sehen solltest'),
      el('ul', {}, [
        el('li', {}, [el('strong', {}, 'F steht immer senkrecht auf v'), ' — die rote und die orange Pfeilspitze schliessen zu jedem Zeitpunkt 90° ein.']),
        el('li', {}, ['Kehrst du ', el('strong', {}, 'nur die Ladung'), ' oder ', el('strong', {}, 'nur die Feldrichtung'), ' um, dreht das Teilchen in die andere Richtung — kehrst du ', el('strong', {}, 'beides'), ' um, bleibt der Drehsinn gleich.']),
        el('li', {}, ['Grössere Masse ', el('em', {}, 'oder'), ' kleineres B vergrössert den Radius r = mv/(qB) — probiere es an den Reglern.']),
      ]),
    ]));

    container.appendChild(el('h2', {}, [el('span', { class: 'h2-num' }, '2 ·'), 'Die Formeln']));
    const dgrid = el('div', { class: 'def-grid' });
    dgrid.appendChild(el('div', { class: 'def-card' }, [
      el('h4', {}, 'Lorentzkraft'),
      el('p', {}, 'Kraft auf eine bewegte Ladung im Magnetfeld — steht senkrecht auf v und auf B.'),
      formulaBlock([
        '\\vec{F} = q \\cdot (\\vec{v} \\times \\vec{B})',
        '|\\vec{F}| = q\\,v\\,B\\,\\sin\\angle(\\vec{v},\\vec{B})',
      ]),
    ]));
    dgrid.appendChild(el('div', { class: 'def-card' }, [
      el('h4', {}, 'Kreisbahnradius'),
      el('p', {}, 'Aus Gleichsetzen von Lorentzkraft und Zentripetalkraft mv²/r.'),
      formulaBlock([
        'r = \\dfrac{m v}{q B}',
        'T = \\dfrac{2\\pi m}{q B} \\quad \\text{(unabhängig von } v\\text{!)}',
      ]),
    ]));
    container.appendChild(dgrid);
    container.appendChild(el('p', { class: 'note' }, 'Auffällig: die Umlaufzeit T hängt nicht von v ab — ein schnelleres Teilchen fliegt einen grösseren Kreis in derselben Zeit. Das ist das Funktionsprinzip des Zyklotrons.'));

    container.appendChild(el('h2', {}, [el('span', { class: 'h2-num' }, '3 ·'), 'Beispielrechnung']));
    container.appendChild(exampleBox({
      given: [['Teilchen', 'Elektron (q = 1.6·10⁻¹⁹ C, m = 9.11·10⁻³¹ kg)'], ['v', '2·10⁶ m/s'], ['B', '0.5 T (⊥ zu v)']],
      steps: [
        { text: 'Radius aus dem Kräftegleichgewicht Lorentzkraft = Zentripetalkraft.', formula: 'r = \\dfrac{mv}{qB} = \\dfrac{9.11\\cdot 10^{-31} \\cdot 2\\cdot 10^{6}}{1.6\\cdot 10^{-19} \\cdot 0.5}' },
        { text: 'Zähler und Nenner separat auswerten.', formula: 'r = \\dfrac{1.822\\cdot 10^{-24}}{8\\cdot 10^{-20}} \\approx 2.28\\cdot 10^{-5}\\text{ m}' },
        { text: 'Umlaufzeit — unabhängig von v.', formula: 'T = \\dfrac{2\\pi m}{qB} = \\dfrac{2\\pi \\cdot 9.11\\cdot 10^{-31}}{8\\cdot 10^{-20}} \\approx 7.15\\cdot 10^{-11}\\text{ s}' },
      ],
      result: { label: 'Ergebnis', value: 'r ≈ 22.8 µm, T ≈ 71.5 ps' },
    }));

    container.appendChild(el('div', { class: 'callout bad' }, [
      el('span', { class: 'callout-label' }, 'Prüfungsfallen'),
      el('ul', {}, [
        el('li', {}, ['Die Lorentzkraft verrichtet ', el('strong', {}, 'keine Arbeit'), ' — sie ändert nie den Betrag von v, nur die Richtung. Die kinetische Energie eines Teilchens im reinen Magnetfeld ist konstant.']),
        el('li', {}, ['Bewegt sich das Teilchen ', el('strong', {}, 'parallel zu B'), ', ist die Kraft null (sin 0° = 0) — keine Ablenkung, egal wie stark B ist.']),
        el('li', {}, ['Rechte-Hand-Regel: Finger in Richtung v, einklappen in Richtung B — der Daumen zeigt v×B ', el('em', {}, 'für eine positive Ladung'), '. Bei negativer Ladung zeigt F in die Gegenrichtung.']),
      ]),
    ]));
  },
});
