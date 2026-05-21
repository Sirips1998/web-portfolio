/* ============================================================
   api.js — Asahi Kyouya Portfolio
   Data Layer / API Module
   All network requests and data-fetching logic lives here.
   ============================================================ */

'use strict';

const API = (() => {

  // ── Base config ────────────────────────────────────────────
  const BASE_URL = 'https://api.example.com/v1';  // TODO: replace with real endpoint

  /**
   * Generic fetch wrapper with basic error handling.
   * @param {string} endpoint
   * @param {RequestInit} [options]
   * @returns {Promise<any>}
   */
  async function _request(endpoint, options = {}) {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      return await res.json();
    } catch (err) {
      console.error('[API] Request failed:', err);
      return null;
    }
  }

  // ── Mock data ──────────────────────────────────────────────

  /** Mock projects data — replace with real fetch when ready */
  const _mockProjects = [
    {
      id: 'proj-001',
      title: 'Kinetic Type System',
      category: 'Motion Design',
      year: 2025,
      tags: ['After Effects', 'Motion', 'Typography'],
      thumbnail: null,
      url: '#',
    },
    {
      id: 'proj-002',
      title: 'Aether UI Kit',
      category: 'Frontend Development',
      year: 2025,
      tags: ['React', 'TailwindCSS', 'Design System'],
      thumbnail: null,
      url: '#',
    },
    {
      id: 'proj-003',
      title: 'Mono Brand Identity',
      category: 'Motion Design',
      year: 2024,
      tags: ['Branding', 'Animation', 'Cinema 4D'],
      thumbnail: null,
      url: '#',
    },
  ];

  // ── Public API ─────────────────────────────────────────────

  /**
   * Fetch all portfolio projects.
   * Currently returns mock data; swap body for _request() call when live.
   * @returns {Promise<Array>}
   */
  async function getProjects() {
    // TODO: return await _request('/projects');
    return Promise.resolve(_mockProjects);
  }

  /**
   * Fetch a single project by ID.
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async function getProjectById(id) {
    // TODO: return await _request(`/projects/${id}`);
    const project = _mockProjects.find(p => p.id === id) ?? null;
    return Promise.resolve(project);
  }

  /**
   * Submit a contact form message.
   * @param {{ name: string, email: string, message: string }} payload
   * @returns {Promise<{ success: boolean }>}
   */
  async function submitContact(payload) {
    // TODO: return await _request('/contact', { method: 'POST', body: JSON.stringify(payload) });
    console.log('[API] submitContact (mock):', payload);
    return Promise.resolve({ success: true });
  }

  /**
   * Fetch "about" profile data (bio, skills, etc.).
   * @returns {Promise<Object>}
   */
  async function getProfile() {
    // TODO: return await _request('/profile');
    return Promise.resolve({
      name:  'Asahi Kyouya',
      roles: ['Motion Designer', 'Frontend Developer'],
      bio:   '',
      skills: [],
      availability: true,
    });
  }

  // Expose public methods
  return {
    getProjects,
    getProjectById,
    submitContact,
    getProfile,
  };

})();

// Make API globally accessible for other scripts
window.PortfolioAPI = API;