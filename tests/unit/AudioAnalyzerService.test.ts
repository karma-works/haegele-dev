import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AudioAnalyzerServiceImpl, getAudioAnalyzer, destroyAudioAnalyzer } from '../../src/audio/AudioAnalyzerService';

vi.mock('tone', () => ({
  start: vi.fn().mockResolvedValue(undefined),
  getContext: vi.fn().mockReturnValue({
    rawContext: {
      createAnalyser: vi.fn().mockReturnValue({
        fftSize: 2048,
        frequencyBinCount: 1024,
        smoothingTimeConstant: 0.8,
        minDecibels: -100,
        maxDecibels: -30,
        connect: vi.fn(),
        disconnect: vi.fn(),
        getByteFrequencyData: vi.fn(),
        getByteTimeDomainData: vi.fn(),
        getFloatFrequencyData: vi.fn(),
        getFloatTimeDomainData: vi.fn(),
      }),
      destination: {},
      sampleRate: 44100,
    },
  }),
}));

describe('AudioAnalyzerService', () => {
  let analyzer: AudioAnalyzerServiceImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    destroyAudioAnalyzer();
  });

  afterEach(() => {
    analyzer?.destroy();
    destroyAudioAnalyzer();
  });

  describe('constructor', () => {
    it('creates analyzer with default config', () => {
      analyzer = new AudioAnalyzerServiceImpl();
      expect(analyzer).toBeDefined();
      expect(analyzer.getFFTSize()).toBe(2048);
    });

    it('accepts custom FFT size', () => {
      analyzer = new AudioAnalyzerServiceImpl({ fftSize: 4096 });
      expect(analyzer.getFFTSize()).toBe(4096);
    });

    it('accepts custom smoothing', () => {
      analyzer = new AudioAnalyzerServiceImpl({ smoothingTimeConstant: 0.5 });
      expect(analyzer.getSmoothingTimeConstant()).toBe(0.5);
    });

    it('accepts custom decibel range', () => {
      analyzer = new AudioAnalyzerServiceImpl({ minDecibels: -90, maxDecibels: -20 });
      expect(analyzer.getMinDecibels()).toBe(-90);
      expect(analyzer.getMaxDecibels()).toBe(-20);
    });
  });

  describe('initialization', () => {
    it('is not initialized before init', () => {
      analyzer = new AudioAnalyzerServiceImpl();
      expect(analyzer.isInitialized()).toBe(false);
    });

    it('is not active before connect', async () => {
      analyzer = new AudioAnalyzerServiceImpl();
      await analyzer.initialize();
      expect(analyzer.isActive()).toBe(false);
    });

    it('returns frequency bin count from config before init', () => {
      analyzer = new AudioAnalyzerServiceImpl({ fftSize: 1024 });
      expect(analyzer.getFrequencyBinCount()).toBe(512);
    });
  });

  describe('configuration methods', () => {
    beforeEach(async () => {
      analyzer = new AudioAnalyzerServiceImpl();
      await analyzer.initialize();
    });

    it('sets and gets FFT size', () => {
      analyzer.setFFTSize(4096);
      expect(analyzer.getFFTSize()).toBe(4096);
    });

    it('ignores invalid FFT size', () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      analyzer.setFFTSize(100);
      expect(analyzer.getFFTSize()).toBe(2048);
      expect(consoleWarn).toHaveBeenCalled();
      consoleWarn.mockRestore();
    });

    it('sets and gets smoothing time constant', () => {
      analyzer.setSmoothingTimeConstant(0.3);
      expect(analyzer.getSmoothingTimeConstant()).toBe(0.3);
    });

    it('clamps smoothing time constant to 0-1', () => {
      analyzer.setSmoothingTimeConstant(-0.5);
      expect(analyzer.getSmoothingTimeConstant()).toBe(0);
      
      analyzer.setSmoothingTimeConstant(1.5);
      expect(analyzer.getSmoothingTimeConstant()).toBe(1);
    });

    it('sets and gets min decibels', () => {
      analyzer.setMinDecibels(-80);
      expect(analyzer.getMinDecibels()).toBe(-80);
    });

    it('sets and gets max decibels', () => {
      analyzer.setMaxDecibels(-10);
      expect(analyzer.getMaxDecibels()).toBe(-10);
    });
  });

  describe('data retrieval', () => {
    it('returns null for data methods before initialization', () => {
      analyzer = new AudioAnalyzerServiceImpl();
      expect(analyzer.getByteFrequencyData()).toBeNull();
      expect(analyzer.getByteTimeDomainData()).toBeNull();
      expect(analyzer.getFloatFrequencyData()).toBeNull();
      expect(analyzer.getFloatTimeDomainData()).toBeNull();
    });

    it('returns data objects after initialization', async () => {
      analyzer = new AudioAnalyzerServiceImpl();
      await analyzer.initialize();
      
      const freqData = analyzer.getByteFrequencyData();
      expect(freqData).not.toBeNull();
      expect(freqData?.data).toBeInstanceOf(Uint8Array);
      expect(freqData?.frequencyBinCount).toBe(1024);
      
      const timeData = analyzer.getByteTimeDomainData();
      expect(timeData).not.toBeNull();
      expect(timeData?.data).toBeInstanceOf(Uint8Array);
      
      const floatFreqData = analyzer.getFloatFrequencyData();
      expect(floatFreqData).not.toBeNull();
      expect(floatFreqData?.data).toBeInstanceOf(Float32Array);
      
      const floatTimeData = analyzer.getFloatTimeDomainData();
      expect(floatTimeData).not.toBeNull();
      expect(floatTimeData?.data).toBeInstanceOf(Float32Array);
    });
  });

  describe('frequency/bin conversion', () => {
    beforeEach(async () => {
      analyzer = new AudioAnalyzerServiceImpl();
      await analyzer.initialize();
    });

    it('converts bin to frequency', () => {
      const freq = analyzer.getFrequencyForBin(512);
      expect(freq).toBeCloseTo(11025, 0);
    });

    it('converts frequency to bin', () => {
      const bin = analyzer.getBinForFrequency(11025);
      expect(bin).toBeCloseTo(512, 0);
    });

    it('returns null for conversion when not initialized', () => {
      const uninitAnalyzer = new AudioAnalyzerServiceImpl();
      expect(uninitAnalyzer.getFrequencyForBin(100)).toBeNull();
      expect(uninitAnalyzer.getBinForFrequency(1000)).toBeNull();
    });
  });

  describe('destroy', () => {
    it('cleans up resources', async () => {
      analyzer = new AudioAnalyzerServiceImpl();
      await analyzer.initialize();
      analyzer.connect();
      
      expect(analyzer.isActive()).toBe(true);
      
      analyzer.destroy();
      
      expect(analyzer.isInitialized()).toBe(false);
      expect(analyzer.isActive()).toBe(false);
    });
  });

  describe('singleton', () => {
    it('returns same instance from getAudioAnalyzer', async () => {
      const instance1 = await getAudioAnalyzer();
      const instance2 = await getAudioAnalyzer();
      expect(instance1).toBe(instance2);
    });

    it('destroys singleton instance', async () => {
      const instance1 = await getAudioAnalyzer();
      destroyAudioAnalyzer();
      const instance2 = await getAudioAnalyzer();
      expect(instance1).not.toBe(instance2);
    });
  });
});
