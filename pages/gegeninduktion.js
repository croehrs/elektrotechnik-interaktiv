window.PAGES = window.PAGES || [];
window.PAGES.push({
  id: 'gegeninduktion',
  category: 'Induktion',
  order: 5.5,
  num: '3.2',
  week: 'Woche 9',
  formelsammlung: 'Kap. 5, S. 12 (gekoppelte Spulen)',
  navTitle: 'Gegeninduktivität',
  title: 'Gegeninduktivität: Wer spürt wessen Fluss — und mit welchem Vorzeichen?',
  subtitle: 'Mehrere Spulen auf einem Eisenkern teilen sich denselben Fluss. Jede Spule spürt deshalb nicht nur ihren eigenen Strom, sondern auch den der anderen — die ganze Kunst liegt im Vorzeichen.',
  teaser: 'Drei Spulen auf einem Kern: Wicklung und Strom umdrehen, Flüsse einblenden, Vorzeichen selbst setzen und prüfen.',

  render(container) {
    // Physik / Konventionen (siehe auch Abschnitt 2 auf der Seite):
    //   d_k = +1  → Strompfeil zeigt am oberen Anschluss in die Spule hinein
    //   Spannungspfeil u_k zeigt immer vom oberen zum unteren Anschluss (fest)
    //   a_k = d_k → +1 = Verbraucherpfeil, −1 = Erzeugerpfeil
    //   c_k = Umlaufsinn des Flusses im Kern für i_k > 0 (+1 = Gegenuhrzeigersinn)
    //   Vorzeichen in Zeile j:  Diagonale a_j,  Kreuzterm (j,k): a_j · c_j · c_k

    container.appendChild(el('div', { class: 'callout warn' }, [
      el('span', { class: 'callout-label' }, 'Warum das verwirrt'),
      el('p', {}, 'Physikalisch passiert nichts Neues: Es ist immer dasselbe Induktionsgesetz u = dΨ/dt. Der Eisenkern führt aber den Fluss jeder Spule durch alle anderen Spulen. Die Gleichungen schreiben sich deshalb fast von selbst — die Punkte in der Prüfung gibt es für die Vorzeichen. Und die hängen an zwei Dingen, die man aus der Skizze ablesen muss: wie herum die Spule gewickelt ist und wie Strom- und Spannungspfeil eingezeichnet sind.'),
    ]));

    container.appendChild(el('h2', {}, [el('span', { class: 'h2-num' }, '1 ·'), 'Vorzeichen selbst bestimmen']));
    container.appendChild(el('p', {}, 'Klicke die Kästchen in den Gleichungen durch (? → + → −) und prüfe dann. Mit den Knöpfen unter den Gleichungen kannst du jede Spule umwickeln oder ihren Strompfeil umdrehen — der Spannungspfeil bleibt dabei immer gleich. Kommst du nicht weiter, blende die Flüsse einzeln ein.'));

    const panel = el('div', { class: 'sim-panel' });

    const canvasWrap = el('div', { class: 'sim-canvas-wrap' });
    const canvas = el('canvas');
    canvasWrap.appendChild(canvas);
    panel.appendChild(canvasWrap);

    panel.appendChild(el('div', { class: 'legend' }, [
      legendItem(COLORS.fg, 'durchgezogen = Draht vor dem Kern', 'line'),
      legendItem(COLORS.mute, 'gestrichelt = Draht hinter dem Kern', 'line'),
      legendItem(COLORS.violet, 'Pfeil am Spannungs-Anschluss: u (fest)', 'dot'),
    ]));

    // ---------- Gleichungen mit Vorzeichen-Kästchen ----------
    const eqBox = el('div', { class: 'formula', style: 'margin-top:16px' });
    panel.appendChild(eqBox);

    const tex = (s) => {
      const span = el('span', { style: 'display:inline-block' });
      if (window.katex) {
        try { span.innerHTML = katex.renderToString(s, { displayMode: false, throwOnError: false }); }
        catch (e) { span.textContent = s; }
      } else span.textContent = s;
      return span;
    };

    const guesses = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];     // 0 = ?, +1, −1
    const boxes = [[], [], []];
    let checked = false;

    for (let j = 0; j < 3; j++) {
      const row = el('div', {
        class: 'formula-line',
        style: 'display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:16px',
      });
      row.appendChild(tex(`u_${j + 1} =`));
      for (let k = 0; k < 3; k++) {
        const b = el('button', { class: 'btn', style: 'min-width:36px;padding:4px 0;font-family:var(--mono);font-size:15px' }, '?');
        b.addEventListener('click', () => {
          guesses[j][k] = guesses[j][k] === 0 ? 1 : guesses[j][k] === 1 ? -1 : 1;
          checked = false;
          paintBoxes();
        });
        boxes[j].push(b);
        row.appendChild(b);
        row.appendChild(tex(`L_{${j + 1}${k + 1}}\\,\\dfrac{\\mathrm{d}i_${k + 1}}{\\mathrm{d}t}`));
      }
      eqBox.appendChild(row);
    }

    const toolbar = el('div', { class: 'sim-toolbar', style: 'margin:12px 0 0' });
    const checkBtn = el('button', { class: 'btn primary' }, '✓ Prüfen');
    const clearBtn = el('button', { class: 'btn' }, '↺ Kästchen leeren');
    const randomBtn = el('button', { class: 'btn' }, '🎲 Neue Anordnung');
    const solveBtn = el('button', { class: 'btn' }, 'Auflösen');
    const status = el('span', { class: 'note', style: 'margin:0 0 0 6px' }, '');
    [checkBtn, clearBtn, randomBtn, solveBtn, status].forEach((b) => toolbar.appendChild(b));
    panel.appendChild(toolbar);

    // ---------- Steuerung pro Spule ----------
    const coilColors = () => [COLORS.amber, COLORS.cyan, COLORS.green];
    const coilNames = ['Spule 1 · links oben', 'Spule 2 · links unten', 'Spule 3 · rechts'];
    const ctrlGrid = el('div', { class: 'def-grid', style: 'margin-top:16px' });
    const coilHeads = [], fluxBtns = [];
    const state = {
      wind: [1, 1, -1],   // +1: erste halbe Windung vorne, −1: erste halbe Windung hinten
      dir: [1, 1, 1],     // +1: Strompfeil zeigt oben in die Spule hinein
      showFlux: [false, false, false],
    };

    for (let k = 0; k < 3; k++) {
      const head = el('h4', {}, coilNames[k]);
      coilHeads.push(head);
      const windBtn = el('button', { class: 'btn', style: 'margin:0 6px 6px 0' }, '⟲ Wicklung umdrehen');
      const dirBtn = el('button', { class: 'btn', style: 'margin:0 6px 6px 0' }, `⇅ Strom i${'₁₂₃'[k]} umdrehen`);
      const fluxBtn = el('button', { class: 'btn', style: 'margin:0 6px 6px 0' }, `Φ${'₁₂₃'[k]} zeigen`);
      fluxBtns.push(fluxBtn);
      windBtn.addEventListener('click', () => { state.wind[k] *= -1; resetGuesses(); });
      dirBtn.addEventListener('click', () => { state.dir[k] *= -1; resetGuesses(); });
      fluxBtn.addEventListener('click', () => {
        state.showFlux[k] = !state.showFlux[k];
        fluxBtn.className = 'btn' + (state.showFlux[k] ? ' active' : '');
      });
      ctrlGrid.appendChild(el('div', { class: 'def-card' }, [head, el('div', {}, [windBtn, dirBtn, fluxBtn])]));
    }
    panel.appendChild(ctrlGrid);
    container.appendChild(panel);

    // ---------- Physik ----------
    const LIMB = ['left', 'left', 'right'];

    // Strom auf der Vorderseite nach rechts? → Fluss im Schenkel nach oben (rechte Hand).
    // Linker Schenkel nach oben = Uhrzeigersinn (−1), rechter Schenkel nach oben = Gegenuhrzeigersinn (+1).
    function circ(k) {
      const startLeft = LIMB[k] === 'left';           // Anschlussdrähte kommen von dieser Seite
      const firstFront = state.wind[k] === 1;
      // Laufrichtung des Drahts (vom oberen Anschluss aus) auf der Vorderseite:
      let frontRight = firstFront ? startLeft : !startLeft;
      if (state.dir[k] === -1) frontRight = !frontRight;
      const fluxUp = frontRight ? 1 : -1;
      return fluxUp * (LIMB[k] === 'right' ? 1 : -1);
    }
    function solution() {
      const c = [0, 1, 2].map(circ);
      const a = state.dir;
      return [0, 1, 2].map((j) => [0, 1, 2].map((k) => (j === k ? a[j] : a[j] * c[j] * c[k])));
    }

    function resetGuesses() {
      for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++) guesses[j][k] = 0;
      checked = false;
      paintBoxes();
    }

    function paintBoxes() {
      const sol = solution();
      let right = 0, filled = 0;
      for (let j = 0; j < 3; j++) {
        for (let k = 0; k < 3; k++) {
          const g = guesses[j][k];
          const b = boxes[j][k];
          b.textContent = g === 0 ? '?' : g === 1 ? '+' : '−';
          b.style.borderColor = '';
          b.style.background = '';
          if (g !== 0) filled++;
          if (checked && g !== 0) {
            const ok = g === sol[j][k];
            if (ok) right++;
            b.style.borderColor = ok ? 'var(--ok)' : 'var(--bad)';
            b.style.background = ok ? 'rgba(111,221,139,0.18)' : 'rgba(255,107,107,0.18)';
          }
        }
      }
      if (!checked) status.textContent = filled < 9 ? `${filled} / 9 Kästchen gesetzt` : 'Alle gesetzt — jetzt prüfen';
      else if (right === 9) status.textContent = '✓ Alle 9 Vorzeichen richtig!';
      else status.textContent = `${right} / 9 richtig` + (filled < 9 ? ` (${9 - filled} noch offen)` : '');
    }

    checkBtn.addEventListener('click', () => { checked = true; paintBoxes(); });
    clearBtn.addEventListener('click', resetGuesses);
    solveBtn.addEventListener('click', () => {
      const sol = solution();
      for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++) guesses[j][k] = sol[j][k];
      checked = true;
      paintBoxes();
    });
    randomBtn.addEventListener('click', () => {
      // keine Anordnung, die genau das Vorzeichenmuster der Prüfung HS 24 (c) liefert
      const examPattern = '1,-1,1,-1,1,-1,1,-1,1';
      do {
        for (let k = 0; k < 3; k++) {
          state.wind[k] = Math.random() < 0.5 ? 1 : -1;
          state.dir[k] = Math.random() < 0.75 ? 1 : -1;
        }
      } while (solution().flat().join(',') === examPattern);
      resetGuesses();
    });

    // ---------- Zeichnung ----------
    const H = 420, DW = 540, DH = 360;
    const ctx = setupCanvas(canvas, H);
    let animT = 0, last = performance.now();

    const CORE = { x0: 160, x1: 400, y0: 40, y1: 320, t: 46 };
    const COILS = [
      { limb: 'left', yTop: 96, n: 4 },
      { limb: 'left', yTop: 196, n: 4 },
      { limb: 'right', yTop: 128, n: 5 },
    ];
    const PITCH = 14;

    function limbX(limb) {
      return limb === 'left' ? [CORE.x0, CORE.x0 + CORE.t] : [CORE.x1 - CORE.t, CORE.x1];
    }

    function drawCore(c) {
      const { x0, x1, y0, y1, t } = CORE;
      c.fillStyle = COLORS.line;
      rrect(c, x0, y0, x1 - x0, y1 - y0, 6); c.fill();
      c.strokeStyle = COLORS.mute; c.lineWidth = 1;
      rrect(c, x0, y0, x1 - x0, y1 - y0, 6); c.stroke();
      // Fenster
      c.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#0d1117';
      c.fillRect(x0 + t, y0 + t, x1 - x0 - 2 * t, y1 - y0 - 2 * t);
      c.strokeRect(x0 + t, y0 + t, x1 - x0 - 2 * t, y1 - y0 - 2 * t);
      c.fillStyle = COLORS.mute; c.font = '11px ui-monospace, monospace'; c.textAlign = 'center';
      c.fillText('Eisenkern', (x0 + x1) / 2, y1 + 18);
    }

    function drawFlux(c, k, color) {
      const dir = circ(k);                          // +1 Gegenuhrzeigersinn, −1 Uhrzeigersinn
      const inset = [-11, 0, 11][k];
      const m = CORE.t / 2 + inset;
      const xa = CORE.x0 + m, xb = CORE.x1 - m, ya = CORE.y0 + m, yb = CORE.y1 - m;
      c.save();
      c.strokeStyle = color; c.lineWidth = 2.5; c.globalAlpha = 0.9;
      c.setLineDash([10, 8]);
      c.lineDashOffset = (dir === -1 ? -1 : 1) * animT * 28;
      rrect(c, xa, ya, xb - xa, yb - ya, 10);    // Pfad im Uhrzeigersinn (Bildschirm)
      c.stroke();
      c.setLineDash([]);
      const cw = dir === -1;
      const heads = [
        [(xa + xb) / 2 + (k - 1) * 22, ya, cw ? 0 : Math.PI],
        [xb, (ya + yb) / 2 + (k - 1) * 22, cw ? Math.PI / 2 : -Math.PI / 2],
        [(xa + xb) / 2 + (k - 1) * 22, yb, cw ? Math.PI : 0],
        [xa, (ya + yb) / 2 + (k - 1) * 22, cw ? -Math.PI / 2 : Math.PI / 2],
      ];
      heads.forEach(([x, y, ang]) => drawArrowHead(c, x + Math.cos(ang) * 6, y + Math.sin(ang) * 6, ang, 10, color));
      c.fillStyle = color; c.font = 'bold 13px ui-monospace, monospace'; c.textAlign = 'left';
      c.fillText('Φ' + '₁₂₃'[k] + (cw ? ' ↻' : ' ↺'), CORE.x0 + CORE.t + 10 + k * 50, CORE.y0 + CORE.t + 20);
      c.restore();
    }

    function drawCoil(c, k, color) {
      const coil = COILS[k];
      const [xl, xr] = limbX(coil.limb);
      const startLeft = coil.limb === 'left';
      const ov = 4;
      const sx = (left) => (left ? xl - ov : xr + ov);
      let y = coil.yTop, onLeft = startLeft;
      const segs = [];
      for (let h = 0; h < 2 * coil.n; h++) {
        const front = (h % 2 === 0) === (state.wind[k] === 1);
        segs.push({ x1: sx(onLeft), y1: y, x2: sx(!onLeft), y2: y + PITCH / 2, front });
        y += PITCH / 2; onLeft = !onLeft;
      }
      const yBot = y;
      // hinten zuerst (gestrichelt, blass), dann vorne (kräftig)
      c.save();
      c.setLineDash([4, 4]); c.globalAlpha = 0.55; c.strokeStyle = color; c.lineWidth = 1.8;
      segs.filter((s) => !s.front).forEach((s) => { c.beginPath(); c.moveTo(s.x1, s.y1); c.lineTo(s.x2, s.y2); c.stroke(); });
      c.restore();
      c.save();
      c.strokeStyle = color; c.lineWidth = 3;
      segs.filter((s) => s.front).forEach((s) => { c.beginPath(); c.moveTo(s.x1, s.y1); c.lineTo(s.x2, s.y2); c.stroke(); });
      c.restore();
      // Umlenkpunkte an den Kanten
      c.fillStyle = color;
      segs.forEach((s) => { c.beginPath(); c.arc(s.x2, s.y2, 2, 0, Math.PI * 2); c.fill(); });

      // Anschlüsse
      const tx = startLeft ? 70 : DW - 70;
      const edge = sx(startLeft);
      drawWire(c, tx, coil.yTop, edge, coil.yTop, COLORS.fg, 2);
      drawWire(c, tx, yBot, edge, yBot, COLORS.fg, 2);
      [coil.yTop, yBot].forEach((ty) => {
        c.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#0d1117';
        c.strokeStyle = COLORS.fg; c.lineWidth = 2;
        c.beginPath(); c.arc(tx, ty, 5, 0, Math.PI * 2); c.fill(); c.stroke();
      });

      // Strompfeil auf dem oberen Draht
      const mid = (tx + edge) / 2;
      const towardCoil = state.dir[k] === 1;
      const pointsRight = startLeft ? towardCoil : !towardCoil;
      const ax1 = pointsRight ? mid - 14 : mid + 14, ax2 = pointsRight ? mid + 14 : mid - 14;
      drawArrow(c, ax1, coil.yTop, ax2, coil.yTop, color, 2.5);
      c.fillStyle = color; c.font = 'bold 13px ui-monospace, monospace'; c.textAlign = 'center';
      c.fillText('i' + '₁₂₃'[k], mid, coil.yTop - 9);

      // Spannungspfeil (fest: oben → unten)
      const ux = startLeft ? tx - 20 : tx + 20;
      drawArrow(c, ux, coil.yTop + 8, ux, yBot - 8, COLORS.violet, 2);
      c.fillStyle = COLORS.violet; c.textAlign = startLeft ? 'right' : 'left';
      c.fillText('u' + '₁₂₃'[k], startLeft ? ux - 7 : ux + 7, (coil.yTop + yBot) / 2 + 5);

      // Name
      c.fillStyle = COLORS.dim; c.font = '12px ui-monospace, monospace';
      c.textAlign = startLeft ? 'left' : 'right';
      c.fillText('N' + '₁₂₃'[k], startLeft ? xr + 10 : xl - 10, (coil.yTop + yBot) / 2 + 4);
    }

    function frame(now) {
      if (!canvas.isConnected) return;
      const dt = Math.min(0.04, (now - last) / 1000); last = now;
      animT += dt;
      const W = cssW(canvas);
      // Höhe an die Breite anpassen (auf dem Handy sonst viel leerer Platz)
      const Hc = Math.round(Math.min(H, Math.max(220, (W * DH) / DW)));
      if (parseFloat(canvas.style.height) !== Hc) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.height = Math.round(Hc * dpr);
        canvas.style.height = Hc + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      ctx.clearRect(0, 0, W, Hc);
      const s = Math.min(W / DW, Hc / DH);
      ctx.save();
      ctx.translate((W - DW * s) / 2, (Hc - DH * s) / 2);
      ctx.scale(s, s);
      const cols = coilColors();
      drawCore(ctx);
      for (let k = 0; k < 3; k++) if (state.showFlux[k]) drawFlux(ctx, k, cols[k]);
      for (let k = 0; k < 3; k++) drawCoil(ctx, k, cols[k]);
      ctx.restore();
      coilHeads.forEach((h, k) => { h.style.color = cols[k]; });
      requestAnimationFrame(frame);
    }

    paintBoxes();
    requestAnimationFrame(frame);

    // ---------- Rezept ----------
    container.appendChild(el('div', { class: 'callout info' }, [
      el('span', { class: 'callout-label' }, 'So gehst du vor'),
      el('ul', {}, [
        el('li', {}, [el('strong', {}, 'Schritt 1 – Selbstinduktivitäten L₁₁, L₂₂, L₃₃: '), 'Fliesst der Strom dort hinein, wo der Spannungspfeil startet (Verbraucherpfeil)? Dann +, sonst −.']),
        el('li', {}, [el('strong', {}, 'Schritt 2 – Flussrichtungen einzeichnen: '), 'Für jede Spule mit der rechten Hand bestimmen, wie herum ihr Fluss im Kern umläuft (für den eingezeichneten Strompfeil). Faustregel: Strom vorne nach rechts → Fluss im Schenkel nach oben.']),
        el('li', {}, [el('strong', {}, 'Schritt 3 – Gegeninduktivitäten: '), 'Gleicher Umlaufsinn → +, entgegengesetzt → −. Bei Spulen auf verschiedenen Schenkeln dem Fluss einmal um den Kern folgen.']),
        el('li', {}, [el('strong', {}, 'Schritt 4 – Symmetrie: '), 'L_jk = L_kj. Das gleiche Vorzeichen gilt aber nur, wenn alle Spulen einen Verbraucherpfeil haben — sonst kippt die ganze Zeile einer Spule mit Erzeugerpfeil.']),
      ]),
    ]));

    // ---------- Woher kommen die Gleichungen ----------
    container.appendChild(el('h2', {}, [el('span', { class: 'h2-num' }, '2 ·'), 'Woher kommen die Gleichungen?']));
    container.appendChild(el('p', {}, 'Der Eisenkern ist wie ein Rohr für Feldlinien: Der Fluss, den eine Spule erzeugt, läuft durch den ganzen Kern und damit durch alle anderen Spulen. Jede Spule zählt also den Fluss aller Ströme zusammen — und das Induktionsgesetz macht daraus eine Spannung.'));
    const dgrid = el('div', { class: 'def-grid' });
    dgrid.appendChild(el('div', { class: 'def-card' }, [
      el('h4', {}, 'Flussverkettung'),
      el('p', {}, 'Eigener Strom (Selbstinduktion) plus die Ströme der anderen Spulen (Gegeninduktion):'),
      formulaBlock([
        '\\Psi_1 = L_{11} i_1 \\pm L_{12} i_2 \\pm L_{13} i_3',
        'u_1 = \\dfrac{\\mathrm{d}\\Psi_1}{\\mathrm{d}t}',
      ]),
    ]));
    dgrid.appendChild(el('div', { class: 'def-card' }, [
      el('h4', {}, 'Die Vorzeichen-Regel'),
      el('p', {}, 'a_j = +1 bei Verbraucherpfeil, sonst −1. c_k = Umlaufsinn des Flusses von Spule k (für i_k > 0).'),
      formulaBlock([
        '\\text{Diagonale: } a_j',
        '\\text{Kreuzterm } (j,k)\\text{: } a_j\\, c_j\\, c_k',
      ]),
    ]));
    dgrid.appendChild(el('div', { class: 'def-card' }, [
      el('h4', {}, 'Intuition'),
      el('p', {}, 'Läuft der Fluss einer fremden Spule in dieselbe Richtung wie der Fluss, den ich mit meinem eigenen Strom machen würde, hilft er mir (+). Läuft er dagegen, arbeitet er gegen mich (−). Wie zwei Leute, die am selben Seil ziehen.'),
    ]));
    container.appendChild(dgrid);

    container.appendChild(el('div', { class: 'callout ok' }, [
      el('span', { class: 'callout-label' }, 'Zum Ausprobieren'),
      el('ul', {}, [
        el('li', {}, ['Dreh bei Spule 1 die ', el('strong', {}, 'Wicklung'), ' um: Welche Vorzeichen ändern sich — und warum bleibt die Diagonale gleich?']),
        el('li', {}, ['Dreh bei Spule 1 den ', el('strong', {}, 'Strom'), ' um: Jetzt kippt die Diagonale in Zeile 1, die Kreuzterme in Zeile 1 bleiben gleich, aber Spalte 1 kippt. Warum?']),
        el('li', {}, ['Danach: Prüfungsaufgabe HS 24 (c) selbst lösen — ohne Simulation.']),
      ]),
    ]));

    container.appendChild(el('div', { class: 'callout bad' }, [
      el('span', { class: 'callout-label' }, 'Prüfungsfallen'),
      el('ul', {}, [
        el('li', {}, ['Die Wicklungsrichtung aus der 3D-Skizze falsch lesen: Nur der Draht ', el('strong', {}, 'vor'), ' dem Kern zählt für die rechte Hand — schräge Stücke führen nach hinten.']),
        el('li', {}, ['„Die Diagonale ist immer +“ stimmt nur mit Verbraucherpfeil. Zeigt der Strom am Spannungspfeil heraus, wird L_jj negativ.']),
        el('li', {}, ['L_jk = L_kj gilt für die ', el('strong', {}, 'Beträge'), ' immer, für die Vorzeichen nur, wenn alle Spulen gleich (Verbraucherpfeil) gezählt werden.']),
      ]),
    ]));
  },
});
