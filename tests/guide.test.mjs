import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { searchGuide } from '../src/lib/guide-search.mjs';
import { keyStatus } from '../src/lib/relational.mjs';

const read = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const guide = read('../src/data/guide.json');
const documents = read('../src/data/documents.json');
const entries = guide.flatMap((section) => section.items);
const results = (query) => searchGuide(guide, query).flatMap((section) => section.items);

test('every guide entry has a unique anchor, teaching content and valid related concepts', () => {
  const ids = [...guide.map((section) => section.id), ...entries.map((entry) => entry.id), 'fontes'];
  assert.equal(new Set(ids).size, ids.length);
  const entryIds = new Set(entries.map((entry) => entry.id));
  for (const section of guide) {
    const source = documents.find((document) => document.id === section.document);
    assert.ok(source, section.id);
    assert.ok(section.pages.length && section.pages.every((page) => Number.isInteger(page) && page > 0 && page <= source.pages), section.id);
    for (const entry of section.items) {
      assert.match(entry.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      for (const field of ['term', 'text', 'example', 'detail']) assert.ok(entry[field]?.trim(), `${entry.id}: ${field}`);
      assert.ok(entry.aliases.length && entry.aliases.every((alias) => typeof alias === 'string' && alias.trim()), entry.id);
      assert.ok(entry.related.length && entry.related.every((id) => entryIds.has(id) && id !== entry.id), entry.id);
    }
  }
});

test('technical abbreviations and alternate names prioritize their definition', () => {
  for (const [query, id] of [
    ['DF', 'dependencia-funcional'], ['DFs', 'dependencia-funcional'],
    ['1FN', '1fn'], ['2FN', '2fn'], ['3FN', '3fn'], ['4FN', '4fn'], ['5FN', '5fn'],
    ['FNBC', 'bcnf'], ['BCNF', 'bcnf'], ['Boyce Codd', 'bcnf'], ['Boyce–Codd', 'bcnf'],
    ['DMV', 'dependencia-multivalorada'], ['DJ', 'dependencia-juncao'], ['F+', 'fecho-dependencias'],
    ['F⁺', 'fecho-dependencias'], ['X+', 'fecho'], ['X → Y', 'dependencia-funcional'], ['X ↠ Y', 'dependencia-multivalorada'],
  ]) assert.equal(results(query)[0]?.id, id, query);
});

test('guide search tolerates case, accents, repeated spaces and matches examples', () => {
  assert.equal(results('  DEPENDENCIA   FUNCIONAL  ')[0].id, 'dependencia-funcional');
  assert.equal(results('  TuPlAs eSpUrIaS  ')[0].id, 'tupla-espuria');
  assert.equal(results('1 fn')[0].id, '1fn');
  assert.ok(results('Ana Bruno').some((entry) => entry.id === 'dependencia-multivalorada'));
  assert.ok(results('SELECT DISTINCT').some((entry) => entry.id === 'projecao'));
});

test('empty and unknown guide searches recover without modifying editorial data', () => {
  const before = JSON.stringify(guide);
  assert.deepEqual(searchGuide(guide, '  '), guide);
  assert.deepEqual(searchGuide(guide, 'termo-inexistente-xyz'), []);
  searchGuide(guide, 'DF');
  assert.equal(JSON.stringify(guide), before);
});

test('the Boyce–Codd teaching example has the two stated candidate keys and a non-key determinant', () => {
  const attributes = ['Aluno', 'Curso', 'Instrutor'];
  const dependencies = [{ from: ['Aluno', 'Curso'], to: ['Instrutor'] }, { from: ['Instrutor'], to: ['Curso'] }];
  assert.equal(keyStatus(['Aluno', 'Curso'], attributes, dependencies), 'candidate');
  assert.equal(keyStatus(['Aluno', 'Instrutor'], attributes, dependencies), 'candidate');
  assert.notEqual(keyStatus(['Instrutor'], attributes, dependencies), 'candidate');
});
