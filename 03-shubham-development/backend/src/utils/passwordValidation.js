/**
 * Backend Password Validation Utility
 * Provides password validation for registration and password changes
 */

const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  UPPERCASE: /[A-Z]/,
  LOWERCASE: /[a-z]/,
  NUMBER: /[0-9]/,
  SPECIAL_CHAR: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
};

const COMMON_WEAK_PASSWORDS = [
  'password',
  'password123',
  '123456',
  '12345678',
  'qwerty',
  'abc123',
  'letmein',
  'welcome',
  'monkey',
  'dragon',
  'master',
  'shadow',
  'sunshine',
  '111111',
  '1234567',
  '123123',
  'admin',
  'root',
];

/**
 * Validate password according to requirements
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with valid flag and message
 */
export const validatePassword = (password) => {
  if (!password) {
    return {
      valid: false,
      message: 'Password is required',
    };
  }

  if (password.length < PASSWORD_REQUIREMENTS.MIN_LENGTH) {
    return {
      valid: false,
      message: `Password must be at least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters`,
    };
  }

  if (!PASSWORD_REQUIREMENTS.UPPERCASE.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one uppercase letter',
    };
  }

  if (!PASSWORD_REQUIREMENTS.LOWERCASE.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one lowercase letter',
    };
  }

  if (!PASSWORD_REQUIREMENTS.NUMBER.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one number',
    };
  }

  if (!PASSWORD_REQUIREMENTS.SPECIAL_CHAR.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one special character (!@#$%^&*)',
    };
  }

  if (COMMON_WEAK_PASSWORDS.includes(password.toLowerCase())) {
    return {
      valid: false,
      message: 'This password is too common. Please choose a stronger one',
    };
  }

  return {
    valid: true,
    message: 'Password is valid and secure',
  };
};

/**
 * Batch validate password and other required fields for registration
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} Validation result
 */
export const validateRegistrationInput = (email, password) => {
  if (!email || !password) {
    return {
      valid: false,
      message: 'Email and password are required',
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      valid: false,
      message: 'Invalid email format',
    };
  }

  return validatePassword(password);
};

export default {
  validatePassword,
  validateRegistrationInput,
  PASSWORD_REQUIREMENTS,
  COMMON_WEAK_PASSWORDS,
};
