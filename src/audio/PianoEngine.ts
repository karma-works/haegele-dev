import type { PianoEngine } from '../contexts/EffectsContext';
import * as Tone from 'tone';
import type { AudioAnalyzerServiceImpl } from './AudioAnalyzerService';

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

const SALAMANDER_BASE_URL = 'https://tonejs.github.io/audio/salamander/';

export class PianoEngineImpl implements PianoEngine {
  private sampler: Tone.Sampler | null = null;
  private activeNotes: Set<string> = new Set();
  private noteTriggerCallback: ((freq: number) => void) | null = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;
  private volume: Tone.Volume | null = null;
  private audioAnalyzer: AudioAnalyzerServiceImpl | null = null;

  private getFrequency(note: string): number {
    return NOTE_FREQUENCIES[note] ?? 440;
  }

  private async ensureContext(): Promise<void> {
    if (this.isInitialized && this.sampler) return;

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.initSampler();
    return this.initPromise;
  }

  private async initSampler(): Promise<void> {
    await Tone.start();

    this.volume = new Tone.Volume(-6).toDestination();

    this.sampler = new Tone.Sampler({
      urls: {
        C2: 'C2.mp3',
        'D#2': 'Ds2.mp3',
        'F#2': 'Fs2.mp3',
        A2: 'A2.mp3',
        C3: 'C3.mp3',
        'D#3': 'Ds3.mp3',
        'F#3': 'Fs3.mp3',
        A3: 'A3.mp3',
        C4: 'C4.mp3',
        'D#4': 'Ds4.mp3',
        'F#4': 'Fs4.mp3',
        A4: 'A4.mp3',
        C5: 'C5.mp3',
        'D#5': 'Ds5.mp3',
        'F#5': 'Fs5.mp3',
        A5: 'A5.mp3',
        C6: 'C6.mp3',
        'D#6': 'Ds6.mp3',
        'F#6': 'Fs6.mp3',
        A6: 'A6.mp3',
        C7: 'C7.mp3',
        'D#7': 'Ds7.mp3',
        'F#7': 'Fs7.mp3',
        A7: 'A7.mp3',
      },
      baseUrl: SALAMANDER_BASE_URL,
      release: 0.8,
      onload: () => {
        this.isInitialized = true;
      },
    }).connect(this.volume!);

    await Tone.loaded();
    this.isInitialized = true;
  }

  async play(note: string, velocity: number = 0.7): Promise<void> {
    await this.ensureContext();

    if (this.activeNotes.has(note)) {
      this.stop(note);
    }

    if (!this.sampler) return;

    const frequency = this.getFrequency(note);

    if (this.sampler.loaded) {
      this.sampler.triggerAttack(note, Tone.now(), velocity);
    }

    this.activeNotes.add(note);

    if (this.noteTriggerCallback) {
      this.noteTriggerCallback(frequency);
    }
  }

  stop(note: string): void {
    if (!this.sampler || !this.activeNotes.has(note)) return;

    if (this.sampler.loaded) {
      this.sampler.triggerRelease(note, Tone.now());
    }

    this.activeNotes.delete(note);
  }

  onNoteTrigger(callback: (freq: number) => void): void {
    this.noteTriggerCallback = callback;
  }

  setAudioAnalyzer(analyzer: AudioAnalyzerServiceImpl | null): void {
    if (!this.volume) return;

    this.volume.disconnect();

    if (analyzer) {
      const analyserNode = analyzer.getAnalyserNode();
      if (analyserNode) {
        this.volume.connect(analyserNode as unknown as Tone.ToneAudioNode);
        analyzer.connect();
        this.audioAnalyzer = analyzer;
      }
    } else {
      this.volume.toDestination();
      this.audioAnalyzer = null;
    }
  }

  destroy(): void {
    this.activeNotes.forEach((note) => this.stop(note));

    if (this.sampler) {
      this.sampler.dispose();
      this.sampler = null;
    }

    if (this.volume) {
      this.volume.dispose();
      this.volume = null;
    }

    this.activeNotes.clear();
    this.isInitialized = false;
    this.initPromise = null;
  }
}

let pianoEngineInstance: PianoEngineImpl | null = null;
let getPianoEnginePromise: Promise<PianoEngineImpl> | null = null;

export async function getPianoEngine(): Promise<PianoEngineImpl> {
  if (pianoEngineInstance) {
    return pianoEngineInstance;
  }

  if (getPianoEnginePromise) {
    return getPianoEnginePromise;
  }

  getPianoEnginePromise = (async () => {
    pianoEngineInstance = new PianoEngineImpl();
    return pianoEngineInstance;
  })();

  return getPianoEnginePromise;
}

export function destroyPianoEngine(): void {
  if (pianoEngineInstance) {
    pianoEngineInstance.destroy();
    pianoEngineInstance = null;
    getPianoEnginePromise = null;
  }
}
