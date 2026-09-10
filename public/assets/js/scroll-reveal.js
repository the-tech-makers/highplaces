/**
 * Scroll Reveal Engine - High Places
 * Provides smooth, performant scroll entrance animations using IntersectionObserver.
 */
(function () {
  'use strict';

  // Mark document as ready for reveal animations
  const root = document.documentElement;
  root.classList.add('reveal-ready');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initScrollReveal() {
    // If reduced motion is preferred, reveal everything without animation
    if (prefersReducedMotion) {
      document.querySelectorAll('.reveal, .reveal-group > *').forEach((el) => {
        el.classList.add('is-revealed');
      });
      return;
    }

    // Process reveal groups to automatically stagger children
    document.querySelectorAll('.reveal-group').forEach((group) => {
      const step = parseInt(group.dataset.revealStagger, 10) || 160; // ms per item
      const maxStagger = 1000; // cap stagger delay to keep UX snappy
      const children = Array.from(group.children);

      children.forEach((child, index) => {
        if (!child.classList.contains('reveal')) {
          child.classList.add('reveal');
        }
        const delay = Math.min(index * step, maxStagger);
        child.style.transitionDelay = `${delay}ms`;
      });
    });

    // Custom delays via data-reveal-delay
    document.querySelectorAll('.reveal[data-reveal-delay]').forEach((el) => {
      const delay = parseInt(el.dataset.revealDelay, 10) || 0;
      el.style.transitionDelay = `${delay}ms`;
    });

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.08
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach((el) => {
      // If already in viewport on page load (e.g. above-the-fold hero), reveal promptly
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        requestAnimationFrame(() => {
          el.classList.add('is-revealed');
        });
      } else {
        revealObserver.observe(el);
      }
    });

    // Expose refresh function for dynamic updates
    window.refreshScrollReveal = function () {
      document.querySelectorAll('.reveal:not(.is-revealed)').forEach((el) => {
        revealObserver.observe(el);
      });
    };
  }

  function initStickyHeader() {
    const header = document.getElementById('site-header');
    if (!header) return;

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (window.scrollY > 20) {
            header.classList.add('is-scrolled');
          } else {
            header.classList.remove('is-scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function start() {
    initScrollReveal();
    initStickyHeader();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();