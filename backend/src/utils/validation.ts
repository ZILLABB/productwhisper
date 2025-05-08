/**
 * Validation Utility
 * 
 * This file contains utility functions for data validation.
 */

import { PASSWORD_SETTINGS } from '../constants/auth';

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Validation result
 */
export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  // Check if password is defined
  if (!password) {
    return {
      isValid: false,
      message: 'Password is required',
    };
  }

  // Check password length
  if (password.length < PASSWORD_SETTINGS.MIN_LENGTH) {
    return {
      isValid: false,
      message: `Password must be at least ${PASSWORD_SETTINGS.MIN_LENGTH} characters`,
    };
  }

  // Check for uppercase letters
  if (PASSWORD_SETTINGS.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter',
    };
  }

  // Check for lowercase letters
  if (PASSWORD_SETTINGS.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter',
    };
  }

  // Check for numbers
  if (PASSWORD_SETTINGS.REQUIRE_NUMBER && !/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number',
    };
  }

  // Check for special characters
  if (PASSWORD_SETTINGS.REQUIRE_SPECIAL_CHAR && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one special character',
    };
  }

  // Password is valid
  return {
    isValid: true,
    message: 'Password is valid',
  };
};

/**
 * Check if passwords match
 * @param password - Password
 * @param confirmPassword - Confirm password
 * @returns Whether passwords match
 */
export const passwordsMatch = (password: string, confirmPassword: string): boolean => {
  return !!password && !!confirmPassword && password === confirmPassword;
};

/**
 * Validate email format
 * @param email - Email to validate
 * @returns Whether email is valid
 */
export const isValidEmail = (email: string): boolean => {
  if (!email) {
    return false;
  }

  // Regular expression for email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Validate URL format
 * @param url - URL to validate
 * @returns Whether URL is valid
 */
export const isValidUrl = (url: string): boolean => {
  if (!url) {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Validate date format (YYYY-MM-DD)
 * @param date - Date to validate
 * @returns Whether date is valid
 */
export const isValidDate = (date: string): boolean => {
  if (!date) {
    return false;
  }

  // Regular expression for date validation (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return false;
  }

  // Check if date is valid
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
};

/**
 * Validate phone number format
 * @param phone - Phone number to validate
 * @returns Whether phone number is valid
 */
export const isValidPhone = (phone: string): boolean => {
  if (!phone) {
    return false;
  }

  // Regular expression for phone validation (international format)
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate username format
 * @param username - Username to validate
 * @returns Whether username is valid
 */
export const isValidUsername = (username: string): boolean => {
  if (!username) {
    return false;
  }

  // Regular expression for username validation (alphanumeric, underscore, hyphen, 3-20 characters)
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
};

/**
 * Validate name format
 * @param name - Name to validate
 * @returns Whether name is valid
 */
export const isValidName = (name: string): boolean => {
  if (!name) {
    return false;
  }

  // Regular expression for name validation (letters, spaces, hyphens, apostrophes, 2-50 characters)
  const nameRegex = /^[a-zA-Z\s'-]{2,50}$/;
  return nameRegex.test(name);
};

/**
 * Validate postal code format
 * @param postalCode - Postal code to validate
 * @param countryCode - Country code (ISO 3166-1 alpha-2)
 * @returns Whether postal code is valid
 */
export const isValidPostalCode = (postalCode: string, countryCode: string = 'US'): boolean => {
  if (!postalCode) {
    return false;
  }

  // Regular expressions for postal code validation by country
  const postalCodeRegexes: Record<string, RegExp> = {
    US: /^\d{5}(-\d{4})?$/, // United States
    CA: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, // Canada
    UK: /^[A-Za-z]{1,2}\d[A-Za-z\d]? \d[A-Za-z]{2}$/, // United Kingdom
    // Add more countries as needed
  };

  // Get regex for country or use US as default
  const regex = postalCodeRegexes[countryCode] || postalCodeRegexes.US;
  return regex.test(postalCode);
};

export default {
  validatePassword,
  passwordsMatch,
  isValidEmail,
  isValidUrl,
  isValidDate,
  isValidPhone,
  isValidUsername,
  isValidName,
  isValidPostalCode,
};
