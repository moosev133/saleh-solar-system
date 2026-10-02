import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

// One owner, bound to the stable identity supplied by the hosting dispatcher.
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
