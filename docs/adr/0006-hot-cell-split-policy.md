# ADR-006: Hot-cell split policy

- **Status:** Accepted (data-model readiness only; implementation deferred)
- **Date:** 2026-07-06
- **PRD sections:** 6.5, 6.12

## Context

A single hot cell (e.g., a viral event server with 5000 concurrent users in
one cell) can saturate a single Convex deployment's mutation throughput,
**regardless of geography**. This is orthogonal to the multi-region sharding
question (ADR-deferred to Phase 2/3). PRD 6.5's quadtree partitioning implies
subdivision is possible, but the mechanism is unspecified.

## Decision

Make the cell ID format **quadkey-path-based** (not a flat ID), so the data
model supports hot-cell splitting without a migration:

- A cell at quadkey Z can be subdivided into 4 children at Z+1 with
  deterministic IDs.
- **Split policy (documented, not implemented in Phase 0):** if a cell exceeds
  N concurrent active users, freeze writes to the parent cell, redirect new
  strokes to one of 4 children based on `hash(authorId) % 4` (load balancing),
  and snapshot the parent as a read-only base layer for all children.
- This is the same pattern as region splitting in distributed databases.

**Phase 0 deliverable:** ensure the cell ID format and stroke→cell routing
logic can support this. Costs nothing now, saves a painful rewrite later.

## Consequences

**Positive:** No schema migration needed when hot cells appear. The split is
a runtime decision, not a data-model change. Base-layer-as-snapshot gives
spatial continuity across the split.

**Negative:** Implementation complexity (load balancing, frozen-cell reads,
child-cell fanout). Deferred to Phase 2/3 — only built if real traffic shows
a cell exceeding the concurrency threshold.

**Monitoring:** dashboard alert when a cell's concurrent active users or
mutation rate exceeds 50% of the split threshold, so the team can prepare.
