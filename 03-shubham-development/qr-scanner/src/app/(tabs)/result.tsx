import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppTheme } from '@/constants/appTheme';

export default function ResultScreen() {
  const { status, ticketName, message, eventId, checkedInAt, ticketType } =
    useLocalSearchParams();
  const router = useRouter();

  // Auto-dismiss after 4 seconds for successful scans, 5 seconds for errors
  useEffect(() => {
    const isSuccess = status === 'SUCCESS';
    const timer = setTimeout(
      () => {
        router.back();
      },
      isSuccess ? 4000 : 5000
    );

    return () => clearTimeout(timer);
  }, [status, eventId, router]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const isSuccess = status === 'SUCCESS';
  const isAlreadyCheckedIn = status === 'ALREADY_CHECKED_IN';

  // Determine styling based on status
  const getStatusStyle = () => {
    if (isSuccess) {
      return {
        backgroundColor: '#e8f5e9',
        borderColor: '#4CAF50',
        icon: '✅',
        iconColor: '#4CAF50',
      };
    } else if (isAlreadyCheckedIn) {
      return {
        backgroundColor: '#fff3e0',
        borderColor: '#ff9800',
        icon: '⚠️',
        iconColor: '#ff9800',
      };
    } else {
      return {
        backgroundColor: '#ffebee',
        borderColor: '#F44336',
        icon: '❌',
        iconColor: '#F44336',
      };
    }
  };

  const statusStyle = getStatusStyle();

  const getStatusTitle = () => {
    if (isSuccess) {
      return 'Check-in Successful!';
    } else if (isAlreadyCheckedIn) {
      return 'Already Checked In';
    } else {
      return 'Check-in Failed';
    }
  };

  const formatTime = (dateString: string | string[]) => {
    try {
      const dateStr = Array.isArray(dateString) ? dateString[0] : dateString;
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Background overlay */}
        <View style={[styles.backdrop, { backgroundColor: statusStyle.backgroundColor }]} />

        {/* Content Card */}
        <View style={styles.cardContainer}>
          <View
            style={[
              styles.card,
              {
                borderTopWidth: 4,
                borderTopColor: statusStyle.iconColor,
              },
            ]}
          >
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>{statusStyle.icon}</Text>
            </View>

            {/* Status Title */}
            <Text style={[styles.statusText, { color: statusStyle.iconColor }]}>
              {getStatusTitle()}
            </Text>

            {/* Ticket Name */}
            <Text style={styles.ticketName} numberOfLines={2}>
              {ticketName || 'Guest'}
            </Text>

            {/* Ticket Type Badge */}
            {ticketType && (
              <View style={styles.ticketTypeBadge}>
                <Text style={styles.ticketTypeText}>{ticketType}</Text>
              </View>
            )}

            {/* Message */}
            <View style={styles.messageContainer}>
              <Text style={styles.message}>{message || 'No additional details'}</Text>
            </View>

            {/* Time Information */}
            {checkedInAt && (
              <View style={styles.timeContainer}>
                <Text style={styles.timeLabel}>Checked In At:</Text>
                <Text style={styles.timeValue}>
                  {formatTime(checkedInAt)}
                </Text>
              </View>
            )}

            {/* Status Details */}
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Event Status:</Text>
                <Text style={styles.detailValue}>{status}</Text>
              </View>
            </View>
          </View>

          {/* Quick Action Button */}
          <TouchableOpacity
            style={[
              styles.backButton,
              {
                backgroundColor: statusStyle.iconColor,
              },
            ]}
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>Back to Scanner</Text>
          </TouchableOpacity>

          {/* Auto-dismiss info */}
          <Text style={styles.autoDismissText}>
            Automatically returning in a few seconds...
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.lightBg,
  } as const,
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.lg,
  } as const,
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: AppTheme.opacity.subtle,
  } as const,
  cardContainer: {
    alignItems: 'center',
  } as const,
  card: {
    backgroundColor: AppTheme.colors.white,
    borderRadius: AppTheme.radius.xl,
    paddingVertical: AppTheme.spacing.xl,
    paddingHorizontal: AppTheme.spacing.lg,
    width: '100%',
    ...AppTheme.shadows.lg,
    marginBottom: AppTheme.spacing.md,
  } as const,
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: AppTheme.spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.05)',
  } as const,
  iconText: {
    fontSize: AppTheme.fonts.sizes['4xl'],
  } as const,
  statusText: {
    fontSize: AppTheme.fonts.sizes['2xl'],
    fontWeight: AppTheme.fonts.weights.bold as any,
    marginBottom: AppTheme.spacing.md,
    textAlign: 'center',
    letterSpacing: 0.3,
  } as const,
  ticketName: {
    fontSize: AppTheme.fonts.sizes.lg,
    fontWeight: AppTheme.fonts.weights.bold as any,
    color: AppTheme.colors.maroonPrimary,
    marginBottom: AppTheme.spacing.md,
    textAlign: 'center',
    lineHeight: 24,
  } as const,
  ticketTypeBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.sm,
    borderRadius: AppTheme.radius.md,
    marginBottom: AppTheme.spacing.lg,
    alignSelf: 'center',
  } as const,
  ticketTypeText: {
    fontSize: AppTheme.fonts.sizes.xs,
    color: AppTheme.colors.textSecondary,
    fontWeight: AppTheme.fonts.weights.semibold as any,
    letterSpacing: 0.3,
  } as const,
  messageContainer: {
    backgroundColor: '#fafafa',
    borderLeftWidth: 3,
    borderLeftColor: AppTheme.colors.maroonPrimary,
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.md,
    borderRadius: AppTheme.radius.md,
    marginBottom: AppTheme.spacing.lg,
  } as const,
  message: {
    fontSize: AppTheme.fonts.sizes.sm,
    color: AppTheme.colors.textSecondary,
    fontWeight: AppTheme.fonts.weights.medium as any,
    lineHeight: 20,
  } as const,
  timeContainer: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.md,
    borderRadius: AppTheme.radius.md,
    marginBottom: AppTheme.spacing.lg,
    alignItems: 'center',
  } as const,
  timeLabel: {
    fontSize: AppTheme.fonts.sizes.xs,
    color: AppTheme.colors.textSecondary,
    fontWeight: AppTheme.fonts.weights.semibold as any,
    marginBottom: AppTheme.spacing.sm,
  } as const,
  timeValue: {
    fontSize: AppTheme.fonts.sizes.base,
    color: AppTheme.colors.textPrimary,
    fontWeight: AppTheme.fonts.weights.bold as any,
    letterSpacing: 0.5,
  } as const,
  detailsContainer: {
    width: '100%',
    backgroundColor: '#fafafa',
    borderRadius: AppTheme.radius.md,
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.md,
  } as const,
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: AppTheme.spacing.sm,
  } as const,
  detailLabel: {
    fontSize: AppTheme.fonts.sizes.xs,
    color: AppTheme.colors.textSecondary,
    fontWeight: AppTheme.fonts.weights.semibold as any,
  } as const,
  detailValue: {
    fontSize: AppTheme.fonts.sizes.xs,
    color: AppTheme.colors.textPrimary,
    fontWeight: AppTheme.fonts.weights.bold as any,
    letterSpacing: 0.3,
  } as const,
  backButton: {
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.md,
    borderRadius: AppTheme.radius.md,
    width: '100%',
    alignItems: 'center',
    marginBottom: AppTheme.spacing.md,
  } as const,
  backButtonText: {
    color: AppTheme.colors.textWhite,
    fontSize: AppTheme.fonts.sizes.base,
    fontWeight: AppTheme.fonts.weights.bold as any,
    letterSpacing: 0.3,
  } as const,
  autoDismissText: {
    fontSize: AppTheme.fonts.sizes.xs,
    color: AppTheme.colors.textMuted,
    fontWeight: AppTheme.fonts.weights.medium as any,
    textAlign: 'center',
    fontStyle: 'italic',
  } as const,
});


