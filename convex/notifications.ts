/**
 * Notifications — user-facing notification queries and mutations.
 *
 * Transport: OneSignal (Phase 0, behind a NotificationService interface for
 * future migration to self-hosted Web Push + VAPID per user decision).
 *
 * Planned contracts (PRD 4.11):
 *   query    notifications.list({ cursor? })
 *   mutation notifications.markRead({ notificationId })
 *   mutation notifications.updatePreferences({ type, enabled })
 *
 * Smart grouping: never more than one notification per minute of the same type,
 * summarized as "+N more..." (PRD 4.11).
 *
 * Implementation deferred — requires `npx convex dev` + OneSignal keys.
 */
export {};
