import { View, Text, ScrollView, Pressable } from 'react-native';
import { useStartSession } from '@/hooks/useWorkoutSession';
import { useTotalWorkouts, useWorkoutStreak } from '@/hooks/useProgress';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const router = useRouter();
  const startSession = useStartSession();
  const { data: totalWorkouts = 0 } = useTotalWorkouts();
  const { data: streak = 0 } = useWorkoutStreak();

  const handleStartQuickWorkout = () => {
    startSession.mutate(undefined, {
      onSuccess: (sessionId) => {
        router.push(`/workout/${sessionId}`);
      },
    });
  };

  return (
    <ScrollView className="flex-1 bg-slate-950">
      <View className="px-4 py-6 gap-6">
        {/* Header */}
        <View className="gap-2">
          <Text className="text-3xl font-bold text-white">Gainz</Text>
          <Text className="text-gray-400">Track your strength journey</Text>
        </View>

        {/* Stats */}
        <View className="gap-3">
          <View className="flex-row gap-3">
            <View className="flex-1 bg-slate-900 rounded-lg p-4">
              <Text className="text-gray-400 text-sm mb-1">Total Workouts</Text>
              <Text className="text-2xl font-bold text-orange-500">{totalWorkouts}</Text>
            </View>
            <View className="flex-1 bg-slate-900 rounded-lg p-4">
              <Text className="text-gray-400 text-sm mb-1">Current Streak</Text>
              <Text className="text-2xl font-bold text-orange-500">{streak}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="gap-3">
          <Pressable
            onPress={handleStartQuickWorkout}
            disabled={startSession.isPending}
            className="bg-orange-500 rounded-lg p-4 active:opacity-80"
          >
            <Text className="text-white font-semibold text-center text-lg">
              {startSession.isPending ? 'Starting...' : 'Start Quick Workout'}
            </Text>
          </Pressable>
        </View>

        {/* Placeholder for upcoming sections */}
        <View className="bg-slate-900 rounded-lg p-4">
          <Text className="text-white font-semibold mb-2">Recent Workouts</Text>
          <Text className="text-gray-400 text-sm">Complete a workout to see it here</Text>
        </View>
      </View>
    </ScrollView>
  );
}
