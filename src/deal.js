import { add, div, is24, mul, rat, sub } from './exact.js';

const RANKS = [
  ['A', 1],
  ['2', 2],
  ['3', 3],
  ['4', 4],
  ['5', 5],
  ['6', 6],
  ['7', 7],
  ['8', 8],
  ['9', 9],
  ['10', 10],
  ['J', 11],
  ['Q', 12],
  ['K', 13],
];

const SUITS = [
  ['hearts', '♥', true],
  ['diamonds', '♦', true],
  ['clubs', '♣', false],
  ['spades', '♠', false],
];

export function freshDeck() {
  const cards = [];
  for (const [label, value] of RANKS) {
    for (const [suit, symbol, red] of SUITS) {
      cards.push({ id: `${label}-${suit}`, label, value, suit, symbol, red });
    }
  }
  return cards;
}

export function solveValues(values) {
  return solve(values.map((value) => ({ v: rat(value), e: String(value) })));
}

export function dealHand(random = Math.random) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const cards = shuffle(freshDeck(), random).slice(0, 4);
    const solution = solveValues(cards.map((card) => card.value));
    if (solution) return { cards, solution };
  }
  throw new Error('no solvable hand');
}

function solve(items) {
  if (items.length === 1) return is24(items[0].v) ? items[0].e : null;
  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      const rest = items.filter((_, index) => index !== i && index !== j);
      const pairs = [
        [items[i], items[j]],
        [items[j], items[i]],
      ];
      for (const [a, b] of pairs) {
        const options = [
          { v: add(a.v, b.v), e: `(${a.e}+${b.e})` },
          { v: sub(a.v, b.v), e: `(${a.e}-${b.e})` },
          { v: mul(a.v, b.v), e: `(${a.e}*${b.e})` },
        ];
        const divided = div(a.v, b.v);
        if (divided) options.push({ v: divided, e: `(${a.e}÷${b.e})` });
        for (const option of options) {
          const found = solve(rest.concat(option));
          if (found) return found;
        }
      }
    }
  }
  return null;
}

function shuffle(cards, random) {
  const copy = cards.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
