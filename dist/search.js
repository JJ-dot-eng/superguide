const normalize = value => String(value ?? '').normalize('NFKC').toLowerCase().replace(/[\s\-·"']/g, '');

function createSearchRanker(value) {
  const query = normalize(value);
  if (!query) return () => 1;
  const characters = [...new Set(query)];

  return item => {
    const aliases = item.aliases || [];
    const names = [item.name, item.en, ...aliases];
    // Name and alias matches come first, including unordered character matches.
    if (names.some(name => {
      const normalizedName = normalize(name);
      return characters.every(character => normalizedName.includes(character));
    })) return 2;

    // Codes, descriptions and roles keep their existing phrase matching.
    const searchableText = [item.name, item.en, item.code, item.summary, ...item.tags, ...aliases].join(' ');
    return normalize(searchableText).includes(query) ? 1 : 0;
  };
}

export function createSearchMatcher(value) {
  const rank = createSearchRanker(value);
  return item => rank(item) > 0;
}

export function searchItems(items, value) {
  const rank = createSearchRanker(value);
  return items
    .map(item => ({ item, rank: rank(item) }))
    .filter(result => result.rank > 0)
    // Stable sorting preserves the catalog order within each match tier.
    .sort((a, b) => b.rank - a.rank)
    .map(result => result.item);
}
