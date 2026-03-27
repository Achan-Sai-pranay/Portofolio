/* ═══════════════════════════════════════════════════════════════
   RESPONSIVE.JS  —  Mobile/tablet JS patches
   Add  <script src="responsive.js"></script>  at end of <body>,
   AFTER script.js
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const IS_MOBILE = window.innerWidth <= 900;
  const IS_TOUCH  = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  /* ─────────────────────────────────────────────
     1.  PHONE WRAPPER — freeze on mobile
         The JS tilt & CSS animation both need
         to be fully disabled so the phone stays
         static in the centered phone-slot.
  ───────────────────────────────────────────── */
  if (IS_MOBILE) {
    const wrapper = document.getElementById('phoneWrapper');
    if (wrapper) {
      wrapper.style.cssText = [
        'position: relative !important',
        'top: auto !important',
        'left: auto !important',
        'transform: none !important',
        'animation: none !important',
      ].join(';');
    }

    /* Also make sure boot/lock/home animations fire normally
       but the phone doesn't try to slide anywhere.
       Re-override after the CSS animation would have kicked in. */
    setTimeout(function () {
      if (wrapper) {
        wrapper.style.cssText = [
          'position: relative !important',
          'top: auto !important',
          'left: auto !important',
          'transform: none !important',
          'animation: none !important',
        ].join(';');
      }
    }, 7500);
  }

  /* ─────────────────────────────────────────────
     2.  CONTENT AREA — show immediately on mobile
         It starts at opacity:0 for desktop reveal.
  ───────────────────────────────────────────── */
  if (IS_MOBILE) {
    const ca = document.getElementById('contentArea');
    if (ca) {
      ca.style.opacity  = '1';
      ca.style.animation = 'none';
    }
  }

  /* ─────────────────────────────────────────────
     3.  SCROLL — use window scroll on mobile
         The desktop version scrolls #scrollMain;
         on mobile we need window scrolling for
         the sticky nav, section observers, etc.
  ───────────────────────────────────────────── */
  if (IS_MOBILE) {
    const scrollMain = document.getElementById('scrollMain');
    if (scrollMain) {
      /* Make scrollMain non-scrollable — let content flow naturally */
      scrollMain.style.overflow = 'visible';
      scrollMain.style.height   = 'auto';
    }

    /* Rewire nav links to use window scrollIntoView */
    document.querySelectorAll('.nav-link[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const id = link.getAttribute('href').replace('#', '');
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, true);
    });

    /* Rewire .scroll-cta buttons */
    document.querySelectorAll('.scroll-cta').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const id = btn.dataset.target;
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, true);
    });

    /* Rewire pdot nav (hidden on mobile but keep consistent) */
    document.querySelectorAll('.pdot').forEach(function (dot) {
      dot.addEventListener('click', function (e) {
        e.preventDefault();
        const id = dot.dataset.section;
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* ─────────────────────────────────────────────
     4.  NAV ACTIVE STATE — use window IntersectionObserver
         on mobile (desktop uses scrollMain as root)
  ───────────────────────────────────────────── */
  if (IS_MOBILE) {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.scroll-section[data-section]');

    const sObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const sid = entry.target.getAttribute('data-section');
          navLinks.forEach(function (l) {
            l.classList.toggle('active', l.getAttribute('data-section') === sid);
          });
        }
      });
    }, { threshold: 0.35 }); /* window root (null = viewport) */

    sections.forEach(function (s) { sObs.observe(s); });
  }

  /* ─────────────────────────────────────────────
     5.  REVEAL ANIMATIONS — trigger via window
         IntersectionObserver on mobile
  ───────────────────────────────────────────── */
  if (IS_MOBILE) {
    /* Items start visible (CSS forces opacity:1 on mobile) but
       we still fire the class to avoid any pending transitions. */
    document.querySelectorAll('.reveal-item, .reveal-card').forEach(function (el) {
      el.classList.add('visible');
    });

    /* Scramble text — fire on scroll into view */
    const SCRAMBLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!<>_/\\[]{}=+*^?#0123456789';
    function scramble(el) {
      var original = el.dataset.original || el.textContent;
      var iter = 0, total = original.length * 3;
      clearInterval(el._si);
      el._si = setInterval(function () {
        el.textContent = original.split('').map(function (ch, idx) {
          if (idx < iter / 3) return original[idx];
          if (ch === ' ') return ' ';
          return SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)];
        }).join('');
        iter++;
        if (iter > total) { el.textContent = original; clearInterval(el._si); }
      }, 30);
    }

    var scObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { scramble(e.target); scObs.unobserve(e.target); }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.scramble-text').forEach(function (el) {
      scObs.observe(el);
    });

    /* Stats counter — fire on scroll */
    var statsAnimated = false;
    var statsBar = document.querySelector('.stats-bar');
    if (statsBar) {
      var stObs = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting && !statsAnimated) {
          statsAnimated = true;
          document.querySelectorAll('.stat-num').forEach(function (el) {
            var target   = parseInt(el.dataset.target, 10) || 0;
            var duration = 1600;
            var start    = performance.now();
            function tick(now) {
              var p = Math.min((now - start) / duration, 1);
              var e = 1 - Math.pow(1 - p, 4);
              el.textContent = Math.round(e * target);
              if (p < 1) requestAnimationFrame(tick);
              else el.textContent = target;
            }
            requestAnimationFrame(tick);
          });
          stObs.disconnect();
        }
      }, { threshold: 0.3 });
      stObs.observe(statsBar);
    }
  }

  /* ─────────────────────────────────────────────
     6.  ORBITAL CANVAS — mobile resize
  ───────────────────────────────────────────── */
  if (IS_MOBILE) {
    window.addEventListener('resize', function () {
      var c = document.getElementById('orbitalCanvas');
      if (!c) return;
      var parent = c.parentElement;
      if (!parent) return;
      var size = Math.min(parent.getBoundingClientRect().width, 340);
      c.style.width  = size + 'px';
      c.style.height = size + 'px';
    }, { passive: true });
  }

  /* ─────────────────────────────────────────────
     7.  3D TERMINAL — disable drag on mobile,
         enable simple touch-tilt instead
  ───────────────────────────────────────────── */
  if (IS_MOBILE) {
    var terminal = document.getElementById('terminal3d');
    if (terminal) {
      terminal.style.transform = 'none';
      terminal.style.transition = 'none';
      /* Remove drag hint text */
      document.querySelectorAll('p').forEach(function (p) {
        if (p.textContent.includes('drag to rotate')) p.style.display = 'none';
      });
    }
  }

  /* ─────────────────────────────────────────────
     8.  SKILLS PANEL — close on swipe down
  ───────────────────────────────────────────── */
  if (IS_TOUCH) {
    var panel = document.getElementById('skillsPanel');
    if (panel) {
      var startY = 0, draggingPanel = false;

      panel.addEventListener('touchstart', function (e) {
        var body = panel.querySelector('.sp-body');
        if (body && body.scrollTop > 0) return; /* don't interfere with scroll */
        startY = e.touches[0].clientY;
        draggingPanel = true;
      }, { passive: true });

      panel.addEventListener('touchmove', function (e) {
        if (!draggingPanel) return;
        var dy = e.touches[0].clientY - startY;
        if (dy > 0) {
          panel.style.transition = 'none';
          panel.style.transform  = 'translateY(' + dy + 'px)';
        }
      }, { passive: true });

      panel.addEventListener('touchend', function (e) {
        if (!draggingPanel) return;
        draggingPanel = false;
        var dy = e.changedTouches[0].clientY - startY;
        panel.style.transition = '';
        if (dy > 100) {
          /* Swipe down far enough → close */
          if (window.closeSkillsPanel) window.closeSkillsPanel();
        } else {
          /* Snap back */
          panel.style.transform = '';
        }
      }, { passive: true });
    }
  }

  /* ─────────────────────────────────────────────
     9.  APP WINDOW CLOSE — also close on swipe
         down (iOS UX feel)
  ───────────────────────────────────────────── */
  if (IS_TOUCH) {
    document.querySelectorAll('.app-window').forEach(function (win) {
      var startY = 0, dragging = false;

      win.addEventListener('touchstart', function (e) {
        var body = win.querySelector('.aw-body');
        if (body && body.scrollTop > 0) return;
        startY   = e.touches[0].clientY;
        dragging = true;
      }, { passive: true });

      win.addEventListener('touchmove', function (e) {
        if (!dragging) return;
        var dy = e.touches[0].clientY - startY;
        if (dy > 0) {
          win.style.transition = 'none';
          win.style.transform  = 'translateY(' + dy + 'px)';
        }
      }, { passive: true });

      win.addEventListener('touchend', function (e) {
        if (!dragging) return;
        dragging = false;
        var dy = e.changedTouches[0].clientY - startY;
        win.style.transition = '';
        if (dy > 120) {
          win.style.transform = '';
          var id = win.id.replace('app-', '');
          if (window.closeApp) window.closeApp(id);
        } else {
          win.style.transform = '';
        }
      }, { passive: true });
    });
  }

  /* ─────────────────────────────────────────────
     10. PREVENT BODY SCROLL WHEN PANEL IS OPEN
  ───────────────────────────────────────────── */
  /* Already handled in openSkillsPanel / closeSkillsPanel in script.js
     but we reinforce it for mobile */
  var _open  = window.openSkillsPanel;
  var _close = window.closeSkillsPanel;
  window.openSkillsPanel = function () {
    if (_open) _open();
    if (IS_MOBILE) {
      document.body.style.overflow   = 'hidden';
      document.body.style.touchAction = 'none';
    }
  };
  window.closeSkillsPanel = function () {
    if (_close) _close();
    document.body.style.overflow    = '';
    document.body.style.touchAction = '';
  };

  /* ─────────────────────────────────────────────
     11. VIEWPORT HEIGHT FIX (iOS Safari 100vh bug)
  ───────────────────────────────────────────── */
  function setVhVar() {
    document.documentElement.style.setProperty('--svh', window.innerHeight * 0.01 + 'px');
  }
  setVhVar();
  window.addEventListener('resize', setVhVar, { passive: true });

  /* ─────────────────────────────────────────────
     12. DEBOUNCED RESIZE — recheck layout
  ───────────────────────────────────────────── */
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var isMob = window.innerWidth <= 900;
      var wrapper2 = document.getElementById('phoneWrapper');
      if (isMob && wrapper2) {
        wrapper2.style.cssText = [
          'position:relative!important',
          'top:auto!important',
          'left:auto!important',
          'transform:none!important',
          'animation:none!important',
        ].join(';');
      }
    }, 120);
  }, { passive: true });

})();