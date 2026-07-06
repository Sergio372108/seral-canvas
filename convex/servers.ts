/**
 * Server catalog — queries, mutations, and actions for GeoCanvas servers.
 *
 * Planned contracts (PRD 6.3, Phase 0):
 *   query    servers.listNearby({ lat, lng, radiusM, category?, cursor? })
 *   mutation servers.create({ name, description, category, tags, coverImageId,
 *                             visibility, accessType, lifecycle })
 *   query    servers.getById({ serverId })
 *   mutation servers.update({ serverId, patch })
 *   mutation servers.join({ serverId, accessProof? })
 *   query    servers.listMembers({ serverId, cursor? })
 *
 * Geospatial discovery uses the H3 index on `servers.h3Index` (ADR-003).
 * Proximity is resolved via H3 kRing prefix queries, not radius math.
 * Every mutation verifies the caller's identity and per-layer role (PRD 6.8).
 *
 * Implementation deferred — requires `npx convex dev` to generate _generated/server.
 */
export {};
