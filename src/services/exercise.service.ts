import { eq, like, and, inArray, sql } from 'drizzle-orm';
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
  let query = db.select().from(exercises);

  const conditions = [];

  if (filters?.search) {
    conditions.push(like(exercises.name, `%${filters.search}%`));
  }
  if (filters?.category) {
    conditions.push(eq(exercises.category, filters.category));
  }

  let exerciseIds: string[] | undefined;

  if (filters?.muscleGroupId) {
    const matchingExercises = await db
      .select({ exerciseId: exerciseMuscleGroups.exerciseId })
      .from(exerciseMuscleGroups)
      .where(eq(exerciseMuscleGroups.muscleGroupId, filters.muscleGroupId));
    exerciseIds = matchingExercises.map((e) => e.exerciseId);
    if (exerciseIds.length === 0) return [];
    conditions.push(inArray(exercises.id, exerciseIds));
  }

  if (filters?.equipmentId) {
    const matchingExercises = await db
      .select({ exerciseId: exerciseEquipment.exerciseId })
      .from(exerciseEquipment)
      .where(eq(exerciseEquipment.equipmentId, filters.equipmentId));
    const eqIds = matchingExercises.map((e) => e.exerciseId);
    if (eqIds.length === 0) return [];
    conditions.push(inArray(exercises.id, eqIds));
  }

  const baseExercises =
    conditions.length > 0
      ? await db.select().from(exercises).where(and(...conditions)).orderBy(exercises.name)
      : await db.select().from(exercises).orderBy(exercises.name);

  const result: ExerciseWithDetails[] = [];

  for (const ex of baseExercises) {
    const mgs = await db
      .select({
        muscleGroup: muscleGroups,
        role: exerciseMuscleGroups.role,
      })
      .from(exerciseMuscleGroups)
      .innerJoin(muscleGroups, eq(exerciseMuscleGroups.muscleGroupId, muscleGroups.id))
      .where(eq(exerciseMuscleGroups.exerciseId, ex.id));

    const eqs = await db
      .select({ equipment: equipment })
      .from(exerciseEquipment)
      .innerJoin(equipment, eq(exerciseEquipment.equipmentId, equipment.id))
      .where(eq(exerciseEquipment.exerciseId, ex.id));

    result.push({
      ...ex,
      muscleGroups: mgs.map((mg) => ({ muscleGroup: mg.muscleGroup, role: mg.role })),
      equipment: eqs.map((e) => e.equipment),
    });
  }

  return result;
}

export async function getExerciseById(id: string): Promise<ExerciseWithDetails | null> {
  const ex = await db.select().from(exercises).where(eq(exercises.id, id)).limit(1);
  if (ex.length === 0) return null;

  const mgs = await db
    .select({
      muscleGroup: muscleGroups,
      role: exerciseMuscleGroups.role,
    })
    .from(exerciseMuscleGroups)
    .innerJoin(muscleGroups, eq(exerciseMuscleGroups.muscleGroupId, muscleGroups.id))
    .where(eq(exerciseMuscleGroups.exerciseId, id));

  const eqs = await db
    .select({ equipment: equipment })
    .from(exerciseEquipment)
    .innerJoin(equipment, eq(exerciseEquipment.equipmentId, equipment.id))
    .where(eq(exerciseEquipment.exerciseId, id));

  return {
    ...ex[0],
    muscleGroups: mgs.map((mg) => ({ muscleGroup: mg.muscleGroup, role: mg.role })),
    equipment: eqs.map((e) => e.equipment),
  };
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
