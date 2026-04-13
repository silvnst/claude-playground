import { sqliteTable, text, integer, real, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const exercises = sqliteTable('exercises', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(), // 'strength' | 'cardio' | 'flexibility' | 'plyometric'
  movementPattern: text('movement_pattern'), // 'push' | 'pull' | 'squat' | 'hinge' | 'carry' | 'rotation' | 'isolation'
  mechanic: text('mechanic'), // 'compound' | 'isolation'
  difficulty: text('difficulty'), // 'beginner' | 'intermediate' | 'advanced'
  instructions: text('instructions'), // JSON array of step strings
  isCustom: integer('is_custom', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const muscleGroups = sqliteTable('muscle_groups', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  bodyRegion: text('body_region').notNull(), // 'upper_body' | 'lower_body' | 'core'
});

export const equipment = sqliteTable('equipment', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
});

export const exerciseMuscleGroups = sqliteTable(
  'exercise_muscle_groups',
  {
    exerciseId: text('exercise_id')
      .notNull()
      .references(() => exercises.id, { onDelete: 'cascade' }),
    muscleGroupId: text('muscle_group_id')
      .notNull()
      .references(() => muscleGroups.id, { onDelete: 'cascade' }),
    role: text('role').notNull(), // 'primary' | 'secondary' | 'stabilizer'
  },
  (t) => [primaryKey({ columns: [t.exerciseId, t.muscleGroupId, t.role] })]
);

export const exerciseEquipment = sqliteTable(
  'exercise_equipment',
  {
    exerciseId: text('exercise_id')
      .notNull()
      .references(() => exercises.id, { onDelete: 'cascade' }),
    equipmentId: text('equipment_id')
      .notNull()
      .references(() => equipment.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.exerciseId, t.equipmentId] })]
);

// Relations
export const exercisesRelations = relations(exercises, ({ many }) => ({
  muscleGroups: many(exerciseMuscleGroups),
  equipment: many(exerciseEquipment),
}));

export const muscleGroupsRelations = relations(muscleGroups, ({ many }) => ({
  exercises: many(exerciseMuscleGroups),
}));

export const equipmentRelations = relations(equipment, ({ many }) => ({
  exercises: many(exerciseEquipment),
}));

export const exerciseMuscleGroupsRelations = relations(exerciseMuscleGroups, ({ one }) => ({
  exercise: one(exercises, {
    fields: [exerciseMuscleGroups.exerciseId],
    references: [exercises.id],
  }),
  muscleGroup: one(muscleGroups, {
    fields: [exerciseMuscleGroups.muscleGroupId],
    references: [muscleGroups.id],
  }),
}));

export const exerciseEquipmentRelations = relations(exerciseEquipment, ({ one }) => ({
  exercise: one(exercises, {
    fields: [exerciseEquipment.exerciseId],
    references: [exercises.id],
  }),
  equipment: one(equipment, {
    fields: [exerciseEquipment.equipmentId],
    references: [equipment.id],
  }),
}));
