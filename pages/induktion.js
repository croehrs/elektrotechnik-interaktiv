window.PAGES = window.PAGES || [];
window.PAGES.push({
  id: 'induktion',
  category: 'Induktion',
  order: 5,
  num: '3.1',
  week: 'Woche 8',
  formelsammlung: 'Kap. 5 „Zeitlich veränderliches EM-Feld", S. 11',
  navTitle: 'Induktionsgesetz',
  title: 'Das Induktionsgesetz: zwei Wege, denselben Fluss zu ändern',
  subtitle: 'Egal ob sich der Leiter bewegt oder das Feld sich ändert — induziert wird immer nur eines: eine Änderung des magnetischen Flusses.',
  teaser: 'Rotierende Spule und bewegter Leiterstab — zwei Induktionsmechanismen im Vergleich. Plus Prüfungsaufgabe FS 25 zum Durchspielen.',

  render(container) {
    container.appendChild(el('div', { class: 'callout warn' }, [
      el('span', { class: 'callout-label' }, 'Warum das verwirrt'),
      el('p', {}, 'Das Induktionsgesetz u = −N·dΦ/dt sieht nach einer einzigen Formel aus, aber Φ kann sich auf zwei völlig verschiedene Arten ändern: weil sich der Leiter durch ein Feld bewegt (Bewegungsinduktion, „Generatorprinzip“) oder weil sich das Feld selbst zeitlich ändert, während der Leiter still steht (Ruheinduktion, „Transformatorprinzip“). Beide Fälle liefern eine induzierte Spannung, aber mit völlig unterschiedlichem zeitlichem Verlauf — genau das zeigen die zwei Modi unten.'),
    ]));

    container.appendChild(el('h2', {}, [el('span', { class: 'h2-num' }, '1 ·'), 'Zwei Induktionsmechanismen']));
    container.appendChild(el('p', {}, 'Wechsle zwischen „rotierende Spule“ (der Winkel zwischen Spule und Feld ändert sich stetig — das Generatorprinzip) und „Leiterstab“ (ein Stab durchquert eine begrenzte Feldzone — Induktion durch Ein- und Austritt).'));

    const panel = el('div', { class: 'sim-panel' });
    const toolbar = el('div', { class: 'sim-toolbar' });
    const modeCoil = el('button', { class: 'btn active' }, '🌀 rotierende Spule');
    const modeRod = el('button', { class: 'btn' }, '➡ Leiterstab durch Feldzone');
    const playBtn = el('button', { class: 'btn primary' }, '⏸ läuft');
    toolbar.appendChild(modeCoil); toolbar.appendChild(modeRod); toolbar.appendChild(playBtn);
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

    panel.appendChild(el('div', { class: 'legend' }, [
      legendItem(COLORS.violet, 'Φ(t) — magnetischer Fluss', 'line'),
      legendItem(COLORS.amber, 'u(t) — induzierte Spannung', 'line'),
    ]));

    const readoutRow = el('div', { class: 'readout-row' }, [
      readout('Φ', 'ro-phi'), readout('u = −dΦ/dt', 'ro-u'),
    ]);
    panel.appendChild(readoutRow);

    const gridCoil = el('div', { class: 'controls-grid' });
    const sN = slider({ id: 'ind-n', label: 'Windungszahl N', min: 1, max: 10, step: 1, value: 4, unit: '' });
    const sB1 = slider({ id: 'ind-b1', label: 'Feldstärke B', min: 0.3, max: 2, step: 0.05, value: 1, unit: '' });
    const sW = slider({ id: 'ind-w', label: 'Drehzahl ω', min: 0.5, max: 6, step: 0.1, value: 2, unit: ' rad/s' });
    [sN, sB1, sW].forEach((s) => gridCoil.appendChild(s.row));
    panel.appendChild(gridCoil);

    const gridRod = el('div', { class: 'controls-grid', style: 'display:none' });
    const sB2 = slider({ id: 'ind-b2', label: 'Feldstärke B', min: 0.3, max: 2, step: 0.05, value: 1, unit: '' });
    const sL = slider({ id: 'ind-l', label: 'Schienenabstand l', min: 40, max: 120, step: 5, value: 80, unit: ' px' });
    const sV = slider({ id: 'ind-v', label: 'Geschwindigkeit v', min: 30, max: 160, step: 5, value: 90, unit: ' px/s' });
    [sB2, sL, sV].forEach((s) => gridRod.appendChild(s.row));
    panel.appendChild(gridRod);

    container.appendChild(panel);

    // ---- state ----
    const ctxS = setupCanvas(sceneCanvas, 260);
    const ctxG = setupCanvas(chartCanvas, 260);
    let mode = 'coil';
    let running = true;
    let theta = 0, simT = 0, last = performance.now();
    let history = [];

    let barX = 0, barDir = 1;

    modeCoil.addEventListener('click', () => {
      mode = 'coil'; modeCoil.className = 'btn active'; modeRod.className = 'btn';
      gridCoil.style.display = ''; gridRod.style.display = 'none';
      history = []; simT = 0;
    });
    modeRod.addEventListener('click', () => {
      mode = 'rod'; modeRod.className = 'btn active'; modeCoil.className = 'btn';
      gridCoil.style.display = 'none'; gridRod.style.display = '';
      history = []; simT = 0; barX = -1;
    });
    playBtn.addEventListener('click', () => { running = !running; playBtn.textContent = running ? '⏸ läuft' : '▶ pausiert'; });

    function frame(now) {
      if (!sceneCanvas.isConnected) return;
      const dt = Math.min(0.04, (now - last) / 1000); last = now;
      if (running) simT += dt;

      let phi, u;
      if (mode === 'coil') {
        const N = parseFloat(sN.input.value), B = parseFloat(sB1.input.value), w = parseFloat(sW.input.value);
        if (running) theta += w * dt;
        phi = N * B * Math.cos(theta);
        u = N * B * w * Math.sin(theta);
        drawCoil(N, B, w, theta);
      } else {
        const B = parseFloat(sB2.input.value), l = parseFloat(sL.input.value), v = parseFloat(sV.input.value);
        const W = cssW(sceneCanvas);
        const leftX = 50, rightX = W - 50;
        const fieldX0 = leftX + (rightX - leftX) * 0.35, fieldX1 = leftX + (rightX - leftX) * 0.65;
        if (barX < 0) barX = leftX + 4;
        if (running) {
          barX += barDir * v * dt;
          if (barX > rightX) { barX = rightX; barDir = -1; }
          if (barX < leftX) { barX = leftX; barDir = 1; }
        }
        const inField = barX >= fieldX0 && barX <= fieldX1;
        const overlap = Math.max(0, Math.min(barX, fieldX1) - fieldX0);
        phi = (B * l * overlap) / 3000;
        u = inField ? (B * l * barDir * v) / 3000 : 0;
        drawRod(B, l, leftX, rightX, fieldX0, fieldX1);
      }

      document.getElementById('ro-phi').textContent = fmtNum(phi, 2);
      document.getElementById('ro-u').textContent = fmtNum(u, 2) + ' V';

      history.push({ t: simT, phi, u });
      history = history.filter((p) => p.t > simT - 10);
      drawChart();

      requestAnimationFrame(frame);
    }

    function drawCoil(N, B, w, theta) {
      const W = cssW(sceneCanvas), H = 260;
      ctxS.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2, R = 62;

      // B field arrows (horizontal, pointing right)
      ctxS.strokeStyle = 'rgba(158,167,180,0.5)';
      for (let gy = 30; gy < H - 20; gy += 34) {
        drawArrow(ctxS, 24, gy, W - 24, gy, 'rgba(158,167,180,0.35)', 1.3);
      }
      ctxS.fillStyle = COLORS.mute; ctxS.font = '11px ui-monospace, monospace'; ctxS.textAlign = 'left';
      ctxS.fillText('B →', 24, 20);

      // rotating coil as a line through center, ends colored (current direction flips with sin)
      const x1 = cx + Math.cos(theta) * R, y1 = cy + Math.sin(theta) * R * 0.45;
      const x2 = cx - Math.cos(theta) * R, y2 = cy - Math.sin(theta) * R * 0.45;
      ctxS.strokeStyle = COLORS.fg; ctxS.lineWidth = 3;
      ctxS.beginPath(); ctxS.moveTo(x1, y1); ctxS.lineTo(x2, y2); ctxS.stroke();
      ctxS.strokeStyle = COLORS.line; ctxS.lineWidth = 1;
      ctxS.beginPath(); ctxS.ellipse(cx, cy, R, R * 0.45, 0, 0, Math.PI * 2); ctxS.stroke();

      const u = N * B * w * Math.sin(theta);
      const endColor = u >= 0 ? COLORS.amber : COLORS.cyan;
      const endColor2 = u >= 0 ? COLORS.cyan : COLORS.amber;
      ctxS.fillStyle = endColor;
      ctxS.beginPath(); ctxS.arc(x1, y1, 7, 0, Math.PI * 2); ctxS.fill();
      ctxS.fillStyle = endColor2;
      ctxS.beginPath(); ctxS.arc(x2, y2, 7, 0, Math.PI * 2); ctxS.fill();

      ctxS.fillStyle = COLORS.dim; ctxS.font = '11.5px ui-monospace, monospace'; ctxS.textAlign = 'center';
      ctxS.fillText('N = ' + N, cx, H - 16);
    }

    function drawRod(B, l, leftX, rightX, fieldX0, fieldX1) {
      const W = cssW(sceneCanvas), H = 260;
      ctxS.clearRect(0, 0, W, H);
      const cy = H / 2, topY = cy - l / 2, botY = cy + l / 2;

      // field zone dots
      ctxS.fillStyle = 'rgba(167,139,250,0.55)';
      for (let gx = fieldX0 + 8; gx < fieldX1; gx += 18) {
        for (let gy = topY + 10; gy < botY; gy += 16) {
          ctxS.beginPath(); ctxS.arc(gx, gy, 2, 0, Math.PI * 2); ctxS.fill();
        }
      }
      ctxS.strokeStyle = 'rgba(167,139,250,0.35)'; ctxS.setLineDash([4, 4]);
      ctxS.strokeRect(fieldX0, topY - 6, fieldX1 - fieldX0, l + 12);
      ctxS.setLineDash([]);

      // rails + closing end at leftX
      drawWire(ctxS, leftX, topY, rightX, topY, COLORS.dim, 2);
      drawWire(ctxS, leftX, botY, rightX, botY, COLORS.dim, 2);
      drawWire(ctxS, leftX, topY, leftX, botY, COLORS.dim, 2);

      // loop fill (enclosed area, leftX..barX)
      ctxS.fillStyle = 'rgba(255,180,84,0.10)';
      ctxS.fillRect(leftX, topY, barX - leftX, l);

      // sliding rod
      const inField = barX >= fieldX0 && barX <= fieldX1;
      drawWire(ctxS, barX, topY, barX, botY, inField ? COLORS.amber : COLORS.fg, 4);

      ctxS.fillStyle = COLORS.mute; ctxS.font = '11px ui-monospace, monospace'; ctxS.textAlign = 'center';
      ctxS.fillText('Feldzone', (fieldX0 + fieldX1) / 2, topY - 12);
    }

    function drawChart() {
      const W = cssW(chartCanvas), H = 260;
      ctxG.clearRect(0, 0, W, H);
      const pad = { l: 34, r: 12, t: 16, b: 22 };
      const cx = pad.l, cy = pad.t, cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
      const series = [
        { data: history.map((p) => ({ t: p.t, v: p.phi })), color: COLORS.violet },
        { data: history.map((p) => ({ t: p.t, v: p.u })), color: COLORS.amber },
      ];
      drawStripChart(ctxG, cx, cy, cw, ch, series);
      ctxG.fillStyle = COLORS.mute; ctxG.font = '10px ui-monospace, monospace'; ctxG.textAlign = 'left';
      ctxG.fillText('Φ (violett) · u (orange)', cx + 2, cy + 10);
      ctxG.textAlign = 'right'; ctxG.fillText('t →', cx + cw, cy + ch + 16);
    }

    requestAnimationFrame(frame);

    container.appendChild(el('div', { class: 'callout info' }, [
      el('span', { class: 'callout-label' }, 'Was du sehen solltest'),
      el('ul', {}, [
        el('li', {}, ['Bei der ', el('strong', {}, 'Spule'), ' ist u maximal genau dann, wenn Φ am schnellsten steigt oder fällt — also wenn die Spulenebene ', el('strong', {}, 'parallel'), ' zu B liegt, nicht wenn Φ selbst maximal ist. u und Φ sind um 90° phasenverschoben.']),
        el('li', {}, ['Beim ', el('strong', {}, 'Leiterstab'), ' ist u nur ungleich null, ', el('strong', {}, 'während'), ' der Stab die Feldzone durchquert — davor und danach ist Φ konstant, also u = 0, obwohl sich der Stab weiterbewegt.']),
        el('li', {}, ['Kehrt der Stab die Richtung um, kehrt sich auch das Vorzeichen von u um — das ist die Lenzsche Regel in Aktion: die induzierte Spannung wirkt der Flussänderung entgegen.']),
      ]),
    ]));

    container.appendChild(el('h2', {}, [el('span', { class: 'h2-num' }, '2 ·'), 'Das Induktionsgesetz']));
    const dgrid = el('div', { class: 'def-grid' });
    dgrid.appendChild(el('div', { class: 'def-card' }, [
      el('h4', {}, 'Allgemein'),
      el('p', {}, 'Gilt für jede Ursache der Flussänderung — Bewegung, Rotation, oder ein zeitlich veränderliches Feld.'),
      formulaBlock([
        'u = -N \\cdot \\dfrac{d\\Phi}{dt}',
        '\\Phi = \\iint \\vec{B} \\cdot d\\vec{A}',
      ]),
    ]));
    dgrid.appendChild(el('div', { class: 'def-card' }, [
      el('h4', {}, 'Rotierende Spule (Generator)'),
      el('p', {}, 'Fläche und B konstant, nur der Winkel ändert sich — daraus folgt eine reine Sinusspannung.'),
      formulaBlock([
        '\\Phi(t) = N B A \\cos(\\omega t)',
        'u(t) = N B A \\omega \\sin(\\omega t)',
      ]),
    ]));
    dgrid.appendChild(el('div', { class: 'def-card' }, [
      el('h4', {}, 'Bewegter Leiter (motional EMF)'),
      el('p', {}, 'Direkt aus der Lorentzkraft auf die Ladungsträger im bewegten Leiter herleitbar.'),
      formulaBlock('u = B \\cdot l \\cdot v \\quad \\text{(nur wenn Stab im Feld ist)}'),
    ]));
    container.appendChild(dgrid);

    container.appendChild(el('h2', {}, [el('span', { class: 'h2-num' }, '3 ·'), 'Beispielrechnung']));
    container.appendChild(exampleBox({
      given: [['N', '200 Windungen'], ['B', '0.4 T'], ['A', '0.02 m²'], ['f', '50 Hz']],
      steps: [
        { text: 'Kreisfrequenz aus der Netzfrequenz.', formula: '\\omega = 2\\pi f = 2\\pi \\cdot 50 \\approx 314.16\\ \\text{rad/s}' },
        { text: 'Spitzenspannung der rotierenden Spule.', formula: '\\hat{u} = NBA\\omega = 200 \\cdot 0.4 \\cdot 0.02 \\cdot 314.16 \\approx 502.7\\text{ V}' },
        { text: 'Effektivwert, wie er auf einem Typenschild stehen würde.', formula: 'U_{eff} = \\dfrac{\\hat{u}}{\\sqrt{2}} \\approx 355.5\\text{ V}' },
      ],
      result: { label: 'Ergebnis', value: 'û ≈ 502.7 V (Spitzenwert), U_eff ≈ 355.5 V' },
    }));

    container.appendChild(el('div', { class: 'callout bad' }, [
      el('span', { class: 'callout-label' }, 'Prüfungsfallen'),
      el('ul', {}, [
        el('li', {}, ['Das Minuszeichen in u = −N·dΦ/dt ist die ', el('strong', {}, 'Lenzsche Regel'), ': der induzierte Strom erzeugt selbst ein Feld, das der ursprünglichen Flussänderung entgegenwirkt — nicht ein reines Vorzeichen-Detail.']),
        el('li', {}, ['„Kein Fluss durch die Schleife“ heisst nicht „keine induzierte Spannung möglich“ — entscheidend ist die ', el('strong', {}, 'Änderungsrate'), ', nicht der Momentanwert von Φ.']),
        el('li', {}, ['Bewegt sich ein Leiter parallel zu den Feldlinien statt sie zu schneiden, wird ', el('strong', {}, 'nichts'), ' induziert — nur die Komponente der Bewegung senkrecht zu B zählt.']),
      ]),
    ]));

    // Prüfungsaufgabe FS 25 (c) — siehe pages/induktion-fs25.js
    if (typeof renderInduktionFS25 === 'function') renderInduktionFS25(container);
  },
});
