# ADR-001: Dual-track real-time transport (WebRTC + Convex)

- **Status:** Accepted
- **Date:** 2026-07-06
- **PRD sections:** 6.0, 6.4, 6.10

## Context

The PRD's binding backend decision is Convex. Convex's reactive queries excel at
"data changed → re-render" patterns, but the original PRD assumed a 60fps
multi-user drawing canvas that would emit a mutation per point — overwhelming
Convex's mutation log. PRD 6.0 proposed batching strokes client-side and using
Convex reactivity, falling back to WebRTC only if benchmarks fail.

Analysis of the 150ms perceived-latency budget (PRD 6.10) for remote strokes:
- Client batch window: 16–33ms
- Convex mutation round-trip: p95 ~100–250ms (single-region deployment)
- Reactive push to subscribers: ~50–150ms
- **Total p95: ~200–450ms globally** — deterministically misses the budget
  for geographically distant peers, not as an edge case.

Live cursors and "watching someone draw in real time" are core delight mechanics
(PRD 4.5). Laggy cursors feel dead and degrade the product's emotional payoff.

## Decision

Adopt a **dual-track transport from day one**, not as a fallback:

1. **WebRTC DataChannel (ephemeral, low-latency):** streams in-progress stroke
   points and cursor/presence. Falls back gracefully to "no live preview" if
   the channel fails.
2. **Convex mutations (durable, authoritative):** committed stroke batches
   (on pointer-up, or every ~500ms for long strokes), CRDT-merged server-side,
   reactive push for late-joiners and as the source of truth.

Convex is the source of truth. WebRTC is the live-preview layer. A late-joining
client never depends on the ephemeral channel — it hydrates from Convex.

This is the Figma/tldraw industry pattern. It is consistent with PRD 6.0's
"evaluate a dedicated low-latency transport" but makes it co-equal, not a
fallback. This change is flagged and approved per PRD Section 3 (do not follow
blindly; propose the alternative, justify, proceed).

## Consequences

**Positive:** Meets the 150ms perceived-latency budget for live cursors and
in-progress strokes globally. Live collaboration feels real-time. No Phase-0.5
rewrite when the single-track benchmark inevitably fails for distant peers.

**Negative:** Higher Phase-0 complexity — WebRTC peer/relay infrastructure
(signaling server, TURN relay for NAT traversal) must be built alongside the
Convex backend. Operational surface increases (monitoring two transports).

**Risk:** WebRTC reliability on restrictive networks (corporate proxies, mobile
carriers). Mitigated by graceful fallback to Convex-only (committed strokes
still sync; only live preview is lost).
