export const featureIds = ['catalog', 'combat', 'demolition'];
export const featureFromHash = hash => featureIds.includes(hash.slice(1)) ? hash.slice(1) : 'catalog';
const featureHeadings = {
  catalog: { title: '스트라타젬 도감', intro: '어디까지 닿고, 얼마나 뚫는지. 투하 전에 확인하세요.' },
  combat: { title: '적 대응 계산', intro: '어디를 노리고, 몇 번 공격해야 할지. 적과 무기를 골라 확인하세요.' },
  demolition: { title: '건물 철거 계산', intro: '무엇으로, 어디까지 부술 수 있는지. 건물과 장비를 골라 확인하세요.' },
};

export function initFeatureNavigation(onChange) {
  const selectView = (view, updateHash = true) => {
    if (!featureIds.includes(view)) view = 'catalog';
    document.querySelector('#page-title').textContent = featureHeadings[view].title;
    document.querySelector('#page-intro').textContent = featureHeadings[view].intro;
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
