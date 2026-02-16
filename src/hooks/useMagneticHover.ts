import { useRef, useState, useCallback, useEffect, type RefObject } from 'react';
import { useReducedMotion } from '../contexts/ReduceMotionContext';

interface MagneticHoverOptions {
  strength?: number;
  ease?: number;
}

interface MagneticHoverResult {
  ref: RefObject<HTMLDivElement | null>;
  style: React.CSSProperties;
  handlers: {
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseLeave: () => void;
  };
}

export function useMagneticHover(
  options: MagneticHoverOptions = {}
): MagneticHoverResult {
  const { strength = 0.3, ease = 0.15 } = options;
  const ref = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const { disableNonCritical } = useReducedMotion();

  const animationRef = useRef<number | null>(null);
  const targetPosition = useRef({ x: 0, y: 0 });
  const currentPosition = useRef({ x: 0, y: 0 });

  const animate = useCallback(() => {
    const dx = targetPosition.current.x - currentPosition.current.x;
    const dy = targetPosition.current.y - currentPosition.current.y;

    currentPosition.current.x += dx * ease;
    currentPosition.current.y += dy * ease;

    setPosition({
      x: currentPosition.current.x,
      y: currentPosition.current.y,
    });

    if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [ease]);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (disableNonCritical || !ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;

      targetPosition.current = {
        x: distanceX * strength,
        y: distanceY * strength,
      };

      if (!animationRef.current) {
        animationRef.current = requestAnimationFrame(animate);
      }
    },
    [strength, animate, disableNonCritical]
  );

  const onMouseLeave = useCallback(() => {
    setIsHovering(false);
    targetPosition.current = { x: 0, y: 0 };

    if (!animationRef.current) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [animate]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const style: React.CSSProperties = disableNonCritical
    ? {}
    : {
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: isHovering ? 'none' : 'transform 0.3s ease-out',
      };

  return {
    ref,
    style,
    handlers: {
      onMouseMove,
      onMouseLeave,
    },
  };
}
