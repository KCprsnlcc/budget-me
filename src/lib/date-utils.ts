// Re-export timezone utilities for backward compatibility
export * from './timezone';

// Additional date utilities for the app
import { formatInPhilippines, getPhilippinesNow, getPhilippinesToday } from './timezone';

/**
 * Format currency amount with Philippines Peso symbol
 */
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `₱${num.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

/**
 * Format date for display in transactions list
 */
export function formatTransactionDate(date: string | Date): string {
  return formatInPhilippines(date, 'MMM dd, yyyy');
}

/**
 * Format date with time for activity feed
 */
export function formatActivityDateTime(date: string | Date): string {
  return formatInPhilippines(date, 'MMM dd, yyyy h:mm a');
}

/**
 * Format date for form inputs (YYYY-MM-DD)
 */
export function formatForInput(date: string | Date): string {
  return formatInPhilippines(date, 'yyyy-MM-dd');
}

/**
 * Get current date in Philippines timezone for default form values
 */
export function getCurrentDate(): string {
  return formatForInput(getPhilippinesNow());
}

/**
 * Get today's date in Philippines timezone (start of day)
 */
export function getToday(): string {
  return formatForInput(getPhilippinesToday());
}

/**
 * Common date format patterns
 */
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy h:mm a',
  INPUT: 'yyyy-MM-dd',
  MONTH_YEAR: 'MMM yyyy',
  SHORT_DATE: 'MM/dd/yyyy',
  LONG_DATE: 'MMMM dd, yyyy',
} as const;
