import { useState, useEffect } from 'react';
import { 
  getPhilippinesNow, 
  getPhilippinesToday,
  formatInPhilippines,
  formatDateTimeInPhilippines,
  formatDateForInput,
  isTodayInPhilippines
} from '@/lib/timezone';

/**
 * Hook for Philippines timezone operations
 * Provides reactive updates for current time and date formatting
 */
export function usePhilippinesTime() {
  const [currentTime, setCurrentTime] = useState(getPhilippinesNow());
  const [today, setToday] = useState(getPhilippinesToday());

  useEffect(() => {
    // Update time every minute
    const interval = setInterval(() => {
      setCurrentTime(getPhilippinesNow());
      setToday(getPhilippinesToday());
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, []);

  return {
    currentTime,
    today,
    formatDate: (date: string | Date, format?: string) => 
      formatInPhilippines(date, format),
    formatDateTime: (date: string | Date, format?: string) => 
      formatDateTimeInPhilippines(date, format),
    formatDateForInput: (date: string | Date) => 
      formatDateForInput(date),
    isToday: (date: string | Date) => 
      isTodayInPhilippines(date),
    getNow: () => getPhilippinesNow(),
    getToday: () => getPhilippinesToday(),
  };
}
