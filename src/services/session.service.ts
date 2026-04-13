import { eq, desc, and } from 'drizzle-orm';
import { db } from '@/db/client';
import {
  workoutSessions,
  sessionExercises,
  setLogs,
  exercises,
  templateExercises,
  personalRecords,
} from '@/db/schema';
import { generateId } from '@/utils/uuid';
import { now } from '@/utils/date';
import { estimated1RM } from '@/utils/oneRepMax';

export type SessionWithDetails = typeof workoutSessions.$inferSelect & {
  exercises: Array<
    typeof sessionExercises.$inferSelect & {
      exercise: typeof exercises.$inferSelect;
      sets: Array<typeof setLogs.$inferSelect>;
    }
  >;
};

export async function startSession(templateId?: string): Promise<string> {
  const id = generateId();
  const timestamp = now();

  await db.insert(workoutSessions).values({
    id,
    templateId: templateId ?? null,
    planId: null,
    startedAt: timestamp,
    completedAt: null,
    durationSec: null,
    notes: null,
    rating: null,
    bodyWeight: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  // If starting from a template, pre-populate session exercises from template
  if (templateId) {
    const tmplExercises = await db
      .select()
      .from(templateExercises)
      .where(eq(templateExercises.templateId, templateId))
      .orderBy(templateExercises.orderIndex);

    for (const te of tmplExercises) {
      const seId = generateId();
      await db.insert(sessionExercises).values({
        id: seId,
        sessionId: id,
        exerciseId: te.exerciseId,
        templateExerciseId: te.id,
        orderIndex: te.orderIndex,
        notes: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      // Pre-create empty set rows based on target sets
      const numSets = te.targetSets ?? 3;
      for (let i = 0; i < numSets; i++) {
        await db.insert(setLogs).values({
          id: generateId(),
          sessionExerciseId: seId,
          setIndex: i + 1,
          setType: 'working',
          weight: te.targetWeight,
          reps: te.targetReps,
          durationSec: te.targetDurationSec,
          rpe: null,
          isCompleted: false,
          restTakenSec: null,
          notes: null,
          createdAt: timestamp,
        });
      }
    }
  }

  return id;
}

export async function getSession(id: string): Promise<SessionWithDetails | null> {
  const session = await db
    .select()
    .from(workoutSessions)
    .where(eq(workoutSessions.id, id))
    .limit(1);
  if (session.length === 0) return null;

  const sessExercises = await db
    .select({
      sessionExercise: sessionExercises,
      exercise: exercises,
    })
    .from(sessionExercises)
    .innerJoin(exercises, eq(sessionExercises.exerciseId, exercises.id))
    .where(eq(sessionExercises.sessionId, id))
    .orderBy(sessionExercises.orderIndex);

  const result: SessionWithDetails = {
    ...session[0],
    exercises: [],
  };

  for (const se of sessExercises) {
    const sets = await db
      .select()
      .from(setLogs)
      .where(eq(setLogs.sessionExerciseId, se.sessionExercise.id))
      .orderBy(setLogs.setIndex);

    result.exercises.push({
      ...se.sessionExercise,
      exercise: se.exercise,
      sets,
    });
  }

  return result;
}

export async function addExerciseToSession(
  sessionId: string,
  exerciseId: string,
  orderIndex: number
): Promise<string> {
  const id = generateId();
  const timestamp = now();

  await db.insert(sessionExercises).values({
    id,
    sessionId,
    exerciseId,
    templateExerciseId: null,
    orderIndex,
    notes: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  // Add 3 default empty sets
  for (let i = 0; i < 3; i++) {
    await db.insert(setLogs).values({
      id: generateId(),
      sessionExerciseId: id,
      setIndex: i + 1,
      setType: 'working',
      weight: null,
      reps: null,
      durationSec: null,
      rpe: null,
      isCompleted: false,
      restTakenSec: null,
      notes: null,
      createdAt: timestamp,
    });
  }

  return id;
}

export async function addSetToExercise(sessionExerciseId: string): Promise<string> {
  const existingSets = await db
    .select()
    .from(setLogs)
    .where(eq(setLogs.sessionExerciseId, sessionExerciseId));

  const id = generateId();
  await db.insert(setLogs).values({
    id,
    sessionExerciseId,
    setIndex: existingSets.length + 1,
    setType: 'working',
    weight: null,
    reps: null,
    durationSec: null,
    rpe: null,
    isCompleted: false,
    restTakenSec: null,
    notes: null,
    createdAt: now(),
  });

  return id;
}

export async function updateSet(
  setId: string,
  data: Partial<{
    weight: number | null;
    reps: number | null;
    durationSec: number | null;
    rpe: number | null;
    isCompleted: boolean;
    setType: string;
    notes: string | null;
  }>
) {
  await db.update(setLogs).set(data).where(eq(setLogs.id, setId));
}

export async function deleteSet(setId: string) {
  await db.delete(setLogs).where(eq(setLogs.id, setId));
}

export async function completeSession(
  sessionId: string,
  data?: { notes?: string; rating?: number; bodyWeight?: number }
) {
  const timestamp = now();
  const session = await db
    .select()
    .from(workoutSessions)
    .where(eq(workoutSessions.id, sessionId))
    .limit(1);

  if (session.length === 0) return;

  const startedAt = new Date(session[0].startedAt).getTime();
  const completedAt = new Date(timestamp).getTime();
  const durationSec = Math.round((completedAt - startedAt) / 1000);

  await db
    .update(workoutSessions)
    .set({
      completedAt: timestamp,
      durationSec,
      notes: data?.notes ?? null,
      rating: data?.rating ?? null,
      bodyWeight: data?.bodyWeight ?? null,
      updatedAt: timestamp,
    })
    .where(eq(workoutSessions.id, sessionId));

  // Check for personal records
  await checkForPRs(sessionId);
}

async function checkForPRs(sessionId: string) {
  const sessExercises = await db
    .select()
    .from(sessionExercises)
    .where(eq(sessionExercises.sessionId, sessionId));

  for (const se of sessExercises) {
    const sets = await db
      .select()
      .from(setLogs)
      .where(and(eq(setLogs.sessionExerciseId, se.id), eq(setLogs.isCompleted, true)));

    for (const set of sets) {
      if (!set.weight || !set.reps) continue;

      // Check max weight PR
      const existingMaxWeight = await db
        .select()
        .from(personalRecords)
        .where(
          and(
            eq(personalRecords.exerciseId, se.exerciseId),
            eq(personalRecords.recordType, 'max_weight')
          )
        )
        .limit(1);

      if (existingMaxWeight.length === 0 || set.weight > existingMaxWeight[0].value) {
        if (existingMaxWeight.length > 0) {
          await db
            .delete(personalRecords)
            .where(eq(personalRecords.id, existingMaxWeight[0].id));
        }
        await db.insert(personalRecords).values({
          id: generateId(),
          exerciseId: se.exerciseId,
          recordType: 'max_weight',
          value: set.weight,
          achievedAt: now(),
          setLogId: set.id,
          createdAt: now(),
        });
      }

      // Check estimated 1RM PR
      const est1rm = estimated1RM(set.weight, set.reps);
      if (est1rm > 0) {
        const existing1rm = await db
          .select()
          .from(personalRecords)
          .where(
            and(
              eq(personalRecords.exerciseId, se.exerciseId),
              eq(personalRecords.recordType, 'estimated_1rm')
            )
          )
          .limit(1);

        if (existing1rm.length === 0 || est1rm > existing1rm[0].value) {
          if (existing1rm.length > 0) {
            await db.delete(personalRecords).where(eq(personalRecords.id, existing1rm[0].id));
          }
          await db.insert(personalRecords).values({
            id: generateId(),
            exerciseId: se.exerciseId,
            recordType: 'estimated_1rm',
            value: est1rm,
            achievedAt: now(),
            setLogId: set.id,
            createdAt: now(),
          });
        }
      }
    }
  }
}

export async function getRecentSessions(limit: number = 20): Promise<SessionWithDetails[]> {
  const sessions = await db
    .select()
    .from(workoutSessions)
    .orderBy(desc(workoutSessions.startedAt))
    .limit(limit);

  const result: SessionWithDetails[] = [];

  for (const session of sessions) {
    const full = await getSession(session.id);
    if (full) result.push(full);
  }

  return result;
}

export async function deleteSession(id: string) {
  await db.delete(workoutSessions).where(eq(workoutSessions.id, id));
}
