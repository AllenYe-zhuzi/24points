import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('page skeleton exposes the round controls', () => {
  for (const id of [
    'cards',
    'question-index',
    'timer',
    'expression',
    'submit',
    'next',
    'reveal',
    'exit',
    'new-round',
    'score',
  ]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(html, /styles\.css/);
  assert.doesNotMatch(html, /type="module"/);
  for (const file of ['exact.js', 'judge.js', 'deal.js', 'round.js', 'main.js']) {
    assert.match(html, new RegExp(`src="src/${file}"`));
  }
});
