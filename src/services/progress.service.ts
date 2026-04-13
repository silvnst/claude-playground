import { eq, desc, and } from 'drizzle-orm';
import { db } from '@/db/client';
import {
  personalRecords,
  setLogs,
  sessionExercises,
  workoutSessions,
  exercises,
} from '@/db/schema';

export type ExerciseHistory = {
  sessionId: string;
  date: string;
  sets: Array<{
    setIndex: number;
    weight: number | null;
    reps: number | null;
    isCompleted: boolean;
  }>;
};

export async function getExerciseHistory(
  exerciseId: string,
  limit: number = 20
): Promise<ExerciseHistory[]> {
  const sessExs = await db
    .select({
      sessionExercise: sessionExercises,
      session: workoutSessions,
    })
    .from(sessionExercises)
    .innerJoin(workoutSessions, eq(sessionExercises.sessionId, workoutSessions.id))
    .where(eq(sessionExercises.exerciseId, exerciseId))
    .orderBy(desc(workoutSessions.startedAt))
    .limit(limit);

  const result: ExerciseHistory[] = [];

  for (const { sessionExercise, session } of sessExs) {
    const sets = await db
      .select()
      .from(setLogs)
      .where(eq(setLogs.sessionExerciseId, sessionExercise.id))
      .orderBy(setLogs.setIndex);

    result.push({
      sessionId: session.id,
      date: session.startedAt,
      sets: sets.map((s) => ({
        setIndex: s.setIndex,
        weight: s.weight,
        reps: s.reps,
        isCompleted: s.isCompleted,
      })),
    });
  }

  return result;
}

export async function getPersonalRecords(exerciseId: string) {
  return db
    .select()
    .from(personalRecords)
    .where(eq(personalRecords.exerciseId, exerciseId))
    .orderBy(desc(personalRecords.achievedAt));
}

export async function getAllPersonalRecords() {
  return db
    .select({
      record: personalRecords,
      exercise: exercises,
    })
    .from(personalRecords)
    .innerJoin(exercises, eq(personalRecords.exerciseId, exercises.id))
    .orderBy(desc(personalRecords.achievedAt));
}

export async function getWorkoutStreak(): Promise<number> {
  const sessions = await db
    .select({ startedAt: workoutSessions.startedAt })
    .from(workoutSessions)
    .where(eq(workoutSessions.completedAt, workoutSessions.completedAt)) // only completed
    .orderBy(desc(workoutSessions.startedAt));

  if (sessions.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentDate = new Date(today);

  for (const session of sessions) {
    const sessionDate = new Date(session.startedAt);
    sessionDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round(
      (currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays <= 1) {
      streak++;
      currentDate = sessionDate;
    } else {
      break;
    }
  }

  return streak;
}

export async function getTotalWorkouts(): Promise<number> {
  const sessions = await db.select().from(workoutSessions);
  return sessions.filter((s) => s.completedAt !== null).length;
}
