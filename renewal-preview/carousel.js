'use strict';
(() => {
  const menuButton = document.querySelector('.header-menu');
  const menu = document.querySelector('#site-menu');
  function closeMenu(returnFocus = false) {
    menu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    if (returnFocus) menuButton.focus();
  }
  menuButton.addEventListener('click', () => {
    const open = menu.hidden;
    menu.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
    if (open) menu.querySelector('a').focus();
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
  menu.querySelector('.menu-close').addEventListener('click', () => closeMenu(true));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) closeMenu(true);
  });
  document.addEventListener('click', event => {
    if (!menu.hidden && !event.target.closest('.site-header')) closeMenu();
  });

  const track = document.querySelector('.customer-track');
  const cards = [...track.querySelectorAll('.customer-card')];
  const selectors = [...document.querySelectorAll('[data-slide]')];
  const previous = document.querySelector('.previous');
  const next = document.querySelector('.next');
  const status = document.querySelector('#carousel-status');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const names = ['美容整形ちゃん様', 'モデルのお客様', '安藤社長様'];
  let active = 0;
  let frame = 0;

  function positionFor(index) {
    return cards[index].offsetLeft - cards[0].offsetLeft;
  }
  function setActive(index) {
    if (active === index) return;
    active = index;
    selectors.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.slide) === active)));
    previous.disabled = active === 0;
    next.disabled = active === cards.length - 1;
    status.textContent = `${active + 1} / ${cards.length} ${names[active]}`;
  }
  function goTo(index, smooth = true) {
    const target = Math.max(0, Math.min(cards.length - 1, index));
    track.scrollTo({left: positionFor(target), behavior: smooth && !reduceMotion.matches ? 'smooth' : 'instant'});
    setActive(target);
  }
  function updateFromScroll() {
    const distances = cards.map((_, index) => Math.abs(positionFor(index) - track.scrollLeft));
    setActive(distances.indexOf(Math.min(...distances)));
    frame = 0;
  }
  track.addEventListener('scroll', () => {
    if (!frame) frame = requestAnimationFrame(updateFromScroll);
  }, {passive: true});
  selectors.forEach(button => button.addEventListener('click', () => goTo(Number(button.dataset.slide))));
  previous.addEventListener('click', () => goTo(active - 1));
  next.addEventListener('click', () => goTo(active + 1));
  track.addEventListener('keydown', event => {
    const destinations = {ArrowLeft: active - 1, ArrowRight: active + 1, Home: 0, End: cards.length - 1};
    if (event.key in destinations) {
      event.preventDefault();
      goTo(destinations[event.key]);
    }
  });
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => goTo(active, false), 120);
  });
})();
