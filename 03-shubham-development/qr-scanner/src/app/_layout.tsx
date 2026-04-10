import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, Text } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { QueryClientProviderWrapper } from '@/providers/query-client-provider';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const { isLoading, isAuthenticated, token } = useAuth();
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated && token) {
      console.debug('Auth confirmed - navigating to events');
      router.replace('/(tabs)/events');
    } else {
      console.debug('Not authenticated - navigating to login');
      router.replace('/login');
    }
  }, [isAuthenticated, token, isLoading, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 16, fontSize: 14, color: '#666', fontWeight: '500' }}>
          Initializing...
        </Text>
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
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
