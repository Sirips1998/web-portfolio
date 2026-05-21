/* ============================================================
   script.js — Asahi Kyouya Portfolio Runtime Client Engine
   ============================================================ */

'use strict';

// ── Motion Utility System ──────────────────────────────────────
const lerp = (a, b, t) => a + (b - a) * t;

// ── Organic Ambient Blob Mouse Parallax Tracker ──────────────────
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

// ── Endlessly Cyclic 3D Continuous Auto-Rotating Carousel ───────
const Carousel3D = (() => {
  const TOTAL = 4;
  const STEP_ANGLE = 360 / TOTAL; 
  const AUTO_DELAY = 2000; // สับเปลี่ยนสไลด์อัตโนมัติทุกๆ 2000ms (2 วินาที) เป๊ะๆ
  
  // ชุดข้อมูลพอร์ตโฟลิโอแอนิเมชัน (bg1, bg2 ควบคุมตัวอักษรยักษ์ข้างหลัง)
  const slideData = [
    { bg1: 'THE', bg2: 'GAMER', role: 'Intense · Reactive' },
    { bg1: 'THE', bg2: 'PLANNER', role: 'Strategic · Detail-Driven' },
    { bg1: 'THE', bg2: 'DEVELOPER', role: 'Caffeine-Powered · Builder' },
    { bg1: 'THE', bg2: 'CREATIVE', role: 'Visionary · Unconventional' }
  ];

  let currentRotation = 0; 
  let autoTimer = null; 
  let track, slides, prevBtn, nextBtn, numLabel, roleLabel, bgText1, bgText2;

  function init() {
    track = document.getElementById('carouselTrack');
    if (!track) return;

    slides = Array.from(track.querySelectorAll('.crs-slide'));
    prevBtn = document.getElementById('prevBtn');
    nextBtn = document.getElementById('nextBtn');
    numLabel = document.getElementById('currentSlideNum');
    roleLabel = document.getElementById('currentSlideRole');
    bgText1 = document.getElementById('bgText1');
    bgText2 = document.getElementById('bgText2');

    // จัดวางพิกัดมุมองศาแบบสมมาตรรอบวงแหวน 3D 
    slides.forEach((slide, i) => {
      slide.style.setProperty('--slide-angle', `${i * STEP_ANGLE}deg`);
    });

    // ทิศทางการกดควบคุมด้วยตัวเองแบบรีเซ็ตเวลา
    prevBtn?.addEventListener('click', () => manualNavigate(-1));
    nextBtn?.addEventListener('click', () => manualNavigate(+1));

    render();
    startAutoPlay(); // เริ่มรันลูปอนิเมชันสไลด์ออโต้ทันทีเมื่อโหลดหน้ากระดานเสร็จ
  }

  function navigate(dir) {
    // ใช้การเพิ่ม/ลด องศาแบบสะสมต่อเนื่อง ป้องกันบั๊กเด้งกลับหลัง
    currentRotation += dir * -STEP_ANGLE;
    render();
  }

  function manualNavigate(dir) {
    navigate(dir);
    stopAutoPlay();
    startAutoPlay(); // ล้างเวลานับถอยหลังใหม่เพื่อไม่ให้ทับซ้อนจังหวะการรันอัตโนมัติ
  }

  function render() {
    track.style.transform = `rotateY(${currentRotation}deg)`;

    let activeIndex = Math.round(currentRotation / -STEP_ANGLE) % TOTAL;
    if (activeIndex < 0) activeIndex += TOTAL; 

    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === activeIndex);
    });

    // อัปเดตข้อมูลสถานะดัชนีภาพ
    if(numLabel) numLabel.textContent = `0${activeIndex + 1} / 04`;
    if(roleLabel) roleLabel.textContent = slideData[activeIndex].role;
    
    // เปลี่ยนข้อความตัวหนังสือยักษ์แบ็คกราวด์ด้านหลังให้ตรงตามรูป
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