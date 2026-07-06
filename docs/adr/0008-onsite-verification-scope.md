# ADR-008: On-site verification scope (GPS + anti-spoofing for Phase 0)

- **Status:** Accepted
- **Date:** 2026-07-06
- **PRD sections:** 4.4.1, 6.6

## Context

PRD 4.4.1.2 lists "on-site only" servers requiring physical presence via
BLE/Wi-Fi. True BLE/Wi-Fi presence verification requires **physical beacons**
deployed at the location — a hardware dependency that cannot be softwareed
into existence. For Phase 0 (closed beta on 1–2 campuses), beacon deployment
is infeasible.

## Decision

**Descope on-site verification to GPS + geofence + anti-spoofing for Phase 0.**
BLE/Wi-Fi becomes a Phase 1+ feature requiring beacon deployment.

Phase 0 on-site verification:
1. Client sends GPS coordinates to a Convex action.
2. Server checks geofence (lat/lng within `radiusM` of server center).
3. **Anti-spoofing heuristics:** maintain a per-user recent-location timeline
   (last 60 min, 1 sample/5min). Reject a "presence" claim if it requires a
   physically impossible jump (>2km in <5min).
4. **Reward-bearing servers:** require verified location + a one-time-per-user-
   per-server-per-day check-in mutation to prevent farming.

BLE/Wi-Fi (Phase 1+): requires beacon hardware at the physical location.
The schema and access-type enum support it, but the verification logic is
not implemented until beacons are deployed.

## Consequences

**Positive:** Phase 0 can ship on-site servers without hardware investment.
GPS+anti-spoofing raises the bar significantly against casual spoofing.

**Negative:** GPS spoofing is still possible with rooted devices + mock
location apps. Not perfect — but acceptable for closed beta. BLE/Wi-Fi
Phase 1+ closes the gap for high-value servers (museums, official tourism).

**PRD compliance:** this is a descope, not a contradiction. PRD 4.4.1.2's
BLE/Wi-Fi is explicitly deferred, not removed. Documented per Section 3.
