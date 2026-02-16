import { useRef, useState, useEffect } from 'react';
import { useWaveEngine } from './useWaveEngine.ts';
import styles from './PulseBackground.module.css';

export function PulseBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0, rootMargin: '100px' }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useWaveEngine(canvasRef, isVisible);

  return (
    <div ref={containerRef} className={styles.container}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
