/**
 * Email validation
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Password validation
 */
export const isValidPassword = (password: string): {
  valid: boolean;
  message?: string;
} => {
  if (password.length < 6) {
    return {
      valid: false,
      message: 'Password must be at least 6 characters',
    };
  }
  return { valid: true };
};

/**
 * Validate login form
 */
export const validateLoginForm = (
  email: string,
  password: string
): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!email.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Please enter a valid email';
  }

  if (!password.trim()) {
    errors.password = 'Password is required';
  } else if (password.length < 1) {
    errors.password = 'Password is too short';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * QR Code validation
 */
export const isValidQRCode = (qrCode: string): boolean => {
  return !!(qrCode && qrCode.trim().length > 0);
};

export default {
  isValidEmail,
  isValidPassword,
  validateLoginForm,
  isValidQRCode,
};
