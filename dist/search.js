const normalize = value => String(value ?? '').normalize('NFKC').toLowerCase().replace(/[\s\-·"']/g, '');

export function createSearchMatcher(value) {
  const query = normalize(value);
  if (!query) return () => true;
  const characters = [...new Set(query)];

  return item => {
    const aliases = item.aliases || [];
    const names = [item.name, item.en, ...aliases];
    // Codes, descriptions and roles keep their existing phrase matching.
    const searchableText = [item.name, item.en, item.code, item.summary, ...item.tags, ...aliases].join(' ');
    if (normalize(searchableText).includes(query)) return true;

    // Every entered character must belong to the same name; order does not matter.
    return names.some(name => {
      const normalizedName = normalize(name);
      return characters.every(character => normalizedName.includes(character));
    });
  };
}
