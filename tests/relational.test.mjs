import test from 'node:test';
import assert from 'node:assert/strict';
import { attributeClosure, keyStatus, evaluateAnswer } from '../src/lib/relational.mjs';

const df = (from, to) => ({ from, to });
test('closure revisits earlier dependencies until a fixed point and terminates on cycles', () => {
  const f = [df(['B'], ['C']), df(['A'], ['B']), df(['C'], ['A'])];
  const result = attributeClosure(['A'], f);
  assert.deepEqual(new Set(result.attributes), new Set(['A', 'B', 'C']));
  assert.equal(result.steps.length, 3);
  assert.deepEqual(result.steps[1].added, ['B']);
  assert.deepEqual(result.steps[2].added, ['C']);
});
test('a composite determinant requires every attribute, not just one', () => {
  const f = [df(['A', 'B'], ['C'])];
  assert.deepEqual(attributeClosure(['A'], f).attributes, ['A']);
  assert.deepEqual(attributeClosure(['A', 'B'], f).attributes, ['A', 'B', 'C']);
});
test('candidate keys require minimality and can coexist with redundant superkeys', () => {
  const f = [df(['Q'], ['C']), df(['C'], ['E']), df(['C', 'Q'], ['P'])];
  const attrs = ['C', 'Q', 'P', 'E'];
  assert.equal(keyStatus(['Q'], attrs, f), 'candidate');
  assert.equal(keyStatus(['Q', 'C'], attrs, f), 'superkey');
  assert.equal(keyStatus(['C'], attrs, f), 'incomplete');
});
test('empty closure is empty without empty-determinant dependencies', () => {
  assert.deepEqual(attributeClosure([], [df(['A'], ['B'])]).attributes, []);
});
test('quiz evaluation is independent of order and rejects partial and extra selections', () => {
  assert.equal(evaluateAnswer(['B', 'A'], ['A', 'B']), true);
  assert.equal(evaluateAnswer(['A'], ['A', 'B']), false);
  assert.equal(evaluateAnswer(['A', 'B', 'C'], ['A', 'B']), false);
  assert.equal(evaluateAnswer([], []), false);
});
