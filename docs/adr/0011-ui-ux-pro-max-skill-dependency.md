# ADR-011: UI UX Pro Max skill dependency

- **Status:** Accepted (blocked — awaiting skill installation)
- **Date:** 2026-07-06
- **PRD sections:** 5.0, 5.7

## Context

PRD 5.0 makes the "UI UX Pro Max" skill binding for every interface decision
(layout, palette, typography, components, interaction patterns). It is a
design-intelligence engine for coding agents, used instead of improvising
loose design values. The PRD requires querying it before building any screen
and using it for validation (accessibility, loading/error states, visual
hierarchy) before considering any screen closed.

The skill is **not currently available** in the agent's loaded skills list.
Available skills: codebase-memory, customize-opencode, find-skills, insforge,
insforge-cli, insforge-debug, insforge-integrations.

## Decision

**Wait for the UI UX Pro Max skill to be installed** before building any UI
(design-system components, screens, onboarding flows).

Per user decision: "UI UX Pro Max is a mandatory part of the design flow
defined in the PRD. I do not want to substitute it. Meanwhile, advance with
all tasks that do not depend on the interface."

In the meantime:
- Design tokens from PRD 5.1–5.3 (palette, type scale, spacing, radii,
  shadows) are already implemented in `apps/web/src/app/globals.css` as
  Tailwind v4 `@theme` tokens. These are the literal PRD values, not
  skill-generated — they will be validated by the skill when installed.
- shadcn/ui is initialized with the neutral base, mapped to PRD values.
- The `@geocanvas/ui` package exists as an empty skeleton.

**Unblock condition:** the skill appears in the agent's `available_skills`
list. At that point, query it with a multidimensional query
("social map collaborative canvas minimalist dark-mode") and run the
validation pass per PRD 5.0 before building any screen.

## Consequences

**Blocked:** `@geocanvas/ui` components, all 14 screens (onboarding, map,
search, server wizard, admin, canvas chrome, layers, drawing toolbar,
profile, notifications, settings, reports), Storybook stories.

**Not blocked:** Convex schema, CRDT engine, renderer abstraction, real-time
transport, map engine integration (logic), auth, moderation pipeline,
observability, testing infrastructure, CI/CD.

**Risk:** If the skill is never installed, UI work is permanently blocked.
Fallback (if user later agrees): proceed with PRD 5.1–5.3 tokens as source
of truth + manual WCAG 2.2 AA contrast checks + per-screen design review.
This fallback is documented but not activated — user explicitly chose to wait.
