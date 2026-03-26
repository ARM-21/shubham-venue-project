import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { scannerApi } from '@/lib/api';

interface Event {
  _id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  hall: {
    hallName: string;
  };
  gate: string;
  status: string;
}

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    if (!token) {
      console.log('❌ NO TOKEN AVAILABLE');
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 FETCHING EVENTS - Token:', token.substring(0, 20) + '...');
      
      const response = await scannerApi.getMyEvents(token);
      
      console.log('✅ BACKEND RESPONSE:', JSON.stringify(response, null, 2));
      console.log('📊 Events count:', response?.events?.length || 0);
      console.log('📋 Full events array:', JSON.stringify(response?.events, null, 2));
      
      setEvents(response.events || []);
      
      if (!response?.events || response.events.length === 0) {
        console.warn('⚠️  NO EVENTS FOUND - showing empty state');
      }
    } catch (error: any) {
      console.error('❌ FETCH ERROR:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      Alert.alert('Error', error.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };

  const handleEventPress = (event: Event) => {
    console.log('📱 EVENT PRESSED - Navigating to scanner');
    console.log('Assignment ID (_id):', event._id);
    console.log('Event ID (eventId):', event.eventId);
    
    router.push({
      pathname: '/(tabs)/scanner',
      params: {
        eventId: event.eventId,  // ✅ USE event.eventId NOT event._id
        eventName: event.eventName,
        gate: event.gate,
      },
    });
  };

  const renderEventItem = ({ item }: { item: Event }) => {
    const eventDate = new Date(item.eventDate);
    const dateString = eventDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() => handleEventPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.eventHeader}>
          <Text style={styles.eventName}>{item.eventName}</Text>
          <Text style={styles.gateBadge}>{item.gate}</Text>
        </View>
        <Text style={styles.hallName}>
          {item.hall?.hallName || "Hall TBD"}
        </Text>
        <Text style={styles.eventDate}>{dateString}</Text>
      </TouchableOpacity>
    );
  };

  if (loading && events.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Assigned Events</Text>
      
      {events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No events assigned yet</Text>
          <Text style={styles.emptySubtext}>Contact admin to assign you to an event</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEventItem}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    letterSpacing: 0.3,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#007AFF',
    letterSpacing: 0.3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 12,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderLeftWidth: 5,
    borderLeftColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    paddingVertical: 18,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    flex: 1,
    letterSpacing: 0.2,
  },
  gateBadge: {
    backgroundColor: '#007AFF',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  hallName: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  eventDate: {
    fontSize: 13,
    color: '#999',
    fontWeight: '400',
    letterSpacing: 0.1,
  },
});
