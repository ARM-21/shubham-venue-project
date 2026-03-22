import { type BarcodeScanningResult, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { CameraContainer } from '@/components/scanner/CameraContainer';
import { ResultCard, type ScanResult } from '@/components/scanner/ResultCard';
import { scannerStyles as styles } from '@/components/scanner/styles';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:5000/api/v1';
const DEFAULT_TOKEN = process.env.EXPO_PUBLIC_SCANNER_TOKEN || '';
const DEFAULT_EVENT_ID = process.env.EXPO_PUBLIC_EVENT_ID || '';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [token] = useState(DEFAULT_TOKEN);
  const [eventId] = useState(DEFAULT_EVENT_ID);
  const [deviceId, setDeviceId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);

  useEffect(() => {
    const newId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setDeviceId(newId);
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission?.granted, requestPermission]);

  async function submitScan(eventIdParam: string, qrToken: string) {
    if (!token) throw new Error('Add the bearer token first');
    const res = await fetch(`${API_BASE}/scanner/events/${eventIdParam}/checkins/scan`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ qrToken, deviceId }),
    });

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(payload?.message || 'Scan failed');
    }
    return payload;
  }

  async function handleBarCodeScanned(result: BarcodeScanningResult) {
    if (!eventId) {
      setLastResult({ status: 'ERROR', message: 'Add event ID first' });
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await submitScan(eventId, result.data);
      setLastResult({
        status: response.status || 'SUCCESS',
        message: response.message || 'Check-in recorded',
        checkedInAt: response.checkedInAt,
        ticketId: response.ticket?.id,
      });
    } catch (err: any) {
      setLastResult({ status: 'ERROR', message: err?.message || 'Scan failed' });
    } finally {
      setIsSubmitting(false);
    }
  }

  const missingInputs = !token || !eventId;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <CameraContainer
        granted={!!permission?.granted}
        onRequestPermission={requestPermission}
        onScan={handleBarCodeScanned}
      />

      <ResultCard result={lastResult} />
    </View>
  );
}
