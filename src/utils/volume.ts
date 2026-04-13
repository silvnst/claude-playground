/**
 * Calculate total volume for a set: weight * reps
 */
export function setVolume(weight: number, reps: number): number {
  return weight * reps;
}

/**
 * Calculate total volume for multiple sets
 */
export function totalVolume(sets: Array<{ weight?: number | null; reps?: number | null }>): number {
  return sets.reduce((sum, set) => {
    if (set.weight && set.reps) {
      return sum + set.weight * set.reps;
    }
    return sum;
  }, 0);
}

/**
 * Format volume with appropriate units (e.g. "12,500 kg")
 */
export function formatVolume(volumeKg: number, unit: 'metric' | 'imperial'): string {
  const value = unit === 'imperial' ? volumeKg * 2.20462 : volumeKg;
  const formatted = Math.round(value).toLocaleString();
  return `${formatted} ${unit === 'imperial' ? 'lbs' : 'kg'}`;
}

/**
 * Format duration from seconds to readable string
 */
export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}
