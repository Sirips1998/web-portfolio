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
// แก้ไขระบบ Carousel 3D ตรงนี้!
// ==========================================
const Carousel3D = (() => {
  const TOTAL = 4;
  const STEP_ANGLE = 360 / TOTAL; 
  
  const slideData = [
    { name: 'The Gamer', role: 'Intense · Reactive' },
    { name: 'The Planner', role: 'Strategic · Detail-Driven' },
    { name: 'The Developer', role: 'Caffeine-Powered · Builder' },
    { name: 'The Creative', role: 'Visionary · Unconventional' }
  ];

  let currentRotation = 0; // ตัวแปรพระเอก: จำองศาแบบบวกสะสมไปเรื่อยๆ (Infinity)
  let track, slides, prevBtn, nextBtn, numLabel, nameLabel, roleLabel;

  function init() {
    track = document.getElementById('carouselTrack');
    if (!track) return;

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

    prevBtn?.addEventListener('click', () => navigate(-1));
    nextBtn?.addEventListener('click', () => navigate(+1));

    render();
  }

  function navigate(dir) {
    // หมุนไปข้างหน้า/ข้างหลัง ทีละ 90 องศาแบบสะสม
    currentRotation += dir * -STEP_ANGLE;
    render();
  }

  function render() {
    // หมุน 3D Track ตามองศาที่สะสม
    track.style.transform = `rotateY(${currentRotation}deg)`;

    // คำนวณหาว่าการ์ดใบไหนที่กำลังหันหน้ามาหาเรา
    let activeIndex = Math.round(currentRotation / -STEP_ANGLE) % TOTAL;
    if (activeIndex < 0) activeIndex += TOTAL; // กันค่าติดลบ

    // อัปเดตสถานะ Active ให้การ์ดเด้ง
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === activeIndex);
    });

    // อัปเดตข้อความ
    if(numLabel) numLabel.textContent = `0${activeIndex + 1} / 04`;
    if(nameLabel) nameLabel.textContent = slideData[activeIndex].name;
    if(roleLabel) roleLabel.textContent = slideData[activeIndex].role;
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
  BlobParallax.init();
  Carousel3D.init();
});