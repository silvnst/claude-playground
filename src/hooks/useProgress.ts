import { useQuery } from '@tanstack/react-query';
import { getExerciseHistory, getPersonalRecords, getAllPersonalRecords, getWorkoutStreak, getTotalWorkouts } from '@/services/progress.service';

export function useExerciseHistory(exerciseId: string, limit?: number) {
  return useQuery({
    queryKey: ['progress', 'history', exerciseId],
    queryFn: () => getExerciseHistory(exerciseId, limit),
    enabled: !!exerciseId,
  });
}

export function usePersonalRecords(exerciseId: string) {
  return useQuery({
    queryKey: ['progress', 'records', exerciseId],
    queryFn: () => getPersonalRecords(exerciseId),
    enabled: !!exerciseId,
  });
}

export function useAllPersonalRecords() {
  return useQuery({
    queryKey: ['progress', 'records', 'all'],
    queryFn: getAllPersonalRecords,
  });
}

export function useWorkoutStreak() {
  return useQuery({
    queryKey: ['progress', 'streak'],
    queryFn: getWorkoutStreak,
  });
}

export function useTotalWorkouts() {
  return useQuery({
    queryKey: ['progress', 'total'],
    queryFn: getTotalWorkouts,
  });
}
