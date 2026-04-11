import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme } from 'constants/appTheme';
import { useAuth } from 'contexts/AuthContext';
import * as SecureStore from 'expo-secure-store';
import { requestNotificationPermissions, checkNotificationPermissions } from '@/lib/notifications';

type PermissionStatus = 'granted' | 'denied' | 'undetermined' | 'error' | 'not_available';

export default function SettingsScreen() {
  const { logout, user } = useAuth();
  const [settings, setSettings] = useState({
    soundEnabled: true,
    vibrationEnabled: true,
    errorSound: true,
    offlineMode: false,
    notificationsEnabled: true,
  });
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('undetermined');
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(false);

  // Check notification permissions on mount
  useEffect(() => {
    const checkPermissions = async () => {
      setIsCheckingPermissions(true);
      try {
        const result = await checkNotificationPermissions();
        setPermissionStatus(result.status as PermissionStatus);
      } catch (error) {
        console.error('Error checking permissions:', error);
        setPermissionStatus('error');
      } finally {
        setIsCheckingPermissions(false);
      }
    };
    checkPermissions();
  }, []);

  // Load settings from SecureStore on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = { ...settings };
        
        // Load each setting from SecureStore
        const soundEnabledStr = await SecureStore.getItemAsync('setting_soundEnabled');
        if (soundEnabledStr !== null) {
          savedSettings.soundEnabled = soundEnabledStr === 'true';
        }
        
        const vibrationEnabledStr = await SecureStore.getItemAsync('setting_vibrationEnabled');
        if (vibrationEnabledStr !== null) {
          savedSettings.vibrationEnabled = vibrationEnabledStr === 'true';
        }
        
        const errorSoundStr = await SecureStore.getItemAsync('setting_errorSound');
        if (errorSoundStr !== null) {
          savedSettings.errorSound = errorSoundStr === 'true';
        }
        
        const offlineModeStr = await SecureStore.getItemAsync('setting_offlineMode');
        if (offlineModeStr !== null) {
          savedSettings.offlineMode = offlineModeStr === 'true';
        }
        
        const notificationsEnabledStr = await SecureStore.getItemAsync('setting_notificationsEnabled');
        if (notificationsEnabledStr !== null) {
          savedSettings.notificationsEnabled = notificationsEnabledStr === 'true';
        }
        
        setSettings(savedSettings);
      } catch (error) {
        console.error('Error loading settings from SecureStore:', error);
      }
    };
    
    loadSettings();
  }, []);

  const handleToggle = async (key: keyof typeof settings) => {
    try {
      const newValue = !settings[key];
      setSettings(prev => ({
        ...prev,
        [key]: newValue,
      }));
      await SecureStore.setItemAsync(`setting_${key}`, String(newValue));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      Alert.alert('Error', 'Failed to save setting');
    }
  };

  const handleRequestPermissions = async () => {
    try {
      setIsCheckingPermissions(true);
      const granted = await requestNotificationPermissions();
      const result = await checkNotificationPermissions();
      setPermissionStatus(result.status as PermissionStatus);
      
      if (granted) {
        Alert.alert('Success', 'Notification permissions granted! You will now receive assignment notifications.');
      } else if (result.canAskAgain === false) {
        Alert.alert(
          'Permissions Denied',
          'You have permanently denied notification permissions. To enable notifications:\n\n1. Go to your device settings\n2. Find this app\n3. Enable notifications',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Permissions Denied', 'You denied notification permissions. You can enable them anytime in settings.');
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to request notification permissions');
    } finally {
      setIsCheckingPermissions(false);
    }
  };

  const getPermissionStatusColor = () => {
    switch (permissionStatus) {
      case 'granted':
        return AppTheme.colors.maroonPrimary;
      case 'denied':
      case 'error':
        return '#d32f2f';
      default:
        return AppTheme.colors.textMuted;
    }
  };

  const getPermissionStatusText = () => {
    switch (permissionStatus) {
      case 'granted':
        return 'Enabled';
      case 'denied':
        return 'Disabled';
      case 'undetermined':
        return 'Not yet requested';
      case 'not_available':
        return 'Not available on this device';
      default:
        return 'Unknown';
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data but keep your scan history.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear cache implementation
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (_) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  const SettingRow = ({
    icon,
    title,
    subtitle,
    type,
    value,
    onToggle,
    onPress,
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    type: 'toggle' | 'action';
    value?: boolean;
    onToggle?: () => void;
    onPress?: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      style={[styles.settingRow, type === 'action' && { backgroundColor: AppTheme.colors.white }]}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, { backgroundColor: `${AppTheme.colors.maroonPrimary}15` }]}>
          <Ionicons name={icon as any} size={20} color={AppTheme.colors.maroonPrimary} />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {type === 'toggle' ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{
            false: AppTheme.colors.border,
            true: `${AppTheme.colors.maroonPrimary}40`,
          }}
          thumbColor={value ? AppTheme.colors.maroonPrimary : AppTheme.colors.textMuted}
        />
      ) : (
        <Ionicons name="chevron-forward" size={24} color={AppTheme.colors.textMuted} />
      )}
    </Pressable>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Professional Page Header */}
      <View style={styles.pageHeader}>
        <View style={styles.pageHeaderLeft}>
          <Ionicons name="settings" size={28} color={AppTheme.colors.maroonPrimary} />
          <View>
            <Text style={styles.pageHeaderTitle}>Settings</Text>
            <Text style={styles.pageHeaderSubtitle}>Manage your preferences</Text>
          </View>
        </View>
      </View>

      {/* Account Section */}
      <SectionHeader title="ACCOUNT" />
      <View style={styles.section}>
        <Pressable style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person-circle" size={48} color={AppTheme.colors.maroonPrimary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.username || 'Scanner User'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'No email provided'}</Text>
            <Text style={styles.profileRole}>{user?.role?.toUpperCase() || 'SCANNER'}</Text>
          </View>
        </Pressable>

        <SettingRow
          icon="person"
          title="My Account"
          subtitle="View and edit profile information"
          type="action"
          onPress={() => Alert.alert('My Account', 'Profile editing coming soon')}
        />

        <SettingRow
          icon="key"
          title="Session Management"
          subtitle="View active devices and login history"
          type="action"
          onPress={() => Alert.alert('Session Management', 'Manage your active sessions')}
        />
      </View>

      {/* App Preferences */}
      <SectionHeader title="APP PREFERENCES" />
      <View style={styles.section}>
        <SettingRow
          icon="notifications"
          title="Scan Alerts"
          subtitle={settings.soundEnabled ? 'Sound & Vibration' : 'Disabled'}
          type="toggle"
          value={settings.soundEnabled}
          onToggle={() => handleToggle('soundEnabled')}
        />

        <SettingRow
          icon="volume-high"
          title="Error Sound"
          subtitle="Play sound on failed scans"
          type="toggle"
          value={settings.errorSound}
          onToggle={() => handleToggle('errorSound')}
        />

        <SettingRow
          icon="phone-portrait"
          title="Vibration Feedback"
          subtitle="Haptic feedback on scan results"
          type="toggle"
          value={settings.vibrationEnabled}
          onToggle={() => handleToggle('vibrationEnabled')}
        />

        <SettingRow
          icon="shield-checkmark"
          title="Notification Permissions"
          subtitle={`Status: ${getPermissionStatusText()}`}
          type="action"
          onPress={handleRequestPermissions}
        />

        <SettingRow
          icon="mail"
          title="Assignment Notifications"
          subtitle="Get notified when assigned to events"
          type="toggle"
          value={settings.notificationsEnabled}
          onToggle={() => handleToggle('notificationsEnabled')}
        />

        <SettingRow
          icon="camera"
          title="Camera Settings"
          subtitle="Flash and focus options"
          type="action"
          onPress={() => Alert.alert('Camera Settings', 'Camera configuration options')}
        />
      </View>

      {/* Offline & Sync */}
      <SectionHeader title="OFFLINE & SYNC" />
      <View style={styles.section}>
        <SettingRow
          icon="wifi-off"
          title="Offline Mode"
          subtitle={settings.offlineMode ? 'Enabled' : 'Auto sync active'}
          type="toggle"
          value={settings.offlineMode}
          onToggle={() => handleToggle('offlineMode')}
        />

        <SettingRow
          icon="cloud-download"
          title="Sync Events"
          subtitle="Refresh event list from server"
          type="action"
          onPress={() => Alert.alert('Sync Events', 'Syncing events with server...')}
        />

        <SettingRow
          icon="document"
          title="View Cached Scans"
          subtitle="Scans pending sync"
          type="action"
          onPress={() => Alert.alert('Cached Scans', 'Showing locally cached scans')}
        />
      </View>

      {/* Event Management */}
      <SectionHeader title="EVENT MANAGEMENT" />
      <View style={styles.section}>
        <SettingRow
          icon="calendar"
          title="Active Events Filter"
          subtitle="Select events to display"
          type="action"
          onPress={() => Alert.alert('Events', 'Filter displaying events')}
        />

        <SettingRow
          icon="trending-up"
          title="Scan Statistics"
          subtitle="Today's scan overview"
          type="action"
          onPress={() => Alert.alert('Statistics', 'View scan statistics')}
        />
      </View>

      {/* App Info & Support */}
      <SectionHeader title="SUPPORT" />
      <View style={styles.section}>
        <SettingRow
          icon="information-circle"
          title="About App"
          subtitle="Version 1.0.0 (Build 1)"
          type="action"
          onPress={() => Alert.alert('About', 'QR Scanner v1.0.0\nLast updated: Today')}
        />

        <SettingRow
          icon="help-circle"
          title="Help & Support"
          subtitle="FAQs and troubleshooting"
          type="action"
          onPress={() => Alert.alert('Help', 'Contact support or view FAQ')}
        />
      </View>

      {/* Danger Zone */}
      <SectionHeader title="DANGER ZONE" />
      <View style={styles.section}>
        <SettingRow
          icon="trash"
          title="Clear Cache"
          subtitle="Remove temporary files"
          type="action"
          onPress={handleClearCache}
        />

        <SettingRow
          icon="log-out"
          title="Logout"
          subtitle="Sign out from this device"
          type="action"
          onPress={handleLogout}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>QR Scanner App</Text>
        <Text style={styles.footerVersion}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.lightBg,
  } as const,
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
  } as const,
  pageHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppTheme.spacing.md,
    flex: 1,
  } as const,
  pageHeaderTitle: {
    fontSize: AppTheme.fonts.sizes.lg,
    fontWeight: '700',
    color: AppTheme.colors.textPrimary,
  } as const,
  pageHeaderSubtitle: {
    fontSize: AppTheme.fonts.sizes.xs,
    color: AppTheme.colors.textMuted,
    marginTop: 2,
  } as const,
  section: {
    backgroundColor: AppTheme.colors.white,
    paddingHorizontal: AppTheme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
    marginBottom: AppTheme.spacing.lg,
  } as const,
  sectionHeader: {
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.md,
    paddingTop: AppTheme.spacing.lg,
  } as const,
  sectionTitle: {
    fontSize: AppTheme.fonts.sizes.xs,
    fontWeight: '700',
    color: AppTheme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  } as const,
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: AppTheme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
  } as const,
  profileAvatar: {
    marginRight: AppTheme.spacing.md,
  } as const,
  profileInfo: {
    flex: 1,
  } as const,
  profileName: {
    fontSize: AppTheme.fonts.sizes.base,
    fontWeight: '700',
    color: AppTheme.colors.textPrimary,
  } as const,
  profileEmail: {
    fontSize: AppTheme.fonts.sizes.sm,
    color: AppTheme.colors.textMuted,
    marginTop: AppTheme.spacing.xs,
  } as const,
  profileRole: {
    fontSize: AppTheme.fonts.sizes.xs,
    fontWeight: '600',
    color: AppTheme.colors.maroonPrimary,
    marginTop: AppTheme.spacing.xs,
  } as const,
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: AppTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
  } as const,
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: AppTheme.spacing.md,
  } as const,
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: AppTheme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  } as const,
  settingContent: {
    flex: 1,
  } as const,
  settingTitle: {
    fontSize: AppTheme.fonts.sizes.sm,
    fontWeight: '600',
    color: AppTheme.colors.textPrimary,
  } as const,
  settingSubtitle: {
    fontSize: AppTheme.fonts.sizes.xs,
    color: AppTheme.colors.textMuted,
    marginTop: AppTheme.spacing.xs,
  } as const,
  footer: {
    alignItems: 'center',
    paddingVertical: AppTheme.spacing.xl,
  } as const,
  footerText: {
    fontSize: AppTheme.fonts.sizes.sm,
    fontWeight: '600',
    color: AppTheme.colors.textMuted,
  } as const,
  footerVersion: {
    fontSize: AppTheme.fonts.sizes.xs,
    color: AppTheme.colors.textMuted,
    marginTop: AppTheme.spacing.xs,
  } as const,
});
