/**
 * Minimal JS to make Radix UI server-rendered components interactive
 * (Accordions, Tabs, Carousel)
 */

document.addEventListener('DOMContentLoaded', function () {

  // --- Accordions ---
  document.querySelectorAll('[data-orientation="vertical"].border-b').forEach(function (item) {
    var btn = item.querySelector('button[data-radix-collection-item]');
    if (!btn) return;

    btn.addEventListener('click', function () {
      var panel = item.querySelector('[role="region"]');
      if (!panel) return;

      var isOpen = item.getAttribute('data-state') === 'open';

      // Close all siblings first (single-open accordion)
      var accordion = item.parentElement;
      accordion.querySelectorAll(':scope > .border-b[data-state]').forEach(function (sib) {
        sib.setAttribute('data-state', 'closed');
        var sibH3 = sib.querySelector('h3');
        if (sibH3) sibH3.setAttribute('data-state', 'closed');
        var sibBtn = sib.querySelector('button');
        if (sibBtn) {
          sibBtn.setAttribute('data-state', 'closed');
          sibBtn.setAttribute('aria-expanded', 'false');
        }
        var sibPanel = sib.querySelector('[role="region"]');
        if (sibPanel) {
          sibPanel.setAttribute('data-state', 'closed');
          sibPanel.setAttribute('hidden', '');
        }
      });

      if (!isOpen) {
        item.setAttribute('data-state', 'open');
        var h3 = item.querySelector('h3');
        if (h3) h3.setAttribute('data-state', 'open');
        btn.setAttribute('data-state', 'open');
        btn.setAttribute('aria-expanded', 'true');
        panel.setAttribute('data-state', 'open');
        panel.removeAttribute('hidden');
      }
    });
  });

  // --- Tabs ---
  document.querySelectorAll('[role="tablist"] [role="tab"]').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var tablist = tab.closest('[data-orientation="horizontal"]').parentElement || tab.closest('[dir="ltr"]');
      var container = tab.closest('[dir="ltr"]') || tablist;

      // Deactivate all tabs
      container.querySelectorAll('[role="tab"]').forEach(function (t) {
        t.setAttribute('data-state', 'inactive');
        t.setAttribute('aria-selected', 'false');
      });

      // Hide all panels
      container.querySelectorAll('[role="tabpanel"]').forEach(function (p) {
        p.setAttribute('data-state', 'inactive');
        p.setAttribute('hidden', '');
      });

      // Activate clicked tab
      tab.setAttribute('data-state', 'active');
      tab.setAttribute('aria-selected', 'true');

      // Show corresponding panel
      var panelId = tab.getAttribute('aria-controls');
      var panel = document.getElementById(panelId);
      if (panel) {
        panel.setAttribute('data-state', 'active');
        panel.removeAttribute('hidden');
      }
    });
  });

  // --- Carousel ---
  document.querySelectorAll('[aria-roledescription="carousel"]').forEach(function (carousel) {
    var track = carousel.querySelector('.flex.-ml-4');
    if (!track) return;

    var slides = track.querySelectorAll('[aria-roledescription="slide"]');
    if (slides.length === 0) return;

    var prevBtn = carousel.querySelector('button:has(.lucide-arrow-left)');
    var nextBtn = carousel.querySelector('button:has(.lucide-arrow-right)');
    var currentIndex = 0;

    function getVisibleCount() {
      var w = window.innerWidth;
      if (w >= 1024) return 3;
      if (w >= 768) return 2;
      return 1;
    }

    function updateCarousel() {
      var visible = getVisibleCount();
      var maxIndex = Math.max(0, slides.length - visible);
      if (currentIndex > maxIndex) currentIndex = maxIndex;
      if (currentIndex < 0) currentIndex = 0;

      var slideWidth = 100 / visible;
      track.style.transform = 'translateX(-' + (currentIndex * slideWidth) + '%)';
      track.style.transition = 'transform 0.3s ease';

      if (prevBtn) prevBtn.disabled = (currentIndex === 0);
      if (nextBtn) nextBtn.disabled = (currentIndex >= maxIndex);
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        currentIndex--;
        updateCarousel();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        currentIndex++;
        updateCarousel();
      });
    }

    updateCarousel();
    window.addEventListener('resize', updateCarousel);
  });

  // --- Mobile nav toggle ---
  var nav = document.querySelector('header nav');
  if (nav && window.innerWidth < 768) {
    var toggleBtn = document.createElement('button');
    toggleBtn.className = 'md:hidden text-gray-600 text-2xl';
    toggleBtn.innerHTML = '&#9776;';
    toggleBtn.style.cssText = 'display:none;';

    // Only show toggle on small screens
    var mq = window.matchMedia('(max-width: 767px)');
    function handleMQ(e) {
      if (e.matches) {
        nav.querySelector('ul').style.display = 'none';
        toggleBtn.style.display = 'block';
      } else {
        nav.querySelector('ul').style.display = '';
        toggleBtn.style.display = 'none';
      }
    }

    toggleBtn.addEventListener('click', function () {
      var ul = nav.querySelector('ul');
      ul.style.display = ul.style.display === 'none' ? 'flex' : 'none';
      ul.style.flexDirection = 'column';
      ul.style.position = 'absolute';
      ul.style.top = '100%';
      ul.style.right = '0';
      ul.style.background = 'white';
      ul.style.padding = '1rem';
      ul.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
      ul.style.borderRadius = '0.5rem';
      ul.style.zIndex = '50';
    });

    nav.style.position = 'relative';
    nav.insertBefore(toggleBtn, nav.firstChild);
    mq.addListener(handleMQ);
    handleMQ(mq);
  }
});
