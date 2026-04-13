import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from './migrations/migrations';
import * as schema from './schema';

const expo = openDatabaseSync('gainz.db', { enableChangeListener: true });

export const db = drizzle(expo, { schema });

export function useRunMigrations() {
  return useMigrations(db, migrations);
}
