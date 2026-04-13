import { View, Text, ScrollView } from 'react-native';

export default function ProfileScreen() {
  return (
    <ScrollView className="flex-1 bg-slate-950">
      <View className="px-4 py-6">
        <Text className="text-white text-lg font-semibold mb-4">Profile</Text>
        <View className="bg-slate-900 rounded-lg p-4">
          <Text className="text-gray-400">Profile settings coming soon</Text>
        </View>
      </View>
    </ScrollView>
  );
}
