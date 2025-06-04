import { YogaClass } from '../types';

// Helper to get the start of the current week (Monday)
export const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
};

// Helper to get YYYY-MM-DD string from Date
export const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get all dates for a class in the current week and next week
export const getUpcomingClassDates = (yogaClass: YogaClass, weeksAhead: number = 2): { date: string, classDateTime: Date }[] => {
  const upcomingDates: { date: string, classDateTime: Date }[] = [];
  const now = new Date();
  const dayMapping: { [key: string]: number } = {
    'Dimanche': 0, 'Lundi': 1, 'Mardi': 2, 'Mercredi': 3, 'Jeudi': 4, 'Vendredi': 5, 'Samedi': 6
  };
  const classDayIndex = dayMapping[yogaClass.dayOfWeek];
  const [hours, minutes] = yogaClass.startTime.split(':').map(Number);

  for (let i = 0; i < 7 * weeksAhead; i++) {
    const currentDate = new Date(now);
    currentDate.setDate(now.getDate() + i);
    currentDate.setHours(0, 0, 0, 0); // Start of day

    if (currentDate.getDay() === classDayIndex) {
      const classDateTime = new Date(currentDate);
      classDateTime.setHours(hours, minutes, 0, 0);
      
      // Only add if class time is in the future or today but time hasn't passed
      if (classDateTime >= now) {
         upcomingDates.push({ date: formatDateToYYYYMMDD(classDateTime), classDateTime });
      } else if (formatDateToYYYYMMDD(classDateTime) === formatDateToYYYYMMDD(now) && classDateTime.getTime() > now.getTime()) {
        // For today's classes, ensure the time hasn't passed
        upcomingDates.push({ date: formatDateToYYYYMMDD(classDateTime), classDateTime });
      }
    }
  }
  // Sort by date and time
  return upcomingDates.sort((a,b) => a.classDateTime.getTime() - b.classDateTime.getTime()).slice(0, 5); // Show up to 5 upcoming instances
};


export const isCancellationAllowed = (classDateTime: Date, cancellationWindowHours: number): boolean => {
  if (!classDateTime) return false;
  const cancellationDeadline = new Date(classDateTime.getTime() - cancellationWindowHours * 60 * 60 * 1000);
  return new Date() < cancellationDeadline;
};

export const getWeekNumber = (d: Date): number => {
  // Copy date so don't modify original
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
  // Get first day of year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil(( ( (d.valueOf() - yearStart.valueOf()) / 86400000) + 1)/7);
  return weekNo;
};

export const combineDateAndTime = (dateStr: string, timeStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  // Month is 0-indexed in JavaScript Date
  return new Date(year, month - 1, day, hours, minutes);
};
