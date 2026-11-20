/** @param {string} text */
export function searchableText(text) {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('pt-BR');
}

/** @param {URLSearchParams} params */
export function readFilters(params) {
  const level = params.get('nivel') ?? '';
  const mode = params.get('modo') ?? '';
  return {
    difficulty: ['easy', 'medium', 'hard'].includes(level) ? level : '',
    mode: ['revisao', 'salvas'].includes(mode) ? mode : '',
    search: params.get('busca') ?? '',
  };
}

/**
 * @param {import('../types').Question[]} questions
 * @param {{difficulty: string, mode: string, search: string}} filters
 * @param {import('../types').Progress} progress
 * @param {string} moduleTitle
 */
export function filterQuestions(questions, filters, progress, moduleTitle) {
  const search = searchableText(filters.search);
  return questions.filter((question) => {
    if (filters.difficulty && question.difficulty !== filters.difficulty) return false;
    if (filters.mode === 'revisao' && (!progress.attempts[question.id] || progress.attempts[question.id].correct)) return false;
    if (filters.mode === 'salvas' && !progress.bookmarks.includes(question.id)) return false;
    return !search || searchableText(`${question.title} ${question.prompt} ${moduleTitle}`).includes(search);
  });
}
