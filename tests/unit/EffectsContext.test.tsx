import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { useEffects, EffectsProvider } from '../../src/contexts/EffectsContext';

function TestComponent({ onEffects }: { onEffects: (effects: ReturnType<typeof useEffects>) => void }) {
  const effects = useEffects();
  onEffects(effects);
  return <div>Test</div>;
}

describe('EffectsContext', () => {
  describe('useEffects', () => {
    it('throws when used outside provider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<TestComponent onEffects={() => {}} />);
      }).toThrow('useEffects must be used within an EffectsProvider');
      
      consoleError.mockRestore();
    });

    it('provides effects controller when inside provider', () => {
      let effectsController: ReturnType<typeof useEffects> | undefined;
      
      render(
        <EffectsProvider>
          <TestComponent onEffects={(e) => { effectsController = e; }} />
        </EffectsProvider>
      );

      expect(effectsController).toBeDefined();
      expect(effectsController?.wavePluck).toBeTypeOf('function');
      expect(effectsController?.waveSetHeartbeat).toBeTypeOf('function');
      expect(effectsController?.waveSetMode).toBeTypeOf('function');
      expect(effectsController?.isMuted).toBe(false);
      expect(effectsController?.activeSection).toBe('hero');
    });
  });

  describe('wavePluck', () => {
    it('calls engine method when waveEngineRef is set', () => {
      let effectsController: ReturnType<typeof useEffects> | undefined;
      
      render(
        <EffectsProvider>
          <TestComponent onEffects={(e) => { effectsController = e; }} />
        </EffectsProvider>
      );

      const mockEngine = {
        pluck: vi.fn(),
        setHeartbeat: vi.fn(),
        setMode: vi.fn(),
        getMode: vi.fn().mockReturnValue('idle'),
        setColor: vi.fn(),
        updateViewport: vi.fn(),
        destroy: vi.fn(),
      };

      effectsController!.waveEngineRef.current = mockEngine;
      effectsController!.wavePluck(0.5);

      expect(mockEngine.pluck).toHaveBeenCalledWith(0.5);
    });
  });

  describe('waveSetHeartbeat', () => {
    it('calls engine method when waveEngineRef is set', () => {
      let effectsController: ReturnType<typeof useEffects> | undefined;
      
      render(
        <EffectsProvider>
          <TestComponent onEffects={(e) => { effectsController = e; }} />
        </EffectsProvider>
      );

      const mockEngine = {
        pluck: vi.fn(),
        setHeartbeat: vi.fn(),
        setMode: vi.fn(),
        getMode: vi.fn().mockReturnValue('idle'),
        setColor: vi.fn(),
        updateViewport: vi.fn(),
        destroy: vi.fn(),
      };

      effectsController!.waveEngineRef.current = mockEngine;
      effectsController!.waveSetHeartbeat(true);

      expect(mockEngine.setHeartbeat).toHaveBeenCalledWith(true);
    });
  });

  describe('waveSetMode', () => {
    it('calls engine setMode method when waveEngineRef is set', () => {
      let effectsController: ReturnType<typeof useEffects> | undefined;
      
      render(
        <EffectsProvider>
          <TestComponent onEffects={(e) => { effectsController = e; }} />
        </EffectsProvider>
      );

      const mockEngine = {
        pluck: vi.fn(),
        setHeartbeat: vi.fn(),
        setMode: vi.fn(),
        getMode: vi.fn().mockReturnValue('idle'),
        setColor: vi.fn(),
        updateViewport: vi.fn(),
        destroy: vi.fn(),
      };

      effectsController!.waveEngineRef.current = mockEngine;
      effectsController!.waveSetMode('ecg');

      expect(mockEngine.setMode).toHaveBeenCalledWith('ecg');
    });

    it('supports oscilloscope mode', () => {
      let effectsController: ReturnType<typeof useEffects> | undefined;
      
      render(
        <EffectsProvider>
          <TestComponent onEffects={(e) => { effectsController = e; }} />
        </EffectsProvider>
      );

      const mockEngine = {
        pluck: vi.fn(),
        setHeartbeat: vi.fn(),
        setMode: vi.fn(),
        getMode: vi.fn().mockReturnValue('idle'),
        setColor: vi.fn(),
        updateViewport: vi.fn(),
        destroy: vi.fn(),
      };

      effectsController!.waveEngineRef.current = mockEngine;
      effectsController!.waveSetMode('oscilloscope');

      expect(mockEngine.setMode).toHaveBeenCalledWith('oscilloscope');
    });
  });
});
