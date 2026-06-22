import { describe, it, expect } from 'vitest';
import { formatTime, formatDate, calcDuration, generateSeatLayout } from './scheduleHelpers';

describe('scheduleHelpers', () => {
  describe('formatDate', () => {
    it('returns YYYY-MM-DD', () => {
      expect(formatDate('2026-06-20T08:30:00.000Z')).toBe('2026-06-20');
    });
  });

  describe('formatTime', () => {
    it('returns 24h HH:MM', () => {
      const result = formatTime('2026-06-20T08:30:00.000Z');
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });
  });

  describe('calcDuration', () => {
    it('computes hours and padded minutes', () => {
      const dep = '2026-06-20T08:00:00.000Z';
      const arr = '2026-06-20T12:05:00.000Z';
      expect(calcDuration(dep, arr)).toBe('4h 05m');
    });

    it('handles whole hours', () => {
      const dep = '2026-06-20T08:00:00.000Z';
      const arr = '2026-06-20T11:00:00.000Z';
      expect(calcDuration(dep, arr)).toBe('3h 00m');
    });
  });

  describe('generateSeatLayout', () => {
    it('generates the requested number of seats', () => {
      const seats = generateSeatLayout(20, 5000, [], []);
      expect(seats).toHaveLength(20);
    });

    it('marks booked and locked seats', () => {
      const seats = generateSeatLayout(20, 5000, [3], [5]);
      expect(seats.find((s) => s.number === 3)?.status).toBe('booked');
      expect(seats.find((s) => s.number === 5)?.status).toBe('locked');
      expect(seats.find((s) => s.number === 1)?.status).toBe('available');
    });

    it('prices window seats higher than aisle seats', () => {
      const seats = generateSeatLayout(20, 5000, [], []);
      const window = seats.find((s) => s.type === 'window');
      const aisle = seats.find((s) => s.type === 'aisle');
      expect(window!.price).toBeGreaterThan(aisle!.price);
    });
  });
});
