import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PianoKey } from '../../src/components/Piano/PianoKey';

describe('PianoKey', () => {
  const mockOnNoteStart = vi.fn();
  const mockOnNoteEnd = vi.fn();

  beforeEach(() => {
    mockOnNoteStart.mockClear();
    mockOnNoteEnd.mockClear();
  });

  it('renders a white key with correct note', () => {
    render(
      <PianoKey
        note="C4"
        isSharp={false}
        isActive={false}
        onNoteStart={mockOnNoteStart}
        onNoteEnd={mockOnNoteEnd}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeDefined();
    expect(button.getAttribute('data-note')).toBe('C4');
    expect(button.getAttribute('data-sharp')).toBe('false');
  });

  it('renders a black key with correct attributes', () => {
    render(
      <PianoKey
        note="C#4"
        isSharp={true}
        isActive={false}
        onNoteStart={mockOnNoteStart}
        onNoteEnd={mockOnNoteEnd}
      />
    );

    const button = screen.getByRole('button');
    expect(button.getAttribute('data-note')).toBe('C#4');
    expect(button.getAttribute('data-sharp')).toBe('true');
  });

  it('shows active state when isActive is true', () => {
    const { rerender } = render(
      <PianoKey
        note="C4"
        isSharp={false}
        isActive={false}
        onNoteStart={mockOnNoteStart}
        onNoteEnd={mockOnNoteEnd}
      />
    );

    let button = screen.getByRole('button');
    expect(button.getAttribute('aria-pressed')).toBe('false');

    rerender(
      <PianoKey
        note="C4"
        isSharp={false}
        isActive={true}
        onNoteStart={mockOnNoteStart}
        onNoteEnd={mockOnNoteEnd}
      />
    );

    button = screen.getByRole('button');
    expect(button.getAttribute('aria-pressed')).toBe('true');
  });

  it('calls onNoteStart on pointer down', () => {
    render(
      <PianoKey
        note="C4"
        isSharp={false}
        isActive={false}
        onNoteStart={mockOnNoteStart}
        onNoteEnd={mockOnNoteEnd}
        velocity={0.8}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.pointerDown(button);

    expect(mockOnNoteStart).toHaveBeenCalledTimes(1);
    expect(mockOnNoteStart).toHaveBeenCalledWith('C4', 0.8);
  });

  it('uses default velocity when not provided', () => {
    render(
      <PianoKey
        note="C4"
        isSharp={false}
        isActive={false}
        onNoteStart={mockOnNoteStart}
        onNoteEnd={mockOnNoteEnd}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.pointerDown(button);

    expect(mockOnNoteStart).toHaveBeenCalledWith('C4', 0.7);
  });

  it('calls onNoteEnd on pointer up', () => {
    render(
      <PianoKey
        note="C4"
        isSharp={false}
        isActive={false}
        onNoteStart={mockOnNoteStart}
        onNoteEnd={mockOnNoteEnd}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.pointerDown(button);
    fireEvent.pointerUp(button);

    expect(mockOnNoteEnd).toHaveBeenCalledTimes(1);
    expect(mockOnNoteEnd).toHaveBeenCalledWith('C4');
  });

  it('calls onNoteEnd on pointer leave while pressed', () => {
    render(
      <PianoKey
        note="C4"
        isSharp={false}
        isActive={false}
        onNoteStart={mockOnNoteStart}
        onNoteEnd={mockOnNoteEnd}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.pointerDown(button);
    fireEvent.pointerLeave(button);

    expect(mockOnNoteEnd).toHaveBeenCalledTimes(1);
    expect(mockOnNoteEnd).toHaveBeenCalledWith('C4');
  });

  it('does not call onNoteEnd on pointer leave when not pressed', () => {
    render(
      <PianoKey
        note="C4"
        isSharp={false}
        isActive={false}
        onNoteStart={mockOnNoteStart}
        onNoteEnd={mockOnNoteEnd}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.pointerLeave(button);

    expect(mockOnNoteEnd).not.toHaveBeenCalled();
  });

  it('prevents double trigger on repeated pointer down', () => {
    render(
      <PianoKey
        note="C4"
        isSharp={false}
        isActive={false}
        onNoteStart={mockOnNoteStart}
        onNoteEnd={mockOnNoteEnd}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.pointerDown(button);
    fireEvent.pointerDown(button);

    expect(mockOnNoteStart).toHaveBeenCalledTimes(1);
  });

  it('renders label when provided', () => {
    render(
      <PianoKey
        note="C4"
        isSharp={false}
        isActive={false}
        onNoteStart={mockOnNoteStart}
        onNoteEnd={mockOnNoteEnd}
        label="a"
      />
    );

    expect(screen.getByText('a')).toBeDefined();
  });

  it('has correct aria-label', () => {
    render(
      <PianoKey
        note="C4"
        isSharp={false}
        isActive={false}
        onNoteStart={mockOnNoteStart}
        onNoteEnd={mockOnNoteEnd}
        label="a"
      />
    );

    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-label')).toBe('C4 key (a)');
  });

  it('has aria-label without keyboard hint when no label', () => {
    render(
      <PianoKey
        note="C4"
        isSharp={false}
        isActive={false}
        onNoteStart={mockOnNoteStart}
        onNoteEnd={mockOnNoteEnd}
      />
    );

    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-label')).toBe('C4 key');
  });
});
