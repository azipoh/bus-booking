/**
 * BookingConfirmation page displays after successful booking.
 * Shows PNR, trip details, download ticket, and no-refund policy.
 */
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle2, Download, Bus, Calendar, MapPin, Clock, AlertTriangle, Gift, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/currency';
import { motion } from 'framer-motion';

interface BookingState {
  pnr: string;
  busName: string;
  operator: string;
  source: string;
  destination: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  seatNumbers: string[];
  totalFare: number;
  passengerName: string;
  passengerEmail: string;
}

const generateTicketPDF = (booking: BookingState) => {
  const ticketContent = `
========================================
          MOGHAMO E-TICKET
========================================

PNR: ${booking.pnr}

PASSENGER: ${booking.passengerName}
EMAIL: ${booking.passengerEmail}

ROUTE: ${booking.source} → ${booking.destination}
DATE: ${booking.date}
DEPARTURE: ${booking.departureTime}
ARRIVAL: ${booking.arrivalTime}

BUS: ${booking.busName}
SEAT(S): ${booking.seatNumbers.join(', ')}

TOTAL FARE: ${formatCurrency(booking.totalFare)}

========================================
         IMPORTANT NOTICE
========================================
This ticket is NON-REFUNDABLE.
It can only be RESCHEDULED to another trip.
Please present this e-ticket at boarding.

Thank you for choosing Moghamo!
© 2026 Moghamo — Cameroon
========================================
`;

  const blob = new Blob([ticketContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Moghamo-Ticket-${booking.pnr}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const BookingConfirmation = () => {
  const location = useLocation();
  const booking = location.state as BookingState | null;

  if (!booking) return <Navigate to="/" />;

  const pointsEarned = Math.floor(booking.totalFare / 100);

  const handlePrintTicket = () => {
    window.print();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Success header */}
        <div className="mb-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10"
          >
            <CheckCircle2 className="h-10 w-10 text-success" />
          </motion.div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Booking Confirmed!</h1>
          <p className="mt-1 text-muted-foreground">Your e-ticket has been sent to {booking.passengerEmail}</p>
        </div>

        {/* Points earned */}
        {pointsEarned > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-4 flex items-center justify-center gap-2 rounded-lg bg-accent/10 p-3 text-sm font-medium text-accent"
          >
            <Gift className="h-4 w-4" />
            You earned {pointsEarned} loyalty points!
          </motion.div>
        )}

        {/* Ticket card */}
        <div className="ticket-print-area overflow-hidden rounded-2xl border border-border bg-card shadow-elevated">
          {/* Header strip */}
          <div className="gradient-hero px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bus className="h-5 w-5 text-primary-foreground" />
                <span className="font-heading font-bold text-primary-foreground">Moghamo</span>
              </div>
              <span className="rounded-md bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
                E-TICKET
              </span>
            </div>
          </div>

          {/* PNR */}
          <div className="border-b border-dashed border-border px-6 py-4 text-center">
            <p className="text-xs text-muted-foreground">PNR Number</p>
            <p className="font-heading text-2xl font-bold tracking-widest text-foreground">{booking.pnr}</p>
          </div>

          {/* Trip details */}
          <div className="space-y-4 px-6 py-5">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">{booking.date}</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-heading text-xl font-bold text-foreground">{booking.departureTime}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {booking.source}
                </div>
              </div>
              <div className="text-center text-muted-foreground">→</div>
              <div className="text-right">
                <p className="font-heading text-xl font-bold text-foreground">{booking.arrivalTime}</p>
                <div className="flex items-center justify-end gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {booking.destination}
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Passenger</p>
                  <p className="font-medium text-foreground">{booking.passengerName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Bus</p>
                  <p className="font-medium text-foreground">{booking.busName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Seat(s)</p>
                  <p className="font-medium text-foreground">{booking.seatNumbers.join(', ')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Fare</p>
                  <p className="font-heading text-lg font-bold text-accent">{formatCurrency(booking.totalFare)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* No refund policy */}
          <div className="mx-6 mb-4 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <div>
              <p className="text-xs font-medium text-warning">No Refund Policy</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                This ticket is non-refundable. It can only be rescheduled to another trip.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 border-t border-border px-6 py-4">
            <Button variant="outline" className="flex-1 gap-2" onClick={handlePrintTicket}>
              <Printer className="h-4 w-4" /> Print Ticket
            </Button>
            <Button variant="outline" className="flex-1 gap-2" onClick={() => generateTicketPDF(booking)}>
              <Download className="h-4 w-4" /> Download Ticket
            </Button>
            <Link to="/my-bookings" className="flex-1">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                My Bookings
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Book another trip
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingConfirmation;
