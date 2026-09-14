window.PAGES = window.PAGES || [];
window.PAGES.push({
  id: 'kirchhoff',
  category: 'Gleichstromkreise',
  order: 1,
  num: '1.1',
  week: 'Woche 3',
  formelsammlung: 'Kap. 3 „Elektrische Netzwerke", S. 4',
  navTitle: 'Knoten- & Maschenregel',
  title: 'Kirchhoffsche Regeln: Knoten- und Maschenregel',
  subtitle: 'Zwei einfache Bilanzgleichungen lösen jedes Netzwerk — die Kunst liegt in der Vorzeichenkonvention, nicht in der Mathematik.',
  teaser: 'Knoten- & Maschenregel live an einem R1–(R2‖R3)-Netzwerk nachrechnen.',

  render(container) {
    container.appendChild(el('div', { class: 'callout warn' }, [
      el('span', { class: 'callout-label' }, 'Warum das verwirrt'),
      el('p', {}, 'Die Knotenregel ist harmlos: Ladung geht nicht verloren, also muss alles, was in einen Knoten fliesst, auch wieder herausfliessen. Die Maschenregel wirkt dagegen willkürlich, weil man Vorzeichen für Quellen und Widerstände festlegen muss, bevor man überhaupt weiss, wie der Strom tatsächlich fliesst. Genau das ist der Punkt: die Regel funktioniert unabhängig davon, ob die angenommene Richtung stimmt — ein falsch angenommenes Vorzeichen liefert einfach eine negative Stromstärke, kein falsches Ergebnis.'),
    ]));

    container.appendChild(el('h2', {}, [el('span', { class: 'h2-num' }, '1 ·'), 'Ein Netzwerk, live durchgerechnet']));
    container.appendChild(el('p', {}, 'R1 liegt in Serie zur Quelle, danach teilt sich der Strom auf R2 und R3 auf, die parallel liegen. Verändere die Werte und beobachte, wie sich die Ströme neu verteilen — die Punkte auf den Leitungen bewegen sich proportional zur jeweiligen Stromstärke.'));

    const panel = el('div', { class: 'sim-panel' });
    const toolbar = el('div', { class: 'sim-toolbar' });
    const playBtn = el('button', { class: 'btn primary' }, '⏸ läuft');
    toolbar.appendChild(playBtn);
    panel.appendChild(toolbar);

    const canvasWrap = el('div', { class: 'sim-canvas-wrap' });
    const canvas = el('canvas');
    canvasWrap.appendChild(canvas);
    panel.appendChild(canvasWrap);

    const legend = el('div', { class: 'legend' }, [
      legendItem(COLORS.amber, 'I₁ (Hauptstrom)'),
      legendItem(COLORS.cyan, 'I₂ (durch R2)'),
      legendItem(COLORS.violet, 'I₃ (durch R3)'),
    ]);
    panel.appendChild(legend);

    const readoutRow = el('div', { class: 'readout-row' }, [
      readout('I₁', 'ro-i1'), readout('I₂', 'ro-i2'), readout('I₃', 'ro-i3'),
      readout('U(R1)', 'ro-u1'), readout('U(R2‖R3)', 'ro-u23'),
    ]);
    panel.appendChild(readoutRow);

    const grid = el('div', { class: 'controls-grid' });
    const sU = slider({ id: 'k-u0', label: 'Quellenspannung U₀', min: 2, max: 24, step: 0.5, value: 12, unit: ' V' });
    const sR1 = slider({ id: 'k-r1', label: 'R1', min: 5, max: 200, step: 1, value: 47, unit: ' Ω' });
    const sR2 = slider({ id: 'k-r2', label: 'R2', min: 5, max: 200, step: 1, value: 100, unit: ' Ω' });
    const sR3 = slider({ id: 'k-r3', label: 'R3', min: 5, max: 200, step: 1, value: 68, unit: ' Ω' });
    [sU, sR1, sR2, sR3].forEach((s) => grid.appendChild(s.row));
    panel.appendChild(grid);

    const eqBox = el('div', { class: 'formula', id: 'k-eqs' });
    panel.appendChild(eqBox);

    container.appendChild(panel);

    // ---- physics + animation ----
    const ctx = setupCanvas(canvas, 260);
    let running = true;
    playBtn.addEventListener('click', () => {
      running = !running;
      playBtn.textContent = running ? '⏸ läuft' : '▶ pausiert';
    });

    let phase = 0, last = performance.now(), lastEqKey = '';

    function compute() {
      const U0 = parseFloat(sU.input.value);
      const R1 = parseFloat(sR1.input.value);
      const R2 = parseFloat(sR2.input.value);
      const R3 = parseFloat(sR3.input.value);
      const Rp = (R2 * R3) / (R2 + R3);
      const Rtot = R1 + Rp;
      const I1 = U0 / Rtot;
      const U23 = I1 * Rp;
      const I2 = U23 / R2;
      const I3 = U23 / R3;
      const U1 = I1 * R1;
      return { U0, R1, R2, R3, I1, I2, I3, U1, U23 };
    }

    function frame(now) {
      if (!canvas.isConnected) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const s = compute();

      document.getElementById('ro-i1').textContent = fmtNum(s.I1 * 1000, 1) + ' mA';
      document.getElementById('ro-i2').textContent = fmtNum(s.I2 * 1000, 1) + ' mA';
      document.getElementById('ro-i3').textContent = fmtNum(s.I3 * 1000, 1) + ' mA';
      document.getElementById('ro-u1').textContent = fmtNum(s.U1, 2) + ' V';
      document.getElementById('ro-u23').textContent = fmtNum(s.U23, 2) + ' V';

      const i1mA = fmtNum(s.I1 * 1000, 1), i2mA = fmtNum(s.I2 * 1000, 1), i3mA = fmtNum(s.I3 * 1000, 1);
      const u0 = fmtNum(s.U0, 2), u1 = fmtNum(s.U1, 2), i2r2 = fmtNum(s.I2 * s.R2, 2), i3r3 = fmtNum(s.I3 * s.R3, 2);
      const eqKey = i1mA + i2mA + i3mA + u0 + u1 + i2r2 + i3r3;
      if (eqKey !== lastEqKey) {
        lastEqKey = eqKey;
        eqBox.innerHTML = formulaBlock([
          `\\text{Knotenregel:}\\quad I_1 = I_2 + I_3 \\;\\Rightarrow\\; ${i1mA}\\text{ mA} = ${i2mA}\\text{ mA} + ${i3mA}\\text{ mA}`,
          `\\text{Masche 1:}\\quad U_0 = I_1 R_1 + I_2 R_2 \\;\\Rightarrow\\; ${u0}\\text{ V} = ${u1}\\text{ V} + ${i2r2}\\text{ V}`,
          `\\text{Masche 2:}\\quad I_2 R_2 = I_3 R_3 \\;\\Rightarrow\\; ${i2r2}\\text{ V} = ${i3r3}\\text{ V}`,
        ]).innerHTML;
      }

      if (running) phase += dt * 0.6;
      draw(s, phase);
      requestAnimationFrame(frame);
    }

    function draw(s, phase) {
      const W = cssW(canvas), H = 260;
      ctx.clearRect(0, 0, W, H);
      const leftX = 66, rightX = W - 60, topY = 56, botY = H - 56;
      const nodeX = leftX + (rightX - leftX) * 0.52;
      const r1Mid = leftX + (nodeX - leftX) * 0.55;

      ctx.strokeStyle = COLORS.line; ctx.lineWidth = 1;

      drawBattery(ctx, leftX, H / 2, botY - topY, COLORS.fg, 'U₀');

      drawWire(ctx, leftX, topY, r1Mid - 30, topY, COLORS.amber, 2);
      drawResistor(ctx, r1Mid, topY, 60, COLORS.amber, 'R1');
      drawWire(ctx, r1Mid + 30, topY, nodeX, topY, COLORS.amber, 2);
      drawWire(ctx, nodeX, topY, rightX, topY, COLORS.violet, 2);

      drawResistorRot(ctx, nodeX, H / 2, botY - topY - 20, Math.PI / 2, COLORS.cyan);
      ctx.fillStyle = COLORS.cyan; ctx.font = '12px ui-monospace, monospace'; ctx.textAlign = 'right';
      ctx.fillText('R2', nodeX - 14, H / 2 + 4);

      drawResistorRot(ctx, rightX, H / 2, botY - topY - 20, Math.PI / 2, COLORS.violet);
      ctx.textAlign = 'left';
      ctx.fillStyle = COLORS.violet;
      ctx.fillText('R3', rightX + 14, H / 2 + 4);

      drawWire(ctx, nodeX, botY, rightX, botY, COLORS.violet, 2);
      drawWire(ctx, leftX, botY, nodeX, botY, COLORS.amber, 2);

      // node dots
      ctx.fillStyle = COLORS.fg;
      ctx.beginPath(); ctx.arc(nodeX, topY, 3.5, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(nodeX, botY, 3.5, 0, 7); ctx.fill();

      // current-flow dots
      const pIn = makePath([{ x1: leftX, y1: topY, x2: nodeX, y2: topY }]);
      const pR2 = makePath([{ x1: nodeX, y1: topY, x2: nodeX, y2: botY }]);
      const pR3 = makePath([
        { x1: nodeX, y1: topY, x2: rightX, y2: topY },
        { x1: rightX, y1: topY, x2: rightX, y2: botY },
        { x1: rightX, y1: botY, x2: nodeX, y2: botY },
      ]);
      const pOut = makePath([{ x1: nodeX, y1: botY, x2: leftX, y2: botY }]);

      const maxI = Math.max(s.I1, 0.001);
      plotDots(pIn, s.I1 / maxI, COLORS.amber, phase);
      plotDots(pR2, s.I2 / maxI, COLORS.cyan, phase);
      plotDots(pR3, s.I3 / maxI, COLORS.violet, phase);
      plotDots(pOut, s.I1 / maxI, COLORS.amber, phase);
    }

    function plotDots(path, speedFactor, color, phase) {
      const n = 5;
      for (let i = 0; i < n; i++) {
        const t = (i / n + phase * speedFactor) % 1;
        const p = path.at(t);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    requestAnimationFrame(frame);

    // ---- explanatory content below the simulation ----
    container.appendChild(el('div', { class: 'callout info' }, [
      el('span', { class: 'callout-label' }, 'Was du sehen solltest'),
      el('ul', {}, [
        el('li', {}, [el('strong', {}, 'I₁ ist immer die Summe aus I₂ und I₃'), ' — egal welche Werte du einstellst. Das ist die Knotenregel, keine Rechenannahme.']),
        el('li', {}, [el('strong', {}, 'R2 und R3 haben immer dieselbe Spannung'), ' — das definiert „parallel“: gleiche Spannung, aufgeteilter Strom.']),
        el('li', {}, ['Ziehst du R3 hoch, fliesst mehr Strom durch R2: der Strom nimmt bevorzugt den ', el('strong', {}, 'Weg des geringeren Widerstands'), ', aber nie ausschliesslich diesen.']),
      ]),
    ]));

    container.appendChild(el('h2', {}, [el('span', { class: 'h2-num' }, '2 ·'), 'Die zwei Regeln']));
    const dgrid = el('div', { class: 'def-grid' });
    dgrid.appendChild(el('div', { class: 'def-card' }, [
      el('h4', {}, 'Knotenregel (Kirchhoff I)'),
      el('p', {}, 'In jedem Knoten ist die Summe der zufliessenden Ströme gleich der Summe der abfliessenden Ströme — Ladungserhaltung, angewendet auf einen Punkt ohne Speicherfähigkeit.'),
      formulaBlock('\\sum_k I_k = 0 \\quad \\text{(zufliessend positiv gezählt)}'),
    ]));
    dgrid.appendChild(el('div', { class: 'def-card' }, [
      el('h4', {}, 'Maschenregel (Kirchhoff II)'),
      el('p', {}, 'In jeder geschlossenen Masche ist die Summe aller Spannungen gleich null — Energieerhaltung: was die Quelle an Energie pro Ladung liefert, wird von den Widerständen vollständig verbraucht.'),
      formulaBlock('\\sum_k U_k = 0 \\quad \\text{(entlang eines gewählten Umlaufsinns)}'),
    ]));
    container.appendChild(dgrid);
    container.appendChild(el('p', { class: 'note' }, 'Beide Regeln gelten für jedes beliebige Netzwerk — auch für nicht-lineare Bauteile. Sie folgen direkt aus Ladungs- und Energieerhaltung, nicht aus Eigenschaften von Widerständen.'));

    container.appendChild(el('h2', {}, [el('span', { class: 'h2-num' }, '3 ·'), 'Netzwerke vereinfachen']));
    container.appendChild(el('div', { class: 'table-wrap' }, [
      el('table', {}, [
        el('thead', {}, el('tr', {}, [el('th', {}, ''), el('th', {}, 'Serie'), el('th', {}, 'Parallel')])),
        el('tbody', {}, [
          el('tr', {}, [el('td', {}, [el('strong', {}, 'was ist gleich?')]), el('td', {}, 'der Strom I'), el('td', {}, 'die Spannung U')]),
          el('tr', {}, [el('td', {}, [el('strong', {}, 'Ersatzwiderstand')]), el('td', {}, 'R = R1 + R2 + …'), el('td', {}, '1/R = 1/R1 + 1/R2 + …')]),
          el('tr', {}, [el('td', {}, [el('strong', {}, 'typische Anwendung')]), el('td', {}, 'Spannungsteiler'), el('td', {}, 'Stromteiler')]),
          el('tr', {}, [el('td', {}, [el('strong', {}, 'Ersatzwert vs. Einzelwerte')]), el('td', {}, 'immer grösser als der grösste Einzelwiderstand'), el('td', {}, 'immer kleiner als der kleinste Einzelwiderstand')]),
        ]),
      ]),
    ]));

    container.appendChild(el('h2', {}, [el('span', { class: 'h2-num' }, '4 ·'), 'Beispielrechnung']));
    container.appendChild(exampleBox({
      given: [['U₀', '24 V'], ['R1', '20 Ω'], ['R2', '30 Ω'], ['R3', '60 Ω']],
      steps: [
        { text: 'Ersatzwiderstand von R2 ‖ R3 bilden.', formula: 'R_p = \\dfrac{R_2 R_3}{R_2+R_3} = \\dfrac{30\\cdot 60}{90} = 20\\ \\Omega' },
        { text: 'Gesamtwiderstand des Netzwerks.', formula: 'R_{ges} = R_1 + R_p = 20 + 20 = 40\\ \\Omega' },
        { text: 'Hauptstrom I1 über die Maschenregel.', formula: 'I_1 = \\dfrac{U_0}{R_{ges}} = \\dfrac{24\\text{ V}}{40\\ \\Omega} = 0.6\\text{ A}' },
        { text: 'Spannung über der Parallelschaltung.', formula: 'U_{23} = I_1 R_p = 0.6\\text{ A} \\cdot 20\\ \\Omega = 12\\text{ V}' },
        { text: 'Teilströme über den Stromteiler.', formula: [
          'I_2 = \\dfrac{U_{23}}{R_2} = \\dfrac{12}{30} = 0.4\\text{ A}',
          'I_3 = \\dfrac{U_{23}}{R_3} = \\dfrac{12}{60} = 0.2\\text{ A}',
        ] },
        { text: 'Probe mit der Knotenregel.', formula: 'I_2 + I_3 = 0.4 + 0.2 = 0.6\\text{ A} = I_1 \\checkmark' },
      ],
      result: { label: 'Ergebnis', value: 'I1 = 0.6 A · I2 = 0.4 A · I3 = 0.2 A' },
    }));

    container.appendChild(el('div', { class: 'callout bad' }, [
      el('span', { class: 'callout-label' }, 'Prüfungsfallen'),
      el('ul', {}, [
        el('li', {}, [el('strong', {}, 'Vorzeichen konsequent durchziehen.'), ' Sobald du einen Umlaufsinn für die Masche und Richtungspfeile für die Ströme festgelegt hast, gelten sie für die ganze Rechnung. Ein negatives Ergebnis heisst nur: der reale Strom fliesst entgegen der angenommenen Pfeilrichtung — nicht, dass ein Fehler vorliegt.']),
        el('li', {}, ['Bei ', el('strong', {}, 'N Knoten'), ' liefern nur ', el('strong', {}, 'N − 1'), ' Knotengleichungen unabhängige Information — die letzte folgt automatisch aus den anderen.']),
        el('li', {}, ['„Parallel“ heisst ', el('strong', {}, 'gleiche Spannung'), ', nicht „gleicher Strom“ — das wird besonders bei R2 ‖ R3 mit sehr unterschiedlichen Werten oft verwechselt.']),
        el('li', {}, [el('strong', {}, 'R_parallel < R_min'), ': ein zusätzlicher Widerstand parallel kann den Gesamtwiderstand nur verkleinern, nie vergrössern.']),
      ]),
    ]));
  },
});
