import React, { useCallback, useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useScannerEvents } from '@/@queries/scanner/events';
import { AppTheme } from '../../constants/appTheme';
import type { Event } from '@/@api/scanner/events-fetcher';


export default function EventsScreen() {
  const [retryCount, setRetryCount] = useState(0);
  const { logout } = useAuth();
  const router = useRouter();

  // React Query hook - handles all data fetching, caching, and refetching
  const {
    data: events = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useScannerEvents({
    enabled: true,
  });

  // Refetch when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleRetry = async () => {
    setRetryCount((prev) => prev + 1);
    await refetch();
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (_) {
      console.error('Logout error');
    }
  };

  const handleEventPress = (event: Event) => {

    router.push({
      pathname: '/(tabs)/scanner',
      params: {
        eventId: event.eventId,
        eventName: event.eventName,
        gate: event.gate,
      },
    });
  };

  const onRefresh = async () => {
    setRetryCount(0);
    await refetch();
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return 'Date TBD';
    }
  };

  const renderEventItem = ({item}: {item: Event}) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => handleEventPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.eventHeader}>
        <View style={styles.eventInfo}>
          <Text style={styles.eventName} numberOfLines={2}>
            {item.eventName}
          </Text>
          <Text style={styles.hallName}>
            📍 {item.hall?.hallName || 'Hall TBD'}
          </Text>
        </View>
        <View style={styles.gateBadge}>
          <Text style={styles.gateBadgeText}>{item.gate}</Text>
        </View>
      </View>

      <View style={styles.eventFooter}>
        <Text style={styles.eventDate}>📅 {formatDate(item.eventDate)}</Text>
        <Text style={styles.actionText}>Tap to scan →</Text>
      </View>
    </TouchableOpacity>
  );

  // Loading state
  if (isLoading && events.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading your events...</Text>
          <Text style={styles.loadingSubtext}>
            Please wait while we fetch your assignments
          </Text>
        </View>
      </View>
    );
  }

  // Error state with no events
  if (isError && events.length === 0) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to load events. Please try again.';

    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <View style={styles.errorIcon}>
            <Text style={styles.errorIconText}>⚠️</Text>
          </View>
          <Text style={styles.errorTitle}>Unable to Load Events</Text>
          <Text style={styles.errorMessage}>{errorMessage}</Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
          >
            <Text style={styles.retryButtonText}>
              {retryCount > 0 ? `Try Again (${retryCount})` : 'Try Again'}
            </Text>
          </TouchableOpacity>

          {retryCount > 2 && (
            <TouchableOpacity
              style={[styles.retryButton, styles.signOutButton]}
              onPress={handleLogout}
            >
              <Text style={styles.signOutText}>Sign Out & Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // Empty state
  if (events.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>📭</Text>
          </View>
          <Text style={styles.emptyTitle}>No Events Assigned</Text>
          <Text style={styles.emptyMessage}>
            You do not have any events assigned yet. Contact your admin to assign
            you to an event.
          </Text>

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={onRefresh}
          >
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Success state with events
  return (
    <View style={styles.container}>
      {isError && events.length > 0 && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            ⚠️ Failed to refresh. Showing cached data.
          </Text>
        </View>
      )}

      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        scrollEventThrottle={16}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.lightBg,
  } as const,
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: AppTheme.spacing.lg,
  } as const,
  loadingText: {
    marginTop: AppTheme.spacing.lg,
    fontSize: AppTheme.fonts.sizes.lg,
    fontWeight: AppTheme.fonts.weights.semibold as any,
    color: AppTheme.colors.textPrimary,
    letterSpacing: 0.3,
  } as const,
  loadingSubtext: {
    marginTop: AppTheme.spacing.sm,
    fontSize: AppTheme.fonts.sizes.sm,
    color: AppTheme.colors.textSecondary,
    textAlign: 'center' as const,
  } as const,
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffe8e8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: AppTheme.spacing.lg,
  } as const,
  errorIconText: {
    fontSize: AppTheme.fonts.sizes['3xl'],
  } as const,
  errorTitle: {
    fontSize: AppTheme.fonts.sizes.lg,
    fontWeight: AppTheme.fonts.weights.bold as any,
    color: AppTheme.colors.textPrimary,
    marginBottom: AppTheme.spacing.md,
    textAlign: 'center' as const,
  } as const,
  errorMessage: {
    fontSize: AppTheme.fonts.sizes.sm,
    color: AppTheme.colors.textSecondary,
    textAlign: 'center' as const,
    marginBottom: AppTheme.spacing.lg,
    lineHeight: 20,
  } as const,
  emptyIcon: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: AppTheme.spacing.lg,
  } as const,
  emptyIconText: {
    fontSize: AppTheme.fonts.sizes['4xl'],
  } as const,
  emptyTitle: {
    fontSize: AppTheme.fonts.sizes.lg,
    fontWeight: AppTheme.fonts.weights.bold as any,
    color: AppTheme.colors.textPrimary,
    marginBottom: AppTheme.spacing.md,
    textAlign: 'center' as const,
  } as const,
  emptyMessage: {
    fontSize: AppTheme.fonts.sizes.sm,
    color: AppTheme.colors.textSecondary,
    textAlign: 'center' as const,
    marginBottom: AppTheme.spacing.lg,
    lineHeight: 20,
  } as const,
  retryButton: {
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.maroonPrimary,
    borderRadius: AppTheme.radius.md,
    marginTop: AppTheme.spacing.md,
    minWidth: 200,
    alignItems: 'center' as const,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  } as const,
  retryButtonText: {
    color: AppTheme.colors.textWhite,
    fontSize: AppTheme.fonts.sizes.base,
    fontWeight: AppTheme.fonts.weights.semibold as any,
    letterSpacing: 0.3,
  } as const,
  refreshButton: {
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.maroonPrimary,
    borderRadius: AppTheme.radius.md,
    minWidth: 140,
    alignItems: 'center' as const,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  } as const,
  refreshButtonText: {
    color: AppTheme.colors.textWhite,
    fontSize: AppTheme.fonts.sizes.base,
    fontWeight: AppTheme.fonts.weights.semibold as any,
  } as const,
  signOutButton: {
    backgroundColor: AppTheme.colors.textMuted,
  } as const,
  signOutText: {
    color: AppTheme.colors.textWhite,
    fontSize: AppTheme.fonts.sizes.sm,
    fontWeight: AppTheme.fonts.weights.semibold as any,
  } as const,
  warningBanner: {
    backgroundColor: '#fff3cd',
    borderBottomWidth: 1,
    borderBottomColor: '#ffc107',
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.md,
  } as const,
  warningText: {
    fontSize: AppTheme.fonts.sizes.xs,
    color: '#856404',
    fontWeight: AppTheme.fonts.weights.medium as any,
  } as const,
  listContent: {
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.md,
  } as const,
  eventCard: {
    backgroundColor: AppTheme.colors.white,
    borderRadius: AppTheme.radius.lg,
    marginVertical: AppTheme.spacing.md,
    marginHorizontal: AppTheme.spacing.sm,
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  } as const,
  eventHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: AppTheme.spacing.md,
  } as const,
  eventInfo: {
    flex: 1,
    marginRight: AppTheme.spacing.md,
  } as const,
  eventName: {
    fontSize: AppTheme.fonts.sizes.base,
    fontWeight: AppTheme.fonts.weights.bold as any,
    color: AppTheme.colors.textPrimary,
    marginBottom: AppTheme.spacing.sm,
    lineHeight: 22,
  } as const,
  hallName: {
    fontSize: AppTheme.fonts.sizes.sm,
    color: AppTheme.colors.textSecondary,
    fontWeight: AppTheme.fonts.weights.medium as any,
  } as const,
  gateBadge: {
    backgroundColor: AppTheme.colors.maroonPrimary,
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.sm,
    borderRadius: AppTheme.radius.md,
  } as const,
  gateBadgeText: {
    color: AppTheme.colors.textWhite,
    fontSize: AppTheme.fonts.sizes.xs,
    fontWeight: AppTheme.fonts.weights.bold as any,
    letterSpacing: 0.5,
  } as const,
  eventFooter: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: AppTheme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  } as const,
  eventDate: {
    fontSize: AppTheme.fonts.sizes.xs,
    color: AppTheme.colors.textMuted,
    fontWeight: AppTheme.fonts.weights.medium as any,
  } as const,
  actionText: {
    fontSize: AppTheme.fonts.sizes.xs,
    color: AppTheme.colors.maroonPrimary,
    fontWeight: AppTheme.fonts.weights.semibold as any,
  } as const,
});
