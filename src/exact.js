export function rat(n, d = 1) {
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = gcd(Math.abs(n), d);
  return { n: n / g, d: d / g };
}

export function add(a, b) {
  return rat(a.n * b.d + b.n * a.d, a.d * b.d);
}

export function sub(a, b) {
  return rat(a.n * b.d - b.n * a.d, a.d * b.d);
}

export function mul(a, b) {
  return rat(a.n * b.n, a.d * b.d);
}

export function div(a, b) {
  if (b.n === 0) return null;
  return rat(a.n * b.d, a.d * b.n);
}

export function is24(value) {
  return value.n === 24 && value.d === 1;
}

function gcd(a, b) {
  let x = a;
  let y = b;
  while (y !== 0) {
    const next = x % y;
    x = y;
    y = next;
  }
  return x || 1;
}
