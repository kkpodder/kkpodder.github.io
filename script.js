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
    // Close mobile menu on nav click
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

// Close on outside click
document.addEventListener('click', e => {
  if (menuOpen && !sidebar.contains(e.target) && e.target !== menuToggle) {
    closeMobileMenu();
  }
});

// ============================================================
// Scroll-spy — highlights active sidebar link
// ============================================================
const sections = [
  { id: 'about',        link: 'about' },
  { id: 'about-detail', link: 'about' },
  { id: 'research',     link: 'research' },
  { id: 'publications', link: 'publications' },
  { id: 'experience',   link: 'experience' },
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
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
