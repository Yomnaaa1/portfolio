/**
 * ==============================================================================
 * YOMNA MOHAMED — ANIMATION ENGINE
 * Interactive Canvas Background, Custom Cursor, 3D Card Tilt, Scroll Progress
 * ==============================================================================
 */

'use strict';

const AnimationEngine = (() => {
  // Check user preference for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

  function init() {
    initScrollProgressBar();
    initScrollReveal();

    if (!prefersReducedMotion) {
      initCanvasBackground();
      if (!isTouchDevice) {
        initCustomCursor();
        initTiltCards();
      }
    }
  }

  // 1. Scroll Progress Bar
  function initScrollProgressBar() {
    const progressBar = document.getElementById('scroll-progress');
    if (!progressBar) return;

    window.addEventListener('scroll', () => {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      progressBar.style.width = `${scrolled}%`;
    }, { passive: true });
  }

  // 2. Scroll Reveal Observer
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    if (prefersReducedMotion) {
      revealElements.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  }

  // 3. Interactive Background Canvas (Lightweight Floating Particles)
  function initCanvasBackground() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const mouse = { x: -1000, y: -1000, radius: 130 };

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      createParticles();
    };

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 1;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 20) + 1;
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
        this.alpha = Math.random() * 0.45 + 0.15;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Subtle mouse repulsion
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const fx = (dx / dist) * force * this.density * 0.35;
          const fy = (dy / dist) * force * this.density * 0.35;
          this.x -= fx;
          this.y -= fy;
        }
      }
      draw() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        ctx.fillStyle = isDark
          ? `rgba(236, 223, 204, ${this.alpha * 0.75})`
          : `rgba(255, 148, 148, ${this.alpha * 0.8})`;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }
    }

    function createParticles() {
      particles = [];
      const count = Math.min(Math.floor((width * height) / 20000), 50);
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    }

    function connectLines() {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const maxDistance = 110;

      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * (isDark ? 0.12 : 0.08);
            ctx.strokeStyle = isDark
              ? `rgba(236, 223, 204, ${alpha})`
              : `rgba(255, 148, 148, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
            ctx.closePath();
          }
        }
      }
    }

    function loop() {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      connectLines();
      requestAnimationFrame(loop);
    }

    window.addEventListener('resize', debounce(resize, 150));
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });

    window.addEventListener('mouseout', () => {
      mouse.x = -1000;
      mouse.y = -1000;
    });

    resize();
    loop();
  }

  // 4. Custom Cursor with Smooth Lerp (Desktop Only)
  function initCustomCursor() {
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;
    let isVisible = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        dot.style.opacity = '1';
        ring.style.opacity = '1';
        isVisible = true;
      }
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    }, { passive: true });

    function renderRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
      requestAnimationFrame(renderRing);
    }
    requestAnimationFrame(renderRing);

    // Interactive expansion
    const interactiveTags = 'a, button, input, textarea, .bento-card, .filter-chip, .social-icon-btn';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveTags)) {
        ring.classList.add('cursor-hover');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactiveTags)) {
        ring.classList.remove('cursor-hover');
      }
    });

    document.addEventListener('mouseleave', () => {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
      isVisible = false;
    });
  }

  // 5. 3D Card Tilt Micro-Interaction
  function initTiltCards() {
    const cards = document.querySelectorAll('[data-tilt]');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;

        const rotateX = ((y - cy) / cy) * -6;
        const rotateY = ((x - cx) / cx) * 6;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });
  }

  function debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  return {
    init,
    initTiltCards
  };
})();

document.addEventListener('DOMContentLoaded', AnimationEngine.init);
