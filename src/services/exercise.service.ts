import { eq, like, and, inArray } from 'drizzle-orm';
import { db } from '@/db/client';
import {
  exercises,
  exerciseMuscleGroups,
  exerciseEquipment,
  muscleGroups,
  equipment,
} from '@/db/schema';

export type ExerciseWithDetails = typeof exercises.$inferSelect & {
  muscleGroups: Array<{
    muscleGroup: typeof muscleGroups.$inferSelect;
    role: string;
  }>;
  equipment: Array<typeof equipment.$inferSelect>;
};

export async function getExercises(filters?: {
  search?: string;
  muscleGroupId?: string;
  equipmentId?: string;
  category?: string;
}): Promise<ExerciseWithDetails[]> {
  const conditions = [];

  if (filters?.search) {
    conditions.push(like(exercises.name, `%${filters.search}%`));
  }
  if (filters?.category) {
    conditions.push(eq(exercises.category, filters.category));
  }

  if (filters?.muscleGroupId) {
    const matchingExercises = await db
      .select({ exerciseId: exerciseMuscleGroups.exerciseId })
      .from(exerciseMuscleGroups)
      .where(eq(exerciseMuscleGroups.muscleGroupId, filters.muscleGroupId));
    const ids = matchingExercises.map((e) => e.exerciseId);
    if (ids.length === 0) return [];
    conditions.push(inArray(exercises.id, ids));
  }

  if (filters?.equipmentId) {
    const matchingExercises = await db
      .select({ exerciseId: exerciseEquipment.exerciseId })
      .from(exerciseEquipment)
      .where(eq(exerciseEquipment.equipmentId, filters.equipmentId));
    const ids = matchingExercises.map((e) => e.exerciseId);
    if (ids.length === 0) return [];
    conditions.push(inArray(exercises.id, ids));
  }

  const baseExercises =
    conditions.length > 0
      ? await db.select().from(exercises).where(and(...conditions)).orderBy(exercises.name)
      : await db.select().from(exercises).orderBy(exercises.name);

  if (baseExercises.length === 0) return [];

  return attachDetailsToExercises(baseExercises);
}

export async function getExerciseById(id: string): Promise<ExerciseWithDetails | null> {
  const ex = await db.select().from(exercises).where(eq(exercises.id, id)).limit(1);
  if (ex.length === 0) return null;

  const [withDetails] = await attachDetailsToExercises(ex);
  return withDetails ?? null;
}

/** Batch-fetches muscle groups and equipment for a list of exercises (no N+1). */
async function attachDetailsToExercises(
  baseExercises: (typeof exercises.$inferSelect)[]
): Promise<ExerciseWithDetails[]> {
  const ids = baseExercises.map((ex) => ex.id);

  const [allMgs, allEqs] = await Promise.all([
    db
      .select({
        exerciseId: exerciseMuscleGroups.exerciseId,
        muscleGroup: muscleGroups,
        role: exerciseMuscleGroups.role,
      })
      .from(exerciseMuscleGroups)
      .innerJoin(muscleGroups, eq(exerciseMuscleGroups.muscleGroupId, muscleGroups.id))
      .where(inArray(exerciseMuscleGroups.exerciseId, ids)),
    db
      .select({
        exerciseId: exerciseEquipment.exerciseId,
        equipment: equipment,
      })
      .from(exerciseEquipment)
      .innerJoin(equipment, eq(exerciseEquipment.equipmentId, equipment.id))
      .where(inArray(exerciseEquipment.exerciseId, ids)),
  ]);

  const mgsByExercise = new Map<string, { muscleGroup: typeof muscleGroups.$inferSelect; role: string }[]>();
  for (const row of allMgs) {
    const list = mgsByExercise.get(row.exerciseId) ?? [];
    list.push({ muscleGroup: row.muscleGroup, role: row.role });
    mgsByExercise.set(row.exerciseId, list);
  }

  const eqsByExercise = new Map<string, (typeof equipment.$inferSelect)[]>();
  for (const row of allEqs) {
    const list = eqsByExercise.get(row.exerciseId) ?? [];
    list.push(row.equipment);
    eqsByExercise.set(row.exerciseId, list);
  }

  return baseExercises.map((ex) => ({
    ...ex,
    muscleGroups: mgsByExercise.get(ex.id) ?? [],
    equipment: eqsByExercise.get(ex.id) ?? [],
  }));
}

export async function createCustomExercise(data: {
  id: string;
  name: string;
  description?: string;
  category: string;
  movementPattern?: string;
  mechanic?: string;
  difficulty?: string;
  instructions?: string;
  muscleGroupIds?: Array<{ id: string; role: string }>;
  equipmentIds?: string[];
}) {
  const timestamp = new Date().toISOString();

  await db.insert(exercises).values({
    id: data.id,
    name: data.name,
    description: data.description ?? null,
    category: data.category,
    movementPattern: data.movementPattern ?? null,
    mechanic: data.mechanic ?? null,
    difficulty: data.difficulty ?? null,
    instructions: data.instructions ?? null,
    isCustom: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  if (data.muscleGroupIds?.length) {
    await db.insert(exerciseMuscleGroups).values(
      data.muscleGroupIds.map((mg) => ({
        exerciseId: data.id,
        muscleGroupId: mg.id,
        role: mg.role,
      }))
    );
  }

  if (data.equipmentIds?.length) {
    await db.insert(exerciseEquipment).values(
      data.equipmentIds.map((eqId) => ({
        exerciseId: data.id,
        equipmentId: eqId,
      }))
    );
  }
}

export async function getAllMuscleGroups() {
  return db.select().from(muscleGroups).orderBy(muscleGroups.bodyRegion, muscleGroups.name);
}

export async function getAllEquipment() {
  return db.select().from(equipment).orderBy(equipment.name);
}
