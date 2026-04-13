/**
 * Epley formula: 1RM = weight * (1 + reps / 30)
 * Most widely used, accurate for moderate rep ranges (1-10)
 */
export function epley(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

/**
 * Brzycki formula: 1RM = weight * 36 / (37 - reps)
 * More conservative, especially accurate for 1-6 reps
 */
export function brzycki(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  if (reps >= 37) return 0; // formula breaks
  return Math.round((weight * 36) / (37 - reps) * 10) / 10;
}

/**
 * Estimated 1RM using the average of Epley and Brzycki
 */
export function estimated1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(((epley(weight, reps) + brzycki(weight, reps)) / 2) * 10) / 10;
}
