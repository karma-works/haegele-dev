import type { PianoEngine } from '../contexts/EffectsContext';

interface ActiveNote {
  oscillator: OscillatorNode;
  gainNode: GainNode;
}

const NOTE_FREQUENCIES: Record<string, number> = {
  'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'E2': 82.41, 'F2': 87.31,
  'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61,
  'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23,
  'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46,
  'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
  'C6': 1046.50, 'C#6': 1108.73, 'D6': 1174.66, 'D#6': 1244.51, 'E6': 1318.51, 'F6': 1396.91,
};

export class PianoEngineImpl implements PianoEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeNotes: Map<string, ActiveNote> = new Map();
  private noteTriggerCallback: ((freq: number) => void) | null = null;
  private isInitialized = false;

  private async ensureContext(): Promise<void> {
    if (this.audioContext && this.masterGain) return;

    this.audioContext = new AudioContext();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.5;
    this.masterGain.connect(this.audioContext.destination);
    this.isInitialized = true;
  }

  private getFrequency(note: string): number {
    return NOTE_FREQUENCIES[note] ?? 440;
  }

  async play(note: string, velocity: number = 0.7): Promise<void> {
    await this.ensureContext();

    if (this.activeNotes.has(note)) {
      this.stop(note);
    }

    if (!this.audioContext || !this.masterGain) return;

    const frequency = this.getFrequency(note);
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    oscillator.type = 'triangle';
    oscillator.frequency.value = frequency;

    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    filter.Q.value = 1;

    const now = this.audioContext.currentTime;
    const attackTime = 0.005;
    const decayTime = 0.1;
    const sustainLevel = velocity * 0.6;

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(velocity, now + attackTime);
    gainNode.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.start(now);

    this.activeNotes.set(note, { oscillator, gainNode });

    if (this.noteTriggerCallback) {
      this.noteTriggerCallback(frequency);
    }
  }

  stop(note: string): void {
    const activeNote = this.activeNotes.get(note);
    if (!activeNote || !this.audioContext) return;

    const { oscillator, gainNode } = activeNote;
    const now = this.audioContext.currentTime;
    const releaseTime = 0.3;

    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.linearRampToValueAtTime(0, now + releaseTime);

    oscillator.stop(now + releaseTime + 0.01);

    this.activeNotes.delete(note);
  }

  onNoteTrigger(callback: (freq: number) => void): void {
    this.noteTriggerCallback = callback;
  }

  destroy(): void {
    this.activeNotes.forEach((_, note) => this.stop(note));
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.masterGain = null;
    }
    
    this.activeNotes.clear();
    this.isInitialized = false;
  }
}

let pianoEngineInstance: PianoEngineImpl | null = null;
let initPromise: Promise<PianoEngineImpl> | null = null;

export async function getPianoEngine(): Promise<PianoEngineImpl> {
  if (pianoEngineInstance) {
    return pianoEngineInstance;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    pianoEngineInstance = new PianoEngineImpl();
    return pianoEngineInstance;
  })();

  return initPromise;
}

export function destroyPianoEngine(): void {
  if (pianoEngineInstance) {
    pianoEngineInstance.destroy();
    pianoEngineInstance = null;
    initPromise = null;
  }
}
