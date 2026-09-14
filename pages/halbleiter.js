window.PAGES = window.PAGES || [];
window.PAGES.push({
  id: 'halbleiter',
  category: 'Halbleiter',
  order: 9,
  num: '5.1',
  week: 'Woche 13',
  formelsammlung: 'Kap. 7 „Halbleiter" & Kap. 8 „pn-Diode", S. 17–19',
  navTitle: 'PN-Übergang & Diode',
  title: 'Halbleiter: der PN-Übergang und die Diodenkennlinie',
  subtitle: 'Eine Diode ist kein Schalter, der bei 0.7 V umklappt — ihr Strom wächst exponentiell mit der Spannung, nur eben so steil, dass es sich wie ein Schwellenwert anfühlt.',
  teaser: 'PN-Übergang, Raumladungszone und Shockley-Gleichung live an der Diode.',

  render(container) {
    container.appendChild(el('div', { class: 'callout warn' }, [
      el('span', { class: 'callout-label' }, 'Warum das verwirrt'),
      el('p', {}, '„p-dotiert“ klingt nach einer positiv geladenen Materialsorte — ist es aber nicht: das Kristallgitter bleibt insgesamt neutral, nur die beweglichen Majoritätsladungsträger sind positive Löcher statt Elektronen. Und die Diodenkennlinie sieht in Skizzen oft wie ein Schalter aus, der bei ca. 0.7 V umklappt — tatsächlich ist es eine e-Funktion, die einfach so steil wird, dass ein Bereich von wenigen Zehntel Volt zwischen „praktisch nichts“ und „mehrere zehn Milliampere“ liegt.'),
    ]));

    container.appendChild(el('h2', {}, [el('span', { class: 'h2-num' }, '1 ·'), 'Der PN-Übergang unter Spannung']));
    container.appendChild(el('p', {}, 'Stelle die angelegte Spannung U ein und beobachte zwei Dinge gleichzeitig: wie sich die Raumladungszone (die ladungsträgerfreie Zone in der Mitte) verändert, und wo du dich auf der Kennlinie befindest.'));

    const panel = el('div', { class: 'sim-panel' });

    const wrap = el('div', { class: 'two-col' });
    const leftWrap = el('div', { class: 'sim-canvas-wrap' });
    const juncCanvas = el('canvas');
    leftWrap.appendChild(juncCanvas);
    const rightWrap = el('div', { class: 'sim-canvas-wrap' });
    const curveCanvas = el('canvas');
    rightWrap.appendChild(curveCanvas);
    wrap.appendChild(leftWrap); wrap.appendChild(rightWrap);
    panel.appendChild(wrap);

    panel.appendChild(el('div', { class: 'legend' }, [
      legendItem(COLORS.amber, 'Löcher (p-Gebiet)'),
      legendItem(COLORS.cyan, 'Elektronen (n-Gebiet)'),
      legendItem(COLORS.green, 'Arbeitspunkt auf der Kennlinie'),
    ]));

    const readoutRow = el('div', { class: 'readout-row' }, [
      readout('U', 'ro-u'), readout('I (Shockley)', 'ro-i'),
      readout('Breite Raumladungszone', 'ro-w'), readout('Bereich', 'ro-region'),
    ]);
    panel.appendChild(readoutRow);

    const grid = el('div', { class: 'controls-grid' });
    const sU = slider({ id: 'hl-u', label: 'Angelegte Spannung U', min: -1.5, max: 0.65, step: 0.01, value: 0.3, unit: ' V' });
    grid.appendChild(sU.row);
    panel.appendChild(grid);
    container.appendChild(panel);

    // ---- physics (illustrative, order-of-magnitude realistic) ----
    const IS = 4e-14, N_IDEAL = 1, UT = 0.02585, VBI = 0.7;
    function diodeCurrentA(U) { return IS * (Math.exp(U / (N_IDEAL * UT)) - 1); }
    function depletionWidthPx(U) {
      const ratio = Math.max(0.04, (VBI - U) / VBI);
      return Math.min(150, 92 * Math.sqrt(ratio));
    }

    const ctxJ = setupCanvas(juncCanvas, 260);
    const ctxC = setupCanvas(curveCanvas, 260);
    let phase = 0, last = performance.now();

    function frame(now) {
      if (!juncCanvas.isConnected) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const U = parseFloat(sU.input.value);
      const iA = diodeCurrentA(U);
      const iMA = iA * 1000;
      const w = depletionWidthPx(U);

      document.getElementById('ro-u').textContent = fmtNum(U, 2) + ' V';
      document.getElementById('ro-i').textContent = (Math.abs(iMA) < 0.001 ? fmtNum(iA * 1e9, 2) + ' nA' : fmtNum(iMA, 3) + ' mA');
      document.getElementById('ro-w').textContent = fmtNum(w, 0) + ' px (rel.)';
      const regionEl = document.getElementById('ro-region');
      regionEl.textContent = U < -0.1 ? 'Sperrbereich' : (U < 0.5 ? 'Schwellenbereich' : 'Durchlassbereich');

      phase += dt;
      drawJunction(w, U, iMA, phase);
      drawCurve(U, iMA);
      requestAnimationFrame(frame);
    }

    function drawJunction(w, U, iMA, phase) {
      const W = cssW(juncCanvas), H = 260;
      ctxJ.clearRect(0, 0, W, H);
      const midX = W / 2, top = 40, bot = H - 40;
      const pX0 = 30, nX1 = W - 30;
      const dep0 = midX - w / 2, dep1 = midX + w / 2;

      ctxJ.fillStyle = 'rgba(194,101,12,0.08)';
      ctxJ.fillRect(pX0, top, dep0 - pX0, bot - top);
      ctxJ.fillStyle = 'rgba(10,126,164,0.08)';
      ctxJ.fillRect(dep1, top, nX1 - dep1, bot - top);
      ctxJ.fillStyle = COLORS.mute + '22';
      ctxJ.fillRect(dep0, top, dep1 - dep0, bot - top);
      ctxJ.strokeStyle = COLORS.line; ctxJ.setLineDash([3, 3]);
      ctxJ.strokeRect(dep0, top, dep1 - dep0, bot - top);
      ctxJ.setLineDash([]);

      ctxJ.fillStyle = COLORS.amber; ctxJ.font = '11px ui-monospace, monospace'; ctxJ.textAlign = 'center';
      for (let x = pX0 + 14; x < dep0 - 6; x += 20) {
        for (let y = top + 16; y < bot; y += 26) ctxJ.fillText('+', x, y);
      }
      ctxJ.fillStyle = COLORS.cyan;
      for (let x = dep1 + 6; x < nX1 - 8; x += 20) {
        for (let y = top + 16; y < bot; y += 26) ctxJ.fillText('–', x, y);
      }

      ctxJ.fillStyle = COLORS.dim; ctxJ.font = 'bold 13px ui-monospace, monospace';
      ctxJ.fillText('p', pX0 + 16, top - 10);
      ctxJ.fillText('n', nX1 - 16, top - 10);
      ctxJ.font = '10.5px ui-monospace, monospace'; ctxJ.fillStyle = COLORS.mute;
      ctxJ.fillText('Raumladungszone', midX, bot + 20);

      if (iMA > 0.05) {
        const path = makePath([{ x1: pX0, y1: H - 14, x2: nX1, y2: H - 14 }]);
        const speed = Math.min(2, iMA / 8);
        for (let k = 0; k < 6; k++) {
          const p = path.at(k / 6 + phase * speed * 0.3);
          ctxJ.fillStyle = COLORS.green;
          ctxJ.beginPath(); ctxJ.arc(p.x, p.y, 3, 0, Math.PI * 2); ctxJ.fill();
        }
        ctxJ.fillStyle = COLORS.mute; ctxJ.font = '10px ui-monospace, monospace'; ctxJ.textAlign = 'left';
        ctxJ.fillText('konventioneller Strom →', pX0, H - 20);
      }
    }

    function drawCurve(Ucur, iMAcur) {
      const W = cssW(curveCanvas), H = 260;
      ctxC.clearRect(0, 0, W, H);
      const pad = { l: 40, r: 14, t: 14, b: 26 };
      const x0 = pad.l, y0 = pad.t, w = W - pad.l - pad.r, h = H - pad.t - pad.b;
      const uMin = -1.5, uMax = 0.65, iMin = -0.02, iMax = 40;

      ctxC.strokeStyle = COLORS.line; ctxC.lineWidth = 1;
      ctxC.strokeRect(x0, y0, w, h);
      const zx = x0 + ((0 - uMin) / (uMax - uMin)) * w;
      ctxC.setLineDash([3, 3]);
      ctxC.beginPath(); ctxC.moveTo(zx, y0); ctxC.lineTo(zx, y0 + h); ctxC.stroke();
      ctxC.setLineDash([]);
      ctxC.fillStyle = COLORS.mute; ctxC.font = '10px ui-monospace, monospace';
      ctxC.textAlign = 'center'; ctxC.fillText('U [V] →', x0 + w - 24, y0 + h + 16);
      ctxC.save(); ctxC.translate(12, y0 + h / 2); ctxC.rotate(-Math.PI / 2);
      ctxC.fillText('I [mA]', 0, 0); ctxC.restore();

      ctxC.strokeStyle = COLORS.dim; ctxC.lineWidth = 2;
      ctxC.beginPath();
      for (let i = 0; i <= 150; i++) {
        const U = uMin + (i / 150) * (uMax - uMin);
        const iMA = Math.max(iMin, Math.min(iMax, diodeCurrentA(U) * 1000));
        const px = x0 + ((U - uMin) / (uMax - uMin)) * w;
        const py = y0 + h - ((iMA - iMin) / (iMax - iMin)) * h;
        i === 0 ? ctxC.moveTo(px, py) : ctxC.lineTo(px, py);
      }
      ctxC.stroke();

      const iClamped = Math.max(iMin, Math.min(iMax, iMAcur));
      const mx = x0 + ((Ucur - uMin) / (uMax - uMin)) * w;
      const my = y0 + h - ((iClamped - iMin) / (iMax - iMin)) * h;
      ctxC.strokeStyle = COLORS.green; ctxC.setLineDash([2, 3]);
      ctxC.beginPath(); ctxC.moveTo(mx, y0 + h); ctxC.lineTo(mx, my); ctxC.stroke();
      ctxC.setLineDash([]);
      ctxC.fillStyle = COLORS.green;
      ctxC.beginPath(); ctxC.arc(mx, my, 4.5, 0, Math.PI * 2); ctxC.fill();
    }

    requestAnimationFrame(frame);

    container.appendChild(el('div', { class: 'callout info' }, [
      el('span', { class: 'callout-label' }, 'Was du sehen solltest'),
      el('ul', {}, [
        el('li', {}, ['Bei ', el('strong', {}, 'negativer Spannung'), ' (Sperrrichtung) wird die Raumladungszone breiter — es gibt kaum bewegliche Ladungsträger in der Mitte, praktisch kein Strom fliesst.']),
        el('li', {}, ['Näherst du dich der ', el('strong', {}, 'Diffusionsspannung'), ' (≈ 0.7 V für Silizium) von unten, schrumpft die Zone rasant, und der Strom auf der Kennlinie schiesst nach oben — genau der „Knick“, den man sich als Schaltschwelle merkt.']),
        el('li', {}, ['Der grüne Punkt auf der Kennlinie und die Breite der Raumladungszone links bewegen sich synchron — beides ist derselbe physikalische Effekt, nur zweimal dargestellt.']),
      ]),
    ]));

    container.appendChild(el('h2', {}, [el('span', { class: 'h2-num' }, '2 ·'), 'Dotierung und die Shockley-Gleichung']));
    const dgrid = el('div', { class: 'def-grid' });
    dgrid.appendChild(el('div', { class: 'def-card' }, [
      el('h4', {}, 'Donatoren (n-Typ)'),
      el('p', {}, 'Fremdatome aus Gruppe V (z. B. Phosphor, Arsen) bringen ein zusätzliches, schwach gebundenes Elektron mit — freie Elektronen sind Majoritätsträger.'),
      formulaBlock('\\text{Si-Gitter} + \\text{Gruppe V} \\;\\rightarrow\\; \\text{1 Elektron zu viel}'),
    ]));
    dgrid.appendChild(el('div', { class: 'def-card' }, [
      el('h4', {}, 'Akzeptoren (p-Typ)'),
      el('p', {}, 'Fremdatome aus Gruppe III (z. B. Bor) lassen eine Bindung offen — ein „Loch“, das wie ein bewegliches positives Teilchen wirkt.'),
      formulaBlock('\\text{Si-Gitter} + \\text{Gruppe III} \\;\\rightarrow\\; \\text{1 Elektron zu wenig}'),
    ]));
    dgrid.appendChild(el('div', { class: 'def-card' }, [
      el('h4', {}, 'Bandlücke'),
      el('p', {}, 'Energieabstand zwischen Valenz- und Leitungsband — bestimmt, wie leicht thermische Energie Elektronen ins Leitungsband hebt.'),
      formulaBlock('\\text{Si: } E_g \\approx 1.12\\text{ eV} \\qquad \\text{Ge: } E_g \\approx 0.66\\text{ eV}'),
    ]));
    dgrid.appendChild(el('div', { class: 'def-card' }, [
      el('h4', {}, 'Shockley-Gleichung'),
      el('p', {}, 'Diodenstrom als Funktion der angelegten Spannung — der Ursprung der exponentiellen Kennlinie.'),
      formulaBlock([
        'I = I_S \\cdot \\left(e^{U/(nU_T)} - 1\\right)',
        'U_T = \\dfrac{kT}{q} \\approx 25.85\\text{ mV bei } 300\\text{ K}',
      ]),
    ]));
    container.appendChild(dgrid);

    container.appendChild(el('div', { class: 'table-wrap' }, [
      el('table', {}, [
        el('thead', {}, el('tr', {}, [el('th', {}, ''), el('th', {}, 'n-Typ'), el('th', {}, 'p-Typ')])),
        el('tbody', {}, [
          el('tr', {}, [el('td', {}, [el('strong', {}, 'Dotierstoff')]), el('td', {}, 'Gruppe V (Donator)'), el('td', {}, 'Gruppe III (Akzeptor)')]),
          el('tr', {}, [el('td', {}, [el('strong', {}, 'Majoritätsträger')]), el('td', {}, 'Elektronen (negativ)'), el('td', {}, 'Löcher (positiv)')]),
          el('tr', {}, [el('td', {}, [el('strong', {}, 'Eselsbrücke aus dem PVK')]), el('td', {}, '„n wie negativ, 1 Elektron mehr“'), el('td', {}, '„p wie positiv, 1 Elektron weniger“')]),
          el('tr', {}, [el('td', {}, [el('strong', {}, 'Nettoladung des Kristalls')]), el('td', {}, 'neutral'), el('td', {}, 'neutral')]),
        ]),
      ]),
    ]));

    container.appendChild(el('h2', {}, [el('span', { class: 'h2-num' }, '3 ·'), 'Beispielrechnung']));
    container.appendChild(exampleBox({
      given: [['I_S', '1·10⁻¹² A'], ['n', '1 (Idealfaktor)'], ['T', '300 K → U_T ≈ 25.85 mV'], ['U', '0.6 V (Durchlassspannung)']],
      steps: [
        { text: 'Shockley-Gleichung ansetzen.', formula: 'I = I_S \\cdot \\left(e^{U/(nU_T)} - 1\\right)' },
        { text: 'Exponent berechnen.', formula: '\\dfrac{U}{U_T} = \\dfrac{0.6}{0.02585} \\approx 23.21' },
        { text: 'Einsetzen — die „−1“ ist gegenüber e^{23.21} vernachlässigbar.', formula: 'I \\approx 1\\cdot 10^{-12} \\cdot e^{23.21} \\approx 1\\cdot 10^{-12} \\cdot 1.20\\cdot 10^{10} \\approx 0.0120\\text{ A}' },
      ],
      result: { label: 'Ergebnis', value: 'I ≈ 12.0 mA' },
    }));

    container.appendChild(el('div', { class: 'callout bad' }, [
      el('span', { class: 'callout-label' }, 'Prüfungsfallen'),
      el('ul', {}, [
        el('li', {}, ['„0.7 V Schwellenspannung“ ist eine ', el('strong', {}, 'Näherung'), ', kein exakter Schaltpunkt — die Kennlinie ist überall exponentiell, auch weit unterhalb von 0.7 V, nur mit vernachlässigbar kleinem Strom.']),
        el('li', {}, ['Auch in Sperrrichtung fliesst ein winziger ', el('strong', {}, 'Sättigungssperrstrom I_S'), ' — eine reale Diode sperrt nie absolut perfekt (bis zur Durchbruchspannung).']),
        el('li', {}, ['„p-dotiert“ heisst nicht, dass das Material positiv geladen ist — es bleibt ', el('strong', {}, 'elektrisch neutral'), ', nur die beweglichen Majoritätsträger sind positive Löcher.']),
        el('li', {}, ['Vorwärts- und Rückwärtsstrom unterscheiden sich um viele Grössenordnungen — deshalb zeigen reale Diodenkennlinien den Sperrbereich oft in einem eigenen, gedehnten Massstab.']),
      ]),
    ]));
  },
});
