import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

// Legacy activation records are retained for migration history; they no longer grant access.
export const admin = sqliteTable('admin', {
  slot: integer('slot').primaryKey(),
  userId: text('user_id').notNull().unique(),
  createdAt: integer('created_at').notNull(),
});

export const media = sqliteTable('media', {
  id: text('id').primaryKey(),
  objectKey: text('object_key').notNull().unique(),
  mime: text('mime').notNull(),
  size: integer('size').notNull(),
  title: text('title').notNull().default(''),
  caption: text('caption').notNull().default(''),
  published: integer('published').notNull().default(0),
  position: integer('position').notNull().default(0),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
}, table => [index('idx_media_published_position').on(table.published, table.position, table.createdAt)]);

// Only hashes of opaque browser session tokens are stored, never the cookie itself.
export const adminSessions = sqliteTable('admin_sessions', {
  tokenHash: text('token_hash').primaryKey(),
  credentialVersion: text('credential_version').notNull(),
  expiresAt: integer('expires_at').notNull(),
}, table => [index('idx_admin_sessions_expires').on(table.expiresAt)]);

export const loginLimits = sqliteTable('login_limits', {
  bucket: text('bucket').primaryKey(),
  attempts: integer('attempts').notNull(),
  startedAt: integer('started_at').notNull(),
}, table => [index('idx_login_limits_started').on(table.startedAt)]);
