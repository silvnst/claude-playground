import { useState } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useExercises, useMuscleGroups } from '@/hooks/useExercises';
import { useAddExerciseToSession, useWorkoutSession } from '@/hooks/useWorkoutSession';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Ionicons } from '@expo/vector-icons';

export default function ExercisePickerScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

  const { data: exercises = [], isLoading } = useExercises({
    search: search || undefined,
    muscleGroupId: selectedMuscle || undefined,
  });
  const { data: session } = useWorkoutSession(sessionId);
  const { data: muscleGroups = [] } = useMuscleGroups();
  const addExercise = useAddExerciseToSession();

  const handlePick = (exerciseId: string) => {
    addExercise.mutate(
      {
        sessionId,
        exerciseId,
        orderIndex: session?.exercises.length ?? 0,
      },
      { onSuccess: () => router.back() }
    );
  };

  return (
    <View className="flex-1 bg-slate-950">
      {/* Header */}
      <View className="bg-slate-900 px-4 pt-12 pb-4 border-b border-slate-800">
        <View className="flex-row items-center gap-3 mb-4">
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="close" size={24} color="#9ca3af" />
          </Pressable>
          <Text className="text-white text-lg font-bold flex-1">Add Exercise</Text>
        </View>
        <Input
          placeholder="Search exercises..."
          value={search}
          onChangeText={setSearch}
          autoFocus
        />
      </View>

      {/* Muscle filter */}
      <View className="px-4 py-2 border-b border-slate-800">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={muscleGroups}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelectedMuscle(selectedMuscle === item.id ? null : item.id)}
              className={`mr-2 px-3 py-1 rounded-full border ${
                selectedMuscle === item.id
                  ? 'bg-orange-500 border-orange-500'
                  : 'bg-slate-800 border-slate-700'
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  selectedMuscle === item.id ? 'text-white' : 'text-gray-300'
                }`}
              >
                {item.name.split(' ')[0]}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {/* Exercise list */}
      {isLoading ? (
        <ActivityIndicator className="mt-8" color="#f97316" />
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 16, gap: 8 }}
          ListEmptyComponent={
            <Text className="text-gray-400 text-center mt-8">No exercises found</Text>
          }
          renderItem={({ item }) => {
            const primaryMuscles = item.muscleGroups
              .filter((mg) => mg.role === 'primary')
              .map((mg) => mg.muscleGroup.name)
              .join(', ');

            return (
              <Pressable
                onPress={() => handlePick(item.id)}
                disabled={addExercise.isPending}
                className="bg-slate-900 rounded-lg p-4 active:opacity-70"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 gap-1">
                    <Text className="text-white font-semibold">{item.name}</Text>
                    {primaryMuscles ? (
                      <Text className="text-orange-400 text-xs">{primaryMuscles}</Text>
                    ) : null}
                    <View className="flex-row gap-2 mt-1">
                      {item.mechanic && <Badge label={item.mechanic} size="sm" />}
                      {item.difficulty && (
                        <Badge label={item.difficulty} variant="secondary" size="sm" />
                      )}
                    </View>
                  </View>
                  <Ionicons name="add-circle-outline" size={24} color="#f97316" />
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}
