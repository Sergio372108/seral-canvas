# ADR-009: Hybrid Logical Clock for operation ordering

- **Status:** Accepted
- **Date:** 2026-07-06
- **PRD sections:** 6.4, 6.5

## Context

The PRD uses `createdAt` timestamps (wall-clock) for stroke ordering. But
wall-clock timestamps are unreliable for distributed ordering:

- Client clocks drift (seconds to minutes on mobile devices).
- Two strokes created "simultaneously" on different clients may have
  inverted timestamps, causing incorrect replay order.
- Undo/redo (PRD 4.8) and time-lapse replay depend on correct causal ordering.

## Decision

Use a **Hybrid Logical Clock (HLC)** for all CRDT operation ordering, not
wall-clock `createdAt`:

- HLC = `wall_clock_ms + counter + node_id`
- Combines physical time (for human-readable approximate ordering) with a
  Lamport counter (for tie-breaking when physical clocks agree).
- `node_id` = `userId` (stable per user per session).
- Stored as a string in `strokes.hlcTimestamp` (lexicographically sortable).

Convex's `_creationTime` (automatic wall-clock) is retained for queries
("strokes created in the last hour") but is **not** used for CRDT ordering.

## Consequences

**Positive:** Correct causal ordering even with drifting client clocks.
Deterministic replay for time-lapse (PRD 4.8). Undo/redo operates on the
true causal order, not wall-clock order. Lexicographically sortable — enables
efficient range queries by HLC prefix.

**Negative:** Every client must implement the HLC algorithm (~50 lines).
Slightly more complex than using `Date.now()`. Mitigated by: the `@geocanvas/crdt`
package provides a single, tested HLC implementation reused everywhere.

**Schema impact:** `strokes` table has `hlcTimestamp: v.string()` (see
`convex/schema.ts`), indexed as `by_layer_created` = `["layerId", "hlcTimestamp"]`.
