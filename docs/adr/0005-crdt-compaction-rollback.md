# ADR-005: CRDT compaction and rollback retention

- **Status:** Accepted
- **Date:** 2026-07-06
- **PRD sections:** 6.5, 6.7

## Context

PRD 6.5/6.7 mention periodic CRDT snapshots for fast late-join, but never
address **unbounded CRDT growth**. Tombstoned strokes stay in the document
forever for correct distributed undo. Over months, a busy cell's CRDT document
balloons, causing:
- Client memory exhaustion
- Slow snapshot loading
- Convex document size limits hit

## Decision

**Snapshot = compaction boundary.** After a snapshot is written:

1. Tombstoned strokes **older than the snapshot** are physically removed from
   the live CRDT document (the snapshot retains them for rollback).
2. **Rollback window:** keep last N=20 snapshots (configurable per server).
   Beyond that, deep history moves to cold storage (Convex file storage).
3. **Cell-level GC:** a scheduled Convex action (cron, hourly) sweeps cells
   where `lastSnapshotAt` is older than threshold AND `docSizeBytes` > limit,
   triggers snapshot + compaction.
4. **Hard size cap per cell CRDT doc:** 5MB. If exceeded before next scheduled
   snapshot, trigger an immediate snapshot action.

## Consequences

**Positive:** Bounded memory growth. Fast late-join (load snapshot, not full
op history). Rollback available for the last 20 significant states. Vandalism
bursts can't OOM clients (hard cap triggers emergency snapshot).

**Negative:** Deep history (>20 snapshots) requires loading from cold storage,
which is slower. Acceptable — deep history is rarely accessed, and the
time-lapse/replay feature (PRD 4.8) can use the op log within the current
snapshot window.

**Schema impact:** `cells` table has `snapshotStorageId`, `lastSnapshotAt`,
`strokeCount`, `docSizeBytes` fields (see `convex/schema.ts`).
