export const featureIds = ['catalog', 'combat', 'demolition'];
export const featureFromHash = hash => featureIds.includes(hash.slice(1)) ? hash.slice(1) : 'catalog';

export function initFeatureNavigation(onChange) {
  const selectView = (view, updateHash = true) => {
    if (!featureIds.includes(view)) view = 'catalog';
    for (const id of featureIds) document.querySelector(`#${id}-view`).hidden = id !== view;
    document.querySelector('#catalog-notice').hidden = view !== 'catalog';
    document.querySelectorAll('[data-feature]').forEach(button => {
      const active = button.dataset.feature === view;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    if (updateHash) history.replaceState(null, '', `${location.pathname}${location.search}${view === 'catalog' ? '' : `#${view}`}`);
    onChange();
  };
  document.querySelectorAll('[data-feature]').forEach(button => button.addEventListener('click', () => selectView(button.dataset.feature)));
  window.addEventListener('hashchange', () => selectView(featureFromHash(location.hash), false));
  selectView(featureFromHash(location.hash), false);
  return selectView;
}
