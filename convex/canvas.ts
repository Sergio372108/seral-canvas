/**
 * Canvas — cells, layers, strokes, and presence.
 *
 * Planned contracts (PRD 6.3 + ADR-001 dual-track transport):
 *   query    canvas.subscribeCell({ serverId, cellId })
 *   mutation canvas.submitStrokeBatch({ serverId, cellId, layerId, ops })
 *   mutation canvas.undo({ serverId, cellId, layerId, opId })
 *   mutation presence.heartbeat({ serverId, cellId, cursor, tool })
 *
 * Stroke batches carry compact binary ops (ADR-004), CRDT-merged via the
 * purpose-built OR-set (ADR-002). Convex is the durable source of truth;
 * the WebRTC live layer (ADR-001) streams in-progress strokes and cursors
 * with lower latency. Presence rows are TTL-based, not persisted to canvas
 * history. Cell partitioning uses quadkeys (ADR-003); hot-cell split policy
 * is data-model-ready but deferred (ADR-006).
 *
 * Every mutation verifies layer ACL + server membership server-side (PRD 6.8).
 * Rate limiting is explicit in-code — Convex has no automatic RLS (PRD 6.9.1).
 *
 * Implementation deferred — requires `npx convex dev` to generate _generated/server.
 */
export {};
