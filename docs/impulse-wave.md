# Impulse Wave Design Document

A unified system for modeling and visualizing impulse waves, combining ECG-like periodic waveforms with real-time sound oscillator analysis.

## Overview

The impulse wave system integrates two complementary approaches:
- **Synthetic Wave Generation**: Mathematical modeling of periodic impulses (ECG-style)
- **Real-time Analysis**: Live audio waveform visualization (oscilloscope-style)

---

## 1. Core Types

### Point & Segment Interfaces

```typescript
interface Point {
  x: number;
  y: number;
}

interface WaveSegment {
  amplitude: number;
  duration: number;
  offset: number;
}

interface ImpulseConfig {
  segments: WaveSegment[];
  frequency: number;
  phase: number;
  decay: number;
}
```

### ECG-Specific Configuration

```typescript
interface ECGImpulseConfig {
  pWave: WaveSegment;
  qrsComplex: WaveSegment;
  tWave: WaveSegment;
  heartRate: number;
  baselineWander: number;
}
```

### Audio Analyzer Configuration

```typescript
interface AudioAnalyzerConfig {
  fftSize: 256 | 512 | 1024 | 2048;
  smoothingTimeConstant: number;
  minDecibels: number;
  maxDecibels: number;
}
```

---

## 2. Mathematical Foundation

### Gaussian Function for Wave Segments

```typescript
const gaussian = (x: number, amplitude: number, center: number, width: number): number => {
  return amplitude * Math.exp(-Math.pow(x - center, 2) / (2 * Math.pow(width, 2)));
};
```

### Impulse Composition

An impulse wave is composed of multiple Gaussian segments:

```
y(t) = Σ gaussian(t, aᵢ, bᵢ, cᵢ) + baseline(t)
```

Where:
- `aᵢ` = amplitude of segment i
- `bᵢ` = center position of segment i
- `cᵢ` = width (standard deviation) of segment i
- `baseline(t)` = low-frequency baseline wander

---

## 3. ECG Impulse Generator

Based on patterns from `ecc-wave.md`:

```typescript
class ECGImpulseGenerator {
  private gaussian(x: number, a: number, b: number, c: number): number {
    return a * Math.exp(-Math.pow(x - b, 2) / (2 * Math.pow(c, 2)));
  }

  generate(t: number, config: ECGImpulseConfig): number {
    const cycleLength = 60 / config.heartRate;
    const localT = t % cycleLength;
    const normalizedT = localT / cycleLength;

    const p = this.gaussian(normalizedT, config.pWave.amplitude, 0.15, 0.02);
    const q = this.gaussian(normalizedT, -0.05, 0.2, 0.005);
    const r = this.gaussian(normalizedT, 1.0, 0.22, 0.01);
    const s = this.gaussian(normalizedT, -0.2, 0.24, 0.005);
    const tWave = this.gaussian(normalizedT, config.tWave.amplitude, 0.4, 0.04);

    const baseline = config.baselineWander * Math.sin(2 * Math.PI * 0.1 * t);

    return p + q + r + s + tWave + baseline;
  }

  generateCycle(pointCount: number, config: ECGImpulseConfig): Point[] {
    const cycleLength = 60 / config.heartRate;
    const points: Point[] = [];

    for (let i = 0; i < pointCount; i++) {
      const t = (i / pointCount) * cycleLength;
      points.push({ x: t, y: this.generate(t, config) });
    }

    return points;
  }
}
```

### Default ECG Configuration

```typescript
const DEFAULT_ECG_CONFIG: ECGImpulseConfig = {
  pWave: { amplitude: 0.1, duration: 0.1, offset: 0 },
  qrsComplex: { amplitude: 1.0, duration: 0.08, offset: 0.2 },
  tWave: { amplitude: 0.2, duration: 0.16, offset: 0.4 },
  heartRate: 72,
  baselineWander: 0.05
};
```

---

## 4. Audio Waveform Analyzer

Based on patterns from `sound-osci.md`:

```typescript
class AudioWaveformAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;

  async initialize(config: AudioAnalyzerConfig): Promise<void> {
    this.audioContext = new AudioContext();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = this.audioContext.createMediaStreamSource(stream);

    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = config.fftSize;
    this.analyser.smoothingTimeConstant = config.smoothingTimeConstant;
    this.analyser.minDecibels = config.minDecibels;
    this.analyser.maxDecibels = config.maxDecibels;

    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    source.connect(this.analyser);
  }

  getTimeDomainData(): Uint8Array {
    if (!this.analyser || !this.dataArray) {
      throw new Error('Analyzer not initialized');
    }
    this.analyser.getByteTimeDomainData(this.dataArray);
    return this.dataArray;
  }

  getWaveformPoints(canvasWidth: number, canvasHeight: number): Point[] {
    const data = this.getTimeDomainData();
    const points: Point[] = [];
    const sliceWidth = canvasWidth / data.length;

    for (let i = 0; i < data.length; i++) {
      const v = data[i] / 128.0;
      const y = (v * canvasHeight) / 2;
      points.push({ x: i * sliceWidth, y });
    }

    return points;
  }

  disconnect(): void {
    this.audioContext?.close();
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
  }
}
```

### Default Audio Configuration

```typescript
const DEFAULT_AUDIO_CONFIG: AudioAnalyzerConfig = {
  fftSize: 2048,
  smoothingTimeConstant: 0.8,
  minDecibels: -90,
  maxDecibels: -10
};
```

---

## 5. Unified Wave Renderer

### Canvas Rendering

```typescript
interface RenderConfig {
  strokeColor: string;
  lineWidth: number;
  backgroundColor: string;
  glowEffect: boolean;
  glowColor: string;
  glowBlur: number;
}

class WaveRenderer {
  constructor(private ctx: CanvasRenderingContext2D) {}

  clear(width: number, height: number, backgroundColor: string): void {
    this.ctx.fillStyle = backgroundColor;
    this.ctx.fillRect(0, 0, width, height);
  }

  drawWave(points: Point[], config: RenderConfig): void {
    if (points.length === 0) return;

    this.ctx.beginPath();
    this.ctx.lineWidth = config.lineWidth;
    this.ctx.strokeStyle = config.strokeColor;

    if (config.glowEffect) {
      this.ctx.shadowColor = config.glowColor;
      this.ctx.shadowBlur = config.glowBlur;
    }

    this.ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }

    this.ctx.stroke();

    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
  }
}
```

### Animation Loop

```typescript
class ImpulseWaveAnimator {
  private animationId: number | null = null;
  private lastTime: number = 0;

  constructor(
    private renderer: WaveRenderer,
    private canvas: HTMLCanvasElement
  ) {}

  start(
    getPoints: () => Point[],
    config: RenderConfig
  ): void {
    const animate = (timestamp: number) => {
      const points = getPoints();

      this.renderer.clear(
        this.canvas.width,
        this.canvas.height,
        config.backgroundColor
      );
      this.renderer.drawWave(points, config);

      this.animationId = requestAnimationFrame(animate);
    };

    this.animationId = requestAnimationFrame(animate);
  }

  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}
```

---

## 6. React Component Integration

### Props Interface

```typescript
interface ImpulseWaveProps {
  mode: 'ecg' | 'audio' | 'hybrid';
  ecgConfig?: Partial<ECGImpulseConfig>;
  audioConfig?: Partial<AudioAnalyzerConfig>;
  renderConfig?: Partial<RenderConfig>;
  width: number;
  height: number;
  className?: string;
}
```

### Component Structure

```typescript
const ImpulseWave: React.FC<ImpulseWaveProps> = ({
  mode,
  ecgConfig,
  audioConfig,
  renderConfig,
  width,
  height,
  className
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animatorRef = useRef<ImpulseWaveAnimator | null>(null);
  const ecgGeneratorRef = useRef<ECGImpulseGenerator | null>(null);
  const audioAnalyzerRef = useRef<AudioWaveformAnalyzer | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d')!;
    const renderer = new WaveRenderer(ctx);
    const mergedRenderConfig = { ...DEFAULT_RENDER_CONFIG, ...renderConfig };

    animatorRef.current = new ImpulseWaveAnimator(renderer, canvasRef.current);

    if (mode === 'ecg' || mode === 'hybrid') {
      ecgGeneratorRef.current = new ECGImpulseGenerator();
    }

    if (mode === 'audio' || mode === 'hybrid') {
      audioAnalyzerRef.current = new AudioWaveformAnalyzer();
      audioAnalyzerRef.current.initialize({ ...DEFAULT_AUDIO_CONFIG, ...audioConfig });
    }

    return () => {
      animatorRef.current?.stop();
      audioAnalyzerRef.current?.disconnect();
    };
  }, [mode, ecgConfig, audioConfig, renderConfig]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
    />
  );
};
```

---

## 7. Performance Considerations

### Optimization Strategies

| Strategy | Implementation |
|----------|---------------|
| Request Animation Frame | Use native browser timing |
| Canvas Offscreen | Render complex waves off-main-thread |
| Typed Arrays | Use `Float32Array` for point buffers |
| Memoization | Cache computed wave segments |
| Intersection Observer | Pause when off-screen |

### Memory Management

```typescript
const createPointBuffer = (size: number): Float32Array => {
  return new Float32Array(size * 2);
};

const writePointToBuffer = (
  buffer: Float32Array,
  index: number,
  point: Point
): void => {
  buffer[index * 2] = point.x;
  buffer[index * 2 + 1] = point.y;
};
```

---

## 8. Accessibility

- **Reduced Motion**: Respect `prefers-reduced-motion` by disabling animations
- **Screen Readers**: Provide text descriptions of wave state
- **High Contrast**: Support high-contrast color schemes

```typescript
const useReducedMotionConfig = (): Partial<RenderConfig> => {
  const isReducedMotion = useReducedMotion().isReducedMotion;

  return isReducedMotion
    ? { glowEffect: false, lineWidth: 3 }
    : {};
};
```

---

## References

- `ecc-wave.md` - ECG wave mathematical modeling with Gaussian functions
- `sound-osci.md` - Web Audio API analyzer implementation
- `pulse-background.md` - Canvas rendering patterns
- `AGENTS.md` - Project conventions and accessibility requirements
