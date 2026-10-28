(() => {
  "use strict";

  function initializeMotion() {
    const shell = document.querySelector(".lp-shell");
    const desktop = window.matchMedia("(min-width: 1040px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Reveal real content units in reading order, instead of a whole long section.
    document.querySelectorAll('.machine-intro,.machine-chapter,.fa-intro,.fa-chapter').forEach(group => {
      group.removeAttribute('data-reveal');
      Array.from(group.children).filter(child=>!child.classList.contains('gold-sparkle')).forEach(child => child.setAttribute('data-reveal',''));
    });
    document.querySelectorAll('.faq-accordion details,.store-info-row').forEach(item => item.setAttribute('data-reveal',''));
    const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));
    const sparkleFields = Array.from(document.querySelectorAll('[data-sparkle-field]'));
    const heroItems = Array.from(document.querySelectorAll("[data-hero-step]"));
    const hero = document.querySelector(".exact-original-hero");
    const heroTimers = new Set();
    let heroFinished = false;
    let revealObserver;
    let imageObserver;
    let sparkleObserver;
    const sectionRevealClock = new WeakMap();

    const scrollRoot = () => desktop.matches && shell ? shell : null;
    const reveal = (element) => element.classList.add("is-visible");

    function finishHero() {
      heroFinished = true;
      heroTimers.forEach(window.clearTimeout);
      heroTimers.clear();
      heroItems.forEach(reveal);
      document.documentElement.classList.remove("hero-motion-pending");
      hero?.classList.remove("hero-motion-running");
      hero?.classList.add("hero-motion-complete");
    }

    function showAllContent() {
      finishHero();
      revealItems.forEach(reveal);
      sparkleFields.forEach(field => field.classList.remove('is-sparkling'));
      sparkleObserver?.disconnect();
      revealObserver?.disconnect();
    }

    function observeReveals() {
      revealObserver?.disconnect();
      if (reducedMotion.matches || !("IntersectionObserver" in window)) {
        showAllContent();
        return;
      }
      revealObserver = new IntersectionObserver((entries) => {
        const entering=entries.filter(entry => entry.isIntersecting)
          .sort((a,b) => revealItems.indexOf(a.target)-revealItems.indexOf(b.target));
        entering.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const section=entry.target.closest('section') || shell;
          const now=performance.now();
          const previous=sectionRevealClock.get(section) || (now-150);
          const scheduled=Math.min(Math.max(now,previous+150),now+900);
          sectionRevealClock.set(section,scheduled);
          entry.target.style.setProperty('--reveal-delay',`${Math.round(scheduled-now)}ms`);
          reveal(entry.target);
          revealObserver.unobserve(entry.target);
        });
      }, { root: scrollRoot(), rootMargin: "0px 0px -100px", threshold: 0.08 });
      revealItems.filter((item) => !item.classList.contains("is-visible"))
        .forEach((item) => revealObserver.observe(item));
    }

    function observeSparkles() {
      sparkleObserver?.disconnect();
      if(reducedMotion.matches || !('IntersectionObserver' in window)) return;
      sparkleObserver=new IntersectionObserver(entries => entries.forEach(entry => {
        entry.target.classList.toggle('is-sparkling',entry.isIntersecting && !document.hidden);
      }),{root:scrollRoot(),threshold:0});
      sparkleFields.forEach(field => sparkleObserver.observe(field));
    }

    function loadLegacyImage(image) {
      if (!image.dataset.src) return;
      image.src = image.dataset.src;
      image.removeAttribute("data-src");
      imageObserver?.unobserve(image);
    }

    function observeLegacyImages() {
      imageObserver?.disconnect();
      const images = document.querySelectorAll("img[data-src]");
      if (!("IntersectionObserver" in window)) {
        images.forEach(loadLegacyImage);
        return;
      }
      imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) loadLegacyImage(entry.target);
        });
      }, { root: scrollRoot(), rootMargin: "600px 0px", threshold: 0 });
      images.forEach((image) => imageObserver.observe(image));
    }

    function scheduleHero(callback, delay) {
      const timer = window.setTimeout(() => {
        heroTimers.delete(timer);
        callback();
      }, delay);
      heroTimers.add(timer);
      return timer;
    }

    async function prepareHero() {
      if (!hero || !heroItems.length || !document.documentElement.classList.contains("hero-motion-pending")) {
        finishHero();
        return;
      }
      const images = Array.from(hero.querySelectorAll("img"));
      if (!images.length) {
        finishHero();
        return;
      }
      // Start only when the original artwork is decoded; failures keep the base visible.
      const deadline = scheduleHero(finishHero, 8000);
      try {
        await Promise.all(images.map(async (image) => {
          image.loading = "eager";
          if (typeof image.decode === "function") {
            await image.decode();
            if (!image.naturalWidth) throw new Error("Hero image unavailable");
          } else if (image.complete) {
            if (!image.naturalWidth) throw new Error("Hero image unavailable");
          } else {
            await new Promise((resolve, reject) => {
              image.addEventListener("load", resolve, { once: true });
              image.addEventListener("error", reject, { once: true });
            });
          }
        }));
        window.clearTimeout(deadline);
        heroTimers.delete(deadline);
        if (heroFinished) return;
        if (document.hidden || reducedMotion.matches) {
          finishHero();
          return;
        }
        startHero();
      } catch {
        finishHero();
      }
    }

    function startHero() {
      if (heroFinished) return;
      hero?.classList.add("hero-motion-running");
      // Commit the hidden state before the first fade, even when all images are cached.
      hero?.getBoundingClientRect();
      document.documentElement.classList.remove("hero-motion-pending");
      const sequence = [
        ["intro", 120],
        ["headline", 950],
        ["offer", 2200],
        ["context", 2950],
        ["credit", 3750],
        ["care-strip", 4600],
        ["price", 5450]
      ];
      sequence.forEach(([step, delay]) => {
        scheduleHero(() => {
          document.querySelectorAll(`[data-hero-step="${step}"]`).forEach(reveal);
        }, delay);
      });
      scheduleHero(finishHero, 6350);
    }

    document.querySelectorAll('[data-hero-step="headline"]').forEach((headline) => {
      headline.querySelectorAll("[data-char]").forEach((character, index) => {
        character.style.setProperty("--char-index", String(index));
      });
    });


    // Nested desktop scrolling and entrance fades must not stall lazy map loading.
    const maps = Array.from(document.querySelectorAll(".revision-access__map iframe"));
    let mapObserver;
    function observeMaps() {
      mapObserver?.disconnect();
      if (!("IntersectionObserver" in window)) { maps.forEach(map => { map.loading = "eager"; }); return; }
      mapObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.loading = "eager";
          mapObserver.unobserve(entry.target);
        });
      }, {root:scrollRoot(),rootMargin:"800px 0px"});
      maps.forEach(map => mapObserver.observe(map));
    }
    observeMaps();

    document.querySelectorAll(".floating-action").forEach(reveal);
    observeLegacyImages();
    observeReveals();
    observeSparkles();
    // Content stays readable if JavaScript is unavailable or motion is reduced.
    document.body.classList.add("motion-ready");
    if (reducedMotion.matches || document.hidden || !("IntersectionObserver" in window)) {
      showAllContent();
    } else {
      prepareHero();
    }

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (!desktop.matches || !shell) return;
        const hash = link.getAttribute("href");
        if (!hash || hash === "#") return;
        let id;
        try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
        const target = document.getElementById(id);
        if (!target || !shell.contains(target)) return;
        event.preventDefault();
        const margin = parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0;
        const top = shell.scrollTop + target.getBoundingClientRect().top - shell.getBoundingClientRect().top - margin;
        shell.scrollTo({ top: Math.max(0, top), behavior: reducedMotion.matches ? "auto" : "smooth" });
      });
    });

    const questions = Array.from(document.querySelectorAll(".faq-accordion details"));
    questions.forEach((question) => {
      question.addEventListener("toggle", () => {
        if (!question.open) return;
        questions.forEach((other) => {
          if (other !== question) other.open = false;
        });
      });
    });

    desktop.addEventListener("change", () => {
      observeReveals();
      observeLegacyImages();
      observeMaps();
      observeSparkles();
    });
    reducedMotion.addEventListener("change", () => {
      if (reducedMotion.matches) showAllContent();
      else { observeReveals(); observeSparkles(); }
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        finishHero();
        sparkleFields.forEach(field => field.classList.remove('is-sparkling'));
      } else { observeReveals(); observeSparkles(); }
    });
    window.addEventListener("pageshow", (event) => {
      // Returning from LINE must not restart or hide already presented content.
      if (event.persisted) finishHero();
      document.querySelectorAll(".floating-action").forEach(reveal);
      observeReveals();
      observeLegacyImages();
      observeSparkles();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeMotion, { once: true });
  } else {
    initializeMotion();
  }
})();
