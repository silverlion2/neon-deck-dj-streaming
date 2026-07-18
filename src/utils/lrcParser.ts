export interface LrcLine {
  time: number;
  text: string;
}

const TIME_TAG_RE = /\[(\d{1,2}):(\d{1,2})(?:[.:](\d{1,3}))?\]/g;

export const parseLrc = (content: string): LrcLine[] => {
  if (!content) return [];
  const result: LrcLine[] = [];
  const lines = content.split(/\r?\n/);
  for (const rawLine of lines) {
    const matches = Array.from(rawLine.matchAll(TIME_TAG_RE));
    if (matches.length === 0) continue;
    const times: number[] = [];
    let lastEnd = 0;
    for (const match of matches) {
      const mm = parseInt(match[1], 10);
      const ss = parseInt(match[2], 10);
      const fracStr = match[3] ?? "";
      const frac = fracStr ? parseInt(fracStr, 10) / Math.pow(10, fracStr.length) : 0;
      times.push(mm * 60 + ss + frac);
      lastEnd = (match.index ?? 0) + match[0].length;
    }
    const text = rawLine.slice(lastEnd).trim();
    if (!text) continue;
    for (const time of times) {
      result.push({ time, text });
    }
  }
  result.sort((a, b) => a.time - b.time);
  return result;
};

export const findCurrentLine = (lines: LrcLine[], currentTime: number): number => {
  if (lines.length === 0) return -1;
  if (currentTime < lines[0].time) return -1;
  let lo = 0;
  let hi = lines.length - 1;
  let result = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (lines[mid].time <= currentTime) {
      result = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return result;
};
