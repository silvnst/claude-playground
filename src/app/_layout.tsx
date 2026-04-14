import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRunMigrations } from '@/db/client';
import { seedDatabase } from '@/db/seed/runner';
import '../global.css';

// Keep splash visible while loading
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const migrations = useRunMigrations();
  const [fontsLoaded] = useFonts({
    // Add custom fonts here if needed
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Run migrations
        if (migrations.success === false) {
          throw new Error('Migration failed');
        }

        // Seed database
        await seedDatabase();

        // Hide splash when everything is ready
        if (fontsLoaded) {
          await SplashScreen.hideAsync();
          setIsReady(true);
        }
      } catch (error) {
        console.error('[App] Setup error:', error);
        // Still show app even if seeding fails
        if (fontsLoaded) {
          await SplashScreen.hideAsync();
          setIsReady(true);
        }
      }
    }

    if (fontsLoaded && migrations.success) {
      prepare();
    }
  }, [fontsLoaded, migrations.success]);

  if (!isReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
      </Stack>
    </QueryClientProvider>
  );
}
