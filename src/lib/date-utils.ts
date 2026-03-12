
export * from './timezone';

import { formatInPhilippines, getPhilippinesNow, getPhilippinesToday } from './timezone';

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `₱${num.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

export function formatTransactionDate(date: string | Date): string {
  return formatInPhilippines(date, 'MMM dd, yyyy');
}

export function formatActivityDateTime(date: string | Date): string {
  return formatInPhilippines(date, 'MMM dd, yyyy h:mm a');
}

export function formatForInput(date: string | Date): string {
  return formatInPhilippines(date, 'yyyy-MM-dd');
}

export function getCurrentDate(): string {
  return formatForInput(getPhilippinesNow());
}

export function getToday(): string {
  return formatForInput(getPhilippinesToday());
}

export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy h:mm a',
  INPUT: 'yyyy-MM-dd',
  MONTH_YEAR: 'MMM yyyy',
  SHORT_DATE: 'MM/dd/yyyy',
  LONG_DATE: 'MMMM dd, yyyy',
} as const;
