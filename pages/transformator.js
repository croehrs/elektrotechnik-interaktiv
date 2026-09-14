window.PAGES = window.PAGES || [];
window.PAGES.push({
  id: 'transformator',
  category: 'Wechselstrom',
  order: 8,
  num: '4.3',
  week: 'Woche 10',
  formelsammlung: 'nicht enthalten — verwandt: Kap. 5, S. 12 (gekoppelte Spulen)',
  navTitle: 'Transformator',
  title: 'Der Transformator: Windungszahl gegen Strom tauschen',
  subtitle: 'Ein Transformator erschafft keine Energie — mehr Windungen geben dir mehr Spannung, aber automatisch weniger Strom, im exakt gleichen Verhältnis.',
  teaser: 'Windungszahl, Spannung und Strom live am idealen Transformator.',

  render(container) {
    container.appendChild(el('div', { class: 'callout warn' }, [
      el('span', { class: 'callout-label' }, 'Warum das verwirrt'),
      el('p', {}, 'Es wirkt wie ein Widerspruch: die Sekundärseite mit mehr Windungen hat die höhere Spannung UND soll gleichzeitig den kleineren Strom haben? Der Trick ist Energieerhaltung — ein idealer Transformator verändert nur das Verhältnis von Spannung zu Strom, nie die übertragene Leistung. Was auf der einen Seite an Spannung dazukommt, geht auf derselben Seite exakt als Strom verloren, damit P = U·I auf beiden Seiten gleich bleibt.'),
    ]));

    container.appendChild(el('h2', {}, [el('span', { class: 'h2-num' }, '1 ·'), 'Windungszahl, Spannung, Strom']));
    container.appendChild(el('p', {}, 'Verändere die Windungszahlen und die Primärgrössen — die Sekundärseite reagiert sofort. Beobachte dabei besonders die Leistung: P1 und P2 bleiben identisch.'));

    const panel = el('div', { class: 'sim-panel' });
    const wrap = el('div', { class: 'two-col' });
    const leftWrap = el('div', { class: 'sim-canvas-wrap' });
    const coilCanvas = el('canvas');
    leftWrap.appendChild(coilCanvas);
    const rightWrap = el('div', { class: 'sim-canvas-wrap' });
    const waveCanvas = el('canvas');
    rightWrap.appendChild(waveCanvas);
    wrap.appendChild(leftWrap); wrap.appendChild(rightWrap);
    panel.appendChild(wrap);

    panel.appendChild(el('div', { class: 'legend' }, [
      legendItem(COLORS.amber, 'u₁(t) — Primärspannung', 'line'),
      legendItem(COLORS.cyan, 'u₂(t) — Sekundärspannung', 'line'),
    ]));

    const readoutRow = el('div', { class: 'readout-row' }, [
      readout('ü = N1/N2', 'ro-ue'), readout('U2', 'ro-u2'), readout('I2', 'ro-i2'),
      readout('P1', 'ro-p1'), readout('P2', 'ro-p2'),
    ]);
    panel.appendChild(readoutRow);

    const grid = el('div', { class: 'controls-grid' });
    const sN1 = slider({ id: 'tr-n1', label: 'Windungen N1 (primär)', min: 10, max: 400, step: 5, value: 200, unit: '' });
    const sN2 = slider({ id: 'tr-n2', label: 'Windungen N2 (sekundär)', min: 10, max: 400, step: 5, value: 40, unit: '' });
    const sU1 = slider({ id: 'tr-u1', label: 'Primärspannung U1', min: 5, max: 230, step: 5, value: 230, unit: ' V' });
    const sI1 = slider({ id: 'tr-i1', label: 'Primärstrom I1', min: 0.05, max: 2, step: 0.05, value: 0.5, unit: ' A' });
    [sN1, sN2, sU1, sI1].forEach((s) => grid.appendChild(s.row));
    panel.appendChild(grid);
    container.appendChild(panel);

    // ---- state ----
    const ctxK = setupCanvas(coilCanvas, 260);
    const ctxW = setupCanvas(waveCanvas, 260);
    let simT = 0, last = performance.now(), history = [];

    function frame(now) {
      if (!coilCanvas.isConnected) return;
      const dt = Math.min(0.04, (now - last) / 1000); last = now;
      simT += dt;

      const N1 = parseFloat(sN1.input.value), N2 = parseFloat(sN2.input.value);
      const U1 = parseFloat(sU1.input.value), I1 = parseFloat(sI1.input.value);
      const ue = N1 / N2;
      const U2 = U1 / ue;
      const I2 = I1 * ue;
      const P1 = U1 * I1, P2 = U2 * I2;

      document.getElementById('ro-ue').textContent = fmtNum(ue, 2);
      document.getElementById('ro-u2').textContent = fmtNum(U2, 2) + ' V';
      document.getElementById('ro-i2').textContent = fmtNum(I2, 2) + ' A';
      document.getElementById('ro-p1').textContent = fmtNum(P1, 1) + ' W';
      document.getElementById('ro-p2').textContent = fmtNum(P2, 1) + ' W';

      const omegaDisplay = 2.4;
      const u1n = Math.sin(simT * omegaDisplay);
      const u2n = (U2 / U1) * Math.sin(simT * omegaDisplay);
      history.push({ t: simT, u1: u1n, u2: u2n });
      history = history.filter((p) => p.t > simT - 8);

      drawCoils(N1, N2, U1, U2, I1, I2);
      drawWave();
      requestAnimationFrame(frame);
    }

    function drawLoops(ctx, x, yTop, yBot, n, color) {
      const step = (yBot - yTop) / (n + 1);
      ctx.strokeStyle = color; ctx.lineWidth = 2;
      for (let i = 1; i <= n; i++) {
        const y = yTop + step * i;
        ctx.beginPath();
        ctx.ellipse(x, y, 13, 7, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    function drawCoils(N1, N2, U1, U2, I1, I2) {
      const W = cssW(coilCanvas), H = 260;
      ctxK.clearRect(0, 0, W, H);
      const coreX1 = W * 0.42, coreX2 = W * 0.58, top = 34, bot = H - 34;

      ctxK.strokeStyle = COLORS.dim; ctxK.lineWidth = 6;
      ctxK.strokeRect(coreX1, top, coreX2 - coreX1, bot - top);
      ctxK.clearRect(coreX1 + 6, top + 6, coreX2 - coreX1 - 12, bot - top - 12);

      const n1v = Math.round(3 + ((N1 - 10) / 390) * 10);
      const n2v = Math.round(3 + ((N2 - 10) / 390) * 10);
      drawLoops(ctxK, coreX1, top + 10, bot - 10, n1v, COLORS.amber);
      drawLoops(ctxK, coreX2, top + 10, bot - 10, n2v, COLORS.cyan);

      // primary source + leads
      const px = 34;
      ctxK.strokeStyle = COLORS.amber; ctxK.lineWidth = 2;
      drawWire(ctxK, px, top, coreX1, top, COLORS.amber, 2);
      drawWire(ctxK, px, bot, coreX1, bot, COLORS.amber, 2);
      ctxK.beginPath(); ctxK.arc(px, H / 2, 16, 0, Math.PI * 2); ctxK.stroke();
      ctxK.fillStyle = COLORS.amber; ctxK.font = '13px ui-monospace, monospace'; ctxK.textAlign = 'center'; ctxK.textBaseline = 'middle';
      ctxK.fillText('~', px, H / 2 + 1);
      ctxK.textBaseline = 'alphabetic';

      // secondary leads to open terminals
      const sx = W - 34;
      drawWire(ctxK, coreX2, top, sx, top, COLORS.cyan, 2);
      drawWire(ctxK, coreX2, bot, sx, bot, COLORS.cyan, 2);
      ctxK.fillStyle = COLORS.cyan;
      ctxK.beginPath(); ctxK.arc(sx, top, 3, 0, Math.PI * 2); ctxK.fill();
      ctxK.beginPath(); ctxK.arc(sx, bot, 3, 0, Math.PI * 2); ctxK.fill();

      ctxK.font = '11px ui-monospace, monospace'; ctxK.textAlign = 'center';
      ctxK.fillStyle = COLORS.amber; ctxK.fillText('N1 = ' + N1, coreX1, H - 10);
      ctxK.fillStyle = COLORS.cyan; ctxK.fillText('N2 = ' + N2, coreX2, H - 10);
      ctxK.fillStyle = COLORS.mute;
      ctxK.fillText('U1 = ' + fmtNum(U1, 0) + ' V, I1 = ' + fmtNum(I1, 2) + ' A', px, 18);
      ctxK.fillText('U2 = ' + fmtNum(U2, 1) + ' V, I2 = ' + fmtNum(I2, 2) + ' A', sx, 18);
    }

    function drawWave() {
      const W = cssW(waveCanvas), H = 260;
      ctxW.clearRect(0, 0, W, H);
      const pad = { l: 14, r: 14, t: 16, b: 20 };
      const cx = pad.l, cy = pad.t, cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
      const series = [
        { data: history.map((p) => ({ t: p.t, v: p.u1 })), color: COLORS.amber },
        { data: history.map((p) => ({ t: p.t, v: p.u2 })), color: COLORS.cyan },
      ];
      drawStripChart(ctxW, cx, cy, cw, ch, series, { vMin: -1.3, vMax: 1.3 });
      ctxW.fillStyle = COLORS.mute; ctxW.font = '10px ui-monospace, monospace'; ctxW.textAlign = 'left';
      ctxW.fillText('normiert auf U1 = 1 (Anschauung)', cx + 2, cy + 10);
    }

    requestAnimationFrame(frame);

    container.appendChild(el('div', { class: 'callout info' }, [
      el('span', { class: 'callout-label' }, 'Was du sehen solltest'),
      el('ul', {}, [
        el('li', {}, ['u₁ und u₂ sind ', el('strong', {}, 'immer in Phase'), ' — der ideale Transformator verschiebt die Phase nicht, er skaliert nur die Amplitude.']),
        el('li', {}, ['Egal wie du N1, N2, U1 und I1 einstellst: ', el('strong', {}, 'P1 bleibt gleich P2'), '. Das ist keine Rechenannahme im Code, sondern die Definition eines verlustfreien, idealen Transformators.']),
        el('li', {}, ['Machst du N2 grösser als N1, steigt U2 über U1 — aber I2 fällt im ', el('strong', {}, 'exakt gleichen Verhältnis'), ' unter I1.']),
      ]),
    ]));

    container.appendChild(el('h2', {}, [el('span', { class: 'h2-num' }, '2 ·'), 'Die Transformatorgleichungen']));
    const dgrid = el('div', { class: 'def-grid' });
    dgrid.appendChild(el('div', { class: 'def-card' }, [
      el('h4', {}, 'Übersetzungsverhältnis'),
      el('p', {}, 'Verhältnis der Windungszahlen — bestimmt, wie stark Spannung und Strom skaliert werden.'),
      formulaBlock('\\ddot{u} = \\dfrac{N_1}{N_2}'),
    ]));
    dgrid.appendChild(el('div', { class: 'def-card' }, [
      el('h4', {}, 'Spannungs- & Stromübersetzung'),
      el('p', {}, 'Spannung folgt dem Windungsverhältnis direkt, Strom genau umgekehrt.'),
      formulaBlock([
        'U_2 = \\dfrac{U_1}{\\ddot{u}}',
        'I_2 = I_1 \\cdot \\ddot{u}',
      ]),
    ]));
    dgrid.appendChild(el('div', { class: 'def-card' }, [
      el('h4', {}, 'Leistung (ideal)'),
      el('p', {}, 'Ohne Verluste ist die übertragene Leistung auf beiden Seiten identisch.'),
      formulaBlock('P_1 = U_1 I_1 = U_2 I_2 = P_2'),
    ]));
    dgrid.appendChild(el('div', { class: 'def-card' }, [
      el('h4', {}, 'Impedanztransformation'),
      el('p', {}, 'Eine Last Z2 auf der Sekundärseite erscheint von der Primärseite aus anders gross — nützlich zur Anpassung.'),
      formulaBlock('Z_2\' = \\ddot{u}^2 \\cdot Z_2 \\quad \\text{(von der Primärseite aus gesehen)}'),
    ]));
    container.appendChild(dgrid);

    container.appendChild(el('div', { class: 'table-wrap' }, [
      el('table', {}, [
        el('thead', {}, el('tr', {}, [el('th', {}, ''), el('th', {}, 'Aufwärtstransformator (N2 > N1)'), el('th', {}, 'Abwärtstransformator (N2 < N1)')])),
        el('tbody', {}, [
          el('tr', {}, [el('td', {}, [el('strong', {}, 'Spannung')]), el('td', {}, 'steigt'), el('td', {}, 'sinkt')]),
          el('tr', {}, [el('td', {}, [el('strong', {}, 'Strom')]), el('td', {}, 'sinkt'), el('td', {}, 'steigt')]),
          el('tr', {}, [el('td', {}, [el('strong', {}, 'typischer Einsatz')]), el('td', {}, 'Kraftwerk → Übertragungsleitung'), el('td', {}, 'Netz → Hausanschluss / Kleingerät')]),
        ]),
      ]),
    ]));

    container.appendChild(el('h2', {}, [el('span', { class: 'h2-num' }, '3 ·'), 'Beispielrechnung']));
    container.appendChild(exampleBox({
      given: [['N1', '800 Windungen'], ['N2', '40 Windungen'], ['U1', '230 V'], ['I1', '0.5 A']],
      steps: [
        { text: 'Übersetzungsverhältnis berechnen.', formula: '\\ddot{u} = \\dfrac{N_1}{N_2} = \\dfrac{800}{40} = 20' },
        { text: 'Sekundärspannung.', formula: 'U_2 = \\dfrac{U_1}{\\ddot{u}} = \\dfrac{230}{20} = 11.5\\text{ V}' },
        { text: 'Sekundärstrom.', formula: 'I_2 = I_1 \\cdot \\ddot{u} = 0.5 \\cdot 20 = 10\\text{ A}' },
        { text: 'Probe über die Leistung.', formula: 'P_1 = 230 \\cdot 0.5 = 115\\text{ W} \\qquad P_2 = 11.5 \\cdot 10 = 115\\text{ W} \\checkmark' },
      ],
      result: { label: 'Ergebnis', value: 'U2 = 11.5 V, I2 = 10 A, P1 = P2 = 115 W' },
    }));

    container.appendChild(el('div', { class: 'callout bad' }, [
      el('span', { class: 'callout-label' }, 'Prüfungsfallen'),
      el('ul', {}, [
        el('li', {}, ['Ein Transformator funktioniert ', el('strong', {}, 'nur mit sich änderndem Fluss'), ' — an reiner Gleichspannung passiert nichts (kein dΦ/dt, keine Induktion, siehe Induktionsgesetz).']),
        el('li', {}, ['„Mehr Windungen“ heisst nicht automatisch „mehr Leistung“ — die Leistung bleibt (im Idealfall) gleich, nur das Verhältnis U zu I ändert sich.']),
        el('li', {}, ['Reale Transformatoren haben ', el('strong', {}, 'Kupfer- und Eisenverluste'), ' — P2 ist in Wirklichkeit immer etwas kleiner als P1, der Wirkungsgrad liegt aber oft über 95 %.']),
        el('li', {}, ['Bei der Impedanztransformation geht das Verhältnis ', el('strong', {}, 'quadratisch'), ' ein — ein häufiger Fehler ist, ü statt ü² zu verwenden.']),
      ]),
    ]));
  },
});
