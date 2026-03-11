/**
 * RescheduleModal lets customers pick a new trip to reschedule their booking.
 * Shows available schedules on the same route.
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatTime, formatDate, calcDuration } from '@/lib/scheduleHelpers';
import { formatCurrency } from '@/lib/currency';
import type { ScheduleWithDetails, BookingWithDetails } from '@/lib/scheduleHelpers';
import { Loader2, Calendar, Clock, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface RescheduleModalProps {
  open: boolean;
  onClose: () => void;
  booking: BookingWithDetails;
  onSuccess: () => void;
}

const RescheduleModal = ({ open, onClose, booking, onSuccess }: RescheduleModalProps) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);

  const route = booking.schedules.routes;

  const { data: availableSchedules = [], isLoading } = useQuery({
    queryKey: ['reschedule-schedules', route.origin, route.destination, booking.schedule_id],
    queryFn: async () => {
      const now = new Date();
      // Get schedules 30 min from now
      const minTime = new Date(now.getTime() + 30 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('schedules')
        .select('*, buses(*), routes!inner(*)')
        .eq('status', 'active')
        .eq('routes.origin', route.origin)
        .eq('routes.destination', route.destination)
        .neq('id', booking.schedule_id)
        .gt('departure_time', minTime)
        .gt('available_seats', booking.seat_numbers.length - 1)
        .order('departure_time');

      if (error) throw error;
      return (data as unknown as ScheduleWithDetails[]) || [];
    },
    enabled: open,
  });

  const handleReschedule = async () => {
    if (!selected) return;
    setIsRescheduling(true);

    try {
      // Restore seats on old schedule
      const oldSchedule = booking.schedules;
      await supabase
        .from('schedules')
        .update({ available_seats: oldSchedule.available_seats + booking.seat_numbers.length })
        .eq('id', booking.schedule_id);

      // Update booking to new schedule
      const { error } = await supabase
        .from('bookings')
        .update({ schedule_id: selected, status: 'confirmed' })
        .eq('id', booking.id);
      if (error) throw error;

      // Reduce seats on new schedule
      const newSchedule = availableSchedules.find((s) => s.id === selected);
      if (newSchedule) {
        await supabase
          .from('schedules')
          .update({ available_seats: newSchedule.available_seats - booking.seat_numbers.length })
          .eq('id', selected);
      }

      toast.success('Booking rescheduled successfully!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Rescheduling failed.');
    } finally {
      setIsRescheduling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Reschedule Booking</DialogTitle>
        </DialogHeader>

        <div className="mb-3 rounded-lg bg-muted p-3">
          <p className="text-xs text-muted-foreground">Current Trip</p>
          <p className="font-heading font-bold text-foreground">
            {route.origin} → {route.destination}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatDate(oldDep())} • {formatTime(oldDep())} — Seats: {booking.seat_numbers.join(', ')}
          </p>
        </div>

        <p className="mb-3 text-sm text-muted-foreground">Select a new trip:</p>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : availableSchedules.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No available trips found on this route. Try again later.
          </div>
        ) : (
          <div className="space-y-2">
            {availableSchedules.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelected(s.id)}
                className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                  selected === s.id
                    ? 'border-accent bg-accent/5'
                    : 'border-border bg-card hover:border-muted-foreground/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-heading font-bold text-foreground">{s.buses.name}</p>
                    <p className="text-xs text-muted-foreground">{s.buses.bus_type}</p>
                  </div>
                  <p className="font-heading text-lg font-bold text-accent">{formatCurrency(Number(s.fare))}</p>
                </div>
                <div className="mt-2 flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" /> {formatDate(s.departure_time)}
                  </div>
                  <div className="flex items-center gap-1 text-foreground font-medium">
                    <Clock className="h-3 w-3" /> {formatTime(s.departure_time)} → {formatTime(s.arrival_time)}
                  </div>
                  <span className="text-xs text-muted-foreground">{s.available_seats} seats left</span>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button
            onClick={handleReschedule}
            disabled={!selected || isRescheduling}
            className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isRescheduling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Reschedule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  function oldDep() {
    return booking.schedules.departure_time;
  }
};

export default RescheduleModal;
