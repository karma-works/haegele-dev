# Graveyard of Ideas - Implementation Plan

A witty, honest section showcasing projects that didn't make it. Features synthwave/retrowave tombstone aesthetic.

## Visual Reference

Based on `docs/thumbstone-of-ideas.md` and tombstone images in `/images/`:

- **Background:** Deep charcoal/off-black with subtle vignette
- **Accents:** Electric cyan + vibrant magenta/pink (cyberpunk duo)
- **Tombstones:** Medium grey stone with clean sans-serif text
- **Glow effects:** Neon pink (bottom) and cyan (top) halos
- **Texture:** Subtle film grain/noise overlay for lo-fi feel

---

## Section Structure

### Header

```
$ git reflog
Where ideas go to rest in peace
```

### Layout

- Responsive grid of tombstone cards (3 cols desktop, 2 tablet, 1 mobile)
- Each tombstone has:
  - Stone texture background with neon glow border
  - Project name as epitaph text
  - "R.I.P." header
  - Cause of death (witty explanation)
  - Birth-Death dates (project lifespan)
  - Tech stack as small icons/tags at base

### Tombstone Card Anatomy

```
┌─────────────────────────────┐
│          ✞ R.I.P.           │  <- Cross + R.I.P. header
│                             │
│    HERE LIES A GREAT        │  <- Project name (stylized)
│         IDEA                │
│                             │
│  "Killed by AI's inability  │  <- Epitaph / cause of death
│   to maintain pixel art     │
│       consistency"          │
│                             │
│   Born: 2026-02             │  <- Dates
│   Died: 2026-02             │
│                             │
│  ┌─┐ ┌─┐ ┌─┐ ┌─┐           │  <- Tech stack icons
│  │TS│ │Py│ │Vi│            │
│  └─┘ └─┘ └─┘               │
└─────────────────────────────┘
```

---

## Data Model

### Extended Project Interface

```typescript
interface GraveyardProject {
  id: string;
  title: string;
  epitaph: string; // Witty cause of death
  bornDate: string; // When started
  deathDate: string; // When abandoned
  techStack: string[]; // Technologies used
  link?: string; // GitHub repo (if preserved)
  image?: string; // Screenshot (if exists)
  lessons?: string; // What was learned (optional)
}
```

### Initial Projects

```typescript
const graveyardProjects: GraveyardProject[] = [
  {
    id: "grave-1",
    title: "SC2K City Viewer",
    epitaph:
      "Killed by AI's inability to maintain stylistic consistency across 200+ pixel art tiles. The dream was noble, the execution... inconsistent.",
    bornDate: "2026-02",
    deathDate: "2026-02",
    techStack: ["TypeScript", "Python", "Vite"],
    link: "https://github.com/karma-works/sc2k-city-viewer",
    image: "/assets/projects/sc2k-city-viewer.webp",
  },
];
```

---

## Component Architecture

### Files to Create

```
src/components/Graveyard/
├── Graveyard.tsx           # Main section component
├── Graveyard.module.css    # Styles with synthwave aesthetic
├── TombstoneCard.tsx       # Individual tombstone card
└── graveyardData.ts        # Project data
```

### Files to Modify

```
src/components/Projects/Projects.tsx
  - Remove archived projects from main timeline
  - Filter: projects.filter(p => p.status !== 'archived')

src/App.tsx (or main page)
  - Import and place <Graveyard /> after <Projects />
```

---

## Styling Approach

### CSS Variables (add to :root or component)

```css
--graveyard-bg: #0d0d0f;
--graveyard-stone: #4a4a4a;
--graveyard-stone-dark: #2a2a2a;
--graveyard-cyan: #00ffff;
--graveyard-magenta: #ff00ff;
--graveyard-text: #e0e0e0;
--graveyard-muted: #888888;
```

### Key Style Effects

1. **Neon Glow Border**

   ```css
   .tombstone {
     box-shadow:
       0 0 10px var(--graveyard-cyan),
       0 0 20px rgba(0, 255, 255, 0.3),
       inset 0 -2px 10px var(--graveyard-magenta);
   }
   ```

2. **Film Grain Overlay**

   ```css
   .graveyard::before {
     content: "";
     background-image: url("data:image/svg+xml,...noise...");
     opacity: 0.05;
   }
   ```

3. **Stone Texture**
   - Use subtle gradient or noise pattern
   - Rounded top corners (classic tombstone shape)

4. **Hover Animation**
   - Subtle glow intensification
   - Slight float/levitate effect
   - Respect `prefers-reduced-motion`

---

## Interaction Design

### Scroll Animation

- Fade in from below (like rising from the grave)
- Staggered timing for each tombstone
- Use existing `useScrollAnimation` hook

### Hover States

- Neon glow intensifies
- Optional: subtle "ghost" float animation
- Show "View Repo" link if available

### Reduced Motion

- Disable animations for `prefers-reduced-motion`
- Show tombstones immediately without entrance animation

---

## Implementation Steps

### Phase 1: Core Structure

1. Create `src/components/Graveyard/` directory
2. Create `graveyardData.ts` with SC2K project
3. Create `TombstoneCard.tsx` component
4. Create `Graveyard.tsx` section wrapper

### Phase 2: Styling

5. Create `Graveyard.module.css` with:
   - Section layout and background
   - Tombstone card styles
   - Neon glow effects
   - Film grain overlay
   - Responsive grid

### Phase 3: Integration

6. Update `Projects.tsx` to filter out archived projects
7. Add `<Graveyard />` to main page after `<Projects />`
8. Ensure smooth scroll transition between sections

### Phase 4: Polish

9. Add hover animations
10. Test reduced motion behavior
11. Verify responsive breakpoints
12. Add any additional failed projects

---

## Image Assets

### Existing

- `/images/thumbstone-1.png` - Reference tombstone graphic
- `/images/thumbstone-2.png` - Reference tombstone graphic
- `/images/thumbstone-3.png` - Reference tombstone graphic

### Needed (resize/optimize)

- Optimize tombstone images for web
- Create resized variants for responsive
- Or: Recreate tombstones as CSS/SVG for better performance

### Asset Strategy

Option A: Use images as card backgrounds
Option B: Use CSS-only tombstones (recommended for performance)
Option C: Hybrid - CSS base with subtle image overlay

---

## Accessibility

- Semantic HTML: `<section>`, `<article>`, `<h2>`
- ARIA labels for icon-only links
- Keyboard navigation for repo links
- Sufficient color contrast for text
- Alt text for any decorative images

---

## Future Considerations

- Animation of ghost rising on hover?
- Sound effect on click? (Playful, optional)
- "Resurrection" badge if project gets revived?
- Easter egg: konami code reveals hidden failed projects?
