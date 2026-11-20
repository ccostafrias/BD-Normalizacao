/** Runtime boundary for authored JSON. Also executed by the content test suite. */
export function validateQuestions(questions, modules, documents) {
  const ids = new Set();
  for (const q of questions) {
    const fail = (message) => { throw new Error(`${q.id || '(sem id)'}: ${message}`); };
    if (!q.id || ids.has(q.id)) fail('id ausente ou duplicado');
    ids.add(q.id);
    if (!modules.some((m) => m.id === q.moduleId)) fail('módulo inexistente');
    if (!['choice', 'multi-choice', 'attributes'].includes(q.type)) fail('tipo inválido');
    if (!['easy', 'medium', 'hard'].includes(q.difficulty)) fail('dificuldade inválida');
    for (const field of ['title', 'prompt', 'hint', 'explanation']) {
      if (typeof q[field] !== 'string' || !q[field].trim()) fail(`${field} vazio`);
    }
    if (!Array.isArray(q.steps) || !q.steps.length || q.steps.some((s) => !s.title || !s.text)) fail('resolução incompleta');
    if (!q.answer?.length || new Set(q.answer).size !== q.answer.length) fail('gabarito vazio ou duplicado');
    const choices = q.type === 'attributes' ? q.relation?.attributes : q.options?.map((o) => o.id);
    if (!choices?.length || new Set(choices).size !== choices.length) fail('opções inválidas');
    if (q.answer.some((a) => !choices.includes(a))) fail('resposta ausente nas opções');
    if (q.type === 'choice' && q.answer.length !== 1) fail('questão simples deve ter uma resposta');
    if (q.type !== 'attributes' && q.options.some((o) => !o.label || !o.feedback)) fail('alternativa sem feedback');
    if (q.relation) {
      const attrs = q.relation.attributes;
      if (new Set(attrs).size !== attrs.length) fail('atributos repetidos');
      for (const df of q.relation.dependencies) {
        if (!df.from.length || !df.to.length || [...df.from, ...df.to].some((a) => !attrs.includes(a))) fail('DF com atributo inexistente');
      }
      if (q.closureStart?.some((a) => !attrs.includes(a))) fail('fecho com atributo inexistente');
    }
    for (const step of q.steps) {
      for (const table of step.tables ?? []) {
        if (!table.name || !table.attributes.length || table.key.some((a) => !table.attributes.includes(a))) fail('tabela de resolução inválida');
      }
    }
    if (!q.sources?.length) fail('fonte ausente');
    for (const source of q.sources) {
      const doc = documents.find((d) => d.id === source.document);
      if (!doc || !source.pages.length || source.pages.some((p) => !Number.isInteger(p) || p < 1 || p > doc.pages)) fail('fonte/página inválida');
      if (!['adapted', 'original'].includes(source.kind)) fail('origem inválida');
    }
  }
  return questions;
}
