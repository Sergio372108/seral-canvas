# ADR-004: Stroke binary encoding (delta + MessagePack + zlib)

- **Status:** Accepted
- **Date:** 2026-07-06
- **PRD sections:** 6.5, 6.10

## Context

PRD 6.5 says strokes are "vector (sequence of points + pressure + color +
width + tool)" and PRD 6.10 says "a single stroke-batch operation should weigh
on the order of bytes, not kilobytes." But the PRD never specifies the encoding.

A 200-point stroke as a JSON array of `{x, y, pressure}` objects is ~6KB.
At scale (thousands of strokes per cell, millions of cells), this is
economically and performance-wise unsustainable.

## Decision

Use a **compact binary encoding** for stroke payloads, stored as `v.bytes()`
in Convex (not JSON):

- **On the wire (WebRTC ephemeral):** MessagePack with **delta-encoding** of
  consecutive points (Δx, Δy from previous), `Float32` for coordinates,
  `Uint8` for pressure (0–255 quantized), run-length where pressure is constant.
- **In Convex (durable):** same compact binary, zlib-compressed if >1KB.
- **Stroke ID:** `authorId + HLC timestamp` — deterministic, globally unique,
  no server round-trip to allocate an ID. Enables offline creation with stable
  IDs for CRDT replay.
- **Tool/color/width:** factored into a stroke-header (one per stroke), not
  repeated per point.

Size estimates: 200-point stroke ≈ 1.6KB raw → ~600 bytes delta-encoded →
~400 bytes packed → ~300 bytes zlib-compressed. ~20x smaller than JSON.

## Consequences

**Positive:** Meets the "bytes not kilobytes" budget (PRD 6.10). Network
payloads are minimal. Convex document sizes stay small. Natively enables
replay/time-lapse (PRD 4.8) by replaying the operation sequence.

**Negative:** Binary encoding is harder to debug than JSON (can't just
`console.log` a stroke). Mitigated by dev-mode JSON preview in the renderer
and a `decodeStroke(bytes)` utility in `@geocanvas/types`.

**Schema impact:** The `strokes` table uses `v.bytes()` for `pointsVector`
(see `convex/schema.ts`).
