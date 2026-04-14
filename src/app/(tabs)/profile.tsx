import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useUserProfile, useUpdateProfile } from '@/hooks/useProfile';

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="flex-row items-center justify-between py-4 border-b border-slate-800">
      <View className="flex-1 mr-4">
        <Text className="text-white font-medium">{label}</Text>
        {description && <Text className="text-gray-400 text-sm mt-0.5">{description}</Text>}
      </View>
      {children}
    </View>
  );
}

function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View className="flex-row bg-slate-800 rounded-lg p-1 gap-1">
      {options.map((opt) => (
        <Pressable
          key={opt.value}
          onPress={() => onChange(opt.value)}
          className={`px-3 py-1.5 rounded-md ${value === opt.value ? 'bg-orange-500' : ''}`}
        >
          <Text
            className={`text-sm font-medium ${value === opt.value ? 'text-white' : 'text-gray-400'}`}
          >
            {opt.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function ProfileScreen() {
  const { data: profile, isLoading } = useUserProfile();
  const updateProfile = useUpdateProfile();

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center">
        <ActivityIndicator color="#f97316" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-950">
      <View className="px-4 py-6 gap-6">
        {/* Units section */}
        <View>
          <Text className="text-gray-400 text-xs uppercase tracking-widest mb-3">Preferences</Text>
          <View className="bg-slate-900 rounded-xl px-4">
            <SettingRow
              label="Unit System"
              description="Weight displayed in kg or lbs"
            >
              <SegmentedControl
                options={[
                  { label: 'kg', value: 'metric' },
                  { label: 'lbs', value: 'imperial' },
                ]}
                value={profile?.unitSystem ?? 'metric'}
                onChange={(value) =>
                  updateProfile.mutate({ unitSystem: value as 'metric' | 'imperial' })
                }
              />
            </SettingRow>
          </View>
        </View>

        {/* App info */}
        <View>
          <Text className="text-gray-400 text-xs uppercase tracking-widest mb-3">About</Text>
          <View className="bg-slate-900 rounded-xl px-4">
            <View className="py-4 border-b border-slate-800">
              <Text className="text-white font-medium">Gainz</Text>
              <Text className="text-gray-400 text-sm mt-0.5">Weight Training Tracker</Text>
            </View>
            <View className="py-4">
              <Text className="text-white font-medium">Version</Text>
              <Text className="text-gray-400 text-sm mt-0.5">1.0.0</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
