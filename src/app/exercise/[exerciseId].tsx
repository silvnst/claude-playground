import { View, Text, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useExerciseById } from '@/hooks/useExercises';
import { usePersonalRecords, useExerciseHistory } from '@/hooks/useProgress';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Ionicons } from '@expo/vector-icons';
import { formatRelativeDate } from '@/utils/date';

export default function ExerciseDetailScreen() {
  const router = useRouter();
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const { data: exercise, isLoading } = useExerciseById(exerciseId);
  const { data: records = [] } = usePersonalRecords(exerciseId);
  const { data: history = [] } = useExerciseHistory(exerciseId, 5);

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center">
        <Text className="text-gray-400">Loading...</Text>
      </View>
    );
  }

  if (!exercise) {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center">
        <Text className="text-gray-400">Exercise not found.</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-orange-500">Go back</Text>
        </Pressable>
      </View>
    );
  }

  const primaryMuscles = exercise.muscleGroups.filter((mg) => mg.role === 'primary');
  const secondaryMuscles = exercise.muscleGroups.filter((mg) => mg.role === 'secondary');
  const maxWeightRecord = records.find((r) => r.recordType === 'max_weight');
  const estimated1RMRecord = records.find((r) => r.recordType === 'estimated_1rm');

  return (
    <ScrollView className="flex-1 bg-slate-950">
      {/* Header */}
      <View className="bg-slate-900 px-4 pt-12 pb-6 border-b border-slate-800">
        <Pressable onPress={() => router.back()} className="mb-4" hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#9ca3af" />
        </Pressable>
        <Text className="text-white text-2xl font-bold">{exercise.name}</Text>
        {exercise.description ? (
          <Text className="text-gray-400 mt-2">{exercise.description}</Text>
        ) : null}

        {/* Tags */}
        <View className="flex-row flex-wrap gap-2 mt-3">
          {exercise.mechanic && <Badge label={exercise.mechanic} variant="primary" />}
          {exercise.movementPattern && <Badge label={exercise.movementPattern} variant="secondary" />}
          {exercise.difficulty && <Badge label={exercise.difficulty} variant="secondary" />}
          {exercise.category && <Badge label={exercise.category} variant="secondary" />}
        </View>
      </View>

      <View className="px-4 py-6 gap-6">
        {/* Muscles */}
        {primaryMuscles.length > 0 && (
          <View className="gap-2">
            <Text className="text-white font-semibold">Primary Muscles</Text>
            <View className="flex-row flex-wrap gap-2">
              {primaryMuscles.map((mg) => (
                <View key={mg.muscleGroup.id} className="bg-orange-500/20 border border-orange-500/40 px-3 py-1 rounded-full">
                  <Text className="text-orange-400 text-sm font-medium">{mg.muscleGroup.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {secondaryMuscles.length > 0 && (
          <View className="gap-2">
            <Text className="text-white font-semibold">Secondary Muscles</Text>
            <View className="flex-row flex-wrap gap-2">
              {secondaryMuscles.map((mg) => (
                <View key={mg.muscleGroup.id} className="bg-slate-800 border border-slate-700 px-3 py-1 rounded-full">
                  <Text className="text-gray-300 text-sm">{mg.muscleGroup.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Equipment */}
        {exercise.equipment.length > 0 && (
          <View className="gap-2">
            <Text className="text-white font-semibold">Equipment</Text>
            <View className="flex-row flex-wrap gap-2">
              {exercise.equipment.map((eq) => (
                <Badge key={eq.id} label={eq.name} variant="secondary" />
              ))}
            </View>
          </View>
        )}

        {/* Personal Records */}
        {(maxWeightRecord || estimated1RMRecord) && (
          <View className="gap-3">
            <Text className="text-white font-semibold">Personal Records</Text>
            <View className="flex-row gap-3">
              {maxWeightRecord && (
                <Card padding="md" className="flex-1">
                  <Text className="text-gray-400 text-xs mb-1">Max Weight</Text>
                  <Text className="text-orange-500 text-xl font-bold">{maxWeightRecord.value} kg</Text>
                  <Text className="text-gray-500 text-xs mt-1">
                    {formatRelativeDate(maxWeightRecord.achievedAt)}
                  </Text>
                </Card>
              )}
              {estimated1RMRecord && (
                <Card padding="md" className="flex-1">
                  <Text className="text-gray-400 text-xs mb-1">Est. 1RM</Text>
                  <Text className="text-orange-500 text-xl font-bold">
                    {estimated1RMRecord.value} kg
                  </Text>
                  <Text className="text-gray-500 text-xs mt-1">
                    {formatRelativeDate(estimated1RMRecord.achievedAt)}
                  </Text>
                </Card>
              )}
            </View>
          </View>
        )}

        {/* History */}
        {history.length > 0 && (
          <View className="gap-3">
            <Text className="text-white font-semibold">Recent History</Text>
            {history.map((entry, i) => {
              const completedSets = entry.sets.filter((s) => s.isCompleted);
              const maxWeight = Math.max(0, ...completedSets.map((s) => s.weight ?? 0));
              return (
                <Card key={i} padding="md">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-white font-medium">
                      {formatRelativeDate(entry.date)}
                    </Text>
                    <Text className="text-gray-400 text-sm">
                      {completedSets.length} set{completedSets.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  {maxWeight > 0 && (
                    <Text className="text-orange-400 text-sm mt-1">Best: {maxWeight} kg</Text>
                  )}
                </Card>
              );
            })}
          </View>
        )}

        {history.length === 0 && records.length === 0 && (
          <Card padding="md">
            <Text className="text-gray-400 text-center">
              No history yet. Log a workout with this exercise to see data here.
            </Text>
          </Card>
        )}

        {/* Instructions */}
        {exercise.instructions && (
          <View className="gap-3">
            <Text className="text-white font-semibold">How to Perform</Text>
            <Card padding="md">
              {(JSON.parse(exercise.instructions) as string[]).map((step, i) => (
                <View key={i} className="flex-row gap-3 mb-2">
                  <View className="w-5 h-5 rounded-full bg-orange-500 items-center justify-center flex-shrink-0 mt-0.5">
                    <Text className="text-white text-xs font-bold">{i + 1}</Text>
                  </View>
                  <Text className="text-gray-300 flex-1">{step}</Text>
                </View>
              ))}
            </Card>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
