# Chrome Music Lab - Piano Roll Visualization

## Quick Reference for Reimplementation

### Live Demo
https://musiclab.chromeexperiments.com/PianoRoll/

### Source Code
https://github.com/googlecreativelab/chrome-music-lab/tree/master/pianoroll

---

## Project Overview

Piano Roll is an interactive music visualization experiment from Chrome Music Lab that displays MIDI notes as colored bars scrolling across the screen. Users can watch classical pieces play visually, scrub through the timeline, or use their microphone to record and visualize their own music in real-time.

### Features
- Visual MIDI playback with colored note bars
- Pre-loaded classical pieces (Beethoven, Bach, Mozart, Satie)
- Microphone input for real-time visualization
- Multiple instrument sounds (Piano, Strings, Synth)
- Scrubbing/seeking through the timeline
- Responsive design for all devices

---

## File Structure Needed

```
/src
  /app
    Main.js              # Entry point, wires components together
    /roll
      Roll.js            # Main scroll container & animation loop
      Score.js           # Note management & rendering
      Note.js            # Individual note model
      Scroll.js          # Scroll handling & animation
    /sound
      Player.js          # Audio player controller
      Piano.js           # Piano sampler
      Synth.js           # Synth instrument
      Sampler.js         # Generic sampler
    /interface
      Interface.js       # UI controls
    /mic
      MicInput.js        # Microphone handling
    /data
      Colors.js          # Note color mapping
  /style
    main.scss            # Entry styles
    roll.scss            # Roll container styles
    note.scss            # Note bar styles
    interface.scss       # UI controls
  /midi
    *.json               # Pre-converted MIDI files
```

---

## Core Dependencies

### package.json
```json
{
  "dependencies": {
    "tone": "^13.8.25",
    "jquery": "^2.2.1",
    "midiconvert": "^0.4.2",
    "teoria": "^1.11.0",
    "domready": "^1.0.8",
    "startaudiocontext": "^1.1.0"
  }
}
```

---

## Key Components

### 1. Roll Container (Main Visualization)

```javascript
// Roll.js - Core animation loop
var Roll = function(container) {
  this._element = document.createElement("div");
  this._element.id = "RollContainer";
  
  // Trigger line in center
  var triggerLine = document.createElement("div");
  triggerLine.id = "TriggerLine";
  
  // Scroll container
  this._scrollContainer = document.createElement("div");
  this._scrollContainer.id = "ScrollContainer";
  
  this._scrollElement = document.createElement("div");
  this._scrollElement.id = "PianoRoll";
  
  // Score handles note rendering
  this._score = new Score(this._element, this._scrollElement);
  
  // Animation loop using requestAnimationFrame
  this._bindedLoop = this._loop.bind(this);
  this._loop();
};

Roll.prototype._loop = function() {
  requestAnimationFrame(this._bindedLoop);
  var scrollLeft = this._scrollContainer.scrollLeft;
  
  // Loop when reaching end
  if (scrollLeft + this._width >= this._score.width - 2) {
    this._scrollContainer.scrollLeft = 0;
  }
  
  // Draw visible notes
  this._score.draw(this._currentScroll - this._width);
};
```

### 2. Note Model

```javascript
// Note.js - Individual note representation
var Note = function(noteDescription, displayOptions) {
  this.noteOn = Transport.toSeconds(noteDescription.time);
  this.duration = Transport.toSeconds(noteDescription.duration);
  this.noteOff = this.noteOn + this.duration;
  
  // Parse note name for color (e.g., "C4" -> "C")
  var noteName = noteDescription.note.match(/^([a-g]{1}[b|#]{0,1})[0-9]+$/i)[1];
  this.color = Colors[noteName];
  
  this.note = noteDescription.note;
  this.velocity = noteDescription.velocity;
  this.midiNote = noteDescription.midiNote;
  
  // Calculate position
  this.top = (displayOptions.max - displayOptions.min) * 
             (1 - (this.midiNote - displayOptions.min) / 
             (displayOptions.max - displayOptions.min));
  this.top *= displayOptions.noteHeight - 2;
  
  this.left = this.noteOn * displayOptions.pixelsPerSecond;
  this.width = Math.max((this.duration * displayOptions.pixelsPerSecond) - 2, 3);
  this.height = displayOptions.noteHeight - 2;
};

Note.prototype.draw = function(context) {
  context.beginPath();
  context.fillStyle = this._triggered ? "black" : this.color;
  context.fillRect(this.left * 2, this.top * 2, this.width * 2, this.height * 2);
};
```

### 3. Note Color Mapping

```javascript
// Colors.js - Pitch to color mapping
module.exports = {
  "C"  : "#4e61d8",   // Blue
  "C#" : "#8064c6",   // Purple
  "D"  : "#a542b1",   // Magenta
  "D#" : "#ed3883",   // Pink
  "E"  : "#f75839",   // Red
  "F"  : "#f7943d",   // Orange
  "F#" : "#f6be37",   // Yellow
  "G"  : "#d1c12e",   // Gold
  "G#" : "#95c631",   // Lime
  "A"  : "#4bb250",   // Green
  "A#" : "#45b5a1",   // Teal
  "B"  : "#4598b6",   // Cyan
};
```

---

## Visual Styling

### Roll Container SCSS

```scss
// roll.scss
#RollContainer {
  position: absolute;
  width: 100%;
  height: calc(100% - 60px);
  left: 0;
  top: 0;
  overflow: hidden;

  #ScrollContainer {
    height: calc(100% + 25px);
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    overflow-y: hidden;
    overflow-x: scroll;

    #PianoRoll {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      z-index: 1;
      background-color: transparent;
    }
  }

  #TriggerLine {
    position: absolute;
    left: calc(50% - 1.5px);
    height: 100%;
    background-color: black;
    width: 3px;
    z-index: 2;
    opacity: 0.1;
    pointer-events: none;
  }

  #ScoreCanvas {
    width: 100%;
    height: calc(100% - 25px);
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
  }
}
```

### Note Bar Styles

```scss
// note.scss
.note {
  position: absolute;
  border-radius: 2px;
  transition: background-color 0.1s ease;
  
  &.triggered {
    background-color: #000 !important;
  }
}

// Note variants by pitch
.note--c  { background-color: #4e61d8; }
.note--d  { background-color: #a542b1; }
.note--e  { background-color: #f75839; }
.note--f  { background-color: #f7943d; }
.note--g  { background-color: #d1c12e; }
.note--a  { background-color: #4bb250; }
.note--b  { background-color: #4598b6; }
```

---

## Audio System

### Player with Tone.js

```javascript
// Player.js - Audio playback controller
var Player = function() {
  this._instrument = new Piano();
};

Player.prototype.setInstrument = function(type) {
  switch(type) {
    case 'piano':
      this._instrument = new Piano();
      break;
    case 'synth':
      this._instrument = new Synth();
      break;
    case 'strings':
      this._instrument = new Sampler('strings');
      break;
  }
};

Player.prototype.triggerAttackRelease = function(note, duration, time, velocity) {
  this._instrument.triggerAttackRelease(note, duration, time, velocity);
};

Player.prototype.releaseAll = function() {
  this._instrument.releaseAll();
};
```

### Piano Sampler

```javascript
// Piano.js - Sample-based piano
var Piano = function() {
  this._piano = new Tone.Sampler({
    'C4': 'C4.[format]',
    'D#4': 'Ds4.[format]',
    'F#4': 'Fs4.[format]',
    'A4': 'A4.[format]',
  }, {
    'release': 1,
    'baseUrl': './audio/'
  }).toMaster();
};

Piano.prototype.triggerAttackRelease = function(note, duration, time, velocity) {
  this._piano.triggerAttackRelease(note, duration, time, velocity);
};
```

---

## MIDI Data Format

### JSON Structure

```json
{
  "header": {
    "tempo": 120,
    "timeSignature": [4, 4]
  },
  "notes": [
    {
      "note": "C4",
      "midiNote": 60,
      "time": "0:0:0",
      "duration": "4n",
      "velocity": 0.8
    }
  ]
}
```

### Pre-loaded Pieces

| File | Piece | Duration |
|------|-------|----------|
| preludeInC.json | Bach - Prelude in C Major | ~2:30 |
| minuetInG.json | Bach - Minuet in G | ~1:30 |
| beethoven5.json | Beethoven - Symphony No. 5 | ~5:00 |
| turkishMarch.json | Mozart - Turkish March | ~3:00 |
| satie.json | Satie - Gymnopedie | ~2:30 |

---

## Event Flow

```
User clicks Play
    ↓
Interface.onPlay(true)
    ↓
Roll.start()
    ↓
Scroll animation begins
    ↓
requestAnimationFrame loop
    ↓
Score.getTriggerLine() checks notes at playhead
    ↓
Roll.onnote(note, duration, time, velocity)
    ↓
Player.triggerAttackRelease()
    ↓
Audio output via Tone.js
```

---

## Microphone Input

```javascript
// MicInput.js - Real-time pitch detection
var MicInput = function() {
  this._analyser = Tone.context.createAnalyser();
  this._mic = new Tone.UserMedia();
  
  this._mic.connect(this._analyser);
  this._mic.open();
};

MicInput.prototype.getPitches = function() {
  var dataArray = new Float32Array(this._analyser.fftSize);
  this._analyser.getFloatTimeDomainData(dataArray);
  // Use autocorrelation or YIN algorithm for pitch detection
  return this._detectPitch(dataArray);
};
```

---

## TypeScript Component Structure

```tsx
// PianoRoll.tsx
interface NoteData {
  note: string;
  midiNote: number;
  time: number;
  duration: number;
  velocity: number;
}

interface PianoRollProps {
  notes: NoteData[];
  tempo: number;
  pixelsPerSecond?: number;
  noteHeight?: number;
  onNoteTrigger?: (note: NoteData) => void;
}

export const PianoRoll: React.FC<PianoRollProps> = ({
  notes,
  tempo,
  pixelsPerSecond = 200,
  noteHeight = 6,
  onNoteTrigger
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  useEffect(() => {
    if (!isPlaying) return;
    
    let animationId: number;
    const animate = () => {
      setScrollPosition(prev => {
        const next = prev + (pixelsPerSecond / 60);
        if (next > notes[notes.length - 1].time * pixelsPerSecond) {
          return 0;
        }
        return next;
      });
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, pixelsPerSecond]);
  
  return (
    <div className="piano-roll-container" ref={containerRef}>
      <div className="trigger-line" />
      <div 
        className="scroll-container"
        style={{ transform: `translateX(-${scrollPosition}px)` }}
      >
        {notes.map((note, i) => (
          <div
            key={i}
            className="note-bar"
            style={{
              left: note.time * pixelsPerSecond,
              top: (127 - note.midiNote) * noteHeight,
              width: Math.max(note.duration * pixelsPerSecond - 2, 3),
              height: noteHeight - 2,
              backgroundColor: NOTE_COLORS[note.note.replace(/\d+/, '')]
            }}
          />
        ))}
      </div>
    </div>
  );
};
```

---

## Performance Considerations

1. **Use Canvas for many notes** - DOM elements become slow with 1000+ notes
2. **Virtual scrolling** - Only render visible notes
3. **Look-ahead scheduling** - Schedule audio 50ms ahead for accuracy
4. **requestAnimationFrame** - Sync visual updates with display refresh
5. **Object pooling** - Reuse note objects instead of creating new ones
6. **Throttle resize events** - Debounce window resize handlers

---

## Color Palette

| Pitch | Color | Hex |
|-------|-------|-----|
| C | Blue | #4e61d8 |
| C#/Db | Purple | #8064c6 |
| D | Magenta | #a542b1 |
| D#/Eb | Pink | #ed3883 |
| E | Red | #f75839 |
| F | Orange | #f7943d |
| F#/Gb | Yellow | #f6be37 |
| G | Gold | #d1c12e |
| G#/Ab | Lime | #95c631 |
| A | Green | #4bb250 |
| A#/Bb | Teal | #45b5a1 |
| B | Cyan | #4598b6 |

---

## Responsive Design

- Horizontal scroll with hidden vertical scrollbar
- Touch-friendly scrubbing on mobile
- Orientation change handling
- Viewport-based sizing for note heights
- Full-screen support for iOS

---

## Integration Ideas

1. **Interactive music education** - Show students how notes relate to pitch
2. **Music theory visualization** - Display scales, chords, intervals
3. **Collaborative composition** - Multiple users add notes in real-time
4. **AI music analysis** - Highlight patterns and motifs
5. **Accessibility** - Alternative visual representation of music for deaf users

---

## Build Commands

```bash
# Install dependencies
npm install

# Development build
webpack

# Production build
webpack -p
```
