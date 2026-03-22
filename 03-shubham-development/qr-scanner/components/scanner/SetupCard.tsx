import React from 'react';
import { Text, TextInput, View } from 'react-native';

import { scannerStyles as styles } from './styles';

export type SetupCardProps = {
  token: string;
  setToken: (v: string) => void;
  eventId: string;
  setEventId: (v: string) => void;
  deviceId: string;
};

export function SetupCard({ token, setToken, eventId, setEventId, deviceId }: SetupCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Scanner setup</Text>
      <TextInput
        placeholder="Bearer token"
        placeholderTextColor="#7b8ba1"
        style={styles.input}
        autoCapitalize="none"
        secureTextEntry
        value={token}
        onChangeText={setToken}
      />
      <TextInput
        placeholder="Event ID"
        placeholderTextColor="#7b8ba1"
        style={styles.input}
        autoCapitalize="none"
        value={eventId}
        onChangeText={setEventId}
      />
      <Text style={styles.muted}>Device ID: {deviceId}</Text>
    </View>
  );
}
