/**
 * Helper types and utilities for working with schedule data from the database.
 */
import type { Tables } from '@/integrations/supabase/types';

export type DbSchedule = Tables<'schedules'>;
export type DbBus = Tables<'buses'>;
export type DbRoute = Tables<'routes'>;
export type DbBooking = Tables<'bookings'>;

/** A schedule row joined with its bus and route */
export interface ScheduleWithDetails extends DbSchedule {
  buses: DbBus;
  routes: DbRoute;
}

/** A booking row joined with its schedule (and nested bus + route) */
export interface BookingWithDetails extends DbBooking {
  schedules: ScheduleWithDetails;
}

/** Format a timestamp string to time (HH:MM) */
export function formatTime(timestamp: string): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

/** Format a timestamp string to date (YYYY-MM-DD) */
export function formatDate(timestamp: string): string {
  return new Date(timestamp).toISOString().split('T')[0];
}

/** Calculate duration string between two timestamps */
export function calcDuration(departure: string, arrival: string): string {
  const diff = new Date(arrival).getTime() - new Date(departure).getTime();
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${mins.toString().padStart(2, '0')}m`;
}

/** Seat layout types */
export interface Seat {
  id: string;
  number: number;
  row: number;
  col: number;
  type: 'window' | 'aisle';
  status: 'available' | 'booked' | 'locked';
  price: number;
}

/**
 * Generate a seat layout for a bus given total seats, fare, booked seat numbers, and locked seat numbers.
 */
export function generateSeatLayout(
  totalSeats: number,
  fare: number,
  bookedSeats: number[],
  lockedSeats: number[]
): Seat[] {
  const seats: Seat[] = [];
  const cols = 4; // 2 + aisle + 2
  const rows = Math.ceil(totalSeats / cols);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const seatNum = row * cols + col + 1;
      if (seatNum > totalSeats) break;

      const type: Seat['type'] = col === 0 || col === 3 ? 'window' : 'aisle';
      let status: Seat['status'] = 'available';
      if (bookedSeats.includes(seatNum)) status = 'booked';
      else if (lockedSeats.includes(seatNum)) status = 'locked';

      seats.push({
        id: `seat-${seatNum}`,
        number: seatNum,
        row,
        col,
        type,
        status,
        price: type === 'window' ? fare + 5 : fare,
      });
    }
  }
  return seats;
}
