import { useState, useEffect, useRef } from 'react';
import { useShouldAnimate } from '../../contexts/ReduceMotionContext.tsx';
import styles from './LiveStats.module.css';

interface LiveStatsProps {
  commitCount?: number;
  learningItems?: string[];
  className?: string;
}

const DEFAULT_COMMIT_COUNT = 2847;
const DEFAULT_LEARNING_ITEMS = [
  'Rust async patterns',
  'WebGL shaders',
  'LLM fine-tuning',
  'Edge computing',
];

function useAnimatedCounter(target: number, duration: number = 2000, enabled: boolean = true) {
  const [count, setCount] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setCount(target);
      return;
    }

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setCount(Math.round(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [target, duration, enabled]);

  return count;
}

function useRotatingItems(items: string[], interval: number = 3000) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, interval);

    return () => clearInterval(timer);
  }, [items, interval]);

  return items[index] ?? '';
}

export function LiveStats({
  commitCount = DEFAULT_COMMIT_COUNT,
  learningItems = DEFAULT_LEARNING_ITEMS,
  className,
}: LiveStatsProps) {
  const { shouldAnimate } = useShouldAnimate();
  const animatedCount = useAnimatedCounter(commitCount, 2000, shouldAnimate);
  const currentLearning = useRotatingItems(learningItems, 3000);

  return (
    <div className={`${styles.container} ${className ?? ''}`}>
      <div className={styles.stat}>
        <span className={styles.label}>Commits</span>
        <span className={styles.value} aria-label={`${animatedCount} commits`}>
          {animatedCount.toLocaleString()}
        </span>
      </div>
      <div className={styles.stat}>
        <span className={styles.label}>Currently learning</span>
        <span className={styles.learning} key={currentLearning}>
          {currentLearning}
        </span>
      </div>
    </div>
  );
}
