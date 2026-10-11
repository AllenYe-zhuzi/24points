import { dealHand } from './deal.js';
import {
  createRound,
  exitRound,
  newRound,
  next,
  reveal,
  submit,
  tick,
  view,
} from './round.js';

const outcomeText = {
  correct: '答对了',
  wrong: '答错了',
  timeout: '时间到',
};

const nodes = {
  question: document.querySelector('#question-index'),
  timer: document.querySelector('#timer'),
  cards: document.querySelector('#cards'),
  form: document.querySelector('#answer-form'),
  expression: document.querySelector('#expression'),
  submit: document.querySelector('#submit'),
  outcome: document.querySelector('#outcome'),
  solution: document.querySelector('#solution'),
  score: document.querySelector('#score'),
  reveal: document.querySelector('#reveal'),
  next: document.querySelector('#next'),
  newRound: document.querySelector('#new-round'),
  exit: document.querySelector('#exit'),
};

let state = createRound(Date.now(), dealHand);

nodes.form.addEventListener('submit', (event) => {
  event.preventDefault();
  state = submit(state, nodes.expression.value, Date.now());
  render();
});

nodes.reveal.addEventListener('click', () => {
  state = reveal(state);
  render();
});

nodes.next.addEventListener('click', () => {
  state = next(state, Date.now());
  nodes.expression.value = '';
  render();
});

nodes.newRound.addEventListener('click', () => {
  state = newRound(state, Date.now());
  nodes.expression.value = '';
  render();
});

nodes.exit.addEventListener('click', () => {
  state = exitRound(state);
  render();
});

setInterval(() => {
  const previous = state.phase;
  state = tick(state, Date.now());
  if (state.phase !== previous || state.phase === 'answering') render();
}, 200);

render();

function render() {
  const screen = view(state);
  const playing = screen.phase !== 'scored' && screen.phase !== 'left';
  nodes.question.hidden = !playing || screen.phase === 'abandoned';
  nodes.timer.hidden = screen.phase !== 'answering' && !isLocked(screen.phase);
  nodes.cards.hidden = !playing;
  nodes.form.hidden = !playing || screen.phase === 'abandoned';
  nodes.question.textContent = `第 ${screen.questionIndex} / ${screen.questionCount} 题`;
  nodes.timer.textContent = `${Math.ceil(screen.remainingMs / 1000)} 秒`;
  nodes.cards.replaceChildren(
    ...screen.cards.map((card) => {
      const face = document.createElement('div');
      face.className = `card${card.red ? ' red' : ''}`;
      const rank = document.createElement('strong');
      rank.textContent = card.label;
      const point = document.createElement('small');
      point.textContent = `${card.symbol} ${card.value}`;
      face.append(rank, point);
      return face;
    }),
  );
  nodes.expression.disabled = !screen.canSubmit;
  nodes.submit.hidden = !screen.canSubmit;
  nodes.outcome.hidden = !screen.outcome && screen.phase !== 'abandoned' && screen.phase !== 'left';
  nodes.outcome.textContent =
    screen.phase === 'abandoned' || screen.phase === 'left'
      ? '本轮已退出'
      : outcomeText[screen.outcome] ?? '';
  nodes.solution.hidden = !screen.solution;
  nodes.solution.textContent = screen.solution ? `一种解法：${screen.solution}` : '';
  nodes.score.hidden = screen.score === null;
  nodes.score.textContent = screen.score === null ? '' : `得分 ${screen.score}`;
  nodes.reveal.hidden = !screen.canReveal;
  nodes.next.hidden = !screen.canNext;
  nodes.newRound.hidden = !screen.canNewRound;
  nodes.exit.hidden = !screen.canExit;
}

function isLocked(phase) {
  return phase === 'correct' || phase === 'wrong' || phase === 'timedOut';
}
