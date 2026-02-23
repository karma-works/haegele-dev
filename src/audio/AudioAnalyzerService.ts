import * as Tone from "tone";

export interface AudioAnalyzerConfig {
  fftSize?: number;
  smoothingTimeConstant?: number;
  minDecibels?: number;
  maxDecibels?: number;
}

export interface FrequencyData {
  data: Uint8Array;
  frequencyBinCount: number;
  sampleRate: number;
  nyquist: number;
}

export interface TimeDomainData {
  data: Uint8Array;
  length: number;
}

export interface FloatFrequencyData {
  data: Float32Array;
  frequencyBinCount: number;
  sampleRate: number;
  nyquist: number;
}

export interface FloatTimeDomainData {
  data: Float32Array;
  length: number;
}

const DEFAULT_CONFIG: Required<AudioAnalyzerConfig> = {
  fftSize: 2048,
  smoothingTimeConstant: 0.8,
  minDecibels: -100,
  maxDecibels: -30,
};

export class AudioAnalyzerServiceImpl {
  private analyser: AnalyserNode | null = null;
  private config: Required<AudioAnalyzerConfig>;
  private isConnected = false;
  private byteFrequencyData: Uint8Array | null = null;
  private byteTimeDomainData: Uint8Array | null = null;
  private floatFrequencyData: Float32Array | null = null;
  private floatTimeDomainData: Float32Array | null = null;

  constructor(config: Partial<AudioAnalyzerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private async ensureContext(): Promise<void> {
    await Tone.start();
  }

  async initialize(): Promise<void> {
    await this.ensureContext();

    if (this.analyser) return;

    const context = Tone.getContext().rawContext as
      | AudioContext
      | { native: AudioContext };
    const audioContext = "native" in context ? context.native : context;

    this.analyser = audioContext.createAnalyser();
    this.analyser.fftSize = this.config.fftSize;
    this.analyser.smoothingTimeConstant = this.config.smoothingTimeConstant;
    this.analyser.minDecibels = this.config.minDecibels;
    this.analyser.maxDecibels = this.config.maxDecibels;

    this.allocateBuffers();
  }

  private allocateBuffers(): void {
    if (!this.analyser) return;

    const binCount = this.analyser.frequencyBinCount;

    this.byteFrequencyData = new Uint8Array(binCount);
    this.byteTimeDomainData = new Uint8Array(this.analyser.fftSize);
    this.floatFrequencyData = new Float32Array(binCount);
    this.floatTimeDomainData = new Float32Array(this.analyser.fftSize);
  }

  connect(): void {
    if (!this.analyser || this.isConnected) return;

    const context = Tone.getContext().rawContext as
      | AudioContext
      | { native: AudioContext };
    const audioContext = "native" in context ? context.native : context;
    const destination = audioContext.destination;

    this.analyser.connect(destination);
    this.isConnected = true;
  }

  connectToNode(node: AudioNode): void {
    if (!this.analyser) return;

    node.connect(this.analyser);
    this.isConnected = true;
  }

  disconnect(): void {
    if (!this.analyser || !this.isConnected) return;

    this.analyser.disconnect();
    this.isConnected = false;
  }

  getByteFrequencyData(): FrequencyData | null {
    if (!this.analyser || !this.byteFrequencyData) return null;

    this.analyser.getByteFrequencyData(
      this.byteFrequencyData as Uint8Array<ArrayBuffer>,
    );

    const context = Tone.getContext().rawContext as
      | AudioContext
      | { native: AudioContext };
    const audioContext = "native" in context ? context.native : context;
    const sampleRate = audioContext.sampleRate;

    return {
      data: this.byteFrequencyData,
      frequencyBinCount: this.analyser.frequencyBinCount,
      sampleRate,
      nyquist: sampleRate / 2,
    };
  }

  getByteTimeDomainData(): TimeDomainData | null {
    if (!this.analyser || !this.byteTimeDomainData) return null;

    this.analyser.getByteTimeDomainData(
      this.byteTimeDomainData as Uint8Array<ArrayBuffer>,
    );

    return {
      data: this.byteTimeDomainData,
      length: this.byteTimeDomainData.length,
    };
  }

  getFloatFrequencyData(): FloatFrequencyData | null {
    if (!this.analyser || !this.floatFrequencyData) return null;

    this.analyser.getFloatFrequencyData(
      this.floatFrequencyData as Float32Array<ArrayBuffer>,
    );

    const context = Tone.getContext().rawContext as
      | AudioContext
      | { native: AudioContext };
    const audioContext = "native" in context ? context.native : context;
    const sampleRate = audioContext.sampleRate;

    return {
      data: this.floatFrequencyData,
      frequencyBinCount: this.analyser.frequencyBinCount,
      sampleRate,
      nyquist: sampleRate / 2,
    };
  }

  getFloatTimeDomainData(): FloatTimeDomainData | null {
    if (!this.analyser || !this.floatTimeDomainData) return null;

    this.analyser.getFloatTimeDomainData(
      this.floatTimeDomainData as Float32Array<ArrayBuffer>,
    );

    return {
      data: this.floatTimeDomainData,
      length: this.floatTimeDomainData.length,
    };
  }

  setFFTSize(size: number): void {
    if (!this.analyser) return;

    const validSizes = [
      32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768,
    ];
    if (!validSizes.includes(size)) {
      console.warn(
        `Invalid FFT size: ${size}. Must be a power of 2 between 32 and 32768.`,
      );
      return;
    }

    this.analyser.fftSize = size;
    this.config.fftSize = size;
    this.allocateBuffers();
  }

  getFFTSize(): number {
    return this.analyser?.fftSize ?? this.config.fftSize;
  }

  setSmoothingTimeConstant(value: number): void {
    if (!this.analyser) return;

    const clamped = Math.max(0, Math.min(1, value));
    this.analyser.smoothingTimeConstant = clamped;
    this.config.smoothingTimeConstant = clamped;
  }

  getSmoothingTimeConstant(): number {
    return (
      this.analyser?.smoothingTimeConstant ?? this.config.smoothingTimeConstant
    );
  }

  setMinDecibels(value: number): void {
    if (!this.analyser) return;

    this.analyser.minDecibels = value;
    this.config.minDecibels = value;
  }

  getMinDecibels(): number {
    return this.analyser?.minDecibels ?? this.config.minDecibels;
  }

  setMaxDecibels(value: number): void {
    if (!this.analyser) return;

    this.analyser.maxDecibels = value;
    this.config.maxDecibels = value;
  }

  getMaxDecibels(): number {
    return this.analyser?.maxDecibels ?? this.config.maxDecibels;
  }

  getFrequencyBinCount(): number {
    return this.analyser?.frequencyBinCount ?? this.config.fftSize / 2;
  }

  getFrequencyForBin(binIndex: number): number | null {
    if (!this.analyser) return null;

    const context = Tone.getContext().rawContext as
      | AudioContext
      | { native: AudioContext };
    const audioContext = "native" in context ? context.native : context;
    const sampleRate = audioContext.sampleRate;
    const binCount = this.analyser.frequencyBinCount;

    return (binIndex * sampleRate) / (binCount * 2);
  }

  getBinForFrequency(frequency: number): number | null {
    if (!this.analyser) return null;

    const context = Tone.getContext().rawContext as
      | AudioContext
      | { native: AudioContext };
    const audioContext = "native" in context ? context.native : context;
    const sampleRate = audioContext.sampleRate;
    const binCount = this.analyser.frequencyBinCount;

    return Math.round((frequency * binCount * 2) / sampleRate);
  }

  isInitialized(): boolean {
    return this.analyser !== null;
  }

  isActive(): boolean {
    return this.analyser !== null && this.isConnected;
  }

  getAnalyserNode(): AnalyserNode | null {
    return this.analyser;
  }

  destroy(): void {
    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }

    this.byteFrequencyData = null;
    this.byteTimeDomainData = null;
    this.floatFrequencyData = null;
    this.floatTimeDomainData = null;
    this.isConnected = false;
  }
}

let analyzerInstance: AudioAnalyzerServiceImpl | null = null;
let getAnalyzerPromise: Promise<AudioAnalyzerServiceImpl> | null = null;

export async function getAudioAnalyzer(
  config?: Partial<AudioAnalyzerConfig>,
): Promise<AudioAnalyzerServiceImpl> {
  if (analyzerInstance) {
    return analyzerInstance;
  }

  if (getAnalyzerPromise) {
    return getAnalyzerPromise;
  }

  getAnalyzerPromise = (async () => {
    analyzerInstance = new AudioAnalyzerServiceImpl(config);
    await analyzerInstance.initialize();
    return analyzerInstance;
  })();

  return getAnalyzerPromise;
}

export function destroyAudioAnalyzer(): void {
  if (analyzerInstance) {
    analyzerInstance.destroy();
    analyzerInstance = null;
    getAnalyzerPromise = null;
  }
}
