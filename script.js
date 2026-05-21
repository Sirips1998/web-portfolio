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

// ── Boot ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  BlobParallax.init();
  SmoothScroll.init();
  CtaGlow.init();

  // Example: load projects in background (data layer is ready)
  if (window.PortfolioAPI) {
    window.PortfolioAPI.getProjects().then(projects => {
      console.log('[Portfolio] Projects loaded:', projects.length);
      // TODO: pass `projects` to a renderer when Works section is built
    });
  }
});
