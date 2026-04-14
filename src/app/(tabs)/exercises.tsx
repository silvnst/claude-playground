import { useState } from 'react';
import { View, Text, ScrollView, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useExercises, useMuscleGroups, useEquipment } from '@/hooks/useExercises';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Ionicons } from '@expo/vector-icons';

export default function ExercisesScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);

  const { data: exercises = [], isLoading } = useExercises({
    search: search || undefined,
    muscleGroupId: selectedMuscle || undefined,
    equipmentId: selectedEquipment || undefined,
  });

  const { data: muscleGroups = [] } = useMuscleGroups();
  const { data: equipment = [] } = useEquipment();

  const handleExercisePress = (exerciseId: string) => {
    router.push(`/exercise/${exerciseId}`);
  };

  return (
    <ScrollView className="flex-1 bg-slate-950">
      <View className="px-4 py-4 gap-4">
        {/* Search */}
        <Input
          placeholder="Search exercises..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#6b7280"
        />

        {/* Filters */}
        <View className="gap-2">
          <Text className="text-white text-sm font-semibold">Muscle Groups</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
            <View className="flex-row gap-2 pr-4">
              {muscleGroups.slice(0, 8).map((mg) => (
                <Pressable
                  key={mg.id}
                  onPress={() => setSelectedMuscle(selectedMuscle === mg.id ? null : mg.id)}
                  className={`px-3 py-1 rounded-full border ${
                    selectedMuscle === mg.id
                      ? 'bg-orange-500 border-orange-500'
                      : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  <Text className={`text-sm font-medium ${selectedMuscle === mg.id ? 'text-white' : 'text-gray-300'}`}>
                    {mg.name.split(' ')[0]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Equipment Filter */}
        <View className="gap-2">
          <Text className="text-white text-sm font-semibold">Equipment</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
            <View className="flex-row gap-2 pr-4">
              {equipment.slice(0, 6).map((eq) => (
                <Pressable
                  key={eq.id}
                  onPress={() => setSelectedEquipment(selectedEquipment === eq.id ? null : eq.id)}
                  className={`px-3 py-1 rounded-full border ${
                    selectedEquipment === eq.id
                      ? 'bg-orange-500 border-orange-500'
                      : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  <Text className={`text-sm font-medium ${selectedEquipment === eq.id ? 'text-white' : 'text-gray-300'}`}>
                    {eq.name.split(' ')[0]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Exercises List */}
        <View className="gap-3">
          <Text className="text-white text-sm font-semibold">
            {exercises.length} Exercise{exercises.length !== 1 ? 's' : ''}
          </Text>

          {isLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator color="#f97316" />
              <Text className="text-gray-400 text-sm mt-3">Loading exercises...</Text>
            </View>
          ) : exercises.length === 0 ? (
            <EmptyState title="No exercises found" message="Try adjusting your filters" icon="search" />
          ) : (
            <FlatList
              scrollEnabled={false}
              data={exercises}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable onPress={() => handleExercisePress(item.id)}>
                  <Card padding="md" className="mb-3">
                    <View className="gap-2">
                      <View className="flex-row items-start justify-between">
                        <View className="flex-1">
                          <Text className="text-white font-semibold text-base">{item.name}</Text>
                          {item.description && <Text className="text-gray-400 text-sm mt-1">{item.description}</Text>}
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                      </View>

                      {/* Tags */}
                      <View className="flex-row flex-wrap gap-2 mt-2">
                        <Badge label={item.mechanic ?? 'movement'} size="sm" />
                        <Badge label={item.difficulty ?? 'intermediate'} variant="secondary" size="sm" />
                      </View>

                      {/* Muscle Groups */}
                      {item.muscleGroups.length > 0 && (
                        <View className="flex-row flex-wrap gap-1 mt-1">
                          {item.muscleGroups.slice(0, 3).map((mg) => (
                            <Text key={mg.muscleGroup.id} className="text-xs text-orange-400">
                              {mg.muscleGroup.name}
                              {item.muscleGroups.length > 3 && mg === item.muscleGroups[2] ? '...' : ''}
                            </Text>
                          ))}
                        </View>
                      )}
                    </View>
                  </Card>
                </Pressable>
              )}
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
}
