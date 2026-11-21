window.PAGES = window.PAGES || [];
window.PAGES.push({
  id: 'punktregel',
  category: 'Wechselstrom',
  order: 8.5,
  num: '4.4',
  week: 'Woche 10',
  formelsammlung: 'nicht enthalten — verwandt: Kap. 5, S. 12 (gekoppelte Spulen)',
  navTitle: 'Trafo: Punkte & Vorzeichen',
  title: 'Transformator-Vorzeichen: Was bedeuten die Punkte?',
  subtitle: 'Die Gleichungen u₁/u₂ = N₁/N₂ und i₁/i₂ = N₂/N₁ sind schnell hingeschrieben — die Punkte in der Prüfung gibt es für das Vorzeichen. Und das hängt nur am Wickelsinn und an den eingezeichneten Pfeilen.',
  teaser: 'Wicklung, Strom- und Spannungspfeile umdrehen und sehen, wann u₁/u₂ und i₁/i₂ ein Minus bekommen — plus Prüfungsaufgabe HS 24.',

  render(container) {
    // Physik / Konventionen
    //   Φ > 0 heisst: Fluss läuft im Kern im Gegenuhrzeigersinn (Bildschirm).
    //   Punkt einer Spule = die Klemme, bei der ein HINEINfliessender Strom Φ > 0 erzeugt.
    //   Dann gilt (Induktionsgesetz, Verbraucherpfeil):  u_k(Punkt → Nicht-Punkt) = N_k · dΦ/dt
    //   und (Durchflutung, μr → ∞):                     N₁·i₁(in Punkt) + N₂·i₂(in Punkt) = 0
    //   ⇒ Standardfall: u-Pfeile vom Punkt weg, i₁ in den Punkt, i₂ aus dem Punkt → beide Verhältnisse positiv.
    //   Jeder Pfeil, der davon abweicht, misst das Negative → ein Vorzeichenwechsel.

    const N = [4, 2];   // gezeichnete Windungen → ü = 2

    container.appendChild(el('div', { class: 'callout warn' }, [
      el('span', { class: 'callout-label' }, 'Warum das verwirrt'),
      el('p', {}, 'Physikalisch steckt nichts Neues drin: Induktionsgesetz und Durchflutungsgesetz. Aber ob in der Lösung „+“ oder „−“ steht, sieht man der Formel nicht an — es hängt davon ab, wie der Draht um den Kern gewickelt ist und wie die Pfeile in der Skizze gezeichnet sind. Die Punkte sind nur eine Abkürzung, damit man den Wickelsinn nicht jedes Mal aus einer 3D-Skizze herauslesen muss.'),
    ]));

    // ================= 1 · Woher kommen die Gleichungen =================
    container.appendChild(el('h2', {}, [el('span', { class: 'h2-num' }, '1 ·'), 'Woher kommen die Trafo-Gleichungen?']));
    container.appendChild(el('p', {}, 'Einzige Annahme: Der Eisenkern (μr → ∞) sperrt den Fluss komplett ein. Durch beide Spulen geht also derselbe Fluss Φ. Alles andere folgt aus zwei Gesetzen, die du schon kennst.'));
    const g1 = el('div', { class: 'def-grid' });
    g1.appendChild(el('div', { class: 'def-card' }, [
      el('h4', {}, '① Spannung: Induktionsgesetz'),
      el('p', {}, 'Jede Windung sieht dasselbe dΦ/dt. N Windungen in Reihe ⇒ N-fache Spannung. Teilen ⇒ dΦ/dt kürzt sich.'),
      formulaBlock(['u_1 = N_1\\dfrac{\\mathrm d\\Phi}{\\mathrm dt},\\quad u_2 = N_2\\dfrac{\\mathrm d\\Phi}{\\mathrm dt}', '\\Rightarrow\\ \\dfrac{u_1}{u_2} = \\dfrac{N_1}{N_2}']),
    ]));
    g1.appendChild(el('div', { class: 'def-card' }, [
      el('h4', {}, '② Strom: Durchflutungsgesetz'),
      el('p', {}, 'Einmal im Kern herum: H·l = Gesamtdurchflutung. Mit μr → ∞ ist H → 0 — die Durchflutungen müssen sich aufheben. Der Sekundärstrom macht einen Gegenfluss, die Primärseite zieht genau so viel nach.'),
      formulaBlock(['H\\,l = N_1 i_1 - N_2 i_2 \\to 0', '\\Rightarrow\\ \\dfrac{i_1}{i_2} = \\dfrac{N_2}{N_1}']),
    ]));
    g1.appendChild(el('div', { class: 'def-card' }, [
      el('h4', {}, '③ Probe: Energieerhaltung'),
      el('p', {}, 'Beide Gleichungen multipliziert: Was primär hineingeht, kommt sekundär heraus. Der ideale Trafo tauscht nur Spannung gegen Strom.'),
      formulaBlock('u_1 i_1 = u_2 i_2'),
    ]));
    container.appendChild(g1);
    container.appendChild(el('p', { class: 'note' }, 'Die Maschenregel brauchst du im Trafo selbst nicht: Für den restlichen Stromkreis ist jede Spule einfach ein Bauteil mit Klemmenspannung u = N·dΦ/dt — damit rechnest du dann ganz normal Maschen im Primär- und im Sekundärkreis.'));

    // ================= 2 · Punkte & Standardfall =================
    container.appendChild(el('h2', {}, [el('span', { class: 'h2-num' }, '2 ·'), 'Die Punkte und der Standardfall']));
    const g2 = el('div', { class: 'def-grid' });
    g2.appendChild(el('div', { class: 'def-card' }, [
      el('h4', {}, 'Was der Punkt bedeutet'),
      el('p', {}, 'Fliesst ein Strom in den Punkt hinein — egal auf welcher Spule —, erzeugt er Fluss in dieselbe Richtung im Kern. Folge: Die Punkt-Klemmen haben zur gleichen Zeit dieselbe Polarität der induzierten Spannung.'),
    ]));
    g2.appendChild(el('div', { class: 'def-card' }, [
      el('h4', {}, 'Standardfall'),
      el('ul', { style: 'margin:0;padding-left:18px;color:var(--fg-dim);font-size:14px' }, [
        el('li', {}, 'u₁ und u₂ zeigen vom Punkt weg'),
        el('li', {}, 'i₁ fliesst in den Punkt (Primär = Verbraucher)'),
        el('li', {}, 'i₂ fliesst aus dem Punkt (Sekundär = Quelle für die Last)'),
      ]),
      formulaBlock('+\\dfrac{u_1}{u_2} = \\dfrac{N_1}{N_2} = +\\dfrac{i_2}{i_1}'),
    ]));
    g2.appendChild(el('div', { class: 'def-card' }, [
      el('h4', {}, 'Abweichungen zählen'),
      el('p', {}, 'Ist ein Pfeil anders gezeichnet, misst er einfach das Negative. Jede Abweichung ⇒ ein Vorzeichenwechsel. Spannung und Strom getrennt zählen — sie kommen aus verschiedenen Gesetzen (① bzw. ②).'),
    ]));
    container.appendChild(g2);

    // ================= 3 · Interaktiv =================
    container.appendChild(el('h2', {}, [el('span', { class: 'h2-num' }, '3 ·'), 'Selbst ausprobieren: Vorzeichen bestimmen']));
    container.appendChild(el('p', {}, 'Links der echte Kern mit Wicklungen, rechts dasselbe als Schaltbild mit Punkten. Dreh Wicklungen und Pfeile um, setz die Vorzeichen und prüfe. Achte darauf, wie der Punkt mitwandert, wenn du eine Wicklung umdrehst — die Pfeile dagegen ändern den Punkt nie.'));

    const panel = el('div', { class: 'sim-panel' });
    const topBar = el('div', { class: 'sim-toolbar' });
    const presetBtns = {
      std: el('button', { class: 'btn' }, 'Standardfall'),
      f1: el('button', { class: 'btn' }, 'Fall A: u₂ gedreht'),
      f2: el('button', { class: 'btn' }, 'Fall B: Punkt unten'),
      rnd: el('button', { class: 'btn' }, '🎲 Zufall'),
    };
    Object.values(presetBtns).forEach((b) => topBar.appendChild(b));
    topBar.appendChild(el('span', { style: 'flex:1' }));
    const fluxBtn = el('button', { class: 'btn' }, 'Φ₁, Φ₂ zeigen');
    topBar.appendChild(fluxBtn);
    panel.appendChild(topBar);

    const wrap = el('div', { class: 'two-col' });
    const leftWrap = el('div', { class: 'sim-canvas-wrap' });
    const coreCanvas = el('canvas');
    leftWrap.appendChild(coreCanvas);
    const rightWrap = el('div', { class: 'sim-canvas-wrap' });
    const schemCanvas = el('canvas');
    rightWrap.appendChild(schemCanvas);
    wrap.appendChild(leftWrap); wrap.appendChild(rightWrap);
    panel.appendChild(wrap);

    panel.appendChild(el('div', { class: 'legend' }, [
      legendItem(COLORS.fg, 'durchgezogen = Draht vor dem Kern', 'line'),
      legendItem(COLORS.mute, 'gestrichelt = Draht hinter dem Kern', 'line'),
      legendItem(COLORS.red, 'Punkt (Wickelsinn)', 'dot'),
      legendItem(COLORS.violet, 'Spannungspfeil', 'dot'),
    ]));

    // ---- Steuerung pro Spule ----
    const state = {
      wind: [-1, -1],       // +1: erste halbe Windung vorne, −1: hinten
      iInTop: [true, false],// Strompfeil am oberen Anschluss zeigt in die Spule hinein?
      vFromTop: [true, true],// Spannungspfeil zeigt von oben nach unten?
      showFlux: false,
      showWhy: false,
    };
    const ctrlGrid = el('div', { class: 'def-grid', style: 'margin-top:14px' });
    const heads = [];
    ['Primärseite · Spule 1', 'Sekundärseite · Spule 2'].forEach((name, k) => {
      const h = el('h4', {}, name);
      heads.push(h);
      const bW = el('button', { class: 'btn', style: 'margin:0 6px 6px 0' }, '⟲ Wicklung umdrehen');
      const bI = el('button', { class: 'btn', style: 'margin:0 6px 6px 0' }, `⇄ Strompfeil i${'₁₂'[k]}`);
      const bU = el('button', { class: 'btn', style: 'margin:0 6px 6px 0' }, `⇅ Spannungspfeil u${'₁₂'[k]}`);
      bW.addEventListener('click', () => { state.wind[k] *= -1; changed(); });
      bI.addEventListener('click', () => { state.iInTop[k] = !state.iInTop[k]; changed(); });
      bU.addEventListener('click', () => { state.vFromTop[k] = !state.vFromTop[k]; changed(); });
      ctrlGrid.appendChild(el('div', { class: 'def-card' }, [h, el('div', {}, [bW, bI, bU])]));
    });

    // ---- Quiz ----
    const tex = (s) => {
      const span = el('span', { style: 'display:inline-block' });
      if (window.katex) {
        try { span.innerHTML = katex.renderToString(s, { displayMode: false, throwOnError: false }); }
        catch (e) { span.textContent = s; }
      } else span.textContent = s;
      return span;
    };
    const quiz = el('div', { class: 'formula', style: 'margin-top:16px' });
    const guess = [0, 0];
    const qBtns = [];
    [['\\dfrac{u_1}{u_2} = \\dfrac{N_1}{N_2}', 'Spannung'], ['\\dfrac{i_1}{i_2} = \\dfrac{N_2}{N_1}', 'Strom']].forEach(([f], q) => {
      const row = el('div', { class: 'formula-line', style: 'display:flex;align-items:center;gap:8px;font-size:17px;margin:4px 0' });
      const b = el('button', { class: 'btn', style: 'min-width:40px;padding:4px 0;font-family:var(--mono);font-size:16px' }, '?');
      b.addEventListener('click', () => { guess[q] = guess[q] === 1 ? -1 : 1; checked = false; paintQuiz(); });
      qBtns.push(b);
      row.appendChild(b); row.appendChild(tex(f));
      quiz.appendChild(row);
    });
    panel.appendChild(quiz);

    const qBar = el('div', { class: 'sim-toolbar', style: 'margin:12px 0 0' });
    const checkBtn = el('button', { class: 'btn primary' }, '✓ Prüfen');
    const whyBtn = el('button', { class: 'btn' }, 'Erklärung zeigen');
    const waveBtn = el('button', { class: 'btn' }, '📈 Zeitverläufe');
    const status = el('span', { class: 'note', style: 'margin:0 0 0 6px' }, '');
    [checkBtn, whyBtn, waveBtn, status].forEach((b) => qBar.appendChild(b));
    panel.appendChild(qBar);

    const whyBox = el('div', { class: 'table-wrap', style: 'display:none;margin-top:12px' });
    panel.appendChild(whyBox);

    const waveWrap = el('div', { class: 'sim-canvas-wrap', style: 'display:none;margin-top:12px' });
    const waveCanvas = el('canvas');
    waveWrap.appendChild(waveCanvas);
    panel.appendChild(waveWrap);
    const waveNote = el('p', { class: 'note', style: 'display:none;margin:8px 0 0' },
      'So würde ein Messgerät die Grössen anzeigen, wenn es genau wie die Pfeile angeschlossen ist (Φ(t) sinusförmig, ohmsche Last, N₁ : N₂ = 2 : 1). Gleichphasig ⇒ „+“, gegenphasig ⇒ „−“.');
    panel.appendChild(waveNote);

    panel.appendChild(ctrlGrid);
    container.appendChild(panel);

    // ---------- Physik ----------
    const LIMB = ['left', 'right'];
    // Umlaufsinn (+1 = Gegenuhrzeigersinn) für einen Strom, der OBEN in Spule k hineinfliesst.
    // Rechte Hand: Strom vorne nach rechts → Fluss im Schenkel nach oben.
    function circTop(k, wind = state.wind[k]) {
      const startLeft = LIMB[k] === 'left';
      const firstFront = wind === 1;
      const frontRight = firstFront ? startLeft : !startLeft;
      const fluxUp = frontRight ? 1 : -1;
      return fluxUp * (LIMB[k] === 'right' ? 1 : -1);
    }
    const dotTop = (k) => circTop(k) === 1;
    // Umlaufsinn des Flusses, den der Strom in Pfeilrichtung erzeugt
    const circArrow = (k) => circTop(k) * (state.iInTop[k] ? 1 : -1);

    function analysis() {
      const d = [dotTop(0), dotTop(1)];
      const uOk = [state.vFromTop[0] === d[0], state.vFromTop[1] === d[1]];
      const iOk = [state.iInTop[0] === d[0], state.iInTop[1] !== d[1]];
      const nU = uOk.filter((x) => !x).length, nI = iOk.filter((x) => !x).length;
      return { d, uOk, iOk, nU, nI, sU: nU % 2 ? -1 : 1, sI: nI % 2 ? -1 : 1 };
    }

    let checked = false;
    function paintQuiz() {
      const a = analysis();
      const sol = [a.sU, a.sI];
      let right = 0;
      qBtns.forEach((b, q) => {
        b.textContent = guess[q] === 0 ? '?' : guess[q] === 1 ? '+' : '−';
        b.style.borderColor = ''; b.style.background = '';
        if (checked && guess[q] !== 0) {
          const ok = guess[q] === sol[q];
          if (ok) right++;
          b.style.borderColor = ok ? 'var(--ok)' : 'var(--bad)';
          b.style.background = ok ? 'rgba(111,221,139,0.18)' : 'rgba(255,107,107,0.18)';
        }
      });
      if (!checked) status.textContent = 'Kästchen anklicken: + oder −';
      else if (right === 2) status.textContent = '✓ Beide richtig!';
      else status.textContent = `${right} / 2 richtig — schau dir die Erklärung an`;
      paintWhy();
    }

    function paintWhy() {
      whyBox.style.display = state.showWhy ? '' : 'none';
      whyBtn.className = 'btn' + (state.showWhy ? ' active' : '');
      if (!state.showWhy) return;
      const a = analysis();
      const where = (top) => (top ? 'oben' : 'unten');
      const rows = [
        ['u₁', 'zeigt vom Punkt weg', a.uOk[0] ? 'vom Punkt weg' : 'zum Punkt hin', a.uOk[0]],
        ['u₂', 'zeigt vom Punkt weg', a.uOk[1] ? 'vom Punkt weg' : 'zum Punkt hin', a.uOk[1]],
        ['i₁', 'fliesst in den Punkt', a.iOk[0] ? 'in den Punkt' : 'aus dem Punkt', a.iOk[0]],
        ['i₂', 'fliesst aus dem Punkt', a.iOk[1] ? 'aus dem Punkt' : 'in den Punkt', a.iOk[1]],
      ];
      const sgn = (s) => (s === 1 ? '+' : '−');
      whyBox.innerHTML = '';
      whyBox.appendChild(el('table', {}, [
        el('thead', {}, el('tr', {}, [el('th', {}, 'Pfeil'), el('th', {}, 'Standard'), el('th', {}, 'gezeichnet'), el('th', {}, 'Abweichung?')])),
        el('tbody', {}, rows.map(([n, s, g, ok]) => el('tr', {}, [
          el('td', {}, [el('strong', {}, n)]), el('td', {}, s), el('td', {}, g),
          el('td', { style: `color:var(${ok ? '--ok' : '--bad'});font-weight:600` }, ok ? '✓ nein' : '✗ ja'),
        ]))),
      ]));
      whyBox.appendChild(el('p', { class: 'note', style: 'margin:10px 0 0' },
        `Punkte: Spule 1 ${where(a.d[0])}, Spule 2 ${where(a.d[1])}.  ` +
        `Spannung: ${a.nU} Abweichung${a.nU === 1 ? '' : 'en'} ⇒ ${sgn(a.sU)} u₁/u₂ = N₁/N₂.  ` +
        `Strom: ${a.nI} Abweichung${a.nI === 1 ? '' : 'en'} ⇒ ${sgn(a.sI)} i₁/i₂ = N₂/N₁.`));
    }

    function changed() {
      guess[0] = guess[1] = 0;
      checked = false;
      paintQuiz();
    }

    checkBtn.addEventListener('click', () => {
      checked = true;
      state.showWhy = true;
      paintQuiz();
    });
    whyBtn.addEventListener('click', () => { state.showWhy = !state.showWhy; paintWhy(); });
    let showWave = false;
    waveBtn.addEventListener('click', () => {
      showWave = !showWave;
      waveWrap.style.display = showWave ? '' : 'none';
      waveNote.style.display = showWave ? '' : 'none';
      waveBtn.className = 'btn' + (showWave ? ' active' : '');
    });
    fluxBtn.addEventListener('click', () => {
      state.showFlux = !state.showFlux;
      fluxBtn.className = 'btn' + (state.showFlux ? ' active' : '');
    });

    function windFor(k, wantTop) {
      return circTop(k, 1) === 1 ? (wantTop ? 1 : -1) : (wantTop ? -1 : 1);
    }
    function preset(dTop0, dTop1, iInTop, vFromTop) {
      state.wind = [windFor(0, dTop0), windFor(1, dTop1)];
      state.iInTop = iInTop.slice();
      state.vFromTop = vFromTop.slice();
      changed();
    }
    presetBtns.std.addEventListener('click', () => preset(true, true, [true, false], [true, true]));
    presetBtns.f1.addEventListener('click', () => preset(true, true, [true, false], [true, false]));
    presetBtns.f2.addEventListener('click', () => preset(true, false, [true, false], [true, true]));
    presetBtns.rnd.addEventListener('click', () => {
      const before = JSON.stringify([state.wind, state.iInTop, state.vFromTop]);
      let now;
      do {
        for (let k = 0; k < 2; k++) {
          state.wind[k] = Math.random() < 0.5 ? 1 : -1;
          state.iInTop[k] = Math.random() < 0.5;
          state.vFromTop[k] = Math.random() < 0.5;
        }
        now = JSON.stringify([state.wind, state.iInTop, state.vFromTop]);
      } while (now === before);
      changed();
    });

    // ---------- Zeichnung: 3D-Kern ----------
    const bgColor = () => getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#0d1117';
    const H = 360;
    const ctxC = setupCanvas(coreCanvas, H);
    const ctxS = setupCanvas(schemCanvas, H);
    const DW = 450, DH = 320;
    const CORE = { x0: 130, x1: 320, y0: 34, y1: 284, t: 44 };
    const COILS = [{ limb: 'left', yTop: 110 }, { limb: 'right', yTop: 130 }];
    const PITCH = 16;
    let animT = 0, last = performance.now(), simT = 0, history = [];

    function fit(ctx, canvas, dw, dh) {
      const W = cssW(canvas);
      // Höhe an die Breite anpassen (auf dem Handy sonst viel leerer Platz)
      const Hc = Math.round(Math.min(H, Math.max(220, (W * dh) / dw)));
      if (parseFloat(canvas.style.height) !== Hc) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.height = Math.round(Hc * dpr);
        canvas.style.height = Hc + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      ctx.clearRect(0, 0, W, Hc);
      const s = Math.min(W / dw, Hc / dh);
      ctx.save();
      ctx.translate((W - dw * s) / 2, (Hc - dh * s) / 2);
      ctx.scale(s, s);
    }

    const limbX = (limb) => (limb === 'left' ? [CORE.x0, CORE.x0 + CORE.t] : [CORE.x1 - CORE.t, CORE.x1]);

    function drawCore(c) {
      const { x0, x1, y0, y1, t } = CORE;
      c.fillStyle = COLORS.line;
      rrect(c, x0, y0, x1 - x0, y1 - y0, 6); c.fill();
      c.strokeStyle = COLORS.mute; c.lineWidth = 1;
      rrect(c, x0, y0, x1 - x0, y1 - y0, 6); c.stroke();
      c.fillStyle = bgColor();
      c.fillRect(x0 + t, y0 + t, x1 - x0 - 2 * t, y1 - y0 - 2 * t);
      c.strokeRect(x0 + t, y0 + t, x1 - x0 - 2 * t, y1 - y0 - 2 * t);
      c.fillStyle = COLORS.mute; c.font = '11px ui-monospace, monospace'; c.textAlign = 'center';
      c.fillText('Eisenkern (μr → ∞)', (x0 + x1) / 2, y1 + 18);
    }

    function drawFlux(c, k, color) {
      const dir = circArrow(k);
      const inset = [-8, 8][k];
      const m = CORE.t / 2 + inset;
      const xa = CORE.x0 + m, xb = CORE.x1 - m, ya = CORE.y0 + m, yb = CORE.y1 - m;
      c.save();
      c.strokeStyle = color; c.lineWidth = 2.5; c.globalAlpha = 0.9;
      c.setLineDash([10, 8]);
      c.lineDashOffset = (dir === -1 ? -1 : 1) * animT * 28;
      rrect(c, xa, ya, xb - xa, yb - ya, 10);
      c.stroke();
      c.setLineDash([]);
      const cw = dir === -1;
      const off = (k - 0.5) * 30;
      [[(xa + xb) / 2 + off, ya, cw ? 0 : Math.PI], [xb, (ya + yb) / 2 + off, cw ? Math.PI / 2 : -Math.PI / 2],
       [(xa + xb) / 2 + off, yb, cw ? Math.PI : 0], [xa, (ya + yb) / 2 + off, cw ? -Math.PI / 2 : Math.PI / 2]]
        .forEach(([x, y, ang]) => drawArrowHead(c, x + Math.cos(ang) * 6, y + Math.sin(ang) * 6, ang, 10, color));
      c.fillStyle = color; c.font = 'bold 13px ui-monospace, monospace'; c.textAlign = 'left';
      c.fillText('Φ' + '₁₂'[k] + (cw ? ' ↻' : ' ↺'), CORE.x0 + CORE.t + 12 + k * 62, CORE.y0 + CORE.t + 22);
      c.restore();
    }

    function drawDot(c, x, y) {
      c.fillStyle = COLORS.red;
      c.beginPath(); c.arc(x, y, 5, 0, Math.PI * 2); c.fill();
    }

    function drawCoil3D(c, k, color, a) {
      const coil = COILS[k];
      const [xl, xr] = limbX(coil.limb);
      const startLeft = coil.limb === 'left';
      const ov = 4;
      const sx = (left) => (left ? xl - ov : xr + ov);
      let y = coil.yTop, onLeft = startLeft;
      const segs = [];
      for (let h = 0; h < 2 * N[k]; h++) {
        const front = (h % 2 === 0) === (state.wind[k] === 1);
        segs.push({ x1: sx(onLeft), y1: y, x2: sx(!onLeft), y2: y + PITCH / 2, front });
        y += PITCH / 2; onLeft = !onLeft;
      }
      const yBot = y;
      c.save();
      c.setLineDash([4, 4]); c.globalAlpha = 0.55; c.strokeStyle = color; c.lineWidth = 1.8;
      segs.filter((s) => !s.front).forEach((s) => { c.beginPath(); c.moveTo(s.x1, s.y1); c.lineTo(s.x2, s.y2); c.stroke(); });
      c.restore();
      c.save();
      c.strokeStyle = color; c.lineWidth = 3;
      segs.filter((s) => s.front).forEach((s) => { c.beginPath(); c.moveTo(s.x1, s.y1); c.lineTo(s.x2, s.y2); c.stroke(); });
      c.restore();
      c.fillStyle = color;
      segs.forEach((s) => { c.beginPath(); c.arc(s.x2, s.y2, 2, 0, Math.PI * 2); c.fill(); });

      // Anschlüsse
      const tx = startLeft ? 48 : DW - 48;
      const edge = sx(startLeft);
      drawWire(c, tx, coil.yTop, edge, coil.yTop, COLORS.fg, 2);
      drawWire(c, tx, yBot, edge, yBot, COLORS.fg, 2);
      [coil.yTop, yBot].forEach((ty) => {
        c.fillStyle = bgColor(); c.strokeStyle = COLORS.fg; c.lineWidth = 2;
        c.beginPath(); c.arc(tx, ty, 5, 0, Math.PI * 2); c.fill(); c.stroke();
      });
      // Punkt an der Klemme
      const dy = a.d[k] ? coil.yTop : yBot;
      drawDot(c, tx + (startLeft ? 14 : -14), dy + (a.d[k] ? -9 : 9));

      // Strompfeil oben
      const mid = (tx + edge) / 2 + (startLeft ? 6 : -6);
      const pointsRight = startLeft ? state.iInTop[k] : !state.iInTop[k];
      drawArrow(c, pointsRight ? mid - 14 : mid + 14, coil.yTop, pointsRight ? mid + 14 : mid - 14, coil.yTop, color, 2.5);
      c.fillStyle = color; c.font = 'bold 13px ui-monospace, monospace'; c.textAlign = 'center';
      c.fillText('i' + '₁₂'[k], mid, coil.yTop - 9);

      // Spannungspfeil
      const ux = startLeft ? tx - 20 : tx + 20;
      const down = state.vFromTop[k];
      drawArrow(c, ux, down ? coil.yTop + 8 : yBot - 8, ux, down ? yBot - 8 : coil.yTop + 8, COLORS.violet, 2);
      c.fillStyle = COLORS.violet; c.textAlign = startLeft ? 'right' : 'left';
      c.fillText('u' + '₁₂'[k], startLeft ? ux - 7 : ux + 7, (coil.yTop + yBot) / 2 + 5);

      c.fillStyle = COLORS.dim; c.font = '12px ui-monospace, monospace';
      c.textAlign = startLeft ? 'left' : 'right';
      c.fillText('N' + '₁₂'[k], startLeft ? xr + 10 : xl - 10, (coil.yTop + yBot) / 2 + 4);
    }

    // ---------- Zeichnung: Schaltbild ----------
    const SW = 420, SH = 330;
    function drawSchematic(c, a) {
      const cols = [COLORS.amber, COLORS.cyan];
      const yT = 70, yB = 260, cT = 115, cB = 215;
      const X = [{ coil: 165, term: 55, uX: 30, side: -1 }, { coil: 255, term: 365, uX: 390, side: 1 }];
      const markWrong = state.showWhy;

      for (let k = 0; k < 2; k++) {
        const g = X[k], col = cols[k];
        // Drähte
        drawWire(c, g.term, yT, g.coil, yT, COLORS.fg, 2);
        drawWire(c, g.coil, yT, g.coil, cT, COLORS.fg, 2);
        drawWire(c, g.coil, cB, g.coil, yB, COLORS.fg, 2);
        drawWire(c, g.coil, yB, g.term, yB, COLORS.fg, 2);
        // Spule (Halbkreise Richtung Kern)
        const n = 4, r = (cB - cT) / (2 * n);
        c.strokeStyle = col; c.lineWidth = 2.5;
        c.beginPath();
        for (let j = 0; j < n; j++) {
          const cy = cT + r + 2 * r * j;
          if (k === 0) c.arc(g.coil, cy, r, -Math.PI / 2, Math.PI / 2, false);
          else c.arc(g.coil, cy, r, -Math.PI / 2, Math.PI / 2, true);
        }
        c.stroke();
        // Klemmen
        [yT, yB].forEach((ty) => {
          c.fillStyle = bgColor(); c.strokeStyle = COLORS.fg; c.lineWidth = 2;
          c.beginPath(); c.arc(g.term, ty, 5, 0, Math.PI * 2); c.fill(); c.stroke();
        });
        // Punkt
        const dx = k === 0 ? -14 : 14;
        drawDot(c, g.coil + dx, a.d[k] ? cT + 6 : cB - 6);
        // Strompfeil
        const wrongI = markWrong && !a.iOk[k];
        const icol = wrongI ? COLORS.red : col;
        const midI = (g.term + g.coil) / 2;
        const towardCoil = state.iInTop[k];
        const right = k === 0 ? towardCoil : !towardCoil;
        drawArrow(c, right ? midI - 16 : midI + 16, yT, right ? midI + 16 : midI - 16, yT, icol, 2.5);
        c.fillStyle = icol; c.font = 'bold 14px ui-monospace, monospace'; c.textAlign = 'center';
        c.fillText('i' + '₁₂'[k] + (wrongI ? ' ✗' : ''), midI, yT - 10);
        // Spannungspfeil
        const wrongU = markWrong && !a.uOk[k];
        const ucol = wrongU ? COLORS.red : COLORS.violet;
        const down = state.vFromTop[k];
        drawArrow(c, g.uX, down ? yT + 12 : yB - 12, g.uX, down ? yB - 12 : yT + 12, ucol, 2);
        c.fillStyle = ucol; c.textAlign = k === 0 ? 'left' : 'right';
        c.fillText('u' + '₁₂'[k] + (wrongU ? ' ✗' : ''), g.uX + (k === 0 ? 8 : -8), (yT + yB) / 2 + 5);
        c.fillStyle = COLORS.dim; c.font = '12px ui-monospace, monospace'; c.textAlign = 'center';
        c.fillText('N' + '₁₂'[k], g.coil + (k === 0 ? -26 : 26), (cT + cB) / 2 + 4);
      }
      // Kernlinien
      c.strokeStyle = COLORS.fg; c.lineWidth = 2;
      [204, 216].forEach((x) => { c.beginPath(); c.moveTo(x, cT - 8); c.lineTo(x, cB + 8); c.stroke(); });
      c.fillStyle = COLORS.mute; c.font = '11px ui-monospace, monospace'; c.textAlign = 'center';
      c.fillText('Schaltbild', 210, 300);
    }

    // ---------- Zeitverläufe ----------
    const ctxW = setupCanvas(waveCanvas, 220);
    function drawWaves(a) {
      const W = cssW(waveCanvas), Hc = 220;
      ctxW.clearRect(0, 0, W, Hc);
      const gap = 16, w2 = (W - gap) / 2;
      const s = (key, sign, amp) => history.map((p) => ({ t: p.t, v: sign * amp * p[key] }));
      // gemessen mit den gezeichneten Pfeilen
      const su = [a.uOk[0] ? 1 : -1, a.uOk[1] ? 1 : -1];
      const si = [a.iOk[0] ? 1 : -1, a.iOk[1] ? 1 : -1];
      drawStripChart(ctxW, 0, 22, w2, Hc - 30, [
        { data: s('u', su[0], 1), color: COLORS.amber },
        { data: s('u', su[1], N[1] / N[0]), color: COLORS.cyan },
      ], { vMin: -1.1, vMax: 1.1 });
      drawStripChart(ctxW, w2 + gap, 22, w2, Hc - 30, [
        { data: s('i', si[0], N[1] / N[0]), color: COLORS.amber },
        { data: s('i', si[1], 1), color: COLORS.cyan },
      ], { vMin: -1.1, vMax: 1.1 });
      ctxW.font = 'bold 12px ui-monospace, monospace'; ctxW.textAlign = 'left';
      ctxW.fillStyle = COLORS.amber; ctxW.fillText('u₁', 2, 14);
      ctxW.fillStyle = COLORS.cyan; ctxW.fillText('u₂', 30, 14);
      ctxW.fillStyle = COLORS.dim; ctxW.fillText(a.sU === 1 ? 'gleichphasig → +' : 'gegenphasig → −', 60, 14);
      ctxW.fillStyle = COLORS.amber; ctxW.fillText('i₁', w2 + gap + 2, 14);
      ctxW.fillStyle = COLORS.cyan; ctxW.fillText('i₂', w2 + gap + 30, 14);
      ctxW.fillStyle = COLORS.dim; ctxW.fillText(a.sI === 1 ? 'gleichphasig → +' : 'gegenphasig → −', w2 + gap + 60, 14);
    }

    function frame(now) {
      if (!coreCanvas.isConnected) return;
      const dt = Math.min(0.04, (now - last) / 1000); last = now;
      animT += dt; simT += dt;
      // u_dot ∝ dΦ/dt = cos, i (ohmsche Last) gleichphasig mit u
      history.push({ t: simT, u: Math.cos(2.2 * simT), i: Math.cos(2.2 * simT) });
      history = history.filter((p) => p.t > simT - 6);
      const a = analysis();
      const cols = [COLORS.amber, COLORS.cyan];

      fit(ctxC, coreCanvas, DW, DH);
      drawCore(ctxC);
      if (state.showFlux) for (let k = 0; k < 2; k++) drawFlux(ctxC, k, cols[k]);
      for (let k = 0; k < 2; k++) drawCoil3D(ctxC, k, cols[k], a);
      ctxC.restore();

      fit(ctxS, schemCanvas, SW, SH);
      drawSchematic(ctxS, a);
      ctxS.restore();

      if (showWave) drawWaves(a);
      heads.forEach((h, k) => { h.style.color = cols[k]; });
      requestAnimationFrame(frame);
    }

    paintQuiz();
    requestAnimationFrame(frame);

    container.appendChild(el('div', { class: 'callout ok' }, [
      el('span', { class: 'callout-label' }, 'Zum Ausprobieren'),
      el('ul', {}, [
        el('li', {}, ['Dreh die ', el('strong', {}, 'Wicklung'), ' von Spule 2 um: Der Punkt wandert — und welche Vorzeichen kippen? (Beide! Die Wicklung betrifft Spannung und Strom.)']),
        el('li', {}, ['Dreh nur den ', el('strong', {}, 'Spannungspfeil'), ' u₂: Nur das Spannungsverhältnis kippt, der Punkt bleibt, wo er ist.']),
        el('li', {}, ['Blende Φ₁ und Φ₂ ein: Im Standardfall laufen sie ', el('strong', {}, 'gegeneinander'), ' — genau das heisst „die Durchflutungen heben sich auf“.']),
        el('li', {}, ['Fall A und Fall B sind die beiden Beispiele aus den Unterlagen. Bei Fall B sehen die Pfeile aus wie im Standard — nur der Punkt sitzt unten. Immer relativ zum Punkt denken!']),
      ]),
    ]));

    container.appendChild(el('div', { class: 'callout bad' }, [
      el('span', { class: 'callout-label' }, 'Prüfungsfallen'),
      el('ul', {}, [
        el('li', {}, ['Spannung und Strom nicht getrennt zählen: ', el('strong', {}, '+u₁/u₂ und −i₁/i₂'), ' in derselben Aufgabe ist völlig normal.']),
        el('li', {}, ['„oben/unten“ statt „Punkt/kein Punkt“ denken — wenn der Punkt unten sitzt, ist ein Pfeil nach unten ', el('strong', {}, 'zum Punkt hin'), '.']),
        el('li', {}, ['Beim Wickelsinn aus der 3D-Skizze nur den Draht ', el('strong', {}, 'vor'), ' dem Kern für die rechte Hand verwenden.']),
        el('li', {}, ['Bei der Widerstandstransformation R′ = ü²·R spielt das Vorzeichen keine Rolle — es fällt durchs Quadrat weg.']),
      ]),
    ]));

    renderPunktregelHS24(container);
  },
});

// Prüfungsaufgabe HS 24, 6(c): Widerstandstransformation (Multiple Choice).
// Wird am Ende von render() oben über renderPunktregelHS24(container) eingehängt.
function renderPunktregelHS24(container) {
  const bgColor = () => getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#0d1117';

  // Schrittweises Aufdecken eines Lösungswegs (wie bei FS 25)
  function stepReveal(tag, steps, resultText) {
    const box = el('div', { class: 'example-box' });
    box.appendChild(el('span', { class: 'example-tag' }, tag));
    const ol = el('ol', { class: 'example-steps' });
    const lis = steps.map((s) => {
      const li = el('li', { style: 'display:none' }, s.text);
      if (s.formula) li.appendChild(formulaBlock(s.formula));
      ol.appendChild(li);
      return li;
    });
    box.appendChild(ol);
    const result = el('div', { class: 'example-result', style: 'display:none' }, [
      el('span', { class: 'er-label' }, 'Ergebnis'),
      el('span', { class: 'er-value' }, resultText),
    ]);
    box.appendChild(result);
    const bar = el('div', { class: 'sim-toolbar', style: 'margin:12px 0 0' });
    const prev = el('button', { class: 'btn' }, '◂ zurück');
    const next = el('button', { class: 'btn primary' }, 'Nächster Schritt ▸');
    const all = el('button', { class: 'btn' }, 'Alle zeigen');
    const info = el('span', { class: 'note', style: 'margin:0 0 0 6px' }, '');
    [prev, next, all, info].forEach((b) => bar.appendChild(b));
    box.appendChild(bar);
    let shown = 0;
    const upd = () => {
      lis.forEach((li, i) => { li.style.display = i < shown ? '' : 'none'; });
      result.style.display = shown >= steps.length ? '' : 'none';
      info.textContent = `Schritt ${shown} / ${steps.length}`;
    };
    prev.addEventListener('click', () => { shown = Math.max(0, shown - 1); upd(); });
    next.addEventListener('click', () => { shown = Math.min(steps.length, shown + 1); upd(); });
    all.addEventListener('click', () => { shown = steps.length; upd(); });
    upd();
    return box;
  }

  function taskBox(tag, text, question) {
    const t = el('div', { class: 'example-box' });
    t.appendChild(el('span', { class: 'example-tag' }, tag));
    t.appendChild(el('p', { style: 'margin:4px 0 10px;color:var(--fg-dim);font-size:14px' }, text));
    t.appendChild(el('p', { style: 'margin:0;font-size:14.5px' }, [el('strong', {}, 'Fragen: '), question]));
    return t;
  }

  // =====================================================================
  // 4 · Prüfung HS 24, 6(c)
  // =====================================================================
  container.appendChild(el('h2', {}, [el('span', { class: 'h2-num' }, '4 ·'), 'Prüfungsaufgabe HS 24: Was „sieht“ die Quelle?']));
  container.appendChild(taskBox('Prüfung HS 24 (04.02.2025) · Aufgabe 6(c) · 1 P',
    'Eine Stromquelle liefert i₀ in einen Widerstand R, der in Serie zur Primärseite eines idealen Transformators liegt (N₁ = 6000, N₂ = 3000). Auf der Sekundärseite hängt ein zweiter, identischer Widerstand R.',
    'Wie gross ist die Spannung u₀ in Abhängigkeit von i₀ und R?'));

  const p6 = el('div', { class: 'sim-panel' });
  const w6 = el('div', { class: 'sim-canvas-wrap' });
  const cv6 = el('canvas');
  w6.appendChild(cv6);
  p6.appendChild(w6);
  const opts = [
    ['R·i₀', 'Dann wäre der Trafo samt R₂ gar nicht da — die Primärseite „sieht“ aber einen Widerstand.'],
    ['3R·i₀', 'Fast: Du hast ü = 2 statt ü² = 4 genommen. Spannung UND Strom werden um ü skaliert ⇒ R mit ü².'],
    ['5/4·R·i₀', 'Übersetzung verkehrt herum: ü = N₁/N₂ = 2, nicht 1/2. Primärseite hat mehr Windungen ⇒ R′ wird grösser.'],
    ['3/2·R·i₀', 'Zwei Fehler auf einmal: ü verkehrt herum (1/2) und nicht quadriert.'],
    ['4R·i₀', 'R′ = ü²R = 4R stimmt — aber der Serienwiderstand R vor dem Trafo fehlt noch (Maschenregel).'],
    ['5R·i₀', 'Richtig! R′ = ü²·R = 4R in Serie mit R ⇒ u₀ = 5R·i₀.'],
  ];
  const optGrid = el('div', { class: 'sim-toolbar', style: 'margin:12px 0 0' });
  const fb = el('div', { class: 'callout', style: 'display:none;margin-top:12px' });
  opts.forEach(([label, msg], i) => {
    const b = el('button', { class: 'btn', style: 'font-family:var(--mono)' }, 'u₀ = ' + label);
    b.addEventListener('click', () => {
      const ok = i === 5;
      optGrid.querySelectorAll('button').forEach((x) => { x.style.borderColor = ''; x.style.background = ''; });
      b.style.borderColor = ok ? 'var(--ok)' : 'var(--bad)';
      b.style.background = ok ? 'rgba(111,221,139,0.18)' : 'rgba(255,107,107,0.18)';
      fb.className = 'callout ' + (ok ? 'ok' : 'bad');
      fb.style.display = '';
      fb.innerHTML = '';
      fb.appendChild(el('span', { class: 'callout-label' }, ok ? 'Richtig' : 'Nicht ganz'));
      fb.appendChild(el('p', {}, msg));
    });
    optGrid.appendChild(b);
  });
  p6.appendChild(optGrid);
  p6.appendChild(fb);
  container.appendChild(p6);

  const ctx6 = setupCanvas(cv6, 190);
  function drawCoilV(c, x, yT, yB, n, facingRight, color) {
    const r = (yB - yT) / (2 * n);
    c.strokeStyle = color; c.lineWidth = 2.5; c.beginPath();
    for (let j = 0; j < n; j++) c.arc(x, yT + r + 2 * r * j, r, -Math.PI / 2, Math.PI / 2, !facingRight);
    c.stroke();
  }
  function frame6() {
    if (!cv6.isConnected) return;
    const W = cssW(cv6), Hc = 190, DW6 = 460, DH6 = 180;
    ctx6.clearRect(0, 0, W, Hc);
    const s = Math.min(W / DW6, Hc / DH6);
    const c = ctx6;
    c.save();
    c.translate((W - DW6 * s) / 2, (Hc - DH6 * s) / 2); c.scale(s, s);
    const yT = 40, yB = 150, cT = 65, cB = 125;
    // Primärkreis
    drawWire(c, 40, yT, 70, yT, COLORS.fg);
    drawResistor(c, 115, yT, 90, COLORS.fg, 'R');
    drawWire(c, 160, yT, 200, yT, COLORS.fg);
    drawWire(c, 200, yT, 200, cT, COLORS.fg);
    drawWire(c, 200, cB, 200, yB, COLORS.fg);
    drawWire(c, 200, yB, 40, yB, COLORS.fg);
    drawCoilV(c, 200, cT, cB, 4, true, COLORS.amber);
    [yT, yB].forEach((y) => { c.fillStyle = bgColor(); c.strokeStyle = COLORS.fg; c.lineWidth = 2; c.beginPath(); c.arc(40, y, 5, 0, Math.PI * 2); c.fill(); c.stroke(); });
    drawArrow(c, 48, yT, 72, yT, COLORS.amber, 2.2);
    c.fillStyle = COLORS.amber; c.font = 'bold 13px ui-monospace, monospace'; c.textAlign = 'center';
    c.fillText('i₀', 58, yT - 9);
    drawArrow(c, 22, yT + 10, 22, yB - 10, COLORS.violet, 2);
    c.fillStyle = COLORS.violet; c.textAlign = 'right'; c.fillText('u₀', 16, (yT + yB) / 2 + 5);
    // Kern
    c.strokeStyle = COLORS.fg; c.lineWidth = 2;
    [226, 236].forEach((x) => { c.beginPath(); c.moveTo(x, cT - 6); c.lineTo(x, cB + 6); c.stroke(); });
    // Sekundär
    drawCoilV(c, 262, cT, cB, 2, false, COLORS.cyan);
    drawWire(c, 262, yT, 262, cT, COLORS.fg); drawWire(c, 262, cB, 262, yB, COLORS.fg);
    drawWire(c, 262, yT, 380, yT, COLORS.fg); drawWire(c, 262, yB, 380, yB, COLORS.fg);
    drawWire(c, 380, yT, 380, 60, COLORS.fg); drawWire(c, 380, 130, 380, yB, COLORS.fg);
    drawResistorRot(c, 380, 95, 70, Math.PI / 2, COLORS.fg);
    c.fillStyle = COLORS.dim; c.font = '12px ui-monospace, monospace'; c.textAlign = 'left';
    c.fillText('R', 396, 99);
    c.textAlign = 'center';
    c.textAlign = 'right'; c.fillStyle = COLORS.amber; c.fillText('N₁ = 6000', 214, 172);
    c.textAlign = 'left'; c.fillStyle = COLORS.cyan; c.fillText('N₂ = 3000', 250, 172);
    // gestrichelte Box: Trafo + R₂ = R′
    c.strokeStyle = COLORS.mute; c.setLineDash([5, 5]); c.lineWidth = 1.2;
    rrect(c, 180, 20, 240, 140, 8); c.stroke(); c.setLineDash([]);
    c.fillStyle = COLORS.mute; c.font = '11px ui-monospace, monospace'; c.textAlign = 'center';
    c.fillText('R′ = ?', 300, 14);
    c.restore();
    requestAnimationFrame(frame6);
  }
  requestAnimationFrame(frame6);

  container.appendChild(stepReveal('Lösungsweg HS 24 6(c)', [
    { text: 'Trick: Trafo + Lastwiderstand durch einen Ersatzwiderstand R′ ersetzen — was „spürt“ die Primärseite?',
      formula: "R' = \\dfrac{u_p}{i_p} = \\dfrac{\\ddot u\\, u_s}{i_s/\\ddot u} = \\ddot u^2\\,\\dfrac{u_s}{i_s} = \\ddot u^2 R" },
    { text: 'Übersetzungsverhältnis (Primär hat mehr Windungen ⇒ R′ wird grösser):',
      formula: "\\ddot u = \\dfrac{N_1}{N_2} = \\dfrac{6000}{3000} = 2 \\;\\Rightarrow\\; R' = 4R" },
    { text: 'Maschenregel primär: R und R′ liegen in Serie, durch beide fliesst i₀:',
      formula: "u_0 = R\\,i_0 + R'\\,i_0 = 5R\\,i_0" },
    { text: 'Punkte/Vorzeichen spielen hier keine Rolle: ü geht quadratisch ein.' },
  ], 'u₀ = 5R·i₀'));
}
