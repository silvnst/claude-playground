import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
}

export function Card({ children, padding = 'md', onPress, className, ...props }: CardProps) {
  const paddingStyles = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <View
      {...props}
      className={`bg-slate-900 rounded-lg ${paddingStyles[padding]} ${onPress ? 'active:opacity-80' : ''} ${className || ''}`}
    >
      {children}
    </View>
  );
}
