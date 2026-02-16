import { usePianoInput } from '../hooks/usePianoInput.ts';

export function PianoInputHandler() {
  usePianoInput({
    enabled: true,
    onNoteOn: (note: string, velocity: number, frequency: number) => {
      console.debug(`Piano: ${note} (${frequency.toFixed(1)}Hz) velocity=${velocity.toFixed(2)}`);
    },
  });

  return null;
}
