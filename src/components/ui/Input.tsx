import { TextInput, TextInputProps, View, Text } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, className, ...props }: InputProps) {
  return (
    <View className="gap-1">
      {label && <Text className="text-white font-medium text-sm">{label}</Text>}
      <TextInput
        {...props}
        className={`bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-3 text-base ${error ? 'border-red-500' : ''} ${className || ''}`}
        placeholderTextColor="#9ca3af"
      />
      {error && <Text className="text-red-500 text-sm">{error}</Text>}
      {helperText && <Text className="text-gray-400 text-sm">{helperText}</Text>}
    </View>
  );
}
