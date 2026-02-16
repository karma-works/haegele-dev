import { useEffect, useRef, useCallback } from 'react';
import { WaveEngine } from './WaveEngine.ts';
import { useWaveScaling, getPointCount } from './useWaveScaling.ts';
import { useViewport } from '../../utils/responsive.ts';
import { useEffects } from '../../contexts/EffectsContext.tsx';
import { useShouldAnimate } from '../../contexts/ReduceMotionContext.tsx';
import type { WaveScaling } from '../../types/index.ts';

const COLOR_MINT = '#10b981';
const COLOR_PINK = '#ec4899';
const SCROLL_COLOR_THRESHOLD = 1000;

export function useWaveEngine(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const engineRef = useRef<WaveEngine | null>(null);
  const { width, height, breakpoint } = useViewport();
  const scaling = useWaveScaling(width, height, breakpoint);
  const effects = useEffects();
  const { shouldAnimate } = useShouldAnimate();

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
      reducedMotion: !shouldAnimate,
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
    engineRef.current?.setReducedMotion(!shouldAnimate);
  }, [shouldAnimate]);

  useEffect(() => {
    engineRef.current?.updateViewport(width, height);
  }, [width, height]);

  useEffect(() => {
    engineRef.current?.updateScaling(scaling);
  }, [scaling]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const progress = Math.min(1, scrollY / SCROLL_COLOR_THRESHOLD);
      engineRef.current?.setColorProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!shouldAnimate) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const canvasCenterX = rect.left + rect.width / 2;
      const canvasCenterY = rect.top + rect.height / 2;

      const dx = e.clientX - canvasCenterX;
      const dy = e.clientY - canvasCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const maxDistance = Math.max(rect.width, rect.height);
      const proximity = Math.max(0, 1 - distance / maxDistance);

      engineRef.current?.setMouseProximity(proximity);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [shouldAnimate]);

  return { engineRef, scaling };
}

export { getPointCount };
export type { WaveScaling };
