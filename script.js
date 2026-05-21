/* ============================================================
   script.js — Asahi Kyouya Portfolio Clean Carousel Runtime
   ============================================================ */

'use strict';

const Carousel3D = (() => {
  const AUTO_DELAY = 2600;

  const slideData = [
    {
      bg1: 'THE',
      bg2: 'GAMER',
      role: 'Intense · Reactive',
    },
    {
      bg1: 'THE',
      bg2: 'PLANNER',
      role: 'Strategic · Detail-Driven',
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

  let slides = [];
  let currentIndex = 0;
  let autoTimer = null;

  let numLabel = null;
  let roleLabel = null;
  let bgText1 = null;
  let bgText2 = null;

  function init() {
    const track = document.getElementById('carouselTrack');
    if (!track) return;

    slides = Array.from(track.querySelectorAll('.crs-slide'));
    if (!slides.length) return;

    numLabel = document.getElementById('currentSlideNum');
    roleLabel = document.getElementById('currentSlideRole');
    bgText1 = document.getElementById('bgText1');
    bgText2 = document.getElementById('bgText2');

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    prevBtn?.addEventListener('click', () => {
      goTo(currentIndex - 1);
      restartAutoPlay();
    });

    nextBtn?.addEventListener('click', () => {
      goTo(currentIndex + 1);
      restartAutoPlay();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopAutoPlay();
      } else {
        restartAutoPlay();
      }
    });

    render();
    startAutoPlay();
  }

  function normalizeIndex(index) {
    const total = slides.length;
    return ((index % total) + total) % total;
  }

  function goTo(index) {
    currentIndex = normalizeIndex(index);
    render();
  }

  function render() {
    const total = slides.length;
    const prevIndex = normalizeIndex(currentIndex - 1);
    const nextIndex = normalizeIndex(currentIndex + 1);

    slides.forEach((slide, index) => {
      slide.classList.remove('is-active', 'is-prev', 'is-next');

      if (index === currentIndex) {
        slide.classList.add('is-active');
      } else if (index === prevIndex) {
        slide.classList.add('is-prev');
      } else if (index === nextIndex) {
        slide.classList.add('is-next');
      }
    });

    const meta = slideData[currentIndex] || slideData[0];

    if (numLabel) {
      numLabel.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    }

    if (roleLabel) {
      roleLabel.textContent = meta.role;
    }

    if (bgText1) {
      bgText1.textContent = meta.bg1;
    }

    if (bgText2) {
      bgText2.textContent = meta.bg2;
    }
  }

  function startAutoPlay() {
    stopAutoPlay();

    if (document.hidden) return;

    autoTimer = window.setInterval(() => {
      goTo(currentIndex + 1);
    }, AUTO_DELAY);
  }

  function stopAutoPlay() {
    if (!autoTimer) return;

    window.clearInterval(autoTimer);
    autoTimer = null;
  }

  function restartAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
  }

  return { init };
})();

function bootApp() {
  Carousel3D.init();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootApp, { once: true });
} else {
  bootApp();
}