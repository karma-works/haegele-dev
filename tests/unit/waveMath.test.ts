import { describe, it, expect } from 'vitest';
import { sineWave, lerp, lerpColor, clamp, easeOutCubic, easeInOutCubic } from '../../src/utils/waveMath';

describe('waveMath', () => {
  describe('sineWave', () => {
    it('generates correct number of points', () => {
      const points = sineWave(0, 100, 10, {
        amplitude: 10,
        wavelength: 50,
        phase: 0,
        speed: 0.02,
        yOffset: 50,
      });

      expect(points).toHaveLength(10);
    });

    it('generates points with correct x values', () => {
      const points = sineWave(0, 100, 5, {
        amplitude: 10,
        wavelength: 50,
        phase: 0,
        speed: 0.02,
        yOffset: 50,
      });

      expect(points[0]?.x).toBe(0);
      expect(points[4]?.x).toBe(100);
    });

    it('generates points with y values around yOffset', () => {
      const yOffset = 50;
      const points = sineWave(0, 100, 20, {
        amplitude: 10,
        wavelength: 50,
        phase: 0,
        speed: 0.02,
        yOffset,
      });

      points.forEach((point) => {
        expect(point.y).toBeGreaterThanOrEqual(yOffset - 10);
        expect(point.y).toBeLessThanOrEqual(yOffset + 10);
      });
    });

    it('respects phase offset', () => {
      const config = {
        amplitude: 10,
        wavelength: 50,
        speed: 0.02,
        yOffset: 50,
      };

      const points1 = sineWave(0, 100, 10, { ...config, phase: 0 });
      const points2 = sineWave(0, 100, 10, { ...config, phase: Math.PI / 2 });

      expect(points1[1]?.y).not.toBeCloseTo(points2[1]?.y ?? 0);
    });
  });

  describe('lerp', () => {
    it('returns start when t is 0', () => {
      expect(lerp(0, 100, 0)).toBe(0);
    });

    it('returns end when t is 1', () => {
      expect(lerp(0, 100, 1)).toBe(100);
    });

    it('returns midpoint when t is 0.5', () => {
      expect(lerp(0, 100, 0.5)).toBe(50);
    });

    it('handles negative values', () => {
      expect(lerp(-100, 100, 0.5)).toBe(0);
    });
  });

  describe('lerpColor', () => {
    it('returns start color when t is 0', () => {
      expect(lerpColor('#ff0000', '#00ff00', 0)).toBe('#ff0000');
    });

    it('returns end color when t is 1', () => {
      expect(lerpColor('#ff0000', '#00ff00', 1)).toBe('#00ff00');
    });

    it('returns mid color when t is 0.5', () => {
      const result = lerpColor('#000000', '#ffffff', 0.5);
      expect(result).toBe('#808080');
    });

    it('handles colors without hash', () => {
      expect(lerpColor('ff0000', '00ff00', 0)).toBe('#ff0000');
    });

    it('returns start for invalid colors', () => {
      expect(lerpColor('invalid', '#00ff00', 0.5)).toBe('invalid');
    });
  });

  describe('clamp', () => {
    it('returns value when within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });

    it('returns min when value is below', () => {
      expect(clamp(-5, 0, 10)).toBe(0);
    });

    it('returns max when value is above', () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('easeOutCubic', () => {
    it('returns 0 when t is 0', () => {
      expect(easeOutCubic(0)).toBe(0);
    });

    it('returns 1 when t is 1', () => {
      expect(easeOutCubic(1)).toBe(1);
    });

    it('eases out (faster at start)', () => {
      const mid = easeOutCubic(0.5);
      expect(mid).toBeGreaterThan(0.5);
    });
  });

  describe('easeInOutCubic', () => {
    it('returns 0 when t is 0', () => {
      expect(easeInOutCubic(0)).toBe(0);
    });

    it('returns 1 when t is 1', () => {
      expect(easeInOutCubic(1)).toBe(1);
    });

    it('returns 0.5 when t is 0.5', () => {
      expect(easeInOutCubic(0.5)).toBe(0.5);
    });
  });
});
