export interface BpmResult {
  bpm: number;
  confidence: number;
}

export interface BpmCandidate {
  bpm: number;
  index: number;
}

const MIN_BPM = 60;
const MAX_BPM = 180;
const LOWPASS_FREQUENCY = 150;
const RMS_WINDOW_SIZE = 1024;

type OfflineAudioContextCtor = typeof OfflineAudioContext;

function getOfflineAudioContextCtor(): OfflineAudioContextCtor {
  const w = window as unknown as {
    OfflineAudioContext: OfflineAudioContextCtor;
    webkitOfflineAudioContext?: OfflineAudioContextCtor;
  };
  const Ctor = w.OfflineAudioContext || w.webkitOfflineAudioContext;
  if (!Ctor) {
    throw new Error("OfflineAudioContext is not supported in this environment");
  }
  return Ctor;
}

/**
 * 检测音频文件的 BPM（每分钟节拍数）。
 *
 * 内部流程：解码音频 -> 取第一声道 -> 低通滤波提取低频 -> 计算 RMS 能量包络 ->
 * 自相关扫描 60-180 BPM 区间找峰值 -> 返回 BPM 与置信度。
 * 解码失败或检测异常时返回 { bpm: 0, confidence: 0 }。
 */
export async function detectBpm(file: File): Promise<BpmResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const Ctor = getOfflineAudioContextCtor();
    const decodeCtx = new Ctor(1, 1, 44100);
    const audioBuffer = await decodeCtx.decodeAudioData(arrayBuffer);

    const sampleRate = audioBuffer.sampleRate;
    const channelData = audioBuffer.getChannelData(0);

    const filtered = await applyLowpassFilter(channelData, sampleRate);
    const envelope = computeRmsEnvelope(filtered, RMS_WINDOW_SIZE);
    const result = autocorrelateBpm(envelope, sampleRate, RMS_WINDOW_SIZE);

    const clampedBpm = Math.min(MAX_BPM, Math.max(MIN_BPM, result.bpm));
    return { bpm: clampedBpm, confidence: result.confidence };
  } catch {
    return { bpm: 0, confidence: 0 };
  }
}

async function applyLowpassFilter(
  channelData: Float32Array,
  sampleRate: number,
): Promise<Float32Array> {
  const length = channelData.length;
  const Ctor = getOfflineAudioContextCtor();
  const ctx = new Ctor(1, length, sampleRate);

  const buffer = ctx.createBuffer(1, length, sampleRate);
  buffer.copyToChannel(channelData, 0);

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = LOWPASS_FREQUENCY;

  source.connect(filter);
  filter.connect(ctx.destination);
  source.start();

  const rendered = await ctx.startRendering();
  return rendered.getChannelData(0);
}

function computeRmsEnvelope(data: Float32Array, windowSize: number): Float32Array {
  const numWindows = Math.floor(data.length / windowSize);
  const envelope = new Float32Array(numWindows);
  for (let i = 0; i < numWindows; i++) {
    const start = i * windowSize;
    let sumSquares = 0;
    for (let j = 0; j < windowSize; j++) {
      const sample = data[start + j];
      sumSquares += sample * sample;
    }
    envelope[i] = Math.sqrt(sumSquares / windowSize);
  }
  return envelope;
}

function autocorrelateBpm(
  envelope: Float32Array,
  sampleRate: number,
  windowSize: number,
): BpmResult {
  const envelopeRate = sampleRate / windowSize;
  const minLag = Math.max(1, Math.floor((60 * sampleRate) / (MAX_BPM * windowSize)));
  const maxLag = Math.min(
    envelope.length - 1,
    Math.ceil((60 * sampleRate) / (MIN_BPM * windowSize)),
  );

  if (maxLag < minLag || envelope.length <= maxLag) {
    return { bpm: 0, confidence: 0 };
  }

  const correlations = new Float32Array(maxLag + 1);
  let bestLag = minLag;
  let bestCorrelation = -Infinity;
  let sumCorrelation = 0;
  let countCorrelation = 0;

  for (let lag = minLag; lag <= maxLag; lag++) {
    let correlation = 0;
    const len = envelope.length - lag;
    for (let i = 0; i < len; i++) {
      correlation += envelope[i] * envelope[i + lag];
    }
    if (len > 0) {
      correlation /= len;
    }
    correlations[lag] = correlation;
    sumCorrelation += correlation;
    countCorrelation++;
    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestLag = lag;
    }
  }

  if (countCorrelation === 0) {
    return { bpm: 0, confidence: 0 };
  }

  let refinedLag = bestLag;
  if (bestLag > minLag && bestLag < maxLag) {
    const alpha = correlations[bestLag - 1];
    const beta = correlations[bestLag];
    const gamma = correlations[bestLag + 1];
    const denom = alpha - 2 * beta + gamma;
    if (denom !== 0) {
      refinedLag = bestLag + (0.5 * (alpha - gamma)) / denom;
    }
  }

  const bpm = (60 * envelopeRate) / refinedLag;
  const meanCorrelation = sumCorrelation / countCorrelation;
  const confidence = meanCorrelation > 0 ? bestCorrelation / meanCorrelation : 0;

  return { bpm, confidence };
}

/**
 * 计算两个 BPM 之间的音乐距离，考虑倍频等价。
 * 例如 120 与 60 视为同速，距离取 |a-b|、|a-b*2|、|a-b/2| 的最小值。
 */
export function bpmDistance(a: number, b: number): number {
  const d1 = Math.abs(a - b);
  const d2 = Math.abs(a - b * 2);
  const d3 = Math.abs(a - b / 2);
  return Math.min(d1, d2, d3);
}

/**
 * 从候选曲目中选择 BPM 与当前曲目最接近的一首，返回其 index。
 * 候选列表为空时返回 -1。
 */
export function pickNextByBpm(currentBpm: number, candidates: BpmCandidate[]): number {
  if (candidates.length === 0) {
    return -1;
  }
  let bestIndex = candidates[0].index;
  let bestDistance = bpmDistance(currentBpm, candidates[0].bpm);
  for (let i = 1; i < candidates.length; i++) {
    const distance = bpmDistance(currentBpm, candidates[i].bpm);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = candidates[i].index;
    }
  }
  return bestIndex;
}
