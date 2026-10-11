import assert from 'node:assert/strict';
import test from 'node:test';
import { judge } from './load.js';

test('AE1 fraction intermediate is correct', () => {
  assert.equal(judge('6÷(1−3÷4)', [6, 1, 3, 4]).status, 'correct');
});

test('AE2 using only some values is wrong even when the total is 24', () => {
  assert.equal(judge('8×3', [8, 3, 3, 1]).status, 'wrong');
});

test('AE3 unmatched parenthesis can be edited', () => {
  assert.equal(judge('(8+3', [8, 3, 3, 1]).status, 'unevaluable');
});

test('AE4 division by zero can be edited', () => {
  assert.equal(judge('8÷(3−3)', [8, 3, 3, 1]).status, 'unevaluable');
});

test('AE5 both copies of a rank are required', () => {
  assert.equal(judge('8÷(3−8÷3)', [8, 8, 3, 3]).status, 'correct');
});

test('AE6 jack is 11', () => {
  assert.equal(judge('6×(11−10+3)', [6, 11, 10, 3]).status, 'correct');
  assert.equal(judge('6×(10−10+4)', [6, 11, 10, 3]).status, 'wrong');
});

test('empty expression is unevaluable', () => {
  assert.equal(judge('   ', [8, 8, 3, 3]).status, 'unevaluable');
});

test('missing one copy of a repeated rank is wrong', () => {
  assert.equal(judge('8+8+8', [8, 8, 3, 3]).status, 'wrong');
});

test('multiplication happens before addition', () => {
  assert.equal(judge('1+3*8', [1, 3, 8, 1]).status, 'wrong');
  assert.equal(judge('2*3+6*3', [2, 3, 6, 3]).status, 'correct');
});
