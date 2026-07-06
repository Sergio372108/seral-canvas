import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

/**
 * GeoCanvas Convex schema.
 *
 * Source of truth: PRD 6.7 + ARCHITECTURE_REVIEW (H3 spatial index on servers,
 * quadkey index on cells, binary stroke payload per ADR-004, HLC timestamps,
 * featureFlags table per ADR-010, reputationEvents for 6.9.3, ephemeral presence).
 *
 * Conventions:
 * - All ID references use v.id("<table>").
 * - Geospatial: H3 index string on servers (ADR-003), quadkey on cells (ADR-003).
 * - Strokes store a compact binary vector payload (ADR-004), not JSON arrays.
 * - Timestamps: _creationTime is automatic; HLC logical clocks live in stroke ops.
 * - Deletion is tombstone-based (tombstonedAt), never in-place (PRD 6.4).
 */

// --- Enums (literals reused across tables) ---

const serverVisibility = v.union(
  v.literal('global'),
  v.literal('regional'),
  v.literal('onsite'),
  v.literal('hidden'),
);

const serverAccessType = v.union(
  v.literal('open'),
  v.literal('approval'),
  v.literal('invite'),
  v.literal('password'),
  v.literal('idcode'),
  v.literal('emaildomain'),
  v.literal('verified'),
);

const serverLifecycle = v.union(
  v.literal('permanent'),
  v.literal('temporary'),
  v.literal('recurring'),
);

const memberRole = v.union(
  v.literal('owner'),
  v.literal('admin'),
  v.literal('moderator'),
  v.literal('verified_artist'),
  v.literal('member'),
  v.literal('readonly'),
);

const layerVisibility = v.union(
  v.literal('public'),
  v.literal('friends'),
  v.literal('custom'),
  v.literal('private'),
  v.literal('password'),
);

const reportReason = v.union(
  v.literal('spam'),
  v.literal('sexual'),
  v.literal('violent'),
  v.literal('hate'),
  v.literal('vandalism'),
  v.literal('impersonation'),
  v.literal('minor_at_risk'),
);

const reportStatus = v.union(
  v.literal('pending'),
  v.literal('reviewing'),
  v.literal('resolved'),
  v.literal('dismissed'),
);

// --- ACL for layers (PRD 4.7) ---

const layerAcl = v.object({
  canView: v.array(v.id('users')),
  canDraw: v.array(v.id('users')),
  canDelete: v.array(v.id('users')),
  canCopy: v.array(v.id('users')),
  canExport: v.array(v.id('users')),
  canAdminister: v.array(v.id('users')),
  canInvite: v.array(v.id('users')),
});

// --- Tables ---

export default defineSchema({
  users: defineTable({
    alias: v.string(),
    authProviderId: v.string(),
    avatarStorageId: v.optional(v.id('_storage')),
    bio: v.optional(v.string()),
    reputationScore: v.number(),
    preferredLocale: v.optional(v.union(v.literal('en'), v.literal('es'))),
  })
    .index('by_auth_provider', ['authProviderId'])
    .index('by_alias', ['alias']),

  servers: defineTable({
    ownerId: v.id('users'),
    name: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    tags: v.array(v.string()),
    coverImageStorageId: v.optional(v.id('_storage')),
    visibility: serverVisibility,
    accessType: serverAccessType,
    lifecycle: serverLifecycle,
    expiresAt: v.optional(v.number()),
    geohash: v.string(),
    h3Index: v.string(),
    lat: v.number(),
    lng: v.number(),
    radiusM: v.number(),
    healthScore: v.number(),
    memberCount: v.number(),
    rulesText: v.optional(v.string()),
    isArchived: v.boolean(),
  })
    .index('by_owner', ['ownerId'])
    .index('by_h3', ['h3Index'])
    .index('by_geohash', ['geohash'])
    .index('by_category', ['category'])
    .searchIndex('search_name', {
      searchField: 'name',
      filterFields: ['category', 'isArchived'],
    }),

  serverMembers: defineTable({
    serverId: v.id('servers'),
    userId: v.id('users'),
    role: memberRole,
    joinedAt: v.number(),
  })
    .index('by_server', ['serverId'])
    .index('by_user', ['userId'])
    .index('by_server_role', ['serverId', 'role']),

  layers: defineTable({
    serverId: v.id('servers'),
    cellId: v.id('cells'),
    ownerId: v.id('users'),
    name: v.string(),
    visibility: layerVisibility,
    acl: layerAcl,
    passwordHash: v.optional(v.string()),
    isBaseLayer: v.boolean(),
  })
    .index('by_cell', ['cellId'])
    .index('by_server', ['serverId'])
    .index('by_owner', ['ownerId']),

  strokes: defineTable({
    layerId: v.id('layers'),
    authorId: v.id('users'),
    pointsVector: v.bytes(),
    tool: v.string(),
    color: v.string(),
    width: v.number(),
    hlcTimestamp: v.string(),
    tombstonedAt: v.optional(v.number()),
  })
    .index('by_layer', ['layerId'])
    .index('by_author', ['authorId'])
    .index('by_layer_created', ['layerId', 'hlcTimestamp']),

  cells: defineTable({
    serverId: v.id('servers'),
    quadKey: v.string(),
    snapshotStorageId: v.optional(v.id('_storage')),
    lastSnapshotAt: v.optional(v.number()),
    strokeCount: v.number(),
    docSizeBytes: v.number(),
  }).index('by_server_quadkey', ['serverId', 'quadKey']),

  reports: defineTable({
    targetType: v.union(v.literal('server'), v.literal('stroke'), v.literal('user')),
    targetId: v.string(),
    reporterId: v.id('users'),
    reason: reportReason,
    status: reportStatus,
    resolvedById: v.optional(v.id('users')),
    resolutionNote: v.optional(v.string()),
  })
    .index('by_target', ['targetType', 'targetId'])
    .index('by_status', ['status'])
    .index('by_reporter', ['reporterId']),

  bookmarks: defineTable({
    userId: v.id('users'),
    serverId: v.id('servers'),
    cellId: v.optional(v.id('cells')),
    localCoords: v.optional(v.object({ x: v.number(), y: v.number() })),
    zoom: v.optional(v.number()),
    label: v.string(),
  })
    .index('by_user', ['userId'])
    .index('by_user_server', ['userId', 'serverId']),

  featureFlags: defineTable({
    key: v.string(),
    enabled: v.boolean(),
    rolloutPercentage: v.number(),
    config: v.any(),
  }).index('by_key', ['key']),

  reputationEvents: defineTable({
    userId: v.id('users'),
    serverId: v.optional(v.id('servers')),
    eventType: v.union(
      v.literal('stroke_accepted'),
      v.literal('stroke_reported'),
      v.literal('stroke_restored'),
      v.literal('report_upheld'),
      v.literal('report_dismissed'),
    ),
    delta: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_server', ['serverId']),

  notifications: defineTable({
    userId: v.id('users'),
    type: v.union(
      v.literal('stamp_reused'),
      v.literal('access_request'),
      v.literal('server_activity'),
      v.literal('event_approaching'),
      v.literal('streak_at_risk'),
      v.literal('ranking_recognition'),
    ),
    payload: v.any(),
    isRead: v.boolean(),
  })
    .index('by_user_unread', ['userId', 'isRead'])
    .index('by_user_created', ['userId']),

  presence: defineTable({
    serverId: v.id('servers'),
    cellId: v.id('cells'),
    userId: v.id('users'),
    cursor: v.optional(v.object({ x: v.number(), y: v.number() })),
    tool: v.optional(v.string()),
    lastSeenAt: v.number(),
  })
    .index('by_cell', ['cellId'])
    .index('by_server', ['serverId'])
    .index('by_user', ['userId']),
});
