import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Vibration,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Device from 'expo-device';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { scanQRMutator, type ScanQRResponse } from '@/@api/scanner/scan-fetcher';
import ErrorHandler from '@/utils/errorHandler';
import { AppTheme } from '@/constants/appTheme';
import { Ionicons } from '@expo/vector-icons';

export default function ScannerScreen() {
  const { eventId } = useLocalSearchParams();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(0);
  const [scanCount, setScanCount] = useState(0);
  const cameraRef = useRef<CameraView>(null);
  const { token } = useAuth();
  const router = useRouter();

  // Direct useMutation from @tanstack/react-query with @api mutator
  const {
    mutate: scanQRCode,
    isPending: isScanLoading,
    error: scanError,
    reset: resetMutation,
  } = useMutation({
    mutationFn: scanQRMutator,
    onSuccess: (result: ScanQRResponse) => {
      console.debug('SCAN SUCCESSFUL:', result.status);

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
      console.error('SCAN ERROR:', error.message);

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

      // Validate inputs
      if (!eventId || !token || !qrCodeValue) {
        throw new Error('Missing required information. Please go back and try again.');
      }

      // Trigger mutation with inline parameters
      scanQRCode({
        qrCode: qrCodeValue,
        deviceId,
        eventId: eventId as string,
      });
    } catch (error: any) {
      console.error('Input validation error:', error.message);
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
          <Ionicons name="alert-circle" size={20} color={AppTheme.colors.error} />
          <Text style={styles.errorText} numberOfLines={2}>
            {scanError instanceof Error
              ? scanError.message
              : 'An error occurred while scanning'}
          </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${AppTheme.colors.error}15`,
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: `${AppTheme.colors.error}30`,
    gap: AppTheme.spacing.md,
  } as const,
  errorText: {
    flex: 1,
    color: AppTheme.colors.error,
    fontSize: AppTheme.fonts.sizes.sm,
    fontWeight: '600',
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
});

