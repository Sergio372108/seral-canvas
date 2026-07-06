/**
 * Auth — server-side identity verification and authorization helpers.
 *
 * Convex has no automatic row-level security (PRD 6.0). Every query, mutation,
 * and action must verify the caller's identity via Convex Auth context and
 * check per-server roles + per-layer ACLs explicitly in code (PRD 6.8).
 *
 * Auth provider: Clerk (Phase 0 ships Google + email + phone; Apple Sign-In
 * added when Apple Developer Program account is provisioned).
 *
 * Planned helpers:
 *   helper   requireUser(ctx)            — throws if not authenticated
 *   helper   requireMember(ctx, serverId) — throws if not a member
 *   helper   requireRole(ctx, serverId, roles) — throws if role insufficient
 *   helper   requireLayerPermission(ctx, layerId, perm) — checks layer ACL
 *   helper   verifyGeofence(ctx, serverId, lat, lng) — anti-spoofing (ADR-008)
 *
 * Implementation deferred — requires `npx convex dev` + Clerk integration.
 */
export {};
