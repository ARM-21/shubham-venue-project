import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme } from '@/constants/appTheme';
import * as SecureStore from 'expo-secure-store';

interface ScanRecord {
  id: string;
  ticketId: string;
  attendeeName: string;
  eventName: string;
  scanTime: string;
  status: 'valid' | 'rejected' | 'already_checked';
  qrCode: string;
}

export default function HistoryScreen() {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadScanHistory();
  }, [selectedDate]);

  const loadScanHistory = async () => {
    try {
      setLoading(true);
      const cachedScans = await SecureStore.getItemAsync(`scans_${selectedDate}`);
      if (cachedScans) {
        setScans(JSON.parse(cachedScans));
      } else {
        setScans([]);
      }
    } catch (error) {
      console.error('Error loading scan history:', error);
      Alert.alert('Error', 'Failed to load scan history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return AppTheme.colors.success;
      case 'rejected':
        return AppTheme.colors.error;
      case 'already_checked':
        return AppTheme.colors.warning;
      default:
        return AppTheme.colors.textMuted;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      case 'already_checked':
        return 'alert-circle';
      default:
        return 'help-circle';
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      `Are you sure you want to delete all scans from ${selectedDate}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await SecureStore.setItemAsync(`scans_${selectedDate}`, '');
              setScans([]);
              Alert.alert('Success', 'Scan history cleared');
            } catch (_) {
              Alert.alert('Error', 'Failed to clear history');
            }
          },
        },
      ]
    );
  };

  const renderScanItem = ({ item }: { item: ScanRecord }) => (
    <View style={[styles.scanCard, { borderLeftColor: getStatusColor(item.status) }]}>
      <View style={styles.scanCardLeft}>
        <Ionicons
          name={getStatusIcon(item.status)}
          size={24}
          color={getStatusColor(item.status)}
        />
      </View>
      <View style={styles.scanCardContent}>
        <Text style={styles.attendeeName}>{item.attendeeName}</Text>
        <Text style={styles.eventName}>{item.eventName}</Text>
        <Text style={styles.scanTime}>{item.scanTime}</Text>
      </View>
      <View style={styles.scanCardRight}>
        <Text style={[styles.statusBadge, { color: getStatusColor(item.status) }]}>
          {item.status === 'already_checked' ? 'Already In' : item.status}
        </Text>
      </View>
    </View>
  );

  const stats = {
    total: scans.length,
    valid: scans.filter(s => s.status === 'valid').length,
    rejected: scans.filter(s => s.status === 'rejected').length,
    alreadyChecked: scans.filter(s => s.status === 'already_checked').length,
  };

  return (
    <View style={styles.container}>
      {/* Professional Page Header */}
      <View style={styles.pageHeader}>
        <View style={styles.pageHeaderLeft}>
          <Ionicons name="time" size={28} color={AppTheme.colors.maroonPrimary} />
          <View>
            <Text style={styles.pageHeaderTitle}>Scan History</Text>
            <Text style={styles.pageHeaderSubtitle}>Track all your scans</Text>
          </View>
        </View>
      </View>

      {/* Date Selector */}
      <View style={styles.dateSelector}>
        <Pressable
          onPress={() => {
            const date = new Date(selectedDate);
            date.setDate(date.getDate() - 1);
            setSelectedDate(date.toISOString().split('T')[0]);
          }}
          style={styles.dateButton}
        >
          <Ionicons name="chevron-back" size={24} color={AppTheme.colors.maroonPrimary} />
        </Pressable>

        <Pressable
          onPress={() => {
            // Open date picker
          }}
          style={styles.dateDisplay}
        >
          <Ionicons name="calendar" size={20} color={AppTheme.colors.maroonPrimary} />
          <Text style={styles.dateText}>{selectedDate}</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            const date = new Date(selectedDate);
            date.setDate(date.getDate() + 1);
            // Don't allow future dates
            if (date <= new Date()) {
              setSelectedDate(date.toISOString().split('T')[0]);
            }
          }}
          style={styles.dateButton}
        >
          <Ionicons name="chevron-forward" size={24} color={AppTheme.colors.maroonPrimary} />
        </Pressable>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Scans</Text>
        </View>
        <View style={[styles.statItem, { borderLeftColor: AppTheme.colors.success, borderLeftWidth: 2 }]}>
          <Text style={[styles.statValue, { color: AppTheme.colors.success }]}>{stats.valid}</Text>
          <Text style={styles.statLabel}>Valid</Text>
        </View>
        <View style={[styles.statItem, { borderLeftColor: AppTheme.colors.error, borderLeftWidth: 2 }]}>
          <Text style={[styles.statValue, { color: AppTheme.colors.error }]}>{stats.rejected}</Text>
          <Text style={styles.statLabel}>Rejected</Text>
        </View>
        <View style={[styles.statItem, { borderLeftColor: AppTheme.colors.warning, borderLeftWidth: 2 }]}>
          <Text style={[styles.statValue, { color: AppTheme.colors.warning }]}>{stats.alreadyChecked}</Text>
          <Text style={styles.statLabel}>Already In</Text>
        </View>
      </View>

      {/* Scan List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppTheme.colors.maroonPrimary} />
        </View>
      ) : scans.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="document-outline"
            size={48}
            color={AppTheme.colors.textMuted}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyText}>No scans recorded for this date</Text>
          <Text style={styles.emptySubtext}>Scans will appear here as you check in attendees</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={scans}
            renderItem={renderScanItem}
            keyExtractor={(item) => item.id}
            scrollEnabled
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
          <Pressable
            onPress={handleClearHistory}
            style={[styles.clearButton, { marginTop: AppTheme.spacing.md }]}
          >
            <Ionicons name="trash" size={20} color={AppTheme.colors.error} />
            <Text style={[styles.clearButtonText, { color: AppTheme.colors.error }]}>Clear History</Text>
          </Pressable>
        </>
      )}
    </View>
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
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
  } as const,
  dateButton: {
    padding: AppTheme.spacing.sm,
  } as const,
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppTheme.spacing.sm,
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.sm,
    backgroundColor: AppTheme.colors.lightBg,
    borderRadius: AppTheme.radius.md,
  } as const,
  dateText: {
    fontSize: AppTheme.fonts.sizes.sm,
    fontWeight: '600',
    color: AppTheme.colors.maroonPrimary,
  } as const,
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.md,
    gap: AppTheme.spacing.sm,
    backgroundColor: AppTheme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
  } as const,
  statItem: {
    flex: 1,
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.lightBg,
    borderRadius: AppTheme.radius.md,
    alignItems: 'center',
  } as const,
  statValue: {
    fontSize: AppTheme.fonts.sizes.lg,
    fontWeight: '700',
    color: AppTheme.colors.maroonPrimary,
  } as const,
  statLabel: {
    fontSize: AppTheme.fonts.sizes.xs,
    color: AppTheme.colors.textMuted,
    marginTop: AppTheme.spacing.xs,
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
    fontWeight: '600',
    color: AppTheme.colors.textPrimary,
  } as const,
  eventName: {
    fontSize: AppTheme.fonts.sizes.xs,
    color: AppTheme.colors.textMuted,
    marginTop: AppTheme.spacing.xs,
  } as const,
  scanTime: {
    fontSize: AppTheme.fonts.sizes.xs,
    color: AppTheme.colors.textMuted,
    marginTop: AppTheme.spacing.xs,
  } as const,
  scanCardRight: {
    marginLeft: AppTheme.spacing.md,
  } as const,
  statusBadge: {
    fontSize: AppTheme.fonts.sizes.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  } as const,
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as const,
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as const,
  emptyIcon: {
    marginBottom: AppTheme.spacing.lg,
    opacity: 0.5,
  } as const,
  emptyText: {
    fontSize: AppTheme.fonts.sizes.base,
    fontWeight: '600',
    color: AppTheme.colors.textPrimary,
    marginBottom: AppTheme.spacing.sm,
  } as const,
  emptySubtext: {
    fontSize: AppTheme.fonts.sizes.sm,
    color: AppTheme.colors.textMuted,
  } as const,
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: AppTheme.spacing.sm,
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.white,
    borderRadius: AppTheme.radius.md,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    marginHorizontal: AppTheme.spacing.lg,
    marginBottom: AppTheme.spacing.lg,
  } as const,
  clearButtonText: {
    fontSize: AppTheme.fonts.sizes.sm,
    fontWeight: '600',
  } as const,
});
