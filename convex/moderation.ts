/**
 * Moderation — tiered pipeline for vandalism and content abuse (PRD 6.9.2, ADR-007).
 *
 * Planned contracts:
 *   action   moderation.classifyStrokeBatch({ strokeIds })
 *   action   moderation.classifyCellSnapshot({ cellId })
 *   mutation reports.create({ targetType, targetId, reason })
 *   query    reports.listQueue({ status?, cursor? })
 *   mutation reports.resolve({ reportId, status, note })
 *
 * Tiered pipeline (ADR-007):
 *   Tier 0 — on-device heuristics (free, real-time, client-side)
 *   Tier 1 — CNN on rasterized cell patches (async, cheap, runs on snapshots)
 *   Tier 2 — LLM/vision call only for ambiguous flags or escalations
 *
 * "minor_at_risk" reports escalate immediately to human review (PRD 6.9.2).
 * Post-moderation by default; pre-moderation only for schools/minors, gated
 * on stroke-batch commit (every ~500ms), never per point.
 *
 * Implementation deferred — requires `npx convex dev` + external model provider keys.
 */
export {};
