import { add, div, is24, mul, rat, sub } from './exact.js';

export function judge(expression, values) {
  try {
    const parsed = parse(normalize(expression));
    const got = [...parsed.nums].sort((a, b) => a - b);
    const want = [...values].sort((a, b) => a - b);
    const same =
      got.length === want.length && got.every((n, index) => n === want[index]);
    if (!same || !is24(parsed.value)) return { status: 'wrong' };
    return { status: 'correct' };
  } catch {
    return { status: 'unevaluable' };
  }
}

export function normalize(expression) {
  return String(expression)
    .replace(/\s+/g, '')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/[−–—]/g, '-');
}

function parse(source) {
  const tokens = tokenize(source);
  let index = 0;

  function peek() {
    return tokens[index];
  }

  function parseExpr() {
    let left = parseTerm();
    while (peek() && (peek().type === '+' || peek().type === '-')) {
      const op = tokens[index].type;
      index += 1;
      const right = parseTerm();
      left = combine(left, right, op === '+' ? add : sub);
    }
    return left;
  }

  function parseTerm() {
    let left = parseFactor();
    while (peek() && (peek().type === '*' || peek().type === '/')) {
      const op = tokens[index].type;
      index += 1;
      const right = parseFactor();
      left = combine(left, right, op === '*' ? mul : div);
    }
    return left;
  }

  function parseFactor() {
    const token = peek();
    if (!token) fail();
    if (token.type === '+' || token.type === '-') {
      index += 1;
      const inner = parseFactor();
      if (token.type === '+') return inner;
      return { value: sub(rat(0), inner.value), nums: inner.nums };
    }
    if (token.type === '(') {
      index += 1;
      const inner = parseExpr();
      if (!peek() || peek().type !== ')') fail();
      index += 1;
      return inner;
    }
    if (token.type === 'num') {
      index += 1;
      return { value: rat(token.value), nums: [token.value] };
    }
    fail();
  }

  const result = parseExpr();
  if (index !== tokens.length) fail();
  return result;
}

function combine(left, right, op) {
  const value = op(left.value, right.value);
  if (!value) fail();
  return { value, nums: left.nums.concat(right.nums) };
}

function tokenize(source) {
  if (!source) fail();
  const tokens = [];
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (char >= '0' && char <= '9') {
      let end = i + 1;
      while (end < source.length && source[end] >= '0' && source[end] <= '9') end += 1;
      tokens.push({ type: 'num', value: Number(source.slice(i, end)) });
      i = end - 1;
      continue;
    }
    if ('+-*/()'.includes(char)) {
      tokens.push({ type: char });
      continue;
    }
    fail();
  }
  return tokens;
}

function fail() {
  throw new Error('unevaluable');
}
