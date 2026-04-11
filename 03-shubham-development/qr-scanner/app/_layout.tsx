import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { useColorScheme } from 'hooks/use-color-scheme';
import { AuthProvider } from 'contexts/AuthContext';
import { QueryClientProviderWrapper } from 'providers/query-client-provider';
import { requestNotificationPermissions, initializeNotifications, setupNotificationListeners, registerNotificationHandler, checkNotificationPermissions } from '@/lib/notifications';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  // Initialize push notifications on app start
  useEffect(() => {
    const initNotifications = async () => {
      try {
        console.log('========== NOTIFICATION INITIALIZATION START ==========');
        
        // Register handler for notification taps
        registerNotificationHandler((data) => {
          console.log('Notification handler triggered:', data);
          
          if (data.type === 'staff_assignment') {
            router.push({
              pathname: '/(tabs)/events',
              params: { eventId: data.eventId, from: 'notification' }
            });
          } else if (data.type === 'staff_assignment_cancelled') {
            console.log('Assignment cancelled:', data.eventName);
            router.push('/(tabs)/events');
          }
        });

        // Check current permission status first
        console.log('Step 1: Checking current notification permissions...');
        const currentStatus = await checkNotificationPermissions();
        console.log('Current permission status:', currentStatus);

        // Request notification permissions if not already granted
        console.log('Step 2: Requesting notification permissions...');
        const granted = await requestNotificationPermissions();
        console.log('Permission request result:', { granted });
        
        if (granted) {
          console.log('Step 3: Initializing push token...');
          const token = await initializeNotifications();
          console.log('Push token initialization result:', { hasToken: !!token });
          
          console.log('Step 4: Setting up notification listeners...');
          setupNotificationListeners();
          console.log('Notification listeners setup complete');
        } else {
          console.warn('Notifications disabled - permission denied or not available');
        }

        console.log('========== NOTIFICATION INITIALIZATION COMPLETE ==========');
      } catch (error) {
        console.error('Notification initialization error:', error instanceof Error ? error.message : error);
      }
    };

    initNotifications();
  }, [router]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{}} />
        <Stack.Screen name="login" options={{}} />
        <Stack.Screen name="(tabs)" options={{}} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProviderWrapper>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </QueryClientProviderWrapper>
  );
}
