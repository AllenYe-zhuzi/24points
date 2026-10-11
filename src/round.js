import { dealHand } from './deal.js';
import { judge } from './judge.js';

const QUESTION_MS = 60_000;
const QUESTION_COUNT = 10;

export function createRound(now, deal = dealHand) {
  return openQuestion({ scores: [], questionIndex: 1, deal }, now);
}

export function tick(state, now) {
  if (state.phase !== 'answering') return state;
  const remainingMs = state.startedAt + QUESTION_MS - now;
  if (remainingMs <= 0) return lock(state, 'timedOut', 0, 0);
  return { ...state, remainingMs };
}

export function submit(state, expression, now) {
  const current = tick(state, now);
  if (current.phase !== 'answering') return current;
  const result = judge(expression, current.values);
  if (result.status === 'unevaluable') return current;
  if (result.status === 'correct') return lock(current, 'correct', 10, current.remainingMs);
  return lock(current, 'wrong', 0, current.remainingMs);
}

export function reveal(state) {
  if (state.phase !== 'wrong' && state.phase !== 'timedOut') return state;
  return { ...state, revealed: true };
}

export function next(state, now) {
  if (!isLocked(state.phase)) return state;
  if (state.questionIndex < QUESTION_COUNT) {
    return openQuestion(
      { ...state, questionIndex: state.questionIndex + 1 },
      now,
    );
  }
  return {
    ...state,
    phase: 'scored',
    total: state.scores.reduce((sum, points) => sum + points, 0),
    remainingMs: 0,
    revealed: false,
  };
}

export function exitRound(state) {
  if (state.phase === 'scored') return { ...state, phase: 'left' };
  if (state.phase === 'answering' || isLocked(state.phase)) {
    return { ...state, phase: 'abandoned', total: null, revealed: false };
  }
  return state;
}

export function newRound(state, now) {
  if (state.phase !== 'scored') return state;
  return createRound(now, state.deal);
}

export function view(state) {
  const locked = isLocked(state.phase);
  const showScore = state.phase === 'scored' || state.phase === 'left';
  return {
    phase: state.phase,
    questionIndex: state.questionIndex,
    questionCount: QUESTION_COUNT,
    remainingMs: Math.max(0, state.remainingMs),
    cards: state.cards,
    outcome:
      state.phase === 'correct'
        ? 'correct'
        : state.phase === 'wrong'
          ? 'wrong'
          : state.phase === 'timedOut'
            ? 'timeout'
            : null,
    solution: state.revealed ? state.solution : null,
    score: showScore ? state.total : null,
    canSubmit: state.phase === 'answering',
    canExit: state.phase === 'answering' || locked || state.phase === 'scored',
    canReveal: state.phase === 'wrong' || state.phase === 'timedOut',
    canNext: locked,
    canNewRound: state.phase === 'scored',
  };
}

function openQuestion(state, now) {
  const hand = state.deal();
  return {
    ...state,
    phase: 'answering',
    startedAt: now,
    remainingMs: QUESTION_MS,
    cards: hand.cards,
    values: hand.cards.map((card) => card.value),
    solution: hand.solution,
    revealed: false,
    total: null,
  };
}

function lock(state, phase, points, remainingMs) {
  return {
    ...state,
    phase,
    remainingMs,
    scores: state.scores.concat(points),
    revealed: false,
  };
}

function isLocked(phase) {
  return phase === 'correct' || phase === 'wrong' || phase === 'timedOut';
}
