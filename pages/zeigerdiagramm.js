window.PAGES = window.PAGES || [];
window.PAGES.push({
  id: 'zeigerdiagramm',
  category: 'Wechselstrom',
  order: 6,
  num: '4.1',
  week: 'Woche 10 / 11',
  formelsammlung: 'Kap. 6 „Wechselstrom", S. 13–14',
  navTitle: 'Zeigerdiagramm (R, L, C)',
  title: 'Wechselstrom: das Zeigerdiagramm für R, L und C',
  subtitle: 'An R, L und C liegt zu jedem Zeitpunkt eine andere Spannung — weil ihre Zeiger unterschiedlich weit vorauseilen oder nachhinken, nicht weil sie unterschiedlich stark sind.',
  teaser: 'Rotierende Zeiger für R, L, C — und wie daraus die Sinuskurven entstehen.',

  render(container) {
    container.appendChild(el('div', { class: 'callout warn' }, [
      el('span', { class: 'callout-label' }, 'Warum das verwirrt'),
      el('p', {}, 'Bei Gleichstrom addieren sich Spannungen einfach arithmetisch — bei Wechselstrom nicht, weil u_R, u_L und u_C nicht gleichzeitig ihr Maximum erreichen. u_L eilt dem Strom um 90° voraus, u_C hinkt um 90° hinterher, und nur u_R ist in Phase mit i. Ein Zeigerdiagramm macht daraus wieder eine geometrische Vektoraddition: jeder Zeiger dreht sich mit derselben Winkelgeschwindigkeit ω, seine Länge ist die Amplitude, seine momentane Höhe (vertikale Projektion) ist genau der Momentanwert der Sinuskurve rechts.'),
    ]));

    container.appendChild(el('h2', {}, [el('span', { class: 'h2-num' }, '1 ·'), 'Rotierende Zeiger = Sinuskurven']));
    container.appendChild(el('p', {}, 'Links rotieren die vier Zeiger gemeinsam mit ω. Rechts siehst du dieselbe Information als Funktion der Zeit — jede Kurve ist die vertikale Projektion des jeweiligen Zeigers.'));

    const panel = el('div', { class: 'sim-panel' });
    const toolbar = el('div', { class: 'sim-toolbar' });
    const playBtn = el('button', { class: 'btn primary' }, '⏸ läuft');
    toolbar.appendChild(playBtn);
    panel.appendChild(toolbar);

    const wrap = el('div', { class: 'two-col' });
    const leftWrap = el('div', { class: 'sim-canvas-wrap' });
    const phasorCanvas = el('canvas');
    leftWrap.appendChild(phasorCanvas);
    const rightWrap = el('div', { class: 'sim-canvas-wrap' });
    const waveCanvas = el('canvas');
    rightWrap.appendChild(waveCanvas);
    wrap.appendChild(leftWrap); wrap.appendChild(rightWrap);
    panel.appendChild(wrap);

    panel.appendChild(el('div', { class: 'legend' }, [
      legendItem(COLORS.mute, 'i(t) — Strom (Referenz)', 'line'),
      legendItem(COLORS.amber, 'u_R', 'line'),
      legendItem(COLORS.violet, 'u_L', 'line'),
      legendItem(COLORS.cyan, 'u_C', 'line'),
      legendItem(COLORS.green, 'u_gesamt (Vektorsumme)', 'line'),
    ]));

    const readoutRow = el('div', { class: 'readout-row' }, [
      readout('X_L = ωL', 'ro-xl'), readout('X_C = 1/ωC', 'ro-xc'),
      readout('|Z|', 'ro-z'), readout('φ', 'ro-phi'),
    ]);
    panel.appendChild(readoutRow);

    const grid = el('div', { class: 'controls-grid' });
    const sR = slider({ id: 'zd-r', label: 'R', min: 5, max: 150, step: 1, value: 40, unit: ' Ω' });
    const sL = slider({ id: 'zd-l', label: 'L', min: 5, max: 100, step: 1, value: 35, unit: ' mH' });
    const sC = slider({ id: 'zd-c', label: 'C', min: 5, max: 100, step: 1, value: 40, unit: ' µF' });
    const sW = slider({ id: 'zd-w', label: 'ω (verlangsamt)', min: 0.5, max: 5, step: 0.1, value: 2, unit: ' rad/s' });
    const sI = slider({ id: 'zd-i', label: 'Stromamplitude I₀', min: 0.2, max: 2, step: 0.1, value: 1, unit: ' A' });
    [sR, sL, sC, sW, sI].forEach((s) => grid.appendChild(s.row));
    panel.appendChild(grid);
    container.appendChild(panel);

    // ---- state ----
    const ctxP = setupCanvas(phasorCanvas, 280);
    const ctxW = setupCanvas(waveCanvas, 280);
    let running = true, theta = 0, simT = 0, last = performance.now(), history = [];
    playBtn.addEventListener('click', () => { running = !running; playBtn.textContent = running ? '⏸ läuft' : '▶ pausiert'; });

    function frame(now) {
      if (!phasorCanvas.isConnected) return;
      const dt = Math.min(0.04, (now - last) / 1000); last = now;
      const R = parseFloat(sR.input.value);
      const L = parseFloat(sL.input.value) / 1000;
      const C = parseFloat(sC.input.value) * 1e-6;
      const w = parseFloat(sW.input.value);
      const I0 = parseFloat(sI.input.value);
      const XL = w * L * 1000; // scaled for visible units in this simplified model
      const XC = 1 / (w * C) / 1000;
      const Zre = R, Zim = XL - XC;
      const Zmag = Math.hypot(Zre, Zim);
      const phi = Math.atan2(Zim, Zre);

      if (running) { theta += w * dt; simT += dt; }

      document.getElementById('ro-xl').textContent = fmtNum(XL, 1) + ' Ω';
      document.getElementById('ro-xc').textContent = fmtNum(XC, 1) + ' Ω';
      document.getElementById('ro-z').textContent = fmtNum(Zmag, 1) + ' Ω';
      document.getElementById('ro-phi').textContent = fmtNum(phi * 180 / Math.PI, 1) + '°';

      const uR = I0 * R, uL = I0 * XL, uC = I0 * XC, uZ = I0 * Zmag;

      const iInst = I0 * Math.sin(theta);
      const uRInst = uR * Math.sin(theta);
      const uLInst = uL * Math.sin(theta + Math.PI / 2);
      const uCInst = uC * Math.sin(theta - Math.PI / 2);
      const uZInst = uZ * Math.sin(theta + phi);

      history.push({ t: simT, i: iInst, uR: uRInst, uL: uLInst, uC: uCInst, uZ: uZInst });
      history = history.filter((p) => p.t > simT - 8);

      drawPhasors(theta, I0, R, XL, XC, Zmag, phi);
      drawWaves();
      requestAnimationFrame(frame);
    }

    function drawPhasors(theta, I0, R, XL, XC, Zmag, phi) {
      const W = cssW(phasorCanvas), H = 280;
      ctxP.clearRect(0, 0, W, H);
      const ox = W / 2, oy = H / 2;
      const maxVal = Math.max(I0 * R, I0 * XL, I0 * XC, I0 * Zmag, 0.01);
      const scale = (Math.min(W, H) / 2 - 30) / maxVal;

      ctxP.strokeStyle = COLORS.line; ctxP.lineWidth = 1;
      ctxP.beginPath(); ctxP.moveTo(10, oy); ctxP.lineTo(W - 10, oy); ctxP.stroke();
      ctxP.beginPath(); ctxP.moveTo(ox, 10); ctxP.lineTo(ox, H - 10); ctxP.stroke();

      function arrow(len, angle, color, width) {
        const x = ox + Math.cos(angle) * len * scale;
        const y = oy - Math.sin(angle) * len * scale;
        drawArrow(ctxP, ox, oy, x, y, color, width);
      }
      arrow(I0, theta, COLORS.mute, 1.6);
      arrow(I0 * R, theta, COLORS.amber, 2.4);
      arrow(I0 * XL, theta + Math.PI / 2, COLORS.violet, 2.4);
      arrow(I0 * XC, theta - Math.PI / 2, COLORS.cyan, 2.4);
      arrow(I0 * Zmag, theta + phi, COLORS.green, 3);

      ctxP.fillStyle = COLORS.dim; ctxP.font = '11px ui-monospace, monospace'; ctxP.textAlign = 'left';
      ctxP.fillText('θ = ωt', 14, 24);
    }

    function drawWaves() {
      const W = cssW(waveCanvas), H = 280;
      ctxW.clearRect(0, 0, W, H);
      const pad = { l: 12, r: 12, t: 16, b: 20 };
      const cx = pad.l, cy = pad.t, cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
      const series = [
        { data: history.map((p) => ({ t: p.t, v: p.i })), color: COLORS.mute },
        { data: history.map((p) => ({ t: p.t, v: p.uR })), color: COLORS.amber },
        { data: history.map((p) => ({ t: p.t, v: p.uL })), color: COLORS.violet },
        { data: history.map((p) => ({ t: p.t, v: p.uC })), color: COLORS.cyan },
        { data: history.map((p) => ({ t: p.t, v: p.uZ })), color: COLORS.green },
      ];
      drawStripChart(ctxW, cx, cy, cw, ch, series);
      ctxW.fillStyle = COLORS.mute; ctxW.font = '10px ui-monospace, monospace'; ctxW.textAlign = 'right';
      ctxW.fillText('t →', cx + cw, cy + ch + 16);
    }

    requestAnimationFrame(frame);

    container.appendChild(el('div', { class: 'callout info' }, [
      el('span', { class: 'callout-label' }, 'Was du sehen solltest'),
      el('ul', {}, [
        el('li', {}, [el('strong', {}, 'u_R und i zeigen immer in dieselbe Richtung'), ' — R verschiebt die Phase nicht.']),
        el('li', {}, [el('strong', {}, 'u_L eilt immer 90° voraus'), ', ', el('strong', {}, 'u_C hinkt immer 90° hinterher'), ' — unabhängig von R, L, C oder ω. Nur die Länge der Zeiger ändert sich mit den Reglern, nie der Winkel zwischen ihnen.']),
        el('li', {}, ['Stelle L und C so ein, dass X_L = X_C wird: die violetten und cyanfarbenen Zeiger werden gleich lang und zeigen genau entgegengesetzt — sie ', el('strong', {}, 'heben sich vollständig auf'), '. Übrig bleibt nur u_R = u_gesamt. Das ist der Resonanzfall.']),
      ]),
    ]));

    container.appendChild(el('h2', {}, [el('span', { class: 'h2-num' }, '2 ·'), 'Impedanz: R, L und C als komplexe Grösse']));
    const dgrid = el('div', { class: 'def-grid' });
    dgrid.appendChild(el('div', { class: 'def-card' }, [
      el('h4', {}, 'Blindwiderstände'),
      el('p', {}, 'X_L wächst mit ω, X_C fällt mit ω — L und C reagieren auf Frequenz entgegengesetzt.'),
      formulaBlock([
        'X_L = \\omega L',
        'X_C = \\dfrac{1}{\\omega C}',
      ]),
    ]));
    dgrid.appendChild(el('div', { class: 'def-card' }, [
      el('h4', {}, 'Impedanz (Serienschaltung)'),
      el('p', {}, 'Komplexe Zusammenfassung von Wirk- und Blindwiderstand.'),
      formulaBlock([
        'Z = R + j(X_L - X_C)',
        '|Z| = \\sqrt{R^2 + (X_L-X_C)^2}',
        '\\varphi = \\arctan\\!\\left(\\dfrac{X_L-X_C}{R}\\right)',
      ]),
    ]));
    container.appendChild(dgrid);

    container.appendChild(el('div', { class: 'table-wrap' }, [
      el('table', {}, [
        el('thead', {}, el('tr', {}, [el('th', {}, 'Bauteil'), el('th', {}, 'Phasenlage zu i'), el('th', {}, 'Verhalten bei hoher Frequenz')])),
        el('tbody', {}, [
          el('tr', {}, [el('td', {}, [el('strong', {}, 'R')]), el('td', {}, '0° — in Phase'), el('td', {}, 'unverändert')]),
          el('tr', {}, [el('td', {}, [el('strong', {}, 'L')]), el('td', {}, '+90° — u eilt voraus'), el('td', {}, 'X_L steigt: sperrt hohe Frequenzen zunehmend')]),
          el('tr', {}, [el('td', {}, [el('strong', {}, 'C')]), el('td', {}, '−90° — u hinkt hinterher'), el('td', {}, 'X_C sinkt: lässt hohe Frequenzen zunehmend durch')]),
        ]),
      ]),
    ]));

    container.appendChild(el('h2', {}, [el('span', { class: 'h2-num' }, '3 ·'), 'Beispielrechnung']));
    container.appendChild(exampleBox({
      given: [['R', '50 Ω'], ['L', '100 mH'], ['C', '20 µF'], ['f', '100 Hz']],
      steps: [
        { text: 'Kreisfrequenz bestimmen.', formula: '\\omega = 2\\pi f = 2\\pi \\cdot 100 \\approx 628.3\\ \\text{rad/s}' },
        { text: 'Blindwiderstände von L und C.', formula: [
          'X_L = \\omega L = 628.3 \\cdot 0.1 \\approx 62.83\\ \\Omega',
          'X_C = \\dfrac{1}{\\omega C} = \\dfrac{1}{628.3 \\cdot 20\\cdot 10^{-6}} \\approx 79.58\\ \\Omega',
        ] },
        { text: 'Impedanz als komplexe Zahl aufstellen.', formula: 'Z = R + j(X_L-X_C) = 50 + j(62.83-79.58) = 50 - j16.75\\ \\Omega' },
        { text: 'Betrag und Phase daraus berechnen.', formula: [
          '|Z| = \\sqrt{50^2+16.75^2} \\approx 52.7\\ \\Omega',
          '\\varphi = \\arctan\\!\\left(\\dfrac{-16.75}{50}\\right) \\approx -18.5^\\circ',
        ] },
        { text: 'Vorzeichen von φ interpretieren: negativ → die Schaltung wirkt kapazitiv.' },
      ],
      result: { label: 'Ergebnis', value: '|Z| ≈ 52.7 Ω, φ ≈ −18.5° (kapazitiv)' },
    }));

    container.appendChild(el('div', { class: 'callout bad' }, [
      el('span', { class: 'callout-label' }, 'Prüfungsfallen'),
      el('ul', {}, [
        el('li', {}, [el('strong', {}, 'U_R + U_L + U_C ≠ U_gesamt'), ' als arithmetische Summe der Beträge — nur die ', el('strong', {}, 'vektorielle'), ' Summe stimmt. Die Beträge addieren sich nur, wenn alle Zeiger dieselbe Richtung haben (reiner Widerstand).']),
        el('li', {}, ['Bei Resonanz (X_L = X_C) ist Z minimal und ', el('strong', {}, 'rein reell'), ' — der Strom ist maximal, obwohl L und C einzeln riesige Spannungen tragen können, die sich gerade aufheben.']),
        el('li', {}, ['φ > 0 bedeutet: die Schaltung wirkt ', el('strong', {}, 'induktiv'), ' (Spannung eilt Strom voraus); φ < 0 bedeutet ', el('strong', {}, 'kapazitiv'), '.']),
        el('li', {}, ['Amplitude ≠ Effektivwert: U_eff = U₀/√2. Auf dem Typenschild und im Netz steht praktisch immer der Effektivwert.']),
      ]),
    ]));
  },
});
