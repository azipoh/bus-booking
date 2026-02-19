/**
 * Mock data for the bus booking system.
 * In production, this would come from the database via API calls.
 */

// Bus operator and route data
export interface Bus {
  id: string;
  name: string;
  operator: string;
  type: 'AC Sleeper' | 'AC Seater' | 'Non-AC Seater' | 'Volvo AC';
  totalSeats: number;
  amenities: string[];
  rating: number;
  reviews: number;
}

export interface Route {
  id: string;
  source: string;
  destination: string;
  distance: number; // km
  duration: string; // e.g. "6h 30m"
}

export interface Schedule {
  id: string;
  busId: string;
  routeId: string;
  departureTime: string;
  arrivalTime: string;
  date: string;
  fare: number;
  availableSeats: number;
}

export interface Seat {
  id: string;
  number: string;
  row: number;
  col: number;
  deck: 'lower' | 'upper';
  type: 'window' | 'aisle' | 'middle';
  status: 'available' | 'booked' | 'locked' | 'selected';
  price: number;
}

export interface Booking {
  id: string;
  passengerName: string;
  passengerEmail: string;
  passengerPhone: string;
  scheduleId: string;
  busName: string;
  operator: string;
  source: string;
  destination: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  seatNumbers: string[];
  totalFare: number;
  status: 'confirmed' | 'cancelled' | 'completed' | 'pending';
  bookingDate: string;
  pnr: string;
}

// Popular cities for search
export const cities = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
  'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
  'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte',
  'Indianapolis', 'San Francisco', 'Seattle', 'Denver', 'Washington DC',
  'Nashville', 'Oklahoma City', 'El Paso', 'Boston', 'Portland',
  'Las Vegas', 'Memphis', 'Louisville', 'Baltimore', 'Milwaukee',
];

export const buses: Bus[] = [
  { id: 'b1', name: 'BlueLine Express', operator: 'BlueLine Travels', type: 'Volvo AC', totalSeats: 36, amenities: ['WiFi', 'Charging Port', 'Blanket', 'Water Bottle'], rating: 4.5, reviews: 342 },
  { id: 'b2', name: 'Metro Cruiser', operator: 'Metro Transport Co.', type: 'AC Sleeper', totalSeats: 30, amenities: ['WiFi', 'Charging Port', 'Snacks'], rating: 4.2, reviews: 218 },
  { id: 'b3', name: 'Greenway Rider', operator: 'Greenway Lines', type: 'AC Seater', totalSeats: 40, amenities: ['Charging Port', 'Water Bottle'], rating: 3.9, reviews: 156 },
  { id: 'b4', name: 'StarCoach Premium', operator: 'Star Coaches', type: 'Volvo AC', totalSeats: 36, amenities: ['WiFi', 'Charging Port', 'Blanket', 'Snacks', 'Entertainment'], rating: 4.7, reviews: 520 },
  { id: 'b5', name: 'Budget Mover', operator: 'EconoTravel', type: 'Non-AC Seater', totalSeats: 48, amenities: ['Water Bottle'], rating: 3.5, reviews: 89 },
];

export const routes: Route[] = [
  { id: 'r1', source: 'New York', destination: 'Boston', distance: 346, duration: '4h 15m' },
  { id: 'r2', source: 'New York', destination: 'Philadelphia', distance: 151, duration: '2h 00m' },
  { id: 'r3', source: 'Los Angeles', destination: 'San Francisco', distance: 615, duration: '6h 30m' },
  { id: 'r4', source: 'Chicago', destination: 'Indianapolis', distance: 290, duration: '3h 30m' },
  { id: 'r5', source: 'Dallas', destination: 'Houston', distance: 385, duration: '4h 00m' },
  { id: 'r6', source: 'Seattle', destination: 'Portland', distance: 280, duration: '3h 15m' },
  { id: 'r7', source: 'Boston', destination: 'New York', distance: 346, duration: '4h 15m' },
  { id: 'r8', source: 'San Francisco', destination: 'Los Angeles', distance: 615, duration: '6h 30m' },
];

// Generate schedules based on routes and buses
export const schedules: (Schedule & { bus: Bus; route: Route })[] = [
  { id: 's1', busId: 'b1', routeId: 'r1', departureTime: '06:00', arrivalTime: '10:15', date: '2026-02-20', fare: 45, availableSeats: 22, bus: buses[0], route: routes[0] },
  { id: 's2', busId: 'b4', routeId: 'r1', departureTime: '08:30', arrivalTime: '12:45', date: '2026-02-20', fare: 65, availableSeats: 14, bus: buses[3], route: routes[0] },
  { id: 's3', busId: 'b2', routeId: 'r1', departureTime: '14:00', arrivalTime: '18:15', date: '2026-02-20', fare: 55, availableSeats: 8, bus: buses[1], route: routes[0] },
  { id: 's4', busId: 'b3', routeId: 'r3', departureTime: '07:00', arrivalTime: '13:30', date: '2026-02-20', fare: 50, availableSeats: 30, bus: buses[2], route: routes[2] },
  { id: 's5', busId: 'b5', routeId: 'r5', departureTime: '09:00', arrivalTime: '13:00', date: '2026-02-20', fare: 25, availableSeats: 40, bus: buses[4], route: routes[4] },
  { id: 's6', busId: 'b1', routeId: 'r6', departureTime: '10:00', arrivalTime: '13:15', date: '2026-02-20', fare: 40, availableSeats: 18, bus: buses[0], route: routes[5] },
  { id: 's7', busId: 'b4', routeId: 'r2', departureTime: '11:00', arrivalTime: '13:00', date: '2026-02-20', fare: 35, availableSeats: 25, bus: buses[3], route: routes[1] },
  { id: 's8', busId: 'b2', routeId: 'r4', departureTime: '15:00', arrivalTime: '18:30', date: '2026-02-20', fare: 42, availableSeats: 12, bus: buses[1], route: routes[3] },
];

/**
 * Generate a seat layout for a bus.
 * Standard layout: 2+2 configuration with aisle in middle.
 */
export function generateSeatLayout(totalSeats: number, fare: number): Seat[] {
  const seats: Seat[] = [];
  const cols = 4; // 2 + aisle + 2
  const rows = Math.ceil(totalSeats / cols);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const seatIndex = row * cols + col;
      if (seatIndex >= totalSeats) break;

      const seatNumber = `${String.fromCharCode(65 + row)}${col + 1}`;
      const type: Seat['type'] = col === 0 || col === 3 ? 'window' : 'aisle';

      // Randomly mark ~30% as booked for demo
      const isBooked = Math.random() < 0.3;

      seats.push({
        id: `seat-${seatNumber}`,
        number: seatNumber,
        row,
        col,
        deck: 'lower',
        type,
        status: isBooked ? 'booked' : 'available',
        price: type === 'window' ? fare + 5 : fare,
      });
    }
  }

  return seats;
}

// Sample bookings for "My Bookings"
export const sampleBookings: Booking[] = [
  {
    id: 'bk1', passengerName: 'John Doe', passengerEmail: 'john@example.com', passengerPhone: '+1234567890',
    scheduleId: 's1', busName: 'BlueLine Express', operator: 'BlueLine Travels',
    source: 'New York', destination: 'Boston', date: '2026-02-20',
    departureTime: '06:00', arrivalTime: '10:15', seatNumbers: ['A1', 'A2'],
    totalFare: 100, status: 'confirmed', bookingDate: '2026-02-18', pnr: 'PNR7839201',
  },
  {
    id: 'bk2', passengerName: 'John Doe', passengerEmail: 'john@example.com', passengerPhone: '+1234567890',
    scheduleId: 's4', busName: 'Greenway Rider', operator: 'Greenway Lines',
    source: 'Los Angeles', destination: 'San Francisco', date: '2026-02-15',
    departureTime: '07:00', arrivalTime: '13:30', seatNumbers: ['C3'],
    totalFare: 50, status: 'completed', bookingDate: '2026-02-12', pnr: 'PNR4521087',
  },
  {
    id: 'bk3', passengerName: 'John Doe', passengerEmail: 'john@example.com', passengerPhone: '+1234567890',
    scheduleId: 's5', busName: 'Budget Mover', operator: 'EconoTravel',
    source: 'Dallas', destination: 'Houston', date: '2026-02-10',
    departureTime: '09:00', arrivalTime: '13:00', seatNumbers: ['B2'],
    totalFare: 25, status: 'cancelled', bookingDate: '2026-02-08', pnr: 'PNR1293847',
  },
];

// Admin reports mock data
export const adminStats = {
  totalBookings: 1247,
  todayBookings: 38,
  totalRevenue: 62350,
  todayRevenue: 1900,
  activeBuses: 12,
  totalPassengers: 2891,
  seatOccupancy: 72,
  cancelRate: 8.5,
};

export const dailyBookingsData = [
  { date: 'Feb 13', bookings: 32, revenue: 1600 },
  { date: 'Feb 14', bookings: 45, revenue: 2250 },
  { date: 'Feb 15', bookings: 28, revenue: 1400 },
  { date: 'Feb 16', bookings: 52, revenue: 2600 },
  { date: 'Feb 17', bookings: 41, revenue: 2050 },
  { date: 'Feb 18', bookings: 36, revenue: 1800 },
  { date: 'Feb 19', bookings: 38, revenue: 1900 },
];
