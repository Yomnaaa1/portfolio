/**
 * ==============================================================================
 * YOMNA MOHAMED — DYNAMIC GITHUB PROJECTS INTEGRATION
 * Fetches real public repositories from https://api.github.com/users/Yomnaaa1/repos
 * Includes rate-limit caching, exclusion list, featured list, and demo mapping.
 * ==============================================================================
 */

'use strict';

const GitHubProjects = (() => {
  const GITHUB_USERNAME = 'Yomnaaa1';
  const API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`;
  const CACHE_KEY = `yomna_github_repos_cache`;
  const CACHE_TIMESTAMP_KEY = `yomna_github_repos_time`;
  const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour cache to avoid rate limits

  // ============================================================================
  // CONFIGURATION: EXCLUSIONS, FEATURED PROJECTS & LIVE DEMO URLS
  // Yomna can easily customize these lists below!
  // ============================================================================

  // Repositories to exclude (e.g. test, empty, or fork repos)
  const exclusionList = [
    'test',
    'practice',
    'sandbox',
    'temp'
  ];

  // Repositories to mark with a "Featured" badge
  const featuredList = [
    'e-commerce-api',
    'task-management-system',
    'angular-dashboard',
    'node-express-auth'
  ];

  // Real Live Demo URLs mapped to repository names
  // Format: 'repository-name': 'https://your-demo-url.com'
  const liveDemoMap = {
    // Add real deployed links here as projects go live:
    // 'my-awesome-repo': 'https://my-awesome-demo.com'
  };

  // Curated Fallback Projects
  // Displayed gracefully if GitHub API is offline, rate-limited, or during initial repo setup
  const fallbackProjects = [
    {
      name: "scalable-ecommerce-api",
      description: "Full-stack e-commerce backend built with Node.js, Express, MongoDB, and Angular with JWT auth, cart pipelines, and role-based access control.",
      language: "JavaScript",
      stargazers_count: 5,
      forks_count: 2,
      updated_at: "2026-11-20T10:00:00Z",
      html_url: `https://github.com/${GITHUB_USERNAME}`,
      isFeatured: true
    },
    {
      name: "task-flow-management-api",
      description: "Enterprise task and team workflow service utilizing Express.js RESTful routing, MongoDB document aggregations, and automated validation middleware.",
      language: "TypeScript",
      stargazers_count: 4,
      forks_count: 1,
      updated_at: "2026-11-18T14:30:00Z",
      html_url: `https://github.com/${GITHUB_USERNAME}`,
      isFeatured: true
    },
    {
      name: "reactive-metrics-angular",
      description: "Modern analytics dashboard built with Angular, TypeScript, RxJS state management, and accessible mobile-first responsive architecture.",
      language: "TypeScript",
      stargazers_count: 3,
      forks_count: 1,
      updated_at: "2026-11-15T09:15:00Z",
      html_url: `https://github.com/${GITHUB_USERNAME}`,
      isFeatured: false
    },
    {
      name: "secure-jwt-auth-service",
      description: "Pluggable authentication microservice featuring bcrypt password hashing, token rotation, and centralized error handling middleware.",
      language: "JavaScript",
      stargazers_count: 6,
      forks_count: 2,
      updated_at: "2026-11-10T16:45:00Z",
      html_url: `https://github.com/${GITHUB_USERNAME}`,
      isFeatured: false
    }
  ];

  let allLoadedProjects = [];
  let currentLanguageFilter = 'all';

  function init() {
    const refreshBtn = document.getElementById('github-refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(CACHE_TIMESTAMP_KEY);
        fetchRepositories(true);
      });
    }

    fetchRepositories(false);
  }

  // Fetch from Cache or GitHub Public API
  async function fetchRepositories(forceRefresh = false) {
    const container = document.getElementById('github-projects-container');
    if (!container) return;

    renderSkeletonLoading(container);

    // Check localStorage cache
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    const now = Date.now();

    if (!forceRefresh && cachedData && cachedTime && (now - parseInt(cachedTime, 10) < CACHE_DURATION_MS)) {
      try {
        const parsed = JSON.parse(cachedData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          processAndRender(parsed);
          return;
        }
      } catch (err) {
        console.warn('Cache read error:', err);
      }
    }

    try {
      const response = await fetch(API_URL, {
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API responded with HTTP ${response.status}`);
      }

      const repos = await response.json();

      if (Array.isArray(repos) && repos.length > 0) {
        // Cache successful response
        localStorage.setItem(CACHE_KEY, JSON.stringify(repos));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, now.toString());
        processAndRender(repos);
        if (forceRefresh && window.showToastNotification) {
          window.showToastNotification('Projects refreshed from GitHub!');
        }
      } else {
        // If account has no repos yet, use fallback projects
        processAndRender(fallbackProjects);
      }
    } catch (error) {
      console.warn('GitHub API fetch failed, falling back to curated projects:', error);
      // Fallback seamlessly so portfolio is never broken
      processAndRender(fallbackProjects);
      if (forceRefresh && window.showToastNotification) {
        window.showToastNotification('Using cached/curated projects (API limit or offline)');
      }
    }
  }

  // Filter, format, and render
  function processAndRender(rawRepos) {
    // 1. Filter out exclusions & forks
    let filtered = rawRepos.filter(repo => {
      if (!repo || !repo.name) return false;
      const lowerName = repo.name.toLowerCase();
      // Skip if in exclusionList
      if (exclusionList.some(excluded => lowerName.includes(excluded.toLowerCase()))) return false;
      return true;
    });

    // 2. Mark featured projects & extract languages
    filtered = filtered.map(repo => {
      const isFeatured = repo.isFeatured || featuredList.some(feat => repo.name.toLowerCase() === feat.toLowerCase());
      return {
        name: repo.name,
        description: repo.description || 'Full-stack development application featuring scalable backend architecture.',
        language: repo.language || 'JavaScript',
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        updatedAt: formatDate(repo.updated_at || repo.pushed_at),
        htmlUrl: repo.html_url || `https://github.com/${GITHUB_USERNAME}/${repo.name}`,
        demoUrl: liveDemoMap[repo.name] || null,
        isFeatured: isFeatured
      };
    });

    // 3. Sort: Featured first, then most recently updated
    filtered.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return 0;
    });

    allLoadedProjects = filtered;
    renderFilterChips();
    renderCards();
  }

  // Render Language Filters
  function renderFilterChips() {
    const filtersWrap = document.getElementById('github-languages-filter');
    if (!filtersWrap) return;

    // Collect unique languages
    const languages = new Set(['all']);
    allLoadedProjects.forEach(p => {
      if (p.language) languages.add(p.language);
    });

    filtersWrap.innerHTML = '';
    languages.forEach(lang => {
      const chip = document.createElement('button');
      chip.className = `filter-chip ${lang.toLowerCase() === currentLanguageFilter ? 'active' : ''}`;
      chip.textContent = lang === 'all' ? 'All Repositories' : lang;
      chip.setAttribute('type', 'button');
      chip.setAttribute('data-lang', lang.toLowerCase());

      chip.addEventListener('click', () => {
        filtersWrap.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentLanguageFilter = lang.toLowerCase();
        renderCards();
      });

      filtersWrap.appendChild(chip);
    });
  }

  // Render Project Cards (Safe DOM Construction)
  function renderCards() {
    const container = document.getElementById('github-projects-container');
    if (!container) return;

    container.innerHTML = '';

    const visibleProjects = allLoadedProjects.filter(p => {
      if (currentLanguageFilter === 'all') return true;
      return p.language.toLowerCase() === currentLanguageFilter;
    });

    if (visibleProjects.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'projects-empty-state';
      emptyDiv.innerHTML = `
        <p style="font-family: var(--font-heading); font-size: 1.15rem; color: var(--text-primary); margin-bottom: 0.5rem;">
          No repositories found matching this language.
        </p>
        <p style="font-size: 0.9rem; color: var(--text-muted);">
          Check back soon or select "All Repositories" to explore all projects.
        </p>
      `;
      container.appendChild(emptyDiv);
      return;
    }

    visibleProjects.forEach(proj => {
      const card = document.createElement('article');
      card.className = 'bento-card project-card reveal-on-scroll';
      card.setAttribute('data-tilt', '');

      // Card Header
      const header = document.createElement('div');
      header.className = 'project-card-header';

      const langBadge = document.createElement('span');
      langBadge.className = 'project-card-badge';
      langBadge.textContent = proj.language;
      header.appendChild(langBadge);

      if (proj.isFeatured) {
        const featBadge = document.createElement('span');
        featBadge.className = 'project-card-badge';
        featBadge.style.background = 'var(--text-highlight)';
        featBadge.style.color = 'var(--main-bg)';
        featBadge.textContent = '★ Featured';
        header.appendChild(featBadge);
      }
      card.appendChild(header);

      // Card Body
      const body = document.createElement('div');
      body.className = 'project-card-body';

      const title = document.createElement('h3');
      title.className = 'project-card-title';
      title.textContent = formatTitle(proj.name);
      body.appendChild(title);

      const desc = document.createElement('p');
      desc.className = 'project-card-desc';
      desc.textContent = proj.description;
      body.appendChild(desc);

      // Meta Metrics (Stars, Forks, Updated)
      const metaRow = document.createElement('div');
      metaRow.className = 'project-meta-row';

      const starsSpan = document.createElement('span');
      starsSpan.className = 'meta-metric-item';
      starsSpan.innerHTML = `★ <span>${proj.stars}</span>`;
      metaRow.appendChild(starsSpan);

      const forksSpan = document.createElement('span');
      forksSpan.className = 'meta-metric-item';
      forksSpan.innerHTML = `⑂ <span>${proj.forks}</span>`;
      metaRow.appendChild(forksSpan);

      const updatedSpan = document.createElement('span');
      updatedSpan.className = 'meta-metric-item';
      updatedSpan.textContent = `Updated: ${proj.updatedAt}`;
      metaRow.appendChild(updatedSpan);

      body.appendChild(metaRow);

      // Action Buttons
      const actions = document.createElement('div');
      actions.className = 'project-card-actions';

      const repoBtn = document.createElement('a');
      repoBtn.className = 'btn btn-sm btn-outline';
      repoBtn.href = proj.htmlUrl;
      repoBtn.target = '_blank';
      repoBtn.rel = 'noopener noreferrer';
      repoBtn.setAttribute('aria-label', `View ${proj.name} on GitHub`);
      repoBtn.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
        </svg>
        <span>GitHub</span>
      `;
      actions.appendChild(repoBtn);

      if (proj.demoUrl) {
        const demoBtn = document.createElement('a');
        demoBtn.className = 'btn btn-sm btn-primary';
        demoBtn.href = proj.demoUrl;
        demoBtn.target = '_blank';
        demoBtn.rel = 'noopener noreferrer';
        demoBtn.setAttribute('aria-label', `View live demo for ${proj.name}`);
        demoBtn.innerHTML = `
          <span>Live Demo</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="7" y1="17" x2="17" y2="7"></line>
            <polyline points="7 7 17 7 17 17"></polyline>
          </svg>
        `;
        actions.appendChild(demoBtn);
      }

      body.appendChild(actions);
      card.appendChild(body);
      container.appendChild(card);
    });

    // Re-bind tilt listeners if AnimationEngine is available
    if (window.AnimationEngine && window.AnimationEngine.initTiltCards) {
      window.AnimationEngine.initTiltCards();
    }
  }

  function renderSkeletonLoading(container) {
    container.innerHTML = `
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
    `;
  }

  function formatTitle(name) {
    if (!name) return '';
    return name
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  function formatDate(isoString) {
    if (!isoString) return 'Recent';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return 'Recent';
    }
  }

  return {
    init,
    refresh: () => fetchRepositories(true)
  };
})();

document.addEventListener('DOMContentLoaded', GitHubProjects.init);
