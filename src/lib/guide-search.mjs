import { searchableText } from './question-filters.mjs';

/** @param {string} text */
function normalize(text) {
  return searchableText(text).replaceAll('⁺', '+').replace(/[^\p{L}\p{N}+→↠⋈]+/gu, ' ').trim().replace(/\s+/g, ' ');
}

/**
 * Search definitions as well as names; exact names and aliases come first.
 * Preserve the source's editorial order when no search is active.
 * @param {import('../types').GuideSection[]} sections
 * @param {string} query
 * @returns {import('../types').GuideSection[]}
 */
export function searchGuide(sections, query) {
  const search = normalize(query);
  if (!search) return sections;
  const words = search.split(' ');
  return sections.map((section) => {
    const matches = section.items.map((item) => {
      const names = [item.term, ...item.aliases].map(normalize);
      const body = normalize(`${names.join(' ')} ${item.text} ${item.example} ${item.detail}`);
      const score = names.includes(search) ? 0 : names.some((name) => name.startsWith(search)) ? 1 : names.some((name) => name.includes(search)) ? 2 : 3;
      return { item, score, matches: words.every((word) => body.includes(word)) };
    }).filter((match) => match.matches).sort((a, b) => a.score - b.score);
    return { section: { ...section, items: matches.map((match) => match.item) }, score: matches[0]?.score ?? Infinity };
  }).filter(({ section }) => section.items.length).sort((a, b) => a.score - b.score).map(({ section }) => section);
}
