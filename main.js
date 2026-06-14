/* ── Navbar scroll ── */
const nav = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

/* ── Mobile Menu ── */
function toggleMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}

/* ── Particles ── */
const pContainer = document.getElementById('particles');
for (let i = 0; i < 35; i++) {
  const p = document.createElement('div');
  p.className = 'particle';
  p.style.cssText = `
    left: ${Math.random()*100}%;
    width: ${Math.random()*3+1}px;
    height: ${Math.random()*3+1}px;
    animation-duration: ${Math.random()*12+8}s;
    animation-delay: ${Math.random()*10}s;
  `;
  pContainer.appendChild(p);
}

/* ── Counter animation ── */
function animateCounter(el, target, suffix='') {
  const duration = 2200;
  const start = performance.now();
  const update = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const ease = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
    const val = Math.floor(ease * target);
    el.textContent = val.toLocaleString() + suffix;
    if (t < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

/* ── Intersection Observer ── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* stats observer */
let statsAnimated = false;
const statsObs = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && !statsAnimated) {
    statsAnimated = true;
    document.querySelectorAll('[data-target]').forEach(el => {
      const target = parseInt(el.dataset.target);
      animateCounter(el, target);
    });
  }
}, { threshold: 0.5 });
const statsBar = document.querySelector('.stats-bar');
if (statsBar) statsObs.observe(statsBar);

/* ── Smooth scroll for nav links ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior:'smooth' }); }
  });
});
