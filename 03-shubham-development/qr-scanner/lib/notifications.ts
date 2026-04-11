import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import api from '@/lib/api';

// Lazy-load expo-notifications to avoid import errors in Expo Go on Android
let Notifications: any = null;

try {
  // eslint-disable-next-line global-require
  Notifications = require('expo-notifications');
} catch (error) {
  console.warn('expo-notifications not available (expected in Expo Go on Android):', 
    error instanceof Error ? error.message : error);
}

// Notification handler callback
let onNotificationTap: ((data: any) => void) | null = null;

// Set notification handler behavior if available
if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/**
 * Register a callback to handle notification data (for routing)
 */
export const registerNotificationHandler = (callback: (data: any) => void) => {
  onNotificationTap = callback;
  console.log('Notification tap handler registered');
};

/**
 * Initialize notifications and get device push token
 */
export const initializeNotifications = async () => {
  if (!Notifications) {
    console.warn('Notifications not available: Android Expo Go limitation (SDK 53+)');
    return null;
  }

  try {
    console.log('Initializing notifications...');
    
    const token = await Notifications.getDevicePushTokenAsync();
    
    if (!token.data) {
      console.warn('Failed to get push token from Expo');
      return null;
    }

    console.log('Push token obtained:', token.data);

    // Store token in secure storage
    try {
      await SecureStore.setItemAsync('pushToken', token.data);
      console.log('Token stored in SecureStore');
    } catch (storageError) {
      console.error('Failed to store token in SecureStore:', storageError);
    }

    // Send token to backend to store in database
    try {
      const response = await api.post('/notifications/register-push-token', {
        pushToken: token.data,
        platform: Platform.OS,
      });
      console.log('Token registered with backend:', response.data);
    } catch (err: any) {
      console.error('Failed to register push token with backend:', {
        url: err.config?.url,
        status: err.response?.status,
        message: err.message,
      });
    }

    return token.data;
  } catch (error) {
    console.error('Error initializing notifications:', error);
    return null;
  }
};

/**
 * Get the last notification (if app was closed when it arrived)
 */
export const getLastNotification = async () => {
  if (!Notifications) {
    return null;
  }

  try {
    const notification = await Notifications.getLastNotificationResponseAsync();
    console.log('Last notification:', notification);
    return notification;
  } catch (error) {
    console.error('Error getting last notification:', error);
    return null;
  }
};

/**
 * Setup notification listeners
 */
export const setupNotificationListeners = () => {
  if (!Notifications) {
    console.warn('Notifications not available: cannot setup listeners');
    return () => {};
  }

  // Listen for incoming notifications (app in foreground)
  const notificationListener = Notifications.addNotificationReceivedListener(
    (notification: any) => {
      console.log('Notification received (foreground):', {
        title: notification.request.content.title,
        body: notification.request.content.body,
        data: notification.request.content.data,
      });
    }
  );

  // Listen for notification interactions (user taps notification)
  const responseListener = Notifications.addNotificationResponseReceivedListener(
    (response: any) => {
      const notification = response.notification;
      const data = notification.request.content.data;

      console.log('Notification tapped:', {
        title: notification.request.content.title,
        data,
      });

      if (data?.type === 'staff_assignment') {
        console.log('Staff assignment - routing to event:', data.eventId);
        if (onNotificationTap) {
          onNotificationTap({
            type: 'staff_assignment',
            eventId: data.eventId,
            eventName: data.eventName,
            gate: data.gate,
          });
        }
      } else if (data?.type === 'staff_assignment_cancelled') {
        console.log('Assignment cancelled:', data.eventName);
        if (onNotificationTap) {
          onNotificationTap({
            type: 'staff_assignment_cancelled',
            eventId: data.eventId,
            eventName: data.eventName,
          });
        }
      } else {
        console.log('Unknown notification type:', data?.type);
      }
    }
  );

  // Return cleanup function
  return () => {
    console.log('Removing notification listeners');
    try {
      notificationListener.remove();
      responseListener.remove();
    } catch (error) {
      console.warn('Error removing notification listeners:', error);
    }
  };
};

/**
 * Check current notification permission status
 */
export const checkNotificationPermissions = async () => {
  if (!Notifications) {
    console.warn('Notifications not available: cannot check permissions');
    return {
      status: 'not_available',
      granted: false,
    };
  }

  try {
    console.log('Checking current notification permissions...');
    const result = await Notifications.getPermissionsAsync();
    
    console.log('Current notification permission status:', {
      platform: Platform.OS,
      status: result.status,
      granted: result.status === 'granted',
      canAskAgain: result.canAskAgain,
      result: JSON.stringify(result),
    });

    return {
      status: result.status,
      granted: result.status === 'granted',
      canAskAgain: result.canAskAgain,
    };
  } catch (error) {
    console.error('Error checking notification permissions:', error instanceof Error ? error.message : error);
    return {
      status: 'error',
      granted: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async () => {
  if (!Notifications) {
    console.warn('Notifications not available: skipping permission request');
    return false;
  }

  try {
    console.log(`Requesting notification permissions on ${Platform.OS}...`);
    
    let result;

    if (Platform.OS === 'ios') {
      // iOS: Request specific permissions - will show native dialog
      console.log('iOS: Requesting alert, badge, and sound permissions');
      result = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
    } else {
      // Android: Runtime permissions
      console.log('Android: Requesting notification permissions');
      result = await Notifications.requestPermissionsAsync({
        android: {
          channelId: 'default',
        },
      });
    }

    const granted = result.status === 'granted';
    const canAskAgain = result.canAskAgain ?? true;
    
    console.log('Notification permission result:', {
      platform: Platform.OS,
      status: result.status,
      granted,
      canAskAgain,
      response: JSON.stringify(result),
    });

    if (!granted) {
      console.warn('User denied notification permissions');
      if (!canAskAgain) {
        console.warn('Cannot ask for permissions again - user must enable in Settings');
      }
    } else {
      console.log('Notification permissions granted successfully');
    }

    return granted;
  } catch (error) {
    console.error('Error requesting notification permissions:', error instanceof Error ? error.message : error);
    return false;
  }
};
