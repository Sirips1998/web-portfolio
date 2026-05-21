/* ============================================================
   script.js — Asahi Kyouya Portfolio Runtime Client Engine
   ============================================================ */

'use strict';

const lerp = (a, b, t) => a + (b - a) * t;

/* ============================================================
   ORGANIC AMBIENT BLOB PARALLAX
   ============================================================ */

const BlobParallax = (() => {
  const blobs = [
    { el: null, factorX: 0.022, factorY: 0.018, x: 0, y: 0 },
    { el: null, factorX: -0.016, factorY: 0.020, x: 0, y: 0 },
    { el: null, factorX: 0.030, factorY: -0.024, x: 0, y: 0 },
  ];

  const LERP_SPEED = 0.055;

  let mouseX = 0;
  let mouseY = 0;
  let hasInit = false;

  function init() {
    if (hasInit) return;
    hasInit = true;

    const blobEls = document.querySelectorAll('.blob');
    if (!blobEls.length) return;

    blobEls.forEach((el, i) => {
      if (blobs[i]) blobs[i].el = el;
    });

    document.addEventListener(
      'mousemove',
      event => {
        mouseX = event.clientX - window.innerWidth / 2;
        mouseY = event.clientY - window.innerHeight / 2;
      },
      { passive: true }
    );

    requestAnimationFrame(tick);
  }

  function tick() {
    blobs.forEach(blob => {
      if (!blob.el) return;

      blob.x = lerp(blob.x, mouseX * blob.factorX, LERP_SPEED);
      blob.y = lerp(blob.y, mouseY * blob.factorY, LERP_SPEED);

      blob.el.style.transform = `translate(${blob.x}px, ${blob.y}px)`;
    });

    requestAnimationFrame(tick);
  }

  return { init };
})();

/* ============================================================
   CONTINUOUS AUTO-ROTATING 3D CAROUSEL
   ============================================================ */

const Carousel3D = (() => {
  const AUTO_DELAY = 2000;
  const ANIMATION_LOCK = 850;

  const slideData = [
    {
      bg1: 'THE',
      bg2: 'GAMER',
      role: 'Intense · Reactive',
    },
    {
      bg1: 'THE',
      bg2: 'OFFICE',
      role: 'Organized · Professional',
    },
    {
      bg1: 'THE',
      bg2: 'CODER',
      role: 'Caffeine-Powered · Builder',
    },
    {
      bg1: 'THE',
      bg2: 'FANTASY',
      role: 'Visionary · Unconventional',
    },
  ];

  let total = 0;
  let stepAngle = 0;
  let currentRotation = 0;
  let autoTimer = null;
  let isAnimating = false;
  let hasInit = false;

  let track = null;
  let slides = [];
  let numLabel = null;
  let roleLabel = null;
  let bgText1 = null;
  let bgText2 = null;

  function init() {
    if (hasInit) return;
    hasInit = true;

    track = document.getElementById('carouselTrack');
    if (!track) return;

    slides = Array.from(track.querySelectorAll('.crs-slide'));
    total = slides.length;

    if (!total) return;

    stepAngle = 360 / total;

    numLabel = document.getElementById('currentSlideNum');
    roleLabel = document.getElementById('currentSlideRole');
    bgText1 = document.getElementById('bgText1');
    bgText2 = document.getElementById('bgText2');

    slides.forEach((slide, index) => {
      slide.style.setProperty('--slide-angle', `${index * stepAngle}deg`);
    });

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    prevBtn?.addEventListener('click', () => manualNavigate(-1));
    nextBtn?.addEventListener('click', () => manualNavigate(+1));

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopAutoPlay();
      } else {
        render();
        startAutoPlay();
      }
    });

    window.addEventListener('focus', () => {
      render();
      startAutoPlay();
    });

    window.addEventListener('pageshow', () => {
      render();
      startAutoPlay();
    });

    render();
    startAutoPlay();
  }

  function navigate(direction = +1) {
    if (isAnimating || document.hidden) return;

    isAnimating = true;

    currentRotation += direction * -stepAngle;
    render();

    window.setTimeout(() => {
      isAnimating = false;
    }, ANIMATION_LOCK);
  }

  function manualNavigate(direction) {
    navigate(direction);
    startAutoPlay();
  }

  function render() {
    if (!track || !slides.length) return;

    track.style.transform = `rotateY(${currentRotation}deg)`;

    let activeIndex = Math.round(currentRotation / -stepAngle) % total;
    if (activeIndex < 0) activeIndex += total;

    slides.forEach((slide, index) => {
      slide.classList.toggle('is-active', index === activeIndex);
    });

    const meta = slideData[activeIndex] || slideData[activeIndex % slideData.length];

    if (numLabel) {
      numLabel.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    }

    if (roleLabel && meta) {
      roleLabel.textContent = meta.role;
    }

    if (bgText1 && meta) {
      bgText1.textContent = meta.bg1;
    }

    if (bgText2 && meta) {
      bgText2.textContent = meta.bg2;
    }
  }

  function startAutoPlay() {
    stopAutoPlay();

    if (document.hidden) return;

    autoTimer = window.setInterval(() => {
      navigate(+1);
    }, AUTO_DELAY);
  }

  function stopAutoPlay() {
    if (autoTimer) {
      window.clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  return {
    init,
    startAutoPlay,
    stopAutoPlay,
  };
})();

/* ============================================================
   APPLICATION BOOTSTRAP
   ============================================================ */

function bootApp() {
  BlobParallax.init();
  Carousel3D.init();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootApp, { once: true });
} else {
  bootApp();
}