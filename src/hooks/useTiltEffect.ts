import { useRef, useState, useCallback, useEffect, type RefObject, type CSSProperties } from 'react';
import { useReducedMotion } from '../contexts/ReduceMotionContext';

interface TiltEffectOptions {
  maxTilt?: number;
  perspective?: number;
  scale?: number;
  speed?: number;
  glare?: boolean;
  maxGlare?: number;
}

interface TiltEffectResult {
  ref: RefObject<HTMLDivElement | null>;
  style: CSSProperties;
  handlers: {
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseLeave: () => void;
    onMouseEnter: () => void;
  };
  isHovering: boolean;
}

export function useTiltEffect(options: TiltEffectOptions = {}): TiltEffectResult {
  const {
    maxTilt = 15,
    perspective = 1000,
    scale = 1.02,
    speed = 300,
    glare = true,
    maxGlare = 0.3,
  } = options;

  const ref = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });
  const { disableNonCritical } = useReducedMotion();

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (disableNonCritical || !ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const tiltX = ((mouseY - centerY) / centerY) * -maxTilt;
      const tiltY = ((mouseX - centerX) / centerX) * maxTilt;

      setTilt({ x: tiltX, y: tiltY });
      setGlarePosition({
        x: (mouseX / rect.width) * 100,
        y: (mouseY / rect.height) * 100,
      });
    },
    [maxTilt, disableNonCritical]
  );

  const onMouseEnter = useCallback(() => {
    if (disableNonCritical) return;
    setIsHovering(true);
  }, [disableNonCritical]);

  const onMouseLeave = useCallback(() => {
    if (disableNonCritical) return;
    setIsHovering(false);
    setTilt({ x: 0, y: 0 });
  }, [disableNonCritical]);

  useEffect(() => {
    if (disableNonCritical) {
      setTilt({ x: 0, y: 0 });
      setIsHovering(false);
    }
  }, [disableNonCritical]);

  const style: CSSProperties = disableNonCritical
    ? {}
    : {
        transform: `perspective(${perspective}px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovering ? scale : 1})`,
        transition: isHovering ? `transform ${speed}ms ease-out` : `transform ${speed * 2}ms ease-out`,
      };

  const glareStyle: CSSProperties = disableNonCritical || !glare
    ? {}
    : {
        '--glare-x': `${glarePosition.x}%`,
        '--glare-y': `${glarePosition.y}%`,
        '--glare-opacity': isHovering ? maxGlare : 0,
      } as CSSProperties;

  return {
    ref,
    style: { ...style, ...glareStyle },
    handlers: {
      onMouseMove,
      onMouseLeave,
      onMouseEnter,
    },
    isHovering,
  };
}

export function useGlareStyle(isHovering: boolean, glarePosition: { x: number; y: number }, maxGlare: number = 0.3): CSSProperties {
  return {
    '--glare-x': `${glarePosition.x}%`,
    '--glare-y': `${glarePosition.y}%`,
    '--glare-opacity': isHovering ? maxGlare : 0,
  } as CSSProperties;
}
