'use strict';

const BlobParallax = (() => {
  const blobs = [
    { el: null, factorX: 0.022, factorY: 0.018, x: 0, y: 0 },
    { el: null, factorX: -0.016, factorY: 0.020, x: 0, y: 0 },
    { el: null, factorX: 0.030, factorY: -0.024, x: 0, y: 0 },
  ];
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
      blob.x += (mouseX * blob.factorX - blob.x) * 0.055;
      blob.y += (mouseY * blob.factorY - blob.y) * 0.055;
      blob.el.style.transform = `translate(${blob.x}px, ${blob.y}px)`;
    });
    rafId = requestAnimationFrame(tick);
  }
  return { init };
})();

// ==========================================
// 3D Carousel (Auto-play + Pause on Hover)
// ==========================================
const Carousel3D = (() => {
  const TOTAL = 4;
  const STEP_ANGLE = 360 / TOTAL; 
  const AUTO_DELAY = 3000; // หมุนทุกๆ 3 วินาที
  
  const slideData = [
    { name: 'The Gamer', role: 'Intense · Reactive' },
    { name: 'The Planner', role: 'Strategic · Detail-Driven' },
    { name: 'The Developer', role: 'Caffeine-Powered · Builder' },
    { name: 'The Creative', role: 'Visionary · Unconventional' }
  ];

  let currentRotation = 0; 
  let autoTimer = null; 
  let track, slides, prevBtn, nextBtn, numLabel, nameLabel, roleLabel, viewport;

  function init() {
    track = document.getElementById('carouselTrack');
    if (!track) return;

    // เปลี่ยนเป้าหมายการจับเมาส์เป็น .crs-viewport (เฉพาะโซนที่แสดงรูป)
    viewport = document.querySelector('.crs-viewport'); 
    
    slides = Array.from(track.querySelectorAll('.crs-slide'));
    prevBtn = document.getElementById('prevBtn');
    nextBtn = document.getElementById('nextBtn');
    numLabel = document.getElementById('currentSlideNum');
    nameLabel = document.getElementById('currentSlideName');
    roleLabel = document.getElementById('currentSlideRole');

    slides.forEach((slide, i) => {
      slide.style.setProperty('--slide-angle', `${i * STEP_ANGLE}deg`);
    });

    prevBtn?.addEventListener('click', () => manualNavigate(-1));
    nextBtn?.addEventListener('click', () => manualNavigate(+1));

    // หยุดเมื่อเมาส์ชี้ที่ "โซนรูป" เท่านั้น
    viewport?.addEventListener('mouseenter', stopAutoPlay);
    viewport?.addEventListener('mouseleave', startAutoPlay);
    viewport?.addEventListener('touchstart', stopAutoPlay, { passive: true });
    viewport?.addEventListener('touchend', startAutoPlay, { passive: true });

    render();
    startAutoPlay(); 
  }

  function navigate(dir) {
    currentRotation += dir * -STEP_ANGLE;
    render();
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
    if(nameLabel) nameLabel.textContent = slideData[activeIndex].name;
    if(roleLabel) roleLabel.textContent = slideData[activeIndex].role;
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

document.addEventListener('DOMContentLoaded', () => {
  BlobParallax.init();
  Carousel3D.init();
});