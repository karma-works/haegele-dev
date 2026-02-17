export interface ECGConfig {
  bpm: number;
  sampleRate: number;
  baselineWanderAmplitude: number;
  baselineWanderFrequency: number;
}

export interface ECGPoint {
  time: number;
  value: number;
}

const DEFAULT_CONFIG: ECGConfig = {
  bpm: 80,
  sampleRate: 250,
  baselineWanderAmplitude: 0.05,
  baselineWanderFrequency: 0.15,
};

interface WaveParams {
  amplitude: number;
  center: number;
  width: number;
}

interface PQRSTConfig {
  P: WaveParams;
  Q: WaveParams;
  R: WaveParams;
  S: WaveParams;
  T: WaveParams;
}

const PQRST_NORMALIZED: PQRSTConfig = {
  P: { amplitude: 0.15, center: 0.12, width: 0.04 },
  Q: { amplitude: -0.1, center: 0.18, width: 0.012 },
  R: { amplitude: 1.0, center: 0.22, width: 0.015 },
  S: { amplitude: -0.2, center: 0.26, width: 0.012 },
  T: { amplitude: 0.25, center: 0.38, width: 0.06 },
};

function gaussian(x: number, center: number, width: number): number {
  const sigma = width / 2.355;
  const diff = x - center;
  return Math.exp(-(diff * diff) / (2 * sigma * sigma));
}

export class ECGWaveGenerator {
  private config: ECGConfig;
  private pqrst: PQRSTConfig;
  private phase: number = 0;
  private baselinePhase: number = 0;
  private lastTime: number = 0;
  private isRunning: boolean = false;

  constructor(config: Partial<ECGConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.pqrst = this.scalePQRST();
    this.lastTime = performance.now();
  }

  private scalePQRST(): PQRSTConfig {
    const beatDuration = 60 / this.config.bpm;
    const scaled = { ...PQRST_NORMALIZED };
    
    scaled.P = {
      amplitude: PQRST_NORMALIZED.P.amplitude,
      center: PQRST_NORMALIZED.P.center * beatDuration,
      width: PQRST_NORMALIZED.P.width * beatDuration,
    };
    scaled.Q = {
      amplitude: PQRST_NORMALIZED.Q.amplitude,
      center: PQRST_NORMALIZED.Q.center * beatDuration,
      width: PQRST_NORMALIZED.Q.width * beatDuration,
    };
    scaled.R = {
      amplitude: PQRST_NORMALIZED.R.amplitude,
      center: PQRST_NORMALIZED.R.center * beatDuration,
      width: PQRST_NORMALIZED.R.width * beatDuration,
    };
    scaled.S = {
      amplitude: PQRST_NORMALIZED.S.amplitude,
      center: PQRST_NORMALIZED.S.center * beatDuration,
      width: PQRST_NORMALIZED.S.width * beatDuration,
    };
    scaled.T = {
      amplitude: PQRST_NORMALIZED.T.amplitude,
      center: PQRST_NORMALIZED.T.center * beatDuration,
      width: PQRST_NORMALIZED.T.width * beatDuration,
    };
    
    return scaled;
  }

  setBPM(bpm: number): void {
    this.config.bpm = Math.max(20, Math.min(300, bpm));
    this.pqrst = this.scalePQRST();
  }

  getBPM(): number {
    return this.config.bpm;
  }

  setBaselineWander(amplitude: number, frequency: number): void {
    this.config.baselineWanderAmplitude = amplitude;
    this.config.baselineWanderFrequency = frequency;
  }

  start(): void {
    this.isRunning = true;
    this.lastTime = performance.now();
  }

  stop(): void {
    this.isRunning = false;
  }

  reset(): void {
    this.phase = 0;
    this.baselinePhase = 0;
    this.lastTime = performance.now();
  }

  private calculateBaselineWander(time: number): number {
    return this.config.baselineWanderAmplitude * 
           Math.sin(2 * Math.PI * this.config.baselineWanderFrequency * time);
  }

  private calculatePQRST(phase: number): number {
    const { P, Q, R, S, T } = this.pqrst;
    
    return P.amplitude * gaussian(phase, P.center, P.width) +
           Q.amplitude * gaussian(phase, Q.center, Q.width) +
           R.amplitude * gaussian(phase, R.center, R.width) +
           S.amplitude * gaussian(phase, S.center, S.width) +
           T.amplitude * gaussian(phase, T.center, T.width);
  }

  update(deltaTime: number): void {
    if (!this.isRunning) return;

    const beatDuration = 60 / this.config.bpm;
    this.phase += deltaTime;
    this.baselinePhase += deltaTime;

    if (this.phase >= beatDuration) {
      this.phase = this.phase % beatDuration;
    }
  }

  getCurrentValue(): number {
    const pqrstValue = this.calculatePQRST(this.phase);
    const baselineWander = this.calculateBaselineWander(this.baselinePhase);
    return pqrstValue + baselineWander;
  }

  getValueAtTime(time: number): number {
    const beatDuration = 60 / this.config.bpm;
    const phase = time % beatDuration;
    const pqrstValue = this.calculatePQRST(phase);
    const baselineWander = this.calculateBaselineWander(time);
    return pqrstValue + baselineWander;
  }

  generateBeat(): ECGPoint[] {
    const beatDuration = 60 / this.config.bpm;
    const sampleCount = Math.floor(beatDuration * this.config.sampleRate);
    const points: ECGPoint[] = [];

    for (let i = 0; i < sampleCount; i++) {
      const time = (i / sampleCount) * beatDuration;
      const value = this.getValueAtTime(time);
      points.push({ time, value });
    }

    return points;
  }

  generateDuration(durationSeconds: number): ECGPoint[] {
    const sampleCount = Math.floor(durationSeconds * this.config.sampleRate);
    const points: ECGPoint[] = [];

    for (let i = 0; i < sampleCount; i++) {
      const time = i / this.config.sampleRate;
      const value = this.getValueAtTime(time);
      points.push({ time, value });
    }

    return points;
  }

  generatePoints(count: number, startTime: number = 0): ECGPoint[] {
    const points: ECGPoint[] = [];
    const beatDuration = 60 / this.config.bpm;
    const dt = beatDuration / count;

    for (let i = 0; i < count; i++) {
      const time = startTime + i * dt;
      const value = this.getValueAtTime(time);
      points.push({ time, value });
    }

    return points;
  }

  getPhase(): number {
    return this.phase;
  }

  getBeatDuration(): number {
    return 60 / this.config.bpm;
  }

  getProgress(): number {
    const beatDuration = this.getBeatDuration();
    return this.phase / beatDuration;
  }

  isAtPeak(): boolean {
    const { R } = this.pqrst;
    const rPeakWindow = R.width * 0.5;
    return Math.abs(this.phase - R.center) < rPeakWindow;
  }

  destroy(): void {
    this.stop();
  }
}

let ecgGeneratorInstance: ECGWaveGenerator | null = null;

export function getECGGenerator(config?: Partial<ECGConfig>): ECGWaveGenerator {
  if (!ecgGeneratorInstance) {
    ecgGeneratorInstance = new ECGWaveGenerator(config);
  } else if (config) {
    if (config.bpm !== undefined) {
      ecgGeneratorInstance.setBPM(config.bpm);
    }
    if (config.baselineWanderAmplitude !== undefined || config.baselineWanderFrequency !== undefined) {
      ecgGeneratorInstance.setBaselineWander(
        config.baselineWanderAmplitude ?? ecgGeneratorInstance['config'].baselineWanderAmplitude,
        config.baselineWanderFrequency ?? ecgGeneratorInstance['config'].baselineWanderFrequency
      );
    }
  }
  return ecgGeneratorInstance;
}

export function destroyECGGenerator(): void {
  if (ecgGeneratorInstance) {
    ecgGeneratorInstance.destroy();
    ecgGeneratorInstance = null;
  }
}
