/**
 * ==============================================================================
 * YOMNA MOHAMED — THEME ENGINE
 * Design: Creative Forest (#181C14) & Blush (#FFF5E4)
 * Handles Dark/Light switching, localStorage persistence, and meta synchronization
 * ==============================================================================
 */

'use strict';

const ThemeEngine = (() => {
  const STORAGE_KEY = 'yomna_portfolio_theme';
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');

  // Initialize theme
  function init() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem(STORAGE_KEY);

    // Default to 'dark' (Forest) as primary identity
    const initialTheme = savedTheme || 'dark';
    applyTheme(initialTheme);

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', toggleTheme);
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);

    // Update browser navigation bar color
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#181C14' : '#FFF5E4');
    }

    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
      toggleBtn.setAttribute('title', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
    }
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);

    if (window.showToastNotification) {
      window.showToastNotification(`Switched to ${nextTheme === 'dark' ? 'Forest (Dark)' : 'Blush (Light)'} theme`);
    }
  }

  return {
    init,
    applyTheme,
    toggleTheme
  };
})();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', ThemeEngine.init);
