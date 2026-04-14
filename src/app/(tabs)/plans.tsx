import { useState } from 'react';
import { View, Text, FlatList, Pressable, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTemplates, useCreateTemplate, useDeleteTemplate } from '@/hooks/useTemplates';
import { useStartSession } from '@/hooks/useWorkoutSession';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Ionicons } from '@expo/vector-icons';

export default function PlansScreen() {
  const router = useRouter();
  const { data: templates = [], isLoading } = useTemplates();
  const createTemplate = useCreateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const startSession = useStartSession();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    createTemplate.mutate(
      { name, exercises: [] },
      {
        onSuccess: () => {
          setNewName('');
          setShowCreateForm(false);
        },
      }
    );
  };

  const handleStartFromTemplate = (templateId: string, templateName: string) => {
    Alert.alert(`Start "${templateName}"?`, 'This will create a new workout session.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Start',
        onPress: () =>
          startSession.mutate(templateId, {
            onSuccess: (sessionId) => router.push(`/workout/${sessionId}`),
          }),
      },
    ]);
  };

  const handleDelete = (templateId: string, templateName: string) => {
    Alert.alert(`Delete "${templateName}"?`, 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteTemplate.mutate(templateId),
      },
    ]);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center">
        <ActivityIndicator color="#f97316" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-950">
      <FlatList
        data={templates}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListHeaderComponent={
          <View className="gap-3 mb-2">
            {showCreateForm ? (
              <View className="bg-slate-900 rounded-xl p-4 gap-3">
                <Text className="text-white font-semibold">New Template</Text>
                <TextInput
                  value={newName}
                  onChangeText={setNewName}
                  placeholder="Template name (e.g. Push Day)"
                  placeholderTextColor="#6b7280"
                  className="bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-3 text-base"
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleCreate}
                />
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Button
                      title="Cancel"
                      variant="secondary"
                      onPress={() => {
                        setShowCreateForm(false);
                        setNewName('');
                      }}
                    />
                  </View>
                  <View className="flex-1">
                    <Button
                      title="Create"
                      variant="primary"
                      onPress={handleCreate}
                      disabled={!newName.trim() || createTemplate.isPending}
                    />
                  </View>
                </View>
              </View>
            ) : (
              <Button
                title="+ New Template"
                variant="primary"
                onPress={() => setShowCreateForm(true)}
              />
            )}
            {templates.length > 0 && (
              <Text className="text-gray-400 text-sm">
                {templates.length} template{templates.length !== 1 ? 's' : ''}
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="list-outline"
            title="No templates yet"
            message="Create a training template to quickly start a structured workout."
          />
        }
        renderItem={({ item: template }) => (
          <Card padding="md">
            <View className="gap-3">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 mr-3">
                  <View className="flex-row items-center gap-2">
                    <View
                      style={{ backgroundColor: template.color ?? '#f97316' }}
                      className="w-3 h-3 rounded-full"
                    />
                    <Text className="text-white font-semibold text-base">{template.name}</Text>
                  </View>
                  {template.description ? (
                    <Text className="text-gray-400 text-sm mt-1">{template.description}</Text>
                  ) : null}
                  <View className="flex-row gap-3 mt-2">
                    <Text className="text-gray-500 text-sm">
                      {template.exercises.length} exercise{template.exercises.length !== 1 ? 's' : ''}
                    </Text>
                    {template.estimatedDurationMin ? (
                      <Text className="text-gray-500 text-sm">
                        ~{template.estimatedDurationMin} min
                      </Text>
                    ) : null}
                  </View>
                  {template.exercises.length > 0 && (
                    <Text className="text-gray-500 text-xs mt-1" numberOfLines={1}>
                      {template.exercises
                        .slice(0, 3)
                        .map((e) => e.exercise.name)
                        .join(' · ')}
                      {template.exercises.length > 3 ? ` +${template.exercises.length - 3}` : ''}
                    </Text>
                  )}
                </View>
                <Pressable
                  onPress={() => handleDelete(template.id, template.name)}
                  hitSlop={8}
                  className="p-1"
                >
                  <Ionicons name="trash-outline" size={18} color="#6b7280" />
                </Pressable>
              </View>

              <Button
                title="Start Workout"
                variant="primary"
                size="sm"
                onPress={() => handleStartFromTemplate(template.id, template.name)}
              />
            </View>
          </Card>
        )}
      />
    </View>
  );
}
