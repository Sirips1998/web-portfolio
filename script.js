/* ============================================================
   script.js — Asahi Kyouya Portfolio Runtime Client Engine
   ============================================================ */

'use strict';

// ── Organic Ambient Blob Parallax Layer Handles Mouse Movement ──────────────────
const lerp = (a, b, t) => a + (b - a) * t;

const BlobParallax = (() => {
  const blobs = [
    { el: null, factorX: 0.022, factorY: 0.018, x: 0, y: 0 },
    { el: null, factorX: -0.016, factorY: 0.020, x: 0, y: 0 },
    { el: null, factorX: 0.030, factorY: -0.024, x: 0, y: 0 },
  ];
  const LERP_SPEED = 0.055;
  let mouseX = 0, mouseY = 0, rafId = null;
  
  function init() {
    const blobEls = document.querySelectorAll('.blob');
    if (!blobEls.length) return;
    
    blobEls.forEach((el, i) => { if (blobs[i]) blobs[i].el = el; });
    
    document.addEventListener('mousemove', e => {
      mouseX = e.clientX - window.innerWidth / 2;
      mouseY = e.clientY - window.innerHeight / 2;
    }, { passive: true });
    
    rafId = requestAnimationFrame(tick);
  }
  
  function tick() {
    blobs.forEach(blob => {
      if (!blob.el) return;
      blob.x = lerp(blob.x, mouseX * blob.factorX, LERP_SPEED);
      blob.y = lerp(blob.y, mouseY * blob.factorY, LERP_SPEED);
      blob.el.style.transform = `translate(${blob.x}px, ${blob.y}px)`;
    });
    rafId = requestAnimationFrame(tick);
  }
  return { init };
})();

// ==========================================
// Continuous Auto-Rotating 3D Carousel
// ==========================================
const Carousel3D = (() => {
  const TOTAL = 4;
  const STEP_ANGLE = 360 / TOTAL; 
  const AUTO_DELAY = 2000; // หมุนออโต้ทุกๆ 2 วินาที
  
  const slideData = [
    { bg1: 'THE', bg2: 'GAMER', role: 'Intense · Reactive' },
    { bg1: 'THE', bg2: 'PLANNER', role: 'Strategic · Detail-Driven' },
    { bg1: 'THE', bg2: 'DEVELOPER', role: 'Caffeine-Powered · Builder' },
    { bg1: 'THE', bg2: 'CREATIVE', role: 'Visionary · Unconventional' }
  ];

  let currentRotation = 0; 
  let autoTimer = null; 
  let isAnimating = false; 
  
  let track, slides, numLabel, roleLabel, bgText1, bgText2;

  function init() {
    track = document.getElementById('carouselTrack');
    if (!track) return;

    slides = Array.from(track.querySelectorAll('.crs-slide'));
    numLabel = document.getElementById('currentSlideNum');
    roleLabel = document.getElementById('currentSlideRole');
    bgText1 = document.getElementById('bgText1');
    bgText2 = document.getElementById('bgText2');

    slides.forEach((slide, i) => {
      slide.style.setProperty('--slide-angle', `${i * STEP_ANGLE}deg`);
    });

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    prevBtn?.addEventListener('click', () => manualNavigate(-1));
    nextBtn?.addEventListener('click', () => manualNavigate(+1));

    // ปลุกระบบให้ตื่นตอนสลับแท็บไปมา (แก้บั๊กหยุดหมุน)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopAutoPlay();
      } else {
        startAutoPlay();
      }
    });

    render();
    
    // ตั้งเวลาดีเลย์นิดนึงก่อนเริ่มหมุนครั้งแรก ให้หน้าเว็บโหลดให้เสร็จก่อน
    setTimeout(startAutoPlay, 500); 
  }

  function navigate(dir) {
    if (isAnimating) return;
    isAnimating = true;
    
    currentRotation += dir * -STEP_ANGLE;
    render();
    
    setTimeout(() => { isAnimating = false; }, 800); 
  }

  function manualNavigate(dir) {
    navigate(dir);
    stopAutoPlay();
    startAutoPlay(); 
  }

  function render() {
    track.style.transform = `rotateY(${currentRotation}deg)`;

    let activeIndex = Math.round(currentRotation / -STEP_ANGLE) % TOTAL;
    if (activeIndex < 0) activeIndex += TOTAL; 

    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === activeIndex);
    });

    if(numLabel) numLabel.textContent = `0${activeIndex + 1} / 04`;
    if(roleLabel) roleLabel.textContent = slideData[activeIndex].role;
    
    if(bgText1) bgText1.textContent = slideData[activeIndex].bg1;
    if(bgText2) bgText2.textContent = slideData[activeIndex].bg2;
  }

  function startAutoPlay() {
    if (!autoTimer) {
      autoTimer = setInterval(() => navigate(+1), AUTO_DELAY);
    }
  }

  function stopAutoPlay() {
    clearInterval(autoTimer);
    autoTimer = null;
  }

  return { init };
})();

// ── Application Bootstrapping Initializer ───────────────────────
document.addEventListener('DOMContentLoaded', () => {
  BlobParallax.init();
  Carousel3D.init();
});