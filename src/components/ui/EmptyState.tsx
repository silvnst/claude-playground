import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export function EmptyState({ icon = 'inbox', title, message, action }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center py-12 px-4">
      <Ionicons name={icon as any} size={48} color="#9ca3af" />
      <Text className="text-white text-lg font-semibold mt-4">{title}</Text>
      <Text className="text-gray-400 text-center mt-2 mb-6">{message}</Text>
      {action && (
        <Pressable
          onPress={action.onPress}
          className="bg-orange-500 px-6 py-3 rounded-lg active:opacity-80"
        >
          <Text className="text-white font-semibold">{action.label}</Text>
        </Pressable>
      )}
    </View>
  );
}

import { Pressable } from 'react-native';
