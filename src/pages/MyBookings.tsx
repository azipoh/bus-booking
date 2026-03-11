/**
 * MyBookings page shows the passenger's booking history from the database.
 * Includes loyalty points balance, download ticket, reschedule, and no-refund policy.
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { BookingWithDetails } from '@/lib/scheduleHelpers';
import { formatTime, formatDate } from '@/lib/scheduleHelpers';
import { formatCurrency } from '@/lib/currency';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import RescheduleModal from '@/components/RescheduleModal';
import { MapPin, RefreshCw, Ticket, Loader2, Download, Gift, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';

const statusColors: Record<string, string> = {
  confirmed: 'bg-success/10 text-success border-success/20',
  completed: 'bg-info/10 text-info border-info/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
};

const downloadTicket = (booking: BookingWithDetails) => {
  const s = booking.schedules;
  const content = `
========================================
          BUSGO E-TICKET
========================================

PNR: ${booking.pnr}
PASSENGER: ${booking.passenger_name}

ROUTE: ${s.routes.origin} → ${s.routes.destination}
DATE: ${formatDate(s.departure_time)}
DEPARTURE: ${formatTime(s.departure_time)}
ARRIVAL: ${formatTime(s.arrival_time)}

BUS: ${s.buses.name}
SEAT(S): ${booking.seat_numbers.join(', ')}
FARE: ${formatCurrency(Number(booking.total_fare))}

STATUS: ${booking.status.toUpperCase()}

========================================
This ticket is NON-REFUNDABLE.
It can only be RESCHEDULED.
© 2026 BusGo — Cameroon
========================================
`;
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `BusGo-${booking.pnr}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const MyBookings = () => {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['my-bookings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, schedules(*, buses(*), routes(*))')
        .eq('user_id', user!.id)
        .order('booked_at', { ascending: false });
      if (error) throw error;
      return (data as unknown as BookingWithDetails[]) || [];
    },
    enabled: !!user,
  });

  const { data: totalPoints = 0 } = useQuery({
    queryKey: ['loyalty-points', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loyalty_points')
        .select('points')
        .eq('user_id', user!.id);
      if (error) throw error;
      return (data || []).reduce((sum, r) => sum + r.points, 0);
    },
    enabled: !!user,
  });

  if (authLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (!user) return <Navigate to="/login" />;

  const filterBookings = (status?: string) =>
    status ? bookings.filter((b) => b.status === status) : bookings;

  const BookingCard = ({ booking, index }: { booking: BookingWithDetails; index: number }) => {
    const s = booking.schedules;
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08 }}
        className="rounded-xl border border-border bg-card p-5 shadow-soft"
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="h-4 w-4 text-muted-foreground" />
            <span className="font-heading text-sm font-bold text-foreground">{booking.pnr}</span>
          </div>
          <Badge className={`border ${statusColors[booking.status] || ''} capitalize`}>
            {booking.status}
          </Badge>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="font-heading text-lg font-bold text-foreground">{formatTime(s.departure_time)}</p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" /> {s.routes.origin}
            </div>
          </div>
          <div className="text-center text-muted-foreground">→</div>
          <div className="text-right">
            <p className="font-heading text-lg font-bold text-foreground">{formatTime(s.arrival_time)}</p>
            <div className="flex items-center justify-end gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" /> {s.routes.destination}
            </div>
          </div>
        </div>

        <div className="mb-4 rounded-lg bg-muted p-3">
          <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Bus</p>
              <p className="font-medium text-foreground">{s.buses.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="font-medium text-foreground">{formatDate(s.departure_time)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Seats</p>
              <p className="font-medium text-foreground">{booking.seat_numbers.join(', ')}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fare</p>
              <p className="font-heading font-bold text-accent">{formatCurrency(Number(booking.total_fare))}</p>
            </div>
          </div>
        </div>

        {booking.status === 'confirmed' && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1" onClick={() => downloadTicket(booking)}>
                <Download className="h-3.5 w-3.5" /> Download Ticket
              </Button>
              <Button variant="outline" size="sm" className="gap-1" onClick={() => toast.info('Rescheduling coming soon.')}>
                <RefreshCw className="h-3.5 w-3.5" /> Reschedule
              </Button>
            </div>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <AlertTriangle className="h-3 w-3 text-warning" />
              Non-refundable — rescheduling only
            </p>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-heading text-3xl font-bold text-foreground">My Bookings</h1>
          <div className="flex items-center gap-2 rounded-lg bg-accent/10 px-4 py-2">
            <Gift className="h-5 w-5 text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Loyalty Points</p>
              <p className="font-heading text-lg font-bold text-accent">{totalPoints}</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmed ({filterBookings('confirmed').length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({filterBookings('completed').length})</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled ({filterBookings('cancelled').length})</TabsTrigger>
            </TabsList>

            {['all', 'confirmed', 'completed', 'cancelled'].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-4">
                {filterBookings(tab === 'all' ? undefined : tab).length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    No {tab !== 'all' ? tab : ''} bookings found.
                  </div>
                ) : (
                  filterBookings(tab === 'all' ? undefined : tab).map((b, i) => (
                    <BookingCard key={b.id} booking={b} index={i} />
                  ))
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
