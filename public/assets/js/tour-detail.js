(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Sticky header & tour nav coordination ----------
     Site header is visible at the top initially.
     When the tour navigation reaches the top, it sticks at top-0, overlapping
     and hiding the main site header. */
  var siteHeader = document.getElementById('site-header');
  var tourNav = document.getElementById('tour-nav');
  var tourSentinel = document.getElementById('tour-nav-sentinel');

  function updateNavHeightVars() {
    if (tourNav) {
      document.documentElement.style.setProperty('--nav-h', tourNav.offsetHeight + 'px');
    }
  }
  updateNavHeightVars();
  window.addEventListener('resize', updateNavHeightVars);

  function checkTourNavStuck() {
    if (!tourNav) return;
    var stuck = tourSentinel
      ? tourSentinel.getBoundingClientRect().top <= 0
      : tourNav.getBoundingClientRect().top <= 0;

    if (siteHeader) {
      siteHeader.classList.toggle('is-hidden', stuck);
    }
    tourNav.classList.toggle('is-stuck', stuck);
  }
  window.addEventListener('scroll', checkTourNavStuck, { passive: true });
  checkTourNavStuck();

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
      { rootMargin: '-80px 0px -50% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
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
              var navH = tourNav ? tourNav.offsetHeight : 55;
              return navH + 20;
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

  /* ---------- Gallery Strip Slider (Arrows & Mobile Dots) ---------- */
  var stripTrack = document.getElementById('gallery-strip-track');
  var stripPrev = document.getElementById('gallery-strip-prev');
  var stripNext = document.getElementById('gallery-strip-next');
  var stripDotsContainer = document.getElementById('gallery-strip-dots');
  var thumbs = Array.prototype.slice.call(document.querySelectorAll('.gallery-thumb'));

  if (stripTrack) {
    if (stripPrev) {
      stripPrev.addEventListener('click', function () {
        stripTrack.scrollBy({ left: -stripTrack.clientWidth * 0.75, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    }
    if (stripNext) {
      stripNext.addEventListener('click', function () {
        stripTrack.scrollBy({ left: stripTrack.clientWidth * 0.75, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    }

    function updateStripControls() {
      var maxScroll = stripTrack.scrollWidth - stripTrack.clientWidth;
      if (stripPrev) stripPrev.disabled = stripTrack.scrollLeft <= 4;
      if (stripNext) stripNext.disabled = stripTrack.scrollLeft >= maxScroll - 4;

      if (stripDotsContainer && thumbs.length) {
        var center = stripTrack.scrollLeft + stripTrack.clientWidth / 2;
        var closestIdx = 0;
        var closestDist = Infinity;
        thumbs.forEach(function (t, idx) {
          var tCenter = t.offsetLeft + t.offsetWidth / 2;
          var dist = Math.abs(center - tCenter);
          if (dist < closestDist) {
            closestDist = dist;
            closestIdx = idx;
          }
        });
        var dots = stripDotsContainer.querySelectorAll('.gallery-dot');
        dots.forEach(function (d, idx) {
          d.classList.toggle('is-active', idx === closestIdx);
        });
      }
    }

    if (stripDotsContainer && thumbs.length) {
      stripDotsContainer.innerHTML = '';
      thumbs.forEach(function (t, idx) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'gallery-dot' + (idx === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', 'Go to photo ' + (idx + 1));
        dot.addEventListener('click', function () {
          t.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
        });
        stripDotsContainer.appendChild(dot);
      });
    }

    stripTrack.addEventListener('scroll', updateStripControls, { passive: true });
    window.addEventListener('resize', updateStripControls);
    updateStripControls();
  }

  /* ---------- Lightbox Image Gallery Modal ---------- */
  var lightbox = document.getElementById('gallery-lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxCaption = document.getElementById('lightbox-caption');
  var lightboxCounter = document.getElementById('lightbox-counter');
  var lightboxPrev = document.getElementById('lightbox-prev');
  var lightboxNext = document.getElementById('lightbox-next');
  var lightboxClose = document.getElementById('lightbox-close');
  var lightboxThumbs = document.getElementById('lightbox-thumbs');

  if (lightbox && thumbs.length) {
    var galleryData = thumbs.map(function (t) {
      var img = t.querySelector('img');
      return {
        src: t.getAttribute('data-src') || (img ? img.src : ''),
        caption: t.getAttribute('data-caption') || '',
        alt: img ? img.alt : ''
      };
    });

    var activePhotoIndex = 0;

    if (lightboxThumbs) {
      lightboxThumbs.innerHTML = '';
      galleryData.forEach(function (item, idx) {
        var miniBtn = document.createElement('button');
        miniBtn.type = 'button';
        miniBtn.className = 'lightbox-mini-thumb h-12 w-16 shrink-0 overflow-hidden rounded border-2 border-transparent opacity-60 transition hover:opacity-100 focus:outline-none';
        miniBtn.setAttribute('aria-label', 'View photo ' + (idx + 1));
        var miniImg = document.createElement('img');
        miniImg.src = item.src;
        miniImg.alt = item.alt;
        miniImg.className = 'h-full w-full object-cover';
        miniBtn.appendChild(miniImg);
        miniBtn.addEventListener('click', function () {
          setLightboxPhoto(idx);
        });
        lightboxThumbs.appendChild(miniBtn);
      });
    }

    function setLightboxPhoto(index) {
      activePhotoIndex = (index + galleryData.length) % galleryData.length;
      var photo = galleryData[activePhotoIndex];

      if (lightboxImg) {
        lightboxImg.src = photo.src;
        lightboxImg.alt = photo.alt;
      }
      if (lightboxCaption) {
        lightboxCaption.textContent = photo.caption;
      }
      if (lightboxCounter) {
        lightboxCounter.textContent = 'Photo ' + (activePhotoIndex + 1) + ' of ' + galleryData.length;
      }

      if (lightboxThumbs) {
        var miniThumbs = lightboxThumbs.querySelectorAll('.lightbox-mini-thumb');
        miniThumbs.forEach(function (btn, idx) {
          var isActive = idx === activePhotoIndex;
          btn.classList.toggle('border-brand-orange', isActive);
          btn.classList.toggle('opacity-100', isActive);
          btn.classList.toggle('opacity-60', !isActive);
          if (isActive) {
            btn.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
          }
        });
      }
    }

    function openLightbox(index) {
      setLightboxPhoto(index);
      if (typeof lightbox.showModal === 'function') {
        lightbox.showModal();
      } else {
        lightbox.setAttribute('open', '');
      }
      document.body.classList.add('overflow-hidden');
    }

    function closeLightbox() {
      if (typeof lightbox.close === 'function') {
        lightbox.close();
      } else {
        lightbox.removeAttribute('open');
      }
      document.body.classList.remove('overflow-hidden');
    }

    thumbs.forEach(function (t) {
      t.addEventListener('click', function () {
        var idx = parseInt(t.getAttribute('data-index'), 10) || 0;
        openLightbox(idx);
      });
    });

    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeLightbox);
    }
    if (lightboxPrev) {
      lightboxPrev.addEventListener('click', function () {
        setLightboxPhoto(activePhotoIndex - 1);
      });
    }
    if (lightboxNext) {
      lightboxNext.addEventListener('click', function () {
        setLightboxPhoto(activePhotoIndex + 1);
      });
    }

    lightbox.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setLightboxPhoto(activePhotoIndex - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setLightboxPhoto(activePhotoIndex + 1);
      } else if (e.key === 'Escape') {
        closeLightbox();
      }
    });

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    var touchStartX = 0;
    var touchStartY = 0;
    lightbox.addEventListener('touchstart', function (e) {
      if (e.touches && e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    lightbox.addEventListener('touchend', function (e) {
      if (e.changedTouches && e.changedTouches.length === 1) {
        var deltaX = e.changedTouches[0].clientX - touchStartX;
        var deltaY = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
          if (deltaX > 0) {
            setLightboxPhoto(activePhotoIndex - 1);
          } else {
            setLightboxPhoto(activePhotoIndex + 1);
          }
        }
      }
    }, { passive: true });
  }
})();