import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import ErrorHandler from 'utils/errorHandler';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Interceptor to add token to all requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Failed to retrieve token from secure store:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response error handler
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Log error details
    const apiError = ErrorHandler.parseError(error);
    ErrorHandler.logError('API_RESPONSE', apiError, {
      url: error.config?.url,
      method: error.config?.method,
    });

    // Handle 401 - unauthorized
    if (error.response?.status === 401) {
      try {
        await ErrorHandler.handleUnauthorized();
      } catch (e) {
        console.error('Failed to handle unauthorized:', e);
      }
    }

    return Promise.reject(apiError);
  }
);

export const authApi = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw ErrorHandler.parseError(error);
    }
  },
};

export const scannerApi = {
  getMyEvents: async (token?: string) => {
    try {
      console.debug('API CALL: GET /scanner/my-events');
      console.debug('API Base URL:', API_BASE_URL);

      return await ErrorHandler.retry(
        async () => {
          const response = await api.get('/scanner/my-events', {
            ...(token && { headers: { Authorization: `Bearer ${token}` } }),
          });

          console.debug('API Response status:', response.status);
          console.debug('Events loaded:', response.data?.events?.length || 0);

          return response.data;
        },
        3, // max attempts
        1500, // initial delay
        (attempt) => console.log(`Loading events (attempt ${attempt}/3)...`)
      );
    } catch (error: any) {
      const apiError = ErrorHandler.parseError(error);
      ErrorHandler.logError('GET_MY_EVENTS', apiError);
      throw apiError;
    }
  },

  scanQR: async (token: string, eventId: string, qrCode: string, deviceId: string) => {
    try {
      console.debug('API CALL: POST /scanner/events/:eventId/checkins/scan');
      console.debug('Event ID:', eventId);
      console.debug('QR Code length:', qrCode.length);
      console.debug('Device ID:', deviceId);

      return await ErrorHandler.retry(
        async () => {
          const response = await api.post(
            `/scanner/events/${eventId}/checkins/scan`,
            {
              qrCode: qrCode.trim(),
              deviceId,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          console.debug('QR Scan successful:', response.data?.status);
          return response.data;
        },
        2, // max attempts (fewer for scanning - user will retry manually if needed)
        800, // initial delay
        (attempt) => console.log(`Scanning QR code (attempt ${attempt}/2)...`)
      );
    } catch (error: any) {
      const apiError = ErrorHandler.parseError(error);
      ErrorHandler.logError('SCAN_QR', apiError);
      throw apiError;
    }
  },
};

export default api;

