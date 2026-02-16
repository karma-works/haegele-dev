import { useRef } from 'react';
import { useWaveEngine } from './useWaveEngine.ts';
import styles from './PulseBackground.module.css';

export function PulseBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useWaveEngine(canvasRef);

  return (
    <div className={styles.container}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
