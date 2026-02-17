import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { StravaCard } from "../../src/components/Strava/StravaCard";
import { EffectsProvider } from "../../src/contexts/EffectsContext";

const mockWaveSetMode = vi.fn();
const mockWavePluck = vi.fn();
const mockScheduleReturnToIdle = vi.fn();

vi.mock("../../src/contexts/EffectsContext", async () => {
  const actual = await vi.importActual("../../src/contexts/EffectsContext");
  return {
    ...actual,
    useEffects: () => ({
      waveSetMode: mockWaveSetMode,
      wavePluck: mockWavePluck,
      scheduleReturnToIdle: mockScheduleReturnToIdle,
      onPianoActivity: vi.fn(),
      isMuted: false,
      setIsMuted: vi.fn(),
      activeSection: "hero",
      setActiveSection: vi.fn(),
      waveEngineRef: { current: null },
      pianoEngineRef: { current: null },
      initPianoEngine: vi.fn(),
    }),
  };
});

vi.mock("../../src/hooks/useStravaData", () => ({
  useStravaData: () => ({
    stats: {
      totalDistance: 50000,
      totalRuns: 50,
      totalTime: 360000,
      ytdDistance: 25000,
      ytdRuns: 25,
      recentDistance: 10000,
      recentRuns: 5,
    },
    activities: mockActivities,
    isLoading: false,
    isAvailable: true,
    error: null,
    isStale: false,
    lastUpdated: new Date().toISOString(),
  }),
}));

const mockActivities = [
  {
    id: 1,
    name: "Morning Run",
    type: "Run",
    distance: 5200,
    moving_time: 1800,
    start_date: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 2,
    name: "Trail Run",
    type: "Run",
    distance: 8100,
    moving_time: 3000,
    start_date: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 3,
    name: "Easy Run",
    type: "Run",
    distance: 4000,
    moving_time: 1440,
    start_date: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

function renderWithProviders(ui: React.ReactElement) {
  return render(<EffectsProvider>{ui}</EffectsProvider>);
}

describe("StravaCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders running stats", () => {
    renderWithProviders(<StravaCard />);
    expect(screen.getByText("Running")).toBeInTheDocument();
    expect(screen.getAllByText("50.0 km")[0]).toBeInTheDocument();
    expect(screen.getAllByText("50 runs")[0]).toBeInTheDocument();
  });

  it("triggers ECG mode on hover", () => {
    renderWithProviders(<StravaCard />);
    const cards = screen.getAllByRole("region", {
      name: /running statistics/i,
    });
    const card = cards[0]!;

    fireEvent.mouseEnter(card);
    expect(mockWaveSetMode).toHaveBeenCalledWith("ecg");

    fireEvent.mouseLeave(card);
    expect(mockScheduleReturnToIdle).toHaveBeenCalled();
  });

  it("shows heartbeat indicator when hovered", async () => {
    renderWithProviders(<StravaCard />);
    const cards = screen.getAllByRole("region", {
      name: /running statistics/i,
    });
    const card = cards[0]!;

    fireEvent.mouseEnter(card);
    const pulse = card.querySelector('[class*="pulse"]');
    expect(pulse).toBeInTheDocument();

    fireEvent.mouseLeave(card);
    await waitFor(() => {
      const cardsAfter = screen.getAllByRole("region", {
        name: /running statistics/i,
      });
      expect(
        cardsAfter[0]!.querySelector('[class*="pulse"]'),
      ).not.toBeInTheDocument();
    });
  });

  it("displays recent activities", () => {
    renderWithProviders(<StravaCard />);
    expect(screen.getAllByText("Recent Activities").length).toBeGreaterThan(0);
    expect(screen.getByText("Morning Run")).toBeInTheDocument();
    expect(screen.getByText("Trail Run")).toBeInTheDocument();
    expect(screen.getByText("Easy Run")).toBeInTheDocument();
  });

  it("displays activity distances", () => {
    renderWithProviders(<StravaCard />);
    expect(screen.getAllByText("5.2 km").length).toBeGreaterThan(0);
    expect(screen.getAllByText("8.1 km").length).toBeGreaterThan(0);
    expect(screen.getAllByText("4.0 km").length).toBeGreaterThan(0);
  });

  it("displays relative dates for activities", () => {
    renderWithProviders(<StravaCard />);
    expect(screen.getAllByText("Yesterday").length).toBeGreaterThan(0);
  });
});

describe("StravaCard states", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    cleanup();
  });

  afterEach(() => {
    cleanup();
    vi.resetModules();
  });

  it("shows loading state", async () => {
    vi.doMock("../../src/hooks/useStravaData", () => ({
      useStravaData: () => ({
        stats: null,
        activities: [],
        isLoading: true,
        isAvailable: false,
        error: null,
        isStale: false,
        lastUpdated: null,
      }),
    }));

    const { StravaCard: FreshStravaCard } =
      await import("../../src/components/Strava/StravaCard");
    const { EffectsProvider: FreshEffectsProvider } =
      await import("../../src/contexts/EffectsContext");
    render(<FreshEffectsProvider>{<FreshStravaCard />}</FreshEffectsProvider>);
    expect(screen.getByText("Loading stats...")).toBeInTheDocument();
  });

  it("shows stale indicator when data is stale", async () => {
    vi.doMock("../../src/hooks/useStravaData", () => ({
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
        activities: mockActivities,
        isLoading: false,
        isAvailable: true,
        error: null,
        isStale: true,
        lastUpdated: new Date(Date.now() - 86400000).toISOString(),
      }),
    }));

    const { StravaCard: FreshStravaCard } =
      await import("../../src/components/Strava/StravaCard");
    const { EffectsProvider: FreshEffectsProvider } =
      await import("../../src/contexts/EffectsContext");
    render(<FreshEffectsProvider>{<FreshStravaCard />}</FreshEffectsProvider>);
    expect(screen.getByText("Using cached data")).toBeInTheDocument();
  });

  it("shows error state when fetch fails and no cache", async () => {
    vi.doMock("../../src/hooks/useStravaData", () => ({
      useStravaData: () => ({
        stats: null,
        activities: [],
        isLoading: false,
        isAvailable: false,
        error: "Failed to fetch data",
        isStale: false,
        lastUpdated: null,
      }),
    }));

    const { StravaCard: FreshStravaCard } =
      await import("../../src/components/Strava/StravaCard");
    const { EffectsProvider: FreshEffectsProvider } =
      await import("../../src/contexts/EffectsContext");
    render(<FreshEffectsProvider>{<FreshStravaCard />}</FreshEffectsProvider>);
    expect(screen.getByText("Failed to fetch data")).toBeInTheDocument();
    expect(screen.getByText("Connect Strava")).toBeInTheDocument();
  });

  it("shows no activities message when list is empty", async () => {
    vi.doMock("../../src/hooks/useStravaData", () => ({
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
        activities: [],
        isLoading: false,
        isAvailable: true,
        error: null,
        isStale: false,
        lastUpdated: new Date().toISOString(),
      }),
    }));

    const { StravaCard: FreshStravaCard } =
      await import("../../src/components/Strava/StravaCard");
    const { EffectsProvider: FreshEffectsProvider } =
      await import("../../src/contexts/EffectsContext");
    render(<FreshEffectsProvider>{<FreshStravaCard />}</FreshEffectsProvider>);
    expect(screen.getByText("No recent activities")).toBeInTheDocument();
  });
});
