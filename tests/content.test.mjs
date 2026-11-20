import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { validateQuestions } from '../src/lib/content-validation.mjs';
import { attributeClosure, keyStatus, sameSet } from '../src/lib/relational.mjs';

const read = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const modules = read('../src/data/modules.json');
const documents = read('../src/data/documents.json');
const directory = new URL('../src/data/questions/', import.meta.url);
const questions = readdirSync(directory).filter((f) => f.endsWith('.json')).flatMap((f) => read(`../src/data/questions/${f}`));
test('every authored question has valid choices, sources, relations and a complete solution', () => {
  assert.ok(validateQuestions(questions, modules, documents).length > 0);
  assert.ok(modules.every((m) => questions.some((q) => q.moduleId === m.id)));
});
test('key exercises have mathematically verified answers', () => {
  for (const id of ['c-casas', 'c-chave-cd']) {
    const q = questions.find((q) => q.id === id);
    assert.equal(keyStatus(q.answer, q.relation.attributes, q.relation.dependencies), 'candidate', id);
  }
});
test('AB closure exercise matches the actual dependency calculation', () => {
  const q = questions.find((q) => q.id === 'c-fecho');
  assert.ok(sameSet(attributeClosure(q.closureStart, q.relation.dependencies).attributes, q.answer));
});
test('overlapping-key example has exactly A, BC and CD as candidate keys', () => {
  const { relation } = questions.find((q) => q.id === 'c-primarios');
  const keys = [];
  for (let mask = 1; mask < 2 ** relation.attributes.length; mask++) {
    const subset = relation.attributes.filter((_, i) => mask & (1 << i));
    if (keyStatus(subset, relation.attributes, relation.dependencies) === 'candidate') keys.push(subset.join(''));
  }
  assert.deepEqual(keys.sort(), ['A', 'BC', 'CD']);
});
test('shown normalized tables retain every original attribute', () => {
  for (const id of ['n-casas', 'n-cd', 'dc-3fn', 'dc-dept']) {
    const q = questions.find((q) => q.id === id);
    const finalTables = q.steps.filter((s) => s.tables).at(-1).tables;
    assert.ok(sameSet(finalTables.flatMap((t) => t.attributes), q.relation.attributes), id);
  }
});
test('the binary lossless example uses an intersection that determines one side', () => {
  const q = questions.find((q) => q.id === 'dc-lossless');
  const [a, b] = q.steps.at(-1).tables;
  const common = a.attributes.filter((x) => b.attributes.includes(x));
  const closure = attributeClosure(common, q.relation.dependencies).attributes;
  assert.ok(a.attributes.every((x) => closure.includes(x)));
});
test('content boundary rejects duplicated IDs and invalid source pages', () => {
  assert.throws(() => validateQuestions([questions[0], questions[0]], modules, documents), /duplicado/);
  const broken = structuredClone(questions[0]);
  broken.sources[0].pages = [999];
  assert.throws(() => validateQuestions([broken], modules, documents), /página/);
});
