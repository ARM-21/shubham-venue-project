import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Vibration,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Device from 'expo-device';
import { useAuth } from '@/contexts/AuthContext';
import { scannerApi } from '@/lib/api';

export default function ScannerScreen() {
  const { eventId, eventName, gate } = useLocalSearchParams();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(0);
  const cameraRef = useRef<CameraView>(null);
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    requestPermission();
  }, []);

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    // Debounce rapid scans
    const now = Date.now();
    if (now - lastScanTime < 1000 || scanned) return;
    
    setScanned(true);
    setLastScanTime(now);
    setLoading(true);

    try {
      const deviceId = Device.modelId || 'unknown';
      
      console.log('🔍 SCANNING QR CODE');
      console.log('Event ID:', eventId);
      console.log('QR Value:', data);
      console.log('Device ID:', deviceId);
      console.log('Gate:', gate);
      
      const result = await scannerApi.scanQR(
        token!,
        eventId as string,
        data,
        deviceId
      );

      console.log('✅ SCAN RESULT:', JSON.stringify(result, null, 2));

      Vibration.vibrate(100);

      // Show result and navigate to results screen
      router.push({
        pathname: '/(tabs)/result',
        params: {
          eventId,
          status: result.status,
          ticketName: result.ticket?.ownerName || 'Unknown',
          message: result.message,
        },
      });

      // Auto-close result screen after 3 seconds and return to scanner
      setTimeout(() => {
        setScanned(false);
      }, 3000);
    } catch (error: any) {
      console.error('❌ SCAN ERROR:', error);
      console.error('Error message:', error.message);
      console.error('Error full:', JSON.stringify(error, null, 2));
      
      Vibration.vibrate([100, 100, 100]);
      Alert.alert('Scan Failed', error.message || 'Failed to check in ticket');
      setScanned(false);
    } finally {
      setLoading(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Camera permission is required</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backButton}>← Back</Text>
            </TouchableOpacity>
            <View>
              <Text style={styles.eventNameText}>{eventName}</Text>
              <Text style={styles.gateText}>Gate: {gate}</Text>
            </View>
          </View>

          <View style={styles.scannerGuide}>
            {/* Corner markers */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            
            <Text style={styles.instructionText}>
              {loading ? 'Processing...' : 'Point camera at QR code'}
            </Text>
          </View>

          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(10px)',
  },
  backButton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 8,
  },
  eventNameText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  gateText: {
    color: '#B0B0B0',
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
  },
  scannerGuide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderColor: '#007AFF',
    borderWidth: 3,
  },
  topLeft: {
    top: '20%',
    left: '15%',
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: '20%',
    right: '15%',
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: '20%',
    left: '15%',
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: '20%',
    right: '15%',
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 24,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
