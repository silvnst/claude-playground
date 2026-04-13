import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { exercises, } from './exercise';
import { trainingTemplates, templateExercises } from './template';
import { trainingPlans } from './plan';

export const workoutSessions = sqliteTable('workout_sessions', {
  id: text('id').primaryKey(),
  templateId: text('template_id').references(() => trainingTemplates.id),
  planId: text('plan_id').references(() => trainingPlans.id),
  startedAt: text('started_at').notNull(),
  completedAt: text('completed_at'),
  durationSec: integer('duration_sec'),
  notes: text('notes'),
  rating: integer('rating'), // 1-5
  bodyWeight: real('body_weight'), // optional: user's weight that day in kg
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const sessionExercises = sqliteTable('session_exercises', {
  id: text('id').primaryKey(),
  sessionId: text('session_id')
    .notNull()
    .references(() => workoutSessions.id, { onDelete: 'cascade' }),
  exerciseId: text('exercise_id')
    .notNull()
    .references(() => exercises.id),
  templateExerciseId: text('template_exercise_id').references(() => templateExercises.id),
  orderIndex: integer('order_index').notNull(),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const setLogs = sqliteTable('set_logs', {
  id: text('id').primaryKey(),
  sessionExerciseId: text('session_exercise_id')
    .notNull()
    .references(() => sessionExercises.id, { onDelete: 'cascade' }),
  setIndex: integer('set_index').notNull(), // 1, 2, 3…
  setType: text('set_type').notNull().default('working'), // 'working' | 'warmup' | 'dropset' | 'failure' | 'amrap'
  weight: real('weight'), // actual weight used in kg
  reps: integer('reps'),
  durationSec: integer('duration_sec'), // for timed sets
  rpe: real('rpe'), // Rate of Perceived Exertion 6-10
  isCompleted: integer('is_completed', { mode: 'boolean' }).notNull().default(false),
  restTakenSec: integer('rest_taken_sec'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});

// Relations
export const workoutSessionsRelations = relations(workoutSessions, ({ one, many }) => ({
  template: one(trainingTemplates, {
    fields: [workoutSessions.templateId],
    references: [trainingTemplates.id],
  }),
  plan: one(trainingPlans, {
    fields: [workoutSessions.planId],
    references: [trainingPlans.id],
  }),
  exercises: many(sessionExercises),
}));

export const sessionExercisesRelations = relations(sessionExercises, ({ one, many }) => ({
  session: one(workoutSessions, {
    fields: [sessionExercises.sessionId],
    references: [workoutSessions.id],
  }),
  exercise: one(exercises, {
    fields: [sessionExercises.exerciseId],
    references: [exercises.id],
  }),
  templateExercise: one(templateExercises, {
    fields: [sessionExercises.templateExerciseId],
    references: [templateExercises.id],
  }),
  sets: many(setLogs),
}));

export const setLogsRelations = relations(setLogs, ({ one }) => ({
  sessionExercise: one(sessionExercises, {
    fields: [setLogs.sessionExerciseId],
    references: [sessionExercises.id],
  }),
}));
