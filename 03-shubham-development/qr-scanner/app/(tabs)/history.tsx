import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { AppTheme } from '../../constants/appTheme';
import { fetchStaffAnalytics, type StaffAnalyticsResponse } from '@/@api/scanner/staff-analytics-fetcher';
import ErrorHandler from '@/utils/errorHandler';

export default function HistoryScreen() {
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');

  // Fetch staff analytics using React Query
  const {
    data: analyticsData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['staffAnalytics'],
    queryFn: fetchStaffAnalytics,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Filter scans based on selected filter
  const filteredScans = useMemo(() => {
    if (!analyticsData?.recentScans) return [];

    switch (filter) {
      case 'success':
        return analyticsData.recentScans.filter((s) => s.status === 'SUCCESS');
      case 'failed':
        return analyticsData.recentScans.filter((s) => s.status !== 'SUCCESS');
      default:
        return analyticsData.recentScans;
    }
  }, [analyticsData?.recentScans, filter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return AppTheme.colors.success;
      case 'REJECTED':
        return AppTheme.colors.error;
      case 'ALREADY_CHECKED_IN':
        return AppTheme.colors.warning;
      default:
        return AppTheme.colors.textMuted;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'checkmark-circle';
      case 'REJECTED':
        return 'close-circle';
      case 'ALREADY_CHECKED_IN':
        return 'alert-circle';
      default:
        return 'help-circle';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'Checked In';
      case 'REJECTED':
        return 'Rejected';
      case 'ALREADY_CHECKED_IN':
        return 'Already In';
      default:
        return status;
    }
  };

  const renderScanItem = ({ item }: { item: any }) => (
    <View style={[styles.scanCard, { borderLeftColor: getStatusColor(item.status) }]}>
      <View style={styles.scanCardLeft}>
        <Ionicons
          name={getStatusIcon(item.status) as any}
          size={24}
          color={getStatusColor(item.status)}
        />
      </View>
      <View style={styles.scanCardContent}>
        <Text style={styles.attendeeName} numberOfLines={1}>
          {item.attendeeName}
        </Text>
        <Text style={styles.attendeeEmail} numberOfLines={1}>
          {item.attendeeEmail}
        </Text>
        <Text style={styles.eventName} numberOfLines={1}>
          {item.eventName}
        </Text>
      </View>
      <View style={styles.scanCardRight}>
        <Text
          style={[styles.statusBadge, { color: getStatusColor(item.status) }]}
        >
          {getStatusLabel(item.status)}
        </Text>
        <Text style={styles.scanTime}>
          {new Date(item.checkedInAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );

  // Error state
  if (error) {
    const apiError = error as any;
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={AppTheme.colors.lightBg} />
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={AppTheme.colors.error}
          />
          <Text style={styles.errorTitle}>Failed to Load Analytics</Text>
          <Text style={styles.errorMessage}>
            {apiError?.message || 'An error occurred while fetching your analytics.'}
          </Text>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <Ionicons name="refresh" size={20} color={AppTheme.colors.textWhite} />
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="dark-content" backgroundColor={AppTheme.colors.lightBg} />
        <ActivityIndicator
          size="large"
          color={AppTheme.colors.maroonPrimary}
        />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={AppTheme.colors.lightBg} />

      {/* Staff Header */}
      <View style={styles.staffHeader}>
        <View style={styles.staffInfo}>
          <View style={styles.staffAvatar}>
            <Ionicons name="person" size={24} color={AppTheme.colors.textWhite} />
          </View>
          <View>
            <Text style={styles.staffName}>{analyticsData?.staff.name}</Text>
            <Text style={styles.staffRole}>Scanner Staff</Text>
          </View>
        </View>
      </View>

      {/* Summary Stats */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsScroll}
      >
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{analyticsData?.summary.totalScans}</Text>
          <Text style={styles.statLabel}>Total Scans</Text>
        </View>
        <View
          style={[
            styles.statCard,
            { borderLeftColor: AppTheme.colors.success, borderLeftWidth: 3 },
          ]}
        >
          <Text
            style={[styles.statValue, { color: AppTheme.colors.success }]}
          >
            {analyticsData?.summary.successfulScans}
          </Text>
          <Text style={styles.statLabel}>Successful</Text>
        </View>
        <View
          style={[
            styles.statCard,
            { borderLeftColor: AppTheme.colors.error, borderLeftWidth: 3 },
          ]}
        >
          <Text
            style={[styles.statValue, { color: AppTheme.colors.error }]}
          >
            {analyticsData?.summary.failedScans}
          </Text>
          <Text style={styles.statLabel}>Failed</Text>
        </View>
        <View
          style={[
            styles.statCard,
            { borderLeftColor: AppTheme.colors.warning, borderLeftWidth: 3 },
          ]}
        >
          <Text
            style={[styles.statValue, { color: AppTheme.colors.warning }]}
          >
            {analyticsData?.summary.successRate}%
          </Text>
          <Text style={styles.statLabel}>Success Rate</Text>
        </View>
      </ScrollView>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <Pressable
          style={[
            styles.filterButton,
            filter === 'all' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'all' && styles.filterButtonTextActive,
            ]}
          >
            All
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.filterButton,
            filter === 'success' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('success')}
        >
          <Ionicons
            name="checkmark-circle"
            size={16}
            color={filter === 'success' ? AppTheme.colors.textWhite : AppTheme.colors.success}
          />
          <Text
            style={[
              styles.filterButtonText,
              filter === 'success' && styles.filterButtonTextActive,
            ]}
          >
            Success
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.filterButton,
            filter === 'failed' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('failed')}
        >
          <Ionicons
            name="close-circle"
            size={16}
            color={filter === 'failed' ? AppTheme.colors.textWhite : AppTheme.colors.error}
          />
          <Text
            style={[
              styles.filterButtonText,
              filter === 'failed' && styles.filterButtonTextActive,
            ]}
          >
            Failed
          </Text>
        </Pressable>
      </View>

      {/* Recent Scans List */}
      <Text style={styles.sectionTitle}>Recent Scans</Text>
      {isFetching && !isLoading && (
        <View style={styles.refreshingIndicator}>
          <ActivityIndicator size="small" color={AppTheme.colors.maroonPrimary} />
          <Text style={styles.refreshingText}>Syncing...</Text>
        </View>
      )}
      {filteredScans.length > 0 ? (
        <FlatList
          data={filteredScans}
          renderItem={renderScanItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          scrollEnabled={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="document-outline"
            size={48}
            color={AppTheme.colors.textMuted}
          />
          <Text style={styles.emptyText}>
            {filter === 'all'
              ? 'No scans yet'
              : `No ${filter} scans`}
          </Text>
          <Text style={styles.emptySubtext}>
            Scans will appear here as you check in attendees
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.lightBg,
  } as const,
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  } as const,
  loadingText: {
    marginTop: AppTheme.spacing.lg,
    fontSize: AppTheme.fonts.sizes.base,
    color: AppTheme.colors.textMuted,
    fontWeight: AppTheme.fonts.weights.medium as any,
  } as const,
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: AppTheme.spacing.lg,
  } as const,
  errorTitle: {
    marginTop: AppTheme.spacing.lg,
    fontSize: AppTheme.fonts.sizes.lg,
    fontWeight: AppTheme.fonts.weights.bold as any,
    color: AppTheme.colors.textPrimary,
  } as const,
  errorMessage: {
    marginTop: AppTheme.spacing.md,
    fontSize: AppTheme.fonts.sizes.sm,
    color: AppTheme.colors.textMuted,
    textAlign: 'center',
  } as const,
  retryButton: {
    marginTop: AppTheme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppTheme.spacing.sm,
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.maroonPrimary,
    borderRadius: AppTheme.radius.md,
  } as const,
  retryButtonText: {
    fontSize: AppTheme.fonts.sizes.sm,
    fontWeight: AppTheme.fonts.weights.semibold as any,
    color: AppTheme.colors.textWhite,
  } as const,
  staffHeader: {
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
  } as const,
  staffInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppTheme.spacing.md,
  } as const,
  staffAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppTheme.colors.maroonPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  } as const,
  staffName: {
    fontSize: AppTheme.fonts.sizes.base,
    fontWeight: AppTheme.fonts.weights.bold as any,
    color: AppTheme.colors.textPrimary,
  } as const,
  staffRole: {
    fontSize: AppTheme.fonts.sizes.xs,
    color: AppTheme.colors.textMuted,
    marginTop: 2,
  } as const,
  statsScroll: {
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.md,
    gap: AppTheme.spacing.sm,
  } as const,
  statCard: {
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.white,
    borderRadius: AppTheme.radius.md,
    minWidth: 140,
    borderLeftWidth: 3,
    borderLeftColor: AppTheme.colors.maroonPrimary,
  } as const,
  statValue: {
    fontSize: AppTheme.fonts.sizes.lg,
    fontWeight: AppTheme.fonts.weights.bold as any,
    color: AppTheme.colors.maroonPrimary,
  } as const,
  statLabel: {
    fontSize: AppTheme.fonts.sizes.xs,
    color: AppTheme.colors.textMuted,
    marginTop: AppTheme.spacing.xs,
  } as const,
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.md,
    gap: AppTheme.spacing.sm,
    backgroundColor: AppTheme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
  } as const,
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppTheme.spacing.xs,
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.sm,
    borderRadius: AppTheme.radius.md,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    backgroundColor: AppTheme.colors.white,
  } as const,
  filterButtonActive: {
    backgroundColor: AppTheme.colors.maroonPrimary,
    borderColor: AppTheme.colors.maroonPrimary,
  } as const,
  filterButtonText: {
    fontSize: AppTheme.fonts.sizes.sm,
    fontWeight: AppTheme.fonts.weights.semibold as any,
    color: AppTheme.colors.textPrimary,
  } as const,
  filterButtonTextActive: {
    color: AppTheme.colors.textWhite,
  } as const,
  refreshingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppTheme.spacing.sm,
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.sm,
    backgroundColor: `${AppTheme.colors.maroonPrimary}10`,
  } as const,
  refreshingText: {
    fontSize: AppTheme.fonts.sizes.xs,
    color: AppTheme.colors.maroonPrimary,
    fontWeight: AppTheme.fonts.weights.semibold as any,
  } as const,
  sectionTitle: {
    fontSize: AppTheme.fonts.sizes.base,
    fontWeight: AppTheme.fonts.weights.bold as any,
    color: AppTheme.colors.textPrimary,
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.white,
  } as const,
  listContent: {
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.md,
    gap: AppTheme.spacing.md,
  } as const,
  scanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppTheme.colors.white,
    borderRadius: AppTheme.radius.md,
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.md,
    borderLeftWidth: 4,
  } as const,
  scanCardLeft: {
    marginRight: AppTheme.spacing.md,
  } as const,
  scanCardContent: {
    flex: 1,
  } as const,
  attendeeName: {
    fontSize: AppTheme.fonts.sizes.sm,
    fontWeight: AppTheme.fonts.weights.semibold as any,
    color: AppTheme.colors.textPrimary,
  } as const,
  attendeeEmail: {
    fontSize: AppTheme.fonts.sizes.xs,
    color: AppTheme.colors.textMuted,
    marginTop: AppTheme.spacing.xs,
  } as const,
  eventName: {
    fontSize: AppTheme.fonts.sizes.xs,
    color: AppTheme.colors.textMuted,
    marginTop: AppTheme.spacing.xs,
  } as const,
  scanCardRight: {
    alignItems: 'flex-end',
    marginLeft: AppTheme.spacing.md,
  } as const,
  statusBadge: {
    fontSize: AppTheme.fonts.sizes.xs,
    fontWeight: AppTheme.fonts.weights.semibold as any,
  } as const,
  scanTime: {
    fontSize: AppTheme.fonts.sizes.xs,
    color: AppTheme.colors.textMuted,
    marginTop: AppTheme.spacing.xs,
  } as const,
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: AppTheme.spacing.lg,
  } as const,
  emptyText: {
    marginTop: AppTheme.spacing.lg,
    fontSize: AppTheme.fonts.sizes.base,
    fontWeight: AppTheme.fonts.weights.semibold as any,
    color: AppTheme.colors.textPrimary,
  } as const,
  emptySubtext: {
    marginTop: AppTheme.spacing.sm,
    fontSize: AppTheme.fonts.sizes.sm,
    color: AppTheme.colors.textMuted,
    textAlign: 'center',
  } as const,
});

   