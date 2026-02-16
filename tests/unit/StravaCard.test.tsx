import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StravaCard } from '../../src/components/Strava/StravaCard';
import { EffectsProvider } from '../../src/contexts/EffectsContext';

const mockWaveSetHeartbeat = vi.fn();
const mockWavePluck = vi.fn();

vi.mock('../../src/contexts/EffectsContext', async () => {
  const actual = await vi.importActual('../../src/contexts/EffectsContext');
  return {
    ...actual,
    useEffects: () => ({
      waveSetHeartbeat: mockWaveSetHeartbeat,
      wavePluck: mockWavePluck,
      isMuted: false,
      setIsMuted: vi.fn(),
      activeSection: 'hero',
      setActiveSection: vi.fn(),
      waveEngineRef: { current: null },
      pianoEngineRef: { current: null },
    }),
  };
});

vi.mock('../../src/hooks/useStravaData', () => ({
  useStravaData: () => ({
    stats: {
      totalDistance: 100000,
      totalRuns: 50,
      totalTime: 360000,
      ytdDistance: 50000,
      ytdRuns: 25,
      recentDistance: 10000,
      recentRuns: 5,
    },
    isLoading: false,
    isAvailable: true,
    error: null,
  }),
}));

function renderWithProviders(ui: React.ReactElement) {
  return render(<EffectsProvider>{ui}</EffectsProvider>);
}

describe('StravaCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders running stats', () => {
    renderWithProviders(<StravaCard />);
    expect(screen.getByText('Running')).toBeInTheDocument();
    expect(screen.getAllByText('50.0 km')[0]).toBeInTheDocument();
    expect(screen.getAllByText('50 runs')[0]).toBeInTheDocument();
  });

  it('triggers heartbeat on hover', () => {
    renderWithProviders(<StravaCard />);
    const cards = screen.getAllByRole('region', { name: /running statistics/i });
    const card = cards[0]!;

    fireEvent.mouseEnter(card);
    expect(mockWaveSetHeartbeat).toHaveBeenCalledWith(true);

    fireEvent.mouseLeave(card);
    expect(mockWaveSetHeartbeat).toHaveBeenCalledWith(false);
  });

  it('shows heartbeat indicator when hovered', async () => {
    renderWithProviders(<StravaCard />);
    const cards = screen.getAllByRole('region', { name: /running statistics/i });
    const card = cards[0]!;

    fireEvent.mouseEnter(card);
    const pulse = card.querySelector('[class*="pulse"]');
    expect(pulse).toBeInTheDocument();

    fireEvent.mouseLeave(card);
    await waitFor(() => {
      const cardsAfter = screen.getAllByRole('region', { name: /running statistics/i });
      expect(cardsAfter[0]!.querySelector('[class*="pulse"]')).not.toBeInTheDocument();
    });
  });
});
