import { useMemo } from 'react';
import type { WaveScaling, Breakpoint } from '../../types/index.ts';

const AMPLITUDE_WAVELENGTH_RATIO = 1 / 8;

const BREAKPOINT_CONFIG: Record<Breakpoint, { baseAmplitude: number; pointDensity: number }> = {
  mobile: { baseAmplitude: 30, pointDensity: 2 },
  tablet: { baseAmplitude: 45, pointDensity: 3 },
  desktop: { baseAmplitude: 60, pointDensity: 4 },
  wide: { baseAmplitude: 70, pointDensity: 5 },
};

export function useWaveScaling(
  viewportWidth: number,
  viewportHeight: number,
  breakpoint: Breakpoint
): WaveScaling {
  return useMemo(() => {
    const config = BREAKPOINT_CONFIG[breakpoint] ?? BREAKPOINT_CONFIG.desktop;

    const heightRatio = viewportHeight / 800;
    const widthRatio = viewportWidth / 1440;

    const amplitude = Math.round(config.baseAmplitude * heightRatio);
    const wavelength = Math.round(amplitude / AMPLITUDE_WAVELENGTH_RATIO);

    const strokeWidth = Math.max(1.5, Math.min(3, 2 * heightRatio));
    const glowRadius = Math.max(8, Math.min(20, 15 * widthRatio));

    return {
      amplitude: Math.max(15, amplitude),
      wavelength: Math.max(60, wavelength),
      strokeWidth,
      glowRadius,
    };
  }, [viewportWidth, viewportHeight, breakpoint]);
}

export function getPointCount(width: number, breakpoint: Breakpoint): number {
  const density = BREAKPOINT_CONFIG[breakpoint]?.pointDensity ?? 4;
  return Math.max(50, Math.round(width / density));
}
