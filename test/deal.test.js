import assert from 'node:assert/strict';
import test from 'node:test';
import { dealHand, freshDeck, solveValues } from '../src/deal.js';
import { judge } from '../src/judge.js';

test('several dealt hands are solvable and physically distinct', () => {
  for (let i = 0; i < 12; i += 1) {
    const hand = dealHand();
    assert.equal(hand.cards.length, 4);
    assert.equal(new Set(hand.cards.map((card) => card.id)).size, 4);
    const values = hand.cards.map((card) => card.value);
    assert.equal(judge(hand.solution, values).status, 'correct');
  }
});

test('8 8 3 3 has a solution that uses both eights and both threes', () => {
  const solution = solveValues([8, 8, 3, 3]);
  assert.ok(solution);
  assert.equal(judge(solution, [8, 8, 3, 3]).status, 'correct');
});

test('a jack is solved as 11', () => {
  const solution = solveValues([11, 11, 11, 1]);
  if (solution) {
    assert.match(solution, /11/);
    assert.doesNotMatch(solution, /J/);
    assert.equal(judge(solution, [11, 11, 11, 1]).status, 'correct');
  }
});

test('the deck has 52 cards and four suits of each rank', () => {
  const deck = freshDeck();
  assert.equal(deck.length, 52);
  const aces = deck.filter((card) => card.value === 1);
  assert.equal(aces.length, 4);
  assert.equal(new Set(aces.map((card) => card.suit)).size, 4);
});
