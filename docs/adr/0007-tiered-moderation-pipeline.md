# ADR-007: Tiered moderation pipeline

- **Status:** Accepted
- **Date:** 2026-07-06
- **PRD sections:** 6.9.2

## Context

PRD 6.9.2 says the CV classifier "evaluates each stroke before making it
visible beyond the author when the server has strict moderation enabled."
Two concerns:

1. **Latency:** blocking on an LLM/vision call per stroke kills the
   live-collaboration feel. Even 500ms gate is perceptible.
2. **Cost:** per-stroke LLM classification at scale is economically
   unsustainable. A hot cell at 100 strokes/sec = $50–500/hr on vision models.

## Decision

Replace per-stroke pre-moderation with a **tiered, mostly async pipeline**:

| Tier | Where | What | Cost | Latency |
|---|---|---|---|---|
| 0 | Client (on-device) | Heuristic + tiny classifier (stroke speed/pattern anomaly, "all black fill" vandalism) | Free | Real-time |
| 1 | Server (async) | Small CNN on rasterized cell patches (not per stroke) | Cheap, batched | ~2s |
| 2 | Server (async, rare) | LLM/vision call only for ambiguous Tier-1 flags, or "minor at risk" escalations | Expensive, rare | ~10s |

**Default servers:** post-moderation — stroke visible immediately, hidden if
flagged within ~2s. Matches PRD 5.5 success-state pattern.

**Strict-mode servers (schools/minors):** pre-moderation gate on
**stroke-batch commit** (every ~500ms), not per point. Show "moderation in
progress" affordance, not silent hold.

**"minor at risk" reports:** always escalate immediately to human review
(PRD 6.9.2), outside the standard queue.

This changes the PRD's "evaluate each stroke before visibility" to "evaluate
each batch before visibility, only for strict servers." Flagged per Section 3.

## Consequences

**Positive:** Cost drops from ~$50–500/hr to ~$5–50/day at scale. Live
collaboration preserved for default servers. Strict servers still protected
with acceptable latency.

**Negative:** Strict-mode servers have ~500ms visibility delay. Acceptable —
schools/minors prioritize safety over real-time feel.

**Risk:** Tier-0 client heuristics could be bypassed by a modified client.
Mitigated by: Tier-1 server-side CNN catches what Tier-0 misses; Tier-0 is
a free first line, not the only line.
