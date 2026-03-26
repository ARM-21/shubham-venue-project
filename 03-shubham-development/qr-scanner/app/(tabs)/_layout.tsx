import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user, logout } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarButton: HapticTab,
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
        },
        headerTintColor: Colors[colorScheme ?? 'light'].text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color }) => <Ionicons name="calendar" size={28} color={color} />,
          headerTitle: `Welcome, ${user?.username || 'Scanner'}`,
          headerRight: () => (
            <Ionicons
              name="log-out"
              size={24}
              color={Colors[colorScheme ?? 'light'].text}
              style={{ marginRight: 16, cursor: 'pointer' }}
              onPress={logout}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Scanner',
          tabBarIcon: ({ color }) => <Ionicons name="scan" size={28} color={color} />,
          headerShown: false, // Scanner has its own header
        }}
      />
      <Tabs.Screen
        name="result"
        options={{
          title: 'Result',
          tabBarIcon: ({ color }) => <Ionicons name="checkmark-circle" size={28} color={color} />,
          headerShown: false, // Result screen handles its own display
        }}
      />
    </Tabs>
  );
}
