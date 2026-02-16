export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';

export interface ViewportInfo {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
}

export interface WaveScaling {
  amplitude: number;
  wavelength: number;
  strokeWidth: number;
  glowRadius: number;
}

export type WaveState = 'idle' | 'heartbeat' | 'plucked';
