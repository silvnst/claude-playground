import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  addExerciseToSession,
  addSetToExercise,
  completeSession,
  deleteSession,
  deleteSet,
  getSession,
  getRecentSessions,
  startSession,
  updateSet,
} from '@/services/session.service';

export function useWorkoutSession(sessionId: string) {
  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => getSession(sessionId),
    enabled: !!sessionId,
  });
}

export function useRecentSessions(limit?: number) {
  return useQuery({
    queryKey: ['sessions', 'recent', limit],
    queryFn: () => getRecentSessions(limit),
  });
}

export function useStartSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startSession,
    onSuccess: (sessionId) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.setQueryData(['session', sessionId], null); // Will refetch
    },
  });
}

export function useAddExerciseToSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, exerciseId, orderIndex }: { sessionId: string; exerciseId: string; orderIndex: number }) =>
      addExerciseToSession(sessionId, exerciseId, orderIndex),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['session', variables.sessionId] });
    },
  });
}

export function useAddSetToExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addSetToExercise,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
    },
  });
}

export function useUpdateSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ setId, data }: { setId: string; data: Parameters<typeof updateSet>[1] }) => updateSet(setId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
    },
  });
}

export function useDeleteSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
    },
  });
}

export function useCompleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data?: Parameters<typeof completeSession>[1] }) =>
      completeSession(sessionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['session', variables.sessionId] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

/**
 * Hook for managing active workout session UI state (timer, current exercise index, etc)
 */
export function useActiveWorkoutUI(sessionId: string) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [restTimeRemaining, setRestTimeRemaining] = useState<number | null>(null);
  const [isResting, setIsResting] = useState(false);

  return {
    elapsedSeconds,
    setElapsedSeconds,
    currentExerciseIndex,
    setCurrentExerciseIndex,
    restTimeRemaining,
    setRestTimeRemaining,
    isResting,
    setIsResting,
  };
}
