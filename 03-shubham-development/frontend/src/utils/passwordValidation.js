/**
 * Password Validation Utility
 * Provides comprehensive password validation, strength checking, and requirements
 */

// Common weak passwords to avoid
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

// Password strength requirements
const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  MIN_LENGTH_STRONG: 12,
  UPPERCASE: /[A-Z]/,
  LOWERCASE: /[a-z]/,
  NUMBER: /[0-9]/,
  SPECIAL_CHAR: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
};

/**
 * Check individual password requirements
 * @param {string} password - The password to check
 * @returns {Object} Object with individual requirement checks
 */
export const checkPasswordRequirements = (password) => {
  if (!password) {
    return {
      minLength: false,
      uppercase: false,
      lowercase: false,
      number: false,
      specialChar: false,
      notCommon: true,
    };
  }

  return {
    minLength: password.length >= PASSWORD_REQUIREMENTS.MIN_LENGTH,
    uppercase: PASSWORD_REQUIREMENTS.UPPERCASE.test(password),
    lowercase: PASSWORD_REQUIREMENTS.LOWERCASE.test(password),
    number: PASSWORD_REQUIREMENTS.NUMBER.test(password),
    specialChar: PASSWORD_REQUIREMENTS.SPECIAL_CHAR.test(password),
    notCommon: !COMMON_WEAK_PASSWORDS.includes(password.toLowerCase()),
  };
};

/**
 * Calculate password strength score (0-100)
 * @param {string} password - The password to evaluate
 * @returns {number} Strength score from 0-100
 */
export const calculatePasswordStrength = (password) => {
  if (!password) return 0;

  let score = 0;

  // Length score
  if (password.length >= PASSWORD_REQUIREMENTS.MIN_LENGTH) score += 20;
  if (password.length >= PASSWORD_REQUIREMENTS.MIN_LENGTH_STRONG) score += 10;

  // Character variety
  if (PASSWORD_REQUIREMENTS.LOWERCASE.test(password)) score += 20;
  if (PASSWORD_REQUIREMENTS.UPPERCASE.test(password)) score += 20;
  if (PASSWORD_REQUIREMENTS.NUMBER.test(password)) score += 15;
  if (PASSWORD_REQUIREMENTS.SPECIAL_CHAR.test(password)) score += 15;

  // Penalize common passwords
  if (COMMON_WEAK_PASSWORDS.includes(password.toLowerCase())) {
    score = Math.max(0, score - 50);
  }

  return Math.min(100, score);
};

/**
 * Get password strength label and color
 * @param {string} password - The password to evaluate
 * @returns {Object} Object with strength level, label, and color
 */
export const getPasswordStrengthLevel = (password) => {
  const score = calculatePasswordStrength(password);

  if (!password) {
    return {
      level: 'none',
      label: 'No Password',
      color: 'bg-gray-300',
      textColor: 'text-gray-600',
    };
  }

  if (score < 20) {
    return {
      level: 'weak',
      label: 'Weak',
      color: 'bg-red-500',
      textColor: 'text-red-600',
    };
  }

  if (score < 40) {
    return {
      level: 'fair',
      label: 'Fair',
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
    };
  }

  if (score < 60) {
    return {
      level: 'good',
      label: 'Good',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
    };
  }

  if (score < 85) {
    return {
      level: 'strong',
      label: 'Strong',
      color: 'bg-lime-500',
      textColor: 'text-lime-600',
    };
  }

  return {
    level: 'very-strong',
    label: 'Very Strong',
    color: 'bg-green-500',
    textColor: 'text-green-600',
  };
};

/**
 * Validate password according to backend requirements + extra security
 * @param {string} password - The password to validate
 * @returns {Object} Validation result with success flag and message
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

  if (!checkPasswordRequirements(password).notCommon) {
    return {
      valid: false,
      message: 'This password is too common. Please choose a stronger one',
    };
  }

  return {
    valid: true,
    message: 'Password is strong and secure',
  };
};

/**
 * Validate password for registration (react-hook-form compatible)
 * @param {string} password - The password to validate
 * @returns {boolean|string} True if valid, error message if invalid
 */
export const validatePasswordForForm = (password) => {
  if (!password) return 'Password is required';

  const requirements = checkPasswordRequirements(password);
  const errors = [];

  if (!requirements.minLength) {
    errors.push(`At least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters`);
  }
  if (!requirements.uppercase) {
    errors.push('One uppercase letter');
  }
  if (!requirements.lowercase) {
    errors.push('One lowercase letter');
  }
  if (!requirements.number) {
    errors.push('One number');
  }
  if (!requirements.specialChar) {
    errors.push('One special character (!@#$%^&*)');
  }
  if (!requirements.notCommon) {
    return 'This password is too common';
  }

  if (errors.length > 0) {
    return `Missing: ${errors.join(', ')}`;
  }

  return true;
};

export default {
  checkPasswordRequirements,
  calculatePasswordStrength,
  getPasswordStrengthLevel,
  validatePassword,
  validatePasswordForForm,
  PASSWORD_REQUIREMENTS,
  COMMON_WEAK_PASSWORDS,
};
