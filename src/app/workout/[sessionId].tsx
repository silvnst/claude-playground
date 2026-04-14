import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  useWorkoutSession,
  useUpdateSet,
  useAddSetToExercise,
  useCompleteSession,
  useDeleteSet,
  useActiveWorkoutUI,
} from '@/hooks/useWorkoutSession';
import { Button } from '@/components/ui/Button';
import { SetRow } from '@/components/workout/SetRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { Ionicons } from '@expo/vector-icons';
import { formatDuration } from '@/utils/volume';

export default function WorkoutScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { data: session, isLoading } = useWorkoutSession(sessionId);
  const updateSet = useUpdateSet();
  const addSet = useAddSetToExercise();
  const deleteSet = useDeleteSet();
  const completeSession = useCompleteSession();
  const { elapsedSeconds, setElapsedSeconds, currentExerciseIndex, setCurrentExerciseIndex } =
    useActiveWorkoutUI(sessionId);

  const [localWeights, setLocalWeights] = useState<Record<string, string>>({});
  const [localReps, setLocalReps] = useState<Record<string, string>>({});

  // Elapsed timer
  useEffect(() => {
    const interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading || !session) {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center">
        <Text className="text-white">Loading workout...</Text>
      </View>
    );
  }

  const currentExercise = session.exercises[currentExerciseIndex];
  const hasExercises = session.exercises.length > 0;

  const openExercisePicker = useCallback(() => {
    router.push(`/exercise/picker?sessionId=${sessionId}`);
  }, [router, sessionId]);

  const handleToggleSetComplete = useCallback((setId: string) => {
    const set = currentExercise?.sets.find((s) => s.id === setId);
    if (!set) return;
    const weight = localWeights[setId] ? parseFloat(localWeights[setId]) : set.weight;
    const reps = localReps[setId] ? parseInt(localReps[setId], 10) : set.reps;
    updateSet.mutate({ setId, sessionId, data: { weight, reps, isCompleted: !set.isCompleted } });
  }, [currentExercise, localWeights, localReps, sessionId, updateSet]);

  const handleDeleteSet = useCallback((setId: string) => {
    deleteSet.mutate({ setId, sessionId });
  }, [deleteSet, sessionId]);

  const handleFinishWorkout = () => {
    Alert.alert('Finish Workout?', 'Mark this workout as complete?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Finish',
        onPress: () =>
          completeSession.mutate(
            { sessionId, data: { notes: `Completed ${session.exercises.length} exercises` } },
            { onSuccess: () => router.replace(`/workout/summary/${sessionId}`) }
          ),
      },
    ]);
  };

  return (
    <View className="flex-1 bg-slate-950">
      {/* Header */}
      <View className="bg-slate-900 px-4 py-4 flex-row items-center justify-between border-b border-slate-800">
        <View className="flex-row items-center gap-2">
          <Ionicons name="timer-outline" size={22} color="#f97316" />
          <Text className="text-white text-xl font-bold">{formatDuration(elapsedSeconds)}</Text>
        </View>
        <View className="flex-row items-center gap-4">
          {hasExercises && (
            <Text className="text-gray-400 text-sm">
              {currentExerciseIndex + 1} / {session.exercises.length}
            </Text>
          )}
          <Pressable onPress={openExercisePicker} hitSlop={8}>
            <Ionicons name="add-circle-outline" size={28} color="#f97316" />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <View className="px-4 py-4">
          {/* Empty state */}
          {!hasExercises && (
            <EmptyState
              icon="barbell-outline"
              title="No exercises yet"
              message="Tap + above or the button below to add exercises to your workout."
              action={{ label: 'Add Exercise', onPress: openExercisePicker }}
            />
          )}

          {/* Current exercise */}
          {currentExercise && (
            <View className="gap-4">
              <View>
                <Text className="text-gray-400 text-xs uppercase tracking-widest mb-1">
                  Exercise {currentExerciseIndex + 1}
                </Text>
                <Text className="text-white text-2xl font-bold">{currentExercise.exercise.name}</Text>
                {currentExercise.exercise.description ? (
                  <Text className="text-gray-400 text-sm mt-1">{currentExercise.exercise.description}</Text>
                ) : null}
              </View>

              {/* Sets */}
              <View>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-white font-semibold">Sets</Text>
                  <Pressable onPress={() => addSet.mutate({ sessionExerciseId: currentExercise.id, sessionId })} hitSlop={8}>
                    <Ionicons name="add-circle" size={26} color="#f97316" />
                  </Pressable>
                </View>
                {currentExercise.sets.map((set, idx) => (
                  <SetRow
                    key={set.id}
                    setIndex={idx + 1}
                    weight={
                      localWeights[set.id] !== undefined
                        ? parseFloat(localWeights[set.id]) || undefined
                        : set.weight ?? undefined
                    }
                    reps={
                      localReps[set.id] !== undefined
                        ? parseInt(localReps[set.id], 10) || undefined
                        : set.reps ?? undefined
                    }
                    isCompleted={set.isCompleted}
                    onWeightChange={(v) => setLocalWeights((p) => ({ ...p, [set.id]: v }))}
                    onRepsChange={(v) => setLocalReps((p) => ({ ...p, [set.id]: v }))}
                    onToggleComplete={() => handleToggleSetComplete(set.id)}
                    onDelete={() => handleDeleteSet(set.id)}
                  />
                ))}
              </View>

              {/* Exercise navigation */}
              <View className="flex-row gap-3 mt-2">
                <View className="flex-1">
                  <Button
                    title="← Previous"
                    variant="secondary"
                    size="sm"
                    disabled={currentExerciseIndex === 0}
                    onPress={() => setCurrentExerciseIndex((i) => Math.max(0, i - 1))}
                  />
                </View>
                <View className="flex-1">
                  <Button
                    title="Next →"
                    variant="secondary"
                    size="sm"
                    disabled={currentExerciseIndex === session.exercises.length - 1}
                    onPress={() =>
                      setCurrentExerciseIndex((i) => Math.min(session.exercises.length - 1, i + 1))
                    }
                  />
                </View>
              </View>

              {/* Exercise dots */}
              {session.exercises.length > 1 && (
                <View className="flex-row justify-center gap-1 mt-1">
                  {session.exercises.map((_, i) => (
                    <Pressable key={i} onPress={() => setCurrentExerciseIndex(i)}>
                      <View
                        className={`w-2 h-2 rounded-full ${
                          i === currentExerciseIndex ? 'bg-orange-500' : 'bg-slate-700'
                        }`}
                      />
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="px-4 py-4 bg-slate-900 border-t border-slate-800">
        <Button
          title="Finish Workout"
          onPress={handleFinishWorkout}
          loading={completeSession.isPending}
          size="lg"
        />
      </View>
    </View>
  );
}
