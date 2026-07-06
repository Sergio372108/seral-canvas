# Architecture Review — GeoCanvas

This document records the architectural analysis of the GeoCanvas PRD, the
tensions identified, the decisions made (formalized as ADRs in `docs/adr/`),
and the manual items required before implementation can proceed.

## Summary of decisions

| # | Decision | ADR | PRD default? |
|---|---|---|---|
| 1 | Dual-track real-time transport (WebRTC + Convex) from day one | [ADR-001](adr/0001-dual-track-realtime-transport.md) | Changed (PRD proposed Convex-first, WebRTC as fallback) |
| 2 | Purpose-built OR-set + HLC CRDT (benchmark vs Yjs) | [ADR-002](adr/0002-crdt-or-set-hlc.md) | Aligned (PRD allowed purpose-built if benchmarks demand) |
| 3 | H3 for servers, quadkeys for cells, haversine for geofence | [ADR-003](adr/0003-spatial-indexing-h3-quadkeys.md) | Refined (PRD offered "geohash or H3" as one choice) |
| 4 | Stroke binary encoding (delta + MessagePack + zlib) | [ADR-004](adr/0004-stroke-binary-encoding.md) | New (PRD under-specified) |
| 5 | CRDT compaction with snapshot-as-boundary, 20-snapshot rollback | [ADR-005](adr/0005-crdt-compaction-rollback.md) | New (PRD silent on unbounded growth) |
| 6 | Hot-cell split policy (data-model ready, impl deferred) | [ADR-006](adr/0006-hot-cell-split-policy.md) | New |
| 7 | Tiered moderation (Tier 0 heuristic / Tier 1 CNN / Tier 2 LLM) | [ADR-007](adr/0007-tiered-moderation-pipeline.md) | Changed (PRD said per-stroke pre-moderation for strict servers) |
| 8 | On-site verification descope to GPS+anti-spoofing for Phase 0 | [ADR-008](adr/0008-onsite-verification-scope.md) | Descope (BLE/Wi-Fi deferred to Phase 1+) |
| 9 | Hybrid Logical Clock for op ordering (not wall-clock) | [ADR-009](adr/0009-hybrid-logical-clock.md) | New (PRD used createdAt) |
| 10 | PostHog + Convex featureFlags table | [ADR-0010](adr/0010-feature-flag-system.md) | New (PRD required flags, didn't specify system) |
| 11 | UI UX Pro Max skill — wait for installation | [ADR-0011](adr/0011-ui-ux-pro-max-skill-dependency.md) | Aligned (PRD 5.0 binding) |

## Tensions resolved

1. **Real-time collaboration vs. Convex mutation throughput** → ADR-001
   (dual-track: WebRTC live + Convex committed).
2. **Minimalist UI vs. feature richness** → canvas-first chrome that retracts
   (PRD 4.5), progressive disclosure, tokens reserved for user content (PRD 5.1).
3. **Anti-spam rate limiting vs. real-time stroke flow** → rate-limit on
   mutation commit, not per point; adaptive limits that tighten on anomaly.
4. **Geographic sharding aspirations vs. single-Convex web-first reality**
   → deferred to Phase 2/3 contingent on real latency metrics (PRD 6.0).
5. **No-text-tool brand differentiator vs. accessibility** → metadata-navigable
   chrome + future AI stroke descriptions (disclosed exception, PRD Section 10).

## Items not covered by ADRs

### i18n framework
`i18next` + `react-i18next` with lazy namespace loading. Spanish + English
message bundles as Phase-0 deliverable. No free-text-in-codebase lint rule.

### Testing infrastructure
- Synthetic-artist generator (bezier paths + jitter + variable speed) for
  load tests — not random points.
- Contract tests for every Convex function (input/output shape validation).
- Chaos harness: connection drop mid-stroke, simulated Convex outage.

### Cost monitoring
Convex pricing is usage-based. Daily-spend anomaly alert from day one —
a runaway canvas loop can burn budget silently.

### Cascade cleanup on server archival
`servers.purge` scheduled action runs after the 30-day grace period:
deletes cells, strokes, layers, memberships, reports, bookmarks, scheduled jobs.

### Sound assets
PRD 5.6 requires a minimalist sound library (soft wood/glass chimes). Not yet
provisioned — needs licensed or procedurally-generated assets.

## Manual provisioning required

See `apps/web/.env.example` for the full list with acquisition URLs. Summary:

| Service | Where | Blocks |
|---|---|---|
| Convex project | dashboard.convex.dev | Backend (schema deploy, `npx convex dev`) |
| MapTiler API key | cloud.maptiler.com | Map screen |
| Clerk project | dashboard.clerk.com | Auth, onboarding |
| Meilisearch Cloud | meilisearch.com/cloud | Search |
| OneSignal | dashboard.onesignal.com | Notifications |
| OpenAI API key | platform.openai.com | Moderation Tier 2 (deferrable) |
| Sentry | sentry.io | Error tracking |
| PostHog | app.posthog.com | Analytics + feature flags |
| GitHub repo | github.com/new | Version control, CI |
| Vercel | vercel.com | Hosting (after first commit) |
| Apple Developer Program | developer.apple.com | Apple Sign-In (not blocking Phase 0) |

**Not required (deferred):** VAPID keys (OneSignal chosen), self-hosted
Meilisearch (Cloud chosen), BLE beacons (Phase 1+).

## Phase 0 task breakdown

Critical path: repo scaffold → Convex schema → CRDT benchmark → dual-track
transport → WebGL2 renderer → drawing tools → canvas-plays-nice.

Parallel tracks: map (MapLibre + MapTiler + H3), server lifecycle, search
(Meilisearch sync), profile + onboarding (UI-blocked), notifications.

Cross-cutting: observability (Sentry + PostHog), testing (synthetic artist +
contract tests + e2e), ADRs (written alongside each workstream).

UI-gated (blocked on UI UX Pro Max skill): `@geocanvas/ui` components, all 14
screens, Storybook stories.

See `AGENTS.md` for the current monorepo map and commands.
