import { db } from '@/db/client';
import {
  exercises,
  muscleGroups,
  equipment,
  exerciseMuscleGroups,
  exerciseEquipment,
  userProfile,
} from '@/db/schema';
import { MUSCLE_GROUPS } from './muscle-groups';
import { EQUIPMENT } from './equipment';
import { SEED_EXERCISES, EXERCISE_MUSCLE_GROUPS, EXERCISE_EQUIPMENT } from './exercises';
import { generateId } from '@/utils/uuid';
import { now } from '@/utils/date';

let seeded = false;

export async function seedDatabase() {
  if (seeded) return;
  seeded = true;

  try {
    // Check if we already have exercises (seed check)
    const existingExercises = await db.select().from(exercises).limit(1);
    if (existingExercises.length > 0) {
      return; // Already seeded
    }

    console.log('[DB] Seeding database...');

    // 1. Seed muscle groups
    await db.insert(muscleGroups).values(
      MUSCLE_GROUPS.map((mg) => ({
        id: mg.id,
        name: mg.name,
        bodyRegion: mg.bodyRegion,
      }))
    );
    console.log(`[DB] ✓ Seeded ${MUSCLE_GROUPS.length} muscle groups`);

    // 2. Seed equipment
    await db.insert(equipment).values(
      EQUIPMENT.map((eq) => ({
        id: eq.id,
        name: eq.name,
      }))
    );
    console.log(`[DB] ✓ Seeded ${EQUIPMENT.length} equipment types`);

    // 3. Seed exercises
    await db.insert(exercises).values(
      SEED_EXERCISES.map((ex) => ({
        id: ex.id,
        name: ex.name,
        description: ex.description ?? null,
        category: ex.category,
        movementPattern: ex.movementPattern ?? null,
        mechanic: ex.mechanic ?? null,
        difficulty: ex.difficulty ?? null,
        instructions: ex.instructions ?? null,
        isCustom: false,
        createdAt: now(),
        updatedAt: now(),
      }))
    );
    console.log(`[DB] ✓ Seeded ${SEED_EXERCISES.length} exercises`);

    // 4. Seed exercise-muscle group mappings
    await db.insert(exerciseMuscleGroups).values(EXERCISE_MUSCLE_GROUPS);
    console.log(`[DB] ✓ Seeded ${EXERCISE_MUSCLE_GROUPS.length} exercise-muscle group mappings`);

    // 5. Seed exercise-equipment mappings
    await db.insert(exerciseEquipment).values(EXERCISE_EQUIPMENT);
    console.log(`[DB] ✓ Seeded ${EXERCISE_EQUIPMENT.length} exercise-equipment mappings`);

    // 6. Create default user profile if not exists
    const existingProfile = await db.select().from(userProfile).limit(1);
    if (existingProfile.length === 0) {
      const profileId = generateId();
      await db.insert(userProfile).values({
        id: profileId,
        displayName: 'Athlete',
        unitSystem: 'metric',
        theme: 'system',
        createdAt: now(),
        updatedAt: now(),
      });
      console.log('[DB] ✓ Created default user profile');
    }

    console.log('[DB] Database seed complete ✓');
  } catch (error) {
    console.error('[DB] Seed error:', error);
    throw error;
  }
}
