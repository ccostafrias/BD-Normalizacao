import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { attributeClosure, keyStatus, sameSet } from '../src/lib/relational.mjs';
import { validateQuestions } from '../src/lib/content-validation.mjs';

const read = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const questions = read('../src/data/questions/primeiros-passos.json');
const modules = read('../src/data/modules.json');
const documents = read('../src/data/documents.json');
const find = (id) => questions.find((q) => q.id === `intro-${id}`);
const subsets = (values) => Array.from({ length: 2 ** values.length }, (_, mask) => values.filter((_, i) => mask & (1 << i)));

// Enumerate all determinants and consequences instead of only checking the
// displayed arrows. This catches implied partial/transitive violations too.
function analyze(relation) {
  const { attributes, dependencies } = relation;
  const determinants = subsets(attributes);
  const keys = determinants.filter((x) => keyStatus(x, attributes, dependencies) === 'candidate');
  const primary = new Set(keys.flat());
  const partial = [];
  const third = [];
  for (const x of determinants) {
    const closure = attributeClosure(x, dependencies).attributes;
    for (const a of closure) {
      if (x.includes(a) || primary.has(a)) continue;
      if (keys.some((k) => x.length < k.length && x.every((v) => k.includes(v)))) partial.push([x, a]);
      if (!attributes.every((v) => closure.includes(v))) third.push([x, a]);
    }
  }
  return { keys, partial, third };
}

test('the beginner bridge precedes dependency and key calculation modules', () => {
  const index = modules.findIndex((m) => m.id === 'primeiros-passos');
  assert.ok(index > modules.findIndex((m) => m.id === 'fundamentos'));
  assert.ok(index < modules.findIndex((m) => m.id === 'dependencias'));
  for (const q of questions) {
    assert.equal(q.difficulty, 'easy');
    assert.ok(q.preparation.title && q.preparation.text && q.preparation.example, q.id);
    assert.ok(q.sources.every((s) => s.document === 'slides' && s.kind === 'adapted'), q.id);
  }
});

test('the classification answers follow the actual full dependency closure', () => {
  for (const [id, level, expectedKeys] of [
    ['classificar-1fn', '1fn', [['Nota', 'Código']]],
    ['classificar-2fn', '2fn', [['Nota']]],
    ['classificar-3fn', '3fn', [['Nota', 'Código']]],
  ]) {
    const q = find(id);
    const { keys, partial, third } = analyze(q.relation);
    assert.deepEqual(keys, expectedKeys, id);
    const actual = partial.length ? '1fn' : third.length ? '2fn' : '3fn';
    assert.equal(actual, level, id);
    const answer = q.options.find((o) => q.answer.includes(o.id));
    assert.match(answer.label, { '1fn': /Somente 1FN/, '2fn': /2FN, mas não 3FN/, '3fn': /Pelo menos 3FN/ }[actual]);
  }
});

test('the partial and transitive examples demonstrate different violations', () => {
  const partial = analyze(find('parcial').relation);
  assert.ok(partial.partial.some(([x, a]) => sameSet(x, ['Código']) && a === 'Descrição'));
  const transitive = analyze(find('transitiva').relation);
  assert.equal(transitive.partial.length, 0);
  assert.ok(transitive.third.some(([x, a]) => sameSet(x, ['Cliente']) && a === 'NomeCliente'));
});

test('beginner decompositions preserve attributes, keys, dependencies and lossless joins', () => {
  for (const id of ['separar-2fn', 'separar-3fn']) {
    const q = find(id);
    const tables = q.steps.at(-1).tables;
    assert.ok(sameSet(tables.flatMap((t) => t.attributes), q.relation.attributes), id);
    const common = tables[0].attributes.filter((a) => tables[1].attributes.includes(a));
    const commonClosure = attributeClosure(common, q.relation.dependencies).attributes;
    assert.ok(tables.some((t) => t.attributes.every((a) => commonClosure.includes(a))), id);
    const projected = tables.flatMap((t) => subsets(t.attributes).flatMap((from) => {
      const to = attributeClosure(from, q.relation.dependencies).attributes.filter((a) => t.attributes.includes(a) && !from.includes(a));
      return to.length ? [{ from, to }] : [];
    }));
    for (const dependency of q.relation.dependencies) {
      const closure = attributeClosure(dependency.from, projected).attributes;
      assert.ok(dependency.to.every((a) => closure.includes(a)), `${id}: dependency preservation`);
    }
    for (const t of tables) {
      const dependencies = projected.filter((df) => [...df.from, ...df.to].every((a) => t.attributes.includes(a)));
      assert.equal(keyStatus(t.key, t.attributes, dependencies), 'candidate', `${id}: ${t.name}`);
      const normalized = analyze({ attributes: t.attributes, dependencies });
      assert.equal(normalized.partial.length, 0, t.name);
      assert.equal(normalized.third.length, 0, t.name);
    }
  }
});

test('malformed teaching preparation is rejected at the content boundary', () => {
  const broken = structuredClone(questions[0]);
  broken.preparation.example = ' ';
  assert.throws(() => validateQuestions([broken], modules, documents), /preparação incompleta/);
});
