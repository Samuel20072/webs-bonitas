gsap.registerPlugin(ScrollTrigger);

// ─── LENIS SMOOTH SCROLL ─────────────────────────
const lenis = new Lenis({
  duration: 1.1,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

// ─── CUSTOM CURSOR (mix-blend-mode:difference) ────
const cursor = document.getElementById('cursor');
if (cursor && window.innerWidth >= 1024) {
  gsap.set(cursor, { xPercent: -50, yPercent: -50 });
  window.addEventListener('mousemove', e => {
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.22, ease: 'power2.out' });
  });
  document.querySelectorAll('a, button, .board-item, .nav-pill-dot').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('grow'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('grow'));
  });
}

// ─── CURTAIN OPEN ────────────────────────────────
const curtainTl = gsap.timeline();
curtainTl
  .set(['#curtain-top', '#curtain-bot'], { yPercent: 0 })
  .to('#curtain-top', { yPercent: -100, duration: 1.3, ease: 'power4.inOut', delay: 0.2 })
  .to('#curtain-bot', { yPercent: 100,  duration: 1.3, ease: 'power4.inOut' }, '<')
  .set(['#curtain-top','#curtain-bot'], { display: 'none' });

// ─── HERO ENTRY ───────────────────────────────────
const heroTl = gsap.timeline({ delay: 0.5 });
gsap.set('.li', { yPercent: 110 });
gsap.set('.hero-bottom, .hero-scroll-hint', { opacity: 0, y: 20 });
// hero-food-img starts with opacity:0 in CSS, GSAP fades it in

heroTl
  .to('.li', { yPercent: 0, duration: 1.1, stagger: 0.12, ease: 'power4.out' })
  .to('#hero-food-img', { opacity: 1, duration: 1.4, ease: 'power3.out' }, 0)
  .to('.hero-bottom',      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.8')
  .to('.hero-scroll-hint', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.7')
  .to('.nav-pill', { opacity: 1, duration: 0.6 }, '-=0.4');

// ─── HERO BG PARALLAX ON SCROLL ───────────────────
gsap.to('#hero-food-img', {
  yPercent: 18,
  ease: 'none',
  scrollTrigger: { trigger: '.s-hero', start: 'top top', end: 'bottom top', scrub: true },
});

// ─── MARQUEE ─────────────────────────────────────
(function initMarquee() {
  const track = document.getElementById('marquee-track');
  if (!track) return;
  // Duplicate content so loop is always seamless
  track.innerHTML = track.innerHTML + track.innerHTML;
  const totalW = track.scrollWidth / 2;
  gsap.to(track, {
    x: -totalW,
    duration: 28,
    ease: 'none',
    repeat: -1,
    modifiers: {
      x: gsap.utils.unitize(x => parseFloat(x) % totalW)
    }
  });
})();

// ─── SIDE PILL NAV SYNC ───────────────────────────
const dots    = document.querySelectorAll('.nav-pill-dot');
const targets = [...dots].map(d => document.getElementById(d.dataset.target));

dots.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    lenis.scrollTo(targets[i], { offset: 0 });
  });
});

ScrollTrigger.create({
  trigger: 'body',
  start: 'top top',
  end: 'bottom bottom',
  onUpdate(self) {
    const scrollY = window.scrollY + window.innerHeight / 2;
    let activeIdx = 0;
    targets.forEach((t, i) => {
      if (t && t.offsetTop <= scrollY) activeIdx = i;
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === activeIdx));
  },
});

// ─── SPLIT SECTIONS REVEAL ───────────────────────
gsap.utils.toArray('.s-split').forEach(section => {
  const left  = section.querySelector('.split-left');
  const right = section.querySelector('.split-right');
  gsap.from(left,  { x: -80, opacity: 0, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: section, start: 'top 75%', toggleActions: 'play none none none' } });
  gsap.from(right, { x:  80, opacity: 0, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: section, start: 'top 75%', toggleActions: 'play none none none' } });
});

// ─── SPLIT IMAGE SLOW ZOOM ON SCROLL ─────────────
['#split-img', '#chicken-img'].forEach(sel => {
  const el = document.querySelector(sel);
  if (!el) return;
  gsap.to(el, {
    scale: 1.14,
    ease: 'none',
    scrollTrigger: { trigger: el.closest('.s-split'), start: 'top bottom', end: 'bottom top', scrub: true },
  });
});

// ─── MENU BOARD ITEMS FLY IN ─────────────────────
gsap.utils.toArray('.board-item').forEach((item, i) => {
  gsap.from(item, {
    x: -60, opacity: 0, duration: 0.7,
    delay: i * 0.08,
    ease: 'power3.out',
    scrollTrigger: { trigger: item, start: 'top 88%', toggleActions: 'play none none none' },
  });
});

// ─── IMAGE STRIP PARALLAX ────────────────────────
gsap.to('#strip-img', {
  yPercent: -12,
  ease: 'none',
  scrollTrigger: { trigger: '.s-imgstrip', start: 'top bottom', end: 'bottom top', scrub: true },
});

// ─── QUOTE WORD REVEAL ────────────────────────────
// Start all words hidden
gsap.set('.quote-text .word span', { yPercent: 110 });

ScrollTrigger.create({
  trigger: '#s-quote',
  start: 'top 75%',
  once: true,
  onEnter() {
    gsap.to('.quote-text .word span', {
      yPercent: 0,
      duration: 0.75,
      stagger: 0.07,
      ease: 'power4.out',
    });
  },
});

// ─── ORDER SECTION SLAM IN ────────────────────────
gsap.from('.order-title', {
  y: 60, opacity: 0, duration: 1, ease: 'power4.out',
  scrollTrigger: { trigger: '.s-order', start: 'top 80%', toggleActions: 'play none none none' },
});
gsap.from('.order-sub, .btn-order', {
  y: 30, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out',
  scrollTrigger: { trigger: '.s-order', start: 'top 75%', toggleActions: 'play none none none' },
});
