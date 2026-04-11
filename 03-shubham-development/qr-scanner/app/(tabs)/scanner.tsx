import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Vibration,
  StatusBar,
  FlatList,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Device from 'expo-device';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { scanQRMutator, type ScanQRResponse } from '@/@api/scanner/scan-fetcher';
import ErrorHandler from '@/utils/errorHandler';
import { AppTheme } from '../../constants/appTheme';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';

export default function ScannerScreen() {
  const { eventId, viewHistory } = useLocalSearchParams();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(0);
  const [scanCount, setScanCount] = useState(0);
  const cameraRef = useRef<CameraView>(null);
  const { token } = useAuth();
  const router = useRouter();

  // Fetch history if viewHistory param is set
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['scanHistory', eventId],
    queryFn: async () => {
      const response = await api.get(`/scanner/events/${eventId}/checkins`);
      return response.data;
    },
    enabled: !!viewHistory && !!eventId,
  });

  // Helper to get error-specific icon and color
  const getErrorUI = (error: Error | null) => {
    if (!error) return { icon: 'alert-circle', color: AppTheme.colors.error, label: 'Error' };
    
    const code = (error as any).code;
    const message = error.message || '';

    if (message.includes('Missing required') || code === 'VALIDATION_ERROR') {
      return { icon: 'information-circle', color: '#FF9500', label: 'Setup Required' };
    }
    if (message.includes('internet') || message.includes('network')) {
      return { icon: 'cloud-offline', color: '#FF9500', label: 'Network Error' };
    }
    if (message.includes('not found') || code === 'NOT_FOUND') {
      return { icon: 'close-circle', color: '#FF3B30', label: 'Ticket Not Found' };
    }
    if (message.includes('already') || code === 'TICKET_ALREADY_CHECKED_IN') {
      return { icon: 'checkmark-circle', color: '#FF9500', label: 'Already Checked In' };
    }
    if (message.includes('session') || message.includes('expired')) {
      return { icon: 'lock', color: '#FF3B30', label: 'Session Expired' };
    }
    if (message.includes('event') || message.includes('valid')) {
      return { icon: 'alert-circle', color: '#FF3B30', label: 'Invalid Event' };
    }
    return { icon: 'alert-circle', color: AppTheme.colors.error, label: 'Error' };
  };

  // Direct useMutation from @tanstack/react-query with @api mutator
  const {
    mutate: scanQRCode,
    isPending: isScanLoading,
    error: scanError,
    reset: resetMutation,
  } = useMutation({
    mutationFn: scanQRMutator,
    onSuccess: (result: ScanQRResponse) => {
      // Vibration feedback
      Vibration.vibrate(200);
      setScanCount((prev) => prev + 1);

      // Navigate to result screen
      router.push({
        pathname: '/(tabs)/result',
        params: {
          eventId,
          status: result.status,
          ticketName: result.attendeeName || 'Unknown',
          message: result.message,
          checkedInAt: result.timestamp,
          ticketType: result.ticketType,
        },
      });

      // Reset for next scan after delay
      setTimeout(() => {
        setScanned(false);
      }, 2500);
    },
    onError: (error: Error) => {
      // Haptic feedback for error
      Vibration.vibrate([100, 100, 100]);

      // Reset for retry after delay
      setTimeout(() => {
        setScanned(false);
        resetMutation();
      }, 1500);
    },
  });

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (scanError) {
      const timeout = setTimeout(() => resetMutation(), 5000);
      return () => clearTimeout(timeout);
    }
  }, [scanError, resetMutation]);

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    // Debounce rapid scans - ignore if scanned within last 1.5 seconds or already processing
    const now = Date.now();
    if (now - lastScanTime < 1500 || scanned || isScanLoading) {
      return;
    }

    setScanned(true);
    setLastScanTime(now);

    try {
      const deviceId = Device.modelId || 'unknown-device';
      const qrCodeValue = data.trim();

      // Validate inputs with specific messaging
      if (!eventId) {
        throw new Error('Event ID is missing. Please select an event first.');
      }
      if (!token) {
        throw new Error('Authentication token is missing. Please login again.');
      }
      if (!qrCodeValue) {
        throw new Error('Invalid QR code. Please try again.');
      }

      // Trigger mutation with inline parameters
      scanQRCode({
        qrCode: qrCodeValue,
        deviceId,
        eventId: eventId as string,
      });
    } catch (error: any) {
      const apiError = ErrorHandler.parseError(error);
      ErrorHandler.logError('QR_SCAN_VALIDATION', apiError);

      // Haptic feedback for error
      Vibration.vibrate([100, 100, 100]);

      // Reset for retry
      setTimeout(() => {
        setScanned(false);
      }, 1500);
    }
  };

  // Camera permission screen
  if (!permission) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Initializing camera...</Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <View style={styles.permissionIcon}>
            <Ionicons name="camera-outline" size={40} color={AppTheme.colors.maroonPrimary} />
          </View>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionMessage}>
            We need access to your camera to scan QR codes.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Show history view if viewHistory param is set
  if (viewHistory === 'true') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={AppTheme.colors.lightBg} />
        
        {historyLoading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={AppTheme.colors.maroonPrimary} />
            <Text style={styles.loadingText}>Loading history...</Text>
          </View>
        ) : (
          <ScrollView style={styles.historyContainer} contentContainerStyle={styles.historyContent}>
            {/* Summary Stats */}
            <View style={styles.statsSummary}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{historyData?.successfulScans || 0}</Text>
                <Text style={styles.statLabel}>Successful</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: AppTheme.colors.error }]}>
                  {historyData?.failedScans || 0}
                </Text>
                <Text style={styles.statLabel}>Failed</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: '#999' }]}>
                  {historyData?.totalScans || 0}
                </Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>

            {/* Check-ins List */}
            <Text style={styles.historyTitle}>Check-in Records</Text>
            {historyData?.checkins && historyData.checkins.length > 0 ? (
              historyData.checkins.map((checkin: any) => (
                <View key={checkin._id} style={styles.checkinCard}>
                  <View style={styles.checkinHeader}>
                    <View style={styles.checkinInfo}>
                      <Text style={styles.attendeeName} numberOfLines={1}>
                        {checkin.attendeeName}
                      </Text>
                      <Text style={styles.attendeeEmail} numberOfLines={1}>
                        {checkin.attendeeEmail}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            checkin.status === 'SUCCESS'
                              ? '#10B981'
                              : checkin.status === 'ALREADY_CHECKED_IN'
                              ? '#F59E0B'
                              : '#EF4444',
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          checkin.status === 'SUCCESS'
                            ? 'checkmark-circle'
                            : checkin.status === 'ALREADY_CHECKED_IN'
                            ? 'alert-circle'
                            : 'close-circle'
                        }
                        size={16}
                        color="#fff"
                      />
                    </View>
                  </View>
                  <View style={styles.checkinFooter}>
                    <Text style={styles.checkinTime}>
                      {new Date(checkin.checkedInAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    <Text style={styles.checkinGate}>{checkin.gate}</Text>
                  </View>
                  {checkin.note && <Text style={styles.checkinNote}>{checkin.note}</Text>}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="document-outline" size={48} color="#ccc" />
                <Text style={styles.emptyStateText}>No check-ins yet</Text>
              </View>
            )}
          </ScrollView>
        )}

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={AppTheme.colors.textWhite} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={AppTheme.colors.maroonPrimary} />

      {/* Camera */}
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        />

        {/* Focus Rectangle */}
        <View style={styles.focusRectangle} />

        {/* Scanning Indicator */}
        {isScanLoading && (
          <View style={styles.scanningOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.scanningText}>Processing...</Text>
          </View>
        )}
      </View>

      {/* Error Message */}
      {scanError && (
        <View style={styles.errorBanner}>
          <View style={styles.errorContent}>
            <View style={[styles.errorIconContainer, { backgroundColor: `${getErrorUI(scanError).color}20` }]}>
              <Ionicons 
                name={getErrorUI(scanError).icon as any} 
                size={24} 
                color={getErrorUI(scanError).color} 
              />
            </View>
            <View style={styles.errorTextContainer}>
              <Text style={styles.errorLabel}>{getErrorUI(scanError).label}</Text>
              <Text style={styles.errorText} numberOfLines={2}>
                {scanError.message}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Instructions */}
      <View style={styles.instructions}>
        <View style={styles.instructionHeader}>
          <Ionicons name="information-circle" size={20} color={AppTheme.colors.goldAccent} />
          <Text style={styles.instructionTitle}>How to Scan</Text>
        </View>
        <View style={styles.instructionSteps}>
          <View style={styles.instructionStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.instructionText}>Position the QR code in the frame</Text>
          </View>
          <View style={styles.instructionStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.instructionText}>Wait for automatic scan</Text>
          </View>
          <View style={[styles.instructionStep, { marginBottom: 0 }]}>
            <View style={[styles.stepNumber, { backgroundColor: AppTheme.colors.success }]}>
              <Ionicons name="checkmark" size={14} color={AppTheme.colors.textWhite} />
            </View>
            <Text style={styles.instructionText}>
              Scans completed: <Text style={styles.scanCountHighlight}>{scanCount}</Text>
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  } as const,
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as const,
  loadingText: {
    marginTop: AppTheme.spacing.lg,
    fontSize: AppTheme.fonts.sizes.base,
    color: AppTheme.colors.textWhite,
    fontWeight: AppTheme.fonts.weights.medium as any,
  } as const,
  permissionIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${AppTheme.colors.maroonPrimary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: AppTheme.spacing.lg,
    borderWidth: 2,
    borderColor: `${AppTheme.colors.maroonPrimary}30`,
  } as const,
  permissionTitle: {
    fontSize: AppTheme.fonts.sizes.lg,
    fontWeight: AppTheme.fonts.weights.bold as any,
    color: AppTheme.colors.textWhite,
    marginBottom: AppTheme.spacing.md,
    textAlign: 'center',
  } as const,
  permissionMessage: {
    fontSize: AppTheme.fonts.sizes.sm,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: AppTheme.spacing.lg,
    paddingHorizontal: AppTheme.spacing.lg,
    lineHeight: 20,
  } as const,
  permissionButton: {
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.maroonPrimary,
    borderRadius: AppTheme.radius.md,
  } as const,
  permissionButtonText: {
    color: AppTheme.colors.textWhite,
    fontSize: AppTheme.fonts.sizes.base,
    fontWeight: AppTheme.fonts.weights.semibold as any,
  } as const,
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
  } as const,
  camera: {
    flex: 1,
  } as const,
  focusRectangle: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderWidth: 3,
    borderColor: AppTheme.colors.success,
    borderRadius: AppTheme.radius.lg,
    left: '50%',
    top: '50%',
    marginLeft: -140,
    marginTop: -140,
    opacity: 0.7,
  } as const,
  scanningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  } as const,
  scanningText: {
    color: AppTheme.colors.textWhite,
    fontSize: AppTheme.fonts.sizes.base,
    fontWeight: AppTheme.fonts.weights.semibold as any,
    marginTop: AppTheme.spacing.md,
  } as const,
  errorBanner: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,59,48,0.3)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,59,48,0.3)',
  } as const,
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppTheme.spacing.md,
  } as const,
  errorIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  } as const,
  errorTextContainer: {
    flex: 1,
  } as const,
  errorLabel: {
    color: AppTheme.colors.textWhite,
    fontSize: AppTheme.fonts.sizes.xs,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  } as const,
  errorText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: AppTheme.fonts.sizes.sm,
    fontWeight: '500',
    lineHeight: 18,
  } as const,
  instructions: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(192, 160, 76, 0.2)',
  } as const,
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppTheme.spacing.sm,
    marginBottom: AppTheme.spacing.md,
  } as const,
  instructionTitle: {
    color: AppTheme.colors.textWhite,
    fontSize: AppTheme.fonts.sizes.sm,
    fontWeight: '700',
    letterSpacing: 0.3,
  } as const,
  instructionSteps: {
    gap: AppTheme.spacing.md,
  } as const,
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.md,
  } as const,
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${AppTheme.colors.goldAccent}30`,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${AppTheme.colors.goldAccent}50`,
    marginTop: 2,
  } as const,
  stepNumberText: {
    color: AppTheme.colors.goldAccent,
    fontSize: AppTheme.fonts.sizes.xs,
    fontWeight: '700',
  } as const,
  instructionText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: AppTheme.fonts.sizes.sm,
    lineHeight: 16,
    flex: 1,
  } as const,
  scanCountHighlight: {
    color: AppTheme.colors.success,
    fontWeight: '700',
  } as const,
  
  /* History View Styles */
  historyContainer: {
    flex: 1,
    backgroundColor: AppTheme.colors.lightBg,
  } as const,
  historyContent: {
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.lg,
  } as const,
  statsSummary: {
    flexDirection: 'row' as const,
    gap: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.lg,
  } as const,
  statCard: {
    flex: 1,
    backgroundColor: AppTheme.colors.white,
    borderRadius: AppTheme.radius.md,
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.lg,
    alignItems: 'center',
    ...AppTheme.shadows.md,
  } as const,
  statValue: {
    fontSize: 28,
    fontWeight: AppTheme.fonts.weights.bold as any,
    color: '#10B981',
    marginBottom: AppTheme.spacing.xs,
  } as const,
  statLabel: {
    fontSize: AppTheme.fonts.sizes.xs,
    color: AppTheme.colors.textSecondary,
    fontWeight: AppTheme.fonts.weights.semibold as any,
  } as const,
  historyTitle: {
    fontSize: AppTheme.fonts.sizes.base,
    fontWeight: AppTheme.fonts.weights.bold as any,
    color: AppTheme.colors.textPrimary,
    marginBottom: AppTheme.spacing.md,
  } as const,
  checkinCard: {
    backgroundColor: AppTheme.colors.white,
    borderRadius: AppTheme.radius.md,
    padding: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.md,
    ...AppTheme.shadows.sm,
  } as const,
  checkinHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: AppTheme.spacing.sm,
  } as const,
  checkinInfo: {
    flex: 1,
  } as const,
  attendeeName: {
    fontSize: AppTheme.fonts.sizes.sm,
    fontWeight: AppTheme.fonts.weights.semibold as any,
    color: AppTheme.colors.textPrimary,
    marginBottom: 2,
  } as const,
  attendeeEmail: {
    fontSize: AppTheme.fonts.sizes.xs,
    color: AppTheme.colors.textSecondary,
  } as const,
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  } as const,
  checkinFooter: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: AppTheme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  } as const,
  checkinTime: {
    fontSize: AppTheme.fonts.sizes.xs,
    color: AppTheme.colors.textMuted,
    fontWeight: AppTheme.fonts.weights.medium as any,
  } as const,
  checkinGate: {
    fontSize: AppTheme.fonts.sizes.xs,
    color: AppTheme.colors.maroonPrimary,
    fontWeight: AppTheme.fonts.weights.semibold as any,
  } as const,
  checkinNote: {
    fontSize: AppTheme.fonts.sizes.xs,
    color: '#FF9500',
    fontStyle: 'italic' as const,
    marginTop: AppTheme.spacing.sm,
  } as const,
  emptyState: {
    alignItems: 'center' as const,
    justifyContent: 'center',
    paddingVertical: 60,
  } as const,
  emptyStateText: {
    fontSize: AppTheme.fonts.sizes.sm,
    color: AppTheme.colors.textMuted,
    marginTop: AppTheme.spacing.md,
  } as const,
  backButton: {
    position: 'absolute' as const,
    bottom: 20,
    right: 20,
    backgroundColor: AppTheme.colors.maroonPrimary,
    borderRadius: 50,
    width: 56,
    height: 56,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    flexDirection: 'row' as const,
    gap: 4,
    ...AppTheme.shadows.lg,
  } as const,
  backButtonText: {
    color: AppTheme.colors.textWhite,
    fontSize: AppTheme.fonts.sizes.xs,
    fontWeight: AppTheme.fonts.weights.bold as any,
  } as const,
});

