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
  gsap.set('.line-inner', { y: '100%' });
  gsap.set('.hero-desc', { y: 25, opacity: 0 });
  gsap.set('.hero-actions', { y: 20, opacity: 0 });
  
  // For the wipe effect, wrapper starts collapsed in clip-path, image starts scaled up, opacity 0
  gsap.set('.hero-image-wrapper', { 
    opacity: 0,
    clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
    rotate: -1 // start with slight negative tilt for visual dynamics
  });
  gsap.set('#hero-img', { scale: 1.4 });
  
  heroTl
    .to('header', { y: 0, opacity: 1, duration: 1.2, ease: 'power4.out' })
    .to('.hero-tag', { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=0.9')
    .to('.line-inner', { y: '0%', duration: 1.2, stagger: 0.12, ease: 'power4.out' }, '-=0.7')
    .to('.hero-image-wrapper', { 
      opacity: 1,
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', 
      rotate: 2, 
      duration: 1.8, 
      ease: 'power3.inOut' 
    }, '-=1.3')
    .to('#hero-img', { scale: 1.1, duration: 1.8, ease: 'power3.out' }, '-=1.8')
    .to('.hero-desc', { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=1.2')
    .to('.hero-actions', { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=1.0');

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

  // Enable tilt interactions only after the load animation finishes
  heroTl.eventCallback('onComplete', () => {
    initHeroTilt();
  });
}

function initHeroTilt() {
  if (window.innerWidth < 1024) return;
  
  const heroVisual = document.querySelector('.hero-visual');
  const imageWrapper = document.querySelector('.hero-image-wrapper');
  const heroImg = document.querySelector('#hero-img');
  
  if (!heroVisual || !imageWrapper) return;
  
  heroVisual.addEventListener('mousemove', (e) => {
    const rect = heroVisual.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Max tilt angles: 12 deg
    const rotateX = -(y / rect.height) * 12;
    const rotateY = (x / rect.width) * 12;
    
    gsap.to(imageWrapper, {
      rotateX: rotateX,
      rotateY: rotateY + 2, // Maintain the 2deg slant from styling
      x: (x / rect.width) * 20,
      y: (y / rect.height) * 20,
      duration: 0.6,
      ease: 'power2.out'
    });

    // Opposite parallax shift inside the image for visual depth
    gsap.to(heroImg, {
      x: -(x / rect.width) * 15,
      y: -(y / rect.height) * 15,
      duration: 0.6,
      ease: 'power2.out'
    });
  });
  
  heroVisual.addEventListener('mouseleave', () => {
    gsap.to(imageWrapper, {
      rotateX: 0,
      rotateY: 2,
      x: 0,
      y: 0,
      duration: 1,
      ease: 'power3.out'
    });

    gsap.to(heroImg, {
      x: 0,
      y: 0,
      duration: 1,
      ease: 'power3.out'
    });
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
  const cards = gsap.utils.toArray('.tech-card');
  cards.forEach((card, index) => {
    gsap.from(card, {
      opacity: 0,
      y: 50,
      duration: 0.8,
      delay: index * 0.1, // micro-stagger for desktop alignment
      ease: 'power3.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none none' // keep cards visible once triggered
      }
    });
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
