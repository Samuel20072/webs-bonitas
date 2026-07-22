// Initialize GSAP & ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// ==========================================
// 1. Lenis Smooth Scroll Integration
// ==========================================
let lenis;
function initSmoothScroll() {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom easing for premium scroll feel
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    smoothTouch: false,
    wheelMultiplier: 1,
    touchMultiplier: 2,
    infinite: false,
  });

  // Connect Lenis scroll events to GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  // Turn off lag smoothing for GSAP to avoid jumps with Lenis
  gsap.ticker.lagSmoothing(0);
}
initSmoothScroll();

// ==========================================
// 2. Custom Magnetic Cursor
// ==========================================
function initCustomCursor() {
  const cursor = document.querySelector('.custom-cursor');
  const cursorDot = document.querySelector('.custom-cursor-dot');
  
  if (!cursor || !cursorDot) return;

  // Set initial position
  gsap.set(cursor, { xPercent: -50, yPercent: -50 });
  gsap.set(cursorDot, { xPercent: -50, yPercent: -50 });

  // Update cursor position on mouse move
  window.addEventListener('mousemove', (e) => {
    gsap.to(cursorDot, { x: e.clientX, y: e.clientY, duration: 0.1 });
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.25 });
  });

  // Hover states
  const interactives = document.querySelectorAll('.interactive');
  interactives.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      const effect = el.getAttribute('data-cursor-effect');
      if (effect === 'view') {
        cursor.classList.add('view-hover');
        cursorDot.classList.add('view-hover');
      } else {
        cursor.classList.add('hovered');
        cursorDot.classList.add('hovered');
      }
    });

    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hovered', 'view-hover');
      cursorDot.classList.remove('hovered', 'view-hover');
    });
  });

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    gsap.to([cursor, cursorDot], { opacity: 0 });
  });
  document.addEventListener('mouseenter', () => {
    gsap.to([cursor, cursorDot], { opacity: 1 });
  });
}
// Init cursor only if screen is desktop (min-width: 1024px)
if (window.innerWidth >= 1024) {
  initCustomCursor();
}

// ==========================================
// 3. Hero Animations on Load
// ==========================================
function initHeroAnimations() {
  const heroTl = gsap.timeline();
  
  // Set initial hidden states to prevent flash of unstyled content (FOUC)
  gsap.set('header', { y: -60, opacity: 0 });
  gsap.set('.hero-tag', { y: 20, opacity: 0 });
  gsap.set('.hero-content h1', { y: 40, opacity: 0 });
  gsap.set('.hero-desc', { y: 25, opacity: 0 });
  gsap.set('.hero-actions', { y: 20, opacity: 0 });
  gsap.set('.hero-image-wrapper', { scale: 0.9, opacity: 0 });
  
  heroTl
    .to('header', { y: 0, opacity: 1, duration: 1.2, ease: 'power4.out' })
    .to('.hero-tag', { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=0.8')
    .to('.hero-content h1', { y: 0, opacity: 1, duration: 1, ease: 'power4.out' }, '-=0.6')
    .to('.hero-desc', { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=0.8')
    .to('.hero-actions', { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=0.8')
    .to('.hero-image-wrapper', { scale: 1, opacity: 1, duration: 1.4, ease: 'power4.out' }, '-=1');

  // Parallax subtle effect on Hero Image on scroll
  gsap.to('#hero-img', {
    yPercent: 12,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });
}
initHeroAnimations();

// ==========================================
// 4. GSAP Horizontal Scroll Gallery (Desktop Only)
// ==========================================
function initHorizontalScroll() {
  const horizontalOuter = document.querySelector('.horizontal-outer');
  const horizontalSection = document.querySelector('.horizontal-scroll-section');

  if (!horizontalOuter || !horizontalSection) return;

  // Pin & Scroll horizontally
  const horizontalTween = gsap.to(horizontalOuter, {
    xPercent: -75, // Since there are 4 slides, we translate 75% of the total width
    ease: 'none',
    scrollTrigger: {
      trigger: horizontalSection,
      pin: true,
      scrub: 1,
      start: 'top top',
      end: () => `+=${horizontalSection.offsetWidth * 2.2}`,
      invalidateOnRefresh: true, // Responsiveness helper
    }
  });

  // Parallax scaling effect for images inside the horizontal slider
  const images = gsap.utils.toArray('.product-img-wrapper img');
  images.forEach((img) => {
    gsap.fromTo(img, 
      { scale: 1.25 },
      {
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: img.parentNode,
          containerAnimation: horizontalTween,
          start: 'left right',
          end: 'right left',
          scrub: true,
        }
      }
    );
  });

  // Fade-in product information when it enters horizontally
  const products = gsap.utils.toArray('.product-info');
  products.forEach((info) => {
    gsap.from(info, {
      opacity: 0,
      x: 60,
      duration: 0.6,
      scrollTrigger: {
        trigger: info,
        containerAnimation: horizontalTween,
        start: 'left 80%',
        toggleActions: 'play none none reverse'
      }
    });
  });
}

// Check if viewport is desktop to run horizontal animations
let mediaQuery = window.matchMedia('(min-width: 769px)');
if (mediaQuery.matches) {
  initHorizontalScroll();
}

// Re-evaluate on resize
window.addEventListener('resize', () => {
  ScrollTrigger.refresh();
});

// ==========================================
// 5. Scroll-linked Text Reveal Fill
// ==========================================
function initTextReveal() {
  // Animate first line
  gsap.to('#reveal-fill-1', {
    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
    ease: 'none',
    scrollTrigger: {
      trigger: '#reveal-text-1',
      start: 'top 85%',
      end: 'top 45%',
      scrub: true,
    }
  });

  // Animate second line
  gsap.to('#reveal-fill-2', {
    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
    ease: 'none',
    scrollTrigger: {
      trigger: '#reveal-text-2',
      start: 'top 85%',
      end: 'top 45%',
      scrub: true,
    }
  });
}
initTextReveal();

// ==========================================
// 6. Technology Cards Staggered Reveal
// ==========================================
function initTechReveal() {
  gsap.from('.tech-card', {
    opacity: 0,
    y: 60,
    duration: 1,
    stagger: 0.2,
    ease: 'power4.out',
    scrollTrigger: {
      trigger: '.tech-section',
      start: 'top 80%',
      toggleActions: 'play none none reverse'
    }
  });
}
initTechReveal();

// ==========================================
// 7. Numeric Stat Counters Animation
// ==========================================
function initStatsCounters() {
  const stats = document.querySelectorAll('.stat-num');
  
  stats.forEach((stat) => {
    const targetVal = parseInt(stat.getAttribute('data-val'));
    const obj = { val: 0 };
    
    gsap.to(obj, {
      val: targetVal,
      duration: 2.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.stats-section',
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      onUpdate: () => {
        // Format layout output based on product target
        if (targetVal === 15) {
          stat.innerHTML = `${Math.floor(obj.val)}<span>k+</span>`;
        } else if (targetVal === 98 || targetVal === 100) {
          stat.innerHTML = `${Math.floor(obj.val)}<span>%</span>`;
        } else {
          stat.innerHTML = `${Math.floor(obj.val)}<span>g</span>`;
        }
      }
    });
  });
}
initStatsCounters();

// Active states in header menu links depending on position
function handleHeaderLinks() {
  const sectionsList = ['hero', 'collections', 'technology', 'stats'];
  const navLinks = document.querySelectorAll('nav a');
  
  window.addEventListener('scroll', () => {
    let current = 'hero';
    
    sectionsList.forEach((sec) => {
      const el = document.getElementById(sec);
      if (el) {
        const top = el.offsetTop - 150;
        if (window.scrollY >= top) {
          current = sec;
        }
      }
    });
    
    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href').substring(1) === current) {
        link.classList.add('active');
      }
    });
  });
}
handleHeaderLinks();
