/* ============================================================
   script.js — Asahi Kyouya Portfolio
   UI Interactions & Blob Parallax Mouse Tracker
   ============================================================ */

'use strict';

// ── Utility ────────────────────────────────────────────────────
/**
 * Linear interpolation — used to smoothly lag blob movement
 * behind the cursor for an organic feel.
 * @param {number} a  current value
 * @param {number} b  target value
 * @param {number} t  lerp factor (0–1)
 */
const lerp = (a, b, t) => a + (b - a) * t;

// ── Blob Parallax ──────────────────────────────────────────────
const BlobParallax = (() => {

  const blobs = [
    { el: null, factorX: 0.022, factorY: 0.018, x: 0, y: 0 },  // blob-1: slow drift
    { el: null, factorX: -0.016, factorY: 0.020, x: 0, y: 0 },  // blob-2: opposite drift
    { el: null, factorX: 0.030, factorY: -0.024, x: 0, y: 0 },  // blob-3: diagonal
  ];

  const LERP_SPEED = 0.055;  // lower = more lag / more organic

  let mouseX = 0;
  let mouseY = 0;
  let rafId  = null;
  let centerX = window.innerWidth  / 2;
  let centerY = window.innerHeight / 2;

  /** Cache DOM references */
  function init() {
    const blobEls = document.querySelectorAll('.blob');
    if (!blobEls.length) return;

    blobEls.forEach((el, i) => {
      if (blobs[i]) blobs[i].el = el;
    });

    // Event listeners
    document.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    // Touch support (maps touch position to mouse coords)
    document.addEventListener('touchmove', onTouchMove, { passive: true });

    // Kick off animation loop
    rafId = requestAnimationFrame(tick);
  }

  /** Track mouse position relative to viewport center */
  function onMouseMove(e) {
    mouseX = e.clientX - centerX;
    mouseY = e.clientY - centerY;
  }

  /** Map touch to same coordinate system */
  function onTouchMove(e) {
    if (!e.touches[0]) return;
    mouseX = e.touches[0].clientX - centerX;
    mouseY = e.touches[0].clientY - centerY;
  }

  /** Update center reference on resize */
  function onResize() {
    centerX = window.innerWidth  / 2;
    centerY = window.innerHeight / 2;
  }

  /**
   * Animation loop — lerps each blob's position toward its
   * cursor-driven target, then applies via CSS transform.
   */
  function tick() {
    blobs.forEach(blob => {
      if (!blob.el) return;

      const targetX = mouseX * blob.factorX;
      const targetY = mouseY * blob.factorY;

      // Smooth interpolation
      blob.x = lerp(blob.x, targetX, LERP_SPEED);
      blob.y = lerp(blob.y, targetY, LERP_SPEED);

      blob.el.style.transform = `translate(${blob.x}px, ${blob.y}px)`;
    });

    rafId = requestAnimationFrame(tick);
  }

  /** Public teardown (useful for SPA unmounting) */
  function destroy() {
    cancelAnimationFrame(rafId);
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('resize', onResize);
  }

  return { init, destroy };

})();

// ── Smooth Scroll (CTA → #works) ──────────────────────────────
const SmoothScroll = (() => {

  function init() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  return { init };

})();

// ── Cursor glow on CTA button ──────────────────────────────────
const CtaGlow = (() => {

  function init() {
    const btn = document.getElementById('ctaBtn');
    if (!btn) return;

    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
      const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
      btn.style.setProperty('--mx', `${x}%`);
      btn.style.setProperty('--my', `${y}%`);
    });
  }

  return { init };

})();

// ── 3D Carousel ────────────────────────────────────────────────
/**
 * Carousel3D
 * Controls a CSS 3D rotary carousel with 4 cards.
 *
 * Layout math:
 *   Each card sits on a ring of radius R.
 *   With N cards evenly spaced: card[i].angle = i × (360 / N) deg
 *   To bring card[i] to front: ring.rotateY = -(i × stepAngle)
 */
const Carousel3D = (() => {

  const TOTAL       = 4;
  const STEP_ANGLE  = 360 / TOTAL;   // 90° per card
  const AUTO_DELAY  = 4500;          // ms between auto-advances

  let currentIndex = 0;
  let autoTimer    = null;
  let isAnimating  = false;
  let touchStartX  = 0;

  // DOM refs (populated in init)
  let ring, cards, dots, prevBtn, nextBtn, currentLabel;

  // ── Setup ──────────────────────────────────────────────────
  function init() {
    ring         = document.getElementById('carouselRing');
    prevBtn      = document.getElementById('prevBtn');
    nextBtn      = document.getElementById('nextBtn');
    currentLabel = document.getElementById('currentSlide');

    if (!ring) return;   // section not in DOM yet

    cards = Array.from(ring.querySelectorAll('.carousel-card'));
    dots  = Array.from(document.querySelectorAll('.dot'));

    // Position each card on the ring via CSS custom property
    cards.forEach((card, i) => {
      card.style.setProperty('--angle', `${i * STEP_ANGLE}deg`);
    });

    // Button listeners
    prevBtn?.addEventListener('click', () => navigate(-1));
    nextBtn?.addEventListener('click', () => navigate(+1));

    // Dot listeners
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => goTo(i));
    });

    // Keyboard navigation (arrow keys when carousel is focused)
    document.addEventListener('keydown', onKeyDown);

    // Touch / swipe support
    ring.addEventListener('touchstart', onTouchStart, { passive: true });
    ring.addEventListener('touchend',   onTouchEnd,   { passive: true });

    // Initial render
    render(false);

    // Auto-play
    startAutoPlay();
  }

  // ── Navigation helpers ─────────────────────────────────────

  /**
   * Move carousel by a relative offset (+1 = next, -1 = prev).
   * @param {number} dir
   */
  function navigate(dir) {
    const next = (currentIndex + dir + TOTAL) % TOTAL;
    goTo(next);
  }

  /**
   * Jump directly to a specific slide index.
   * Guards against double-firing during the CSS transition.
   * @param {number} index
   */
  function goTo(index) {
    if (index === currentIndex) return;
    if (isAnimating) return;

    isAnimating = true;
    currentIndex = index;

    render(true);

    // Lock for the duration of the longest transition (CSS: 0.72s elastic)
    setTimeout(() => { isAnimating = false; }, 780);

    // Reset auto-play timer on manual interaction
    restartAutoPlay();
  }

  // ── Render ─────────────────────────────────────────────────

  /**
   * Apply the current rotation to the ring and update all
   * active-state classes, dots, and the counter label.
   * @param {boolean} animate — false on first paint (skip transition)
   */
  function render(animate) {
    // The ring rotates so that card[currentIndex] faces forward
    const deg = -(currentIndex * STEP_ANGLE);

    if (!animate) {
      // Disable transition for instant first-paint
      ring.style.transition = 'none';
      ring.offsetHeight;     // force reflow
    }

    ring.style.transform = `rotateY(${deg}deg)`;

    if (!animate) {
      // Re-enable after paint
      requestAnimationFrame(() => {
        ring.style.transition = '';
      });
    }

    // Update card states
    cards.forEach((card, i) => {
      card.classList.toggle('is-active', i === currentIndex);
    });

    // Update dots
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
      dot.setAttribute('aria-selected', String(i === currentIndex));
    });

    // Update counter label (01, 02, 03, 04)
    if (currentLabel) {
      currentLabel.textContent = String(currentIndex + 1).padStart(2, '0');
    }
  }

  // ── Auto-play ──────────────────────────────────────────────

  function startAutoPlay() {
    autoTimer = setInterval(() => navigate(+1), AUTO_DELAY);
  }

  function stopAutoPlay() {
    clearInterval(autoTimer);
    autoTimer = null;
  }

  function restartAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
  }

  // Pause on hover / focus
  function pauseOnInteraction() {
    const section = document.getElementById('works');
    if (!section) return;
    section.addEventListener('mouseenter', stopAutoPlay);
    section.addEventListener('mouseleave', startAutoPlay);
    section.addEventListener('focusin',    stopAutoPlay);
    section.addEventListener('focusout',   startAutoPlay);
  }

  // ── Keyboard ───────────────────────────────────────────────

  function onKeyDown(e) {
    // Only react when the carousel section is in view
    const section = document.getElementById('works');
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      navigate(+1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      navigate(-1);
    }
  }

  // ── Touch / Swipe ──────────────────────────────────────────

  function onTouchStart(e) {
    touchStartX = e.touches[0]?.clientX ?? 0;
  }

  function onTouchEnd(e) {
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX;
    const THRESHOLD = 50;   // px minimum swipe

    if (Math.abs(dx) < THRESHOLD) return;
    navigate(dx < 0 ? +1 : -1);
  }

  // ── Public API ─────────────────────────────────────────────
  return { init, goTo, navigate, pauseOnInteraction };

})();


// ── Boot ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  BlobParallax.init();
  SmoothScroll.init();
  CtaGlow.init();
  Carousel3D.init();
  Carousel3D.pauseOnInteraction();

  // Data layer — load projects and pass to carousel when Works section is built
  if (window.PortfolioAPI) {
    window.PortfolioAPI.getProjects().then(projects => {
      console.log('[Portfolio] Projects loaded:', projects.length);
    });
  }
});