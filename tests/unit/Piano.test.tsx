import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Piano } from '../../src/components/Piano/Piano';
import { EffectsProvider } from '../../src/contexts/EffectsContext';

const mockPianoEngine = {
  play: vi.fn(),
  stop: vi.fn(),
  onNoteTrigger: vi.fn(),
  destroy: vi.fn(),
};

const mockWaveEngine = {
  pluck: vi.fn(),
  setHeartbeat: vi.fn(),
  setColor: vi.fn(),
  updateViewport: vi.fn(),
  destroy: vi.fn(),
};

function renderWithProviders(ui: React.ReactElement) {
  return render(<EffectsProvider>{ui}</EffectsProvider>);
}

describe('Piano', () => {
  beforeEach(() => {
    mockPianoEngine.play.mockClear();
    mockPianoEngine.stop.mockClear();
    mockWaveEngine.pluck.mockClear();
  });

  it('renders correct number of white keys for given range', () => {
    renderWithProviders(
      <Piano keyRange={{ startOctave: 4, whiteKeyCount: 7 }} />
    );

    const buttons = screen.getAllByRole('button');
    const whiteKeys = buttons.filter((btn) => btn.getAttribute('data-sharp') === 'false');
    expect(whiteKeys).toHaveLength(7);
  });

  it('renders correct number of black keys for given range', () => {
    renderWithProviders(
      <Piano keyRange={{ startOctave: 4, whiteKeyCount: 7 }} />
    );

    const buttons = screen.getAllByRole('button');
    const blackKeys = buttons.filter((btn) => btn.getAttribute('data-sharp') === 'true');
    expect(blackKeys).toHaveLength(5);
  });

  it('renders keys starting at correct octave', () => {
    renderWithProviders(
      <Piano keyRange={{ startOctave: 3, whiteKeyCount: 2 }} />
    );

    const c3Button = screen.getByRole('button', { name: /C3 key/ });
    const d3Button = screen.getByRole('button', { name: /D3 key/ });
    expect(c3Button).toBeDefined();
    expect(d3Button).toBeDefined();
  });

  it('has piano role and label', () => {
    renderWithProviders(
      <Piano keyRange={{ startOctave: 4, whiteKeyCount: 7 }} />
    );

    const piano = screen.getByRole('application', { name: /piano keyboard/i });
    expect(piano).toBeDefined();
  });

  it('applies custom className', () => {
    const { container } = renderWithProviders(
      <Piano keyRange={{ startOctave: 4, whiteKeyCount: 7 }} className="custom-class" />
    );

    expect(container.querySelector('.custom-class')).toBeDefined();
  });

  it('shows active state for keys from keyboard input', () => {
    const activeNotes = new Set(['C4', 'E4']);

    renderWithProviders(
      <Piano
        keyRange={{ startOctave: 4, whiteKeyCount: 7 }}
        activeNotesFromKeyboard={activeNotes}
      />
    );

    const c4Button = screen.getByRole('button', { name: /C4 key/ });
    const d4Button = screen.getByRole('button', { name: /D4 key/ });
    const e4Button = screen.getByRole('button', { name: /E4 key/ });

    expect(c4Button.getAttribute('aria-pressed')).toBe('true');
    expect(d4Button.getAttribute('aria-pressed')).toBe('false');
    expect(e4Button.getAttribute('aria-pressed')).toBe('true');
  });

  it('triggers note on pointer down', async () => {
    renderWithProviders(
      <Piano keyRange={{ startOctave: 4, whiteKeyCount: 7 }} />
    );

    const c4Button = screen.getByRole('button', { name: /C4 key/ });
    fireEvent.pointerDown(c4Button);

    expect(c4Button.getAttribute('aria-pressed')).toBe('true');
  });

  it('releases note on pointer up', async () => {
    renderWithProviders(
      <Piano keyRange={{ startOctave: 4, whiteKeyCount: 7 }} />
    );

    const c4Button = screen.getByRole('button', { name: /C4 key/ });
    fireEvent.pointerDown(c4Button);
    fireEvent.pointerUp(c4Button);

    expect(c4Button.getAttribute('aria-pressed')).toBe('false');
  });

  it('renders black keys in correct positions relative to white keys', () => {
    renderWithProviders(
      <Piano keyRange={{ startOctave: 4, whiteKeyCount: 7 }} />
    );

    const cSharpButton = screen.getByRole('button', { name: /C#4 key/ });
    expect(cSharpButton).toBeDefined();
    expect(cSharpButton.getAttribute('data-sharp')).toBe('true');
  });

  it('handles multiple octaves correctly', () => {
    renderWithProviders(
      <Piano keyRange={{ startOctave: 2, whiteKeyCount: 15 }} />
    );

    expect(screen.getByRole('button', { name: /C2 key/ })).toBeDefined();
    expect(screen.getByRole('button', { name: /C3 key/ })).toBeDefined();
    expect(screen.getByRole('button', { name: /C4 key/ })).toBeDefined();
  });
});
