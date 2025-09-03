(function () {
  var nav = document.getElementById('site-nav');
  if (!nav) return;
  var btn = nav.querySelector('.nav-toggle');
  if (!btn) return;
  function toggle() {
    var expanded = nav.getAttribute('aria-expanded') === 'true';
    nav.setAttribute('aria-expanded', String(!expanded));
    btn.setAttribute('aria-expanded', String(!expanded));
  }
  btn.addEventListener('click', toggle);

  // Smooth scroll for nav links
  var navLinks = nav.querySelectorAll('a[href^="#"]');
  navLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      var targetId = this.getAttribute('href').substring(1);
      var targetElement = document.getElementById(targetId);
      if (targetElement) {
        // Close mobile menu if open
        nav.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-expanded', 'false');
        
        // Smooth scroll to target
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}());

(function () {
  var el = document.getElementById('year');
  if (el) el.textContent = String(new Date().getFullYear());
}());

// Loader logic
(function () {
  var overlay = document.getElementById('loader-overlay');
  var svg = document.getElementById('c-loader');
  var progressPath = document.getElementById('c-progress-path');
  if (!overlay || !svg || !progressPath) return;

  document.body.classList.add('is-loading');

  // Prepare progress path length for stroke-dash animation
  var pathLength = progressPath.getTotalLength();
  progressPath.style.strokeDasharray = String(pathLength);
  progressPath.style.strokeDashoffset = String(pathLength);

  var progress = 0; // 0..1
  var rafId;

  function setProgress(p) {
    progress = Math.max(0, Math.min(1, p));
    var offset = pathLength * (1 - progress);
    progressPath.style.strokeDashoffset = String(offset);
  }

  // Smoothly animate to target progress
  function animateTo(target, duration, cb) {
    var start = null;
    var initial = progress;
    function step(ts) {
      if (start === null) start = ts;
      var t = Math.min(1, (ts - start) / duration);
      var eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setProgress(initial + (target - initial) * eased);
      if (t < 1) rafId = requestAnimationFrame(step); else if (cb) cb();
    }
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(step);
  }

  // Phase 1: pre-load progress to 85%
  animateTo(0.85, 900);

  function finishLoading() {
    // Phase 2: complete to 100%, then fade overlay; fade avatar frame after
    animateTo(1, 600, function () {
      var frame = document.querySelector('.avatar-frame');
      if (frame) {
        // Clone the loader so avatar has its own copy when it fades in later
        var svgClone = svg.cloneNode(true);
        frame.prepend(svgClone);
        svgClone.removeAttribute('style');

        // Begin slow fade-out on overlay+hexagon (same timing)
        overlay.classList.add('is-fading');

        // After fade completes, hide overlay and then fade in avatar frame
        setTimeout(function () {
          overlay.classList.add('is-hidden');
          overlay.setAttribute('aria-hidden', 'true');
          document.body.classList.remove('is-loading');

          // Now reveal avatar frame over the same 1s duration
          frame.classList.add('is-visible');
        }, 800); // matches 750ms CSS fade + small buffer
      } else {
        overlay.classList.add('is-fading');
        setTimeout(function () {
          overlay.classList.add('is-hidden');
          overlay.setAttribute('aria-hidden', 'true');
          document.body.classList.remove('is-loading');
        }, 2050);
      }
    });
  }

  if (document.readyState === 'complete') {
    setTimeout(finishLoading, 300);
  } else {
    window.addEventListener('load', function () { setTimeout(finishLoading, 300); });
  }
}());


