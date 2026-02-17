Modeling an Electrocardiogram (ECG/EKG) wave—often referred to as the PQRST complex—is a fascinating intersection of physics and code. Since you're using TypeScript, we can leverage **interfaces** and **functional composition** to create a model that is both type-safe and modular.

## The Anatomy of the Wave

To model this accurately, we need to understand that an ECG isn't just one wave; it's a series of electrical events.

* **P wave:** Atrial depolarization.
* **QRS complex:** Ventricular depolarization (the big spike).
* **T wave:** Ventricular repolarization.

---

## 1. Defining the Types

First, let's define what a single "point" in our wave looks like and the parameters for each segment.

```typescript
interface Point {
  x: number; // Time
  y: number; // Voltage (mV)
}

interface WaveSegment {
  amplitude: number;
  duration: number;
  offset: number; // Shift along the X-axis
}

interface ECGConfig {
  pWave: WaveSegment;
  qrsComplex: WaveSegment;
  tWave: WaveSegment;
  heartRate: number; // BPM
}

```

## 2. The Mathematical Approach

The cleanest way to simulate these curves is using **Gaussian functions** (bell curves). The QRS complex is essentially a very sharp, narrow Gaussian, while the P and T waves are wider and shorter.

The formula for a Gaussian curve is:


* ****: Amplitude (height)
* ****: Position (center)
* ****: Width (standard deviation)

## 3. Implementation in TypeScript

Here is a simplified version of a generator that calculates the voltage at any given time .

```typescript
class ECGSimulator {
  private getGaussian(x: number, a: number, b: number, c: number): number {
    return a * Math.exp(-Math.pow(x - b, 2) / (2 * Math.pow(c, 2)));
  }

  public getVoltage(t: number, config: ECGConfig): number {
    // Normalize time to a single heartbeat cycle (0 to 1)
    const cycleLength = 60 / config.heartRate;
    const localT = t % cycleLength;

    // Model segments
    const p = this.getGaussian(localT, 0.1, 0.15, 0.02);   // P Wave
    const q = this.getGaussian(localT, -0.05, 0.2, 0.005); // Q Dip
    const r = this.getGaussian(localT, 1.0, 0.22, 0.01);   // R Spike
    const s = this.getGaussian(localT, -0.2, 0.24, 0.005); // S Dip
    const tWave = this.getGaussian(localT, 0.2, 0.4, 0.04); // T Wave

    return p + q + r + s + tWave;
  }
}

```

---

## 4. Why this works for TypeScript

* **Deterministic:** Given the same time `t`, you always get the same `y`. This is great for rendering to a `<canvas>` or an SVG path.
* **Extensible:** You can easily add "noise" by adding `Math.random()` to the output to simulate real-world interference.
* **Performance:** These calculations are pure math and extremely fast, allowing you to render 60 frames per second easily.

## Pro-Tip: Adding "Drift"

In real ECGs, the baseline isn't perfectly flat. You can simulate "baseline wander" by adding a low-frequency sine wave to your final voltage:

```typescript
const baselineWander = 0.05 * Math.sin(2 * Math.PI * 0.1 * t);
return p + q + r + s + tWave + baselineWander;

```