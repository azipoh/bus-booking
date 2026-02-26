/**
 * SeatSelection page lets passengers pick seats, enter details, and book.
 * Uses real database for schedule data, seat locks, and bookings.
 */
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { generateSeatLayout, formatTime, calcDuration } from '@/lib/scheduleHelpers';
import { formatCurrency } from '@/lib/currency';
import type { ScheduleWithDetails, Seat } from '@/lib/scheduleHelpers';
import SeatMap from '@/components/SeatMap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Clock, Timer, AlertTriangle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const LOCK_TIMEOUT = 5 * 60;

const SeatSelection = () => {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(LOCK_TIMEOUT);
  const [lockActive, setLockActive] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setName(user.user_metadata?.full_name || '');
      setPhone(user.user_metadata?.phone || '');
    }
  }, [user]);

  const { data: schedule, isLoading: scheduleLoading } = useQuery({
    queryKey: ['schedule', scheduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schedules')
        .select('*, buses(*), routes(*)')
        .eq('id', scheduleId!)
        .single();
      if (error) throw error;
      return data as unknown as ScheduleWithDetails;
    },
    enabled: !!scheduleId,
  });

  const { data: bookedSeats = [] } = useQuery({
    queryKey: ['booked-seats', scheduleId],
    queryFn: async () => {
      const { data } = await supabase
        .from('bookings')
        .select('seat_numbers')
        .eq('schedule_id', scheduleId!)
        .neq('status', 'cancelled');
      return (data || []).flatMap((b) => b.seat_numbers || []);
    },
    enabled: !!scheduleId,
  });

  const { data: lockedSeats = [] } = useQuery({
    queryKey: ['seat-locks', scheduleId],
    queryFn: async () => {
      const { data } = await supabase
        .from('seat_locks')
        .select('seat_number, locked_by')
        .eq('schedule_id', scheduleId!)
        .gt('expires_at', new Date().toISOString());
      return (data || [])
        .filter((l) => l.locked_by !== user?.id)
        .map((l) => l.seat_number);
    },
    enabled: !!scheduleId,
    refetchInterval: 15000,
  });

  const seats = useMemo(() => {
    if (!schedule) return [];
    return generateSeatLayout(
      schedule.buses.total_seats,
      Number(schedule.fare),
      bookedSeats,
      lockedSeats
    );
  }, [schedule, bookedSeats, lockedSeats]);

  const lockSeatsMutation = useMutation({
    mutationFn: async (seatNumbers: number[]) => {
      if (!user) throw new Error('Must be logged in');
      await supabase
        .from('seat_locks')
        .delete()
        .eq('schedule_id', scheduleId!)
        .eq('locked_by', user.id);
      if (seatNumbers.length > 0) {
        const { error } = await supabase.from('seat_locks').insert(
          seatNumbers.map((num) => ({
            schedule_id: scheduleId!,
            seat_number: num,
            locked_by: user.id,
          }))
        );
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['seat-locks', scheduleId] }),
  });

  useEffect(() => {
    if (selectedSeats.length > 0 && !lockActive) {
      setLockActive(true);
      setTimeLeft(LOCK_TIMEOUT);
    }
    if (selectedSeats.length === 0) setLockActive(false);
  }, [selectedSeats.length]);

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

  const handleSeatClick = (seatId: string) => {
    if (!user) {
      toast.error('Please log in to select seats.');
      navigate('/login');
      return;
    }
    setSelectedSeats((prev) => {
      const next = prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : prev.length < 6
        ? [...prev, seatId]
        : (toast.warning('Maximum 6 seats per booking'), prev);

      const seatNumbers = next.map((id) => {
        const seat = seats.find((s) => s.id === id);
        return seat?.number || 0;
      });
      lockSeatsMutation.mutate(seatNumbers);
      return next;
    });
  };

  const totalFare = selectedSeats.reduce((sum, seatId) => {
    const seat = seats.find((s) => s.id === seatId);
    return sum + (seat?.price || 0);
  }, 0);

  const formatTimer = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const handleBook = async () => {
    if (!user) { navigate('/login'); return; }
    if (!name || !email || !phone) { toast.error('Please fill in all passenger details.'); return; }
    if (selectedSeats.length === 0) { toast.error('Please select at least one seat.'); return; }

    setIsBooking(true);
    try {
      const seatNumbers = selectedSeats.map((id) => seats.find((s) => s.id === id)?.number || 0);
      const pnr = `PNR${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

      const { error } = await supabase.from('bookings').insert({
        user_id: user.id,
        schedule_id: scheduleId!,
        passenger_name: name,
        passenger_email: email,
        passenger_phone: phone,
        seat_numbers: seatNumbers,
        total_fare: totalFare,
        pnr,
        status: 'confirmed',
      });
      if (error) throw error;

      await supabase
        .from('schedules')
        .update({ available_seats: (schedule?.available_seats || 0) - seatNumbers.length })
        .eq('id', scheduleId!);

      await supabase
        .from('seat_locks')
        .delete()
        .eq('schedule_id', scheduleId!)
        .eq('locked_by', user.id);

      navigate('/booking-confirmation', {
        state: {
          pnr,
          busName: schedule?.buses.name,
          operator: schedule?.buses.registration_number,
          source: schedule?.routes.origin,
          destination: schedule?.routes.destination,
          date: formatTime(schedule?.departure_time || '').split('T')[0],
          departureTime: formatTime(schedule?.departure_time || ''),
          arrivalTime: formatTime(schedule?.arrival_time || ''),
          seatNumbers: seatNumbers.map(String),
          totalFare,
          passengerName: name,
          passengerEmail: email,
        },
      });
    } catch (err: any) {
      toast.error(err.message || 'Booking failed.');
    } finally {
      setIsBooking(false);
    }
  };

  if (scheduleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Schedule not found.</p>
      </div>
    );
  }

  const depTime = formatTime(schedule.departure_time);
  const arrTime = formatTime(schedule.arrival_time);
  const duration = calcDuration(schedule.departure_time, schedule.arrival_time);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to results
        </button>

        <div className="mb-6 rounded-xl border border-border bg-card p-5 shadow-soft">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">{schedule.buses.name}</h1>
              <p className="text-sm text-muted-foreground">{schedule.buses.bus_type}</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="font-heading text-xl font-bold">{depTime}</p>
                <p className="text-xs text-muted-foreground">{schedule.routes.origin}</p>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span className="text-xs">{duration}</span>
              </div>
              <div className="text-center">
                <p className="font-heading text-xl font-bold">{arrTime}</p>
                <p className="text-xs text-muted-foreground">{schedule.routes.destination}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="mb-4 font-heading text-lg font-bold text-foreground">Select Your Seats</h2>
            <SeatMap seats={seats} selectedSeats={selectedSeats} onSeatClick={handleSeatClick} />
          </div>

          <div className="space-y-4">
            {lockActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex items-center gap-2 rounded-lg p-3 text-sm font-medium ${
                  timeLeft < 60 ? 'bg-destructive/10 text-destructive' : 'bg-accent/10 text-accent-foreground'
                }`}
              >
                <Timer className="h-4 w-4" />
                Seats locked for {formatTimer(timeLeft)}
                {timeLeft < 60 && <AlertTriangle className="ml-auto h-4 w-4" />}
              </motion.div>
            )}

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
                        <span className="font-semibold text-foreground">{formatCurrency(seat?.price || 0)}</span>
                      </div>
                    );
                  })}
                  <div className="border-t border-border pt-2">
                    <div className="flex items-center justify-between font-heading font-bold">
                      <span>Total</span>
                      <span className="text-xl text-accent">{formatCurrency(totalFare)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
              <h3 className="mb-3 font-heading text-base font-bold text-foreground">Passenger Details</h3>
              <div className="space-y-3">
                <Input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="bg-background" />
                <Input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-background" />
                <Input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-background" />
              </div>
            </div>

            <Button
              onClick={handleBook}
              disabled={selectedSeats.length === 0 || !name || !email || !phone || isBooking}
              className="w-full bg-accent py-6 font-heading text-base font-bold text-accent-foreground shadow-accent hover:bg-accent/90"
            >
              {isBooking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm Booking — {formatCurrency(totalFare)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
