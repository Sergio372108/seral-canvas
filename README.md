# GeoCanvas

World-map social network + infinite collaborative canvas.

A layer of visual expression anchored to the physical world: any place on the
planet can host a community collaboratively drawing on an infinite canvas,
discovered through an interactive global map.

## Status

**Phase 0 — scaffold complete.** No application functionality yet.
UI work is blocked on the UI UX Pro Max skill installation (PRD 5.0, ADR-011).

## Stack

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4, shadcn/ui, Framer Motion
- **Backend:** Convex (document-relational DB, reactive queries, scheduled functions)
- **Real-time:** Dual-track — WebRTC (live cursors + in-progress strokes) + Convex (committed strokes, source of truth)
- **CRDT:** Purpose-built OR-set + HLC (ADR-002, benchmark pending)
- **Map:** MapLibre GL JS + MapTiler vector tiles
- **Search:** Meilisearch Cloud
- **Auth:** Clerk (Google + email + phone; Apple Sign-In deferred)
- **Notifications:** OneSignal
- **Observability:** Sentry + PostHog
- **Monorepo:** pnpm + Turborepo

## Quick start

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp apps/web/.env.example apps/web/.env.local
# Fill in credentials — see .env.example for where to get each value.

# 3. (Optional) Start local Meilisearch for search development
docker compose --profile search up -d

# 4. Run the dev server
pnpm dev
```

## Convex setup

The Convex backend requires a one-time setup:

1. Create a project at https://dashboard.convex.dev
2. Run `npx convex dev` in `apps/web/` to link the deployment
3. This generates `convex/_generated/` and writes `NEXT_PUBLIC_CONVEX_URL` to `.env.local`

Until this step is complete, Convex function stubs in `convex/` cannot be type-checked.

## Project structure

See `AGENTS.md` for the full monorepo map and conventions.

## Architecture decisions

See `docs/adr/` for all Architecture Decision Records. Key decisions:

- ADR-001: Dual-track real-time transport (WebRTC + Convex)
- ADR-002: Purpose-built CRDT (OR-set + HLC) over Yjs
- ADR-003: Spatial indexing (H3 for servers, quadkeys for cells)
- ADR-004: Stroke binary encoding (delta + MessagePack)
- ADR-007: Tiered moderation pipeline
- ADR-008: On-site verification scope (GPS + anti-spoofing for Phase 0)
- ADR-011: UI UX Pro Max skill dependency

## License

All rights reserved.
