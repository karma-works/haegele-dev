# WebMCP Integration Plan

## Implementation notes

Implemented phases 0–5 with six read-only tools; optional navigation and polyfill
remain excluded. Edit `src/content/*.ts` to update the UI, tools and generated
assets together. `pnpm build` regenerates `public/llms*.txt` and `public/data/`
outputs and injects JSON-LD into the portfolio entry point. The standalone
`bun scripts/generate-agent-data.ts` command regenerates the static files.

Corrections discovered while implementing this plan:

- The [current WebMCP draft](https://webmachinelearning.github.io/webmcp/)
  uses `registerTool(tool, { signal })` for cleanup. The adapter also supports
  older `unregisterTool(name)` APIs and returned cleanup handles. Registration
  lifetimes are serialized so late promises cannot unregister a newer mount.
- A detected API does not prove origin-trial participation or successful tool
  registration. The interface reports API detection, without claiming either.
- [Cloudflare redirect rules](https://developers.cloudflare.com/pages/configuration/redirects/)
  take precedence over static assets. The catch-all proxy has been removed;
  [Pages' built-in SPA fallback](https://developers.cloudflare.com/pages/configuration/serving-pages/)
  preserves client routes while serving the generated files normally.
  [Vercel checks the filesystem before rewrites](https://vercel.com/docs/project-configuration/vercel-json).
- The Playwright server command explicitly selects port 5173, matching its base URL.

Verification commands: `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm test`,
and `pnpm exec playwright test tests/e2e/webmcp.spec.ts`. Browser tests use a
stub API; native origin-trial and ChatGPT consumer testing require a compatible
browser and remain manual checks. Hosted responses should also be checked after
deployment; local Vite tests do not execute provider routing rules.

---

## Overview

Expose haegele.dev as a set of callable tools for AI agents, so an agent visiting the
site can query projects, skills and contact channels directly instead of scraping the DOM.

**Decision: in-page WebMCP only. No remote MCP server.**

| Option | Verdict | Reasoning |
|--------|---------|-----------|
| In-page `document.modelContext` | **Build** | Zero backend, fits the static SPA on Vercel, consumed today by ChatGPT's browser and Chrome's origin trial |
| Remote MCP server at `/mcp` | **Skip** | Needs serverless functions, streamable-HTTP transport, session handling, CORS. Nobody manually adds a portfolio as an MCP connector |
| Static agent layer (`llms.txt`, JSON-LD, JSON) | **Build** | Cheap, serves every agent that is *not* in a WebMCP-capable browser — still the majority |

**Architecture principle:** one content source, three consumers. React components,
WebMCP tools, and the generated static files all read the same `src/content/*.ts`
modules. Anything else guarantees the bio drifts out of sync.

**Stack fit:**
- Pure SPA, client-side only — tools register in the browser, no SSR involved
- No new runtime dependencies required for the core path
- Optional `@mcp-b/webmcp-polyfill` lazy-loaded as a fallback only

---

## API State (September 2026)

The spec moved the API off `navigator` in the 21 July 2026 draft. Do not copy blog
snippets verbatim — most still show the old path.

| Aspect | Current state |
|--------|---------------|
| Standard location | `document.modelContext` |
| Legacy location | `navigator.modelContext` — deprecated in Chrome 150, still live in the origin trial |
| Registration | `registerTool({ name, description, inputSchema, annotations, execute })` |
| Removed | `provideContext()` / `clearContext()` (dropped from the spec 5 Mar 2026) |
| Spec status | W3C Community Group Draft (Web Machine Learning CG), not on the standards track |

**Consumers that work today:**

| Consumer | Mechanism |
|----------|-----------|
| ChatGPT built-in browser | Reads page tools, surfaces them under "Site tools" in the address bar |
| Chrome 149–156 | Public origin trial for native `document.modelContext` |
| Edge 147+ | Experimental, behind a flag |
| Claude Desktop / Cursor | Only via `@mcp-b/webmcp-local-relay` + the polyfill |

**Hard constraints:**
- Tools must be registered in the **top-level page**. No iframes.
- No declarative HTML form registration — JavaScript only.
- Every invocation gets a safety review by the consuming agent; write operations
  trigger confirmation prompts.

---

## File Structure

```
src/
├── content/                    // NEW - single source of truth, pure data
│   ├── profile.ts              // name, role, location, positioning, availability
│   ├── projects.ts             // moved out of components/Projects/Projects.tsx
│   ├── skills.ts               // moved out of components/Skills/Skills.tsx (data only)
│   ├── graveyard.ts            // moved from components/Graveyard/graveyardData.ts
│   ├── contact.ts              // channels: GitHub, LinkedIn, X, HuggingFace, form
│   └── index.ts
├── webmcp/                     // NEW
│   ├── modelContext.ts         // adapter: document ?? navigator, feature detection
│   ├── tools.ts                // tool definitions built from src/content
│   ├── registerTools.ts        // idempotent registration + AbortController cleanup
│   └── index.ts
├── components/
│   ├── Skills/skillIcons.tsx   // NEW - JSX icons split out of the data array
│   └── AgentInterface/         // NEW - Phase 4, renders the tool registry
scripts/
└── generate-agent-data.ts      // NEW - emits llms.txt + public/data/*.json
tests/unit/
├── webmcp-tools.test.ts        // NEW
└── modelContext.test.ts        // NEW
```

---

## Phase 0: Content Extraction

The blocker for everything else. Content currently lives inside component modules:

| Current location | Contents | Complication |
|------------------|----------|--------------|
| `src/components/Projects/Projects.tsx:19` | `projects: Project[]` | Clean data, straight move |
| `src/components/Skills/Skills.tsx:18` | `skillCategories` | **JSX `icon` fields mixed into the data** |
| `src/components/Graveyard/graveyardData.ts` | `graveyardProjects` | Already separate, just relocate |
| `src/components/Hero/Hero.tsx:41` | Name, role, location, intro copy | Hardcoded in JSX |
| `src/components/Footer/Footer.tsx:237` | Social links | Hardcoded in JSX |

**Tasks:**
1. Create `src/content/` and move the `projects` and `graveyardProjects` arrays verbatim
2. Split `skillCategories` — data to `src/content/skills.ts`, icons to
   `src/components/Skills/skillIcons.tsx` keyed by category `id`
3. Extract Hero copy into `src/content/profile.ts` (name, title, location,
   availability, positioning statement, capability verbs)
4. Extract Footer social links into `src/content/contact.ts`
5. Update all components to import from `src/content` — no rendering changes
6. Keep the existing exported type names so `tests/unit/Skills.test.tsx` and
   `tests/unit/Contact.test.tsx` keep compiling

**Verification:** `bun run typecheck && bun run lint && bun run test` all green,
`bun run build` produces a visually identical page. This phase changes zero behaviour.

---

## Phase 1: WebMCP Adapter

Isolate the spec churn into exactly one file, so the `navigator` fallback is a
single line to delete once Chrome's origin trial ends.

```ts
// src/webmcp/modelContext.ts
interface ModelContext {
  registerTool(tool: WebMCPTool): Promise<{ unregister?: () => void } | void>;
}

export function getModelContext(): ModelContext | null {
  if (typeof document === "undefined") return null;
  // Spec location first; navigator alias is deprecated as of Chrome 150.
  const ctx =
    (document as unknown as { modelContext?: ModelContext }).modelContext ??
    (navigator as unknown as { modelContext?: ModelContext }).modelContext;
  return typeof ctx?.registerTool === "function" ? ctx : null;
}
```

**Registration timing — the trap in this codebase.** Everything below `Hero` in
`src/App.tsx:5` is `React.lazy()`. Registering tools from inside `Projects` or
`Skills` means the tools only exist once a human scrolls to that section, and an
agent never scrolls. **Register once from a top-level effect in `App`.**

```tsx
// src/App.tsx
useEffect(() => {
  const controller = new AbortController();
  // Defer past first paint - the tool layer is dead weight for human visitors.
  const idle = requestIdleCallback(() => {
    void registerWebMCPTools(controller.signal);
  });
  return () => {
    controller.abort();
    cancelIdleCallback(idle);
  };
}, []);
```

`registerWebMCPTools` must be a no-op when `getModelContext()` returns `null`, and
must be idempotent under React 19 StrictMode double-effects.

**Polyfill:** do **not** ship `@mcp-b/webmcp-polyfill` on the critical path. It only
helps when a local relay or the MCP-B extension is present, and adds bytes for
everyone else. If added later, load it dynamically behind a query flag
(`?webmcp=polyfill`) or an extension-presence check.

---

## Phase 2: Tool Set

Six tools. Narrow inputs, all read-only. Resist the urge to expose more —
tool descriptions cost the calling agent context on every page visit.

| Tool | Input | Returns | Annotations |
|------|-------|---------|-------------|
| `get_profile` | — | Name, role, location, positioning, availability, capability areas | `readOnlyHint: true` |
| `list_projects` | `tag?`, `status?`, `year?`, `limit?` | Id, title, description, tags, date, status, links | `readOnlyHint: true` |
| `get_project` | `id` (required) | Full record incl. demo URL and repo link | `readOnlyHint: true` |
| `get_skills` | `category?` | Categories with skills and levels | `readOnlyHint: true` |
| `search_site` | `query` (required), `limit?` | Ranked hits across projects, graveyard, skills | `readOnlyHint: true` |
| `get_contact_channels` | — | GitHub, LinkedIn, X, HuggingFace, form URL | `readOnlyHint: true` |

**Optional, Phase 2b:** `navigate_to_section` (`section: hero \| about \| skills \|
projects \| graveyard \| hobbies \| contact`) — scrolls and moves focus. Reuses the
section ids already observed in `src/App.tsx:41`. Good demo value, no side effects
beyond scroll position.

**Shape:**

```ts
{
  name: "list_projects",
  description:
    "List Christian Hägele's software projects. Filter by technology tag, status, or year.",
  inputSchema: {
    type: "object",
    properties: {
      tag: { type: "string", description: "Technology tag, e.g. 'TypeScript', 'AI Agents'" },
      status: { type: "string", enum: ["active", "archived", "wip"] },
      year: { type: "string", description: "Four-digit year, e.g. '2026'" },
      limit: { type: "number", description: "Max results, default 10" },
    },
  },
  annotations: { readOnlyHint: true },
  execute: async ({ tag, status, year, limit = 10 }) => ({
    content: [{ type: "text", text: JSON.stringify(filterProjects({ tag, status, year, limit })) }],
  }),
}
```

### Contact: no agent-callable submit

`src/components/Contact/Contact.tsx:327` posts directly to Formspree
(`https://formspree.io/f/xzdaglva`) with no captcha and no rate limit of our own.
An agent-callable submit tool is an open spam relay pointed at your own inbox.

If a write path is wanted later, implement `draft_contact_message` — it **prefills**
the form fields and scrolls the form into view, then stops. The human clicks submit.
Annotate it `readOnlyHint: false` and describe the "requires human confirmation"
behaviour in the tool description so the calling agent does not report success.

### Tool descriptions are the interface

The description strings are the whole contract. Include the proper noun
("Christian Hägele") — agents dispatch on names, and a description reading
"list projects" is useless once several sites expose tools in the same session.

---

## Phase 3: Static Agent Layer

Covers every agent not in a WebMCP-capable browser. Generated from `src/content`
so it cannot drift.

**Outputs:**

| File | Purpose |
|------|---------|
| `/llms.txt` | Short index: who, what, links to sections and the full file |
| `/llms-full.txt` | Full profile, projects, graveyard, skills as Markdown |
| `/data/projects.json` | Machine-readable, mirrors `list_projects` output |
| `/data/profile.json` | Mirrors `get_profile` output |
| JSON-LD in `index.html` | `Person` + `CreativeWork` entries |

**Generation mechanism — use a Vite plugin, not a `prebuild` script.** Vercel runs
`pnpm build` (`vercel.json`), and a `prebuild` hook invoking `bun` couples the
deploy to a runtime that is not what the build command uses. A `buildStart` hook in
`vite.config.ts` runs inside the existing build regardless of package manager:

```ts
// vite.config.ts
plugins: [react(), agentDataPlugin()],
```

Keep `scripts/generate-agent-data.ts` as a `bun scripts/generate-agent-data.ts`
entry point for local runs, with the plugin importing the same function.

**Note:** `public/_redirects` currently sends `/*` to `/index.html` with a 200.
Files written into `public/` are served before the redirect fires, so `/llms.txt`
resolves correctly — but verify this on Vercel *and* Cloudflare, since
`vercel.json` uses a rewrite rather than a redirect and the precedence differs.

**Content headers:** add a `Content-Type: text/plain; charset=utf-8` rule for
`/llms*.txt` in both `public/_headers` and `vercel.json`.

---

## Phase 4: Agent Interface Section

The portfolio payoff. The site's positioning is agentic engineering — a section
that renders the tools the page is currently exposing demonstrates it rather than
claiming it.

**Tasks:**
1. `src/components/AgentInterface/` — lazy-loaded like every other section
2. Render directly from the `tools.ts` registry: name, description, parameters
3. Show live capability state: native `document.modelContext` detected / origin trial /
   not available in this browser — with a one-line explanation for human visitors
4. Add to the section list in `src/App.tsx:41` and to `Navigation`

Keep it honest: if `getModelContext()` returns `null`, say so rather than showing a
tool list that nothing can call.

---

## Phase 5: Testing

Follows the existing Vitest + Playwright split.

**Unit (`tests/unit/`):**
- `modelContext.test.ts` — resolves `document.modelContext`; falls back to
  `navigator.modelContext`; returns `null` when neither exists or `registerTool` is
  not a function
- `webmcp-tools.test.ts` — each `execute` against fixture content; filter combinations
  for `list_projects`; `get_project` with an unknown id; `search_site` ranking and
  empty-query behaviour
- Registration idempotence under StrictMode double-invoke; `AbortSignal` cleanup

**E2E (`tests/e2e/webmcp.spec.ts`):**
- Inject a stub `document.modelContext` via `page.addInitScript()` before load,
  assert all six tools register within the idle callback window
- Assert registration happens **without scrolling** — the regression guard for the
  lazy-loading trap in Phase 1
- Assert `/llms.txt` returns 200 with `text/plain`, not the SPA shell

**Manual:** Chrome 149+ with the origin trial token, and ChatGPT's built-in browser
(address bar → Site tools → Available site tools).

---

## Gotchas

- **`document` not `navigator`.** Chrome 150 deprecated the navigator alias. Feature-detect both, in one file.
- **Lazy sections.** Tools registered inside `React.lazy()` sections never exist for an agent. Register from `App`.
- **StrictMode.** React 19 double-invokes effects in dev; registration must be idempotent or tools appear twice.
- **`requestIdleCallback`** is unavailable in Safari — guard with a `setTimeout` fallback.
- **Bundle cost.** The tool layer must not enter the initial chunk. Verify against the 500 kB `chunkSizeWarningLimit` in `vite.config.ts`.
- **No iframes.** Registration only works in the top-level page.
- **Origin trial expiry.** Chrome's trial runs 149–156. The token expires; the site must degrade silently, never throw.
- **Don't gate content behind tools.** Semantic HTML and SEO stay primary. WebMCP is additive.

---

## Out of Scope

| Item | Reason |
|------|--------|
| Remote MCP server (`/mcp`) | Requires serverless functions; no realistic consumer for a portfolio |
| `webmcp.json` manifest | Not required by the spec; tools register dynamically |
| Agent-callable form submit | Unprotected Formspree endpoint; human confirmation only |
| OpenAPI 3.1 spec | Redundant with the JSON outputs at this size |
| `@mcp-b/global` full runtime | Bridge, prompts and resources are unnecessary for read-only content |

---

## Sequencing

| Phase | Depends on | Deliverable |
|-------|-----------|-------------|
| 0 — Content extraction | — | `src/content/*`, zero behaviour change |
| 1 — Adapter + registration | 0 | Feature-detected, no-op when unsupported |
| 2 — Tool set | 1 | Six read-only tools |
| 3 — Static agent layer | 0 | `llms.txt`, JSON, JSON-LD via Vite plugin |
| 4 — Agent Interface UI | 2 | Visible section rendered from the registry |
| 5 — Testing | 1–4 | Unit + E2E, incl. the no-scroll regression guard |

Phase 3 depends only on Phase 0 and can run in parallel with 1–2. Phases 0–3 are the
functional deliverable; Phase 4 is the portfolio argument for it.

---

## References

- [State of WebMCP, July 2026](https://www.spronta.com/blog/state-of-webmcp-july-2026/) — API migration to `document.modelContext`
- [ChatGPT Site tools documentation](https://learn.chatgpt.com/docs/webmcp) — consumer requirements and safety model
- [WebMCP-org/npm-packages](https://github.com/WebMCP-org/npm-packages) — polyfill, types, React hooks, local relay
- [Browser support status, 2026](https://dev.to/ai-agent-economy/webmcp-in-2026-which-browsers-support-navigatormodelcontext-complete-compatibility-status-1oe4)
