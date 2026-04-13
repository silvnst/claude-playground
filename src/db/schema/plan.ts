import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { trainingTemplates } from './template';

export const trainingPlans = sqliteTable('training_plans', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  scheduleType: text('schedule_type').notNull().default('weekly'), // 'weekly' | 'rotating' | 'sequential'
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const planEntries = sqliteTable('plan_entries', {
  id: text('id').primaryKey(),
  planId: text('plan_id')
    .notNull()
    .references(() => trainingPlans.id, { onDelete: 'cascade' }),
  templateId: text('template_id')
    .notNull()
    .references(() => trainingTemplates.id),
  dayIndex: integer('day_index').notNull(), // 0-6 for weekly (Mon=0), or position for rotating
  dayLabel: text('day_label'), // "Monday", "Day 1", etc.
  orderIndex: integer('order_index').notNull().default(0),
});

// Relations
export const trainingPlansRelations = relations(trainingPlans, ({ many }) => ({
  entries: many(planEntries),
}));

export const planEntriesRelations = relations(planEntries, ({ one }) => ({
  plan: one(trainingPlans, {
    fields: [planEntries.planId],
    references: [trainingPlans.id],
  }),
  template: one(trainingTemplates, {
    fields: [planEntries.templateId],
    references: [trainingTemplates.id],
  }),
}));
