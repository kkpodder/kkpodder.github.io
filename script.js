// ============================================================
// Smooth scroll
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = window.innerWidth <= 900 ? 64 : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
    if (link.classList.contains('nav-link')) closeMobileMenu();
  });
});

// ============================================================
// Mobile menu
// ============================================================
const sidebar    = document.getElementById('sidebar');
const menuToggle = document.getElementById('menuToggle');
let menuOpen = false;

function openMobileMenu() {
  menuOpen = true;
  sidebar.classList.add('open');
  menuToggle.classList.add('open');
  menuToggle.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  menuOpen = false;
  sidebar.classList.remove('open');
  menuToggle.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

menuToggle.addEventListener('click', () => {
  menuOpen ? closeMobileMenu() : openMobileMenu();
});

document.addEventListener('click', e => {
  if (menuOpen && !sidebar.contains(e.target) && e.target !== menuToggle) {
    closeMobileMenu();
  }
});

// ============================================================
// Scroll-spy
// ============================================================
const sections = [
  { id: 'about',        link: 'about' },
  { id: 'research',     link: 'research' },
  { id: 'education',    link: 'education' },
  { id: 'experience',   link: 'experience' },
  { id: 'publications', link: 'publications' },
  { id: 'recognition',  link: 'recognition' },
  { id: 'contact',      link: 'contact' },
];

const navLinks = document.querySelectorAll('.nav-link');

function setActiveLink(sectionId) {
  const match = sections.find(s => s.id === sectionId);
  if (!match) return;
  navLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.section === match.link);
  });
}

const spyObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) setActiveLink(entry.target.id);
  });
}, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });

sections.forEach(({ id }) => {
  const el = document.getElementById(id);
  if (el) spyObserver.observe(el);
});

// ============================================================
// Reveal on scroll
// ============================================================
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ============================================================
// Publications — loads from publications.json
// ============================================================
const pubList    = document.getElementById('pub-list');
const pubFilters = document.getElementById('pub-filters');

let allPubs    = [];
let activeYear = 'all';

async function loadPublications() {
  try {
    const res = await fetch('publications.json');
    if (!res.ok) throw new Error('not found');
    allPubs = await res.json();
    allPubs.sort((a, b) => (b.year || 0) - (a.year || 0));
    buildFilters();
    renderPubs();
  } catch {
    pubList.innerHTML = `
      <p class="pub-empty">
        No <code>publications.json</code> found yet —
        <a href="bibtex-converter.html" style="color:var(--accent)">open the BibTeX converter</a>
        to generate it from your Google Scholar export.
      </p>`;
  }
}

function buildFilters() {
  const years = [...new Set(allPubs.map(p => p.year).filter(Boolean))].sort((a,b) => b - a);
  pubFilters.appendChild(makeFilterBtn('All', 'all', true));
  years.forEach(y => pubFilters.appendChild(makeFilterBtn(String(y), y, false)));
}

function makeFilterBtn(label, value, active) {
  const btn = document.createElement('button');
  btn.textContent  = label;
  btn.className    = 'pub-filter-btn' + (active ? ' active' : '');
  btn.dataset.year = value;
  btn.addEventListener('click', () => {
    activeYear = value;
    document.querySelectorAll('.pub-filter-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.year == value);
    });
    renderPubs();
  });
  return btn;
}

function renderPubs() {
  const filtered = activeYear === 'all'
    ? allPubs
    : allPubs.filter(p => String(p.year) === String(activeYear));

  if (!filtered.length) {
    pubList.innerHTML = '<p class="pub-empty">No publications found for this year.</p>';
    return;
  }

  const countEl = document.getElementById('pub-count');
  if (countEl) countEl.textContent = `${filtered.length} publication${filtered.length !== 1 ? 's' : ''}`;

  pubList.innerHTML = filtered.map(pub => {
    const venue = pub.venue || pub.journal || pub.booktitle || '';

    // authors is an array — join, then highlight
    const authorStr = Array.isArray(pub.authors)
      ? pub.authors.join(', ')
      : (pub.authors || '');
    const authors = authorStr
      ? `<p class="pub-authors">${highlightAuthor(authorStr)}</p>`
      : '';

    const links = buildLinks(pub);
    return `
      <article class="pub-item">
        <div class="pub-year">${pub.year || '—'}</div>
        <div class="pub-content">
          <h3 class="pub-title">${pub.title || 'Untitled'}</h3>
          ${venue ? `<p class="pub-venue">${venue}</p>` : ''}
          ${authors}
          ${links}
        </div>
      </article>`;
  }).join('');
}

function highlightAuthor(authors) {
  return authors.replace(
    /(Kanchon\s+Kanti\s+Podder|Kanhon\s+Kanti\s+Podder|K\.?\s*K\.?\s*Podder|Podder,\s*K)/gi,
    '<strong>$1</strong>'
  );
}

function buildLinks(pub) {
  const links = [];
  if (pub.url)     links.push(`<a href="${pub.url}" class="pub-link" target="_blank" rel="noopener">Paper</a>`);
  if (pub.pdf)     links.push(`<a href="${pub.pdf}" class="pub-link" target="_blank" rel="noopener">PDF</a>`);
  if (pub.doi)     links.push(`<a href="https://doi.org/${pub.doi}" class="pub-link" target="_blank" rel="noopener">DOI</a>`);
  if (pub.code)    links.push(`<a href="${pub.code}" class="pub-link" target="_blank" rel="noopener">Code</a>`);
  if (pub.scholar) links.push(`<a href="${pub.scholar}" class="pub-link" target="_blank" rel="noopener">Scholar</a>`);
  return links.length ? `<div class="pub-links">${links.join('')}</div>` : '';
}

loadPublications();
