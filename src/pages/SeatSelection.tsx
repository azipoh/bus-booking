/**
 * SeatSelection page lets passengers pick seats, enter details, and book.
 * Implements seat locking simulation with a 5-minute timeout.
 */
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { schedules, generateSeatLayout, type Seat } from '@/data/mockData';
import SeatMap from '@/components/SeatMap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Clock, Timer, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const LOCK_TIMEOUT = 5 * 60; // 5 minutes in seconds

const SeatSelection = () => {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const navigate = useNavigate();

  // Find the schedule
  const schedule = schedules.find((s) => s.id === scheduleId);

  // Generate seat layout (memoized so it doesn't regenerate on re-render)
  const seats = useMemo(
    () => (schedule ? generateSeatLayout(schedule.bus.totalSeats, schedule.fare) : []),
    [scheduleId]
  );

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(LOCK_TIMEOUT);
  const [lockActive, setLockActive] = useState(false);

  // Passenger details form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Start countdown when seats are selected
  useEffect(() => {
    if (selectedSeats.length > 0 && !lockActive) {
      setLockActive(true);
      setTimeLeft(LOCK_TIMEOUT);
    }
    if (selectedSeats.length === 0) {
      setLockActive(false);
    }
  }, [selectedSeats.length]);

  // Countdown timer
  useEffect(() => {
    if (!lockActive) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setSelectedSeats([]);
          setLockActive(false);
          toast.error('Seat lock expired. Please select again.');
          return LOCK_TIMEOUT;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockActive]);

  // Handle seat click
  const handleSeatClick = (seatId: string) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : prev.length < 6
        ? [...prev, seatId]
        : (toast.warning('Maximum 6 seats per booking'), prev)
    );
  };

  // Calculate total fare
  const totalFare = selectedSeats.reduce((sum, seatId) => {
    const seat = seats.find((s) => s.id === seatId);
    return sum + (seat?.price || 0);
  }, 0);

  // Format timer
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // Handle booking
  const handleBook = () => {
    if (!name || !email || !phone) {
      toast.error('Please fill in all passenger details.');
      return;
    }
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat.');
      return;
    }

    // Generate a PNR
    const pnr = `PNR${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const seatNumbers = selectedSeats.map((id) => seats.find((s) => s.id === id)?.number || '');

    // Navigate to confirmation
    navigate('/booking-confirmation', {
      state: {
        pnr,
        busName: schedule?.bus.name,
        operator: schedule?.bus.operator,
        source: schedule?.route.source,
        destination: schedule?.route.destination,
        date: schedule?.date,
        departureTime: schedule?.departureTime,
        arrivalTime: schedule?.arrivalTime,
        seatNumbers,
        totalFare,
        passengerName: name,
        passengerEmail: email,
      },
    });
  };

  if (!schedule) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Schedule not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to results
        </button>

        {/* Schedule info */}
        <div className="mb-6 rounded-xl border border-border bg-card p-5 shadow-soft">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">{schedule.bus.name}</h1>
              <p className="text-sm text-muted-foreground">{schedule.bus.operator} • {schedule.bus.type}</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="font-heading text-xl font-bold">{schedule.departureTime}</p>
                <p className="text-xs text-muted-foreground">{schedule.route.source}</p>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span className="text-xs">{schedule.route.duration}</span>
              </div>
              <div className="text-center">
                <p className="font-heading text-xl font-bold">{schedule.arrivalTime}</p>
                <p className="text-xs text-muted-foreground">{schedule.route.destination}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Seat Map (2/3 width) */}
          <div className="lg:col-span-2">
            <h2 className="mb-4 font-heading text-lg font-bold text-foreground">Select Your Seats</h2>
            <SeatMap seats={seats} selectedSeats={selectedSeats} onSeatClick={handleSeatClick} />
          </div>

          {/* Booking panel (1/3 width) */}
          <div className="space-y-4">
            {/* Timer */}
            {lockActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex items-center gap-2 rounded-lg p-3 text-sm font-medium ${
                  timeLeft < 60
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-accent/10 text-accent-foreground'
                }`}
              >
                <Timer className="h-4 w-4" />
                Seats locked for {formatTime(timeLeft)}
                {timeLeft < 60 && <AlertTriangle className="ml-auto h-4 w-4" />}
              </motion.div>
            )}

            {/* Selected seats summary */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
              <h3 className="mb-3 font-heading text-base font-bold text-foreground">Booking Summary</h3>
              {selectedSeats.length === 0 ? (
                <p className="text-sm text-muted-foreground">No seats selected yet.</p>
              ) : (
                <div className="space-y-2">
                  {selectedSeats.map((seatId) => {
                    const seat = seats.find((s) => s.id === seatId);
                    return (
                      <div key={seatId} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">Seat {seat?.number} ({seat?.type})</span>
                        <span className="font-semibold text-foreground">${seat?.price}</span>
                      </div>
                    );
                  })}
                  <div className="border-t border-border pt-2">
                    <div className="flex items-center justify-between font-heading font-bold">
                      <span>Total</span>
                      <span className="text-xl text-accent">${totalFare}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Passenger details */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
              <h3 className="mb-3 font-heading text-base font-bold text-foreground">Passenger Details</h3>
              <div className="space-y-3">
                <Input
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background"
                />
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background"
                />
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-background"
                />
              </div>
            </div>

            {/* Book button */}
            <Button
              onClick={handleBook}
              disabled={selectedSeats.length === 0 || !name || !email || !phone}
              className="w-full bg-accent py-6 font-heading text-base font-bold text-accent-foreground shadow-accent hover:bg-accent/90"
            >
              Confirm Booking — ${totalFare}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
