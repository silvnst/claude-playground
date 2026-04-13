import { eq, desc } from 'drizzle-orm';
import { db } from '@/db/client';
import { trainingTemplates, templateExercises, exercises } from '@/db/schema';
import { generateId } from '@/utils/uuid';
import { now } from '@/utils/date';

export type TemplateWithExercises = typeof trainingTemplates.$inferSelect & {
  exercises: Array<
    typeof templateExercises.$inferSelect & {
      exercise: typeof exercises.$inferSelect;
    }
  >;
};

export async function getTemplates(): Promise<TemplateWithExercises[]> {
  const templates = await db
    .select()
    .from(trainingTemplates)
    .orderBy(desc(trainingTemplates.updatedAt));

  const result: TemplateWithExercises[] = [];

  for (const tmpl of templates) {
    const tmplExercises = await db
      .select({
        templateExercise: templateExercises,
        exercise: exercises,
      })
      .from(templateExercises)
      .innerJoin(exercises, eq(templateExercises.exerciseId, exercises.id))
      .where(eq(templateExercises.templateId, tmpl.id))
      .orderBy(templateExercises.orderIndex);

    result.push({
      ...tmpl,
      exercises: tmplExercises.map((te) => ({
        ...te.templateExercise,
        exercise: te.exercise,
      })),
    });
  }

  return result;
}

export async function getTemplateById(id: string): Promise<TemplateWithExercises | null> {
  const tmpl = await db
    .select()
    .from(trainingTemplates)
    .where(eq(trainingTemplates.id, id))
    .limit(1);
  if (tmpl.length === 0) return null;

  const tmplExercises = await db
    .select({
      templateExercise: templateExercises,
      exercise: exercises,
    })
    .from(templateExercises)
    .innerJoin(exercises, eq(templateExercises.exerciseId, exercises.id))
    .where(eq(templateExercises.templateId, id))
    .orderBy(templateExercises.orderIndex);

  return {
    ...tmpl[0],
    exercises: tmplExercises.map((te) => ({
      ...te.templateExercise,
      exercise: te.exercise,
    })),
  };
}

export async function createTemplate(data: {
  name: string;
  description?: string;
  estimatedDurationMin?: number;
  color?: string;
  exercises: Array<{
    exerciseId: string;
    targetSets?: number;
    targetReps?: number;
    targetWeight?: number;
    targetDurationSec?: number;
    restPeriodSec?: number;
    notes?: string;
    supersetGroup?: number;
  }>;
}): Promise<string> {
  const id = generateId();
  const timestamp = now();

  await db.insert(trainingTemplates).values({
    id,
    name: data.name,
    description: data.description ?? null,
    estimatedDurationMin: data.estimatedDurationMin ?? null,
    color: data.color ?? '#f97316',
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  if (data.exercises.length > 0) {
    await db.insert(templateExercises).values(
      data.exercises.map((ex, index) => ({
        id: generateId(),
        templateId: id,
        exerciseId: ex.exerciseId,
        orderIndex: index,
        targetSets: ex.targetSets ?? null,
        targetReps: ex.targetReps ?? null,
        targetWeight: ex.targetWeight ?? null,
        targetDurationSec: ex.targetDurationSec ?? null,
        restPeriodSec: ex.restPeriodSec ?? 90,
        notes: ex.notes ?? null,
        supersetGroup: ex.supersetGroup ?? null,
        createdAt: timestamp,
        updatedAt: timestamp,
      }))
    );
  }

  return id;
}

export async function updateTemplate(
  id: string,
  data: {
    name?: string;
    description?: string;
    estimatedDurationMin?: number;
    color?: string;
  }
) {
  await db
    .update(trainingTemplates)
    .set({ ...data, updatedAt: now() })
    .where(eq(trainingTemplates.id, id));
}

export async function deleteTemplate(id: string) {
  await db.delete(trainingTemplates).where(eq(trainingTemplates.id, id));
}
