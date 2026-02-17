import type { WavePoint, WaveConfig } from "../../utils/waveMath.ts";
import { sineWave, lerpColor, lerp } from "../../utils/waveMath.ts";
import type { WaveScaling, WaveState, WaveMode } from "../../types/index.ts";
import { ECGWaveGenerator } from "../../utils/ECGWaveGenerator.ts";
import type {
  AudioAnalyzerServiceImpl,
  TimeDomainData,
} from "../../audio/AudioAnalyzerService.ts";

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
  private state: WaveState = "idle";
  private mode: WaveMode = "idle";
  private animationId: number | null = null;
  private lastTime: number = 0;
  private pluckIntensity: number = 0;
  private reducedMotion: boolean = false;
  private mouseProximity: number = 0;
  private targetMouseProximity: number = 0;
  private onAnimationTick?: () => void;
  private isVisible: boolean = true;
  private ecgGenerator: ECGWaveGenerator | null = null;
  private ecgPoints: { x: number; y: number }[] = [];
  private oscilloscopePhase: number = 0;
  private audioAnalyzer: AudioAnalyzerServiceImpl | null = null;
  private externalAudioData: TimeDomainData | null = null;

  constructor(options: WaveEngineConfig) {
    this.canvas = options.canvas;
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get 2d context");
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
    this.state = "plucked";
  }

  setHeartbeat(active: boolean): void {
    this.setMode(active ? "ecg" : "idle");
  }

  setMode(mode: WaveMode): void {
    if (this.mode === mode) return;

    this.mode = mode;
    this.state = mode;

    if (mode === "ecg") {
      this.initECG();
    } else {
      this.destroyECG();
    }

    if (mode === "oscilloscope") {
      this.oscilloscopePhase = 0;
    }
  }

  getMode(): WaveMode {
    return this.mode;
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

  setAudioAnalyzer(analyzer: AudioAnalyzerServiceImpl | null): void {
    this.audioAnalyzer = analyzer;
  }

  setAudioData(data: TimeDomainData | null): void {
    this.externalAudioData = data;
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
    this.destroyECG();
  }

  private initECG(): void {
    if (!this.ecgGenerator) {
      this.ecgGenerator = new ECGWaveGenerator({ bpm: 80 });
      this.ecgGenerator.start();
    }
  }

  private destroyECG(): void {
    if (this.ecgGenerator) {
      this.ecgGenerator.destroy();
      this.ecgGenerator = null;
      this.ecgPoints = [];
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

    this.colorProgress = lerp(
      this.colorProgress,
      this.targetColorProgress,
      0.05,
    );
    this.mouseProximity = lerp(
      this.mouseProximity,
      this.targetMouseProximity,
      0.1,
    );

    if (Math.abs(this.colorProgress) > 0.001) {
      this.currentColor = lerpColor(
        this.colorStart,
        this.colorEnd,
        this.colorProgress,
      );
    }

    if (this.state === "plucked" && !this.reducedMotion) {
      this.pluckIntensity *= 0.95;
      if (this.pluckIntensity < 0.01) {
        this.pluckIntensity = 0;
        this.state = this.mode;
      }
    }

    if (this.mode === "ecg" && this.ecgGenerator && !this.reducedMotion) {
      this.ecgGenerator.update(deltaTime);
    }

    if (this.mode === "oscilloscope" && !this.reducedMotion) {
      this.oscilloscopePhase += deltaTime * 2;
    }
  }

  private render(): void {
    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);

    if (this.mode === "ecg") {
      this.renderECG();
    } else if (this.mode === "oscilloscope") {
      this.renderOscilloscope();
    } else {
      const points = this.generatePoints();
      this.drawWave(points);
    }
  }

  private renderECG(): void {
    if (!this.ecgGenerator || this.reducedMotion) {
      const points = this.generatePoints();
      this.drawWave(points);
      return;
    }

    const { width, height } = this.canvas;
    const centerY = height / 2;
    const amplitude = this.scaling.amplitude * (1 + this.mouseProximity * 0.2);

    const pointsPerBeat = 150;
    const beatDuration = this.ecgGenerator.getBeatDuration();
    const currentPhase = this.ecgGenerator.getPhase();

    this.ecgPoints = [];

    for (let i = 0; i < pointsPerBeat; i++) {
      const phaseOffset = (i / pointsPerBeat) * beatDuration;
      const time = currentPhase + phaseOffset - beatDuration;
      const value = this.ecgGenerator.getValueAtTime(
        time % (beatDuration * 10),
      );

      const x = (i / pointsPerBeat) * width;
      const y = centerY - value * amplitude;
      this.ecgPoints.push({ x, y });
    }

    this.drawWavePoints(this.ecgPoints);
  }

  private renderOscilloscope(): void {
    const { width, height } = this.canvas;
    const centerY = height / 2;
    const amplitude = this.scaling.amplitude * (1 + this.mouseProximity * 0.3);

    const points: { x: number; y: number }[] = [];

    if (this.externalAudioData && this.externalAudioData.data) {
      const data = this.externalAudioData.data;
      const pointCount = Math.min(
        data.length,
        Math.max(50, Math.round(width / 3)),
      );
      const step = data.length / pointCount;

      for (let i = 0; i < pointCount; i++) {
        const dataIndex = Math.floor(i * step);
        const sample = data[dataIndex] ?? 128;
        const x = (i / pointCount) * width;
        const normalized = (sample - 128) / 128;
        const y = centerY - normalized * amplitude;
        points.push({ x, y });
      }

      this.drawWavePoints(points);
      return;
    }

    if (this.audioAnalyzer && this.audioAnalyzer.isActive()) {
      const timeData = this.audioAnalyzer.getByteTimeDomainData();
      if (timeData) {
        const data = timeData.data;
        const pointCount = Math.min(
          data.length,
          Math.max(50, Math.round(width / 3)),
        );
        const step = data.length / pointCount;

        for (let i = 0; i < pointCount; i++) {
          const dataIndex = Math.floor(i * step);
          const sample = data[dataIndex] ?? 128;
          const x = (i / pointCount) * width;
          const normalized = (sample - 128) / 128;
          const y = centerY - normalized * amplitude * 4;
          points.push({ x, y });
        }

        this.drawWavePoints(points);
        return;
      }
    }

    const pointCount = Math.max(50, Math.round(width / 3));

    for (let i = 0; i < pointCount; i++) {
      const x = (i / pointCount) * width;
      const t = (i / pointCount) * Math.PI * 4 + this.oscilloscopePhase;

      const freq1 = Math.sin(t);
      const freq2 = Math.sin(t * 2.3 + this.oscilloscopePhase * 0.5) * 0.3;
      const freq3 = Math.sin(t * 0.7 - this.oscilloscopePhase * 0.3) * 0.2;
      const value = (freq1 + freq2 + freq3) / 1.5;

      const y = centerY - value * amplitude;
      points.push({ x, y });
    }

    this.drawWavePoints(points);
  }

  private generatePoints(): WavePoint[] {
    const { width } = this.canvas;
    const pointCount = Math.max(50, Math.round(width / 3));

    let effectiveAmplitude = this.config.amplitude;

    if (!this.reducedMotion) {
      if (this.state === "plucked") {
        effectiveAmplitude *= 1 + this.pluckIntensity * 0.5;
      }

      effectiveAmplitude *= 1 + this.mouseProximity * 0.2;
    }

    return sineWave(0, width, pointCount, {
      ...this.config,
      amplitude: effectiveAmplitude,
    });
  }

  private drawWavePoints(points: { x: number; y: number }[]): void {
    if (points.length < 2) return;

    const first = points[0];
    if (!first) return;

    this.ctx.save();

    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = this.scaling.strokeWidth;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";

    if (!this.reducedMotion) {
      this.ctx.shadowColor = this.currentColor;
      this.ctx.shadowBlur =
        this.scaling.glowRadius * (1 + this.mouseProximity * 0.5);
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

  private drawWave(points: WavePoint[]): void {
    if (points.length < 2) return;

    const first = points[0];
    if (!first) return;

    this.ctx.save();

    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = this.scaling.strokeWidth;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";

    if (!this.reducedMotion) {
      this.ctx.shadowColor = this.currentColor;
      this.ctx.shadowBlur =
        this.scaling.glowRadius * (1 + this.mouseProximity * 0.5);
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
