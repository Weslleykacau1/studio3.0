import { sql } from 'drizzle-orm';
import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  createdAt: text('created_at').notNull(),
});

export const influencers = sqliteTable('influencers', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  niche: text('niche').notNull(),
  personality: text('personality').notNull(),
  appearance: text('appearance').notNull(),
  bio: text('bio').notNull(),
  uniqueTrait: text('unique_trait').notNull(),
  negativePrompt: text('negative_prompt').notNull(),
  age: text('age').notNull(),
  gender: text('gender').notNull(),
  accent: text('accent').notNull(),
  seed: integer('seed').notNull(),
  imagePreview: text('image_preview'),
  createdAt: text('created_at').notNull(),
});

export const scenes = sqliteTable('scenes', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  setting: text('setting').notNull(),
  action: text('action').notNull(),
  dialogue: text('dialogue').notNull(),
  cameraAngle: text('camera_angle').notNull(),
  duration: text('duration').notNull(),
  videoFormat: text('video_format').notNull(),
  productName: text('product_name'),
  productBrand: text('product_brand'),
  productDescription: text('product_description'),
  productImagePreview: text('product_image_preview'),
  productImageType: text('product_image_type'),
  isPartnership: integer('is_partnership', { mode: 'boolean' }).default(false),
  scenarioImagePreview: text('scenario_image_preview'),
  scenarioImageType: text('scenario_image_type'),
  allowDigitalText: integer('allow_digital_text', { mode: 'boolean' }).default(false),
  onlyPhysicalText: integer('only_physical_text', { mode: 'boolean' }).default(false),
  markdownScript: text('markdown_script'),
  createdAt: text('created_at').notNull(),
});
