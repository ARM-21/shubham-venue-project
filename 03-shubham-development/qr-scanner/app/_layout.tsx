import React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { useColorScheme } from 'hooks/use-color-scheme';
import { AuthProvider } from 'contexts/AuthContext';
import { QueryClientProviderWrapper } from 'providers/query-client-provider';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();

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
