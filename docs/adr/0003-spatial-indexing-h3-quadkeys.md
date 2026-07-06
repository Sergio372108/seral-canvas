# ADR-003: Spatial indexing — H3 for servers, quadkeys for cells

- **Status:** Accepted
- **Date:** 2026-07-06
- **PRD sections:** 6.6, 6.7

## Context

PRD 6.6 offers "geohash or H3" as if it's one choice. It's actually three
different problems requiring three different indexes:

1. Server discovery / clustering on the map (discrete points)
2. Canvas cell partitioning (continuous space, infinite)
3. "Near me" radius queries (proximity)

Convex has no native geospatial engine (no PostGIS equivalent — PRD 6.0). All
spatial queries must use indexed string fields with prefix/range queries.

## Decision

Use **three distinct spatial indexes**, not one:

| Problem | Index | Why |
|---|---|---|
| Server discovery + clustering | **H3** (Uber hexagonal grid) | Equal neighbor distance, no pole distortion, clean resolution hierarchy (16 levels), `kRing(cell, k)` for true proximity |
| Canvas cell partitioning | **Quadkey (Morton code)** | Aligns with slippy-map tile conventions, 1:1 with map zoom levels, trivial viewport culling |
| Final geofence gate (on-site servers) | **Raw lat/lng + haversine** | Exact distance for access control; H3 is approximate |

The `servers` table has an `h3Index` field (indexed). The `cells` table has a
`quadKey` field (indexed). On-site verification (ADR-008) uses raw lat/lng.

## Consequences

**Positive:** Each problem uses the index best suited to it. H3's `kRing` gives
true proximity without geohash's prefix-split edge cases. Quadkeys align with
the map tile system, enabling viewport-based cell subscription. Two different
spatial indexes for two different problems, never conflated.

**Negative:** Two index systems to maintain. H3 edge-area varies ~30% across
the globe at a fixed resolution — acceptable for discovery, but not for
on-site BLE geofencing (which uses raw lat/lng + haversine as the final gate).

**Precision trade-off documented:** H3 resolution must be chosen per use case
(server discovery: res 7-8 ~5km cells; clustering: dynamic by zoom level).
This is a known limitation of not having PostGIS, accepted per PRD 6.0.
