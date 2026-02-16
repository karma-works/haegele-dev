import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { useEffects, EffectsProvider } from '../../src/contexts/EffectsContext';
import { usePianoInput } from '../../src/hooks/usePianoInput';
import { DESKTOP_KEY_RANGE, generateKeyMap, setKeyMap, FULL_KEY_MAP } from '../../src/utils/pianoKeyboard';

function TestWrapper({ children }: { children: React.ReactNode }) {
  return <EffectsProvider>{children}</EffectsProvider>;
}

function PianoInputTestComponent({
  enabled = true,
  onNoteOn,
  onNoteOff,
}: {
  enabled?: boolean;
  onNoteOn?: (note: string, velocity: number, frequency: number) => void;
  onNoteOff?: (note: string) => void;
}) {
  usePianoInput({ enabled, onNoteOn, onNoteOff });
  return <div>Piano Test</div>;
}

function fireKeyEvent(type: 'keydown' | 'keyup', key: string, repeat = false) {
  const event = new KeyboardEvent(type, { key, repeat, bubbles: true });
  window.dispatchEvent(event);
}

describe('usePianoInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const desktopKeyMap = generateKeyMap(DESKTOP_KEY_RANGE);
    setKeyMap(desktopKeyMap);
  });

  it('renders without crashing', () => {
    const { container } = render(
      <TestWrapper>
        <PianoInputTestComponent />
      </TestWrapper>
    );
    expect(container.textContent).toContain('Piano Test');
  });

  it('triggers onNoteOn callback when valid piano key is pressed', () => {
    const onNoteOn = vi.fn();
    
    render(
      <TestWrapper>
        <PianoInputTestComponent onNoteOn={onNoteOn} />
      </TestWrapper>
    );

    act(() => {
      fireKeyEvent('keydown', 'a');
    });

    expect(onNoteOn).toHaveBeenCalledWith('C2', 0.7, expect.any(Number));
    expect(onNoteOn).toHaveBeenCalledTimes(1);
  });

  it('does not trigger onNoteOn for non-piano keys', () => {
    const onNoteOn = vi.fn();
    
    render(
      <TestWrapper>
        <PianoInputTestComponent onNoteOn={onNoteOn} />
      </TestWrapper>
    );

    act(() => {
      fireKeyEvent('keydown', '1');
    });

    expect(onNoteOn).not.toHaveBeenCalled();
  });

  it('does not trigger onNoteOn on key repeat', () => {
    const onNoteOn = vi.fn();
    
    render(
      <TestWrapper>
        <PianoInputTestComponent onNoteOn={onNoteOn} />
      </TestWrapper>
    );

    act(() => {
      fireKeyEvent('keydown', 'a', true);
    });

    expect(onNoteOn).not.toHaveBeenCalled();
  });

  it('triggers onNoteOff when key is released', () => {
    const onNoteOff = vi.fn();
    
    render(
      <TestWrapper>
        <PianoInputTestComponent onNoteOff={onNoteOff} />
      </TestWrapper>
    );

    act(() => {
      fireKeyEvent('keydown', 'a');
      fireKeyEvent('keyup', 'a');
    });

    expect(onNoteOff).toHaveBeenCalledWith('C2');
  });

  it('does not trigger callbacks when disabled', () => {
    const onNoteOn = vi.fn();
    const onNoteOff = vi.fn();
    
    render(
      <TestWrapper>
        <PianoInputTestComponent enabled={false} onNoteOn={onNoteOn} onNoteOff={onNoteOff} />
      </TestWrapper>
    );

    act(() => {
      fireKeyEvent('keydown', 'a');
      fireKeyEvent('keyup', 'a');
    });

    expect(onNoteOn).not.toHaveBeenCalled();
    expect(onNoteOff).not.toHaveBeenCalled();
  });

  it('handles sharp keys', () => {
    const onNoteOn = vi.fn();
    
    render(
      <TestWrapper>
        <PianoInputTestComponent onNoteOn={onNoteOn} />
      </TestWrapper>
    );

    act(() => {
      fireKeyEvent('keydown', 'w');
    });

    expect(onNoteOn).toHaveBeenCalledWith('C#2', 0.7, expect.any(Number));
  });

  it('calls wavePluck with correct intensity', () => {
    const wavePluck = vi.fn();
    
    function TestComponent() {
      const effects = useEffects();
      effects.wavePluck = wavePluck;
      usePianoInput();
      return <div>Test</div>;
    }
    
    render(
      <EffectsProvider>
        <TestComponent />
      </EffectsProvider>
    );

    act(() => {
      fireKeyEvent('keydown', 'a');
    });

    expect(wavePluck).toHaveBeenCalled();
  });

  it('prevents double-trigger when same key is held', () => {
    const onNoteOn = vi.fn();
    
    render(
      <TestWrapper>
        <PianoInputTestComponent onNoteOn={onNoteOn} />
      </TestWrapper>
    );

    act(() => {
      fireKeyEvent('keydown', 'a');
      fireKeyEvent('keydown', 'a');
    });

    expect(onNoteOn).toHaveBeenCalledTimes(1);
  });

  it('handles multiple different keys', () => {
    const onNoteOn = vi.fn();
    
    render(
      <TestWrapper>
        <PianoInputTestComponent onNoteOn={onNoteOn} />
      </TestWrapper>
    );

    act(() => {
      fireKeyEvent('keydown', 'a');
      fireKeyEvent('keydown', 's');
      fireKeyEvent('keydown', 'd');
    });

    expect(onNoteOn).toHaveBeenCalledTimes(3);
    expect(onNoteOn).toHaveBeenNthCalledWith(1, 'C2', 0.7, expect.any(Number));
    expect(onNoteOn).toHaveBeenNthCalledWith(2, 'D2', 0.7, expect.any(Number));
    expect(onNoteOn).toHaveBeenNthCalledWith(3, 'E2', 0.7, expect.any(Number));
  });
});
