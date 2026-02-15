Implement a "Hybrid Pulse" background

The "Hybrid Pulse" includes Constant Movement base with a Scroll-Linked transformation.

    Constant: Keep a very subtle, slow horizontal crawl (the "Life" of the site).

    Scroll: As the user scrolls into your "Work" section, make the wave transition into a Step Function (staircase) shape to represent discrete logic and code blocks.

    Mouse: Add a "Magnetic" effect where the wave peaks slightly toward the cursor if it gets close, making the site feel "aware."

Technical Implementation Checklist:

    Use will-change: transform: Ensure the GPU handles the animation so it doesn't lag your terminal typing effect.

    Standardize on y=Asin(Bx+C): Use this formula in a Javascript loop to draw to a Canvas for the smoothest possible 60fps movement.

    Color Shift: Have the stroke color transition from Mint (#00f5d4) to Pink (#f72585) as the user reaches the "Hobbies" section.

To achieve a "Senior Dev" level of polish, you want a **Centralized Animation Loop**. Instead of multiple independent animations fighting for CPU cycles, you should use a single `requestAnimationFrame` loop that calculates the wave's state based on several input variables (Mouse, Piano, and Strava hover).

### Technical Implementation: The "State-Driven Canvas"

I recommend using the **HTML5 Canvas API** over SVG for this. Canvas is much more performant for high-frequency path updates, especially when syncing with audio or rapid hover states.

#### 1. The Global Wave State

Create a state object that holds the "DNA" of your wave. Each input will modify these variables:

* **Base Frequency/Amplitude:** The "resting" state (walking pace/soft melody).
* **Target Frequency/Amplitude:** The state the wave is trying to reach.
* **Lerp (Linear Interpolation):** Smoothly transition between the current state and the target state so the wave doesn't "snap."

#### 2. Input Integration

* **Piano Keys:** Each key press should trigger a "Pluck" function. This temporarily spikes the **Amplitude** and shifts the **Phase** of the wave. You can even map the frequency of the note (Hz) to the visual frequency of the wave segment.
* **Strava Hover:** When the mouse enters the Strava card, toggle a `heartbeatMode` flag. Instead of a smooth sine wave, the math shifts to a **PQR complex** (a heartbeat spikes). **80 beats per minute (BPM)**, which is ~1.3Hz. This creates a calm, human-like rhythmic pulse.


* **Mouse Movement:** Use the mouse's  position to subtly influence the **horizontal offset**, making the wave "lean" toward the cursor.

#### 3. The Math (Logic Snippet)

The  coordinate for every point  on your wave would follow:


---

### The Development Plan

| Phase | Task | Focus |
| --- | --- | --- |
| **1. The Core** | Setup a Canvas resizing listener and a basic `draw()` loop. | Performance (60fps). |
| **2. The Inputs** | Map `onKeyDown` (Piano) and `onMouseEnter` (Strava) to state variables. | Input Latency. |
| **3. The Physics** | Implement "Ease-out" math so the wave settles back to "resting" after a key press. | "Juiciness" / Feel. |
| **4. Audio Sync** | Connect the Web Audio API so the visual wave matches the synthesized piano note. | Sensory Cohesion. |

---

### Testing Strategy

As a senior dev, your testing should cover both functionality and "vibe."

* **Performance Profiling:** Open Chrome DevTools > Performance. Ensure the Scripting time stays under **16ms per frame** to prevent jank on 60Hz monitors.
* **Input Stress Test:** Rapidly "mash" the piano keys. The wave should look chaotic but shouldn't break or show jagged edges (use a high enough point-density in your Canvas path).
* **The "Strava" Transition:** Ensure the transition from Sine Wave to Heartbeat Pulse (80 BPM) uses a **lerp** function over ~300ms. Abruptly changing the math will cause a visual "flicker."
* **Responsive Check:** Test the wave on mobile. High-density Canvas drawing can drain battery; consider "decimating" (reducing the number of points calculated) if the device is in Power Saving mode.

**Sample code for JavaScript `draw()` function that handles the Sine-to-Heartbeat transition**

To deliver a high-performance, senior-level implementation, we will use a **Canvas-based Class**. This approach encapsulates the state (resting vs. heartbeat) and ensures that the piano "plucks" and the Strava "pulse" feel like organic physical reactions rather than rigid animations.

### The Technical Logic

We will use **Linear Interpolation (Lerp)** to transition between states. This prevents the "snapping" effect when you move your mouse over the Strava card or hit a piano key.

#### 1. The Wave State Engine

```javascript
class HeroWave {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.phase = 0;
    
    // Wave Parameters (The "DNA")
    this.params = {
      amplitude: 20,    // Height
      frequency: 0.02,  // Width
      speed: 0.05,      // Constant pulse
      points: 100       // Smoothness
    };

    // Targets for Lerping (Transitioning)
    this.target = { ...this.params };
    this.isHeartbeat = false;
  }

  // Smoothly move current value toward target
  lerp(current, target, factor = 0.1) {
    return current + (target - current) * factor;
  }

  // Triggered by Piano Keys
  pluck(intensity = 50) {
    this.params.amplitude = intensity; // Sudden spike, then lerps back
  }

  // Triggered by Strava Hover
  setHeartbeat(active) {
    this.isHeartbeat = active;
    if (active) {
      this.target.speed = 0.15; // ~80 BPM visual speed
      this.target.amplitude = 40;
    } else {
      this.target.speed = 0.05;
      this.target.amplitude = 20;
    }
  }

  draw() {
    const { ctx, canvas, params, target } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update current params toward targets
    params.amplitude = this.lerp(params.amplitude, target.amplitude);
    params.speed = this.lerp(params.speed, target.speed);
    
    this.phase += params.speed;

    ctx.beginPath();
    ctx.strokeStyle = '#00f5d4';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00f5d4';

    for (let x = 0; x <= canvas.width; x += 10) {
      // The Magic Formula
      let y = Math.sin(x * params.frequency + this.phase) * params.amplitude;
      
      // Heartbeat Modulation (PQR spike logic)
      if (this.isHeartbeat && Math.sin(x * 0.01 + this.phase) > 0.9) {
          y *= 3; // Simulate the R-spike of an EKG
      }

      ctx.lineTo(x, canvas.height / 2 + y);
    }
    ctx.stroke();
    requestAnimationFrame(() => this.draw());
  }
}

```

---

### Integration Plan

1. **The Piano Hook:**
In your piano component, when a key is pressed (via `mousedown` or `keydown`), call `wave.pluck(60)`. The `lerp` function in the draw loop will naturally make the wave "settle" back to 20px amplitude over a second, mimicking acoustic decay.
2. **The Strava Hook:**
Add event listeners to your Strava card:
* `mouseenter`: `wave.setHeartbeat(true)`
* `mouseleave`: `wave.setHeartbeat(false)`


3. **The Resize Listener:**
Since Canvas works on pixel buffers, ensure you reset `canvas.width` on window resize to prevent the wave from looking stretched or blurry.

---

### Testing & Quality Assurance (The Senior Dev Way)

* **FPS Stability:** Open Chrome DevTools (F12) > Rendering > **Frame Rendering Stats**. Ensure the "GPU Rasterization" is active and your frame rate stays at a solid 60fps (or 120fps on ProMotion displays).
* **Memory Leaks:** Check the **Memory tab** in DevTools. Ensure the "Heap Size" doesn't climb indefinitely as you interact with the piano keys.
* **Visual Debounce:** Ensure that rapid hovering over the Strava card doesn't cause the wave to "jitter." The `lerp` factor (0.1) acts as a natural dampener for high-frequency input.
* **A11y (Accessibility):** Provide a `prefers-reduced-motion` check. If the user has this enabled in their OS, set `params.speed` to 0 or a very minimal value.

```javascript
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
if (motionQuery.matches) {
  this.target.speed = 0.005; // Barely moving
}

```

**Web Audio API context to make the piano keys produce sound that stays in sync with these visuals**
To create a professional-grade audio-visual experience, we’ll use the **Web Audio API**. Unlike simple `<audio>` tags, this allows us to synthesize sound in real-time, giving you control over "attack" and "decay"—essential for making a digital piano feel like a real instrument.

### The Audio-Visual Architecture

We will create an `AudioContext` that acts as your "Studio." Every time a piano key is pressed, we create an **Oscillator** (the sound source) and a **Gain Node** (the volume envelope).

---

### Technical Implementation

#### 1. The Piano Engine

This script maps musical notes to their corresponding frequencies and triggers both the sound and the wave "pluck" simultaneously.

```javascript
class PianoEngine {
  constructor(waveInstance) {
    this.wave = waveInstance; // Connect to your Canvas wave
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Frequencies for a C-Major scale
    this.notes = {
      'C': 261.63, 'D': 293.66, 'E': 329.63, 'F': 349.23, 
      'G': 392.00, 'A': 440.00, 'B': 493.88
    };
  }

  playNote(note) {
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    // Use a "triangle" wave for a softer, piano-like tone
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(this.notes[note], this.audioCtx.currentTime);

    // ADSR Envelope: Prevents "popping" and simulates string decay
    gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, this.audioCtx.currentTime + 0.05); // Attack
    gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 1); // Decay

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 1);

    // Sync with Visuals: Pluck the wave!
    // We use the note's frequency to determine the visual intensity
    const intensity = (this.notes[note] / 10); 
    this.wave.pluck(intensity);
  }
}

```

#### 2. The DOM Integration

You can now attach this to your HTML keys.

```javascript
const myWave = new HeroWave('waveCanvas');
const myPiano = new PianoEngine(myWave);

// Example for a single key
document.getElementById('key-c').addEventListener('mousedown', () => {
  myPiano.playNote('C');
});

```

---

### Why this is "Senior" level

* **Envelope Control:** By using `exponentialRampToValueAtTime`, the sound fades out naturally. A junior dev might just use `osc.stop()`, which creates a harsh, digital clicking sound.
* **Decoupled Logic:** The `PianoEngine` doesn't care how the wave is drawn; it just sends a "pluck" signal. This makes your code modular and easier to test.
* **Frequency Mapping:** Higher notes create higher-intensity "plucks," mimicking the physics of high-tension strings.

---

### Testing & Validation Plan

| Test Case | Expected Result |
| --- | --- |
| **Audio Latency** | The sound should trigger in <20ms. If it lags, ensure the `AudioContext` is resumed on a user gesture (browser security policy). |
| **Polyphony** | Pressing multiple keys rapidly (e.g., a C-Major chord) should create a rich sound without clipping the audio buffer. |
| **Tab Switching** | Browsers often throttle `requestAnimationFrame` and `AudioContext` when a tab is inactive. Test that the wave pauses and resumes gracefully. |
| **Frequency Accuracy** | Use a digital tuner app to ensure `440.00Hz` actually plays a perfect "A" note. |

**Would you like me to wrap this all up into a single, copy-pasteable Boilerplate file (index.html) so you can see it in action immediately?**