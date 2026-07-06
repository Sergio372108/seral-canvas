# GeoCanvas — Agent Playbook

## Project

GeoCanvas: world-map social network + infinite collaborative canvas.
**Source of truth:** the PRD (in repo root as `PRD.md` or provided externally).
**Architecture review:** `docs/ARCHITECTURE_REVIEW.md`. **ADRs:** `docs/adr/`.

Never make a decision that contradicts the PRD without explaining it first.

## Monorepo structure

```
apps/web            Next.js 16 (App Router) + React 19 + Tailwind v4 + shadcn/ui
convex/             Convex backend (schema.ts is the data model source of truth)
packages/
  design-system/    @geocanvas/ui  (BLOCKED on UI UX Pro Max skill — see ADR-011)
  crdt/             @geocanvas/crdt (OR-set + HLC — ADR-002, benchmark pending)
  renderer/         @geocanvas/renderer (Renderer abstraction — ADR pending)
  types/            @geocanvas/types (shared domain types)
  config/           @geocanvas/config (shared tooling configs)
docs/adr/           Architecture Decision Records
```

## Commands

```bash
pnpm install          # install all workspace deps (CI=true to auto-confirm hoist)
pnpm dev              # start Next.js dev server (turbo dev)
pnpm build            # production build
pnpm lint             # ESLint across all packages
pnpm typecheck        # tsc --noEmit across all packages
pnpm test             # vitest (where configured)
pnpm format           # Prettier write
pnpm format:check     # Prettier check
```

Convex-specific (requires `npx convex dev` to have been run once):
```bash
npx convex dev        # local Convex dev deployment, generates convex/_generated/
npx convex deploy     # production deploy
```

## Environment

Copy `apps/web/.env.example` → `apps/web/.env.local` and fill in credentials.
See the file for where to obtain each value. **Never invent credentials.**

## Conventions

- TypeScript strict mode (`tsconfig.base.json`). No `any` without justification.
- Conventional Commits (e.g., `feat(canvas): add stroke batching`).
- PRD 5.1–5.3 design tokens live in `apps/web/src/app/globals.css`. Consume via
  Tailwind utilities — never hardcode hex/px in components.
- No free-text tool in the canvas (PRD 4.8 — deliberate brand differentiator).
- Every Convex function must verify caller identity + role/ACL in code (PRD 6.8).
  Convex has **no automatic row-level security**.
- Strokes are binary vectors (`v.bytes()`), not JSON (ADR-004).
- Deletion is tombstone-based, never in-place (PRD 6.4).
- WCAG 2.2 AA is an acceptance criterion for every component, not a final phase.
- UI work is **blocked** until the UI UX Pro Max skill is installed (PRD 5.0, ADR-011).
  Proceed with non-UI work (schema, CRDT, renderer, infra) in the meantime.

## Next.js 16 note

This is Next.js 16 — APIs may differ from prior training. Before writing Next.js
code, read the relevant guide in `apps/web/node_modules/next/dist/docs/`.
Heed deprecation notices.

## Testing

- Unit: vitest (packages/crdt, packages/renderer)
- E2E: Playwright (apps/web — to be configured)
- Contract tests for every Convex function (to be added with implementations)
- Load: synthetic-artist generator for canvas concurrency (ADR in docs/adr/)

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs lint + typecheck + build on
every push to main and every PR. All three must pass before merge.
