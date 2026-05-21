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
  const AUTO_DELAY = 3500; // เวลาหมุนออโต้ (3.5 วินาที)
  
  const slideData = [
    { name: 'The Gamer', role: 'Intense · Reactive' },
    { name: 'The Planner', role: 'Strategic · Detail-Driven' },
    { name: 'The Developer', role: 'Caffeine-Powered · Builder' },
    { name: 'The Creative', role: 'Visionary · Unconventional' }
  ];

  let currentRotation = 0; 
  let autoTimer = null; // ตัวจับเวลา
  let track, slides, prevBtn, nextBtn, numLabel, nameLabel, roleLabel, section;

  function init() {
    track = document.getElementById('carouselTrack');
    if (!track) return;

    section = document.getElementById('works'); // ดึง section มาใช้เช็กเมาส์
    slides = Array.from(track.querySelectorAll('.crs-slide'));
    prevBtn = document.getElementById('prevBtn');
    nextBtn = document.getElementById('nextBtn');
    numLabel = document.getElementById('currentSlideNum');
    nameLabel = document.getElementById('currentSlideName');
    roleLabel = document.getElementById('currentSlideRole');

    // แจกแจงองศาให้การ์ด
    slides.forEach((slide, i) => {
      slide.style.setProperty('--slide-angle', `${i * STEP_ANGLE}deg`);
    });

    // เวลากดปุ่มเอง ให้รีเซ็ตเวลาออโต้ด้วย จะได้ไม่หมุนเบิ้ล
    prevBtn?.addEventListener('click', () => manualNavigate(-1));
    nextBtn?.addEventListener('click', () => manualNavigate(+1));

    // หยุดหมุนเมื่อเอาเมาส์ชี้ (หรือเอานิ้วจิ้มค้างในมือถือ)
    section?.addEventListener('mouseenter', stopAutoPlay);
    section?.addEventListener('mouseleave', startAutoPlay);
    section?.addEventListener('touchstart', stopAutoPlay, { passive: true });
    section?.addEventListener('touchend', startAutoPlay, { passive: true });

    render();
    startAutoPlay(); // เริ่มหมุนออโต้ตั้งแต่เปิดเว็บ!
  }

  function navigate(dir) {
    currentRotation += dir * -STEP_ANGLE;
    render();
  }

  function manualNavigate(dir) {
    navigate(dir);
    stopAutoPlay();
    startAutoPlay(); // รีสตาร์ทตัวนับเวลาใหม่
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

  // ฟังก์ชันเริ่มจับเวลาหมุนออโต้
  function startAutoPlay() {
    if (!autoTimer) {
      autoTimer = setInterval(() => navigate(+1), AUTO_DELAY);
    }
  }

  // ฟังก์ชันหยุดจับเวลา
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