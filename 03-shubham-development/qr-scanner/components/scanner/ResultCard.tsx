import React from 'react';
import { Text, View } from 'react-native';

import { scannerStyles as styles } from './styles';

export type ScanResult = { status: string; message: string; checkedInAt?: string; ticketId?: string };
export type ResultCardProps = { result: ScanResult | null };

export function ResultCard({ result }: ResultCardProps) {
  return (
    <View style={styles.resultCard}>
      <Text style={styles.resultTitle}>Last scan</Text>
      <Text style={styles.resultText}>{result?.status ?? 'Awaiting a QR code...'}</Text>
      {result?.message && <Text style={styles.resultText}>{result.message}</Text>}
      {result?.checkedInAt && (
        <Text style={styles.resultText}>At: {new Date(result.checkedInAt).toLocaleString()}</Text>
      )}
      {result?.ticketId && <Text style={styles.resultText}>Ticket: {result.ticketId}</Text>}
    </View>
  );
}
