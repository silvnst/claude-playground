import { View, Text, ScrollView } from 'react-native';

export default function HistoryScreen() {
  return (
    <ScrollView className="flex-1 bg-slate-950">
      <View className="px-4 py-6">
        <Text className="text-white text-lg font-semibold mb-4">Workout History</Text>
        <View className="bg-slate-900 rounded-lg p-4">
          <Text className="text-gray-400">Your workout history will appear here</Text>
        </View>
      </View>
    </ScrollView>
  );
}
