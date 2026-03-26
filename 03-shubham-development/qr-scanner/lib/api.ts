import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Interceptor to add token to all requests
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - logout
      SecureStore.deleteItemAsync('auth_token');
      SecureStore.deleteItemAsync('auth_user');
    }
    return Promise.reject(error.response?.data || error);
  }
);

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
};

export const scannerApi = {
  getMyEvents: async (token: string) => {
    try {
      console.log('🌐 API CALL: GET /scanner/my-events');
      console.log('📍 API Base URL:', API_BASE_URL);
      console.log('Headers:', { Authorization: `Bearer ${token.substring(0, 20)}...` });
      
      const response = await api.get('/scanner/my-events', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('✅ API Response status:', response.status);
      console.log('✅ API Response data:', JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error: any) {
      console.error('❌ API ERROR - Status:', error?.response?.status);
      console.error('❌ API ERROR - Data:', error?.response?.data);
      console.error('❌ API ERROR - Message:', error.message);
      console.error('❌ API ERROR - URL attempted:', API_BASE_URL + '/scanner/my-events');
      throw new Error(error.message || 'Failed to load events');
    }
  },

  scanQR: async (token: string, eventId: string, qrCode: string, deviceId: string) => {
    try {
      console.log('🌐 API CALL: POST /scanner/events/:eventId/checkins/scan');
      console.log('📍 Event ID:', eventId);
      console.log('📍 QR Code:', qrCode);
      console.log('📍 Device ID:', deviceId);
      
      const response = await api.post(
        `/scanner/events/${eventId}/checkins/scan`,
        {
          qrCode: qrCode,  // ✅ CHANGED: was qrCodeValue, now qrCode
          deviceId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log('✅ QR Scan Response status:', response.status);
      console.log('✅ QR Scan Response:', JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error: any) {
      console.error('❌ QR SCAN ERROR - Status:', error?.response?.status);
      console.error('❌ QR SCAN ERROR - Message:', error?.response?.data?.message);
      console.error('❌ QR SCAN ERROR - Full Data:', JSON.stringify(error?.response?.data, null, 2));
      console.error('❌ QR SCAN ERROR - Error Message:', error.message);
      throw new Error(error.message || 'Scan failed');
    }
  },
};

export default api;

