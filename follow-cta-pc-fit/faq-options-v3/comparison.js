(() => {
  const tabs = [...document.querySelectorAll('[data-option]')];
  const panels = [...document.querySelectorAll('.option')];
  const choose = (id, focus = false) => {
    if (!panels.some(panel => panel.id === id)) return;
    panels.forEach(panel => panel.classList.toggle('is-selected', panel.id === id));
    tabs.forEach(tab => {
      const active = tab.dataset.option === id;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    });
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => choose(tab.dataset.option));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        choose(tabs[next].dataset.option, true);
      }
    });
  });
  document.body.classList.add('js-options');
  choose(location.hash.replace('#','') || 'option-a');
})();
