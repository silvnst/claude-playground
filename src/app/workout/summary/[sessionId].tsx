import { View, Text, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useWorkoutSession } from '@/hooks/useWorkoutSession';
import { useAllPersonalRecords } from '@/hooks/useProgress';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Ionicons } from '@expo/vector-icons';
import { formatDuration } from '@/utils/volume';

export default function WorkoutSummaryScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams();
  const { data: session } = useWorkoutSession(sessionId as string);
  const { data: allRecords = [] } = useAllPersonalRecords();

  if (!session) {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center">
        <Text className="text-white">Loading...</Text>
      </View>
    );
  }

  const isPR = (exerciseId: string) => {
    return allRecords.some((r) => r.record.exerciseId === exerciseId && r.record.recordType === 'estimated_1rm');
  };

  const totalSets = session.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const completedSets = session.exercises.reduce((sum, ex) => sum + ex.sets.filter((s) => s.isCompleted).length, 0);

  return (
    <View className="flex-1 bg-slate-950">
      {/* Header */}
      <View className="bg-slate-900 px-4 py-6 border-b border-slate-800">
        <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
        <Text className="text-white text-3xl font-bold mt-3">Workout Complete!</Text>
      </View>

      <ScrollView className="flex-1">
        <View className="px-4 py-6 gap-6">
          {/* Stats */}
          <View className="gap-3">
            <View className="grid grid-cols-2 gap-3">
              <Card padding="md">
                <Text className="text-gray-400 text-sm mb-2">Duration</Text>
                <Text className="text-white text-2xl font-bold">{formatDuration(session.durationSec || 0)}</Text>
              </Card>
              <Card padding="md">
                <Text className="text-gray-400 text-sm mb-2">Sets</Text>
                <Text className="text-white text-2xl font-bold">
                  {completedSets}/{totalSets}
                </Text>
              </Card>
            </View>

            <Card padding="md">
              <Text className="text-gray-400 text-sm mb-2">Exercises</Text>
              <Text className="text-white text-2xl font-bold">{session.exercises.length}</Text>
            </Card>
          </View>

          {/* Exercises Summary */}
          <View className="gap-3">
            <Text className="text-white font-semibold text-lg">Exercises</Text>
            {session.exercises.map((sessEx) => {
              const completedSetsForEx = sessEx.sets.filter((s) => s.isCompleted).length;
              const maxWeight = Math.max(...sessEx.sets.filter((s) => s.isCompleted && s.weight).map((s) => s.weight || 0));
              const isPRex = isPR(sessEx.exercise.id);

              return (
                <Card key={sessEx.id} padding="md">
                  <View className="gap-2">
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <Text className="text-white font-semibold">{sessEx.exercise.name}</Text>
                        <Text className="text-gray-400 text-sm mt-1">
                          {completedSetsForEx} set{completedSetsForEx !== 1 ? 's' : ''} completed
                        </Text>
                      </View>
                      {isPRex && (
                        <Badge label="NEW PR!" variant="success" size="sm" />
                      )}
                    </View>
                    {maxWeight > 0 && (
                      <Text className="text-orange-400 font-semibold">Max weight: {maxWeight} kg</Text>
                    )}
                  </View>
                </Card>
              );
            })}
          </View>

          {/* Notes */}
          {session.notes && (
            <Card padding="md">
              <Text className="text-gray-400 text-sm mb-2">Notes</Text>
              <Text className="text-white">{session.notes}</Text>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* Actions */}
      <View className="px-4 py-4 gap-3 bg-slate-900 border-t border-slate-800">
        <Button
          title="Back to Dashboard"
          onPress={() => router.push('/')}
          size="lg"
        />
        <Button
          title="View History"
          variant="secondary"
          onPress={() => router.push('/history')}
          size="lg"
        />
      </View>
    </View>
  );
}
