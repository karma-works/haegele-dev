import { useState, useEffect, useCallback } from 'react';
import type { Breakpoint, ViewportInfo } from '../types/index.ts';

const BREAKPOINTS: Record<Breakpoint, number> = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
};

function getBreakpoint(width: number): Breakpoint {
  if (width < BREAKPOINTS.tablet) return 'mobile';
  if (width < BREAKPOINTS.desktop) return 'tablet';
  if (width < BREAKPOINTS.wide) return 'desktop';
  return 'wide';
}

function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // biome-ignore lint/suspicious/noExplicitAny: matchMedia types vary
    Boolean((window.matchMedia as any)?.('(pointer: coarse)')?.matches)
  );
}

export function useViewport(): ViewportInfo {
  const getViewportInfo = useCallback((): ViewportInfo => {
    if (typeof window === 'undefined') {
      return {
        width: 1024,
        height: 768,
        breakpoint: 'desktop',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isTouch: false,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const breakpoint = getBreakpoint(width);

    return {
      width,
      height,
      breakpoint,
      isMobile: breakpoint === 'mobile',
      isTablet: breakpoint === 'tablet',
      isDesktop: breakpoint === 'desktop' || breakpoint === 'wide',
      isTouch: isTouchDevice(),
    };
  }, []);

  const [viewport, setViewport] = useState<ViewportInfo>(getViewportInfo);

  useEffect(() => {
    let rafId: number;
    let ticking = false;

    const handleResize = () => {
      if (!ticking) {
        rafId = requestAnimationFrame(() => {
          setViewport(getViewportInfo());
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [getViewportInfo]);

  return viewport;
}

export { BREAKPOINTS };
