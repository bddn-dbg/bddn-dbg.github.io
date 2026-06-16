/**
 * BDDN Web – Main JavaScript File
 * Handles navbar states, mobile menu transitions, and form validation / submissions.
 * Optimized: passive event listeners, accessibility aria-expanded, keyboard navigation.
 * Note: script.js uses defer — DOMContentLoaded wrapper is unnecessary (deferred scripts
 * always execute after DOM is ready), so code runs directly for a faster start.
 */

/* ─── SITE-WIDE CONFIG ─────────────────────────────────────────────────────
 * To update the BDDN Institute URL across ALL pages, change only this one line.
 * Every nav link and hero button pointing to the institute will update automatically.
 * ────────────────────────────────────────────────────────────────────────── */
const BDDN_INSTITUTE_URL = 'https://bddn.online/bddn-institute.github.io/';
// const BDDN_INSTITUTE_URL = 'https://google.com';

// Auto-update every institute link on the current page
document.querySelectorAll('a[aria-label*="BDDN Institute"]').forEach(link => {
  link.href = BDDN_INSTITUTE_URL;
});

/* ─── DOM REFERENCES ─── */
const navbar = document.getElementById('navbar');
const mobileMenu = document.getElementById('mobileMenu');
const hamburger = document.querySelector('.hamburger');
const mobileClose = document.querySelector('.mobile-close');
const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];
const enquiryForm = document.getElementById('enquiryForm');

/* ─── NAVBAR SCROLL STATES ─── */
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

/* ─── MOBILE MENU ACTIONS ─── */
function openMobileMenu() {
  if (mobileMenu) mobileMenu.classList.add('open');
  if (hamburger) {
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
  }
  document.body.classList.add('no-scroll');
  // Move focus to close button for accessibility
  if (mobileClose) mobileClose.focus();
}

function closeMobileMenu() {
  if (mobileMenu) mobileMenu.classList.remove('open');
  if (hamburger) {
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.focus(); // Return focus to hamburger
  }
  document.body.classList.remove('no-scroll');
}

if (hamburger) {
  hamburger.addEventListener('click', openMobileMenu);
}

if (mobileClose) {
  mobileClose.addEventListener('click', closeMobileMenu);
  // Keyboard support for close button
  mobileClose.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      closeMobileMenu();
    }
  });
}

// Close when clicking any link
mobileLinks.forEach(link => {
  link.addEventListener('click', closeMobileMenu);
});

// Close when clicking outside the menu contents (on the backdrop overlay)
if (mobileMenu) {
  mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) {
      closeMobileMenu();
    }
  });
}

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('open')) {
    closeMobileMenu();
  }
});

/* ─── ACTIVE NAV LINK HIGHLIGHTING ─── */
const sections = document.querySelectorAll('section[id], div[id="home"]');
const navLinksList = document.querySelectorAll('.nav-links a');

if (sections.length && navLinksList.length) {
  const observerOptions = {
    root: null,
    rootMargin: '-40% 0px -55% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinksList.forEach(link => {
          link.removeAttribute('aria-current');
          if (link.getAttribute('href') === '#' + entry.target.id) {
            link.setAttribute('aria-current', 'page');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => sectionObserver.observe(section));
}

/* ─── FORM VALIDATION & GOOGLE SHEET SUBMISSION ─── */
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxaaeBP7WPHdw5u6A9yXtiGKj07O1-3OLeQpNTGLcCO7eC2dOY_17IW18lFpKNsj779CQ/exec';

if (enquiryForm) {
  enquiryForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const btn = this.querySelector('.form-submit');
    const msg = document.getElementById('form-msg');
    if (!msg) return;

    // Input fields
    const nameInput = document.getElementById('fname');
    const phoneInput = document.getElementById('fphone');
    const emailInput = document.getElementById('femail');
    const businessInput = document.getElementById('fbusiness');
    const serviceInput = document.getElementById('fservice');
    const budgetInput = document.getElementById('fbudget');
    const messageInput = document.getElementById('fmessage');

    const name = nameInput ? nameInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const business = businessInput ? businessInput.value : '';
    const service = serviceInput ? serviceInput.value : '';
    const budget = budgetInput ? budgetInput.value : '';
    const message = messageInput ? messageInput.value.trim() : '';

    // Reset feedback messages
    msg.style.display = 'none';
    msg.className = '';
    msg.textContent = '';

    // Validate name
    if (!name) {
      showError(msg, '⚠️ Please enter your full name.');
      if (nameInput) nameInput.focus();
      return;
    }

    // Simple phone number validation (must be at least 10 digits)
    const phoneClean = phone.replace(/[^0-9+]/g, '');
    if (phoneClean.length < 10) {
      showError(msg, '⚠️ Please enter a valid 10-digit phone/WhatsApp number.');
      if (phoneInput) phoneInput.focus();
      return;
    }

    // Simple email validation if user entered an email
    if (email !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showError(msg, '⚠️ Please enter a valid email address.');
        if (emailInput) emailInput.focus();
        return;
      }
    }

    // Disable submission UI
    btn.textContent = '⏳ Submitting...';
    btn.disabled = true;

    const payload = {
      timestamp: new Date().toLocaleString('en-IN'),
      name: name,
      phone: phone,
      email: email,
      business: business,
      service: service,
      budget: budget,
      message: message,
    };

    try {
      if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
        // Demo/development mode fallback
        await new Promise(resolve => setTimeout(resolve, 1000));
        showSuccess(msg, '✅ Enquiry received! We will contact you within 24 hours. Thank you!');
        this.reset();
      } else {
        // Submit data to google sheets webapp
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        showSuccess(msg, '✅ Enquiry submitted! We will contact you within 24 hours. Thank you!');
        this.reset();
      }
    } catch (err) {
      console.error('Submission error:', err);
      showError(msg, '❌ Something went wrong. Please call/WhatsApp us directly at +91 79822 29379.');
    } finally {
      btn.textContent = '🚀 Submit Enquiry – Get Free Consultation';
      btn.disabled = false;
      msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
}

/* ─── HELPER FUNCTIONS ─── */
function showError(msgEl, text) {
  msgEl.style.display = 'block';
  msgEl.className = 'error';
  msgEl.textContent = text;
}

function showSuccess(msgEl, text) {
  msgEl.style.display = 'block';
  msgEl.className = 'success';
  msgEl.textContent = text;
}

/* ─── SIDEBAR ACTIVE LINK OBSERVER (LEGAL PAGES) ─── */
const legalSections = document.querySelectorAll('.legal-card');
const tocItems = document.querySelectorAll('.toc-item');
const tocCard = document.querySelector('.toc-card');
const tocTitle = document.getElementById('toc-toggle-btn');

if (tocTitle && tocCard) {
  tocTitle.addEventListener('click', () => {
    if (window.innerWidth < 992) {
      tocCard.classList.toggle('open');
    }
  });
}

const tocLinks = document.querySelectorAll('.toc-item a');
tocLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth < 992 && tocCard) {
      tocCard.classList.remove('open');
    }
  });
});

if (legalSections.length && tocItems.length) {
  const legalObserverOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const legalObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const activeId = entry.target.getAttribute('id');
        tocItems.forEach(item => {
          const link = item.querySelector('a');
          if (link && link.getAttribute('href') === `#${activeId}`) {
            item.classList.add('active');
            if (window.innerWidth >= 992) {
              const sidebar = document.querySelector('.legal-sidebar');
              if (sidebar) {
                // Defer geometry measurement to next animation frame to prevent forced reflow / layout thrashing
                requestAnimationFrame(() => {
                  const sidebarRect = sidebar.getBoundingClientRect();
                  const itemRect = item.getBoundingClientRect();
                  if (itemRect.top < sidebarRect.top || itemRect.bottom > sidebarRect.bottom) {
                    const relativeTop = itemRect.top - sidebarRect.top + sidebar.scrollTop;
                    sidebar.scrollTo({
                      top: relativeTop - sidebar.clientHeight / 2 + itemRect.height / 2,
                      behavior: 'smooth'
                    });
                  }
                });
              }
            }
          } else {
            item.classList.remove('active');
          }
        });
      }
    });
  }, legalObserverOptions);

  legalSections.forEach(section => legalObserver.observe(section));
}


