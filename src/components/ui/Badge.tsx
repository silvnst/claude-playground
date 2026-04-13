import { View, Text } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
}

export function Badge({ label, variant = 'secondary', size = 'sm' }: BadgeProps) {
  const variantStyles = {
    primary: 'bg-orange-500/20 border border-orange-500/50',
    secondary: 'bg-slate-700/50 border border-slate-600',
    success: 'bg-green-500/20 border border-green-500/50',
    warning: 'bg-yellow-500/20 border border-yellow-500/50',
    danger: 'bg-red-500/20 border border-red-500/50',
  };

  const sizeStyles = {
    sm: 'px-2 py-1',
    md: 'px-3 py-2',
  };

  const textColors = {
    primary: 'text-orange-400',
    secondary: 'text-slate-300',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    danger: 'text-red-400',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
  };

  return (
    <View className={`rounded-full ${variantStyles[variant]} ${sizeStyles[size]}`}>
      <Text className={`font-medium ${textColors[variant]} ${textSizes[size]}`}>{label}</Text>
    </View>
  );
}
