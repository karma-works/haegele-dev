# Implementation Plan: Haegele.dev Portfolio

## Overview

This plan implements the content-plan.md using modern web technologies. Each phase has verifiable outputs through automated testing.

**Architecture:**
- **Pure SPA** - Client-side only, no React Server Components (RSC)
- All rendering happens in the browser via Vite + React
- No server-side hydration or streaming

**Stack:**
- Runtime: Bun (not npm)
- Language: TypeScript (strict mode)
- Frontend: React 19 with TypeScript
- Styling: Modern CSS (CSS Modules, CSS Variables, Container Queries)
- Target: Chrome 120+, Firefox 120+ (ignore Safari/older browsers)
- Testing: Vitest (unit), Playwright (E2E)

**Feature Priority (Core vs Optional):**
| Feature | Priority | Notes |
|---------|----------|-------|
| Pulse Background Wave | **Core** | Primary visual differentiator |
| Piano | Optional Phase 2 | Lazy-loaded, can defer |
| Strava Integration | Optional Phase 2 | Graceful degradation built-in |
| Contact Form | Future TODO | No backend defined yet |

---

## Phase 0: Project Scaffold

**Tasks:**
1. Initialize Bun project with TypeScript strict mode
2. Configure Vite for development and build
3. Set up React 19 with TypeScript
4. Configure CSS with modern features (nesting, container queries)
5. Set up testing infrastructure (Vitest + Playwright)
6. Configure linting (ESLint + typescript-eslint)
7. Create responsive utilities and breakpoints
8. **Create EffectsController context** - Central coordinator for cross-feature effects
9. **Implement ReduceMotionProvider** - Global reduced-motion state

**File Structure:**
```
src/
├── components/
├── contexts/
│   ├── EffectsContext.tsx    // Central effects controller
│   └── ReduceMotionContext.tsx
├── hooks/
├── utils/
│   └── responsive.ts
├── styles/
│   ├── variables.css
│   └── global.css
├── types/
├── App.tsx
└── main.tsx
tests/
├── unit/
└── e2e/
```

**Configuration Files:**
- `tsconfig.json` (strict: true, noImplicitAny: true)
- `vite.config.ts`
- `vitest.config.ts`
- `playwright.config.ts`
- `.eslintrc.json`

**Verification:**
- [ ] `bun run typecheck` passes with 0 errors
- [ ] `bun run build` produces valid output
- [ ] `bun test` runs (even with 0 tests)
- [ ] Playwright browsers installed

#### 0.1 EffectsController (Central Coordinator)

**Purpose:** Replace ad-hoc event buses with a single, typed context for cross-feature coordination.

**API:**
```typescript
interface EffectsController {
  // Wave effects
  wavePluck(intensity: number): void;
  waveSetHeartbeat(active: boolean): void;
  
  // State (high-level toggles only)
  isMuted: boolean;
  setIsMuted(value: boolean): void;
  activeSection: string;
  setActiveSection(section: string): void;
  
  // Engine refs (stored in refs, not state)
  waveEngineRef: React.MutableRefObject<WaveEngine | null>;
  pianoEngineRef: React.MutableRefObject<PianoEngine | null>;
}

const EffectsContext = createContext<EffectsController | null>(null);
const useEffects = () => useContext(EffectsContext);
```

**Verification:**
- [ ] Unit test: `useEffects` throws when used outside provider
- [ ] Unit test: `wavePluck` calls engine method

#### 0.2 ReduceMotionProvider

**Purpose:** Global reduced-motion state with CSS and JS integration.

**Implementation:**
```typescript
interface ReduceMotionContextValue {
  isReducedMotion: boolean;  // True if prefers-reduced-motion
  disableNonCritical: boolean; // User can toggle this separately
}

// CSS integration
:root {
  --animation-duration-multiplier: 1;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --animation-duration-multiplier: 0;
  }
}

// JS hook
const useReducedMotion = () => {
  const { isReducedMotion, disableNonCritical } = useContext(ReduceMotionContext);
  return { 
    shouldAnimate: !isReducedMotion,
    shouldAnimateNonCritical: !isReducedMotion && !disableNonCritical 
  };
};
```

**Non-Critical Animations (disabled in reduce-motion):**
- Magnetic hover effects
- Particle effects
- Parallax backgrounds
- 3D card tilts

**Critical Animations (always enabled, simplified):**
- Page transitions
- Form validation feedback
- Focus indicators

**Verification:**
- [ ] Unit test: `useReducedMotion` returns correct values
- [ ] E2E test: `prefers-reduced-motion: reduce` disables non-critical animations
- [ ] E2E test: ReduceMotionProvider can be tested via data attribute

---

## Phase 1: Core Visual Differentiator

This phase focuses on the **pulse wave background** as the primary visual differentiator. Piano and Strava are moved to Phase 1.5 (optional).

### 1.1 Pulse Background Engine (CORE)

**Description:** Canvas-based sinusoidal wave that responds to multiple inputs with proportional responsive scaling.

#### 1.1.1 Core Wave Rendering

**Tasks:**
- Set up Canvas element with proper sizing
- Implement base sine wave animation (60fps)
- Create wave point calculation with configurable parameters
- Implement smooth render loop with requestAnimationFrame

**Files:**
```
src/
├── components/PulseBackground/
│   ├── PulseBackground.tsx
│   ├── PulseBackground.module.css
│   └── types.ts
├── utils/
│   └── waveMath.ts
tests/unit/
└── waveMath.test.ts
```

**Verification:**
- [ ] Unit test: `waveMath.sineWave()` generates correct points
- [ ] Unit test: `waveMath.lerp()` returns correct interpolated values
- [ ] E2E test: Canvas renders on page load

#### 1.1.2 Proportional Responsive Scaling

**Tasks:**
- Implement viewport-aware amplitude scaling
- Implement proportional wavelength scaling
- Ensure amplitude:wavelength ratio maintained (~1:8)
- Add stroke and glow proportional scaling

**Files:**
```
src/
├── components/PulseBackground/
│   └── useWaveScaling.ts
tests/unit/
└── useWaveScaling.test.ts
```

**Verification:**
- [ ] Unit test: `useWaveScaling` maintains amplitude:wavelength ratio across viewports
- [ ] Unit test: `useWaveScaling` returns proportional values for mobile
- [ ] E2E test: Mobile viewport shows proportional wave (not stretched)
- [ ] E2E test: Wave amplitude scales with viewport height

#### 1.1.3 Wave State & Transitions

**Tasks:**
- Implement lerp-based state transitions
- Add color transitions (mint → pink based on scroll)
- Add `prefers-reduced-motion` support
- Create state machine for wave modes

**Files:**
```
src/
├── components/PulseBackground/
│   └── useWaveEngine.ts
tests/unit/
└── useWaveEngine.test.ts
```

**Verification:**
- [ ] Unit test: `useWaveEngine` responds to `pluck()` within 1 frame
- [ ] E2E test: `prefers-reduced-motion` reduces animation speed
- [ ] E2E test: Performance: Frame time < 16ms (60fps)

#### 1.1.4 Integration Hooks

**Tasks:**
- Connect to EffectsController context (replaces event bus)
- Wave responds to EffectsController signals
- Mouse proximity effect

**State Management Pattern:**
- **Refs**: Store Engine instances (WaveEngine) in EffectsController to avoid re-renders
- **State**: Only for high-level toggles (isMuted, activeSection) in EffectsController

**Verification:**
- [ ] Unit test: Wave responds to `wavePluck()` from EffectsController
- [ ] Unit test: Wave responds to `waveSetHeartbeat()` from EffectsController

**API:**
```typescript
interface WaveEngine {
  pluck(intensity: number): void;
  setHeartbeat(active: boolean): void;
  setColor(color: string): void;
  updateViewport(width: number, height: number): void;
  destroy(): void;
}

interface WaveScaling {
  amplitude: number;
  wavelength: number;
  strokeWidth: number;
  glowRadius: number;
}

// Integration via EffectsController
// See Phase 0.1 for full EffectsController API
```

---

## Phase 1.5: Optional Enhancements (Piano + Strava)

**These features are optional and can be deferred to Phase 2 or later.**

### 1.5.1 Web Piano Engine (OPTIONAL)

**Description:** Polyphonic audio synthesis using Tone.js with visual sync and responsive octave reduction.

**Bundle Size Mitigation:**
Tone.js is ~200KB. To avoid impacting initial load:
- **Lazy-load Tone.js** on first piano interaction
- **Dynamic import**: `const { PolySynth } = await import('tone')`
- **Separate chunk**: Vite automatically code-splits dynamic imports
- **Loading state**: Show "Click to activate" placeholder until loaded

#### 1.5.1.1 Audio Synthesis Core (Lazy-Loaded)

**Tasks:**
- Create `loadPianoEngine()` async factory that dynamically imports Tone.js
- Set up Tone.js PolySynth with triangle oscillator (only after load)
- Configure ADSR envelope (Attack: 0.005s, Decay: 1.2s, Sustain: 0.1, Release: 1.0s)
- Implement note frequency calculation
- Handle audio context resume on user gesture

**Lazy Loading Pattern:**
```typescript
// src/components/Piano/loadPianoEngine.ts
let pianoEnginePromise: Promise<PianoEngine> | null = null;

export async function loadPianoEngine(): Promise<PianoEngine> {
  if (!pianoEnginePromise) {
    pianoEnginePromise = (async () => {
      const { PolySynth, start } = await import('tone');
      await start(); // Resume audio context
      return createPianoEngine(PolySynth);
    })();
  }
  return pianoEnginePromise;
}

// Usage in component
const handleFirstInteraction = async () => {
  const engine = await loadPianoEngine();
  setEngineLoaded(true);
};
```

**Files:**
```
src/
├── components/Piano/
│   ├── loadPianoEngine.ts    // Dynamic import wrapper
│   ├── usePianoEngine.ts
│   └── types.ts
tests/unit/
└── usePianoEngine.test.ts
```

**Verification:**
- [ ] Unit test: `loadPianoEngine` returns valid engine
- [ ] Unit test: Note frequencies calculated correctly
- [ ] E2E test: Piano engine is invoked on first click (mock Web Audio)
- [ ] E2E test: Tone.js is NOT in initial bundle (check network requests)

**E2E Audio Testing (Mocked):**
```typescript
// Don't test real audio - mock Web Audio API
beforeEach(() => {
  // Monkey-patch Web Audio for testing
  window.AudioContext = vi.fn().mockImplementation(() => ({
    createOscillator: vi.fn(),
    createGain: vi.fn(),
    // ... minimal mock
  }));
});

test('piano click invokes sound engine', async () => {
  const playSpy = vi.fn();
  render(<Piano onPlay={playSpy} />);
  await user.click(screen.getByRole('button', { name: /C3/ }));
  expect(playSpy).toHaveBeenCalledWith('C3');
});
```

#### 1.5.1.2 Keyboard Input Mapping

**Tasks:**
- Map computer keyboard (A-L keys) to notes
- Handle modifier keys for sharps/flats
- Implement touch velocity simulation
- Connect to EffectsController for visual sync (replaces event bus)

**Files:**
```
src/
├── components/Piano/
│   └── keyMap.ts
tests/unit/
└── keyMap.test.ts
```

**Verification:**
- [ ] Unit test: `keyMap` maps keyboard keys to correct notes
- [ ] E2E test: Keyboard shortcut triggers correct note

#### 1.5.1.3 Responsive Key Ranges

**Tasks:**
- Define key ranges for each breakpoint
- Implement viewport detection for key count
- **Desktop/Tablet**: Start from C2 (normal piano keyboard range)
- **Mobile only**: Start from C3 for better mobile UX
- Handle dynamic key count changes on resize

**Files:**
```
src/
├── components/Piano/
│   ├── keyRanges.ts
│   └── useResponsiveKeys.ts
tests/unit/
├── keyRanges.test.ts
└── useResponsiveKeys.test.ts
```

**Verification:**
- [ ] Unit test: `keyRanges` returns correct keys for each breakpoint
- [ ] Unit test: `useResponsiveKeys` returns C2 for desktop/tablet, C3 for mobile
- [ ] E2E test: Mobile viewport shows fewer keys starting from C3
- [ ] E2E test: Tablet viewport shows keys starting from C2
- [ ] E2E test: Desktop viewport shows keys starting from C2

#### 1.5.1.4 Piano UI Component

**Tasks:**
- Create PianoKey component with visual states
- Build Piano container with responsive layout
- Handle mouse/touch events
- Integrate with audio engine

**Files:**
```
src/
├── components/Piano/
│   ├── Piano.tsx
│   ├── PianoKey.tsx
│   └── Piano.module.css
tests/e2e/
└── piano.spec.ts
```

**API:**
```typescript
interface PianoEngine {
  play(note: string, velocity?: number): void;
  stop(note: string): void;
  onNoteTrigger(callback: (freq: number) => void): void;
  destroy(): void;
}

interface ResponsiveKeys {
  keys: PianoKeyConfig[];
  octaveCount: number;
  startNote: string; // C2 for desktop/tablet, C3 for mobile
}
```

### 1.5.2 Strava Integration (OPTIONAL)

**Description:** Card hover triggers heartbeat waveform mode via EffectsController.

**Features:**
- Mouse enter/leave detection
- 300ms lerp transition to/from heartbeat
- Heartbeat at ~80 BPM (1.3Hz)
- PQR spike simulation in waveform
- Connects to EffectsController.waveSetHeartbeat()

**Graceful Degradation:**
If Strava data is unavailable, the Running hobbies card shows:
- Fallback message: "Running stats temporarily unavailable"
- Still shows static running icon (no live data)
- Heartbeat hover effect still works (doesn't depend on API)

**Files:**
```
src/
├── components/StravaCard/
│   ├── StravaCard.tsx
│   ├── StravaCard.module.css
│   └── types.ts
├── hooks/
│   └── useHeartbeatTrigger.ts
tests/unit/
└── useHeartbeatTrigger.test.ts
tests/e2e/
└── strava-hover.spec.ts
```

**Verification:**
- [ ] Unit test: `useHeartbeatTrigger` calls EffectsController.waveSetHeartbeat()
- [ ] E2E test: Hover over Strava card triggers heartbeat mode
- [ ] E2E test: Wave transitions smoothly (no flicker)
- [ ] E2E test: Mouse leave restores sine wave within 500ms
- [ ] E2E test: Card shows fallback message when data unavailable

---

## Phase 2: Layout & Navigation

### 2.1 Polyglot Navigation

#### 2.1.1 Desktop Navigation

**Tasks:**
- Create glassmorphic background component
- Implement language cycling on hover
- Add glow effect on active/hover state
- Create accessible keyboard navigation

**Files:**
```
src/
├── components/Navigation/
│   ├── Navigation.tsx
│   ├── NavLink.tsx
│   ├── Navigation.module.css
│   └── translations.ts
tests/unit/
└── translations.test.ts
```

**Verification:**
- [ ] Unit test: Translation cycles through all languages
- [ ] E2E test: Hover cycles link text through languages
- [ ] E2E test: Active link has visual indicator

#### 2.1.2 Mobile Navigation

**Tasks:**
- Create hamburger menu component
- Implement slide-out drawer
- Handle touch gestures
- Ensure touch targets >= 44px

**Verification:**
- [ ] E2E test: Mobile menu opens/closes
- [ ] E2E test: Touch targets meet minimum size

### 2.2 Hero Section (Terminal)

#### 2.2.1 Terminal Component

**Tasks:**
- Build terminal window with macOS traffic lights
- Create glassmorphic overlay
- Implement typed greeting animation
- Add smooth scroll indicator

**Files:**
```
src/
├── components/Hero/
│   ├── Hero.tsx
│   ├── Terminal.tsx
│   ├── TypedText.tsx
│   ├── Hero.module.css
│   └── types.ts
├── hooks/
│   └── useTypewriter.ts
tests/unit/
└── useTypewriter.test.ts
```

**Verification:**
- [ ] Unit test: `useTypewriter` types and deletes correctly
- [ ] E2E test: Terminal appears on page load
- [ ] E2E test: Typed animation plays

#### 2.2.2 Live Stats Component

**Tasks:**
- Create animated commit counter
- Implement learning ticker
- Handle responsive layout for stats

**Files:**
```
src/
├── components/Hero/
│   └── LiveStats.tsx
tests/unit/
└── LiveStats.test.tsx
```

**Verification:**
- [ ] Unit test: `LiveStats` formats numbers correctly
- [ ] E2E test: Stats counter animates from 0

---

## Phase 3: Content Sections

### 3.1 About Section

**Tasks:**
- Build split layout component
- Implement scroll-triggered fade-in
- Create highlighted text effect
- Add parallax background
- Handle mobile single-column layout

**Verification:**
- [ ] E2E test: Section visible after scroll
- [ ] E2E test: Text highlights on scroll

### 3.2 Skills Section

**Tasks:**
- Create interactive grid cards
- Implement magnetic hover effect
- Add staggered scroll reveal
- Create category icons
- Handle responsive grid layout

**Verification:**
- [ ] E2E test: Cards have magnetic hover effect
- [ ] E2E test: Staggered animation on scroll

### 3.3 Projects Section

**Tasks:**
- Build Git log-style layout
- Implement 3D tilt effect on hover
- Create clip-path reveal animation
- Add glassmorphic backgrounds
- Handle single-column mobile layout
- **Mobile**: Disable 3D tilt to prevent touch interference with link clicks
- Use `touch-action` and pointer media queries to distinguish touch vs hover

**Mobile Touch Handling:**
- Disable 3D tilt on `pointer: coarse` devices
- Prevent `touchstart` from triggering hover effects that block clicks
- Ensure links remain fully clickable on mobile

**Verification:**
- [ ] E2E test: Project cards render
- [ ] E2E test: 3D tilt effect on hover (desktop)
- [ ] E2E test: Links are clickable on mobile (no tilt interference)
- [ ] E2E test: Touch targets meet minimum size

### 3.4 Hobbies Section (Trifecta)

**Tasks:**
- Create three-column glassmorphic cards
- Build Strava stats widget
- Create mini interactive keyboard
- Build language progress bars
- Handle stacked mobile layout

**Verification:**
- [ ] E2E test: All three cards visible
- [ ] E2E test: Piano keys playable
- [ ] E2E test: Language bars animate

### 3.5 Contact Section

**Tasks:**
- Build clean centered layout
- Implement magnetic input fields
- Create form validation
- Add success particle burst
- Handle mobile form layout

**Future TODO - Backend Not Defined:**
The contact form currently has no backend. Options to consider:
- Email service (Resend, SendGrid)
- Form service (Formspree, Netlify Forms)
- Serverless function (Vercel, Cloudflare Workers)
- For MVP: Fake success state with console.log

**Verification:**
- [ ] E2E test: Form validates email
- [ ] E2E test: Submit shows success state (mocked)

### 3.6 Footer

**Tasks:**
- Build responsive footer layout
- Integrate interactive piano keyboard
- Implement theme color shifts on key press
- Add copyright and links

**Verification:**
- [ ] E2E test: Footer piano keys produce sound
- [ ] E2E test: Key press changes accent color

---

## Phase 4: Strava API Integration (OPTIONAL)

**Graceful Degradation Design:**

This phase is designed to fail gracefully without breaking the build or site:

```
┌─────────────────────────────────────────────────────────────┐
│ Build-Time Fetch Flow                                       │
├─────────────────────────────────────────────────────────────┤
│ 1. Try fetch from Strava API                                │
│    ↓ SUCCESS: Save to cache + build continues               │
│    ↓ FAIL: Check for existing cache                         │
│              ↓ HAS CACHE: Use cached data + build continues │
│              ↓ NO CACHE: Build with empty data + show       │
│                         fallback UI at runtime              │
└─────────────────────────────────────────────────────────────┘
```

**Tasks:**
- Implement OAuth flow (manual, one-time)
- Create token refresh utility
- Build build-time data fetch script with fallback
- Create activity display component
- Add hover heartbeat integration via EffectsController

**Cache Strategy (Last Successful Cache):**
```typescript
// scripts/fetch-strava-data.ts
interface StravaCache {
  data: StravaActivity[];
  fetchedAt: string;  // ISO timestamp
  expiresAt: string;  // ISO timestamp (24h later)
}

async function fetchWithFallback(): Promise<StravaCache | null> {
  try {
    const data = await fetchFromStrava();
    const cache = { data, fetchedAt: new Date().toISOString(), expiresAt: ... };
    await writeFile('src/data/strava-cache.json', JSON.stringify(cache));
    return cache;
  } catch (error) {
    console.warn('Strava fetch failed, checking cache...');
    const existingCache = await readCache();
    if (existingCache && !isExpired(existingCache)) {
      console.log('Using cached Strava data from', existingCache.fetchedAt);
      return existingCache;
    }
    console.warn('No valid cache, Strava data unavailable');
    return null; // Runtime will show fallback UI
  }
}
```

**Files:**
```
src/
├── lib/strava/
│   ├── client.ts
│   ├── types.ts
│   └── cache.ts
├── data/
│   └── strava-cache.json      # Generated at build time
├── components/StravaWidget/
│   ├── StravaWidget.tsx
│   ├── StravaWidget.module.css
│   └── types.ts
scripts/
└── fetch-strava-data.ts
```

**Runtime Behavior:**
```typescript
// StravaWidget.tsx
const stravaData = await import('../data/strava-cache.json');

if (!stravaData?.data?.length) {
  return <StravaFallback message="Running stats temporarily unavailable" />;
}
```

**Verification:**
- [ ] Unit test: Strava client types are correct
- [ ] Unit test: Cache fallback logic works
- [ ] E2E test: Widget displays cached data
- [ ] E2E test: Widget shows fallback when no data
- [ ] E2E test: Hover triggers heartbeat mode via EffectsController
- [ ] Build test: Build succeeds even when Strava API is down

---

## Phase 5: Polish & Performance

### 5.1 Performance Optimization

**Tasks:**
- Optimize bundle size
- Implement code splitting (Tone.js lazy-loaded separately)
- Add lazy loading for images
- Optimize canvas rendering
- Add service worker for caching (optional)

**Performance Targets (Monitoring, Not Test Gates):**

These are **targets to monitor**, not red/green CI test gates. CI will report metrics but not fail builds:

| Metric | Target | CI Behavior |
|--------|--------|-------------|
| Lighthouse Performance | > 90 | Report, don't fail |
| First Contentful Paint | < 1s | Report, don't fail |
| Largest Contentful Paint | < 2s | Report, don't fail |
| Cumulative Layout Shift | < 0.1 | Report, don't fail |
| Total Blocking Time | < 200ms | Report, don't fail |
| Frame Rate (Wave) | ~60fps | Report, don't fail |

**Bundle Size Targets:**
| Chunk | Target Size | Notes |
|-------|-------------|-------|
| Main bundle | < 100KB | Initial load |
| Tone.js chunk | ~200KB | Lazy-loaded on piano interaction |
| Total (with piano) | < 350KB | After all lazy loads |

**Verification:**
- [ ] Performance metrics reported in CI
- [ ] Bundle size warnings if main > 100KB
- [ ] Manual Lighthouse audit > 90 (not CI gate)

### 5.2 Accessibility

**Tasks:**
- Ensure WCAG AA contrast ratios
- Complete keyboard navigation
- Test with screen readers
- **ReduceMotionProvider** (see Phase 0.2) - global reduced-motion state
- Add visible focus states

**Reduced Motion Implementation:**
See Phase 0.2 for full ReduceMotionProvider details. Key points:
- Respects `prefers-reduced-motion` media query
- Non-critical animations disabled (magnetic hovers, particles, parallax, 3D tilts)
- Critical animations simplified (page transitions, form feedback)
- Testable via `data-reduced-motion` attribute

**Verification:**
- [ ] WCAG AA contrast ratios
- [ ] Keyboard navigation complete
- [ ] Screen reader tested
- [ ] ReduceMotionProvider tested (see Phase 0.2)
- [ ] Focus states visible

### 5.3 Responsive Testing

**Viewports to Test:**
- Mobile (375px) - simplified animations, 8 piano keys, proportional wave
- Mobile landscape (667px)
- Tablet (768px) - partial effects, 17 piano keys
- Tablet landscape (1024px)
- Desktop (1440px) - full effects, 25 piano keys

**Responsive Assertions:**
- Piano: Key count matches viewport breakpoint
- Piano: Desktop/tablet start from C2, mobile starts from C3
- Wave: Amplitude:wavelength ratio consistent (~1:8)
- Wave: No visual stretching on any viewport

**E2E Test Suite:**
```typescript
tests/e2e/
├── performance.spec.ts    // Lighthouse audits
├── accessibility.spec.ts  // axe-core tests
└── responsive.spec.ts     // Viewport + component tests
```

**Responsive Test Cases:**
```typescript
// piano responsive tests
test('mobile shows 8 white keys starting from C3', ...)
test('tablet shows 17 keys starting from C2', ...)
test('desktop shows 25 keys starting from C2', ...)

// wave responsive tests
test('mobile wave maintains proportional amplitude', ...)
test('wave amplitude scales with viewport height', ...)
test('wave wavelength scales with viewport width', ...)
```

---

## Phase 6: Deployment

**Tasks:**
1. Configure production build
2. Set up CI/CD pipeline (GitHub Actions)
3. Deploy to hosting (Vercel/Cloudflare Pages)
4. Configure custom domain

**Verification:**
- [ ] `bun run build` produces optimized bundle
- [ ] All tests pass in CI
- [ ] Site accessible at haegele.dev
- [ ] HTTPS enabled
- [ ] No console errors

---

## Test Summary

| Phase | Unit Tests | E2E Tests |
|-------|------------|-----------|
| 0: Scaffold | 0 | 1 (smoke) |
| 1.1: Pulse Background | 6 | 6 |
| 1.2: Web Piano | 5 | 8 |
| 1.3: Strava Hover | 1 | 3 |
| 2: Layout | 3 | 5 |
| 3: Content | 2 | 10 |
| 4: Strava | 1 | 2 |
| 5: Polish | 0 | 9 |
| **Total** | **18** | **44** |

### Phase 1 Test Breakdown

**Pulse Background (6 unit, 6 e2e):**
- Unit: sineWave, lerp, useWaveScaling (ratio), useWaveScaling (mobile), useWaveEngine (pluck), useWaveEngine (state)
- E2E: renders, reduced-motion, mobile proportional, amplitude scaling, piano integration, strava integration

**Web Piano (5 unit, 8 e2e):**
- Unit: keyMap, keyRanges, useResponsiveKeys (C2 start), useResponsiveKeys (breakpoints), usePianoEngine
- E2E: sound, keyboard, polyphony, mobile keys, tablet keys, desktop keys, C2 start, velocity

---

## Dependencies

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tone": "^14.7.77"
  },
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

---

## Commands

```bash
bun install                 # Install dependencies
bun run dev                 # Start dev server
bun run build               # Production build
bun run typecheck           # TypeScript check
bun run lint                # ESLint
bun test                    # Run unit tests
bun run test:e2e            # Run Playwright tests
bun run test:e2e:ui         # Playwright UI mode
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Web Audio browser differences | Target Chrome/Firefox only, test both |
| Canvas performance on mobile | Reduce point density, use will-change |
| Strava API rate limits | Build-time fetch with caching |
| Animation jank | Single RAF loop, CSS transforms only |
| Memory leaks | Dispose audio nodes, cleanup event listeners |

---

## Biggest Risks & Challenges

### Technical Risks

| Risk | Severity | Description | Mitigation Strategy |
|------|----------|-------------|---------------------|
| **Web Audio API Complexity** | High | Browser differences in audio context handling, autoplay policies, and latency can cause inconsistent piano behavior across browsers | Target Chrome 120+ and Firefox 120+ only; implement robust audio context resume on user gesture; test extensively on both browsers |
| **Canvas Performance on Mobile** | High | 60fps sine wave rendering may cause jank on low-end mobile devices, especially with multiple effects active | Reduce point density on mobile; use `will-change` sparingly; implement frame skipping when needed; offer reduced-motion mode |
| **Responsive Wave Proportions** | Medium | Maintaining visual wave balance (amplitude:wavelength ratio) across all viewport sizes is mathematically complex | Use CSS `clamp()` with viewport-relative units; extensive automated testing at all breakpoints |
| **Tone.js Bundle Size** | Medium | Tone.js is a large library (~200KB) that could impact initial load performance | Lazy-load Tone.js only when user interacts with piano; consider lighter alternatives if needed |
| **Memory Leaks** | Medium | Audio nodes, event listeners, and animation frames can cause memory leaks if not properly cleaned up | Implement strict cleanup in `useEffect` returns; use AbortController for event listeners; test with Chrome DevTools memory profiler |

### Integration Risks

| Risk | Severity | Description | Mitigation Strategy |
|------|----------|-------------|---------------------|
| **Strava API Rate Limits** | Low | Strava has strict rate limits (100 requests/15 min) that could block data fetching | Fetch only at build time; cache results locally; implement fallback to static data |
| **Strava Token Expiry** | Medium | OAuth tokens expire and require manual refresh | Implement automated token refresh utility; store refresh tokens securely; document refresh process |
| **Cross-Component State** | Medium | Piano, wave, and Strava components need to communicate (pluck effects, heartbeat mode) without tight coupling | Use event bus pattern; implement clean subscription/unsubscription; avoid prop drilling |

### User Experience Risks

| Risk | Severity | Description | Mitigation Strategy |
|------|----------|-------------|---------------------|
| **Mobile Piano Playability** | High | Touch targets on mobile must be large enough to play comfortably while fitting limited screen space | Minimum 44px touch targets; white keys only on very small screens; always start from C2 for consistency |
| **Reduced Motion Support** | Medium | Users with vestibular disorders need reduced-motion support without breaking functionality | Respect `prefers-reduced-motion` globally; provide static fallbacks; test with accessibility tools |
| **First-Time Audio Context** | Medium | Browsers block audio until user interaction, which can confuse users | Clear visual indication that piano needs a click/tap to activate; graceful degradation |

### Project Risks

| Risk | Severity | Description | Mitigation Strategy |
|------|----------|-------------|---------------------|
| **Scope Creep** | Medium | Multiple complex features (piano, wave, Strava, responsive) could lead to endless refinement | Strict adherence to verification criteria; timebox each phase; defer nice-to-haves |
| **Testing Complexity** | Medium | E2E tests for audio and canvas are inherently flaky and hard to debug | Use visual regression testing; mock Web Audio API for unit tests; parallelize test runs |
| **Browser Compatibility** | Low | Excluding Safari may limit audience but reduces testing surface | Document browser support clearly; show graceful fallback message for unsupported browsers |
