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
// Continuous Auto-Rotating 3D Carousel (infinity loop)
// ==========================================
const Carousel3D = (() => {
  const TOTAL = 4;
  const STEP_ANGLE = 360 / TOTAL; // 90° per card for symmetric circular placement
  const AUTO_DELAY = 4500; // ms between auto-advances
  
  // ชุดข้อมูลพอร์ตโฟลิโอแอนิเมชัน (bg1, bg2 ควบคุมตัวอักษรยักษ์ข้างหลัง)
  const slideData = [
    { bg1: 'THE', bg2: 'GAMER', role: 'Intense · Reactive' },
    { bg1: 'THE', bg2: 'PLANNER', role: 'Strategic · Detail-Driven' },
    { bg1: 'THE', bg2: 'DEVELOPER', role: 'Caffeine-Powered · Builder' },
    { bg1: 'THE', bg2: 'CREATIVE', role: 'Visionary · Unconventional' }
  ];

  let currentRotation = 0; 
  let autoTimer = null; // Timer object
  let isAnimating = false; // Guard
  let touchStartX = 0; // Swipe start
  
  // DOM refs (populated in init)
  let track, slides, numLabel, roleLabel, bgText1, bgText2, section;

  function init() {
    track = document.getElementById('carouselTrack');
    if (!track) return;

    section = document.getElementById('works'); // used for hover check
    slides = Array.from(track.querySelectorAll('.crs-slide'));
    numLabel = document.getElementById('currentSlideNum');
    roleLabel = document.getElementById('currentSlideRole');
    bgText1 = document.getElementById('bgText1');
    bgText2 = document.getElementById('bgText2');

    // จัดวางพิกัดมุมองศาแบบสมมาตรรอบวงแหวน 3D 
    slides.forEach((slide, i) => {
      slide.style.setProperty('--slide-angle', `${i * STEP_ANGLE}deg`);
    });

    // Keyboard navigation (arrow keys when carousel is focused)
    document.addEventListener('keydown', onKeyDown);

    // Touch / swipe support
    track.addEventListener('touchstart', onTouchStart, { passive: true });
    track.addEventListener('touchend',   onTouchEnd,   { passive: true });
    
    // Pause on hover / focus
    section?.addEventListener('mouseenter', stopAutoPlay);
    section?.addEventListener('mouseleave', startAutoPlay);
    section?.addEventListener('focusin',    stopAutoPlay);
    section?.addEventListener('focusout',   startAutoPlay);

    render();
    startAutoPlay(); // เริ่มรันลูปอนิเมชันสไลด์ออโต้ทันทีเมื่อโหลดหน้ากระดานเสร็จ
  }

  function navigate(dir) {
    if (isAnimating) return;
    isAnimating = true;
    
    // ใช้การเพิ่ม/ลด องศาแบบสะสมต่อเนื่อง ป้องกันบั๊กเด้งกลับหลัง
    currentRotation += dir * -STEP_ANGLE;
    render();
    
    // Lock for duration of CSS transition (elastic transition time rule)
    setTimeout(() => { isAnimating = false; }, 800); 
  }

  function render() {
    track.style.transform = `rotateY(${currentRotation}deg)`;

    // คำนวณหา active index แบบ Infinity Loop
    let activeIndex = Math.round(currentRotation / -STEP_ANGLE) % TOTAL;
    if (activeIndex < 0) activeIndex += TOTAL; // กันค่าติดลบ

    // Update active slide state
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === activeIndex);
    });

    // Update index labels
    if(numLabel) numLabel.textContent = `0${activeIndex + 1} / 04`;
    if(roleLabel) roleLabel.textContent = slideData[activeIndex].role;
    
    // อัปเดตข้อความยักษ์แบ็คกราวด์ด้านหลังให้ตรงตามรูป
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

  // ── Keyboard / Touch Utilities ──────────────────────────────────────────
  function onKeyDown(e) {
    // Only react when the carousel section is in view to prevent global key hijack
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      navigate(+1);
      stopAutoPlay(); // reset timer on manual
      startAutoPlay();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      navigate(-1);
      stopAutoPlay(); // reset timer on manual
      startAutoPlay();
    }
  }

  function onTouchStart(e) {
    touchStartX = e.touches[0]?.clientX ?? 0;
  }

  function onTouchEnd(e) {
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX;
    const THRESHOLD = 50; // px minimum swipe
    if (Math.abs(dx) < THRESHOLD) return;
    
    navigate(dx < 0 ? +1 : -1);
    stopAutoPlay(); // reset timer on manual
    startAutoPlay();
  }

  return { init };
})();

// ── Application Bootstrapping Initializer ───────────────────────
document.addEventListener('DOMContentLoaded', () => {
  BlobParallax.init();
  Carousel3D.init();
});