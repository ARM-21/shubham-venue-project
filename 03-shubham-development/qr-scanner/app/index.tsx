import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Root index page - Entry point of the app
 * Handles auth state checking and redirects to appropriate screen
 * Shows loading state while auth is being verified
 */
export default function Index() {
  const router = useRouter();
  const { isLoading, isAuthenticated, token } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    // Delay navigation slightly to ensure routes are ready
    const timer = setTimeout(() => {
      if (isAuthenticated && token) {
        console.debug('Auth confirmed - navigating to events');
        router.replace('/(tabs)/events');
      } else {
        console.debug('Not authenticated - navigating to login');
        router.replace('/login');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, token, isLoading, router]);

  // Show loading state while auth is being verified
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={{ marginTop: 16, fontSize: 14, color: '#666', fontWeight: '500' }}>
        Initializing...
      </Text>
    </View>
  );
}
