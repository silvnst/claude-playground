import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useWorkoutSession, useUpdateSet, useAddSetToExercise, useCompleteSession } from '@/hooks/useWorkoutSession';
import { useActiveWorkoutUI } from '@/hooks/useWorkoutSession';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SetRow } from '@/components/workout/SetRow';
import { Ionicons } from '@expo/vector-icons';
import { formatDuration } from '@/utils/volume';

export default function WorkoutScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams();
  const { data: session, isLoading } = useWorkoutSession(sessionId as string);
  const updateSet = useUpdateSet();
  const addSet = useAddSetToExercise();
  const completeSession = useCompleteSession();
  const { elapsedSeconds, setElapsedSeconds, currentExerciseIndex, setCurrentExerciseIndex } = useActiveWorkoutUI(
    sessionId as string
  );

  const [localWeights, setLocalWeights] = useState<Record<string, string>>({});
  const [localReps, setLocalReps] = useState<Record<string, string>>({});

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
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

  const handleSetWeightChange = (setId: string, value: string) => {
    setLocalWeights((prev) => ({ ...prev, [setId]: value }));
  };

  const handleSetRepsChange = (setId: string, value: string) => {
    setLocalReps((prev) => ({ ...prev, [setId]: value }));
  };

  const handleToggleSetComplete = (setId: string) => {
    const set = currentExercise.sets.find((s) => s.id === setId);
    if (set) {
      const weight = localWeights[setId] ? parseFloat(localWeights[setId]) : set.weight;
      const reps = localReps[setId] ? parseInt(localReps[setId]) : set.reps;

      updateSet.mutate({
        setId,
        data: {
          weight,
          reps,
          isCompleted: !set.isCompleted,
        },
      });
    }
  };

  const handleAddSet = () => {
    if (currentExercise) {
      addSet.mutate(currentExercise.id);
    }
  };

  const handleFinishWorkout = () => {
    Alert.alert('Finish Workout?', 'Mark this workout as complete?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Finish',
        style: 'default',
        onPress: () => {
          completeSession.mutate(
            {
              sessionId: sessionId as string,
              data: {
                notes: `Completed ${session.exercises.length} exercises`,
              },
            },
            {
              onSuccess: () => {
                router.push(`/workout/summary/${sessionId}`);
              },
            }
          );
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-slate-950">
      {/* Header with timer */}
      <View className="bg-slate-900 px-4 py-4 flex-row items-center justify-between border-b border-slate-800">
        <View className="flex-row items-center gap-2">
          <Ionicons name="timer" size={24} color="#f97316" />
          <Text className="text-white text-2xl font-bold">{formatDuration(elapsedSeconds)}</Text>
        </View>
        <Text className="text-gray-400 text-sm">
          {currentExerciseIndex + 1} / {session.exercises.length}
        </Text>
      </View>

      <ScrollView className="flex-1">
        <View className="px-4 py-4">
          {/* Current Exercise */}
          {currentExercise && (
            <View className="gap-4">
              <View>
                <Text className="text-gray-400 text-sm uppercase tracking-wider mb-2">Exercise {currentExerciseIndex + 1}</Text>
                <Text className="text-white text-2xl font-bold">{currentExercise.exercise.name}</Text>
                {currentExercise.exercise.description && (
                  <Text className="text-gray-400 text-sm mt-2">{currentExercise.exercise.description}</Text>
                )}
              </View>

              {/* Sets */}
              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-white font-semibold">Sets</Text>
                  <Pressable onPress={handleAddSet} className="active:opacity-70">
                    <Ionicons name="add-circle" size={24} color="#f97316" />
                  </Pressable>
                </View>

                {currentExercise.sets.map((set, idx) => (
                  <SetRow
                    key={set.id}
                    setIndex={idx + 1}
                    weight={parseFloat(localWeights[set.id] || set.weight?.toString() || '')}
                    reps={parseInt(localReps[set.id] || set.reps?.toString() || '')}
                    isCompleted={set.isCompleted}
                    onWeightChange={(value) => handleSetWeightChange(set.id, value)}
                    onRepsChange={(value) => handleSetRepsChange(set.id, value)}
                    onToggleComplete={() => handleToggleSetComplete(set.id)}
                    onDelete={() => {}} // TODO: implement delete
                  />
                ))}
              </View>

              {/* Navigation */}
              <View className="flex-row gap-3 mt-4">
                <Button
                  title="Previous"
                  variant="secondary"
                  disabled={currentExerciseIndex === 0}
                  onPress={() => setCurrentExerciseIndex(Math.max(0, currentExerciseIndex - 1))}
                  size="sm"
                />
                <Button
                  title="Next"
                  variant="secondary"
                  disabled={currentExerciseIndex === session.exercises.length - 1}
                  onPress={() => setCurrentExerciseIndex(Math.min(session.exercises.length - 1, currentExerciseIndex + 1))}
                  size="sm"
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer - Finish Button */}
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
