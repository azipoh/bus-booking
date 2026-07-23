import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import BookingConfirmation from './BookingConfirmation';

const printMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useLocation: () => ({
      state: {
        pnr: 'PNR123',
        busName: 'Express Bus',
        operator: 'XYZ',
        source: 'Yaounde',
        destination: 'Douala',
        date: '2026-07-23',
        departureTime: '08:00',
        arrivalTime: '11:00',
        seatNumbers: ['1', '2'],
        totalFare: 6000,
        passengerName: 'Jane Doe',
        passengerEmail: 'jane@example.com',
      },
    }),
    Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

beforeEach(() => {
  printMock.mockReset();
  Object.defineProperty(window, 'print', {
    configurable: true,
    value: printMock,
  });
});

describe('BookingConfirmation', () => {
  it('shows a print ticket action for the confirmed booking', () => {
    render(<BookingConfirmation />);

    expect(screen.getByRole('button', { name: /print ticket/i })).toBeInTheDocument();
  });
});
