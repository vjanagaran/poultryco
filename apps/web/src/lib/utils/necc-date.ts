/**
 * NECC Date Utilities
 * Helper functions for date parsing, formatting, and validation
 */

/**
 * Parse date string (YYYY-MM-DD) to Date object
 */
export function parseNECCDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00');
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatNECCDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get today's date as YYYY-MM-DD
 */
export function getTodayDate(): string {
  return formatNECCDate(new Date());
}

/**
 * Get yesterday's date as YYYY-MM-DD
 */
export function getYesterdayDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatNECCDate(yesterday);
}

/**
 * Validate date string format (YYYY-MM-DD)
 */
export function isValidDateString(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  
  const date = parseNECCDate(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validate year (2010-2030)
 */
export function isValidYear(year: number): boolean {
  return year >= 2010 && year <= 2030;
}

/**
 * Validate month (1-12)
 */
export function isValidMonth(month: number): boolean {
  return month >= 1 && month <= 12;
}

/**
 * Validate day (1-31)
 */
export function isValidDay(day: number): boolean {
  return day >= 1 && day <= 31;
}

/**
 * Get month name from number (1-12)
 */
export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1] || '';
}

/**
 * Get days in month
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Format date for display (e.g., "January 17, 2025")
 */
export function formatDateDisplay(date: Date | string): string {
  const d = typeof date === 'string' ? parseNECCDate(date) : date;
  return d.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format date for short display (e.g., "17 Jan 2025")
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? parseNECCDate(date) : date;
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Get date range for a month
 */
export function getMonthDateRange(year: number, month: number): { start: string; end: string } {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const daysInMonth = getDaysInMonth(year, month);
  const end = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
  return { start, end };
}

/**
 * Get date range for a year
 */
export function getYearDateRange(year: number): { start: string; end: string } {
  return {
    start: `${year}-01-01`,
    end: `${year}-12-31`
  };
}

/**
 * Calculate date difference in days
 */
export function getDateDifference(date1: string, date2: string): number {
  const d1 = parseNECCDate(date1);
  const d2 = parseNECCDate(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if date is today
 */
export function isToday(date: string): boolean {
  return date === getTodayDate();
}

/**
 * Check if date is yesterday
 */
export function isYesterday(date: string): boolean {
  return date === getYesterdayDate();
}

/**
 * Get previous date
 */
export function getPreviousDate(date: string): string {
  const d = parseNECCDate(date);
  d.setDate(d.getDate() - 1);
  return formatNECCDate(d);
}

/**
 * Get next date
 */
export function getNextDate(date: string): string {
  const d = parseNECCDate(date);
  d.setDate(d.getDate() + 1);
  return formatNECCDate(d);
}

