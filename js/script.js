/* Mellow Leaf Milk Tea House: interactions (vanilla JS, no dependencies) */
(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  var desktopQuery = window.matchMedia('(min-width: 768px)');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---- Mobile navigation -------------------------------------------- */
  function setMenu(open) {
    header.classList.toggle('is-menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('click', function (event) {
    if (!header.contains(event.target)) { setMenu(false); }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      toggle.focus();
    }
  });

  desktopQuery.addEventListener('change', function (event) {
    if (event.matches) { setMenu(false); }
  });

  /* ---- Smooth in-page links (keeps focus management accessible) ----- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      var id = link.getAttribute('href');
      if (id.length < 2) { return; }
      var target = document.querySelector(id);
      if (!target) { return; }
      event.preventDefault();
      setMenu(false);
      target.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
      if (window.history && window.history.pushState) { window.history.pushState(null, '', id); }
      if (!target.hasAttribute('tabindex')) { target.setAttribute('tabindex', '-1'); }
      target.focus({ preventScroll: true });
    });
  });

  /* ---- Header shadow + active section link -------------------------- */
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav__link'));
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        navLinks.forEach(function (link) {
          var active = link.getAttribute('href') === '#' + entry.target.id;
          if (active) { link.setAttribute('aria-current', 'true'); } else { link.removeAttribute('aria-current'); }
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    navLinks.forEach(function (link) {
      var section = document.querySelector(link.getAttribute('href'));
      if (section) { observer.observe(section); }
    });
  }

  /* ---- Menu category filters ---------------------------------------- */
  var scroller = document.querySelector('.filter-bar__scroll');
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.product-card'));
  var status = document.getElementById('menu-status');

  function applyFilter(category, label) {
    var shown = 0;
    cards.forEach(function (card) {
      var match = category === 'all' || card.getAttribute('data-category') === category;
      card.hidden = !match;
      card.classList.remove('is-entering');
      if (match) {
        shown += 1;
        void card.offsetWidth; // restart the entry animation
        card.classList.add('is-entering');
      }
    });
    chips.forEach(function (chip) {
      chip.setAttribute('aria-pressed', String(chip.getAttribute('data-filter') === category));
    });
    status.textContent = 'Showing ' + shown + (shown === 1 ? ' item' : ' items') + (category === 'all' ? '' : ' in ' + label);
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      applyFilter(chip.getAttribute('data-filter'), chip.textContent);
      // Keep the chosen chip comfortably in view on touch screens
      var left = chip.offsetLeft - (scroller.clientWidth - chip.offsetWidth) / 2;
      scroller.scrollTo({ left: left, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    });
  });
})();
