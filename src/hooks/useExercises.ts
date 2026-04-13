import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllEquipment, getAllMuscleGroups, getExerciseById, getExercises } from '@/services/exercise.service';

export function useExercises(filters?: { search?: string; muscleGroupId?: string; equipmentId?: string; category?: string }) {
  return useQuery({
    queryKey: ['exercises', filters],
    queryFn: () => getExercises(filters),
  });
}

export function useExerciseById(id: string) {
  return useQuery({
    queryKey: ['exercises', id],
    queryFn: () => getExerciseById(id),
    enabled: !!id,
  });
}

export function useMuscleGroups() {
  return useQuery({
    queryKey: ['muscleGroups'],
    queryFn: getAllMuscleGroups,
  });
}

export function useEquipment() {
  return useQuery({
    queryKey: ['equipment'],
    queryFn: getAllEquipment,
  });
}
