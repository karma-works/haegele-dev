import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ECGWaveGenerator, getECGGenerator, destroyECGGenerator } from '../../src/utils/ECGWaveGenerator';

describe('ECGWaveGenerator', () => {
  let generator: ECGWaveGenerator;

  beforeEach(() => {
    generator = new ECGWaveGenerator();
  });

  afterEach(() => {
    generator.destroy();
    destroyECGGenerator();
  });

  describe('constructor', () => {
    it('creates generator with default config (80 BPM)', () => {
      expect(generator.getBPM()).toBe(80);
    });

    it('accepts custom BPM', () => {
      const customGen = new ECGWaveGenerator({ bpm: 60 });
      expect(customGen.getBPM()).toBe(60);
      customGen.destroy();
    });

    it('accepts custom sample rate', () => {
      const customGen = new ECGWaveGenerator({ sampleRate: 500 });
      const beat = customGen.generateBeat();
      expect(beat.length).toBe(Math.floor((60 / 80) * 500));
      customGen.destroy();
    });
  });

  describe('BPM control', () => {
    it('sets BPM correctly', () => {
      generator.setBPM(100);
      expect(generator.getBPM()).toBe(100);
    });

    it('clamps BPM to minimum', () => {
      generator.setBPM(10);
      expect(generator.getBPM()).toBe(20);
    });

    it('clamps BPM to maximum', () => {
      generator.setBPM(500);
      expect(generator.getBPM()).toBe(300);
    });
  });

  describe('beat generation', () => {
    it('generates a complete beat with correct number of points', () => {
      const beat = generator.generateBeat();
      const expectedLength = Math.floor((60 / 80) * 250);
      expect(beat.length).toBe(expectedLength);
    });

    it('generates points with increasing time values', () => {
      const beat = generator.generateBeat();
      for (let i = 1; i < beat.length; i++) {
        expect(beat[i]!.time).toBeGreaterThan(beat[i - 1]!.time);
      }
    });

    it('contains PQRST complex features', () => {
      const beat = generator.generateBeat();
      const values = beat.map(p => p.value);
      
      const maxValue = Math.max(...values);
      const minValue = Math.min(...values);
      
      expect(maxValue).toBeGreaterThan(0.5);
      expect(minValue).toBeLessThan(-0.1);
    });

    it('R peak is the highest point', () => {
      const beat = generator.generateBeat();
      const values = beat.map(p => p.value);
      const maxValue = Math.max(...values);
      
      expect(maxValue).toBeCloseTo(1.0, 1);
    });
  });

  describe('duration generation', () => {
    it('generates correct number of samples for duration', () => {
      const duration = 2;
      const points = generator.generateDuration(duration);
      expect(points.length).toBe(Math.floor(duration * 250));
    });

    it('generates multiple beats correctly', () => {
      const duration = 3;
      const points = generator.generateDuration(duration);
      
      let peaks = 0;
      for (let i = 1; i < points.length - 1; i++) {
        if (points[i]!.value > 0.9 && 
            points[i]!.value > points[i - 1]!.value && 
            points[i]!.value > points[i + 1]!.value) {
          peaks++;
        }
      }
      
      expect(peaks).toBeGreaterThanOrEqual(3);
    });
  });

  describe('point generation', () => {
    it('generates requested number of points', () => {
      const points = generator.generatePoints(100);
      expect(points.length).toBe(100);
    });

    it('generates points starting from specified time', () => {
      const points = generator.generatePoints(10, 5);
      expect(points[0]!.time).toBe(5);
    });
  });

  describe('baseline wander', () => {
    it('adds baseline wander to signal', () => {
      generator.setBaselineWander(0.1, 0.15);
      
      const beat1 = generator.getValueAtTime(0);
      const beat2 = generator.getValueAtTime(3.33);
      
      expect(Math.abs(beat1 - beat2)).toBeGreaterThan(0);
    });

    it('can disable baseline wander', () => {
      generator.setBaselineWander(0, 0);
      
      const value1 = generator.getValueAtTime(0);
      const value2 = generator.getValueAtTime(3.33);
      
      const purePQRST1 = generator['calculatePQRST'](0);
      const purePQRST2 = generator['calculatePQRST'](3.33 % generator.getBeatDuration());
      
      expect(value1).toBeCloseTo(purePQRST1, 5);
      expect(value2).toBeCloseTo(purePQRST2, 5);
    });
  });

  describe('real-time update', () => {
    it('updates phase correctly', () => {
      generator.start();
      generator.update(0.1);
      expect(generator.getPhase()).toBe(0.1);
    });

    it('wraps phase at beat duration', () => {
      generator.start();
      const beatDuration = generator.getBeatDuration();
      generator.update(beatDuration + 0.05);
      expect(generator.getPhase()).toBeCloseTo(0.05, 3);
    });

    it('returns correct progress', () => {
      generator.start();
      const beatDuration = generator.getBeatDuration();
      generator.update(beatDuration / 2);
      expect(generator.getProgress()).toBeCloseTo(0.5, 2);
    });

    it('stops updating when stopped', () => {
      generator.start();
      generator.update(0.1);
      const phase = generator.getPhase();
      generator.stop();
      generator.update(0.1);
      expect(generator.getPhase()).toBe(phase);
    });
  });

  describe('peak detection', () => {
    it('detects R peak correctly', () => {
      generator.start();
      
      while (!generator.isAtPeak()) {
        generator.update(0.001);
        if (generator.getPhase() > 0.5) break;
      }
      
      expect(generator.getPhase()).toBeLessThan(0.35);
    });
  });

  describe('singleton', () => {
    it('returns same instance from getECGGenerator', () => {
      const gen1 = getECGGenerator();
      const gen2 = getECGGenerator();
      expect(gen1).toBe(gen2);
    });

    it('updates existing instance config', () => {
      getECGGenerator({ bpm: 70 });
      const gen = getECGGenerator({ bpm: 90 });
      expect(gen.getBPM()).toBe(90);
    });

    it('destroys singleton instance', () => {
      const gen1 = getECGGenerator();
      destroyECGGenerator();
      const gen2 = getECGGenerator();
      expect(gen1).not.toBe(gen2);
    });
  });

  describe('Gaussian PQRST shape validation', () => {
    it('P wave is positive and before QRS', () => {
      const beat = generator.generateBeat();
      const beatDuration = generator.getBeatDuration();
      const pWaveTime = 0.12 * beatDuration;
      
      const pIndex = Math.floor((pWaveTime / beatDuration) * beat.length);
      const pValue = beat[pIndex]!.value;
      
      expect(pValue).toBeGreaterThan(0);
    });

    it('Q wave is negative', () => {
      const beat = generator.generateBeat();
      const beatDuration = generator.getBeatDuration();
      const qWaveTime = 0.18 * beatDuration;
      
      const qIndex = Math.floor((qWaveTime / beatDuration) * beat.length);
      const qValue = beat[qIndex]!.value;
      
      expect(qValue).toBeLessThan(0);
    });

    it('S wave is negative after R', () => {
      const beat = generator.generateBeat();
      const beatDuration = generator.getBeatDuration();
      const sWaveTime = 0.26 * beatDuration;
      
      const sIndex = Math.floor((sWaveTime / beatDuration) * beat.length);
      const sValue = beat[sIndex]!.value;
      
      expect(sValue).toBeLessThan(0);
    });

    it('T wave is positive', () => {
      const beat = generator.generateBeat();
      const beatDuration = generator.getBeatDuration();
      const tWaveTime = 0.38 * beatDuration;
      
      const tIndex = Math.floor((tWaveTime / beatDuration) * beat.length);
      const tValue = beat[tIndex]!.value;
      
      expect(tValue).toBeGreaterThan(0);
    });
  });
});
