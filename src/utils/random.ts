export const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const randFloat = (min: number, max: number) =>
  Math.random() * (max - min) + min;

export const pick = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

export const pickWeighted = <T extends { weight: number }>(arr: T[]): T => {
  const total = arr.reduce((s, x) => s + x.weight, 0);
  let r = Math.random() * total;
  for (const item of arr) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return arr[arr.length - 1];
};

export const uid = (prefix = "id") =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

export const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));
