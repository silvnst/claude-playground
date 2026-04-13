import { sqliteTable, text, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { exercises } from './exercise';
import { setLogs } from './session';

export const personalRecords = sqliteTable('personal_records', {
  id: text('id').primaryKey(),
  exerciseId: text('exercise_id')
    .notNull()
    .references(() => exercises.id, { onDelete: 'cascade' }),
  recordType: text('record_type').notNull(), // 'max_weight' | 'max_reps' | 'max_volume' | 'estimated_1rm'
  value: real('value').notNull(),
  achievedAt: text('achieved_at').notNull(),
  setLogId: text('set_log_id').references(() => setLogs.id),
  createdAt: text('created_at').notNull(),
});

export const personalRecordsRelations = relations(personalRecords, ({ one }) => ({
  exercise: one(exercises, {
    fields: [personalRecords.exerciseId],
    references: [exercises.id],
  }),
  setLog: one(setLogs, {
    fields: [personalRecords.setLogId],
    references: [setLogs.id],
  }),
}));
