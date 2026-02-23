import { Midi } from "@tonejs/midi";
import * as Tone from "tone";
import { getPianoEngine } from "./PianoEngine";

export type MidiPlayerState = "idle" | "loading" | "playing" | "stopped";

export interface MidiPlayerCallbacks {
  onStateChange?: (state: MidiPlayerState) => void;
  onEnd?: () => void;
}

interface MidiNoteEvent {
  note: string;
  duration: number;
  velocity: number;
}

class MidiPlayerImpl {
  private midi: Midi | null = null;
  private state: MidiPlayerState = "idle";
  private callbacks: MidiPlayerCallbacks = {};
  private loaded = false;
  private part: Tone.Part | null = null;
  private pianoEngine: Awaited<ReturnType<typeof getPianoEngine>> | null = null;

  async load(url: string): Promise<void> {
    this.setState("loading");

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      this.midi = new Midi(arrayBuffer);
      this.loaded = true;
      this.setState("idle");
    } catch (error) {
      console.error("Failed to load MIDI file:", error);
      this.setState("idle");
      throw error;
    }
  }

  async play(): Promise<void> {
    if (!this.midi || !this.loaded) {
      console.warn("MIDI file not loaded");
      return;
    }

    this.stop(false);

    await Tone.start();

    this.pianoEngine = await getPianoEngine();
    await this.pianoEngine.ensureInitialized();
    await Tone.loaded();

    const events: Array<{ time: number; value: MidiNoteEvent }> = [];

    this.midi.tracks.forEach((track) => {
      track.notes.forEach((note) => {
        events.push({
          time: note.time,
          value: {
            note: note.name,
            duration: note.duration,
            velocity: note.velocity,
          },
        });
      });
    });

    events.sort((a, b) => a.time - b.time);

    this.part = new Tone.Part((time, event) => {
      if (this.pianoEngine && event) {
        const value =
          "value" in event
            ? (event as { value: MidiNoteEvent }).value
            : (event as MidiNoteEvent);
        this.pianoEngine.playAtTime(value.note, time, value.velocity);
        this.pianoEngine.stopAtTime(value.note, time + value.duration);
      }
    }, events);

    this.part.loop = false;
    this.part.start(0);

    Tone.Transport.start();

    this.setState("playing");

    const duration = this.midi.duration;

    this.endTimeout = setTimeout(
      () => {
        this.stop(true);
      },
      (duration + 0.5) * 1000,
    );
  }

  private endTimeout: ReturnType<typeof setTimeout> | null = null;

  stop(callOnEnd: boolean = true): void {
    if (this.endTimeout) {
      clearTimeout(this.endTimeout);
      this.endTimeout = null;
    }

    if (this.part) {
      this.part.stop();
      this.part.dispose();
      this.part = null;
    }

    Tone.Transport.stop();
    Tone.Transport.cancel();

    if (this.pianoEngine) {
      this.pianoEngine.stopAll();
    }

    this.setState("idle");

    if (callOnEnd && this.callbacks.onEnd) {
      this.callbacks.onEnd();
    }
  }

  getState(): MidiPlayerState {
    return this.state;
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  setCallbacks(callbacks: MidiPlayerCallbacks): void {
    this.callbacks = callbacks;
  }

  private setState(state: MidiPlayerState): void {
    this.state = state;
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(state);
    }
  }

  destroy(): void {
    this.stop(false);
    this.midi = null;
    this.loaded = false;
    this.pianoEngine = null;
    this.callbacks = {};
  }
}

let midiPlayerInstance: MidiPlayerImpl | null = null;

export function getMidiPlayer(): MidiPlayerImpl {
  if (!midiPlayerInstance) {
    midiPlayerInstance = new MidiPlayerImpl();
  }
  return midiPlayerInstance;
}

export function destroyMidiPlayer(): void {
  if (midiPlayerInstance) {
    midiPlayerInstance.destroy();
    midiPlayerInstance = null;
  }
}
