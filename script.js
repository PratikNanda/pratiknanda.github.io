'use strict';

// ========== GRID / DATA-VIZ BACKGROUND ==========
(function () {
  const canvas = document.getElementById('grid-bg');
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const size = 60;
    ctx.strokeStyle = 'rgba(45,106,79,0.07)';
    ctx.lineWidth = 0.8;
    // Vertical lines
    for (let x = 0; x < canvas.width; x += size) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    // Horizontal lines
    for (let y = 0; y < canvas.height; y += size) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
    // Accent dots at intersections (sparse)
    ctx.fillStyle = 'rgba(45,106,79,0.1)';
    for (let x = 0; x < canvas.width; x += size * 3) {
      for (let y = 0; y < canvas.height; y += size * 3) {
        ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  window.addEventListener('resize', () => { resize(); drawGrid(); });
  resize();
  drawGrid();
})();


// ========== NAVBAR SCROLL ==========
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ========== HAMBURGER ==========
const hamburger = document.getElementById('hamburger');
const navLinks  = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});


// ========== TYPEWRITER ==========
(function () {
  const words = ['automate reporting workflows', 'build data-driven dashboards', 'optimize ITSM operations', 'transform raw data into insights', 'improve process efficiency'];
  const el = document.getElementById('typewriter');
  if (!el) return;
  let wi = 0, ci = 0, deleting = false;

  function type() {
    const word = words[wi];
    el.textContent = deleting ? word.slice(0, ci--) : word.slice(0, ci++);
    if (!deleting && ci > word.length)      { deleting = true; setTimeout(type, 2200); return; }
    if (deleting  && ci < 0)                { deleting = false; wi = (wi + 1) % words.length; setTimeout(type, 400); return; }
    setTimeout(type, deleting ? 45 : 85);
  }
  setTimeout(type, 1000);
})();


// ========== COUNTER ANIMATION ==========
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const duration = 1800;
  const steps = Math.max(30, target);
  const inc = target / steps;
  let current = 0, frame = 0;

  const timer = setInterval(() => {
    current += inc;
    frame++;
    if (current >= target || frame >= steps) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = prefix + Math.floor(current) + suffix;
  }, duration / steps);
}


// ========== HERO BAR CHART ANIMATION ==========
function animateHeroBars() {
  const bars = document.querySelectorAll('#hero-bar-chart .bar');
  bars.forEach((bar, i) => {
    const targetY = parseFloat(bar.dataset.y);
    const targetH = parseFloat(bar.dataset.h);
    setTimeout(() => {
      bar.setAttribute('y', targetY);
      bar.setAttribute('height', targetH);
      bar.style.transition = 'y 0.8s cubic-bezier(0.4,0,0.2,1), height 0.8s cubic-bezier(0.4,0,0.2,1)';
    }, i * 120);
  });
}


// ========== HERO LINE CHART ANIMATION ==========
function animateHeroLine() {
  const sparkline = document.querySelector('#hero-line-chart .sparkline');
  const area      = document.querySelector('#hero-line-chart .line-area');
  const dot       = document.querySelector('#hero-line-chart .line-dot');
  const dotRing   = document.querySelector('#hero-line-chart .line-dot-ring');

  if (sparkline) {
    sparkline.style.strokeDashoffset = '0';
    if (area)    { area.style.opacity = '1'; }
    if (dot)     { dot.style.opacity = '1'; }
    if (dotRing) { dotRing.style.opacity = '1'; }
  }
}


// ========== DONUT CHART ANIMATION ==========
function animateDonut(ring) {
  const pct = parseFloat(ring.dataset.pct) / 100;
  const circumference = 2 * Math.PI * 38; // r=38 → ~238.8
  const offset = circumference * (1 - pct);
  ring.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)';
  ring.style.strokeDashoffset = offset;
}


// ========== SMOOTH SCROLL ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
  });
});


// ========== PROJECT FILTERS ==========
const filterBtns   = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    projectCards.forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('hidden', !match);
    });
  });
});


// ========== CONTACT FORM ==========
const form       = document.getElementById('contact-form');
const successMsg = document.getElementById('form-success');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Sending…`;
    setTimeout(() => {
      form.reset();
      btn.disabled = false;
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send Message`;
      successMsg.classList.add('visible');
      setTimeout(() => successMsg.classList.remove('visible'), 5000);
    }, 1200);
  });
}


// ========== INTERSECTION OBSERVER ==========
const observed = new Set();

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;

    // Fade-up
    el.classList.add('visible');

    if (observed.has(el)) return;
    observed.add(el);

    // Proficiency bars
    el.querySelectorAll('.prof-fill').forEach(bar => {
      bar.style.width = bar.dataset.width + '%';
    });

    // Counters (impact banner & hero)
    el.querySelectorAll('[data-target]').forEach(animateCounter);

    // Donut charts
    el.querySelectorAll('.donut-ring').forEach(animateDonut);

    // Hero charts (trigger when hero section is visible)
    if (el.classList.contains('hero') || el.closest('.hero')) {
      setTimeout(animateHeroBars, 300);
      setTimeout(animateHeroLine, 600);
    }
  });
}, { threshold: 0.1 });

// Observe hero section
const hero = document.querySelector('.hero');
if (hero) {
  hero.classList.add('fade-up');
  io.observe(hero);
}

// Observe everything else
document.querySelectorAll(
  '.fade-up, .skills-chart-panel, .skill-tile, .domain-card, .about-domain-grid, ' +
  '.project-card, .timeline-content, .cert-card, .contact-item, ' +
  '.section-header, .impact-item, .lh-item, .availability-card'
).forEach(el => {
  if (!el.classList.contains('fade-up')) el.classList.add('fade-up');
  io.observe(el);
});


// ========== ON LOAD: animate visible hero immediately ==========
window.addEventListener('load', () => {
  // Hero is always above fold
  if (hero) { hero.classList.add('visible'); }
  setTimeout(animateHeroBars, 400);
  setTimeout(animateHeroLine, 700);
  document.querySelectorAll('.hero [data-target]').forEach(animateCounter);
});


// ========== CURSOR GLOW (subtle) ==========
(function () {
  const glow = document.createElement('div');
  Object.assign(glow.style, {
    position: 'fixed', pointerEvents: 'none', zIndex: '9999',
    width: '400px', height: '400px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(45,106,79,0.05) 0%, transparent 65%)',
    transform: 'translate(-50%, -50%)', top: '0', left: '0',
    transition: 'opacity 0.4s',
  });
  document.body.appendChild(glow);

  let mx = 0, my = 0, gx = 0, gy = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { glow.style.opacity = '1'; });

  (function loop() {
    gx += (mx - gx) * 0.08;
    gy += (my - gy) * 0.08;
    glow.style.left = gx + 'px';
    glow.style.top  = gy + 'px';
    requestAnimationFrame(loop);
  })();
})();
