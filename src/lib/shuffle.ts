/**
 * Unbiased Fisher–Yates shuffle. Returns a new array; the input is untouched.
 * Uses crypto.getRandomValues when available.
 */
export function shuffle<T>(input: readonly T[], random: () => number = secureRandom): T[] {
  const arr = input.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function secureRandom(): number {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] / 2 ** 32;
  }
  return Math.random();
}
