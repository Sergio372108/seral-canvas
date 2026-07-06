# ADR-002: Purpose-built CRDT (OR-set + HLC)

- **Status:** Accepted (pending Phase-0 benchmark confirmation)
- **Date:** 2026-07-06
- **PRD sections:** 6.4

## Context

PRD 6.4 says "CRDT using a proven library (Yjs or Automerge), or a purpose-built
implementation only if benchmarks show existing libraries can't sustain the
expected stroke volume per cell."

Canvas strokes are **append-only additions with no interleaving semantics**.
Two users appending strokes never conflict in a meaningful way; the only
conflict is ordering, which is total and resolvable by a logical clock.

Yjs's `Y.Array` of `Y.Map` is optimized for **text** (interleaved concurrent
edits to shared structure). For append-only data, it carries ~5x per-op
overhead vs. a purpose-built OR-set. Automerge has even higher per-op overhead.

## Decision

Implement a **purpose-built Observed-Remove Set (OR-set) keyed by Hybrid Logical
Clock (HLC) + author ID**, rather than adopting Yjs or Automerge.

- Each stroke operation has a unique ID: `authorId + HLC timestamp`.
- Addition = insert into the set.
- Deletion = tombstone (reversible, never in-place — PRD 6.4/6.4).
- Convergence is automatic by CRDT design.

A Phase-0 benchmark spike will validate this against Yjs's `Y.Array`:
- 10k ops/sec × 50 concurrent clients
- Metrics: throughput, per-op memory, snapshot size
- Commit the winner with a written ADR update.

If Yjs wins (>2x throughput or <0.5x memory), adopt Yjs instead.

## Consequences

**Positive:** Lowest per-op overhead for our append-only workload. Simpler
tombstone/GC story. No dependency on Yjs's ecosystem (which we don't need —
no rich-text editing). Full control over serialization format (ADR-004).

**Negative:** We implement and maintain our own CRDT. Correctness is critical —
a bug in the merge function causes divergence. Mitigated by: property-based
tests, contract tests for convergence, and the benchmark spike validating the
approach before commitment.

**Risk:** If we later need collaborative text editing (e.g., server rules,
bio), Yjs would be better suited. Decision: use Yjs for any future text-CRDT
need, keep the custom OR-set for strokes. Two CRDTs for two workloads.
