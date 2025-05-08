/**
 * Formatting Utility Tests
 * 
 * This file contains tests for the formatting utility functions.
 */

import { 
  formatPagination, 
  formatSort, 
  formatDateRange,
  formatPrice,
  formatPercentage,
  formatDate,
  formatDateTime,
  formatPhoneNumber,
  truncateText
} from '../../utils/formatting';

describe('Formatting Utility', () => {
  describe('formatPagination', () => {
    it('should return default pagination values when no parameters are provided', () => {
      const result = formatPagination();
      expect(result).toEqual({
        page: 1,
        limit: 10,
        offset: 0,
      });
    });

    it('should return correct pagination values when parameters are provided', () => {
      const result = formatPagination(2, 20);
      expect(result).toEqual({
        page: 2,
        limit: 20,
        offset: 20,
      });
    });

    it('should handle string parameters', () => {
      const result = formatPagination('3', '15');
      expect(result).toEqual({
        page: 3,
        limit: 15,
        offset: 30,
      });
    });

    it('should handle invalid parameters', () => {
      const result = formatPagination(-1, 0);
      expect(result).toEqual({
        page: 1,
        limit: 10,
        offset: 0,
      });
    });

    it('should handle maximum limit', () => {
      const result = formatPagination(1, 1000);
      expect(result).toEqual({
        page: 1,
        limit: 100, // Maximum limit
        offset: 0,
      });
    });
  });

  describe('formatSort', () => {
    it('should return default sort values when no parameters are provided', () => {
      const result = formatSort();
      expect(result).toEqual({
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      });
    });

    it('should return correct sort values when parameters are provided', () => {
      const result = formatSort('name', 'ASC');
      expect(result).toEqual({
        sortBy: 'name',
        sortOrder: 'ASC',
      });
    });

    it('should handle invalid sort order', () => {
      const result = formatSort('price', 'INVALID' as any);
      expect(result).toEqual({
        sortBy: 'price',
        sortOrder: 'DESC', // Default sort order
      });
    });

    it('should handle custom default sort field', () => {
      const result = formatSort(undefined, undefined, 'rating');
      expect(result).toEqual({
        sortBy: 'rating',
        sortOrder: 'DESC',
      });
    });
  });

  describe('formatDateRange', () => {
    it('should return null values when no parameters are provided', () => {
      const result = formatDateRange();
      expect(result).toEqual({
        dateFrom: null,
        dateTo: null,
      });
    });

    it('should return correct date values when valid parameters are provided', () => {
      const result = formatDateRange('2023-01-01', '2023-12-31');
      expect(result.dateFrom).toBeInstanceOf(Date);
      expect(result.dateTo).toBeInstanceOf(Date);
      expect(result.dateFrom?.toISOString().split('T')[0]).toBe('2023-01-01');
      expect(result.dateTo?.toISOString().split('T')[0]).toBe('2023-12-31');
    });

    it('should handle invalid date formats', () => {
      const result = formatDateRange('invalid-date', '2023-12-31');
      expect(result).toEqual({
        dateFrom: null,
        dateTo: expect.any(Date),
      });
    });

    it('should set time to start of day for dateFrom', () => {
      const result = formatDateRange('2023-01-01');
      const dateFrom = result.dateFrom as Date;
      expect(dateFrom.getHours()).toBe(0);
      expect(dateFrom.getMinutes()).toBe(0);
      expect(dateFrom.getSeconds()).toBe(0);
      expect(dateFrom.getMilliseconds()).toBe(0);
    });

    it('should set time to end of day for dateTo', () => {
      const result = formatDateRange(undefined, '2023-12-31');
      const dateTo = result.dateTo as Date;
      expect(dateTo.getHours()).toBe(23);
      expect(dateTo.getMinutes()).toBe(59);
      expect(dateTo.getSeconds()).toBe(59);
      expect(dateTo.getMilliseconds()).toBe(999);
    });
  });

  describe('formatPrice', () => {
    it('should format price with default currency and decimals', () => {
      const result = formatPrice(1234.56);
      expect(result).toBe('$1,234.56');
    });

    it('should format price with custom currency', () => {
      const result = formatPrice(1234.56, 'EUR');
      expect(result).toBe('€1,234.56');
    });

    it('should format price with custom decimals', () => {
      const result = formatPrice(1234.56789, 'USD', 3);
      expect(result).toBe('$1,234.568');
    });

    it('should handle zero price', () => {
      const result = formatPrice(0);
      expect(result).toBe('$0.00');
    });

    it('should handle negative price', () => {
      const result = formatPrice(-1234.56);
      expect(result).toBe('-$1,234.56');
    });
  });

  describe('formatPercentage', () => {
    it('should format decimal as percentage with default decimals', () => {
      const result = formatPercentage(0.1234);
      expect(result).toBe('12.34%');
    });

    it('should format decimal as percentage with custom decimals', () => {
      const result = formatPercentage(0.1234, 1);
      expect(result).toBe('12.3%');
    });

    it('should handle zero', () => {
      const result = formatPercentage(0);
      expect(result).toBe('0.00%');
    });

    it('should handle negative values', () => {
      const result = formatPercentage(-0.1234);
      expect(result).toBe('-12.34%');
    });

    it('should handle values greater than 1', () => {
      const result = formatPercentage(1.5);
      expect(result).toBe('150.00%');
    });
  });

  describe('formatDate', () => {
    it('should format date with default format', () => {
      const date = new Date('2023-01-15');
      const result = formatDate(date);
      expect(result).toBe('Jan 15, 2023');
    });

    it('should format date with custom format', () => {
      const date = new Date('2023-01-15');
      const result = formatDate(date, 'YYYY/MM/DD');
      expect(result).toBe('2023/01/15');
    });

    it('should handle string date', () => {
      const result = formatDate('2023-01-15');
      expect(result).toBe('Jan 15, 2023');
    });

    it('should handle invalid date', () => {
      const result = formatDate('invalid-date');
      expect(result).toBe('Invalid date');
    });
  });

  describe('formatDateTime', () => {
    it('should format date and time with default format', () => {
      const date = new Date('2023-01-15T14:30:00');
      const result = formatDateTime(date);
      expect(result).toBe('Jan 15, 2023 2:30 PM');
    });

    it('should format date and time with custom format', () => {
      const date = new Date('2023-01-15T14:30:00');
      const result = formatDateTime(date, 'YYYY/MM/DD HH:mm');
      expect(result).toBe('2023/01/15 14:30');
    });

    it('should handle string date', () => {
      const result = formatDateTime('2023-01-15T14:30:00');
      expect(result).toBe('Jan 15, 2023 2:30 PM');
    });

    it('should handle invalid date', () => {
      const result = formatDateTime('invalid-date');
      expect(result).toBe('Invalid date');
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format US phone number', () => {
      const result = formatPhoneNumber('1234567890');
      expect(result).toBe('(123) 456-7890');
    });

    it('should handle phone number with country code', () => {
      const result = formatPhoneNumber('11234567890');
      expect(result).toBe('+1 (123) 456-7890');
    });

    it('should handle phone number with formatting characters', () => {
      const result = formatPhoneNumber('(123) 456-7890');
      expect(result).toBe('(123) 456-7890');
    });

    it('should handle invalid phone number', () => {
      const result = formatPhoneNumber('123');
      expect(result).toBe('123');
    });
  });

  describe('truncateText', () => {
    it('should truncate text to specified length', () => {
      const result = truncateText('This is a long text that needs to be truncated', 20);
      expect(result).toBe('This is a long text...');
    });

    it('should not truncate text shorter than specified length', () => {
      const result = truncateText('Short text', 20);
      expect(result).toBe('Short text');
    });

    it('should handle custom suffix', () => {
      const result = truncateText('This is a long text that needs to be truncated', 20, ' [more]');
      expect(result).toBe('This is a long text [more]');
    });

    it('should handle empty text', () => {
      const result = truncateText('', 20);
      expect(result).toBe('');
    });
  });
});
