window.PAGES = window.PAGES || [];
window.PAGES.push({
  id: 'filter',
  category: 'Wechselstrom',
  order: 7,
  num: '4.2',
  week: 'Woche 12',
  formelsammlung: 'Kap. 6 „Wechselstrom", S. 15',
  navTitle: 'Filter: Hoch- & Tiefpass',
  title: 'RC-Filter: Hochpass und Tiefpass',
  subtitle: 'Derselbe Bauteil-Zweikampf aus R und C — je nachdem, wo du abgreifst, lässt die Schaltung tiefe oder hohe Frequenzen durch.',
  teaser: 'Bode-Diagramm und Zeitsignal live zu einer wählbaren Testfrequenz.',

  render(container) {
    container.appendChild(el('div', { class: 'callout warn' }, [
      el('span', { class: 'callout-label' }, 'Warum das verwirrt'),
      el('p', {}, 'Tiefpass und Hochpass sind exakt dieselbe Schaltung aus R und C — der einzige Unterschied ist, ', el('strong', {}, 'wo'), ' du die Ausgangsspannung abgreifst. Über C ist der Kondensator bei hohen Frequenzen fast ein Kurzschluss (X_C klein), also kommt dort wenig an: Tiefpass. Über R passiert das Gegenteil: bei hohen Frequenzen fällt fast die ganze Spannung an R ab: Hochpass. Es gibt keine zweite Formel zu lernen — nur eine andere Spannungsteiler-Position.'),
    ]));

    container.appendChild(el('h2', {}, [el('span', { class: 'h2-num' }, '1 ·'), 'Bode-Diagramm und Zeitsignal']));
    container.appendChild(el('p', {}, 'Wähle eine Testfrequenz f und beobachte, wie stark sie gedämpft und phasenverschoben wird — sowohl im Frequenzgang links als auch direkt am Zeitsignal rechts.'));

    const panel = el('div', { class: 'sim-panel' });
    const toolbar = el('div', { class: 'sim-toolbar' });
    const lowBtn = el('button', { class: 'btn active' }, 'Tiefpass (Ausgang an C)');
    const highBtn = el('button', { class: 'btn' }, 'Hochpass (Ausgang an R)');
    toolbar.appendChild(lowBtn); toolbar.appendChild(highBtn);
    panel.appendChild(toolbar);

    const wrap = el('div', { class: 'two-col' });
    const leftWrap = el('div', { class: 'sim-canvas-wrap' });
    const bodeCanvas = el('canvas');
    leftWrap.appendChild(bodeCanvas);
    const rightWrap = el('div', { class: 'sim-canvas-wrap' });
    const waveCanvas = el('canvas');
    rightWrap.appendChild(waveCanvas);
    wrap.appendChild(leftWrap); wrap.appendChild(rightWrap);
    panel.appendChild(wrap);

    panel.appendChild(el('div', { class: 'legend' }, [
      legendItem(COLORS.dim, '|H(f)| Frequenzgang', 'line'),
      legendItem(COLORS.green, 'Testfrequenz f', 'line'),
      legendItem(COLORS.amber, 'u_in(t)', 'line'),
      legendItem(COLORS.cyan, 'u_out(t)', 'line'),
    ]));

    const readoutRow = el('div', { class: 'readout-row' }, [
      readout('Grenzfrequenz f_g', 'ro-fg'), readout('|H(f)|', 'ro-h'),
      readout('Dämpfung', 'ro-db'), readout('Phase', 'ro-phase'),
    ]);
    panel.appendChild(readoutRow);

    const grid = el('div', { class: 'controls-grid' });
    const sR = slider({ id: 'fl-r', label: 'R', min: 100, max: 20000, step: 100, value: 1000, unit: ' Ω' });
    const sC = slider({ id: 'fl-c', label: 'C', min: 1, max: 1000, step: 1, value: 100, unit: ' nF' });
    const sF = slider({
      id: 'fl-f', label: 'Testfrequenz f', min: 0, max: 1000, step: 1, value: 500, unit: '',
      format: () => '',
    });
    [sR, sC, sF].forEach((s) => grid.appendChild(s.row));
    panel.appendChild(grid);
    container.appendChild(panel);

    function fFromSlider(v) { return 1 * Math.pow(1e5, v / 1000); } // 1 Hz .. 100 kHz
    function updateFLabel() {
      const f = fFromSlider(parseFloat(sF.input.value));
      document.getElementById('fl-f-val').textContent = (f >= 1000 ? fmtNum(f / 1000, 2) + ' kHz' : fmtNum(f, 1) + ' Hz');
    }
    sF.input.addEventListener('input', updateFLabel);
    updateFLabel();

    let mode = 'low';
    lowBtn.addEventListener('click', () => { mode = 'low'; lowBtn.className = 'btn active'; highBtn.className = 'btn'; });
    highBtn.addEventListener('click', () => { mode = 'high'; highBtn.className = 'btn active'; lowBtn.className = 'btn'; });

    const ctxB = setupCanvas(bodeCanvas, 280);
    const ctxW = setupCanvas(waveCanvas, 280);
    let simT = 0, last = performance.now(), history = [];
    const FMIN = 1, FMAX = 1e5;

    function transferAt(f, R, C) {
      const w = 2 * Math.PI * f;
      const wrc = w * R * C;
      if (mode === 'low') {
        const mag = 1 / Math.sqrt(1 + wrc * wrc);
        const phase = -Math.atan(wrc);
        return { mag, phase };
      }
      const mag = wrc / Math.sqrt(1 + wrc * wrc);
      const phase = Math.atan2(1, wrc);
      return { mag, phase };
    }

    function frame(now) {
      if (!bodeCanvas.isConnected) return;
      const dt = Math.min(0.04, (now - last) / 1000); last = now;
      simT += dt;

      const R = parseFloat(sR.input.value);
      const C = parseFloat(sC.input.value) * 1e-9;
      const fTest = fFromSlider(parseFloat(sF.input.value));
      const fg = 1 / (2 * Math.PI * R * C);
      const { mag, phase } = transferAt(fTest, R, C);

      document.getElementById('ro-fg').textContent = (fg >= 1000 ? fmtNum(fg / 1000, 2) + ' kHz' : fmtNum(fg, 1) + ' Hz');
      document.getElementById('ro-h').textContent = fmtNum(mag, 3);
      document.getElementById('ro-db').textContent = fmtNum(20 * Math.log10(mag), 1) + ' dB';
      document.getElementById('ro-phase').textContent = fmtNum(phase * 180 / Math.PI, 1) + '°';

      const omegaDisplay = 2.2; // constant visual speed, independent of real fTest
      const uIn = Math.sin(simT * omegaDisplay);
      const uOut = mag * Math.sin(simT * omegaDisplay + phase);
      history.push({ t: simT, uIn, uOut });
      history = history.filter((p) => p.t > simT - 9);

      drawBode(R, C, fg, fTest, mag);
      drawWave();
      requestAnimationFrame(frame);
    }

    function freqToX(f, x0, w) {
      return x0 + (Math.log10(f / FMIN) / Math.log10(FMAX / FMIN)) * w;
    }

    function drawBode(R, C, fg, fTest, magTest) {
      const W = cssW(bodeCanvas), H = 280;
      ctxB.clearRect(0, 0, W, H);
      const pad = { l: 42, r: 14, t: 16, b: 30 };
      const x0 = pad.l, y0 = pad.t, w = W - pad.l - pad.r, h = H - pad.t - pad.b;
      const dbMin = -40, dbMax = 6;

      ctxB.strokeStyle = COLORS.line; ctxB.lineWidth = 1;
      ctxB.strokeRect(x0, y0, w, h);
      ctxB.fillStyle = COLORS.mute; ctxB.font = '10px ui-monospace, monospace';
      [1, 10, 100, 1000, 10000, 100000].forEach((f) => {
        const x = freqToX(f, x0, w);
        ctxB.strokeStyle = COLORS.line;
        ctxB.beginPath(); ctxB.moveTo(x, y0); ctxB.lineTo(x, y0 + h); ctxB.stroke();
        ctxB.textAlign = 'center';
        ctxB.fillText(f >= 1000 ? f / 1000 + 'k' : f, x, y0 + h + 14);
      });
      [-40, -20, -3, 0].forEach((db) => {
        const y = y0 + h - ((db - dbMin) / (dbMax - dbMin)) * h;
        ctxB.strokeStyle = db === -3 ? 'rgba(255,209,102,0.4)' : COLORS.line;
        ctxB.setLineDash(db === -3 ? [3, 3] : []);
        ctxB.beginPath(); ctxB.moveTo(x0, y); ctxB.lineTo(x0 + w, y); ctxB.stroke();
        ctxB.setLineDash([]);
        ctxB.textAlign = 'right';
        ctxB.fillText(db + ' dB', x0 - 5, y + 3);
      });

      // curve
      ctxB.strokeStyle = COLORS.dim; ctxB.lineWidth = 2;
      ctxB.beginPath();
      for (let i = 0; i <= 200; i++) {
        const f = FMIN * Math.pow(FMAX / FMIN, i / 200);
        const { mag } = transferAt(f, R, C);
        const db = Math.max(dbMin, 20 * Math.log10(mag));
        const x = freqToX(f, x0, w);
        const y = y0 + h - ((db - dbMin) / (dbMax - dbMin)) * h;
        i === 0 ? ctxB.moveTo(x, y) : ctxB.lineTo(x, y);
      }
      ctxB.stroke();

      // fg marker
      const xg = freqToX(fg, x0, w);
      ctxB.strokeStyle = 'rgba(255,209,102,0.7)'; ctxB.setLineDash([4, 3]);
      ctxB.beginPath(); ctxB.moveTo(xg, y0); ctxB.lineTo(xg, y0 + h); ctxB.stroke();
      ctxB.setLineDash([]);

      // test marker
      const xt = freqToX(fTest, x0, w);
      const dbT = Math.max(dbMin, 20 * Math.log10(magTest));
      const yt = y0 + h - ((dbT - dbMin) / (dbMax - dbMin)) * h;
      ctxB.strokeStyle = COLORS.green; ctxB.setLineDash([2, 3]);
      ctxB.beginPath(); ctxB.moveTo(xt, y0 + h); ctxB.lineTo(xt, yt); ctxB.stroke();
      ctxB.setLineDash([]);
      ctxB.fillStyle = COLORS.green;
      ctxB.beginPath(); ctxB.arc(xt, yt, 4.5, 0, Math.PI * 2); ctxB.fill();

      ctxB.textAlign = 'left'; ctxB.fillStyle = COLORS.mute;
      ctxB.fillText('f [Hz] →', x0 + w - 50, y0 + h + 14);
    }

    function drawWave() {
      const W = cssW(waveCanvas), H = 280;
      ctxW.clearRect(0, 0, W, H);
      const pad = { l: 12, r: 12, t: 16, b: 20 };
      const cx = pad.l, cy = pad.t, cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
      const series = [
        { data: history.map((p) => ({ t: p.t, v: p.uIn })), color: COLORS.amber },
        { data: history.map((p) => ({ t: p.t, v: p.uOut })), color: COLORS.cyan },
      ];
      drawStripChart(ctxW, cx, cy, cw, ch, series, { vMin: -1.3, vMax: 1.3 });
      ctxW.fillStyle = COLORS.mute; ctxW.font = '10px ui-monospace, monospace'; ctxW.textAlign = 'left';
      ctxW.fillText('Anschauungsgeschwindigkeit (nicht f-echt)', cx + 2, cy + 10);
    }

    requestAnimationFrame(frame);

    container.appendChild(el('div', { class: 'callout info' }, [
      el('span', { class: 'callout-label' }, 'Was du sehen solltest'),
      el('ul', {}, [
        el('li', {}, ['Bei ', el('strong', {}, 'f = f_g'), ' ist die Dämpfung genau ', el('strong', {}, '−3 dB'), ' (Faktor 1/√2 ≈ 0.71) — das ist per Definition die Grenzfrequenz, nicht der Punkt, an dem „nichts mehr durchkommt“.']),
        el('li', {}, ['Weit weg von f_g nähert sich die Kurve einer Geraden (in dB gegen log f) — das ist der Ursprung der „20 dB pro Dekade“-Faustregel für ein einfaches RC-Glied.']),
        el('li', {}, ['Genau bei f_g ist die Phasenverschiebung ', el('strong', {}, '±45°'), ' — bei sehr tiefer bzw. sehr hoher Frequenz nähert sie sich 0° bzw. ±90°.']),
      ]),
    ]));

    container.appendChild(el('h2', {}, [el('span', { class: 'h2-num' }, '2 ·'), 'Übertragungsfunktionen']));
    const dgrid = el('div', { class: 'def-grid' });
    dgrid.appendChild(el('div', { class: 'def-card' }, [
      el('h4', {}, 'Tiefpass (Ausgang an C)'),
      el('p', {}, 'Spannungsteiler zwischen R und X_C, Ausgang über C.'),
      formulaBlock([
        'H(j\\omega) = \\dfrac{1}{1+j\\omega RC}',
        '|H| = \\dfrac{1}{\\sqrt{1+(\\omega RC)^2}}',
      ]),
    ]));
    dgrid.appendChild(el('div', { class: 'def-card' }, [
      el('h4', {}, 'Hochpass (Ausgang an R)'),
      el('p', {}, 'Gleiche Bauteile, Ausgang über R statt über C.'),
      formulaBlock([
        'H(j\\omega) = \\dfrac{j\\omega RC}{1+j\\omega RC}',
        '|H| = \\dfrac{\\omega RC}{\\sqrt{1+(\\omega RC)^2}}',
      ]),
    ]));
    container.appendChild(dgrid);
    container.appendChild(el('p', { class: 'note' }, 'Beide Formeln haben denselben Nenner — das ist kein Zufall, sondern folgt direkt aus derselben Spannungsteiler-Gleichung, nur mit anderem Zähler.'));

    container.appendChild(el('h2', {}, [el('span', { class: 'h2-num' }, '3 ·'), 'Beispielrechnung']));
    container.appendChild(exampleBox({
      given: [['Schaltung', 'Tiefpass'], ['R', '4.7 kΩ'], ['C', '10 nF'], ['f', '50 kHz (Testfrequenz)']],
      steps: [
        { text: 'Grenzfrequenz berechnen.', formula: 'f_g = \\dfrac{1}{2\\pi RC} = \\dfrac{1}{2\\pi \\cdot 4700 \\cdot 10\\cdot 10^{-9}} \\approx 3.39\\text{ kHz}' },
        { text: 'Verhältnis von Testfrequenz zu Grenzfrequenz bilden.', formula: '\\dfrac{f}{f_g} = \\dfrac{50\\,000}{3386} \\approx 14.77' },
        { text: 'Betrag der Übertragungsfunktion bei dieser Frequenz.', formula: '|H| = \\dfrac{1}{\\sqrt{1+(f/f_g)^2}} = \\dfrac{1}{\\sqrt{1+218.0}} \\approx 0.0676' },
        { text: 'In Dezibel umrechnen.', formula: '\\text{Dämpfung} = 20\\log_{10}(0.0676) \\approx -23.4\\text{ dB}' },
      ],
      result: { label: 'Ergebnis', value: 'f_g ≈ 3.39 kHz, bei 50 kHz: −23.4 dB (Faktor ≈ 0.068)' },
    }));

    container.appendChild(el('div', { class: 'callout bad' }, [
      el('span', { class: 'callout-label' }, 'Prüfungsfallen'),
      el('ul', {}, [
        el('li', {}, ['f_g hängt nicht davon ab, ob du Tiefpass oder Hochpass baust — ', el('strong', {}, 'dieselbe Formel'), ' f_g = 1/(2πRC) gilt für beide, nur das Verhalten links/rechts davon ist vertauscht.']),
        el('li', {}, ['−3 dB heisst ', el('strong', {}, 'nicht'), ' „halbe Spannung“ — das wären −6 dB. −3 dB entspricht dem Faktor 1/√2 ≈ 0.707 in der Spannung, aber ½ in der ', el('strong', {}, 'Leistung'), ' (P ∝ U²).']),
        el('li', {}, ['Ein realer Tiefpass dämpft hohe Frequenzen nie schlagartig auf null — er nähert sich asymptotisch, mit −20 dB/Dekade für ein einfaches RC-Glied.']),
      ]),
    ]));
  },
});
