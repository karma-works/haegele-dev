# haegele.dev design system

## Visual thesis

**A living agent system.** The portfolio should feel like a clear window into Christian's way of working: human direction, agentic acceleration, technical range, and visible delivery. It is editorial and precise, not a generic “AI” interface.

## Narrative order

1. **Signal:** the hero makes the proposition and working style immediately clear.
2. **Operating model:** explain the human-led, agent-enabled delivery loop.
3. **Evidence:** present capabilities and selected work as proof, not a tool inventory.
4. **Learning loop:** treat experiments and hobbies as sources of range and judgment.
5. **Invitation:** make contact feel like the start of a focused build.

## Tokens

| Role | Token / value | Use |
| --- | --- | --- |
| Ground | `--color-bg` / `#07100d` | Full-page foundation |
| Surface | `--color-bg-secondary` / `#0d1a14` | Panels and section shifts |
| Ink | `--color-text` / `#edf4ed` | High-priority copy |
| Quiet ink | `--color-text-muted` / `#a8bbb0` | Supporting information |
| Signal | `--color-accent-mint` / `#a3ff68` | Active states, serial numbers, primary actions |
| Secondary signal | `--color-accent-blue` / `#7dc6ff` | Rare contextual detail only |
| Alert / contrast | `--color-accent-pink` / `#f3b3d0` | Errors and exceptional states, never decoration |

## Type and layout

- Use the sans face for readable interface and body copy; use the mono face for labels, metadata, and numbered systems.
- Headlines are compact, high-contrast, and editorial. A serif italic may emphasize one short idea, as in the hero; do not repeat it as a routine display treatment.
- Align content to a visible 68px desktop grid. Sections use generous vertical space and intentional full-bleed dark field shifts.
- Prefer narrow radii or square corners for surfaces. Circular shapes are reserved for system nodes, status indicators, and piano keys.

## Components

- **Panels:** dark, low-transparency surfaces with a one-pixel pale border. Add an accent rule or serial label instead of a heavy drop shadow.
- **Actions:** one solid lime primary action; secondary actions are dark outlined panels. Hover lifts 2–3px and inverts to paper, never adds rainbow effects.
- **Progress:** lime line on a subdued track. Use animation to explain state, not as ambient decoration.
- **Images:** use existing project imagery as evidence. Crop cleanly and pair with metadata; no unrelated stock imagery.
- **System maps:** dotted connections, sequential labels, and a small live signal establish the agentic visual language.

## Motion and accessibility

- Use opacity, transform, and stroke-dashoffset; avoid animating large filters or layout dimensions.
- Stagger entrances only to clarify hierarchy. Each section has a stable resting state.
- Under `prefers-reduced-motion`, reveal content without transitions and stop flowing paths, floating nodes, and pulses.
- Preserve keyboard access, focus visibility, and 44px control targets.

## Guardrails

- Do not reintroduce default rounded “glassmorphism,” multi-color neon gradients, or terminal-window chrome as the primary visual language.
- Treat AI as a capability in a deliberate engineering practice, not as an autonomous magic trick.
- New sections should reference these tokens and component rules before adding local values.
