import { format, parseISO, isValid, startOfDay, endOfDay } from 'date-fns';
import { 
  toZonedTime, 
  fromZonedTime, 
  format as formatTz 
} from 'date-fns-tz';

export const PHILIPPINES_TIMEZONE = 'Asia/Manila';

export function toPhilippinesTime(date: string | Date): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return toZonedTime(dateObj, PHILIPPINES_TIMEZONE);
}

export function fromPhilippinesTime(date: Date): Date {
  return fromZonedTime(date, PHILIPPINES_TIMEZONE);
}

export function formatInPhilippines(
  date: string | Date, 
  formatStr: string = 'MMM dd, yyyy'
): string {
  const phTime = toPhilippinesTime(date);
  return formatTz(phTime, formatStr, { timeZone: PHILIPPINES_TIMEZONE });
}

export function formatDateTimeInPhilippines(
  date: string | Date,
  formatStr: string = 'MMM dd, yyyy h:mm a'
): string {
  return formatInPhilippines(date, formatStr);
}

export function getPhilippinesToday(): Date {
  const now = new Date();
  return startOfDay(toPhilippinesTime(now));
}

export function getPhilippinesNow(): Date {
  return toPhilippinesTime(new Date());
}

export function isTodayInPhilippines(date: string | Date): boolean {
  const phDate = toPhilippinesTime(date);
  const phToday = getPhilippinesToday();
  
  return (
    phDate.getDate() === phToday.getDate() &&
    phDate.getMonth() === phToday.getMonth() &&
    phDate.getFullYear() === phToday.getFullYear()
  );
}

export function formatDateForInput(date: string | Date): string {
  const phTime = toPhilippinesTime(date);
  return format(phTime, 'yyyy-MM-dd');
}

export function parseDateFromInput(dateString: string): Date {
  const date = parseISO(dateString + 'T00:00:00');
  return toPhilippinesTime(date);
}

export function getPhilippinesDayRange(date: string | Date): {
  start: Date;
  end: Date;
} {
  const phDate = toPhilippinesTime(date);
  return {
    start: startOfDay(phDate),
    end: endOfDay(phDate)
  };
}

export function formatRelativeTimeInPhilippines(date: string | Date): string {
  const phDate = toPhilippinesTime(date);
  const now = getPhilippinesNow();
  
  const diffMs = now.getTime() - phDate.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return formatInPhilippines(phDate);
}
