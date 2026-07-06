/**
 * Scheduled functions (cron jobs) — periodic background processing.
 *
 * Replaces a separate cron infrastructure (PRD 6.0). Uses Convex's scheduler.
 *
 * Planned jobs:
 *   hourly  — cell snapshot + CRDT compaction for busy cells (ADR-005)
 *   hourly  — presence TTL sweep (remove stale presence rows)
 *   daily   — reputation score recalculation from reputationEvents (PRD 6.9.3)
 *   daily   — server health score recalculation (reported vs. accepted ratio)
 *   daily   — feature flag cache refresh
 *   daily   — notification digest dispatch (smart grouping per PRD 4.11)
 *   weekly  — expired server archival (lifecycle: temporary/recurring)
 *   weekly  — local leaderboard rotation (PRD 4.9)
 *   monthly — backup restoration drill verification (PRD 6.12)
 *
 * Implementation deferred — requires `npx convex dev` to generate _generated/server.
 */
export {};
