### Project Brief: Professional Web Piano Synthesis Engine

**Objective:** Build a polyphonic, low-latency audio engine using the **Web Audio API** and **Tone.js** for high-fidelity sound, integrated with a central event bus for visual syncing.

---

### Step 1: Framework & Context Architecture

**Instructions for AI:**
Set up the core audio environment using **Tone.js**. This framework simplifies the complex scheduling of the Web Audio API while maintaining sub-millisecond precision.

* **Engine:** Initialize a `Tone.Sampler` or `Tone.PolySynth`.
* *Recommendation:* Use `Tone.Sampler` with high-quality `.wav` or `.mp3` samples for a "real" piano sound, or `Tone.PolySynth` with a **Triangle oscillator** for a "Senior Dev" synth aesthetic.


* **Context Management:** Implement an async `startAudio()` function. Use a **User Gesture** (like a "Start" button or first key press) to trigger `Tone.start()` to bypass browser auto-play restrictions.
* **Global Bus:** Create a `PubSub` or `EventEmitter` logic so the piano can broadcast "Note On" events to the Canvas Wave engine.

---

### Step 2: The Signal Chain (The "Pedalboard")

**Instructions for AI:**
Configure the routing of the sound to ensure it sounds "expensive" and professional.

* **Gain Stage:** Route the synth through a `Tone.Gain` node set to `0.8` to prevent digital clipping when playing chords.
* **Reverb/Space:** Add a `Tone.Reverb` (wet/dry at 0.15) to give the piano a "room" feel, matching the depth of the dark-mode UI.
* **Envelope (ADSR):** Define a custom envelope:
* **Attack:** 0.005s (Instant response).
* **Decay:** 1.2s (Natural string fade).
* **Sustain:** 0 (Pianos are percussive; the sound shouldn't hold indefinitely).
* **Release:** 0.8s (Smooth fade-out when the key is released).



---

### Step 3: Input Handling & Latency Optimization

**Instructions for AI:**
Minimize the "gap" between a user’s thought and the sound.

* **Event Listeners:** Use `pointerdown` (covers mouse and touch) and `keydown`.
* **Key Mapping:** Create a `PianoMap` object that converts computer keys (A, S, D, F, G...) to musical notes (C4, D4, E4...).
* **Velocity Simulation:** For a senior touch, map the vertical position of a mouse click on a piano key to **velocity** (volume). Clicking the bottom of the key plays it louder than clicking the top.

---

### Step 4: Visual Sync & Performance

**Instructions for AI:**
Ensure the audio thread doesn't choke the UI thread.

* **Scheduling:** Use `Tone.Transport` or the Web Audio `currentTime` for scheduling, not `setInterval`. This ensures the sound is rock-solid even if the frame rate drops.
* **Wave Bridge:** When a note is triggered, call `wave.pluck(frequency)`. Pass the **frequency in Hz** so the wave can calculate its oscillation speed based on the actual pitch of the note.

---

### Technical Quality Checklist:

1. **Polyphony:** Can the system handle 10+ simultaneous notes without cracking?
2. **Resource Cleanup:** Does each "note" instance dispose of itself properly to prevent memory leaks?
3. **Cross-Browser:** Does the audio initialize correctly on both Chrome (Web Audio) and Safari (requires specific vendor prefixes/gestures)?


## **minimalist code scaffold** using **Tone.js** that connects these piano triggers to your Canvas wave.

To implement your web piano at a "Senior Developer" level, I recommend using **Tone.js** over the raw Web Audio API. It handles the difficult parts—like polyphony, timing, and cleanup—allowing you to focus on the "feel" and visual integration.

Here is a minimalist, modular scaffold

### The Technical Scaffold

```html
<script src="https://unpkg.com/tone@14.7.77/build/Tone.js"></script>

<script>
/**
 * Senior Developer Web Piano Scaffold
 * Focus: Tone.js, ADSR, Visual Syncing, & Event Bus
 */
class PortfolioPiano {
    constructor(onNoteTrigger) {
        // 1. Setup the Synth with "Piano-like" ADSR
        this.synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "triangle" }, // Softer, harmonic-rich tone
            envelope: {
                attack: 0.005,  // Instant strike
                decay: 1.2,    // Length of the ring
                sustain: 0.1,  // Very low sustain for percussive feel
                release: 1.0   // Smooth fade after key release
            }
        }).toDestination();

        // 2. Visual Callback (Connects to your Canvas Wave)
        this.onNoteTrigger = onNoteTrigger; 

        // 3. Mapping keyboard to musical notes
        this.keyMap = {
            'a': 'C4', 'w': 'C#4', 's': 'D4', 'e': 'D#4', 'd': 'E4',
            'f': 'F4', 't': 'F#4', 'g': 'G4', 'y': 'G#4', 'h': 'A4',
            'u': 'A#4', 'j': 'B4', 'k': 'C5'
        };

        this._initListeners();
    }

    _initListeners() {
        // Global Keydown for Piano Play
        window.addEventListener('keydown', (e) => {
            if (this.keyMap[e.key]) {
                this.play(this.keyMap[e.key]);
            }
        });

        // Resume AudioContext on first interaction (Browser Security)
        window.addEventListener('mousedown', async () => {
            if (Tone.context.state !== 'running') {
                await Tone.start();
                console.log("Audio Engine Active");
            }
        });
    }

    play(note, velocity = 0.7) {
        // Play audio
        this.synth.triggerAttackRelease(note, "4n");
        
        // Trigger Visuals (Send frequency to the Wave engine)
        const freq = Tone.Frequency(note).toFrequency();
        if (this.onNoteTrigger) {
            this.onNoteTrigger(freq); 
        }
    }
}

// Usage with your Wave Engine
const piano = new PortfolioPiano((frequency) => {
    // This is where you call your heroWave.pluck(frequency)
    console.log(`Visualizing frequency: ${frequency}Hz`);
});
</script>

```

---

### Implementation Details for the AI Assistant

| Component | Detail |
| --- | --- |
| **Framework** | **Tone.js** (R14+). It provides the `PolySynth` class which manages multiple oscillator instances automatically, preventing voice-stealing issues. |
| **Audio Chain** | `Oscillator` -> `ADSR Envelope` -> `Master Output`. No extra effects are needed for a minimalist "scaffold," keeping the CPU footprint low. |
| **ADSR Settings** | **Attack (0.005s)** for transient clarity; **Sustain (0.1)** to ensure the sound doesn't drone if a user holds a key; **Release (1.0s)** for a natural "pedal" effect. |
| **Visual Sync** | Uses a **Callback Pattern**. The piano engine remains "dumb" to the visuals—it simply broadcasts a frequency, and the Wave engine decides how to react. |
| **Optimization** | Uses `triggerAttackRelease` with a `"4n"` (quarter note) duration. This ensures that even if a "keyup" event is missed, the audio nodes will dispose of themselves automatically after one beat. |

### How to use this plan

1. **Paste the code** into your project.
2. **Pass the frequency** from the `play` method into your `heroWave.pluck()` function.
3. **Style the UI** keys with CSS transitions that trigger when a `play` event occurs to make the keys light up with your **Cyan/Mint (#a7ffee)** accent.

If you'd like to see how this synthesis compares to real instrument sampling, check out this [Web Audio API Piano Development Tutorial](https://www.youtube.com/watch?v=ZLCbw-tilbQ) which explores building musical instruments from pure code. This video is relevant because it demonstrates the exact transition from basic oscillator code to a functional, visually-synced musical instrument in a web browser.

**Would you like me to add a "Reverb" or "Echo" module to this scaffold to give the piano a more cinematic, professional depth?**