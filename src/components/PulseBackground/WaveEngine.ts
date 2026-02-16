import type { WavePoint, WaveConfig } from '../../utils/waveMath.ts';
import { sineWave, lerpColor, lerp } from '../../utils/waveMath.ts';
import type { WaveScaling, WaveState } from '../../types/index.ts';

interface WaveEngineConfig {
  canvas: HTMLCanvasElement;
  scaling: WaveScaling;
  colorStart: string;
  colorEnd: string;
  reducedMotion?: boolean;
  onAnimationTick?: () => void;
}

export class WaveEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private scaling: WaveScaling;
  private config: WaveConfig;
  private colorStart: string;
  private colorEnd: string;
  private currentColor: string;
  private colorProgress: number = 0;
  private targetColorProgress: number = 0;
  private state: WaveState = 'idle';
  private animationId: number | null = null;
  private lastTime: number = 0;
  private pluckIntensity: number = 0;
  private heartbeatActive: boolean = false;
  private heartbeatPhase: number = 0;
  private reducedMotion: boolean = false;
  private mouseProximity: number = 0;
  private targetMouseProximity: number = 0;
  private onAnimationTick?: () => void;
  private isVisible: boolean = true;

  constructor(options: WaveEngineConfig) {
    this.canvas = options.canvas;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2d context');
    this.ctx = ctx;
    this.scaling = options.scaling;
    this.colorStart = options.colorStart;
    this.colorEnd = options.colorEnd;
    this.currentColor = this.colorStart;
    this.reducedMotion = options.reducedMotion ?? false;
    this.onAnimationTick = options.onAnimationTick;

    this.config = {
      amplitude: this.scaling.amplitude,
      wavelength: this.scaling.wavelength,
      phase: 0,
      speed: this.reducedMotion ? 0.005 : 0.02,
      yOffset: this.canvas.height / 2,
    };

    this.start();
  }

  pluck(intensity: number): void {
    if (this.reducedMotion) return;
    this.pluckIntensity = Math.min(1, Math.max(0, intensity));
    this.state = 'plucked';
  }

  setHeartbeat(active: boolean): void {
    this.heartbeatActive = active;
    this.state = active ? 'heartbeat' : 'idle';
  }

  setColor(color: string): void {
    this.currentColor = color;
  }

  setColorProgress(progress: number): void {
    this.targetColorProgress = Math.min(1, Math.max(0, progress));
  }

  setReducedMotion(reduced: boolean): void {
    this.reducedMotion = reduced;
    this.config.speed = reduced ? 0.005 : 0.02;
  }

  setMouseProximity(proximity: number): void {
    this.targetMouseProximity = Math.min(1, Math.max(0, proximity));
  }

  setVisible(visible: boolean): void {
    this.isVisible = visible;
  }

  updateViewport(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    this.config.yOffset = height / 2;
  }

  updateScaling(scaling: WaveScaling): void {
    this.scaling = scaling;
    this.config.amplitude = scaling.amplitude;
    this.config.wavelength = scaling.wavelength;
  }

  destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private start(): void {
    this.lastTime = performance.now();
    this.animate();
  }

  private animate = (): void => {
    const now = performance.now();
    const deltaTime = (now - this.lastTime) / 1000;
    this.lastTime = now;

    this.update(deltaTime);
    
    if (this.isVisible) {
      this.render();
    }

    this.onAnimationTick?.();
    this.animationId = requestAnimationFrame(this.animate);
  };

  private update(deltaTime: number): void {
    this.config.phase += this.config.speed;

    this.colorProgress = lerp(this.colorProgress, this.targetColorProgress, 0.05);
    this.mouseProximity = lerp(this.mouseProximity, this.targetMouseProximity, 0.1);

    if (Math.abs(this.colorProgress) > 0.001) {
      this.currentColor = lerpColor(this.colorStart, this.colorEnd, this.colorProgress);
    }

    if (this.state === 'plucked' && !this.reducedMotion) {
      this.pluckIntensity *= 0.95;
      if (this.pluckIntensity < 0.01) {
        this.pluckIntensity = 0;
        this.state = this.heartbeatActive ? 'heartbeat' : 'idle';
      }
    }

    if (this.state === 'heartbeat' && !this.reducedMotion) {
      this.heartbeatPhase += deltaTime * 1.3;
    }
  }

  private render(): void {
    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);

    const points = this.generatePoints();
    this.drawWave(points);
  }

  private generatePoints(): WavePoint[] {
    const { width } = this.canvas;
    const pointCount = Math.max(50, Math.round(width / 3));

    let effectiveAmplitude = this.config.amplitude;

    if (!this.reducedMotion) {
      if (this.state === 'plucked') {
        effectiveAmplitude *= 1 + this.pluckIntensity * 0.5;
      }

      if (this.state === 'heartbeat') {
        const heartbeatOffset = Math.sin(this.heartbeatPhase * Math.PI * 2) * 0.3;
        effectiveAmplitude *= 1 + heartbeatOffset;
      }

      effectiveAmplitude *= 1 + this.mouseProximity * 0.2;
    }

    return sineWave(0, width, pointCount, {
      ...this.config,
      amplitude: effectiveAmplitude,
    });
  }

  private drawWave(points: WavePoint[]): void {
    if (points.length < 2) return;

    const first = points[0];
    if (!first) return;

    this.ctx.save();

    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = this.scaling.strokeWidth;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    if (!this.reducedMotion) {
      this.ctx.shadowColor = this.currentColor;
      this.ctx.shadowBlur = this.scaling.glowRadius * (1 + this.mouseProximity * 0.5);
    }

    this.ctx.beginPath();
    this.ctx.moveTo(first.x, first.y);

    for (let i = 1; i < points.length - 2; i++) {
      const current = points[i];
      const next = points[i + 1];
      if (!current || !next) continue;
      const xc = (current.x + next.x) / 2;
      const yc = (current.y + next.y) / 2;
      this.ctx.quadraticCurveTo(current.x, current.y, xc, yc);
    }

    const last = points[points.length - 1];
    const secondLast = points[points.length - 2];
    if (last && secondLast) {
      this.ctx.quadraticCurveTo(secondLast.x, secondLast.y, last.x, last.y);
    }

    this.ctx.stroke();
    this.ctx.restore();
  }
}
