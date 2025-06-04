import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getUpcomingClassDates, isCancellationAllowed, getWeekNumber } from '../utils/dateUtils';
import { YogaClass } from '../types';

describe('dateUtils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('getUpcomingClassDates retourne les dates tri\u00e9es et limit\u00e9es', () => {
    const baseDate = new Date('2023-09-04T10:00:00Z'); // Monday
    vi.setSystemTime(baseDate);
    const yogaClass: YogaClass = {
      id: '1',
      name: 'Test',
      teacherId: 't1',
      teacherName: 'Teacher',
      dayOfWeek: 'Mercredi',
      startTime: '10:00',
      endTime: '11:00',
      location: 'Studio',
      totalSlots: 10,
      cancellationWindowHours: 2,
    };
    const results = getUpcomingClassDates(yogaClass, 10);
    const expectedDates = [
      '2023-09-06',
      '2023-09-13',
      '2023-09-20',
      '2023-09-27',
      '2023-10-04',
    ];
    expect(results.length).toBe(5);
    expect(results.map(r => r.date)).toEqual(expectedDates);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].classDateTime.getTime()).toBeGreaterThan(results[i-1].classDateTime.getTime());
    }
  });

  it('isCancellationAllowed retourne true ou false selon la fen\u00eatre d\u2019annulation', () => {
    const classDate = new Date('2023-09-06T10:00:00Z');
    vi.setSystemTime(new Date('2023-09-06T07:00:00Z'));
    expect(isCancellationAllowed(classDate, 2)).toBe(true);
    vi.setSystemTime(new Date('2023-09-06T09:00:00Z'));
    expect(isCancellationAllowed(classDate, 2)).toBe(false);
  });

  it('getWeekNumber produit la bonne semaine', () => {
    expect(getWeekNumber(new Date('2023-06-15'))).toBe(24);
    expect(getWeekNumber(new Date('2023-12-31'))).toBe(52);
  });
});
