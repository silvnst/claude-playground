import { View, Text } from 'react-native';
import { Link, Stack } from 'expo-router';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View className="flex-1 bg-slate-950 items-center justify-center px-6 gap-4">
        <Text className="text-white text-2xl font-bold">Page not found</Text>
        <Text className="text-gray-400 text-center">The screen you're looking for doesn't exist.</Text>
        <Link href="/" className="mt-2">
          <Text className="text-orange-400 font-medium text-base">Go to Home</Text>
        </Link>
      </View>
    </>
  );
}
