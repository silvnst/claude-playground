import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { exercises } from './exercise';

export const trainingTemplates = sqliteTable('training_templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  estimatedDurationMin: integer('estimated_duration_min'),
  color: text('color').default('#f97316'), // hex color for UI
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const templateExercises = sqliteTable('template_exercises', {
  id: text('id').primaryKey(),
  templateId: text('template_id')
    .notNull()
    .references(() => trainingTemplates.id, { onDelete: 'cascade' }),
  exerciseId: text('exercise_id')
    .notNull()
    .references(() => exercises.id),
  orderIndex: integer('order_index').notNull(),
  targetSets: integer('target_sets'),
  targetReps: integer('target_reps'),
  targetWeight: real('target_weight'), // in kg
  targetDurationSec: integer('target_duration_sec'),
  restPeriodSec: integer('rest_period_sec').default(90),
  notes: text('notes'),
  supersetGroup: integer('superset_group'), // NULL = standalone; same number = superset
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Relations
export const trainingTemplatesRelations = relations(trainingTemplates, ({ many }) => ({
  exercises: many(templateExercises),
}));

export const templateExercisesRelations = relations(templateExercises, ({ one }) => ({
  template: one(trainingTemplates, {
    fields: [templateExercises.templateId],
    references: [trainingTemplates.id],
  }),
  exercise: one(exercises, {
    fields: [templateExercises.exerciseId],
    references: [exercises.id],
  }),
}));
