import { View, Text, Pressable } from 'react-native';
import { Input } from '@/components/ui/Input';
import { Ionicons } from '@expo/vector-icons';

interface SetRowProps {
  setIndex: number;
  weight?: number | null;
  reps?: number | null;
  isCompleted: boolean;
  onWeightChange: (value: string) => void;
  onRepsChange: (value: string) => void;
  onToggleComplete: () => void;
  onDelete: () => void;
  unit?: 'kg' | 'lbs';
}

export function SetRow({
  setIndex,
  weight,
  reps,
  isCompleted,
  onWeightChange,
  onRepsChange,
  onToggleComplete,
  onDelete,
  unit = 'kg',
}: SetRowProps) {
  return (
    <View className="bg-slate-900 rounded-lg p-3 mb-2 gap-2">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={onToggleComplete}
            className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
              isCompleted ? 'bg-green-500 border-green-500' : 'border-gray-600'
            }`}
          >
            {isCompleted && <Ionicons name="checkmark" size={14} color="white" />}
          </Pressable>
          <Text className="text-white font-semibold">Set {setIndex}</Text>
        </View>
        <Pressable onPress={onDelete} hitSlop={8}>
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
        </Pressable>
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <Text className="text-gray-400 text-xs mb-1">Weight ({unit})</Text>
          <Input
            value={weight?.toString() ?? ''}
            onChangeText={onWeightChange}
            placeholder="0"
            keyboardType="decimal-pad"
            editable={!isCompleted}
            className="text-sm"
          />
        </View>
        <View className="flex-1">
          <Text className="text-gray-400 text-xs mb-1">Reps</Text>
          <Input
            value={reps?.toString() ?? ''}
            onChangeText={onRepsChange}
            placeholder="0"
            keyboardType="number-pad"
            editable={!isCompleted}
            className="text-sm"
          />
        </View>
      </View>
    </View>
  );
}
