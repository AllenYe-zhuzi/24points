import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createRound,
  exitRound,
  newRound,
  next,
  reveal,
  submit,
  tick,
  view,
} from './load.js';

const solvable = {
  cards: [
    { id: '6-spades', label: '6', value: 6, suit: 'spades', symbol: '♠', red: false },
    { id: '1-hearts', label: 'A', value: 1, suit: 'hearts', symbol: '♥', red: true },
    { id: '3-clubs', label: '3', value: 3, suit: 'clubs', symbol: '♣', red: false },
    { id: '4-diamonds', label: '4', value: 4, suit: 'diamonds', symbol: '♦', red: true },
  ],
  solution: '6/(1-3/4)',
};

function scriptedDeal(hands) {
  let index = 0;
  return () => {
    const hand = hands[Math.min(index, hands.length - 1)];
    index += 1;
    return hand;
  };
}

function start(now = 0, hands = [solvable]) {
  return createRound(now, scriptedDeal(hands));
}

test('AE7 answering offers submit and exit, not the answer', () => {
  const screen = view(start());
  assert.equal(screen.canSubmit, true);
  assert.equal(screen.canExit, true);
  assert.equal(screen.canReveal, false);
  assert.equal(screen.solution, null);
});

test('AE8 a wrong answer can advance without revealing', () => {
  let state = start();
  for (let question = 1; question < 3; question += 1) {
    state = submit(state, solvable.solution, question * 1000);
    state = next(state, question * 1000);
  }
  state = submit(state, '8×3', 3000);
  assert.equal(view(state).outcome, 'wrong');
  assert.equal(view(state).score, null);
  assert.equal(view(state).canNext, true);
  state = next(state, 3000);
  assert.equal(state.questionIndex, 4);
  assert.equal(view(state).remainingMs, 60_000);
  assert.equal(state.scores.at(-1), 0);
});

test('AE9 timeout scores zero and can reveal a correct expression', () => {
  let state = tick(start(), 60_000);
  state = reveal(state);
  const screen = view(state);
  assert.equal(screen.outcome, 'timeout');
  assert.equal(screen.score, null);
  assert.equal(screen.canNext, true);
  assert.equal(screen.solution, solvable.solution);
});

test('AE10 question 10 shows the total only after next', () => {
  let state = start(0, Array.from({ length: 10 }, () => solvable));
  for (let question = 1; question <= 10; question += 1) {
    state = submit(state, solvable.solution, question * 1000);
    if (question < 10) state = next(state, question * 1000);
  }
  assert.equal(view(state).score, null);
  state = next(state, 11_000);
  assert.equal(view(state).score, 100);
});

test('AE11 exiting question 10 before next shows no score', () => {
  let state = start();
  state = { ...state, questionIndex: 10, scores: Array(9).fill(10) };
  state = submit(state, solvable.solution, 1000);
  state = exitRound(state);
  const screen = view(state);
  assert.equal(screen.score, null);
  assert.equal(screen.canNext, false);
});

test('AE12 mid-round exit removes continue actions and the score', () => {
  let state = exitRound({ ...start(), questionIndex: 4 });
  const screen = view(state);
  assert.equal(screen.score, null);
  assert.equal(screen.canSubmit, false);
  assert.equal(screen.canNext, false);
  assert.equal(screen.canNewRound, false);
});

test('AE13 a new round clears the score and returns to question 1', () => {
  let state = submit(start(), solvable.solution, 1000);
  state = { ...state, questionIndex: 10, scores: [10] };
  state = next(state, 2000);
  assert.equal(view(state).score, 10);
  state = newRound(state, 3000);
  const screen = view(state);
  assert.equal(screen.questionIndex, 1);
  assert.equal(screen.score, null);
  assert.equal(screen.canSubmit, true);
});

test('AE14 a fresh round does not keep the previous score', () => {
  const finished = next(
    { ...submit(start(), solvable.solution, 1000), questionIndex: 10, scores: [10] },
    2000,
  );
  assert.equal(view(finished).score, 10);
  const second = view(start(5000));
  assert.equal(second.score, null);
  assert.equal(second.questionIndex, 1);
});

test('AE15 exit on the score screen keeps the score and removes a new round', () => {
  let state = submit(start(), solvable.solution, 1000);
  state = { ...state, questionIndex: 10, scores: [10] };
  state = next(state, 2000);
  state = exitRound(state);
  const screen = view(state);
  assert.equal(screen.score, 10);
  assert.equal(screen.canNewRound, false);
});

test('ten answers with one miss score 90', () => {
  let state = start(0, Array.from({ length: 10 }, () => solvable));
  state = submit(state, '8×3', 10);
  state = next(state, 20);
  for (let question = 2; question <= 10; question += 1) {
    state = submit(state, solvable.solution, question * 10);
    if (question < 10) state = next(state, question * 10);
  }
  state = next(state, 200);
  assert.equal(view(state).score, 90);
});
