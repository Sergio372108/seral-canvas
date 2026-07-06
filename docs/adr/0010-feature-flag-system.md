# ADR-010: Feature flag system (PostHog + Convex table)

- **Status:** Accepted
- **Date:** 2026-07-06
- **PRD sections:** 2.3, 8

## Context

PRD 2.3 requires "feature flags for any new feature before exposing it to 100%
of users." PRD 8 says "centrally managed feature flags, never hardcoded
conditionals scattered through the code." Convex does not ship a feature-flag
system.

## Decision

Use a **dual-layer feature-flag system**:

1. **Client-side progressive rollout:** PostHog (also serves as the analytics
   pipeline — PRD 6.11). PostHog's feature-flag API supports percentage
   rollout, A/B testing, and user-property-based targeting. Consumed via
   `posthog-js` in the React client.

2. **Backend flags:** a `featureFlags` Convex table (`key`, `enabled`,
   `rolloutPercentage`, `config`) queried reactively by Convex functions.
   Used for server-side behavior toggles (e.g., moderation tier selection,
   rate-limit thresholds). Updated via an admin mutation.

**Rule:** No `if (process.env.NODE_ENV === 'production')` or hardcoded
conditionals for feature gating. All feature checks go through
`useFeatureFlag(key)` (client) or `await getFlag(ctx, key)` (server).

## Consequences

**Positive:** Progressive rollout (canary, percentage) for every feature.
Centralized flag management. PostHog doubles as analytics — one tool, two
jobs (PRD 6.11). Backend flags are reactive — changing a flag in the admin
panel instantly affects all connected clients.

**Negative:** Two flag systems (PostHog for client, Convex for server) with
slightly different APIs. Mitigated by a shared `@geocanvas/types` interface
that both conform to.

**Schema impact:** `featureFlags` table in `convex/schema.ts`.
