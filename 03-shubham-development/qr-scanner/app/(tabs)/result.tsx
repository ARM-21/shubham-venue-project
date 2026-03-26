import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ResultScreen() {
  const { status, ticketName, message, eventId } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.back();
    }, 3000);

    return () => clearTimeout(timer);
  }, [status, eventId]);

  const isSuccess = status === 'SUCCESS';
  const backgroundColor = isSuccess ? '#e8f5e9' : '#ffebee';
  const iconColor = isSuccess ? '#4CAF50' : '#F44336';
  const icon = isSuccess ? 'checkmark-circle' : 'close-circle';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <Ionicons name={icon} size={80} color={iconColor} style={styles.icon} />
        
        <Text style={styles.statusText}>
          {isSuccess ? '✓ Check-in Successful' : '✗ Check-in Failed'}
        </Text>
        
        <Text style={styles.ticketName}>{ticketName}</Text>
        
        <Text style={styles.message}>{message}</Text>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Back to Scanner</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  icon: {
    marginBottom: 24,
  },
  statusText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#222',
    marginBottom: 14,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  ticketName: {
    fontSize: 18,
    color: '#007AFF',
    marginBottom: 12,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginBottom: 28,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 200,
    shadowColor: '#007AFF',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});

