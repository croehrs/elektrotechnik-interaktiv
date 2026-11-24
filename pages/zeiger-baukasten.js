// Zeiger-Baukasten: Zeigerdiagramme selbst zeichnen und kontrollieren lassen.
// Zwei Modi:
//   · Zeichnen  — Grösse wählen, Pfeil ins Raster ziehen (rastet ein), „Kontrollieren“
//                 bewertet wie in der Prüfung (Richtung / Länge) und erklärt den konkreten Fehler.
//   · Zuordnen  — die Zeiger sind schon gezeichnet, aber nummeriert statt beschriftet
//                 (Prüfungsstil FS 26 / HS 25: „Welcher Zeiger gehört zu î_L?“), inkl. eines Köders.
// Alle Aufgaben stammen aus alten Prüfungen; Werte und Lösungen sind aus den offiziellen Lösungen übernommen.
// Ein Zeiger ist nur durch Betrag und Winkel festgelegt → bewertet wird nur (Ende − Anfang),
// der Startpunkt ist frei (Kopf-an-Schwanz oder im Ursprung, beides gibt volle Punkte).

(function () {
  // ---------- kleine Helfer ----------
  const deg = (r) => (r * 180) / Math.PI;
  const wrap180 = (a) => { let x = ((a + 180) % 360 + 360) % 360 - 180; return x === -180 ? 180 : x; };
  const nfmt = (v) => {
    const r = Math.round(v * 100) / 100;
    return (Object.is(r, -0) ? 0 : r).toString().replace('.', '.');
  };
  // komplexe Zahl hübsch: (1 + j0.5)
  function cfmt(re, im) {
    const a = Math.round(re * 100) / 100, b = Math.round(im * 100) / 100;
    if (Math.abs(b) < 1e-9) return nfmt(a);
    if (Math.abs(a) < 1e-9) return (b < 0 ? '−' : '') + 'j' + (Math.abs(b) === 1 ? '' : nfmt(Math.abs(b)));
    return nfmt(a) + (b < 0 ? ' − ' : ' + ') + 'j' + (Math.abs(b) === 1 ? '' : nfmt(Math.abs(b)));
  }
  // HTML-Label einer Grösse: unterstrichene Basis + Index
  const qHTML = (q) => `<span class="zb-q"><span class="zb-u">${q.base}</span>${q.sub ? `<sub>${q.sub}</sub>` : ''}</span>`;
  const colorVar = { amber: 'var(--c1)', cyan: 'var(--c2)', violet: 'var(--c3)', green: 'var(--c4)', red: 'var(--c5)', mute: 'var(--fg-mute)' };

  // ---------- Schaltplan-Bausteine (SVG, Farben über CSS-Variablen → Theme-fest) ----------
  const S = {
    wire: (pts) => `<polyline points="${pts.map((p) => p.join(',')).join(' ')}" fill="none" stroke="currentColor" stroke-width="2"/>`,
    dot: (x, y) => `<circle cx="${x}" cy="${y}" r="3" fill="currentColor"/>`,
    term: (x, y, t, leftSide) => `<circle cx="${x}" cy="${y}" r="4" fill="var(--bg)" stroke="currentColor" stroke-width="2"/><text x="${leftSide ? x - 8 : x + 8}" y="${y + 5}" class="zb-t" text-anchor="${leftSide ? 'end' : 'start'}">${t}</text>`,
    // Widerstand (Kasten), horizontal oder vertikal, Mitte (x,y)
    R: (x, y, v) => v
      ? `<rect x="${x - 7}" y="${y - 16}" width="14" height="32" fill="var(--bg)" stroke="currentColor" stroke-width="2"/>`
      : `<rect x="${x - 16}" y="${y - 7}" width="32" height="14" fill="var(--bg)" stroke="currentColor" stroke-width="2"/>`,
    C: (x, y, v) => v
      ? `<rect x="${x - 14}" y="${y - 5}" width="28" height="10" fill="var(--bg)"/><line x1="${x - 13}" y1="${y - 4}" x2="${x + 13}" y2="${y - 4}" stroke="currentColor" stroke-width="3"/><line x1="${x - 13}" y1="${y + 4}" x2="${x + 13}" y2="${y + 4}" stroke="currentColor" stroke-width="3"/>`
      : `<rect x="${x - 5}" y="${y - 14}" width="10" height="28" fill="var(--bg)"/><line x1="${x - 4}" y1="${y - 13}" x2="${x - 4}" y2="${y + 13}" stroke="currentColor" stroke-width="3"/><line x1="${x + 4}" y1="${y - 13}" x2="${x + 4}" y2="${y + 13}" stroke="currentColor" stroke-width="3"/>`,
    L: (x, y, v) => {
      let d = '';
      if (v) { d = `M${x},${y - 18}`; for (let i = 0; i < 4; i++) d += ` a5,4.5 0 0 1 0,9`; return `<rect x="${x - 2}" y="${y - 18}" width="10" height="36" fill="var(--bg)"/><path d="${d}" fill="none" stroke="currentColor" stroke-width="2"/>`; }
      d = `M${x - 18},${y}`; for (let i = 0; i < 4; i++) d += ` a4.5,5 0 0 1 9,0`;
      return `<rect x="${x - 18}" y="${y - 8}" width="36" height="10" fill="var(--bg)"/><path d="${d}" fill="none" stroke="currentColor" stroke-width="2"/>`;
    },
    src: (x, y) => `<circle cx="${x}" cy="${y}" r="13" fill="var(--bg)" stroke="currentColor" stroke-width="2"/><path d="M${x - 7},${y} q3.5,-7 7,0 t7,0" fill="none" stroke="currentColor" stroke-width="1.8"/>`,
    // Zählpfeil von (x1,y1) nach (x2,y2) in Farbe c, mit Label
    arr: (x1, y1, x2, y2, c, label, lx, ly, anchor = 'middle') => {
      const a = Math.atan2(y2 - y1, x2 - x1), s = 7;
      const p1 = [x2 - s * Math.cos(a - 0.45), y2 - s * Math.sin(a - 0.45)];
      const p2 = [x2 - s * Math.cos(a + 0.45), y2 - s * Math.sin(a + 0.45)];
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="2"/>`
        + `<polygon points="${x2},${y2} ${p1.join(',')} ${p2.join(',')}" fill="${c}"/>`
        + (label ? `<text x="${lx}" y="${ly}" class="zb-t" fill="${c}" text-anchor="${anchor}">${label}</text>` : '');
    },
  };
  const svgLabel = (base, sub) => `<tspan text-decoration="underline">${base}</tspan>${sub ? `<tspan font-size="10" dy="3">${sub}</tspan>` : ''}`;
  const svgWrap = (inner, h = 210) => `<svg viewBox="0 0 360 ${h}" class="zb-svg" role="img">${inner}</svg>`;

  // ---------- Aufgaben ----------
  // v = korrekter Zeiger (Re, Im) · start = Startpunkt wie in der Musterlösung · optional = zählt nicht für Punkte
  const TASKS = [
    {
      id: 'fs22',
      tab: 'Serien-RLC',
      source: 'FS 2022 · Aufgabe 4(a) · 2 P',
      level: 'Einstieg',
      intro: 'Zeichnen Sie ein Zeigerdiagramm, um ausgehend vom Strom î = 1 A die Spannung û_AB zu finden.',
      given: [['R', '1 Ω'], ['ωL', '2 Ω'], ['ωC', '1 S'], ['î', '1 A (reell, Referenz)']],
      range: 2, grid: 0.5, snap: 0.25,
      schematic: () => svgWrap(
        S.wire([[30, 80], [330, 80]]) + S.term(30, 80, 'A', true) + S.term(330, 80, 'B')
        + S.R(100, 80) + S.L(180, 80) + S.C(260, 80)
        + `<text x="100" y="62" class="zb-t" text-anchor="middle">R</text><text x="180" y="62" class="zb-t" text-anchor="middle">L</text><text x="260" y="58" class="zb-t" text-anchor="middle">C</text>`
        + S.arr(42, 70, 66, 70, colorVar.mute, svgLabel('î'), 54, 60)
        + S.arr(82, 108, 118, 108, colorVar.amber, svgLabel('û', 'R'), 100, 126)
        + S.arr(162, 108, 198, 108, colorVar.violet, svgLabel('û', 'L'), 180, 126)
        + S.arr(242, 108, 278, 108, colorVar.cyan, svgLabel('û', 'C'), 260, 126)
        + S.arr(40, 160, 320, 160, colorVar.green, svgLabel('û', 'AB'), 180, 182)
      ),
      fixed: [{ key: 'i', base: 'î', sub: '', v: [1, 0], start: [0, 0], unit: 'A' }],
      arrows: [
        { key: 'uR', base: 'û', sub: 'R', unit: 'V', color: 'amber', v: [1, 0], start: [0, 0],
          why: 'Am Widerstand gibt es keine Phasenverschiebung: û_R = R·î = 1 Ω · 1 A = 1 V — parallel zu î.',
          formula: '\\underline{\\hat{u}}_R = R\\,\\underline{\\hat{i}} = 1\\,\\text{V}' },
        { key: 'uL', base: 'û', sub: 'L', unit: 'V', color: 'violet', v: [0, 2], start: [1, 0],
          why: 'Multiplikation mit j dreht um +90°: Die Spannung an der Spule eilt dem Strom voraus.',
          formula: '\\underline{\\hat{u}}_L = j\\omega L\\,\\underline{\\hat{i}} = j\\,2\\,\\text{V}',
          wrong: { rot: 'Bei der Spule kommt +j (Zähler): û_L = jωL·î zeigt 90° GEGEN den Uhrzeigersinn von î aus.', conj: 'Bei der Spule steht j im Zähler (Z_L = +jωL) — die Spannung eilt dem Strom voraus, zeigt hier also nach oben.' } },
        { key: 'uC', base: 'û', sub: 'C', unit: 'V', color: 'cyan', v: [0, -1], start: [1, 2],
          why: 'Division durch j dreht um −90° (1/j = −j): Die Spannung am Kondensator hinkt dem Strom hinterher.',
          formula: '\\underline{\\hat{u}}_C = \\frac{\\underline{\\hat{i}}}{j\\omega C} = -j\\,1\\,\\text{V}',
          wrong: { rot: 'Beim Kondensator steht j im Nenner: 1/(jωC) = −j/(ωC) → 90° IM Uhrzeigersinn.', conj: 'Typischer Fehler: 1/j = +j gesetzt. Richtig ist 1/j = −j.' } },
        { key: 'uAB', base: 'û', sub: 'AB', unit: 'V', color: 'green', v: [1, 1], start: [0, 0],
          why: 'Maschenregel: û_AB = û_R + û_L + û_C = 1 + 2j − j = (1 + j) V. Die drei Teilzeiger Kopf an Schwanz aneinanderhängen — û_AB zeigt vom Anfang der Kette zur Spitze.',
          formula: '\\underline{\\hat{u}}_{AB} = \\underline{\\hat{u}}_R + \\underline{\\hat{u}}_L + \\underline{\\hat{u}}_C = (1+j)\\,\\text{V}' },
      ],
      relations: [{ name: 'Maschenregel', parts: ['uR', 'uL', 'uC'], total: 'uAB' }],
      steps: [
        { text: 'Der Strom î ist in allen drei Bauteilen derselbe (Serienschaltung) und reell → er ist die Referenz auf der reellen Achse.' },
        { text: 'Jede Teilspannung mit û = Z·î: R dreht nicht, j (Spule) dreht +90°, 1/j (Kondensator) dreht −90°.', formula: 'Z_R = 1\\,\\Omega,\\quad Z_L = j2\\,\\Omega,\\quad Z_C = \\tfrac{1}{j\\cdot 1} = -j\\,\\Omega' },
        { text: 'Teilspannungen Kopf an Schwanz aneinanderhängen: û_R ab Ursprung, û_L ab der Spitze von û_R, û_C ab der Spitze von û_L.' },
        { text: 'û_AB ist der Pfeil vom Ursprung zur Spitze der Kette.', formula: '\\underline{\\hat{u}}_{AB} = (1+j)\\,\\text{V}' },
      ],
      decoy: { v: [0, -2], start: [0, 0], why: 'Das wäre û_L mit −j statt +j — der typische Vorzeichenfehler bei der Spule.' },
    },
    {
      id: 'hs22',
      tab: 'Parallel-RC',
      source: 'HS 2022 · Aufgabe 4(b) · 2 P',
      level: 'Prüfungsniveau',
      intro: 'Vervollständigen Sie das Zeigerdiagramm. Als Messwert sei û_AB = 1 V gegeben. Zeichnen Sie û_R1, î_R1, î_R2, î_C2. Hinweis: Starten Sie mit î_R2 und î_C2.',
      given: [['R₁ = R₂', '0.5 Ω'], ['ωC₁ = ωC₂', '1 S'], ['û_AB', '1 V (reell, Referenz)']],
      range: 2, grid: 0.5, snap: 0.25,
      schematic: () => svgWrap(
        S.wire([[40, 97], [40, 40], [320, 40]]) + S.wire([[40, 123], [40, 180], [320, 180]])
        + S.wire([[230, 40], [230, 180]]) + S.wire([[280, 40], [280, 180]])
        + S.src(40, 110) + S.C(95, 40) + S.R(150, 40) + S.C(230, 110, true) + S.R(280, 110, true)
        + S.dot(230, 40) + S.dot(280, 40) + S.dot(230, 180) + S.dot(280, 180)
        + S.term(320, 40, 'A') + S.term(320, 180, 'B')
        + `<text x="95" y="22" class="zb-t" text-anchor="middle">C₁</text><text x="150" y="26" class="zb-t" text-anchor="middle">R₁</text>`
        + `<text x="212" y="114" class="zb-t" text-anchor="end">C₂</text><text x="292" y="114" class="zb-t">R₂</text>`
        + S.arr(14, 92, 14, 128, colorVar.mute, svgLabel('û', '0'), 12, 150)
        + S.arr(176, 30, 204, 30, colorVar.amber, svgLabel('î', 'R1'), 190, 22)
        + S.arr(132, 60, 168, 60, colorVar.green, svgLabel('û', 'R1'), 150, 78)
        + S.arr(240, 60, 240, 84, colorVar.cyan, svgLabel('î', 'C2'), 246, 76, 'start')
        + S.arr(290, 60, 290, 84, colorVar.red, svgLabel('î', 'R2'), 296, 76, 'start')
        + S.arr(338, 56, 338, 164, colorVar.mute, svgLabel('û', 'AB'), 336, 200, 'end')
      ),
      fixed: [{ key: 'uAB', base: 'û', sub: 'AB', v: [1, 0], start: [0, 0], unit: 'V' }],
      arrows: [
        { key: 'iR2', base: 'î', sub: 'R2', unit: 'A', color: 'red', v: [2, 0], start: [0, 0],
          why: 'R₂ liegt direkt an û_AB: î_R2 = û_AB / R₂ = 1 V / 0.5 Ω = 2 A — reell, parallel zu û_AB.',
          formula: '\\underline{\\hat{i}}_{R2} = \\frac{\\underline{\\hat{u}}_{AB}}{R_2} = 2\\,\\text{A}',
          wrong: { len: 'Durch 0.5 Ω teilen heisst mal 2 (1/R₂ = 2 S) — der Strom ist also doppelt so lang wie û_AB.' } },
        { key: 'iC2', base: 'î', sub: 'C2', unit: 'A', color: 'cyan', v: [0, 1], start: [2, 0],
          why: 'Auch C₂ liegt an û_AB: î_C2 = jωC₂ · û_AB = j·1 A. Der Kondensatorstrom eilt der Spannung um 90° voraus.',
          formula: '\\underline{\\hat{i}}_{C2} = \\frac{\\underline{\\hat{u}}_{AB}}{Z_{C2}} = j\\omega C_2\\,\\underline{\\hat{u}}_{AB} = j\\,1\\,\\text{A}',
          wrong: { rot: 'Beim Strom durch C ist es umgekehrt wie bei der Spannung: î_C = jωC·û → +90° (Strom eilt voraus).', conj: 'Typischer Fehler: û/Z_C mit Z_C = −j gerechnet und dann 1/(−j) = −j gesetzt. Richtig: 1/(−j) = +j.' } },
        { key: 'iR1', base: 'î', sub: 'R1', unit: 'A', color: 'amber', v: [2, 1], start: [0, 0],
          why: 'Knotenregel: î_R1 = î_R2 + î_C2 = (2 + j) A. Hängt man î_C2 an die Spitze von î_R2, kann man î_R1 direkt ablesen.',
          formula: '\\underline{\\hat{i}}_{R1} = \\underline{\\hat{i}}_{R2} + \\underline{\\hat{i}}_{C2} = (2+j)\\,\\text{A}' },
        { key: 'uR1', base: 'û', sub: 'R1', unit: 'V', color: 'green', v: [1, 0.5], start: [0, 0],
          why: 'û_R1 = R₁·î_R1 = 0.5 Ω · (2 + j) A = (1 + 0.5j) V. Ein Widerstand dreht nicht → û_R1 ist parallel zu î_R1, nur halb so lang.',
          formula: '\\underline{\\hat{u}}_{R1} = R_1\\,\\underline{\\hat{i}}_{R1} = (1 + 0.5j)\\,\\text{V}',
          wrong: { len: 'Richtung stimmt (parallel zu î_R1) — aber mal R₁ = 0.5 Ω heisst halbe Länge.' } },
      ],
      relations: [{ name: 'Knotenregel', parts: ['iR2', 'iC2'], total: 'iR1' }],
      steps: [
        { text: 'û_AB ist reell und liegt an R₂ UND an C₂ (Parallelschaltung) → mit ihr starten.' },
        { text: 'Beide Zweigströme mit î = û/Z:', formula: '\\underline{\\hat{i}}_{R2} = \\frac{1\\,\\text{V}}{0.5\\,\\Omega} = 2\\,\\text{A},\\qquad \\underline{\\hat{i}}_{C2} = j\\omega C_2\\cdot 1\\,\\text{V} = j\\,\\text{A}' },
        { text: 'Knotenregel als Vektoraddition: î_C2 an die Spitze von î_R2 hängen → das ergibt î_R1.' },
        { text: 'û_R1 = R₁·î_R1: gleiche Richtung wie î_R1, Länge mal 0.5.' },
      ],
      decoy: { v: [0, -1], start: [0, 0], why: 'Das wäre î_C2 mit falschem Vorzeichen (−j statt +j).' },
    },
    {
      id: 'fs21',
      tab: 'C ∥ RL-Zweig',
      source: 'FS 2021 · Aufgabe 4(e) · 2 P',
      level: 'Prüfungsniveau',
      intro: 'Zeichnen Sie die komplexen Zeiger der Grössen û₀, û_L, î₀ und î_L. (In der Prüfung wurden die Werte in Teilaufgabe (d) vorher berechnet — hier musst du sie selbst bestimmen.)',
      given: [['û₀', '6 V (reell)'], ['R₁', '1 Ω'], ['R₂', '2 Ω'], ['ωL', '3 Ω'], ['ωC', '1 S']],
      range: 6, grid: 1, snap: 0.5,
      schematic: () => svgWrap(
        S.wire([[40, 97], [40, 40], [280, 40], [280, 180], [40, 180], [40, 123]])
        + S.wire([[120, 40], [120, 180]])
        + S.src(40, 110) + S.C(120, 110, true) + S.R(200, 40) + S.R(200, 180) + S.L(280, 110, true)
        + S.dot(120, 40) + S.dot(120, 180)
        + `<text x="102" y="114" class="zb-t" text-anchor="end">C</text><text x="200" y="26" class="zb-t" text-anchor="middle">R₁</text><text x="200" y="166" class="zb-t" text-anchor="middle">R₂</text><text x="268" y="114" class="zb-t" text-anchor="end">L</text>`
        + S.arr(14, 92, 14, 128, colorVar.mute, svgLabel('û', '0'), 12, 150)
        + S.arr(60, 30, 90, 30, colorVar.amber, svgLabel('î', '0'), 75, 22)
        + S.arr(236, 30, 264, 30, colorVar.red, svgLabel('î', 'L'), 250, 22)
        + S.arr(310, 92, 310, 128, colorVar.violet, svgLabel('û', 'L'), 318, 114, 'start')
        + S.arr(132, 132, 132, 156, colorVar.cyan, svgLabel('î', 'C'), 138, 150, 'start')
      ),
      fixed: [],
      arrows: [
        { key: 'u0', base: 'û', sub: '0', unit: 'V', color: 'mute', v: [6, 0], start: [0, 0],
          why: 'Die Quellenspannung ist reell gegeben: û₀ = 6 V auf der reellen Achse — sie ist die Referenz.',
          formula: '\\underline{\\hat{u}}_0 = 6\\,\\text{V}' },
        { key: 'uL', base: 'û', sub: 'L', unit: 'V', color: 'violet', v: [3, 3], start: [0, 0],
          why: 'Spannungsteiler im RL-Zweig. C liegt parallel zur Quelle und spielt für û_L keine Rolle („C ist ein Irrelefant“ — Originalzitat Musterlösung).',
          formula: '\\underline{\\hat{u}}_L = \\frac{j\\omega L}{R_1+R_2+j\\omega L}\\,\\underline{\\hat{u}}_0 = \\frac{3j}{3+3j}\\cdot 6\\,\\text{V} = (3+3j)\\,\\text{V}',
          wrong: { len: 'Betrag prüfen: |3j/(3+3j)| = 3/(3√2) = 1/√2 → |û_L| = 6/√2 ≈ 4.24 V.' } },
        { key: 'iL', base: 'î', sub: 'L', unit: 'A', color: 'red', v: [1, -1], start: [0, 0],
          why: 'î_L = û_L / (jωL) = (3 + 3j)/(3j) A = (1 − j) A. Probe: An der Spule hinkt der Strom der Spannung um 90° hinterher — î_L steht senkrecht auf û_L, im Uhrzeigersinn.',
          formula: '\\underline{\\hat{i}}_L = \\frac{\\underline{\\hat{u}}_L}{j\\omega L} = \\frac{3+3j}{3j}\\,\\text{A} = (1-j)\\,\\text{A}',
          wrong: { rot: 'Durch j teilen dreht um −90°: î_L muss im Uhrzeigersinn senkrecht auf û_L stehen.', conj: 'Typischer Fehler: 1/j = +j gesetzt. Richtig ist 1/j = −j, also (3+3j)/(3j) = (3+3j)·(−j)/3.' } },
        { key: 'iC', base: 'î', sub: 'C', unit: 'A', color: 'cyan', v: [0, 6], start: [1, -1], optional: true,
          why: 'Hilfszeiger (in der Prüfung nicht verlangt, aber der schnellste Weg zu î₀): î_C = jωC·û₀ = j6 A — 90° vor û₀.',
          formula: '\\underline{\\hat{i}}_C = j\\omega C\\,\\underline{\\hat{u}}_0 = j\\,6\\,\\text{A}' },
        { key: 'i0', base: 'î', sub: '0', unit: 'A', color: 'amber', v: [1, 5], start: [0, 0],
          why: 'Knotenregel: î₀ = î_C + î_L = j6 + (1 − j) = (1 + 5j) A. Die Musterlösung rechnet über î₀ = û₀/Z_tot — gleiches Ergebnis, aber mehr Algebra.',
          formula: '\\underline{\\hat{i}}_0 = \\underline{\\hat{i}}_C + \\underline{\\hat{i}}_L = (1+5j)\\,\\text{A}' },
      ],
      relations: [{ name: 'Knotenregel', parts: ['iL', 'iC'], total: 'i0' }],
      steps: [
        { text: 'û₀ ist reell → Referenz auf der reellen Achse.' },
        { text: 'Der RL-Zweig liegt direkt an û₀ → Spannungsteiler für û_L.', formula: '\\underline{\\hat{u}}_L = \\frac{3j}{3+3j}\\cdot 6\\,\\text{V} = \\frac{j}{1+j}\\cdot 6\\,\\text{V} = \\frac{1+j}{2}\\cdot 6\\,\\text{V}' },
        { text: 'î_L = û_L/(jωL): durch j teilen heisst um −90° drehen.' },
        { text: 'Trick für î₀: nicht über Z_tot, sondern Knotenregel mit dem Kondensatorstrom î_C = jωC·û₀.', formula: '\\underline{\\hat{i}}_0 = j6 + (1-j) = (1+5j)\\,\\text{A}' },
      ],
      decoy: { v: [3, -3], start: [0, 0], why: 'Das wäre û_L an der reellen Achse gespiegelt (Vorzeichenfehler im Imaginärteil).' },
    },
    {
      id: 'fs24',
      tab: 'RLC rückwärts',
      source: 'FS 2024 · Aufgabe 4 · 2.5 P',
      level: 'Schwer',
      intro: 'Zeichnen Sie ein Zeigerdiagramm der Grössen î, û_C, û_R, û_L und û_in, wobei û_out = 10 V (über R und L) gegeben ist.',
      given: [['R', '5 Ω'], ['ωL', '5 Ω'], ['1/(ωC)', '6 Ω'], ['û_out', '10 V (reell, Referenz)']],
      range: 10, grid: 2, snap: 1,
      schematic: () => svgWrap(
        S.wire([[40, 97], [40, 40], [270, 40], [270, 180], [40, 180], [40, 123]])
        + S.src(40, 110) + S.C(140, 40) + S.R(270, 82, true) + S.L(270, 140, true)
        + `<text x="140" y="22" class="zb-t" text-anchor="middle">C</text><text x="258" y="86" class="zb-t" text-anchor="end">R</text><text x="258" y="144" class="zb-t" text-anchor="end">L</text>`
        + S.arr(14, 92, 14, 128, colorVar.green, svgLabel('û', 'in'), 12, 150)
        + S.arr(70, 30, 100, 30, colorVar.amber, svgLabel('î'), 85, 22)
        + S.arr(122, 60, 158, 60, colorVar.cyan, svgLabel('û', 'C'), 140, 78)
        + S.arr(292, 66, 292, 98, colorVar.red, svgLabel('û', 'R'), 298, 86, 'start')
        + S.arr(292, 124, 292, 156, colorVar.violet, svgLabel('û', 'L'), 298, 144, 'start')
        + S.arr(338, 56, 338, 164, colorVar.mute, svgLabel('û', 'out'), 336, 200, 'end')
      ),
      fixed: [{ key: 'uout', base: 'û', sub: 'out', v: [10, 0], start: [0, 0], unit: 'V' }],
      arrows: [
        { key: 'i', base: 'î', sub: '', unit: 'A', color: 'amber', v: [1, -1], start: [0, 0],
          why: 'Rückwärts rechnen: û_out liegt über R und L in Serie → î = û_out/(R + jωL) = 10/(5 + 5j) A = (1 − j) A. Derselbe Strom fliesst durch alle drei Bauteile.',
          formula: '\\underline{\\hat{i}} = \\frac{\\underline{\\hat{u}}_{out}}{R + j\\omega L} = \\frac{10}{5+5j}\\,\\text{A} = (1-j)\\,\\text{A}' },
        { key: 'uR', base: 'û', sub: 'R', unit: 'V', color: 'red', v: [5, -5], start: [0, 0],
          why: 'û_R = R·î = 5 Ω·(1 − j) A = (5 − 5j) V — parallel zu î.',
          formula: '\\underline{\\hat{u}}_R = R\\,\\underline{\\hat{i}} = (5-5j)\\,\\text{V}' },
        { key: 'uL', base: 'û', sub: 'L', unit: 'V', color: 'violet', v: [5, 5], start: [5, -5],
          why: 'û_L = jωL·î = j5·(1 − j) V = (5 + 5j) V — 90° vor î. Probe: û_R + û_L = 10 V = û_out ✓',
          formula: '\\underline{\\hat{u}}_L = j\\omega L\\,\\underline{\\hat{i}} = j5(1-j)\\,\\text{V} = (5+5j)\\,\\text{V}' },
        { key: 'uC', base: 'û', sub: 'C', unit: 'V', color: 'cyan', v: [-6, -6], start: [10, 0],
          why: 'û_C = î/(jωC) = −j6·(1 − j) V = (−6 − 6j) V — 90° hinter î.',
          formula: '\\underline{\\hat{u}}_C = \\frac{\\underline{\\hat{i}}}{j\\omega C} = -j6\\,(1-j)\\,\\text{V} = (-6-6j)\\,\\text{V}',
          wrong: { flip: 'Vorzeichen prüfen: −j·(−j) = j² = −1, also −j6·(1 − j) = −6j + 6j² = −6 − 6j.' } },
        { key: 'uin', base: 'û', sub: 'in', unit: 'V', color: 'green', v: [4, -6], start: [0, 0],
          why: 'Masche: û_in = û_C + û_R + û_L = (−6 − 6j) + 10 = (4 − 6j) V. Am einfachsten: û_C an die Spitze von û_out hängen.',
          formula: '\\underline{\\hat{u}}_{in} = \\underline{\\hat{u}}_C + \\underline{\\hat{u}}_{out} = (4-6j)\\,\\text{V}' },
      ],
      relations: [{ name: 'Maschenregel', parts: ['uR', 'uL', 'uC'], total: 'uin' }],
      steps: [
        { text: 'Gegeben ist nicht der Strom, sondern û_out (über R und L). Also zuerst rückwärts den Strom bestimmen.', formula: '\\underline{\\hat{i}} = \\frac{10}{5+5j}\\,\\text{A} = \\frac{10(5-5j)}{50}\\,\\text{A} = (1-j)\\,\\text{A}' },
        { text: 'Dann alle Teilspannungen mit û = Z·î. Kontrolle: û_R + û_L muss wieder û_out = 10 V ergeben.' },
        { text: 'û_C = −j6·î: î um −90° drehen und auf 6·|î| strecken.' },
        { text: 'Kette û_R → û_L → û_C Kopf an Schwanz: der Pfeil vom Ursprung zur Spitze ist û_in.' },
      ],
      decoy: { v: [6, 6], start: [0, 0], why: 'Das wäre û_C mit falschem Vorzeichen (+j6 statt −j6).' },
    },
  ];

  // ---------- Seiten-CSS (einmalig) ----------
  function injectCSS() {
    if (document.getElementById('zb-style')) return;
    const css = `
.zb-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0 14px}
.zb-tab{font-family:var(--sans);font-size:12.5px;font-weight:600;background:var(--panel-2);color:var(--fg-dim);border:1px solid var(--line-2);padding:7px 12px;border-radius:7px;cursor:pointer}
.zb-tab.active{background:var(--c2);color:#04202b;border-color:var(--c2)}
.zb-tab small{font-weight:500;opacity:.75;margin-left:6px}
.zb-grid{display:grid;grid-template-columns:minmax(260px,0.85fr) 1.15fr;gap:14px;align-items:start}
@media (max-width:900px){.zb-grid{grid-template-columns:1fr}}
.zb-card{background:var(--bg);border:1px solid var(--line);border-radius:9px;padding:12px 14px}
.zb-svg{width:100%;height:auto;color:var(--fg);display:block}
.zb-t{font:13px var(--sans);fill:currentColor}
.zb-src{font:11px var(--mono);color:var(--fg-mute);margin-bottom:4px}
.zb-intro{font-size:14px;margin:6px 0 10px}
.zb-given{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.zb-given span{font:12px var(--mono);background:var(--panel-2);border:1px solid var(--line);border-radius:6px;padding:3px 8px;color:var(--fg-dim)}
.zb-given b{color:var(--fg);font-weight:600}
.zb-chips{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.zb-chip{font-family:var(--sans);font-size:13px;font-weight:600;background:var(--panel-2);color:var(--fg);border:2px solid var(--line-2);padding:5px 11px;border-radius:999px;cursor:pointer;display:inline-flex;gap:6px;align-items:center}
.zb-chip .zb-dot{width:9px;height:9px;border-radius:50%}
.zb-chip.sel{box-shadow:0 0 0 2px var(--fg) inset}
.zb-chip.done::after{content:'✓';font-size:11px;color:var(--fg-mute)}
.zb-chip.opt{border-style:dashed}
.zb-q{white-space:nowrap}.zb-u{text-decoration:underline}
.zb-q sub{font-size:.72em}
.zb-canvas{touch-action:none;cursor:crosshair}
.zb-live{font:12px var(--mono);color:var(--fg-dim);min-height:18px;margin-top:6px}
.zb-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.zb-fb{margin-top:12px;display:flex;flex-direction:column;gap:8px}
.zb-item{border:1px solid var(--line);border-left:4px solid var(--line-2);border-radius:8px;padding:9px 12px;background:var(--bg);font-size:13.5px}
.zb-item.ok{border-left-color:var(--ok)}.zb-item.bad{border-left-color:var(--bad)}.zb-item.half{border-left-color:var(--warn)}.zb-item.info{border-left-color:var(--c2)}
.zb-item .zb-h{font-weight:700;margin-bottom:3px}
.zb-item .zb-why{color:var(--fg-dim);margin-top:4px}
.zb-item .formula{margin:6px 0 0}
.zb-score{font:600 14px var(--sans)}
.zb-steps{margin:8px 0 0;padding-left:20px}.zb-steps li{margin:6px 0;font-size:13.5px}
.zb-match{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:8px;margin-top:10px}
.zb-match label{display:flex;justify-content:space-between;align-items:center;gap:8px;background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:7px 10px;font-size:13.5px}
.zb-match select{font:13px var(--sans);background:var(--panel-2);color:var(--fg);border:1px solid var(--line-2);border-radius:6px;padding:3px 6px}
.zb-mode{display:inline-flex;border:1px solid var(--line-2);border-radius:8px;overflow:hidden;margin-left:auto}
.zb-mode button{font:600 12.5px var(--sans);background:var(--panel-2);color:var(--fg-dim);border:0;padding:7px 12px;cursor:pointer}
.zb-mode button.active{background:var(--c1);color:#1a1206}
`;
    document.head.appendChild(el('style', { id: 'zb-style' }, css));
  }

  // ---------- Seite ----------
  window.PAGES = window.PAGES || [];
  window.PAGES.push({
    id: 'zeiger-baukasten',
    category: 'Wechselstrom',
    order: 6.5,
    num: '4.1b',
    week: 'Woche 11',
    formelsammlung: 'Kap. 6 „Wechselstrom", S. 13–14',
    navTitle: 'Zeiger-Baukasten',
    title: 'Zeiger-Baukasten: Zeigerdiagramme selbst zeichnen',
    subtitle: 'In fast jeder Prüfung gibt es 2–2.5 Punkte fürs Zeichnen eines Zeigerdiagramms. Hier zeichnest du die Pfeile selbst ins Raster — und bekommst gesagt, was genau falsch ist.',
    teaser: 'Pfeile selbst einzeichnen, kontrollieren lassen, Fehler erklärt bekommen — mit vier echten Prüfungsaufgaben.',

    render(container) {
      injectCSS();

      container.appendChild(el('div', { class: 'callout warn' }, [
        el('span', { class: 'callout-label' }, 'Warum das schwer ist'),
        el('p', {}, 'Die komplexe Rechnung ist „nur Mathe“. Beim Zeichnen muss man aber wissen, was j geometrisch macht (Drehung um +90°), was 1/j macht (−90°), dass ein Widerstand gar nicht dreht — und dass Knoten- und Maschenregel hier zu Vektoradditionen werden. Genau diese Übersetzung zwischen Formel und Bild wird geprüft.'),
      ]));

      container.appendChild(el('h2', {}, [el('span', { class: 'h2-num' }, '1 ·'), 'Baukasten']));
      container.appendChild(el('p', {}, [
        'Wähle eine Aufgabe, dann oben eine Grösse und ', el('strong', {}, 'ziehe den Pfeil ins Raster'),
        ' (er rastet ein). Spitze ziehen = Pfeil ändern, Mitte ziehen = Pfeil verschieben. ',
        el('strong', {}, 'Wo ein Pfeil anfängt, ist egal'), ' — bewertet werden nur Betrag und Richtung, genau wie in der Prüfung.',
      ]));

      const panel = el('div', { class: 'sim-panel' });
      container.appendChild(panel);

      // Kopfzeile: Aufgaben-Tabs + Modus
      const head = el('div', { class: 'sim-toolbar' });
      const tabs = el('div', { class: 'zb-tabs', style: 'margin:0' });
      head.appendChild(tabs);
      const modeBox = el('div', { class: 'zb-mode' });
      const btnDraw = el('button', { type: 'button', class: 'active' }, '✏️ Zeichnen');
      const btnMatch = el('button', { type: 'button' }, '🔢 Zuordnen');
      modeBox.appendChild(btnDraw); modeBox.appendChild(btnMatch);
      head.appendChild(modeBox);
      panel.appendChild(head);

      const grid = el('div', { class: 'zb-grid' });
      panel.appendChild(grid);
      const left = el('div', { class: 'zb-card' });
      const right = el('div');
      grid.appendChild(left); grid.appendChild(right);

      const chips = el('div', { class: 'zb-chips', style: 'margin-bottom:10px' });
      right.appendChild(chips);
      const wrap = el('div', { class: 'sim-canvas-wrap' });
      const canvas = el('canvas', { class: 'zb-canvas' });
      wrap.appendChild(canvas);
      right.appendChild(wrap);
      const live = el('div', { class: 'zb-live' });
      right.appendChild(live);
      const actions = el('div', { class: 'zb-actions' });
      right.appendChild(actions);
      const matchBox = el('div');
      right.appendChild(matchBox);
      const fb = el('div', { class: 'zb-fb' });
      panel.appendChild(fb);

      const H = 440;
      const ctx = setupCanvas(canvas, H);

      // ---------- Zustand ----------
      const st = {
        task: TASKS[0], mode: 'draw', sel: null, drawn: {}, drag: null,
        showSol: false, showChain: false, hintN: 0, checked: false,
        numbering: [], matchAnswers: {}, matchChecked: false,
      };
      const byKey = (k) => st.task.arrows.find((a) => a.key === k);

      // ---------- Geometrie ----------
      function geom() {
        const W = cssW(canvas);
        const m = 34;
        const side = Math.min(W - 2 * m, H - 2 * m);
        const t = st.task;
        return { W, ox: W / 2, oy: H / 2, s: side / (2 * t.range), half: side / 2 };
      }
      const toPx = (g, p) => [g.ox + p[0] * g.s, g.oy - p[1] * g.s];
      const fromPx = (g, x, y) => [(x - g.ox) / g.s, (g.oy - y) / g.s];
      const snap = (v) => { const q = st.task.snap; const r = st.task.range; return Math.max(-r, Math.min(r, Math.round(v / q) * q)); };

      // ---------- Zeichnen ----------
      function drawLabel(x, y, q, color) {
        ctx.save();
        ctx.font = '600 14px ' + getComputedStyle(document.body).fontFamily;
        ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        const w = ctx.measureText(q.base).width;
        ctx.font = '600 10.5px ' + getComputedStyle(document.body).fontFamily;
        const ws = q.sub ? ctx.measureText(q.sub).width : 0;
        const x0 = x - (w + ws) / 2;
        // Hintergrund für Lesbarkeit
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#000';
        ctx.globalAlpha = 0.8; ctx.fillRect(x0 - 3, y - 10, w + ws + 6, 22); ctx.globalAlpha = 1;
        ctx.fillStyle = color;
        ctx.font = '600 14px ' + getComputedStyle(document.body).fontFamily;
        ctx.fillText(q.base, x0, y);
        ctx.strokeStyle = color; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(x0, y + 8); ctx.lineTo(x0 + w, y + 8); ctx.stroke();
        if (q.sub) { ctx.font = '600 10.5px ' + getComputedStyle(document.body).fontFamily; ctx.fillText(q.sub, x0 + w + 1, y + 5); }
        ctx.restore();
      }
      function labelPos(g, s, e) {
        const [x1, y1] = toPx(g, s), [x2, y2] = toPx(g, e);
        const mx = x1 + (x2 - x1) * 0.6, my = y1 + (y2 - y1) * 0.6;
        const len = Math.hypot(x2 - x1, y2 - y1) || 1;
        const nx = -(y2 - y1) / len, ny = (x2 - x1) / len;
        return [mx + nx * 14, my + ny * 14];
      }
      function vec(g, s, e, color, width, dashed) {
        const [x1, y1] = toPx(g, s), [x2, y2] = toPx(g, e);
        if (Math.hypot(x2 - x1, y2 - y1) < 2) return;
        ctx.save();
        if (dashed) { ctx.setLineDash([6, 5]); ctx.globalAlpha = 0.75; }
        ctx.strokeStyle = color; ctx.lineWidth = width;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.setLineDash([]);
        drawArrowHead(ctx, x2, y2, Math.atan2(y2 - y1, x2 - x1), 7 + width, color);
        ctx.restore();
      }

      function draw() {
        if (!canvas.isConnected) return;
        const g = geom();
        const t = st.task;
        ctx.clearRect(0, 0, g.W, H);
        // Raster
        const x0 = g.ox - g.half, y0 = g.oy - g.half, sz = 2 * g.half;
        ctx.save();
        ctx.strokeStyle = COLORS.line; ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        for (let v = -t.range + t.grid / 2; v < t.range; v += t.grid) {
          const [px] = toPx(g, [v, 0]); const [, py] = toPx(g, [0, v]);
          ctx.beginPath(); ctx.moveTo(px, y0); ctx.lineTo(px, y0 + sz); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x0, py); ctx.lineTo(x0 + sz, py); ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.strokeStyle = COLORS.mute; ctx.globalAlpha = 0.45;
        for (let v = -t.range; v <= t.range + 1e-9; v += t.grid) {
          const [px] = toPx(g, [v, 0]); const [, py] = toPx(g, [0, v]);
          ctx.beginPath(); ctx.moveTo(px, y0); ctx.lineTo(px, y0 + sz); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x0, py); ctx.lineTo(x0 + sz, py); ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.strokeStyle = COLORS.dim; ctx.lineWidth = 1.4;
        drawArrow(ctx, x0 - 6, g.oy, x0 + sz + 14, g.oy, COLORS.dim, 1.4);
        drawArrow(ctx, g.ox, y0 + sz + 6, g.ox, y0 - 14, COLORS.dim, 1.4);
        ctx.fillStyle = COLORS.dim; ctx.font = '11px ui-monospace, monospace';
        const lstep = t.range / t.grid > 6 ? 2 * t.grid : t.grid;
        const nTicks = Math.round(t.range / lstep);
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        for (let i = -nTicks; i <= nTicks; i++) {
          const [px] = toPx(g, [i * lstep, 0]); ctx.fillText(nfmt(i * lstep), px, y0 + sz + 6);
        }
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        for (let i = -nTicks; i <= nTicks; i++) {
          if (i === 0) continue;
          const [, py] = toPx(g, [0, i * lstep]); ctx.fillText(nfmt(i * lstep), x0 - 6, py);
        }
        ctx.textAlign = 'left';
        ctx.fillText('Re(û, î)', x0 + sz - 52, g.oy - 12);
        ctx.fillText('Im(û, î)', g.ox + 8, y0 - 8);
        ctx.restore();

        // gegebene Zeiger
        for (const f of t.fixed) {
          const e = [f.start[0] + f.v[0], f.start[1] + f.v[1]];
          vec(g, f.start, e, COLORS.fg, 2.2);
          const [lx, ly] = labelPos(g, f.start, e); drawLabel(lx, ly, f, COLORS.fg);
        }

        if (st.mode === 'draw') {
          // Lösung (gestrichelt)
          if (st.showSol) {
            for (const a of t.arrows) {
              const e = [a.start[0] + a.v[0], a.start[1] + a.v[1]];
              vec(g, a.start, e, COLORS[a.color], 2, true);
            }
          }
          // eigene Pfeile
          for (const a of t.arrows) {
            const d = st.drawn[a.key]; if (!d) continue;
            const w = st.sel === a.key ? 3.4 : 2.6;
            vec(g, d.s, d.e, COLORS[a.color], w);
            const [lx, ly] = labelPos(g, d.s, d.e); drawLabel(lx, ly, a, COLORS[a.color]);
            if (st.sel === a.key) {
              const [tx, ty] = toPx(g, d.e);
              ctx.save(); ctx.strokeStyle = COLORS[a.color]; ctx.globalAlpha = 0.4; ctx.lineWidth = 1.5;
              ctx.beginPath(); ctx.arc(tx, ty, 11, 0, 2 * Math.PI); ctx.stroke(); ctx.restore();
            }
          }
          // Kopf-an-Schwanz-Probe
          if (st.showChain) {
            for (const rel of t.relations) {
              let p = [0, 0];
              for (const k of rel.parts) {
                const d = st.drawn[k]; if (!d) continue;
                const v = [d.e[0] - d.s[0], d.e[1] - d.s[1]];
                const q = [p[0] + v[0], p[1] + v[1]];
                vec(g, p, q, COLORS.mute, 1.6, true);
                p = q;
              }
              const [px, py] = toPx(g, p);
              ctx.save(); ctx.fillStyle = COLORS.fg; ctx.beginPath(); ctx.arc(px, py, 4, 0, 2 * Math.PI); ctx.fill(); ctx.restore();
            }
          }
        } else {
          // Zuordnen: alle Zeiger nummeriert, einfarbig
          for (const n of st.numbering) {
            const e = [n.start[0] + n.v[0], n.start[1] + n.v[1]];
            const col = st.matchChecked && n.key ? COLORS[byKey(n.key).color] : COLORS.amber;
            vec(g, n.start, e, col, 2.4);
            const [lx, ly] = labelPos(g, n.start, e);
            ctx.save();
            ctx.fillStyle = col; ctx.beginPath(); ctx.arc(lx, ly, 10, 0, 2 * Math.PI); ctx.fill();
            ctx.fillStyle = '#111'; ctx.font = '700 12px ui-monospace, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(String(n.num), lx, ly + 0.5);
            ctx.restore();
          }
        }
        requestAnimationFrame(draw);
      }

      // ---------- Interaktion (Zeichnen) ----------
      function pt(ev) {
        const r = canvas.getBoundingClientRect();
        return [ev.clientX - r.left, ev.clientY - r.top];
      }
      function distSeg(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1, dy = y2 - y1, L2 = dx * dx + dy * dy || 1;
        const u = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / L2));
        return Math.hypot(px - (x1 + u * dx), py - (y1 + u * dy));
      }
      canvas.addEventListener('pointerdown', (ev) => {
        if (st.mode !== 'draw') return;
        const g = geom(); const [x, y] = pt(ev);
        const p = fromPx(g, x, y).map(snap);
        // 0) Gewählte Grösse noch nicht gezeichnet → immer neuer Pfeil (auch an der Spitze
        //    eines anderen Pfeils — genau das braucht man für Kopf-an-Schwanz).
        if (st.sel && !st.drawn[st.sel]) {
          st.drawn[st.sel] = { s: p, e: p.slice() };
          st.drag = { mode: 'new', key: st.sel };
          canvas.setPointerCapture(ev.pointerId);
          return;
        }
        // 1) Spitze greifen
        for (const a of st.task.arrows) {
          const d = st.drawn[a.key]; if (!d) continue;
          const [tx, ty] = toPx(g, d.e);
          if (Math.hypot(tx - x, ty - y) < 13) { st.sel = a.key; st.drag = { mode: 'tip', key: a.key }; canvas.setPointerCapture(ev.pointerId); refreshChips(); return; }
        }
        // 2) Pfeil verschieben
        for (const a of st.task.arrows) {
          const d = st.drawn[a.key]; if (!d) continue;
          const [x1, y1] = toPx(g, d.s), [x2, y2] = toPx(g, d.e);
          if (distSeg(x, y, x1, y1, x2, y2) < 8) {
            st.sel = a.key;
            st.drag = { mode: 'move', key: a.key, from: p, s0: d.s.slice(), e0: d.e.slice() };
            canvas.setPointerCapture(ev.pointerId); refreshChips(); return;
          }
        }
        // 3) neuer Pfeil
        if (!st.sel) { live.textContent = '← Wähle zuerst oben eine Grösse aus.'; return; }
        st.drawn[st.sel] = { s: p, e: p.slice() };
        st.drag = { mode: 'new', key: st.sel };
        canvas.setPointerCapture(ev.pointerId);
      });
      canvas.addEventListener('pointermove', (ev) => {
        const g = geom(); const [x, y] = pt(ev);
        const p = fromPx(g, x, y).map(snap);
        if (!st.drag) {
          if (st.mode === 'draw') live.innerHTML = `Cursor: (${nfmt(p[0])} ${p[1] < 0 ? '−' : '+'} j${nfmt(Math.abs(p[1]))})`;
          return;
        }
        const d = st.drawn[st.drag.key];
        if (st.drag.mode === 'new' || st.drag.mode === 'tip') d.e = p;
        else {
          const dx = p[0] - st.drag.from[0], dy = p[1] - st.drag.from[1];
          d.s = [snap(st.drag.s0[0] + dx), snap(st.drag.s0[1] + dy)];
          d.e = [snap(st.drag.e0[0] + dx), snap(st.drag.e0[1] + dy)];
        }
        showLive(st.drag.key);
      });
      function endDrag() {
        if (!st.drag) return;
        const k = st.drag.key, d = st.drawn[k], wasNew = st.drag.mode === 'new';
        st.drag = null;
        if (d && d.s[0] === d.e[0] && d.s[1] === d.e[1]) { delete st.drawn[k]; refreshChips(); return; }
        if (wasNew) {
          // automatisch zur nächsten noch fehlenden Grösse
          const next = st.task.arrows.find((a) => !st.drawn[a.key] && !a.optional);
          if (next) st.sel = next.key;
        }
        refreshChips();
      }
      canvas.addEventListener('pointerup', endDrag);
      canvas.addEventListener('pointercancel', endDrag);

      function showLive(key) {
        const a = byKey(key), d = st.drawn[key];
        if (!a || !d) { live.textContent = ''; return; }
        const v = [d.e[0] - d.s[0], d.e[1] - d.s[1]];
        live.innerHTML = `${qHTML(a)} = (${cfmt(v[0], v[1])}) ${a.unit} · Betrag ${nfmt(Math.hypot(v[0], v[1]))} · Winkel ${nfmt(Math.round(deg(Math.atan2(v[1], v[0]))))}°`;
      }

      // ---------- Kontrolle (Zeichnen) ----------
      function judge(a) {
        const d = st.drawn[a.key];
        if (!d) return { state: 'missing', pts: 0 };
        const v = [d.e[0] - d.s[0], d.e[1] - d.s[1]];
        const tv = a.v, tol = st.task.snap * 0.75;
        const len = Math.hypot(v[0], v[1]), tlen = Math.hypot(tv[0], tv[1]);
        const dAng = wrap180(deg(Math.atan2(v[1], v[0]) - Math.atan2(tv[1], tv[0])));
        const angOk = Math.abs(dAng) < 6;
        const lenOk = Math.abs(len - tlen) <= tol;
        const moved = Math.hypot(d.s[0], d.s[1]) > 1e-9;
        const notes = [];
        if (angOk && lenOk) {
          if (moved) notes.push('Nicht im Ursprung gezeichnet — erlaubt: Ein Zeiger ist nur durch Betrag und Winkel festgelegt.');
          return { state: 'ok', pts: 0.5, v, notes };
        }
        const conj = Math.abs(tv[1]) > 1e-9 && Math.hypot(v[0] - tv[0], v[1] + tv[1]) <= tol;
        if (conj) {
          notes.push('An der reellen Achse gespiegelt: Der Imaginärteil hat das falsche Vorzeichen.');
          if (a.wrong && a.wrong.conj) notes.push(a.wrong.conj);
        } else if (Math.abs(Math.abs(dAng) - 180) < 8) {
          notes.push('Zeigt genau in die Gegenrichtung (Faktor −1): Vorzeichen oder Zählpfeilrichtung prüfen.');
          if (a.wrong && a.wrong.flip) notes.push(a.wrong.flip);
        } else if (Math.abs(Math.abs(dAng) - 90) < 8) {
          notes.push(`Um 90° ${dAng > 0 ? 'zu weit gegen den Uhrzeigersinn' : 'zu weit im Uhrzeigersinn'} gedreht — ein j zu viel oder zu wenig, bzw. j und 1/j verwechselt.`);
          if (a.wrong && a.wrong.rot) notes.push(a.wrong.rot);
        } else if (!angOk) {
          notes.push(`Richtung um ${Math.round(Math.abs(dAng))}° daneben. Real- und Imaginärteil einzeln nachrechnen.`);
        }
        if (angOk && !lenOk) {
          const r = len / tlen;
          notes.push(`Richtung stimmt ✓, aber die Länge ist ${nfmt(len)} statt ${nfmt(tlen)}${Math.abs(r - 2) < 0.15 || Math.abs(r - 0.5) < 0.08 ? ' (genau Faktor ' + (r > 1 ? '2 zu lang' : '2 zu kurz') + ')' : ''}.`);
          if (a.wrong && a.wrong.len) notes.push(a.wrong.len);
          else notes.push('Betrag nachrechnen: |a + jb| = √(a² + b²).');
        } else if (!angOk && lenOk) {
          notes.push('Die Länge stimmt ✓.');
        }
        return { state: angOk || lenOk ? 'half' : 'bad', pts: (angOk ? 0.25 : 0) + (lenOk ? 0.25 : 0), v, notes };
      }

      function check() {
        st.checked = true;
        fb.innerHTML = '';
        const t = st.task;
        let pts = 0, max = 0;
        const items = [];
        for (const a of t.arrows) {
          const j = judge(a);
          if (!a.optional) { pts += j.pts; max += 0.5; }
          const box = el('div', { class: 'zb-item ' + (j.state === 'ok' ? 'ok' : j.state === 'half' ? 'half' : j.state === 'missing' ? (a.optional ? 'info' : 'bad') : 'bad') });
          const status = j.state === 'ok' ? '✓ richtig' : j.state === 'missing' ? (a.optional ? '○ optional, nicht gezeichnet' : '✗ fehlt') : j.state === 'half' ? '≈ teilweise' : '✗ falsch';
          box.appendChild(el('div', { class: 'zb-h', html: `${qHTML(a)} — ${status}${a.optional ? ' <span style="font-weight:500;color:var(--fg-mute)">(Hilfszeiger, zählt nicht)</span>' : ` <span style="font-weight:500;color:var(--fg-mute)">(${nfmt(j.pts)} / 0.5 P)</span>`}` }));
          if (j.notes && j.notes.length) box.appendChild(el('div', {}, j.notes.join(' ')));
          if (j.state !== 'ok' && !(j.state === 'missing' && a.optional)) {
            box.appendChild(el('div', { class: 'zb-why' }, 'So geht’s: ' + a.why));
            box.appendChild(formulaBlock(a.formula));
          }
          items.push(box);
        }
        fb.appendChild(el('div', { class: 'zb-score' }, `Punkte: ${nfmt(pts)} / ${nfmt(max)}  ${pts === max ? '🎉 volle Punktzahl' : ''}`));
        items.forEach((b) => fb.appendChild(b));
        fb.appendChild(el('div', { class: 'note', style: 'margin-top:2px' }, 'Bewertung wie in der Musterlösung: 0.5 P pro Zeiger, je 0.25 P für Richtung und Länge. Die Beschriftung ist hier automatisch — in der Prüfung gibt es ohne Beschriftung keine Punkte!'));
      }

      function chainCheck() {
        st.showChain = !st.showChain;
        btnChain.classList.toggle('active', st.showChain);
        if (!st.showChain) return;
        fb.innerHTML = '';
        for (const rel of st.task.relations) {
          const missing = rel.parts.concat([rel.total]).filter((k) => !st.drawn[k]);
          const names = (ks) => ks.map((k) => qHTML(byKey(k))).join(' + ');
          if (missing.length) {
            fb.appendChild(el('div', { class: 'zb-item info', html: `<div class="zb-h">${rel.name}: ${qHTML(byKey(rel.total))} = ${names(rel.parts)}</div>Dafür fehlen noch: ${missing.map((k) => qHTML(byKey(k))).join(', ')}.` }));
            continue;
          }
          let sum = [0, 0];
          for (const k of rel.parts) { const d = st.drawn[k]; sum = [sum[0] + d.e[0] - d.s[0], sum[1] + d.e[1] - d.s[1]]; }
          const dt = st.drawn[rel.total];
          const tv = [dt.e[0] - dt.s[0], dt.e[1] - dt.s[1]];
          const gap = Math.hypot(sum[0] - tv[0], sum[1] - tv[1]);
          const ok = gap <= st.task.snap * 0.75;
          fb.appendChild(el('div', {
            class: 'zb-item ' + (ok ? 'ok' : 'bad'),
            html: `<div class="zb-h">${rel.name}: ${qHTML(byKey(rel.total))} = ${names(rel.parts)}</div>`
              + `Gestrichelt siehst du deine Teilzeiger Kopf an Schwanz ab dem Ursprung; der Punkt markiert ihre Summe (${cfmt(sum[0], sum[1])}).<br>`
              + (ok ? '✓ Die Kette endet genau an der Spitze deines Summenzeigers — dein Diagramm ist in sich konsistent.'
                : `✗ Lücke von ${nfmt(gap)}: Teilzeiger und Summenzeiger passen nicht zusammen. Mindestens einer der Pfeile ist falsch — oder die Summe ist nicht vom Anfang zum Ende der Kette gezeichnet.`),
          }));
        }
        fb.appendChild(el('div', { class: 'note' }, 'Diese Probe prüft nur, ob dein Diagramm zusammenpasst — nicht, ob die einzelnen Werte stimmen. Dafür ist „Kontrollieren“ da.'));
      }

      function hint() {
        const t = st.task;
        st.hintN = Math.min(st.hintN + 1, t.steps.length);
        fb.innerHTML = '';
        const box = el('div', { class: 'zb-item info' });
        box.appendChild(el('div', { class: 'zb-h' }, `Tipp ${st.hintN} von ${t.steps.length}`));
        const ol = el('ol', { class: 'zb-steps' });
        t.steps.slice(0, st.hintN).forEach((s) => {
          const li = el('li', {}, s.text);
          if (s.formula) li.appendChild(formulaBlock(s.formula));
          ol.appendChild(li);
        });
        box.appendChild(ol);
        fb.appendChild(box);
        btnHint.textContent = st.hintN < t.steps.length ? `💡 Nächster Tipp (${st.hintN}/${t.steps.length})` : '💡 Alle Tipps';
      }

      // ---------- Zuordnen-Modus ----------
      function shuffleNumbering() {
        const t = st.task;
        const list = t.arrows.map((a) => ({ key: a.key, v: a.v, start: a.start }));
        list.push({ key: null, v: t.decoy.v, start: t.decoy.start });
        for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; }
        list.forEach((n, i) => { n.num = i + 1; });
        st.numbering = list; st.matchAnswers = {}; st.matchChecked = false;
      }
      function renderMatch() {
        matchBox.innerHTML = '';
        if (st.mode !== 'match') return;
        matchBox.appendChild(el('p', { class: 'note', style: 'margin:10px 0 0' }, `Prüfungsstil FS 26 / HS 25: Welcher Zeiger gehört zu welcher Grösse? Einer der ${st.numbering.length} Zeiger ist ein Köder.`));
        const g = el('div', { class: 'zb-match' });
        for (const a of st.task.arrows) {
          const sel = el('select', {});
          sel.appendChild(el('option', { value: '' }, '–'));
          st.numbering.forEach((n) => sel.appendChild(el('option', { value: String(n.num) }, 'Zeiger ' + n.num)));
          sel.value = st.matchAnswers[a.key] || '';
          sel.addEventListener('change', () => { st.matchAnswers[a.key] = sel.value; });
          const lab = el('label', {});
          lab.appendChild(el('span', { html: qHTML(a) + (a.optional ? ' <small style="color:var(--fg-mute)">(Hilfszeiger)</small>' : '') }));
          lab.appendChild(sel);
          g.appendChild(lab);
        }
        matchBox.appendChild(g);
      }
      function checkMatch() {
        st.matchChecked = true;
        fb.innerHTML = '';
        let right = 0;
        for (const a of st.task.arrows) {
          const n = st.numbering.find((x) => x.key === a.key);
          const ans = parseInt(st.matchAnswers[a.key], 10);
          const ok = ans === n.num;
          if (ok) right++;
          const box = el('div', { class: 'zb-item ' + (ok ? 'ok' : 'bad') });
          let txt = `<div class="zb-h">${qHTML(a)} — ${ok ? '✓ richtig' : `✗ ${isNaN(ans) ? 'keine Antwort' : 'Zeiger ' + ans + ' gewählt'}, richtig ist Zeiger ${n.num}`}</div>`;
          if (!ok && !isNaN(ans)) {
            const chosen = st.numbering.find((x) => x.num === ans);
            if (chosen && chosen.key === null) txt += `Zeiger ${ans} ist der Köder: ${st.task.decoy.why} `;
            else if (chosen) txt += `Zeiger ${ans} ist ${qHTML(byKey(chosen.key))}. `;
          }
          box.innerHTML = txt;
          if (!ok) { box.appendChild(el('div', { class: 'zb-why' }, a.why)); box.appendChild(formulaBlock(a.formula)); }
          fb.appendChild(box);
        }
        const dec = st.numbering.find((x) => x.key === null);
        fb.insertBefore(el('div', { class: 'zb-score' }, `${right} / ${st.task.arrows.length} richtig zugeordnet. Der Köder war Zeiger ${dec.num}: ${st.task.decoy.why}`), fb.firstChild);
      }

      // ---------- UI-Aufbau ----------
      const btnCheck = el('button', { class: 'btn primary', type: 'button' }, '✓ Kontrollieren');
      const btnChain = el('button', { class: 'btn', type: 'button' }, '⛓ Kopf-an-Schwanz-Probe');
      const btnHint = el('button', { class: 'btn', type: 'button' }, '💡 Tipp');
      const btnSol = el('button', { class: 'btn', type: 'button' }, '👁 Lösung einblenden');
      const btnDel = el('button', { class: 'btn', type: 'button' }, '⌫ Pfeil löschen');
      const btnReset = el('button', { class: 'btn', type: 'button' }, '↺ Neu');
      const btnShuffle = el('button', { class: 'btn', type: 'button' }, '🔀 Neu mischen');
      const btnCheckMatch = el('button', { class: 'btn primary', type: 'button' }, '✓ Kontrollieren');

      btnCheck.addEventListener('click', check);
      btnChain.addEventListener('click', chainCheck);
      btnHint.addEventListener('click', hint);
      btnSol.addEventListener('click', () => {
        st.showSol = !st.showSol; btnSol.classList.toggle('active', st.showSol);
        btnSol.textContent = st.showSol ? '👁 Lösung ausblenden' : '👁 Lösung einblenden';
      });
      btnDel.addEventListener('click', () => { if (st.sel) { delete st.drawn[st.sel]; refreshChips(); live.textContent = ''; } });
      btnReset.addEventListener('click', () => loadTask(st.task));
      btnShuffle.addEventListener('click', () => { shuffleNumbering(); renderMatch(); fb.innerHTML = ''; });
      btnCheckMatch.addEventListener('click', checkMatch);

      function renderActions() {
        actions.innerHTML = '';
        const list = st.mode === 'draw'
          ? [btnCheck, btnChain, btnHint, btnSol, btnDel, btnReset]
          : [btnCheckMatch, btnShuffle];
        list.forEach((b) => actions.appendChild(b));
      }

      function refreshChips() {
        chips.innerHTML = '';
        if (st.mode !== 'draw') { chips.appendChild(el('span', { class: 'note', style: 'margin:0' }, 'Zuordnen: Die Zeiger sind schon gezeichnet — nur die Beschriftung fehlt.')); return; }
        chips.appendChild(el('span', { class: 'note', style: 'margin:0 4px 0 0' }, 'Zeichnen:'));
        for (const a of st.task.arrows) {
          const c = el('button', {
            type: 'button',
            class: 'zb-chip' + (st.sel === a.key ? ' sel' : '') + (st.drawn[a.key] ? ' done' : '') + (a.optional ? ' opt' : ''),
            title: a.optional ? 'Hilfszeiger — nicht verlangt, hilft aber bei der Knotenregel' : '',
          });
          c.appendChild(el('span', { class: 'zb-dot', style: `background:${colorVar[a.color]}` }));
          c.appendChild(el('span', { html: qHTML(a) }));
          c.addEventListener('click', () => { st.sel = a.key; refreshChips(); showLive(a.key); });
          chips.appendChild(c);
        }
      }

      function renderLeft() {
        const t = st.task;
        left.innerHTML = '';
        left.appendChild(el('div', { class: 'zb-src' }, `${t.source} · ${t.level}`));
        left.appendChild(el('div', { html: t.schematic() }));
        left.appendChild(el('p', { class: 'zb-intro' }, t.intro));
        const gv = el('div', { class: 'zb-given' });
        t.given.forEach(([k, v]) => gv.appendChild(el('span', { html: `<b>${k}</b> = ${v}` })));
        left.appendChild(gv);
        if (t.fixed.length) left.appendChild(el('p', { class: 'note', style: 'margin:10px 0 0' }, 'Der ungefärbte Zeiger im Raster ist gegeben.'));
      }

      function renderTabs() {
        tabs.innerHTML = '';
        TASKS.forEach((t) => {
          const b = el('button', { type: 'button', class: 'zb-tab' + (t === st.task ? ' active' : '') });
          b.appendChild(document.createTextNode(t.tab));
          b.appendChild(el('small', {}, t.source.split(' · ')[0]));
          b.addEventListener('click', () => loadTask(t));
          tabs.appendChild(b);
        });
      }

      function loadTask(t) {
        st.task = t; st.drawn = {}; st.drag = null; st.showSol = false; st.showChain = false;
        st.hintN = 0; st.checked = false;
        st.sel = t.arrows[0].key;
        btnSol.classList.remove('active'); btnSol.textContent = '👁 Lösung einblenden';
        btnChain.classList.remove('active'); btnHint.textContent = '💡 Tipp';
        fb.innerHTML = ''; live.textContent = '';
        shuffleNumbering();
        renderTabs(); renderLeft(); refreshChips(); renderActions(); renderMatch();
      }

      function setMode(m) {
        st.mode = m;
        btnDraw.classList.toggle('active', m === 'draw');
        btnMatch.classList.toggle('active', m === 'match');
        canvas.style.cursor = m === 'draw' ? 'crosshair' : 'default';
        fb.innerHTML = ''; live.textContent = '';
        refreshChips(); renderActions(); renderMatch();
      }
      btnDraw.addEventListener('click', () => setMode('draw'));
      btnMatch.addEventListener('click', () => setMode('match'));

      loadTask(TASKS[0]);
      requestAnimationFrame(draw);

      // ---------- Theorie ----------
      container.appendChild(el('h2', {}, [el('span', { class: 'h2-num' }, '2 ·'), 'Rezept für jede Zeigerdiagramm-Aufgabe']));
      container.appendChild(el('div', { class: 'example-box' }, [
        el('span', { class: 'example-tag' }, 'Vorgehen'),
        el('ol', { class: 'example-steps' }, [
          el('li', {}, [el('strong', {}, 'Referenz finden: '), 'Die gegebene reelle Grösse (meist ein Strom in Serie oder eine Spannung parallel) kommt auf die reelle Achse.']),
          el('li', {}, [el('strong', {}, 'Was ist allen gemeinsam? '), 'Serie → gleicher Strom, parallel → gleiche Spannung. Damit startet man.']),
          (() => { const li = el('li', {}, [el('strong', {}, 'Jedes Bauteil mit û = Z·î: '), 'R dreht nicht, L dreht um +90° (·j), C dreht um −90° (·1/j = ·(−j)).']); li.appendChild(formulaBlock('Z_R = R,\\qquad Z_L = j\\omega L,\\qquad Z_C = \\frac{1}{j\\omega C} = -\\frac{j}{\\omega C}')); return li; })(),
          el('li', {}, [el('strong', {}, 'Summen als Kette: '), 'Maschen- und Knotenregel heissen im Diagramm „Kopf an Schwanz aneinanderhängen“. Der Summenzeiger geht vom Anfang zum Ende der Kette.']),
          el('li', {}, [el('strong', {}, 'Beschriften! '), 'Laut Bewertungsschema gibt es ohne Beschriftung keine Punkte.']),
        ]),
      ]));

      container.appendChild(el('div', { class: 'callout bad' }, [
        el('span', { class: 'callout-label' }, 'Prüfungsfallen'),
        el('ul', {}, [
          el('li', {}, [el('strong', {}, '1/j = −j'), ', nicht +j. Der häufigste Fehler — er spiegelt den Zeiger an der reellen Achse.']),
          el('li', {}, ['Beim Kondensator ', el('strong', {}, 'hinkt die Spannung'), ' dem Strom hinterher, also ', el('strong', {}, 'eilt der Strom voraus'), '. Wer û = Z·î rechnet, dreht um −90°; wer î = û/Z rechnet, dreht um +90°. Beides ist dieselbe Aussage.']),
          el('li', {}, ['Ein Widerstand ändert nur die ', el('strong', {}, 'Länge'), ', nie die Richtung: û_R ist immer parallel zu î_R.']),
          el('li', {}, ['Ströme und Spannungen teilen sich im Diagramm die Achsen, haben aber verschiedene Einheiten. Vergleichen kann man nur ', el('strong', {}, 'Winkel'), ', nicht Längen zwischen î und û.']),
          el('li', {}, ['Ob ein Zeiger im Ursprung oder an der Spitze eines anderen anfängt, ist egal — aber Summen ablesen kann man nur, wenn man Kopf an Schwanz zeichnet.']),
        ]),
      ]));
    },
  });
})();
