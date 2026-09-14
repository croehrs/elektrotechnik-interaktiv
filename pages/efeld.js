window.PAGES = window.PAGES || [];
window.PAGES.push({
  id: 'efeld',
  category: 'Elektrische & magnetische Felder',
  order: 3,
  num: '2.1',
  week: 'Woche 1 / 2',
  formelsammlung: 'Kap. 1 „Das elektrostatische Feld", S. 1–2',
  navTitle: 'Elektrisches Feld',
  title: 'Das elektrische Feld: Feldlinien um Ladungen',
  subtitle: 'Feldlinien sind kein Foto von etwas Realem — sie sind eine Rechenvorschrift, gezeichnet: überall tangential zu E, dicht wo E stark ist.',
  teaser: 'Ladungen selbst platzieren und die Feldlinien live berechnen lassen.',

  render(container) {
    container.appendChild(el('div', { class: 'callout warn' }, [
      el('span', { class: 'callout-label' }, 'Warum das verwirrt'),
      el('p', {}, 'Feldlinien wirken wie etwas Physikalisches, das man „sehen“ könnte — sind aber eine reine Konstruktion: an jedem Punkt zeigt die Linie in Richtung des Feldvektors E an genau diesem Punkt. Die Dichte der Linien ist dabei kein Zufall, sondern proportional zur Feldstärke — deshalb drängen sie sich nahe an Ladungen zusammen. Sie beginnen an positiven Ladungen und enden an negativen (oder im Unendlichen), und zwei Feldlinien kreuzen sich nie — an jedem Punkt zeigt E nur in eine Richtung.'),
    ]));

    container.appendChild(el('h2', {}, [el('span', { class: 'h2-num' }, '1 ·'), 'Ladungen platzieren, Feld beobachten']));
    container.appendChild(el('p', {}, 'Klicke auf die Fläche, um eine Ladung mit dem gewählten Vorzeichen hinzuzufügen. Bestehende Ladungen und die violette Sonde lassen sich mit der Maus verschieben.'));

    const panel = el('div', { class: 'sim-panel' });
    const toolbar = el('div', { class: 'sim-toolbar' });
    const addPos = el('button', { class: 'btn active' }, '+ Ladung hinzufügen');
    const addNeg = el('button', { class: 'btn' }, '− Ladung hinzufügen');
    const toggleLines = el('button', { class: 'btn active' }, 'Feldlinien');
    const toggleArrows = el('button', { class: 'btn' }, 'Vektorpfeile');
    toolbar.appendChild(addPos); toolbar.appendChild(addNeg);
    toolbar.appendChild(toggleLines); toolbar.appendChild(toggleArrows);
    panel.appendChild(toolbar);

    const toolbar2 = el('div', { class: 'sim-toolbar' });
    const presetDipol = el('button', { class: 'btn' }, 'Preset: Dipol');
    const presetSame = el('button', { class: 'btn' }, 'Preset: gleiche Ladungen');
    const presetPlate = el('button', { class: 'btn' }, 'Preset: Plattenkondensator');
    const resetBtn = el('button', { class: 'btn' }, '↺ zurücksetzen');
    toolbar2.appendChild(presetDipol); toolbar2.appendChild(presetSame); toolbar2.appendChild(presetPlate); toolbar2.appendChild(resetBtn);
    panel.appendChild(toolbar2);

    const canvasWrap = el('div', { class: 'sim-canvas-wrap' });
    const canvas = el('canvas', { style: 'cursor:crosshair' });
    canvasWrap.appendChild(canvas);
    panel.appendChild(canvasWrap);

    panel.appendChild(el('div', { class: 'legend' }, [
      legendItem(COLORS.amber, 'positive Ladung'),
      legendItem(COLORS.cyan, 'negative Ladung'),
      legendItem(COLORS.violet, 'Sonde (misst E lokal)'),
      legendItem(COLORS.cyan, 'Pfeil = Richtung von E', 'line'),
    ]));

    const readoutRow = el('div', { class: 'readout-row' }, [
      readout('Ladungen', 'ro-n'), readout('|E| an Sonde', 'ro-e'),
    ]);
    panel.appendChild(readoutRow);
    container.appendChild(panel);

    // ---- state ----
    const ctx = setupCanvas(canvas, 340);
    let charges = [];
    let probe = { fx: 0.72, fy: 0.5 };
    let addSign = 1;
    let showLines = true, showArrows = false;
    let drag = null; // {type:'charge'|'probe', index}

    function setDipol() { charges = [{ fx: 0.32, fy: 0.5, q: 1 }, { fx: 0.68, fy: 0.5, q: -1 }]; }
    function setSame() { charges = [{ fx: 0.35, fy: 0.42, q: 1 }, { fx: 0.65, fy: 0.58, q: 1 }]; }
    function setPlate() {
      charges = [];
      for (let i = 0; i < 7; i++) {
        const fy = 0.18 + (i / 6) * 0.64;
        charges.push({ fx: 0.32, fy, q: 1 });
        charges.push({ fx: 0.68, fy, q: -1 });
      }
    }
    setDipol();

    addPos.addEventListener('click', () => { addSign = 1; addPos.className = 'btn active'; addNeg.className = 'btn'; });
    addNeg.addEventListener('click', () => { addSign = -1; addNeg.className = 'btn active'; addPos.className = 'btn'; });
    toggleLines.addEventListener('click', () => { showLines = !showLines; toggleLines.className = 'btn' + (showLines ? ' active' : ''); });
    toggleArrows.addEventListener('click', () => { showArrows = !showArrows; toggleArrows.className = 'btn' + (showArrows ? ' active' : ''); });
    presetDipol.addEventListener('click', setDipol);
    presetSame.addEventListener('click', setSame);
    presetPlate.addEventListener('click', setPlate);
    resetBtn.addEventListener('click', () => { setDipol(); probe = { fx: 0.72, fy: 0.5 }; });

    function toPx(c) { const W = cssW(canvas); return { x: c.fx * W, y: c.fy * 340 }; }
    function nearestHit(px, py) {
      const W = cssW(canvas);
      let best = null, bestD = 16;
      charges.forEach((c, i) => {
        const p = toPx(c); const d = Math.hypot(p.x - px, p.y - py);
        if (d < bestD) { bestD = d; best = { type: 'charge', index: i }; }
      });
      const pp = toPx(probe); const dp = Math.hypot(pp.x - px, pp.y - py);
      if (dp < bestD) { best = { type: 'probe' }; }
      return best;
    }

    canvas.addEventListener('pointerdown', (ev) => {
      const rect = canvas.getBoundingClientRect();
      const px = ev.clientX - rect.left, py = ev.clientY - rect.top;
      const hit = nearestHit(px, py);
      if (hit) { drag = hit; return; }
      const W = cssW(canvas);
      if (charges.length < 8) charges.push({ fx: px / W, fy: py / 340, q: addSign });
    });
    window.addEventListener('pointermove', (ev) => {
      if (!drag) return;
      const rect = canvas.getBoundingClientRect();
      const px = Math.max(4, Math.min(rect.width - 4, ev.clientX - rect.left));
      const py = Math.max(4, Math.min(336, ev.clientY - rect.top));
      const W = cssW(canvas);
      if (drag.type === 'charge') { charges[drag.index].fx = px / W; charges[drag.index].fy = py / 340; }
      else { probe.fx = px / W; probe.fy = py / 340; }
    });
    window.addEventListener('pointerup', () => { drag = null; });

    // field in pixel-space; k tuned for visual arrow lengths, not physical units
    const K = 5200, EPS = 16;
    function fieldAt(x, y, chargesPx) {
      let ex = 0, ey = 0;
      for (const c of chargesPx) {
        const dx = x - c.x, dy = y - c.y;
        const r2 = dx * dx + dy * dy + EPS * EPS;
        const inv = K * c.q / (r2 * Math.sqrt(r2));
        ex += dx * inv; ey += dy * inv;
      }
      return { x: ex, y: ey };
    }

    function traceLine(start, chargesPx, W, H) {
      const pts = [start];
      let pos = start;
      const ds = 5.5;
      for (let step = 0; step < 260; step++) {
        const e1 = fieldAt(pos.x, pos.y, chargesPx);
        const m1 = Math.hypot(e1.x, e1.y);
        if (m1 < 1e-5) break;
        const mid = { x: pos.x + (e1.x / m1) * ds * 0.5, y: pos.y + (e1.y / m1) * ds * 0.5 };
        const e2 = fieldAt(mid.x, mid.y, chargesPx);
        const m2 = Math.hypot(e2.x, e2.y);
        if (m2 < 1e-5) break;
        const next = { x: pos.x + (e2.x / m2) * ds, y: pos.y + (e2.y / m2) * ds };
        pts.push(next);
        const nearCharge = chargesPx.some((c) => Math.hypot(next.x - c.x, next.y - c.y) < 11);
        if (nearCharge) break;
        if (next.x < -20 || next.x > W + 20 || next.y < -20 || next.y > H + 20) break;
        pos = next;
      }
      return pts;
    }

    // Draws a small arrowhead at a fraction along a traced line, oriented along
    // the local tangent — this is what makes the field direction (+ → −, or
    // outward for like charges) visible instead of just implied by the callout text.
    function drawArrowOnLine(pts, frac) {
      const idx = Math.max(1, Math.min(pts.length - 2, Math.round(frac * (pts.length - 1))));
      const p0 = pts[idx - 1], p1 = pts[idx + 1];
      const angle = Math.atan2(p1.y - p0.y, p1.x - p0.x);
      drawArrowHead(ctx, pts[idx].x, pts[idx].y, angle, 5.5, COLORS.cyan);
    }

    function draw() {
      if (!canvas.isConnected) return;
      const W = cssW(canvas), H = 340;
      ctx.clearRect(0, 0, W, H);
      const chargesPx = charges.map((c) => ({ x: c.fx * W, y: c.fy * H, q: c.q }));

      if (showArrows) {
        const step = 34;
        for (let gx = step / 2; gx < W; gx += step) {
          for (let gy = step / 2; gy < H; gy += step) {
            const e = fieldAt(gx, gy, chargesPx);
            const m = Math.hypot(e.x, e.y);
            if (m < 1e-4) continue;
            const len = Math.min(14, 4 + Math.log(1 + m) * 2.4);
            const ang = Math.atan2(e.y, e.x);
            const alpha = Math.min(0.9, 0.25 + Math.log(1 + m) * 0.12);
            ctx.strokeStyle = `rgba(158,167,180,${alpha})`;
            drawArrow(ctx, gx - Math.cos(ang) * len * 0.5, gy - Math.sin(ang) * len * 0.5,
              gx + Math.cos(ang) * len * 0.5, gy + Math.sin(ang) * len * 0.5,
              `rgba(158,167,180,${alpha})`, 1.4);
          }
        }
      }

      if (showLines) {
        const positives = chargesPx.filter((c) => c.q > 0);
        for (const c of positives) {
          const nLines = 12;
          for (let i = 0; i < nLines; i++) {
            const ang = (i / nLines) * Math.PI * 2;
            const start = { x: c.x + Math.cos(ang) * 10, y: c.y + Math.sin(ang) * 10 };
            const pts = traceLine(start, chargesPx, W, H);
            if (pts.length < 2) continue;
            ctx.strokeStyle = 'rgba(86,200,245,0.55)';
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            pts.forEach((p, k) => (k === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
            ctx.stroke();
            // arrowheads showing the field direction: always along the trace,
            // i.e. away from + charges and — where a negative charge is nearby — into it.
            if (pts.length > 6) drawArrowOnLine(pts, 0.42);
            if (pts.length > 12) drawArrowOnLine(pts, 0.86);
          }
        }
      }

      chargesPx.forEach((c) => {
        ctx.fillStyle = c.q > 0 ? COLORS.amber : COLORS.cyan;
        ctx.beginPath(); ctx.arc(c.x, c.y, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0d1117';
        ctx.font = 'bold 13px ui-monospace, monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(c.q > 0 ? '+' : '–', c.x, c.y + 0.5);
      });
      ctx.textBaseline = 'alphabetic';

      const pp = { x: probe.fx * W, y: probe.fy * H };
      const eAtProbe = fieldAt(pp.x, pp.y, chargesPx);
      const mag = Math.hypot(eAtProbe.x, eAtProbe.y);
      if (mag > 1e-4) {
        const len = Math.min(46, 14 + Math.log(1 + mag) * 8);
        const ang = Math.atan2(eAtProbe.y, eAtProbe.x);
        drawArrow(ctx, pp.x, pp.y, pp.x + Math.cos(ang) * len, pp.y + Math.sin(ang) * len, COLORS.violet, 2.4);
      }
      ctx.fillStyle = COLORS.violet;
      ctx.beginPath(); ctx.arc(pp.x, pp.y, 6, 0, Math.PI * 2); ctx.fill();

      document.getElementById('ro-n').textContent = charges.length;
      document.getElementById('ro-e').textContent = fmtNum(mag / 100, 2) + ' (rel.)';

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);

    container.appendChild(el('div', { class: 'callout info' }, [
      el('span', { class: 'callout-label' }, 'Was du sehen solltest'),
      el('ul', {}, [
        el('li', {}, ['Die ', el('strong', {}, 'Pfeile auf den Linien'), ' zeigen die tatsächliche Feldrichtung: weg von + und hinein in −. Bei gleichnamigen Ladungen zeigen sie einfach nach aussen, ins Unendliche.']),
        el('li', {}, ['Beim ', el('strong', {}, 'Dipol'), ' laufen alle Linien von + nach −; nahe an den Ladungen sind sie dicht gedrängt, dort ist E gross.']),
        el('li', {}, ['Bei ', el('strong', {}, 'gleichen Ladungen'), ' stossen sich die Linien ab und laufen auseinander — nur die eine Linie exakt auf der Mittelsenkrechten zwischen beiden ist gerade, alle anderen sind zwangsläufig gekrümmt. Das ist kein Fehler, sondern folgt direkt aus der Superposition beider Felder.']),
        el('li', {}, ['Beim ', el('strong', {}, 'Plattenkondensator'), ' sind die Linien in der Mitte parallel und gleich dicht — homogenes Feld — und „verbiegen“ sich erst am Rand (Randfeld / Streufeld).']),
        el('li', {}, ['Die Sonde zeigt dir E an einem beliebigen Punkt, unabhängig davon, ob dort zufällig eine Feldlinie gezeichnet ist — das Feld existiert überall, die Linien sind nur eine Auswahl.']),
      ]),
    ]));

    container.appendChild(el('h2', {}, [el('span', { class: 'h2-num' }, '2 ·'), 'Von der Punktladung zum Feld']));
    const dgrid = el('div', { class: 'def-grid' });
    dgrid.appendChild(el('div', { class: 'def-card' }, [
      el('h4', {}, 'Coulomb-Kraft'),
      el('p', {}, 'Kraft zwischen zwei Punktladungen, entlang der Verbindungslinie.'),
      formulaBlock('F = \\dfrac{1}{4\\pi\\varepsilon_0} \\cdot \\dfrac{q_1 q_2}{r^2}'),
    ]));
    dgrid.appendChild(el('div', { class: 'def-card' }, [
      el('h4', {}, 'Elektrisches Feld'),
      el('p', {}, 'Kraft pro Probeladung — eine Eigenschaft des Raums, unabhängig davon, ob dort tatsächlich eine Ladung sitzt.'),
      formulaBlock('E = \\dfrac{F}{q} = \\dfrac{1}{4\\pi\\varepsilon_0} \\cdot \\dfrac{Q}{r^2} \\hat{r}'),
    ]));
    dgrid.appendChild(el('div', { class: 'def-card' }, [
      el('h4', {}, 'Superposition'),
      el('p', {}, 'Felder mehrerer Ladungen addieren sich vektoriell — genau das rechnet die Simulation an jedem Punkt.'),
      formulaBlock('\\vec{E}_{ges} = \\sum_i \\vec{E}_i'),
    ]));
    dgrid.appendChild(el('div', { class: 'def-card' }, [
      el('h4', {}, 'Plattenkondensator'),
      el('p', {}, 'Homogenes Feld zwischen zwei grossen, parallelen, entgegengesetzt geladenen Platten.'),
      formulaBlock('E = \\dfrac{U}{d} \\quad \\text{(konstant zwischen den Platten)}'),
    ]));
    container.appendChild(dgrid);

    container.appendChild(el('h2', {}, [el('span', { class: 'h2-num' }, '3 ·'), 'Beispielrechnung']));
    container.appendChild(exampleBox({
      given: [['q1', '+3 µC'], ['q2', '−5 µC'], ['r', '8 cm'], ['k = 1/(4πε₀)', '8.99·10⁹ Nm²/C²']],
      steps: [
        { text: 'Coulomb-Gesetz mit den Beträgen der Ladungen anwenden.', formula: 'F = k \\cdot \\dfrac{|q_1 q_2|}{r^2}' },
        { text: 'Werte einsetzen (r in Metern: 0.08 m).', formula: 'F = 8.99\\cdot 10^{9} \\cdot \\dfrac{3\\cdot 10^{-6} \\cdot 5\\cdot 10^{-6}}{(0.08)^2}' },
        { text: 'Zähler und Nenner auswerten.', formula: 'F = \\dfrac{8.99\\cdot 10^{9} \\cdot 1.5\\cdot 10^{-11}}{0.0064} = \\dfrac{0.13485}{0.0064}' },
        { text: 'Vorzeichen der Ladungen prüfen: q1 positiv, q2 negativ → die Kraft ist anziehend.' },
      ],
      result: { label: 'Ergebnis', value: 'F ≈ 21.1 N, anziehend' },
    }));

    container.appendChild(el('div', { class: 'callout bad' }, [
      el('span', { class: 'callout-label' }, 'Prüfungsfallen'),
      el('ul', {}, [
        el('li', {}, [el('strong', {}, 'Feldlinien kreuzen sich nicht.'), ' An jedem Punkt hat E nur eine Richtung — kreuzende Linien in einer Skizze sind ein Fehler, keine Ausnahme.']),
        el('li', {}, ['E ist ein ', el('strong', {}, 'Vektorfeld'), ', existiert überall im Raum — auch dort, wo gerade keine Feldlinie gezeichnet ist. Die Linien sind eine Visualisierungswahl, keine physikalische Grenze.']),
        el('li', {}, ['Beim Plattenkondensator gilt E = U/d ', el('strong', {}, 'nur zwischen den Platten'), ', im Idealfall unendlich ausgedehnter Platten — am realen Rand gibt es ein Streufeld.']),
        el('li', {}, ['Die Feldstärke fällt mit ', el('strong', {}, '1/r²'), ' — eine Verdopplung des Abstands viertelt E, nicht halbiert es.']),
      ]),
    ]));
  },
});
