/**
 * Formatting Utility
 * 
 * This file contains utility functions for data formatting.
 */

/**
 * Format pagination parameters
 * @param page - Page number
 * @param limit - Items per page
 * @param maxLimit - Maximum items per page
 * @returns Formatted pagination parameters
 */
export const formatPagination = (
  page?: number | string,
  limit?: number | string,
  maxLimit: number = 100
) => {
  // Parse page and limit
  const parsedPage = page ? parseInt(page.toString(), 10) : 1;
  const parsedLimit = limit ? parseInt(limit.toString(), 10) : 10;
  
  // Validate page and limit
  const validPage = parsedPage > 0 ? parsedPage : 1;
  const validLimit = parsedLimit > 0 ? Math.min(parsedLimit, maxLimit) : 10;
  
  // Calculate offset
  const offset = (validPage - 1) * validLimit;
  
  return {
    page: validPage,
    limit: validLimit,
    offset,
  };
};

/**
 * Format sort parameters
 * @param sortBy - Field to sort by
 * @param sortOrder - Sort order (ASC or DESC)
 * @param defaultSortBy - Default field to sort by
 * @returns Formatted sort parameters
 */
export const formatSort = (
  sortBy?: string,
  sortOrder?: 'ASC' | 'DESC',
  defaultSortBy: string = 'createdAt'
) => {
  // Validate sort order
  const validSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';
  
  return {
    sortBy: sortBy || defaultSortBy,
    sortOrder: validSortOrder,
  };
};

/**
 * Format date range parameters
 * @param dateFrom - Start date (YYYY-MM-DD)
 * @param dateTo - End date (YYYY-MM-DD)
 * @returns Formatted date range
 */
export const formatDateRange = (
  dateFrom?: string,
  dateTo?: string
) => {
  let parsedDateFrom: Date | null = null;
  let parsedDateTo: Date | null = null;
  
  // Parse start date
  if (dateFrom) {
    const date = new Date(dateFrom);
    if (!isNaN(date.getTime())) {
      parsedDateFrom = new Date(date);
      parsedDateFrom.setHours(0, 0, 0, 0); // Start of day
    }
  }
  
  // Parse end date
  if (dateTo) {
    const date = new Date(dateTo);
    if (!isNaN(date.getTime())) {
      parsedDateTo = new Date(date);
      parsedDateTo.setHours(23, 59, 59, 999); // End of day
    }
  }
  
  return {
    dateFrom: parsedDateFrom,
    dateTo: parsedDateTo,
  };
};

/**
 * Format price
 * @param price - Price to format
 * @param currency - Currency code (USD, EUR, etc.)
 * @param decimals - Number of decimal places
 * @returns Formatted price
 */
export const formatPrice = (
  price: number,
  currency: string = 'USD',
  decimals: number = 2
) => {
  // Get currency symbol
  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    // Add more currencies as needed
  };
  
  const symbol = currencySymbols[currency] || '$';
  
  // Format price
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  
  // Handle negative prices
  if (price < 0) {
    return `-${symbol}${formatter.format(Math.abs(price))}`;
  }
  
  return `${symbol}${formatter.format(price)}`;
};

/**
 * Format percentage
 * @param value - Value to format (0.1 = 10%)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage
 */
export const formatPercentage = (
  value: number,
  decimals: number = 2
) => {
  // Format percentage
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    style: 'percent',
    multiplier: 100,
  });
  
  return formatter.format(value);
};

/**
 * Format date
 * @param date - Date to format
 * @param format - Date format
 * @returns Formatted date
 */
export const formatDate = (
  date: Date | string,
  format: string = 'MMM D, YYYY'
) => {
  // Parse date
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (isNaN(parsedDate.getTime())) {
    return 'Invalid date';
  }
  
  // Format date
  const year = parsedDate.getFullYear();
  const month = parsedDate.getMonth();
  const day = parsedDate.getDate();
  
  // Month names
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  
  // Replace format tokens
  return format
    .replace('YYYY', year.toString())
    .replace('YY', year.toString().slice(-2))
    .replace('MM', (month + 1).toString().padStart(2, '0'))
    .replace('M', (month + 1).toString())
    .replace('MMM', monthNames[month])
    .replace('DD', day.toString().padStart(2, '0'))
    .replace('D', day.toString());
};

/**
 * Format date and time
 * @param date - Date to format
 * @param format - Date and time format
 * @returns Formatted date and time
 */
export const formatDateTime = (
  date: Date | string,
  format: string = 'MMM D, YYYY h:mm A'
) => {
  // Parse date
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (isNaN(parsedDate.getTime())) {
    return 'Invalid date';
  }
  
  // Format date
  const year = parsedDate.getFullYear();
  const month = parsedDate.getMonth();
  const day = parsedDate.getDate();
  const hours = parsedDate.getHours();
  const minutes = parsedDate.getMinutes();
  const seconds = parsedDate.getSeconds();
  
  // Month names
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  
  // AM/PM
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  
  // Replace format tokens
  return format
    .replace('YYYY', year.toString())
    .replace('YY', year.toString().slice(-2))
    .replace('MM', (month + 1).toString().padStart(2, '0'))
    .replace('M', (month + 1).toString())
    .replace('MMM', monthNames[month])
    .replace('DD', day.toString().padStart(2, '0'))
    .replace('D', day.toString())
    .replace('HH', hours.toString().padStart(2, '0'))
    .replace('H', hours.toString())
    .replace('hh', hours12.toString().padStart(2, '0'))
    .replace('h', hours12.toString())
    .replace('mm', minutes.toString().padStart(2, '0'))
    .replace('m', minutes.toString())
    .replace('ss', seconds.toString().padStart(2, '0'))
    .replace('s', seconds.toString())
    .replace('A', ampm);
};

/**
 * Format phone number
 * @param phone - Phone number to format
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phone: string) => {
  // Remove non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if phone number is valid
  if (cleaned.length < 10) {
    return phone;
  }
  
  // Format US phone number
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // Format international phone number
  if (cleaned.length > 10) {
    const countryCode = cleaned.slice(0, cleaned.length - 10);
    const areaCode = cleaned.slice(cleaned.length - 10, cleaned.length - 7);
    const prefix = cleaned.slice(cleaned.length - 7, cleaned.length - 4);
    const lineNumber = cleaned.slice(cleaned.length - 4);
    
    return `+${countryCode} (${areaCode}) ${prefix}-${lineNumber}`;
  }
  
  return phone;
};

/**
 * Truncate text
 * @param text - Text to truncate
 * @param length - Maximum length
 * @param suffix - Suffix to add when truncated
 * @returns Truncated text
 */
export const truncateText = (
  text: string,
  length: number,
  suffix: string = '...'
) => {
  if (text.length <= length) {
    return text;
  }
  
  return text.slice(0, length - suffix.length) + suffix;
};

export default {
  formatPagination,
  formatSort,
  formatDateRange,
  formatPrice,
  formatPercentage,
  formatDate,
  formatDateTime,
  formatPhoneNumber,
  truncateText,
};
