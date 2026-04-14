import { db } from '@/db/client';
import { userProfile } from '@/db/schema';
import { now } from '@/utils/date';

export async function getUserProfile() {
  const result = await db.select().from(userProfile).limit(1);
  return result[0] ?? null;
}

export async function updateUserProfile(data: {
  displayName?: string | null;
  unitSystem?: 'metric' | 'imperial';
  theme?: 'light' | 'dark' | 'system';
}) {
  await db.update(userProfile).set({ ...data, updatedAt: now() });
}
