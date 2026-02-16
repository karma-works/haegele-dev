import { useEffect, useRef, useCallback } from 'react';
import { WaveEngine } from './WaveEngine.ts';
import { useWaveScaling, getPointCount } from './useWaveScaling.ts';
import { useViewport } from '../../utils/responsive.ts';
import { useEffects } from '../../contexts/EffectsContext.tsx';
import type { WaveScaling } from '../../types/index.ts';

const COLOR_MINT = '#10b981';
const COLOR_PINK = '#ec4899';

export function useWaveEngine(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const engineRef = useRef<WaveEngine | null>(null);
  const { width, height, breakpoint } = useViewport();
  const scaling = useWaveScaling(width, height, breakpoint);
  const effects = useEffects();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;

    const engine = new WaveEngine({
      canvas,
      scaling,
      colorStart: COLOR_MINT,
      colorEnd: COLOR_PINK,
    });

    engineRef.current = engine;
    effects.waveEngineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
      effects.waveEngineRef.current = null;
    };
  }, []);

  useEffect(() => {
    engineRef.current?.updateViewport(width, height);
  }, [width, height]);

  useEffect(() => {
    engineRef.current?.updateScaling(scaling);
  }, [scaling]);

  return { engineRef, scaling };
}

export { getPointCount };
export type { WaveScaling };
