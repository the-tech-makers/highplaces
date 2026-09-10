(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Sticky site header <-> sticky tour nav handoff ----------
     Rule: only one sticky bar may occupy the viewport top at a time.
     The tour nav becomes sticky once its natural position reaches the
     top of the viewport; the moment that happens, the main site header
     is translated out of the flow so it no longer competes for space. */
  var siteHeader = document.getElementById('site-header');
  var tourNav = document.getElementById('tour-nav');
  var tourNavSentinel = document.getElementById('tour-nav-sentinel');

  function setNavHeightVar() {
    if (!tourNav) return;
    document.documentElement.style.setProperty('--nav-h', tourNav.offsetHeight + 'px');
  }
  setNavHeightVar();
  window.addEventListener('resize', setNavHeightVar);

  if (siteHeader && tourNav && tourNavSentinel && 'IntersectionObserver' in window) {
    var headerObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var stuck = !entry.isIntersecting;
          tourNav.classList.toggle('is-stuck', stuck);
          siteHeader.classList.toggle('is-hidden', stuck);
          siteHeader.setAttribute('aria-hidden', String(stuck));
        });
      },
      { threshold: 0, rootMargin: '0px' }
    );
    headerObserver.observe(tourNavSentinel);
  }

  /* ---------- Active tour-nav item via IntersectionObserver ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('[data-tour-section]'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('#tour-nav a[data-nav-link]'));

  function setActive(id) {
    navLinks.forEach(function (link) {
      var match = link.getAttribute('href') === '#' + id;
      link.setAttribute('aria-current', match ? 'true' : 'false');
      if (match) {
        link.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    });
  }

  if (sections.length && 'IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        var visible = entries
          .filter(function (e) { return e.isIntersecting; })
          .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; });
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    sections.forEach(function (s) { sectionObserver.observe(s); });
  }

  /* ---------- Sticky booking sidebar via StickySidebar library ---------- */
  function initStickySidebar() {
    if (typeof StickySidebar !== 'undefined') {
      var sidebarContainer = document.getElementById('booking-sidebar-container');
      if (sidebarContainer && window.matchMedia('(min-width: 1024px)').matches) {
        try {
          new StickySidebar('#booking-sidebar-container', {
            topSpacing: function () {
              var nav = document.getElementById('tour-nav');
              return (nav ? nav.offsetHeight : 0) + 20;
            },
            bottomSpacing: 24,
            containerSelector: '#tour-content-row',
            innerWrapperSelector: '.sidebar__inner',
            minWidth: 1024
          });
        } catch (e) {
          console.warn('StickySidebar init error:', e);
        }
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStickySidebar);
  } else {
    initStickySidebar();
  }
})();