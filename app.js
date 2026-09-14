// Router + sidebar + home page. Topic pages register themselves into window.PAGES
// (array) before this file runs — see index.html script order.

const CATEGORY_ORDER = [
  'Gleichstromkreise',
  'Elektrische & magnetische Felder',
  'Induktion',
  'Wechselstrom',
  'Halbleiter',
];

function byCategory() {
  const map = new Map();
  for (const cat of CATEGORY_ORDER) map.set(cat, []);
  for (const p of window.PAGES) {
    if (!map.has(p.category)) map.set(p.category, []);
    map.get(p.category).push(p);
  }
  return map;
}

function renderSidebar(activeId) {
  const nav = document.getElementById('sidebar-nav');
  nav.innerHTML = '';
  for (const [cat, pages] of byCategory()) {
    if (pages.length === 0) continue;
    const group = el('div', { class: 'nav-group' });
    group.appendChild(el('div', { class: 'nav-group-title' }, cat));
    for (const p of pages) {
      const link = el('a', {
        class: 'nav-link' + (p.id === activeId ? ' active' : ''),
        href: '#' + p.id,
      }, [
        el('span', { class: 'nav-num' }, p.num),
        el('span', {}, p.navTitle || p.title),
      ]);
      group.appendChild(link);
    }
    nav.appendChild(group);
  }
}

function renderHome() {
  renderSidebar(null);
  const root = document.getElementById('content-inner');
  root.innerHTML = '';
  root.appendChild(el('div', { class: 'home-hero' }, [
    el('div', { class: 'kicker' }, 'Elektrotechnik · visuell & interaktiv'),
    el('h1', {}, 'Elektrotechnik verstehen, nicht nur nachrechnen'),
    el('p', { class: 'subtitle' },
      'Begleitmaterial zur Vorlesung: interaktive Simulationen zu den Themen, die in der Prüfung am meisten verwirren — zum Selbststudium, als Wiederholung oder direkt im Unterricht. Wähle links ein Thema.'),
  ]));

  const grid = el('div', { class: 'card-grid' });
  for (const p of window.PAGES) {
    grid.appendChild(el('div', { class: 'topic-card', onclick: () => { location.hash = '#' + p.id; } }, [
      el('span', { class: 'badge' }, p.num),
      el('h3', {}, p.title),
      el('p', {}, p.teaser || p.subtitle),
    ]));
  }
  root.appendChild(grid);

  root.appendChild(el('p', { class: 'note', style: 'margin-top:36px' },
    'Dieses Tool ergänzt die Vorlesung — es ersetzt weder Skript noch Übungsstunden.'));
}

function renderPage(page) {
  renderSidebar(page.id);
  const root = document.getElementById('content-inner');
  root.innerHTML = '';

  root.appendChild(el('div', { class: 'badge-row' }, [
    el('span', { class: 'badge' }, page.num),
    el('span', { class: 'badge' }, page.week),
    page.formelsammlung ? el('span', { class: 'badge badge-ref' }, '📄 Formelsammlung ET I · ' + page.formelsammlung) : null,
  ]));
  root.appendChild(el('h1', {}, page.title));
  root.appendChild(el('p', { class: 'subtitle' }, page.subtitle));

  const body = el('div', { id: 'page-body' });
  root.appendChild(body);
  page.render(body);

  const ids = window.PAGES.map((p) => p.id);
  const i = ids.indexOf(page.id);
  const prev = i > 0 ? window.PAGES[i - 1] : null;
  const next = i < window.PAGES.length - 1 ? window.PAGES[i + 1] : null;
  root.appendChild(el('div', { class: 'footer-nav' }, [
    prev ? el('a', { href: '#' + prev.id }, '← ' + prev.title) : el('span', {}, ''),
    next ? el('a', { href: '#' + next.id }, next.title + ' →') : el('a', { href: '#' }, '↑ Übersicht'),
  ]));
}

function route() {
  const hash = location.hash.replace(/^#/, '');
  document.getElementById('content').scrollTo?.(0, 0);
  window.scrollTo(0, 0);
  if (!hash) { renderHome(); return; }
  const page = window.PAGES.find((p) => p.id === hash);
  if (!page) { renderHome(); return; }
  renderPage(page);
}

function setupPolyboxLink() {
  const link = document.getElementById('polybox-link');
  const url = (window.POLYBOX_URL || '').trim();
  if (url) {
    link.href = url;
    link.title = 'Öffnet die Polybox in einem neuen Tab';
  } else {
    link.href = '#';
    link.classList.add('disabled');
    link.title = 'Noch kein Link hinterlegt — trage ihn in polybox-link.js ein';
    link.addEventListener('click', (ev) => ev.preventDefault());
  }
}

window.addEventListener('hashchange', route);
window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupPolyboxLink();
  document.getElementById('theme-toggle').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'light' ? 'dark' : 'light');
  });
  window.PAGES.sort((a, b) => a.order - b.order);
  route();
});
