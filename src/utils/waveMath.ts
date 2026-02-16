export interface WavePoint {
  x: number;
  y: number;
}

export interface WaveConfig {
  amplitude: number;
  wavelength: number;
  phase: number;
  speed: number;
  yOffset: number;
}

export function sineWave(
  start: number,
  end: number,
  pointCount: number,
  config: WaveConfig
): WavePoint[] {
  const points: WavePoint[] = [];
  const step = (end - start) / (pointCount - 1);

  for (let i = 0; i < pointCount; i++) {
    const x = start + i * step;
    const normalizedX = (x / config.wavelength) * Math.PI * 2;
    const y = config.yOffset + Math.sin(normalizedX + config.phase) * config.amplitude;
    points.push({ x, y });
  }

  return points;
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export function lerpColor(start: string, end: string, t: number): string {
  const startRgb = hexToRgb(start);
  const endRgb = hexToRgb(end);

  if (!startRgb || !endRgb) return start;

  const r = Math.round(lerp(startRgb.r, endRgb.r, t));
  const g = Math.round(lerp(startRgb.g, endRgb.g, t));
  const b = Math.round(lerp(startRgb.b, endRgb.b, t));

  return rgbToHex(r, g, b);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result?.[1] || !result[2] || !result[3]) return null;
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
