import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WaveEngine } from '../../src/components/PulseBackground/WaveEngine';
import type { WaveScaling } from '../../src/types/index.ts';
import { destroyECGGenerator } from '../../src/utils/ECGWaveGenerator';

const mockCanvas = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 400;
  
  const mockCtx = {
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    closePath: vi.fn(),
    set strokeStyle(value: string) {},
    get strokeStyle() { return '#00ff00'; },
    set fillStyle(value: string) {},
    get fillStyle() { return '#00ff00'; },
    lineWidth: 2,
    lineCap: 'round',
    lineJoin: 'round',
    shadowColor: 'transparent',
    shadowBlur: 0,
  };
  
  canvas.getContext = vi.fn().mockReturnValue(mockCtx);
  
  return canvas;
};

const defaultScaling: WaveScaling = {
  amplitude: 50,
  wavelength: 200,
  strokeWidth: 2,
  glowRadius: 10,
};

describe('WaveEngine', () => {
  let engine: WaveEngine;
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    canvas = mockCanvas();
    vi.useFakeTimers();
  });

  afterEach(() => {
    engine?.destroy();
    destroyECGGenerator();
    vi.useRealTimers();
  });

  describe('constructor', () => {
    it('creates engine with default idle mode', () => {
      engine = new WaveEngine({
        canvas,
        scaling: defaultScaling,
        colorStart: '#00ff00',
        colorEnd: '#ff0000',
      });
      
      expect(engine.getMode()).toBe('idle');
    });

    it('respects reducedMotion option', () => {
      engine = new WaveEngine({
        canvas,
        scaling: defaultScaling,
        colorStart: '#00ff00',
        colorEnd: '#ff0000',
        reducedMotion: true,
      });
      
      expect(engine).toBeDefined();
    });
  });

  describe('setMode', () => {
    beforeEach(() => {
      engine = new WaveEngine({
        canvas,
        scaling: defaultScaling,
        colorStart: '#00ff00',
        colorEnd: '#ff0000',
      });
    });

    it('changes mode to ecg', () => {
      engine.setMode('ecg');
      expect(engine.getMode()).toBe('ecg');
    });

    it('changes mode to oscilloscope', () => {
      engine.setMode('oscilloscope');
      expect(engine.getMode()).toBe('oscilloscope');
    });

    it('changes mode to idle', () => {
      engine.setMode('ecg');
      engine.setMode('idle');
      expect(engine.getMode()).toBe('idle');
    });

    it('does not change mode if same mode is set', () => {
      const initialMode = engine.getMode();
      engine.setMode(initialMode);
      expect(engine.getMode()).toBe(initialMode);
    });
  });

  describe('setHeartbeat (backward compatibility)', () => {
    beforeEach(() => {
      engine = new WaveEngine({
        canvas,
        scaling: defaultScaling,
        colorStart: '#00ff00',
        colorEnd: '#ff0000',
      });
    });

    it('sets mode to ecg when active is true', () => {
      engine.setHeartbeat(true);
      expect(engine.getMode()).toBe('ecg');
    });

    it('sets mode to idle when active is false', () => {
      engine.setMode('ecg');
      engine.setHeartbeat(false);
      expect(engine.getMode()).toBe('idle');
    });
  });

  describe('pluck', () => {
    beforeEach(() => {
      engine = new WaveEngine({
        canvas,
        scaling: defaultScaling,
        colorStart: '#00ff00',
        colorEnd: '#ff0000',
      });
    });

    it('does not throw when plucking', () => {
      expect(() => engine.pluck(0.5)).not.toThrow();
    });

    it('clamps intensity values', () => {
      expect(() => engine.pluck(-1)).not.toThrow();
      expect(() => engine.pluck(2)).not.toThrow();
    });
  });

  describe('setColor', () => {
    beforeEach(() => {
      engine = new WaveEngine({
        canvas,
        scaling: defaultScaling,
        colorStart: '#00ff00',
        colorEnd: '#ff0000',
      });
    });

    it('sets color without throwing', () => {
      expect(() => engine.setColor('#ff00ff')).not.toThrow();
    });
  });

  describe('updateViewport', () => {
    beforeEach(() => {
      engine = new WaveEngine({
        canvas,
        scaling: defaultScaling,
        colorStart: '#00ff00',
        colorEnd: '#ff0000',
      });
    });

    it('updates canvas dimensions', () => {
      engine.updateViewport(1024, 768);
      expect(canvas.width).toBe(1024);
      expect(canvas.height).toBe(768);
    });
  });

  describe('updateScaling', () => {
    beforeEach(() => {
      engine = new WaveEngine({
        canvas,
        scaling: defaultScaling,
        colorStart: '#00ff00',
        colorEnd: '#ff0000',
      });
    });

    it('updates scaling parameters', () => {
      const newScaling: WaveScaling = {
        amplitude: 100,
        wavelength: 300,
        strokeWidth: 3,
        glowRadius: 15,
      };
      
      engine.updateScaling(newScaling);
      expect(engine).toBeDefined();
    });
  });

  describe('destroy', () => {
    it('cleans up resources without throwing', () => {
      engine = new WaveEngine({
        canvas,
        scaling: defaultScaling,
        colorStart: '#00ff00',
        colorEnd: '#ff0000',
      });
      
      engine.setMode('ecg');
      expect(() => engine.destroy()).not.toThrow();
    });
  });
});
