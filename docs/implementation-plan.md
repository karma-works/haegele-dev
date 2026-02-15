# Implementation Plan: Haegele.dev Portfolio

## Overview

This plan implements the content-plan.md using modern web technologies. Each phase has verifiable outputs through automated testing.

**Stack:**
- Runtime: Bun (not npm)
- Language: TypeScript (strict mode)
- Frontend: React 19 with TypeScript
- Styling: Modern CSS (CSS Modules, CSS Variables, Container Queries)
- Target: Chrome 120+, Firefox 120+ (ignore Safari/older browsers)
- Testing: Vitest (unit), Playwright (E2E)

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

**File Structure:**
```
src/
├── components/
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

---

## Phase 1: Core Technical Challenges

**Duration:** 3-4 days

This phase tackles the most complex technical features first.

### 1.1 Pulse Background Engine

**Description:** Canvas-based sinusoidal wave that responds to multiple inputs with proportional responsive scaling.

**Features:**
- Base sine wave animation (60fps)
- Lerp-based state transitions
- Piano integration (pluck effect)
- Strava hover integration (heartbeat mode ~80 BPM)
- Mouse proximity effect
- Color transitions (mint → pink based on scroll)
- `prefers-reduced-motion` support
- **Proportional responsive scaling**

**Responsive Wave Scaling:**
The wave must maintain visual proportions (not just shrink length):

| Property | Scaling Formula | Example (375px vs 1440px) |
|----------|-----------------|---------------------------|
| Amplitude | `clamp(8px, 3vh, 40px)` | 12px vs 40px |
| Wavelength | `clamp(80px, 25vw, 300px)` | 94px vs 360px |
| Stroke | `clamp(1px, 0.15vw, 3px)` | 1px vs 2px |
| Glow | `clamp(5px, 1vw, 20px)` | 5px vs 15px |

**Key Rule:** Amplitude and wavelength scale together to maintain wave shape ratio (~1:8).

**Files:**
```
src/
├── components/PulseBackground/
│   ├── PulseBackground.tsx
│   ├── PulseBackground.module.css
│   ├── useWaveEngine.ts
│   ├── useWaveScaling.ts
│   └── types.ts
├── utils/
│   └── waveMath.ts
tests/unit/
├── waveMath.test.ts
├── useWaveScaling.test.ts
└── useWaveEngine.test.ts
tests/e2e/
└── pulse-background.spec.ts
```

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
```

**Verification:**
- [ ] Unit test: `waveMath.lerp()` returns correct interpolated values
- [ ] Unit test: `waveMath.sineWave()` generates correct points
- [ ] Unit test: `useWaveScaling` maintains amplitude:wavelength ratio across viewports
- [ ] Unit test: `useWaveScaling` returns proportional values for mobile
- [ ] Unit test: `useWaveEngine` responds to `pluck()` within 1 frame
- [ ] E2E test: Canvas renders on page load
- [ ] E2E test: `prefers-reduced-motion` reduces animation speed
- [ ] E2E test: Mobile viewport shows proportional wave (not stretched)
- [ ] E2E test: Wave amplitude scales with viewport height
- [ ] Performance: Frame time < 16ms (60fps) measured via Playwright

### 1.2 Web Piano Engine

**Description:** Polyphonic audio synthesis using Tone.js with visual sync.

**Features:**
- Tone.js PolySynth with triangle oscillator
- ADSR envelope (Attack: 0.005s, Decay: 1.2s, Sustain: 0.1, Release: 1.0s)
- Computer keyboard mapping (A-L keys → C2-C4 on desktop)
- Mouse/touch velocity simulation
- Audio context resume on user gesture
- Event bus for visual sync
- **Responsive octave reduction** (not just shrinking)

**Responsive Piano Strategy:**
| Viewport | Keys | Range | Notes |
|----------|------|-------|-------|
| >1024px | 25 | C2-C4 | Full chromatic |
| 768-1024px | 17 | C2-C3 | Reduced chromatic |
| <768px | 8 | C2-C3 | White keys only (C,D,E,F,G,A,B,C) |

**Files:**
```
src/
├── components/Piano/
│   ├── Piano.tsx
│   ├── PianoKey.tsx
│   ├── Piano.module.css
│   ├── usePianoEngine.ts
│   ├── useResponsiveKeys.ts
│   ├── keyMap.ts
│   ├── keyRanges.ts
│   └── types.ts
├── utils/
│   └── eventBus.ts
tests/unit/
├── keyMap.test.ts
├── keyRanges.test.ts
├── useResponsiveKeys.test.ts
└── usePianoEngine.test.ts
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
  startNote: string; // Always C2
}
```

**Verification:**
- [ ] Unit test: `keyMap` maps keyboard keys to correct notes
- [ ] Unit test: `keyRanges` returns correct keys for each breakpoint
- [ ] Unit test: `useResponsiveKeys` returns C2 as start for all viewports
- [ ] Unit test: `usePianoEngine` creates valid note frequencies
- [ ] E2E test: Clicking piano key produces sound (Web Audio context active)
- [ ] E2E test: Keyboard shortcut triggers correct note
- [ ] E2E test: Polyphony - multiple simultaneous notes don't clip
- [ ] E2E test: Mobile viewport shows fewer keys (8 vs 25)
- [ ] E2E test: Tablet viewport shows reduced keys (17)

### 1.3 Strava Hover Integration

**Description:** Card hover triggers heartbeat waveform mode.

**Features:**
- Mouse enter/leave detection
- 300ms lerp transition to/from heartbeat
- Heartbeat at ~80 BPM (1.3Hz)
- PQR spike simulation in waveform

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
- [ ] Unit test: `useHeartbeatTrigger` toggles state correctly
- [ ] E2E test: Hover over Strava card triggers heartbeat mode
- [ ] E2E test: Wave transitions smoothly (no flicker)
- [ ] E2E test: Mouse leave restores sine wave within 500ms

---

## Phase 2: Layout & Navigation

**Duration:** 2 days

### 2.1 Polyglot Navigation

**Features:**
- Glassmorphic background
- Language cycling on hover (Home → Haus → Maison → Casa → Home)
- Glow effect on active/hover
- Responsive hamburger menu

**Files:**
```
src/
├── components/Navigation/
│   ├── Navigation.tsx
│   ├── NavLink.tsx
│   ├── Navigation.module.css
│   ├── translations.ts
│   └── types.ts
tests/unit/
└── translations.test.ts
tests/e2e/
└── navigation.spec.ts
```

**Verification:**
- [ ] Unit test: Translation cycles through all languages
- [ ] E2E test: Hover cycles link text through languages
- [ ] E2E test: Active link has visual indicator
- [ ] E2E test: Mobile menu opens/closes

### 2.2 Hero Section (Terminal)

**Features:**
- Terminal window styling (macOS traffic lights)
- Typed greeting animation
- Live stats (commits counter, learning ticker)
- Glassmorphic overlay
- Smooth scroll indicator

**Files:**
```
src/
├── components/Hero/
│   ├── Hero.tsx
│   ├── Terminal.tsx
│   ├── TypedText.tsx
│   ├── LiveStats.tsx
│   ├── Hero.module.css
│   └── types.ts
├── hooks/
│   └── useTypewriter.ts
tests/unit/
├── useTypewriter.test.ts
└── LiveStats.test.tsx
tests/e2e/
└── hero.spec.ts
```

**Verification:**
- [ ] Unit test: `useTypewriter` types and deletes correctly
- [ ] Unit test: `LiveStats` formats numbers correctly
- [ ] E2E test: Terminal appears on page load
- [ ] E2E test: Typed animation plays
- [ ] E2E test: Stats counter animates from 0

---

## Phase 3: Content Sections

**Duration:** 3 days

### 3.1 About Section

**Features:**
- Split layout
- Scroll-triggered fade-in
- Highlighted text effect
- Parallax background

**Verification:**
- [ ] E2E test: Section visible after scroll
- [ ] E2E test: Text highlights on scroll

### 3.2 Skills Section

**Features:**
- Interactive grid cards
- Magnetic hover effect
- Staggered scroll reveal
- Category icons

**Verification:**
- [ ] E2E test: Cards have magnetic hover effect
- [ ] E2E test: Staggered animation on scroll

### 3.3 Projects Section

**Features:**
- Git log-style layout
- 3D tilt effect on hover
- Clip-path reveal animation
- Glassmorphic backgrounds

**Verification:**
- [ ] E2E test: Project cards render
- [ ] E2E test: 3D tilt effect on hover
- [ ] E2E test: Links are clickable

### 3.4 Hobbies Section (Trifecta)

**Features:**
- Three-column glassmorphic cards
- Running: Strava stats widget
- Piano: Mini interactive keyboard
- Languages: Progress bars

**Verification:**
- [ ] E2E test: All three cards visible
- [ ] E2E test: Piano keys playable
- [ ] E2E test: Language bars animate

### 3.5 Contact Section

**Features:**
- Clean centered layout
- Magnetic input fields
- Form validation
- Success particle burst

**Verification:**
- [ ] E2E test: Form validates email
- [ ] E2E test: Submit shows success state

### 3.6 Footer

**Features:**
- Interactive piano keyboard
- Theme color shifts on key press
- Copyright and links

**Verification:**
- [ ] E2E test: Footer piano keys produce sound
- [ ] E2E test: Key press changes accent color

---

## Phase 4: Strava API Integration

**Duration:** 1 day

**Features:**
- OAuth flow (manual, one-time)
- Token refresh utility
- Build-time data fetch
- Activity display component

**Files:**
```
src/
├── lib/strava/
│   ├── client.ts
│   ├── types.ts
│   └── cache.ts
├── components/StravaWidget/
│   ├── StravaWidget.tsx
│   ├── StravaWidget.module.css
│   └── types.ts
scripts/
└── fetch-strava-data.ts
```

**Verification:**
- [ ] Unit test: Strava client types are correct
- [ ] E2E test: Widget displays cached data
- [ ] E2E test: Hover triggers heartbeat mode

---

## Phase 5: Polish & Performance

**Duration:** 1-2 days

### 5.1 Performance Optimization

- [ ] Lighthouse score > 90 for all metrics
- [ ] First Contentful Paint < 1s
- [ ] Largest Contentful Paint < 2s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Total Blocking Time < 200ms

### 5.2 Accessibility

- [ ] WCAG AA contrast ratios
- [ ] Keyboard navigation complete
- [ ] Screen reader tested
- [ ] `prefers-reduced-motion` respected
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
- Piano: All viewports start from C2
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
test('mobile shows 8 white keys starting from C2', ...)
test('tablet shows 17 keys starting from C2', ...)
test('desktop shows 25 keys starting from C2', ...)

// wave responsive tests
test('mobile wave maintains proportional amplitude', ...)
test('wave amplitude scales with viewport height', ...)
test('wave wavelength scales with viewport width', ...)
```

---

## Phase 6: Deployment

**Duration:** 0.5 days

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
| 1: Core Tech | 11 | 13 |
| 2: Layout | 3 | 5 |
| 3: Content | 2 | 10 |
| 4: Strava | 1 | 2 |
| 5: Polish | 0 | 9 |
| **Total** | **17** | **40** |

### Phase 1 Test Breakdown

**Pulse Background (6 unit, 5 e2e):**
- Unit: lerp, sineWave, useWaveScaling (ratio), useWaveScaling (mobile), useWaveEngine (pluck), useWaveEngine (state)
- E2E: renders, reduced-motion, mobile proportional, amplitude scaling, 60fps

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

## Timeline

| Phase | Duration | Start | End |
|-------|----------|-------|-----|
| 0: Scaffold | 1 day | Day 1 | Day 1 |
| 1: Core Tech | 4 days | Day 2 | Day 5 |
| 2: Layout | 2 days | Day 6 | Day 7 |
| 3: Content | 3 days | Day 8 | Day 10 |
| 4: Strava | 1 day | Day 11 | Day 11 |
| 5: Polish | 2 days | Day 12 | Day 13 |
| 6: Deploy | 0.5 day | Day 14 | Day 14 |

**Total: ~2 weeks**
