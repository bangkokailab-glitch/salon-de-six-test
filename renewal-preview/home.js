(() => {
  'use strict';
  const asset = 'assets/home-20261028/';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const behavior = () => reducedMotion.matches ? 'instant' : 'smooth';
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function makeDot(label, action) {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', action);
    return button;
  }

  document.querySelectorAll('[data-carousel]').forEach(root => {
    const track = root.querySelector('.slide-track');
    const slides = [...track.children];
    const dots = root.querySelector('.carousel-dots');
    const thumbs = root.querySelector('.thumb-track');
    const previous = root.querySelector('[data-prev]');
    const next = root.querySelector('[data-next]');
    const status = root.querySelector('.carousel-status');
    let current = 0;
    let frame = 0;

    function go(index) {
      const target = clamp(index, 0, slides.length - 1);
      if (slides.some(slide => slide.contains(document.activeElement))) track.focus({ preventScroll: true });
      track.scrollTo({ left: target * track.clientWidth, behavior: behavior() });
    }

    const dotButtons = slides.map((slide, index) => {
      const dot = makeDot(`${index + 1} / ${slides.length} ${slide.dataset.title}`, () => go(index));
      dots.append(dot);
      return dot;
    });

    const thumbButtons = thumbs ? slides.map((slide, index) => {
      const button = makeDot(slide.dataset.title + 'を見る', () => go(index));
      button.className = 'thumb';
      const photo = document.createElement('img');
      photo.src = asset + slide.dataset.photo + '.webp';
      photo.alt = '';
      photo.width = 160;
      photo.height = 90;
      photo.loading = 'lazy';
      const label = document.createElement('span');
      label.textContent = slide.dataset.short;
      button.append(photo, label);
      thumbs.append(button);
      return button;
    }) : [];

    function update() {
      if (!track.clientWidth) return;
      const selected = clamp(Math.round(track.scrollLeft / track.clientWidth), 0, slides.length - 1);
      const changed = current !== selected;
      current = selected;
      dotButtons.forEach((dot, index) => dot.setAttribute('aria-pressed', String(index === current)));
      thumbButtons.forEach((thumb, index) => thumb.setAttribute('aria-pressed', String(index === current)));
      // Only the visible card joins the tab order; controls remain available.
      slides.forEach((slide, index) => {
        if (index !== current && slide.contains(document.activeElement)) track.focus({ preventScroll: true });
        slide.inert = index !== current;
        slide.setAttribute('aria-label', `${index + 1} / ${slides.length} ${slide.dataset.title}`);
        if (index !== current) {
          slide.querySelectorAll('.video-frame iframe').forEach(iframe => iframe.remove());
          slide.querySelectorAll('.video-play').forEach(poster => { poster.hidden = false; });
        }
      });
      previous.disabled = current === 0;
      next.disabled = current === slides.length - 1;
      if ((document.activeElement === previous && previous.disabled) || (document.activeElement === next && next.disabled)) dotButtons[current].focus({ preventScroll: true });
      status.textContent = `${current + 1} / ${slides.length} ${slides[current].dataset.title}`;
      if (thumbs && changed) {
        const thumb = thumbButtons[current];
        const left = thumb.offsetLeft;
        if (left < thumbs.scrollLeft || left + thumb.clientWidth > thumbs.scrollLeft + thumbs.clientWidth) {
          thumbs.scrollTo({ left: left - (thumbs.clientWidth - thumb.clientWidth) / 2, behavior: behavior() });
        }
      }
    }

    previous.addEventListener('click', () => go(current - 1));
    next.addEventListener('click', () => go(current + 1));
    track.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        go(current + (event.key === 'ArrowRight' ? 1 : -1));
      } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        go(event.key === 'Home' ? 0 : slides.length - 1);
      }
    });
    track.addEventListener('scroll', () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    }, { passive: true });
    new ResizeObserver(() => {
      if (!track.clientWidth) return;
      track.scrollTo({ left: current * track.clientWidth, behavior: 'instant' });
      update();
    }).observe(track);
    root.querySelectorAll('.js-control').forEach(control => { control.hidden = false; });
    update();
  });

  document.querySelectorAll('.video-play').forEach(poster => {
    poster.addEventListener('click', event => {
      event.preventDefault();
      const frame = poster.closest('.video-frame');
      if (frame.querySelector('iframe')) return;
      const iframe = document.createElement('iframe');
      iframe.title = poster.getAttribute('aria-label');
      iframe.src = `https://www.youtube-nocookie.com/embed/${frame.dataset.video}?autoplay=1&rel=0&playsinline=1`;
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      frame.append(iframe);
      poster.hidden = true;
      iframe.focus();
    });
  });

  const instagram = document.querySelector('.instagram-track');
  const instagramDots = document.querySelector('.instagram-dots');
  const positionButtons = [0, 1, 2].map(index => {
    const dot = makeDot(`写真一覧の位置 ${index + 1} / 3`, () => {
      instagram.scrollTo({ left: (instagram.scrollWidth - instagram.clientWidth) * index / 2, behavior: behavior() });
    });
    instagramDots.append(dot);
    return dot;
  });
  function updateInstagram() {
    const max = instagram.scrollWidth - instagram.clientWidth;
    const active = max > 0 ? Math.round(instagram.scrollLeft / max * 2) : 0;
    positionButtons.forEach((button, index) => button.setAttribute('aria-pressed', String(index === active)));
  }
  instagram.addEventListener('scroll', updateInstagram, { passive: true });
  instagramDots.hidden = false;
  updateInstagram();

  const menu = document.querySelector('#site-menu');
  const menuTrigger = document.querySelector('.header-menu');
  menuTrigger.addEventListener('click', () => {
    menu.showModal();
    menuTrigger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  });
  document.querySelector('.menu-close').addEventListener('click', () => menu.close());
  menu.addEventListener('click', event => {
    if (event.target === menu) {
      const rect = menu.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) menu.close();
    }
    if (event.target.closest('a')) menu.close();
  });
  menu.addEventListener('close', () => {
    menuTrigger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    menuTrigger.focus({ preventScroll: true });
  });

  const sticky = document.querySelector('.sticky-coupon');
  const heroCoupon = document.querySelector('.hero-coupon');
  new ResizeObserver(() => {
    document.documentElement.style.setProperty('--sticky-height', `${sticky.hidden ? 0 : sticky.getBoundingClientRect().height}px`);
  }).observe(sticky);
  let keyboardNavigation = false;
  document.addEventListener('keydown', () => { keyboardNavigation = true; }, true);
  document.addEventListener('pointerdown', () => { keyboardNavigation = false; }, true);
  document.addEventListener('focusin', event => {
    if (!keyboardNavigation || sticky.hidden || menu.open || sticky.contains(event.target)) return;
    requestAnimationFrame(() => {
      const rect = event.target.getBoundingClientRect();
      const limit = sticky.getBoundingClientRect().top - 16;
      if (rect.bottom > limit && rect.top < innerHeight) window.scrollBy({ top: rect.bottom - limit, behavior: 'instant' });
    });
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      const visible = !entry.isIntersecting && entry.boundingClientRect.bottom < 0;
      sticky.hidden = !visible;
      document.body.classList.toggle('has-sticky', visible);
    }, { threshold: 0 }).observe(heroCoupon);

    document.documentElement.classList.add('motion-ready');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('reveal-pending');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.05 });
    document.querySelectorAll('[data-reveal]').forEach(element => {
      if (element.getBoundingClientRect().top > window.innerHeight && !reducedMotion.matches) element.classList.add('reveal-pending');
      observer.observe(element);
    });
    reducedMotion.addEventListener('change', () => {
      if (reducedMotion.matches) document.querySelectorAll('.reveal-pending').forEach(element => element.classList.remove('reveal-pending'));
    });
  }
})();
