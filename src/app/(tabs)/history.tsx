import { View, Text, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useRecentSessions } from '@/hooks/useWorkoutSession';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Ionicons } from '@expo/vector-icons';
import { formatRelativeDate, formatTime } from '@/utils/date';
import { formatDuration } from '@/utils/volume';

export default function HistoryScreen() {
  const router = useRouter();
  const { data: sessions = [], isLoading } = useRecentSessions(30);

  const completedSessions = sessions.filter((s) => s.completedAt !== null);

  if (!isLoading && completedSessions.length === 0) {
    return (
      <View className="flex-1 bg-slate-950">
        <EmptyState
          icon="calendar-outline"
          title="No workouts yet"
          message="Complete your first workout to see it here."
          action={{ label: 'Start Workout', onPress: () => router.push('/') }}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-950">
      <FlatList
        data={completedSessions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListHeaderComponent={
          <Text className="text-gray-400 text-sm mb-2">
            {completedSessions.length} workout{completedSessions.length !== 1 ? 's' : ''} completed
          </Text>
        }
        renderItem={({ item: session }) => {
          const totalSets = session.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
          const completedSets = session.exercises.reduce(
            (sum, ex) => sum + ex.sets.filter((s) => s.isCompleted).length,
            0
          );

          return (
            <Card padding="md">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 gap-1">
                  <Text className="text-white font-semibold text-base">
                    {session.exercises.length > 0
                      ? session.exercises.map((e) => e.exercise.name).slice(0, 2).join(', ') +
                        (session.exercises.length > 2 ? ` +${session.exercises.length - 2} more` : '')
                      : 'Ad-hoc Workout'}
                  </Text>
                  <Text className="text-orange-400 text-sm font-medium">
                    {formatRelativeDate(session.startedAt)} · {formatTime(session.startedAt)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#6b7280" />
              </View>

              {/* Stats row */}
              <View className="flex-row gap-4 mt-3 pt-3 border-t border-slate-800">
                <View className="flex-row items-center gap-1">
                  <Ionicons name="timer-outline" size={14} color="#9ca3af" />
                  <Text className="text-gray-400 text-sm">
                    {formatDuration(session.durationSec ?? 0)}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Ionicons name="barbell-outline" size={14} color="#9ca3af" />
                  <Text className="text-gray-400 text-sm">
                    {session.exercises.length} exercise{session.exercises.length !== 1 ? 's' : ''}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Ionicons name="checkmark-circle-outline" size={14} color="#9ca3af" />
                  <Text className="text-gray-400 text-sm">
                    {completedSets}/{totalSets} sets
                  </Text>
                </View>
                {session.rating ? (
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="star" size={14} color="#f97316" />
                    <Text className="text-gray-400 text-sm">{session.rating}/5</Text>
                  </View>
                ) : null}
              </View>
            </Card>
          );
        }}
      />
    </View>
  );
}
