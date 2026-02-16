import { useState, useEffect, useCallback, useRef } from 'react';
import { useReducedMotion } from '../contexts/ReduceMotionContext.tsx';

interface UseTypewriterOptions {
  text: string;
  speed?: number;
  delay?: number;
  loop?: boolean;
  deleteSpeed?: number;
}

interface UseTypewriterReturn {
  displayText: string;
  isTyping: boolean;
  isDeleting: boolean;
  isComplete: boolean;
  restart: () => void;
}

export function useTypewriter({
  text,
  speed = 50,
  delay = 1000,
  loop = false,
  deleteSpeed = 30,
}: UseTypewriterOptions): UseTypewriterReturn {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { isReducedMotion } = useReducedMotion();
  const timeoutRef = useRef<number | null>(null);

  const restart = useCallback(() => {
    setDisplayText('');
    setIsTyping(true);
    setIsDeleting(false);
    setIsComplete(false);
  }, []);

  useEffect(() => {
    if (isReducedMotion) {
      setDisplayText(text);
      setIsTyping(false);
      setIsDeleting(false);
      setIsComplete(true);
      return;
    }

    const clearTimeout = () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    if (isComplete && !loop) {
      return clearTimeout;
    }

    if (isDeleting) {
      if (displayText.length === 0) {
        setIsDeleting(false);
        setIsTyping(true);
        return clearTimeout;
      }

      timeoutRef.current = window.setTimeout(() => {
        setDisplayText((prev) => prev.slice(0, -1));
      }, deleteSpeed);
    } else if (isTyping) {
      if (displayText.length === text.length) {
        setIsTyping(false);
        setIsComplete(true);

        if (loop) {
          timeoutRef.current = window.setTimeout(() => {
            setIsDeleting(true);
            setIsComplete(false);
          }, delay);
        }
        return clearTimeout;
      }

      timeoutRef.current = window.setTimeout(() => {
        setDisplayText(text.slice(0, displayText.length + 1));
      }, speed);
    }

    return clearTimeout;
  }, [
    text,
    displayText,
    isTyping,
    isDeleting,
    isComplete,
    speed,
    delay,
    loop,
    deleteSpeed,
    isReducedMotion,
  ]);

  return { displayText, isTyping, isDeleting, isComplete, restart };
}
