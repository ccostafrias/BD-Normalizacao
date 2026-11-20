import test from 'node:test';
import assert from 'node:assert/strict';
import { filterQuestions, readFilters } from '../src/lib/question-filters.mjs';
const list = [
  { id: 'q1', title: 'Normalização e fecho', prompt: 'Primeiro', difficulty: 'easy' },
  { id: 'q2', title: 'Chaves', prompt: 'Segundo', difficulty: 'hard' },
];
const progress = { version: 1, attempts: { q1: { correct: false }, q2: { correct: true } }, bookmarks: ['q2'] };
const base = { search: '', difficulty: '', mode: '' };
test('search is insensitive to case and Portuguese accents', () => {
  assert.deepEqual(filterQuestions(list, { ...base, search: 'NORMALIZACAO' }, progress, '').map((q) => q.id), ['q1']);
});
test('review and bookmarks use independent, composable filters', () => {
  assert.deepEqual(filterQuestions(list, { ...base, mode: 'revisao' }, progress, '').map((q) => q.id), ['q1']);
  assert.deepEqual(filterQuestions(list, { ...base, mode: 'salvas' }, progress, '').map((q) => q.id), ['q2']);
  assert.deepEqual(filterQuestions(list, { ...base, mode: 'revisao', difficulty: 'hard' }, progress, ''), []);
});
test('unknown URL filter values recover to the full catalog', () => {
  assert.deepEqual(readFilters(new URLSearchParams('nivel=invalid&modo=invalid')), base);
});
