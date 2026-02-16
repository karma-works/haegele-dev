import { describe, it, expect } from 'vitest';
import { useWaveScaling, getPointCount } from '../../src/components/PulseBackground/useWaveScaling';
import { renderHook } from '@testing-library/react';
import type { Breakpoint } from '../../src/types/index';

describe('useWaveScaling', () => {
  it('maintains amplitude:wavelength ratio across viewports', () => {
    const breakpoints: Breakpoint[] = ['mobile', 'tablet', 'desktop', 'wide'];

    breakpoints.forEach((breakpoint) => {
      const { result } = renderHook(() =>
        useWaveScaling(800, 600, breakpoint)
      );

      const ratio = result.current.amplitude / result.current.wavelength;
      expect(ratio).toBeCloseTo(1 / 8, 2);
    });
  });

  it('returns proportional values for mobile', () => {
    const { result } = renderHook(() =>
      useWaveScaling(375, 667, 'mobile')
    );

    expect(result.current.amplitude).toBeLessThan(40);
    expect(result.current.strokeWidth).toBeGreaterThanOrEqual(1.5);
    expect(result.current.strokeWidth).toBeLessThanOrEqual(3);
  });

  it('returns proportional values for desktop', () => {
    const { result } = renderHook(() =>
      useWaveScaling(1440, 900, 'desktop')
    );

    expect(result.current.amplitude).toBeGreaterThan(30);
    expect(result.current.glowRadius).toBeGreaterThan(10);
  });

  it('scales amplitude with viewport height', () => {
    const { result: smallResult } = renderHook(() =>
      useWaveScaling(1440, 400, 'desktop')
    );

    const { result: largeResult } = renderHook(() =>
      useWaveScaling(1440, 1200, 'desktop')
    );

    expect(largeResult.current.amplitude).toBeGreaterThan(smallResult.current.amplitude);
  });

  it('ensures minimum amplitude', () => {
    const { result } = renderHook(() =>
      useWaveScaling(100, 100, 'mobile')
    );

    expect(result.current.amplitude).toBeGreaterThanOrEqual(15);
  });

  it('ensures minimum wavelength', () => {
    const { result } = renderHook(() =>
      useWaveScaling(100, 100, 'mobile')
    );

    expect(result.current.wavelength).toBeGreaterThanOrEqual(60);
  });
});

describe('getPointCount', () => {
  it('returns at least 50 points', () => {
    expect(getPointCount(50, 'mobile')).toBe(50);
  });

  it('scales with width', () => {
    const smallCount = getPointCount(375, 'mobile');
    const largeCount = getPointCount(1440, 'desktop');

    expect(largeCount).toBeGreaterThan(smallCount);
  });

  it('adjusts density based on breakpoint', () => {
    const mobileCount = getPointCount(768, 'mobile');
    const desktopCount = getPointCount(768, 'desktop');

    expect(mobileCount).toBeGreaterThan(desktopCount);
  });
});
