window.PAGES = window.PAGES || [];
window.PAGES.push({
  id: 'rc-glied',
  category: 'Gleichstromkreise',
  order: 2,
  num: '1.2',
  week: 'Woche 2 / 9',
  formelsammlung: 'Kap. 1, S. 2 (Kondensator) & Kap. 6, S. 13 (Zeitverhalten)',
  navTitle: 'RC-Glied: Laden & Entladen',
  title: 'Kondensator: Laden und Entladen am RC-Glied',
  subtitle: 'Ein Kondensator ändert seine Spannung nie sprunghaft — R bestimmt nur, wie schnell er sich dem Ziel nähert, nicht welches Ziel er erreicht.',
  teaser: 'Ladekurve, Entladekurve und die 63%-Regel live am RC-Glied.',

  render(container) {
    container.appendChild(el('div', { class: 'callout warn' }, [
      el('span', { class: 'callout-label' }, 'Warum das verwirrt'),
      el('p', {}, 'Beim Laden UND beim Entladen taucht dieselbe e-Funktion auf, nur mit unterschiedlichem Zielwert — das führt dazu, dass Formeln durcheinandergebracht werden. Merke dir stattdessen ein Bild: die Spannung am Kondensator läuft immer exponentiell auf ihren Endwert zu, egal ob dieser Endwert U₀ (laden) oder 0 (entladen) ist. Nur der Strom springt beim Umschalten — die Spannung nie.'),
    ]));

    container.appendChild(el('h2', {}, [el('span', { class: 'h2-num' }, '1 ·'), 'Laden und Entladen im Wechsel']));
    container.appendChild(el('p', {}, 'Schalte zwischen „Laden“ (Kondensator wird über R an U₀ angeschlossen) und „Entladen“ (Quelle wird abgetrennt, C entlädt sich über R) um. Die Kurve setzt dort fort, wo du umschaltest — das ist Absicht: die Spannung kennt keine Sprünge.'));

    const panel = el('div', { class: 'sim-panel' });
    const toolbar = el('div', { class: 'sim-toolbar' });
    const chargeBtn = el('button', { class: 'btn active' }, '⚡ laden');
    const dischargeBtn = el('button', { class: 'btn' }, '⤵ entladen');
    const resetBtn = el('button', { class: 'btn' }, '↺ zurücksetzen');
    toolbar.appendChild(chargeBtn); toolbar.appendChild(dischargeBtn); toolbar.appendChild(resetBtn);
    panel.appendChild(toolbar);

    const wrap = el('div', { class: 'two-col' });
    const leftWrap = el('div', { class: 'sim-canvas-wrap' });
    const circuitCanvas = el('canvas');
    leftWrap.appendChild(circuitCanvas);
    const rightWrap = el('div', { class: 'sim-canvas-wrap' });
    const chartCanvas = el('canvas');
    rightWrap.appendChild(chartCanvas);
    wrap.appendChild(leftWrap); wrap.appendChild(rightWrap);
    panel.appendChild(wrap);

    const legend = el('div', { class: 'legend' }, [
      legendItem(COLORS.cyan, 'u_C(t)', 'line'),
      legendItem(COLORS.amber, 'i(t)', 'line'),
    ]);
    panel.appendChild(legend);

    const readoutRow = el('div', { class: 'readout-row' }, [
      readout('u_C', 'ro-uc'), readout('i', 'ro-i'), readout('τ = RC', 'ro-tau'), readout('t seit Umschalten', 'ro-t'),
    ]);
    panel.appendChild(readoutRow);

    const grid = el('div', { class: 'controls-grid' });
    const sU = slider({ id: 'rc-u0', label: 'U₀', min: 3, max: 15, step: 0.5, value: 9, unit: ' V' });
    const sR = slider({ id: 'rc-r', label: 'R', min: 100, max: 3000, step: 50, value: 1000, unit: ' Ω' });
    const sC = slider({ id: 'rc-c', label: 'C', min: 100, max: 3000, step: 50, value: 1000, unit: ' µF' });
    [sU, sR, sC].forEach((s) => grid.appendChild(s.row));
    panel.appendChild(grid);
    container.appendChild(panel);

    // ---- state ----
    const ctxC = setupCanvas(circuitCanvas, 230);
    const ctxG = setupCanvas(chartCanvas, 230);
    let mode = 'charge'; // 'charge' | 'discharge'
    let uC = 0, simT = 0, phaseT = 0;
    let history = []; // {t, uc, i}
    let last = performance.now();

    chargeBtn.addEventListener('click', () => { mode = 'charge'; phaseT = 0; chargeBtn.className = 'btn active'; dischargeBtn.className = 'btn'; });
    dischargeBtn.addEventListener('click', () => { mode = 'discharge'; phaseT = 0; chargeBtn.className = 'btn'; dischargeBtn.className = 'btn active'; });
    resetBtn.addEventListener('click', () => { uC = 0; simT = 0; phaseT = 0; history = []; mode = 'charge'; chargeBtn.className = 'btn active'; dischargeBtn.className = 'btn'; });

    function frame(now) {
      if (!circuitCanvas.isConnected) return;
      let dt = Math.min(0.05, (now - last) / 1000); last = now;

      const U0 = parseFloat(sU.input.value);
      const R = parseFloat(sR.input.value);
      const Cf = parseFloat(sC.input.value) * 1e-6;
      const RC = R * Cf;

      const target = mode === 'charge' ? U0 : 0;
      uC += (target - uC) * (1 - Math.exp(-dt / RC));
      const i = (target - uC) / R; // signed: + into capacitor while charging
      simT += dt; phaseT += dt;

      history.push({ t: simT, uc: uC, i: i * 1000 });
      const windowSec = 8;
      history = history.filter((p) => p.t > simT - windowSec);

      document.getElementById('ro-uc').textContent = fmtNum(uC, 2) + ' V';
      document.getElementById('ro-i').textContent = fmtNum(i * 1000, 2) + ' mA';
      document.getElementById('ro-tau').textContent = fmtNum(RC, 3) + ' s';
      document.getElementById('ro-t').textContent = fmtNum(phaseT, 2) + ' s';

      drawCircuit(U0, uC, i);
      drawChart(U0, RC);
      requestAnimationFrame(frame);
    }

    function drawCircuit(U0, uC, i) {
      const W = cssW(circuitCanvas), H = 230;
      ctxC.clearRect(0, 0, W, H);
      const leftX = 56, rightX = W - 70, topY = 50, botY = H - 50;
      const capX = rightX;

      drawBattery(ctxC, leftX, H / 2, botY - topY, COLORS.fg, '');
      ctxC.fillStyle = COLORS.dim; ctxC.font = '12px ui-monospace, monospace'; ctxC.textAlign = 'left';
      ctxC.fillText('U₀', leftX + 18, H / 2 + 22);

      const rMid = leftX + (capX - leftX) * 0.45;
      drawWire(ctxC, leftX, topY, rMid - 30, topY, COLORS.dim, 2);
      drawResistor(ctxC, rMid, topY, 60, COLORS.amber, 'R');
      drawWire(ctxC, rMid + 30, topY, capX, topY, COLORS.dim, 2);
      drawWire(ctxC, leftX, botY, capX, botY, COLORS.dim, 2);

      const chargeFrac = uC / Math.max(U0, 0.001);
      drawCapacitor(ctxC, capX, H / 2, 30, COLORS.cyan, '', chargeFrac);

      // animated dots showing current direction (charging: flow toward C; discharging: flow away from C)
      const flowing = Math.abs(i) > 0.0002;
      if (flowing) {
        const dir = i > 0 ? 1 : -1; // charging current defined positive toward capacitor
        const segs = dir > 0
          ? [{ x1: leftX, y1: topY, x2: rMid - 30, y2: topY }, { x1: rMid + 30, y1: topY, x2: capX, y2: topY }]
          : [{ x1: capX, y1: topY, x2: rMid + 30, y2: topY }, { x1: rMid - 30, y1: topY, x2: leftX, y2: topY }];
        const path = makePath(segs);
        const speed = Math.min(2.2, Math.abs(i) * 400);
        window._rcPhase = (window._rcPhase || 0) + speed * 0.016;
        for (let k = 0; k < 5; k++) {
          const p = path.at(k / 5 + window._rcPhase);
          ctxC.fillStyle = COLORS.amber;
          ctxC.beginPath(); ctxC.arc(p.x, p.y, 3, 0, Math.PI * 2); ctxC.fill();
        }
      }
    }

    function drawChart(U0, RC) {
      const W = cssW(chartCanvas), H = 230;
      ctxG.clearRect(0, 0, W, H);
      const pad = { l: 34, r: 12, t: 14, b: 22 };
      const cx = pad.l, cy = pad.t, cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
      const series = [
        { data: history.map((p) => ({ t: p.t, v: p.uc })), color: COLORS.cyan },
        { data: history.map((p) => ({ t: p.t, v: p.i })), color: COLORS.amber },
      ];
      const scale = drawStripChart(ctxG, cx, cy, cw, ch, series, { vMin: -U0 * 1.2, vMax: U0 * 1.2 });
      ctxG.fillStyle = COLORS.mute;
      ctxG.font = '10px ui-monospace, monospace';
      ctxG.textAlign = 'left';
      ctxG.fillText('u_C [V] · i [mA]', cx + 2, cy + 10);
      ctxG.textAlign = 'right';
      ctxG.fillText('t →', cx + cw, cy + ch + 16);
    }

    requestAnimationFrame(frame);

    container.appendChild(el('div', { class: 'callout info' }, [
      el('span', { class: 'callout-label' }, 'Was du sehen solltest'),
      el('ul', {}, [
        el('li', {}, [el('strong', {}, 'u_C ist stetig'), ' — die cyanfarbene Kurve hat nie einen Sprung, auch nicht direkt im Umschaltmoment.']),
        el('li', {}, [el('strong', {}, 'i springt sofort'), ' beim Umschalten — der Strom darf sich sprunghaft ändern, die Spannung am Kondensator nicht.']),
        el('li', {}, ['Nach etwa ', el('strong', {}, '5τ'), ' ist der Vorgang praktisch abgeschlossen (u_C auf über 99% des Zielwerts) — probiere ein sehr grosses oder kleines R oder C aus.']),
      ]),
    ]));

    container.appendChild(el('h2', {}, [el('span', { class: 'h2-num' }, '2 ·'), 'Die Formeln']));
    const dgrid = el('div', { class: 'def-grid' });
    dgrid.appendChild(el('div', { class: 'def-card' }, [
      el('h4', {}, 'Laden'),
      el('p', {}, 'Kondensator startet ungeladen, Zielwert ist U₀.'),
      formulaBlock([
        'u_C(t) = U_0 \\cdot \\left(1 - e^{-t/RC}\\right)',
        'i(t) = \\dfrac{U_0}{R} \\cdot e^{-t/RC}',
      ]),
    ]));
    dgrid.appendChild(el('div', { class: 'def-card' }, [
      el('h4', {}, 'Entladen'),
      el('p', {}, 'Kondensator startet bei U₀, Zielwert ist 0.'),
      formulaBlock([
        'u_C(t) = U_0 \\cdot e^{-t/RC}',
        'i(t) = -\\dfrac{U_0}{R} \\cdot e^{-t/RC}',
      ]),
    ]));
    container.appendChild(dgrid);

    container.appendChild(el('div', { class: 'table-wrap' }, [
      el('table', {}, [
        el('thead', {}, el('tr', {}, [el('th', {}, 't'), el('th', {}, 'geladen auf'), el('th', {}, 'entladen auf')])),
        el('tbody', {}, [
          el('tr', {}, [el('td', {}, '1τ'), el('td', {}, '63.2 % von U₀'), el('td', {}, '36.8 % von U₀')]),
          el('tr', {}, [el('td', {}, '2τ'), el('td', {}, '86.5 %'), el('td', {}, '13.5 %')]),
          el('tr', {}, [el('td', {}, '3τ'), el('td', {}, '95.0 %'), el('td', {}, '5.0 %')]),
          el('tr', {}, [el('td', {}, '5τ'), el('td', {}, '99.3 % — praktisch fertig'), el('td', {}, '0.7 % — praktisch fertig')]),
        ]),
      ]),
    ]));
    container.appendChild(el('p', { class: 'note' }, 'τ = RC hat die Einheit Ohm · Farad = Sekunde — eine schnelle Dimensionskontrolle, die sich für die Prüfung lohnt.'));

    container.appendChild(el('h2', {}, [el('span', { class: 'h2-num' }, '3 ·'), 'Beispielrechnung']));
    container.appendChild(exampleBox({
      given: [['U₀', '10 V'], ['R', '2 kΩ'], ['C', '470 µF'], ['t', '1.5 s (Laden, ungeladen gestartet)']],
      steps: [
        { text: 'Zeitkonstante berechnen.', formula: '\\tau = R \\cdot C = 2000\\ \\Omega \\cdot 470\\cdot 10^{-6}\\text{ F} = 0.94\\text{ s}' },
        { text: 'Spannung am Kondensator nach t = 1.5 s.', formula: 'u_C(t) = U_0\\left(1-e^{-t/\\tau}\\right) = 10\\left(1-e^{-1.5/0.94}\\right) = 7.97\\text{ V}' },
        { text: 'Strom aus der Restspannung über R.', formula: 'i(t) = \\dfrac{U_0 - u_C}{R} = \\dfrac{10-7.97}{2000} \\approx 1.02\\text{ mA}' },
      ],
      result: { label: 'Ergebnis', value: 'u_C(1.5 s) ≈ 7.97 V, i(1.5 s) ≈ 1.02 mA' },
    }));

    container.appendChild(el('div', { class: 'callout bad' }, [
      el('span', { class: 'callout-label' }, 'Prüfungsfallen'),
      el('ul', {}, [
        el('li', {}, ['Im ', el('strong', {}, 'stationären Zustand'), ' (t → ∞, Gleichspannung) fliesst kein Strom mehr durch einen Kondensator — er wirkt wie eine Unterbrechung. Das wird gerne für „der Kondensator ist kaputt“ gehalten, ist aber sein normales Verhalten.']),
        el('li', {}, ['Die Formel für ', el('strong', {}, 'Entladen'), ' hat kein „1 −“ davor — ein häufiger Copy-Paste-Fehler aus der Ladeformel.']),
        el('li', {}, ['Bei einem ', el('strong', {}, 'Umschalten mitten im Vorgang'), ' (wie in dieser Simulation) startet die neue e-Funktion nicht bei 0 oder U₀, sondern beim aktuellen u_C — das ist der Punkt, an dem die meisten Prüfungsaufgaben ansetzen.']),
      ]),
    ]));
  },
});
