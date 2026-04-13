import { Pressable, Text, View } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
}: ButtonProps) {
  const baseStyles = 'rounded-lg flex-row items-center justify-center gap-2';

  const variantStyles = {
    primary: 'bg-orange-500',
    secondary: 'bg-slate-700',
    ghost: 'bg-transparent border border-orange-500',
    danger: 'bg-red-600',
  };

  const sizeStyles = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const disabledStyles = disabled ? 'opacity-50' : '';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} active:opacity-80`}
    >
      {icon && <View>{icon}</View>}
      <Text className={`font-semibold ${textSizes[size]} ${variant === 'ghost' ? 'text-orange-500' : 'text-white'}`}>
        {loading ? 'Loading...' : title}
      </Text>
    </Pressable>
  );
}
