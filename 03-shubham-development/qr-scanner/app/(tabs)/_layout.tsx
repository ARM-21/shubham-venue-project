import { Tabs } from 'expo-router';
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { useAuth } from '@/contexts/AuthContext';
import { AppTheme } from '../../constants/appTheme';

export default function TabLayout() {
  const { logout } = useAuth();

  // Professional Header Components
  const HeaderLeft = ({ title, icon }: { title: string; icon: any }) => (
    <View style={styles.headerLeft}>
      <Ionicons name={icon as any} size={24} color={AppTheme.colors.textWhite} />
      <Text style={styles.headerLeftText}>{title}</Text>
    </View>
  );

  const HeaderRight = () => (
    <Pressable onPress={logout} style={styles.logoutButton}>
      <Ionicons name="log-out" size={22} color={AppTheme.colors.textWhite} />
    </Pressable>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: AppTheme.colors.maroonPrimary,
        tabBarInactiveTintColor: AppTheme.colors.textMuted,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: AppTheme.colors.white,
          borderTopColor: AppTheme.colors.border,
          borderTopWidth: 1,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: AppTheme.colors.maroonPrimary,
          borderBottomWidth: 1,
          borderBottomColor: `${AppTheme.colors.textWhite}10`,
          elevation: 4,
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 3,
          shadowOffset: { width: 0, height: 2 },
        },
        headerTintColor: AppTheme.colors.textWhite,
        headerTitleStyle: {
          display: 'none', // Hide default title
        },
        headerLeft: () => null,
        headerRight: () => <HeaderRight />,
      }}
    >
      {/* Events Tab */}
      <Tabs.Screen
        name="events"
        options={{
          title: 'Assigned Events',
          tabBarIcon: ({ color }) => <Ionicons name="calendar" size={28} color={color} />,
          headerTitle: '',
          headerLeft: () => <HeaderLeft title="Events" icon="calendar" />,
          headerRight: () => <HeaderRight />,
        }}
      />

      {/* Scanner Tab */}
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'QR Scanner',
          tabBarIcon: ({ color }) => <Ionicons name="scan" size={28} color={color} />,
          headerTitle: '',
          headerLeft: () => <HeaderLeft title="Scanner" icon="scan" />,
          headerRight: () => <HeaderRight />,
        }}
      />

      {/* History Tab */}
      <Tabs.Screen
        name="history"
        options={{
          title: 'Scan History',
          tabBarIcon: ({ color }) => <Ionicons name="time" size={28} color={color} />,
          headerTitle: '',
          headerLeft: () => <HeaderLeft title="History" icon="time" />,
          headerRight: () => <HeaderRight />,
        }}
      />

      {/* Settings Tab */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Ionicons name="cog" size={28} color={color} />,
          headerTitle: '',
          headerLeft: () => <HeaderLeft title="Settings" icon="cog" />,
          headerRight: () => <HeaderRight />,
        }}
      />

      {/* Result Tab (Hidden from tab bar) */}
      <Tabs.Screen
        name="result"
        options={{
          href: null, // Hide from tab bar
          title: 'Scan Result',
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 16,
  } as const,
  headerLeftText: {
    fontSize: AppTheme.fonts.sizes.lg,
    fontWeight: '700',
    color: AppTheme.colors.textWhite,
    letterSpacing: 0.3,
  } as const,
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  } as const,
});

