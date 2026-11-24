/**
 * ==============================================================================
 * YOMNA MOHAMED — MAIN SCRIPT
 * Navigation, Contact Form Validation, Email Copy, CV Modal, Toast Notifications
 * ==============================================================================
 */

'use strict';

// Global Toast Notification Utility
window.showToastNotification = function(message, duration = 3200) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span>${escapeHTML(message)}</span>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, duration);
};

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initContactForm();
  initEmailCopy();
  initCVModal();
  initBackToTop();
  initCurrentYear();
  initProfileImageFallback();
});

// 1. Navbar & ScrollSpy
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  const handleScroll = () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Mobile Drawer Menu
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('is-open');
      mobileToggle.classList.toggle('active', isOpen);
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (navMenu.classList.contains('is-open')) {
          navMenu.classList.remove('is-open');
          mobileToggle.classList.remove('active');
          mobileToggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      });
    });

    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('is-open') &&
          !navMenu.contains(e.target) &&
          !mobileToggle.contains(e.target)) {
        navMenu.classList.remove('is-open');
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  // Active Link ScrollSpy
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, {
    rootMargin: '-25% 0px -65% 0px',
    threshold: 0
  });

  sections.forEach(sec => observer.observe(sec));
}

// 2. Contact Form Validation with Mailto Fallback
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const subjectInput = document.getElementById('contact-subject');
  const messageInput = document.getElementById('contact-message');
  const alertBanner = document.getElementById('form-feedback-alert');
  const submitBtn = document.getElementById('contact-submit-btn');

  const fields = [
    { input: nameInput, error: document.getElementById('name-error-msg') },
    { input: emailInput, error: document.getElementById('email-error-msg') },
    { input: subjectInput, error: document.getElementById('subject-error-msg') },
    { input: messageInput, error: document.getElementById('message-error-msg') }
  ];

  fields.forEach(({ input, error }) => {
    if (input) {
      input.addEventListener('input', () => {
        input.classList.remove('has-error');
        if (error) error.textContent = '';
      });
    }
  });

  const validateEmail = (email) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(String(email).trim().toLowerCase());
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;
    alertBanner.className = 'form-alert-banner';
    alertBanner.textContent = '';

    // Validate Name
    if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
      nameInput.classList.add('has-error');
      document.getElementById('name-error-msg').textContent = 'Please enter your full name (minimum 2 characters).';
      isValid = false;
    }

    // Validate Email
    if (!emailInput.value.trim() || !validateEmail(emailInput.value)) {
      emailInput.classList.add('has-error');
      document.getElementById('email-error-msg').textContent = 'Please provide a valid email address (e.g. name@domain.com).';
      isValid = false;
    }

    // Validate Subject
    if (!subjectInput.value.trim() || subjectInput.value.trim().length < 3) {
      subjectInput.classList.add('has-error');
      document.getElementById('subject-error-msg').textContent = 'Please specify a subject (minimum 3 characters).';
      isValid = false;
    }

    // Validate Message
    if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
      messageInput.classList.add('has-error');
      document.getElementById('message-error-msg').textContent = 'Please write a message with at least 10 characters.';
      isValid = false;
    }

    if (!isValid) {
      const firstInvalid = form.querySelector('.has-error');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Provide user transparent confirmation + direct mailto fallback
    submitBtn.disabled = true;
    submitBtn.textContent = 'Preparing message...';

    const subjectEncoded = encodeURIComponent(`[Portfolio Inquiry] ${subjectInput.value.trim()}`);
    const bodyEncoded = encodeURIComponent(`Hi Yomna,\n\nName: ${nameInput.value.trim()}\nEmail: ${emailInput.value.trim()}\n\nMessage:\n${messageInput.value.trim()}`);
    const mailtoUrl = `mailto:Yomna.mohamed.dev@gmail.com?subject=${subjectEncoded}&body=${bodyEncoded}`;

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';

      alertBanner.classList.add('success');
      alertBanner.innerHTML = `
        <strong>Thank you, ${escapeHTML(nameInput.value.trim())}!</strong><br>
        Your inquiry has been successfully validated. You can also send this message directly via your email client or WhatsApp:
        <div style="margin-top: 0.75rem; display: flex; gap: 0.65rem; flex-wrap: wrap;">
          <a href="${mailtoUrl}" class="btn btn-sm btn-primary">Open in Email App</a>
          <a href="https://wa.me/201022693040?text=${encodeURIComponent('Hi Yomna, I saw your portfolio and would like to connect.')}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-secondary">WhatsApp Direct</a>
        </div>
      `;

      window.showToastNotification('Message validated successfully!');
      form.reset();
    }, 800);
  });
}

// 3. Email Copy Action with Tooltip
function initEmailCopy() {
  const copyBtn = document.getElementById('copy-email-trigger');
  if (!copyBtn) return;

  const emailToCopy = 'Yomna.mohamed.dev@gmail.com';

  copyBtn.addEventListener('click', async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(emailToCopy);
      } else {
        const temp = document.createElement('textarea');
        temp.value = emailToCopy;
        temp.style.position = 'fixed';
        temp.style.left = '-9999px';
        document.body.appendChild(temp);
        temp.focus();
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
      }
      window.showToastNotification(`Copied to clipboard: ${emailToCopy}`);
    } catch {
      window.showToastNotification(`Email: ${emailToCopy}`);
    }
  });
}

// 4. CV Modal Preview & Download Handler
function initCVModal() {
  const cvBtn = document.getElementById('download-cv-btn');
  const modal = document.getElementById('cv-preview-modal');
  const closeBtn = document.getElementById('cv-modal-close');
  const cancelBtn = document.getElementById('cv-modal-cancel');
  const printBtn = document.getElementById('cv-modal-print');

  if (!cvBtn || !modal) return;

  const openModal = (e) => {
    e.preventDefault();
    modal.hidden = false;
    setTimeout(() => modal.classList.add('is-active'), 10);
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.focus();
  };

  const closeModal = () => {
    modal.classList.remove('is-active');
    setTimeout(() => {
      modal.hidden = true;
      document.body.style.overflow = '';
      cvBtn.focus();
    }, 300);
  };

  cvBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

  if (printBtn) {
    printBtn.addEventListener('click', () => window.print());
  }
}

// 5. Back to Top Button
function initBackToTop() {
  const btn = document.getElementById('back-to-top-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// 6. Dynamic Current Year
function initCurrentYear() {
  const el = document.getElementById('copyright-year');
  if (el) el.textContent = new Date().getFullYear();
}

// 7. Profile Image Fallback (When assets/images/profile.jpg is empty/missing initially)
function initProfileImageFallback() {
  const img = document.getElementById('profile-photo-img');
  const placeholderUI = document.getElementById('portrait-placeholder');
  if (!img || !placeholderUI) return;

  img.addEventListener('load', () => {
    // If real image exists and loaded, show image and hide placeholder
    img.style.display = 'block';
    placeholderUI.style.display = 'none';
  });

  img.addEventListener('error', () => {
    // Keep placeholder visible if image file is not present yet
    img.style.display = 'none';
    placeholderUI.style.display = 'flex';
  });
}

function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>'"]/g, t => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[t] || t));
}
