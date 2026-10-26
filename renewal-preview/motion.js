(() => {
  'use strict';

  const root = document.documentElement;
  const numberFormat = new Intl.NumberFormat('ja-JP');
  const activeCounters = new Map();
  const finishedCounters = new WeakSet();
  const counterGroups = new Map();
  const pendingTargets = new Set();
  const pendingLoadTargets = new Set();
  let observer;
  let revealResizeFrame = 0;
  let viewportFrame = 0;
  let reveals = [];
  let counters = [];
  let reduceMotion = false;

  const targetFor = (element) => {
    const value = Number(element.dataset.counter);
    return Number.isFinite(value) && value >= 1 ? Math.floor(value) : null;
  };

  function finishCounter(element) {
    const animation = activeCounters.get(element);
    if (animation) cancelAnimationFrame(animation.frame);
    activeCounters.delete(element);
    const target = targetFor(element);
    if (target !== null) element.textContent = numberFormat.format(target);
    element.dataset.counterState = 'complete';
    finishedCounters.add(element);
  }

  function finishActiveCounters() {
    [...activeCounters.keys()].forEach(finishCounter);
  }

  function showEverything() {
    observer?.disconnect();
    pendingTargets.clear();
    pendingLoadTargets.clear();
    if (revealResizeFrame) cancelAnimationFrame(revealResizeFrame);
    revealResizeFrame = 0;
    if (viewportFrame) cancelAnimationFrame(viewportFrame);
    viewportFrame = 0;
    reveals.forEach((element) => element.classList.add('is-visible'));
    counters.forEach(finishCounter);
  }

  function failOpen(error) {
    showEverything();
    root.classList.remove('motion-ready');
    console.warn('Motion enhancement unavailable; content remains visible.', error);
  }

  function splitLetters(element) {
    if (element.dataset.lettersReady === 'true') return;
    const accessibleText = element.textContent.replace(/\s+/g, ' ').trim();
    if (!element.closest('[aria-hidden="true"]') && !element.hasAttribute('aria-label')) {
      element.setAttribute('aria-label', accessibleText);
    }

    // Keep emphasis / No.1 markup intact. data-no-split can opt a phrase out.
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (node.parentElement.closest('[data-no-split], .letter, .sr-only, script, style')) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    const segmenter = typeof Intl.Segmenter === 'function'
      ? new Intl.Segmenter('ja', { granularity: 'grapheme' })
      : null;
    let index = 0;

    textNodes.forEach((node) => {
      const fragment = document.createDocumentFragment();
      const characters = segmenter
        ? Array.from(segmenter.segment(node.nodeValue), (item) => item.segment)
        : Array.from(node.nodeValue);
      characters.forEach((character) => {
        if (/\s/.test(character)) {
          fragment.append(document.createTextNode(character));
          return;
        }
        const letter = document.createElement('span');
        letter.className = 'letter';
        letter.textContent = character;
        letter.setAttribute('aria-hidden', 'true');
        letter.style.setProperty('--letter-index', String(index++));
        fragment.append(letter);
      });
      node.replaceWith(fragment);
    });
    element.style.setProperty('--letter-count', String(index));
    element.dataset.lettersReady = 'true';
  }

  function startCounter(element) {
    if (finishedCounters.has(element) || activeCounters.has(element)) return;
    const target = targetFor(element);
    if (target === null || reduceMotion || document.hidden) {
      finishCounter(element);
      return;
    }

    const requestedDuration = Number(element.dataset.counterDuration);
    const duration = requestedDuration > 0 && Number.isFinite(requestedDuration)
      ? Math.min(requestedDuration, 4000)
      : target > 10 ? 1700 : 900;
    const animation = { frame: 0, started: null };
    activeCounters.set(element, animation);
    element.textContent = '1';
    element.dataset.counterState = 'running';

    const tick = (time) => {
      if (!activeCounters.has(element)) return;
      if (reduceMotion || document.hidden) {
        finishCounter(element);
        return;
      }
      if (animation.started === null) animation.started = time;
      const progress = Math.min((time - animation.started) / duration, 1);
      // Short counts remain clearly readable as 1 → 2 → 3 → 4.
      const eased = target > 10 ? 1 - Math.pow(1 - progress, 3) : progress;
      const value = Math.min(target, 1 + Math.floor((target - 1) * eased));
      element.textContent = numberFormat.format(value);
      if (progress >= 1) {
        finishCounter(element);
      } else {
        animation.frame = requestAnimationFrame(tick);
      }
    };
    animation.frame = requestAnimationFrame(tick);
  }

  const hasWaitingCounters = () => counters.some((element) => (
    !finishedCounters.has(element) && !activeCounters.has(element)
  ));

  function visibleWindow() {
    const cta = document.querySelector('.fixed-cta');
    const header = document.querySelector('.site-header');
    const height = window.innerHeight || document.documentElement.clientHeight;
    return {
      bottom: Math.min(height, cta ? cta.getBoundingClientRect().top : height) - 12,
      top: header ? Math.max(0, header.getBoundingClientRect().bottom) : 0
    };
  }

  function reveal(element) {
    pendingTargets.delete(element);
    pendingLoadTargets.delete(element);
    element.classList.add('is-visible');
    observer?.unobserve(element);
  }

  function maybeStartVisibleCounters(viewport = visibleWindow()) {
    if (reduceMotion || !hasWaitingCounters()) return;
    try {
      counterGroups.forEach((elements, group) => {
        const waiting = elements.filter((element) => (
          !finishedCounters.has(element) && !activeCounters.has(element)
        ));
        if (!waiting.length) return;
        const bounds = group.getBoundingClientRect();
        // IO can report visibility behind overlays or outside an iframe's
        // own visible area. Start only when the whole group clears both bars.
        if (bounds.height > 0 && bounds.width > 0
          && bounds.top >= viewport.top && bounds.bottom <= viewport.bottom) {
          // The counter group may have been missed by an iframe's IO root.
          reveal(group);
          waiting.forEach(startCounter);
        }
      });
    } catch (error) {
      counters.forEach(finishCounter);
      console.warn('Counter visibility unavailable; final values remain visible.', error);
    }
  }

  function updateVisibleContent() {
    if (viewportFrame) cancelAnimationFrame(viewportFrame);
    viewportFrame = 0;
    if (reduceMotion) return;
    try {
      // Hero copy must never wait for an iframe / parent IO intersection.
      [...pendingLoadTargets].forEach(reveal);
      const viewport = visibleWindow();
      if (viewport.bottom <= viewport.top) return;
      [...pendingTargets].forEach((element) => {
        const bounds = element.getBoundingClientRect();
        if (bounds.height <= 0 || bounds.width <= 0) return;
        const visibleHeight = Math.min(bounds.bottom, viewport.bottom)
          - Math.max(bounds.top, viewport.top);
        const requiredHeight = Math.min(bounds.height * 0.12, 48);
        // Reveal content already passed during an anchor jump / fast scroll,
        // so it is not left transparent when the visitor scrolls back.
        if (visibleHeight >= requiredHeight || bounds.bottom <= viewport.top) reveal(element);
      });
      maybeStartVisibleCounters(viewport);
    } catch (error) {
      failOpen(error);
    }
  }

  function queueViewportCheck() {
    if (!viewportFrame && !reduceMotion
      && (pendingLoadTargets.size || pendingTargets.size || hasWaitingCounters())) {
      viewportFrame = requestAnimationFrame(updateVisibleContent);
    }
  }

  try {
    // Without this class, all content and final numbers are visible by default.
    reveals = Array.from(document.querySelectorAll('[data-reveal]'));
    counters = Array.from(document.querySelectorAll('[data-counter]'));
    document.querySelectorAll('[data-letters]').forEach(splitLetters);

    const preference = typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;
    reduceMotion = Boolean(preference?.matches);
    const onPreferenceChange = (event) => {
      reduceMotion = event.matches;
      if (reduceMotion) showEverything();
      // Completed reveals/counts do not replay when motion is enabled again.
    };
    if (preference?.addEventListener) preference.addEventListener('change', onPreferenceChange);
    else if (preference?.addListener) preference.addListener(onPreferenceChange);

    counters.forEach((element) => {
      const group = element.closest('[data-counter-group]')
        || element.closest('[data-reveal]')
        || element;
      if (!counterGroups.has(group)) counterGroups.set(group, []);
      counterGroups.get(group).push(element);
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) finishActiveCounters();
      else queueViewportCheck();
    });
    window.addEventListener('pagehide', () => {
      finishActiveCounters();
      if (viewportFrame) cancelAnimationFrame(viewportFrame);
      viewportFrame = 0;
    });

    if (reduceMotion || !('IntersectionObserver' in window) || !window.requestAnimationFrame) {
      showEverything();
      return;
    }

    // IO is an extra notification source. Local geometry is authoritative,
    // including when the preview iframe is outside its parent's viewport.
    const onIntersection = () => updateVisibleContent();

    function observePendingTargets() {
      revealResizeFrame = 0;
      observer?.disconnect();
      if (reduceMotion || !pendingTargets.size) return;
      try {
        const cta = document.querySelector('.fixed-cta');
        const bottomInset = cta
          ? Math.max(12, window.innerHeight - cta.getBoundingClientRect().top + 12)
          : window.innerHeight * 0.05;
        observer = new IntersectionObserver(onIntersection, {
          threshold: 0.12,
          rootMargin: `0px 0px -${Math.ceil(bottomInset)}px 0px`
        });
        pendingTargets.forEach((element) => observer.observe(element));
      } catch (error) {
        failOpen(error);
      }
    }

    reveals.forEach((element) => {
      if (element.dataset.reveal === 'load') {
        if (!element.style.getPropertyValue('--reveal-delay')) {
          element.style.setProperty('--reveal-delay', `${pendingLoadTargets.size * 180}ms`);
        }
        pendingLoadTargets.add(element);
      } else {
        pendingTargets.add(element);
      }
    });
    counterGroups.forEach((_, group) => pendingTargets.add(group));
    root.classList.add('motion-ready');
    const initializedAfterLoad = document.readyState === 'complete';
    if (!initializedAfterLoad && !document.hidden) {
      // Commit the initial opacity before adding is-visible. Otherwise the
      // first rAF can collapse both states into one paint and skip the fade.
      pendingLoadTargets.forEach((element) => {
        void window.getComputedStyle(element).opacity;
      });
    }
    observePendingTargets();
    window.addEventListener('scroll', queueViewportCheck, { passive: true });
    window.addEventListener('resize', () => {
      queueViewportCheck();
      if (!revealResizeFrame && pendingTargets.size && !reduceMotion) {
        revealResizeFrame = requestAnimationFrame(observePendingTargets);
      }
    }, { passive: true });
    window.addEventListener('load', queueViewportCheck, { once: true });
    window.addEventListener('pageshow', queueViewportCheck);
    document.addEventListener('transitionend', (event) => {
      // Reveals move by 17px; check the final geometry after they settle,
      // even if the visitor has not scrolled during the entrance transition.
      if ((event.propertyName === 'transform' || event.propertyName === 'opacity')
        && event.target instanceof Element && event.target.matches('[data-reveal]')) {
        queueViewportCheck();
      }
    });
    document.fonts?.ready.then(queueViewportCheck).catch(() => {});
    // A late script must not turn already painted copy transparent for a
    // frame. Initial deferred execution still gives CSS one frame to animate.
    if (initializedAfterLoad || document.hidden) updateVisibleContent();
    else queueViewportCheck();
  } catch (error) {
    failOpen(error);
  }
})();

// Keep the fixed photograph stationary; only blend the pre-blurred layer.
// This enhancement is deliberately independent from reveal/count-up setup.
(() => {
  'use strict';

  const backdrop = document.querySelector('.page-backdrop');
  const declaration = document.getElementById('declaration');
  if (!backdrop || !declaration) return;

  let pendingFrame = 0;
  let previousOpacity = '';
  let stopped = false;

  function updateBackdrop() {
    pendingFrame = 0;
    if (stopped) return;
    try {
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      if (viewportHeight <= 0) return;
      const top = declaration.getBoundingClientRect().top;
      // Short screens may already place the panel above the usual 70% start.
      // Anchor the start to its document position so scrollY=0 stays clear.
      const documentTop = top + window.scrollY;
      const start = Math.min(viewportHeight * 0.7, documentTop);
      const end = viewportHeight * 0.3;
      const progress = (start - top) / Math.max(1, start - end);
      const opacity = Math.min(1, Math.max(0, progress)).toFixed(3);
      if (opacity !== previousOpacity) {
        backdrop.style.setProperty('--backdrop-blur', opacity);
        previousOpacity = opacity;
      }
    } catch (error) {
      stopped = true;
      backdrop.style.setProperty('--backdrop-blur', '0');
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      console.warn('Backdrop blending unavailable; the photograph stays visible.', error);
    }
  }

  function scheduleUpdate() {
    if (stopped || pendingFrame) return;
    if (typeof window.requestAnimationFrame === 'function') {
      pendingFrame = window.requestAnimationFrame(updateBackdrop);
    } else {
      updateBackdrop();
    }
  }

  // No easing/tween is applied here. Reduced-motion users get the same
  // immediate position-based value, with CSS responsible for no transition.
  updateBackdrop();
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate, { passive: true });
  window.addEventListener('load', scheduleUpdate, { once: true });
  window.addEventListener('pageshow', scheduleUpdate);
  window.addEventListener('pagehide', () => {
    if (pendingFrame) window.cancelAnimationFrame(pendingFrame);
    pendingFrame = 0;
  });
})();
