
import * as SecureStore from 'expo-secure-store';

export interface ApiError {
  code: string;
  message: string;
  status: number;
  originalError?: any;
}

export interface ErrorResponse {
  success: boolean;
  error: ApiError;
}

export class ErrorHandler {
  static readonly ERRORS = {
    NETWORK: { code: 'NETWORK_ERROR', message: 'No internet connection. Please check your network.' },
    TIMEOUT: { code: 'TIMEOUT_ERROR', message: 'Request timeout. Please try again.' },
    INVALID_CREDENTIALS: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
    UNAUTHORIZED: { code: 'UNAUTHORIZED', message: 'Your session has expired. Please login again.' },
    FORBIDDEN: { code: 'FORBIDDEN', message: 'You do not have permission to access this.' },
    NOT_FOUND: { code: 'NOT_FOUND', message: 'The requested resource was not found.' },
    SERVER_ERROR: { code: 'SERVER_ERROR', message: 'Server error. Please try again later.' },
    VALIDATION_ERROR: { code: 'VALIDATION_ERROR', message: 'Invalid input. Please check your data.' },
    TOKEN_EXPIRED: { code: 'TOKEN_EXPIRED', message: 'Your session has expired. Please login again.' },
    TICKET_NOT_FOUND: { code: 'TICKET_NOT_FOUND', message: 'Ticket not found. Please verify the QR code.' },
    TICKET_ALREADY_CHECKED_IN: { code: 'TICKET_ALREADY_CHECKED_IN', message: 'Ticket already checked in.' },
    EVENT_CANCELLED: { code: 'EVENT_CANCELLED', message: 'This event has been cancelled.' },
    DEVICE_NOT_ASSIGNED: { code: 'DEVICE_NOT_ASSIGNED', message: 'You are not assigned to scan for this event.' },
    GENERIC: { code: 'ERROR', message: 'Something went wrong. Please try again.' },
  };

  /**
   * Parse error from API response or exception
   */
  static parseError(error: any): ApiError {
    // If already an ApiError, return as-is
    if (error.code && error.message && typeof error.status === 'number' && !error.response) {
      return error as ApiError;
    }

    // Timeout errors first
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return {
        ...this.ERRORS.TIMEOUT,
        status: 0,
        originalError: error,
      };
    }

    // Actual network connection errors only
    const networkCodes = ['ECONNREFUSED', 'ENOTFOUND', 'ENETUNREACH', 'EHOSTUNREACH', 'ECONNRESET'];
    if (networkCodes.includes(error.code)) {
      return {
        ...this.ERRORS.NETWORK,
        status: 0,
        originalError: error,
      };
    }

    // Check for valid response before treating as network error
    if (!error.response) {
      // Plain Error objects (likely from validation or client-side)
      // are validation errors, not network errors
      return {
        code: 'VALIDATION_ERROR',
        message: error.message || this.ERRORS.VALIDATION_ERROR.message,
        status: 400,
        originalError: error,
      };
    }

    const status = error.response?.status || error.status || 500;
    const data = error.response?.data || error.data || {};
    const message = data.message || data.error || error.message;

    // Map HTTP status codes
    switch (status) {
      case 400:
        return {
          code: 'VALIDATION_ERROR',
          message: message || this.ERRORS.VALIDATION_ERROR.message,
          status,
          originalError: error,
        };
      case 401:
        return {
          code: 'UNAUTHORIZED',
          message: message || this.ERRORS.UNAUTHORIZED.message,
          status,
          originalError: error,
        };
      case 403:
        return {
          code: 'FORBIDDEN',
          message: message || this.ERRORS.FORBIDDEN.message,
          status,
          originalError: error,
        };
      case 404:
        return {
          code: 'NOT_FOUND',
          message: message || this.ERRORS.NOT_FOUND.message,
          status,
          originalError: error,
        };
      case 409:
        return {
          code: 'TICKET_ALREADY_CHECKED_IN',
          message: message || this.ERRORS.TICKET_ALREADY_CHECKED_IN.message,
          status,
          originalError: error,
        };
      case 500:
      case 502:
      case 503:
        return {
          code: 'SERVER_ERROR',
          message: message || this.ERRORS.SERVER_ERROR.message,
          status,
          originalError: error,
        };
      default:
        return {
          code: 'ERROR',
          message: message || this.ERRORS.GENERIC.message,
          status,
          originalError: error,
        };
    }
  }

  /**
   * Handle logout and redirect
   */
  static async handleUnauthorized(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('auth_user');
    } catch (e) {
      console.warn('Failed to clear auth storage:', e);
    }
  }

  /**
   * Log error with context (minimized for production)
   */
  static logError(context: string, error: ApiError, metadata?: any): void {
    // Only log in development to avoid console clutter during scanning
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.warn(`[${context}] ${error.code}: ${error.message}`);
    }
  }

  /**
   * Get user-friendly error message
   */
  static getUserMessage(error: ApiError): string {
    return error.message || this.ERRORS.GENERIC.message;
  }

  /**
   * Check if error is retriable
   */
  static isRetriable(error: ApiError): boolean {
    // Only retry on transient server errors and network issues
    const retriableCodes = ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'SERVER_ERROR'];
    // Ensure we never retry on client errors (4xx)
    if (error.status >= 400 && error.status < 500) {
      return false;
    }
    return retriableCodes.includes(error.code);
  }

  /**
   * Retry with exponential backoff
   */
  static async retry<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    initialDelay: number = 1000,
    onAttempt?: (attempt: number) => void
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        onAttempt?.(attempt);
        return await fn();
      } catch (error: any) {
        lastError = error;
        const apiError = ErrorHandler.parseError(error);

        if (!this.isRetriable(apiError) || attempt === maxAttempts) {
          throw apiError;
        }

        const delay = initialDelay * Math.pow(2, attempt - 1);
        console.log(`Retrying in ${delay}ms (attempt ${attempt}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }
}

export default ErrorHandler;
