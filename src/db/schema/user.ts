import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const userProfile = sqliteTable('user_profile', {
  id: text('id').primaryKey(),
  displayName: text('display_name'),
  unitSystem: text('unit_system').notNull().default('metric'), // 'metric' | 'imperial'
  theme: text('theme').notNull().default('system'), // 'light' | 'dark' | 'system'
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});
