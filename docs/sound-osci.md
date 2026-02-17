**Oscilloscope** or a **Visualizer**.

A **synthesizer** *creates* sound from scratch (turning math into noise), whereas an **analyzer** takes an existing sound input and breaks it down into data you can draw. In the web world, we use the **Web Audio API** to handle this.

### The Logic

To display sound waves, you need to:

1. **Capture** the audio (from a microphone or a file).
2. **Route** it through an `AnalyserNode`.
3. **Extract** the "Time Domain Data" (the raw wave).
4. **Paint** that data onto an HTML5 `<canvas>`.

---

### Basic Implementation in TypeScript

Here is a streamlined version of how you’d set this up.

#### 1. The HTML

```html
<canvas id="oscillo" width="600" height="200"></canvas>
<button id="start">Start Listening</button>

```

#### 2. The TypeScript

```typescript
const canvas = document.getElementById('oscillo') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const startBtn = document.getElementById('start') as HTMLButtonElement;

startBtn.onclick = async () => {
  // 1. Initialize Audio Context
  const audioCtx = new AudioContext();
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const source = audioCtx.createMediaStreamSource(stream);

  // 2. Create Analyser
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048; // Determines the resolution of the wave
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  source.connect(analyser);

  // 3. The Drawing Loop
  const draw = () => {
    requestAnimationFrame(draw);
    analyser.getByteTimeDomainData(dataArray);

    // Clear Canvas
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the Wave
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#007acc";
    ctx.beginPath();

    const sliceWidth = canvas.width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0; // Normalize data
      const y = (v * canvas.height) / 2;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);

      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  };

  draw();
};

```

---

### Key Concepts to Remember

* **`fftSize`**: This must be a power of 2 (e.g., 256, 1024, 2048). A higher number gives you a more detailed "wiggle" but uses more processing power.
* **Time Domain vs. Frequency Domain**:
* **Time Domain** (`getByteTimeDomainData`) gives you the classic "oscilloscope" waveform.
* **Frequency Domain** (`getByteFrequencyData`) gives you those "dancing bars" (spectrum analyzer) found in old-school Winamp skins or Spotify.


* **User Gesture**: Browsers will block audio from starting until the user clicks something (hence the `startBtn`).

### Troubleshooting Common Issues

* **Silence?** Ensure you aren't muting the stream. If you want to *hear* the mic while you see the waves, add `analyser.connect(audioCtx.destination);`, but watch out for feedback loops!
* **Type Errors?** If `AudioContext` isn't recognized, make sure your `tsconfig.json` includes `"DOM"` in the `"lib"` array.

Would you like me to show you how to transform this into a frequency-based bar chart instead?