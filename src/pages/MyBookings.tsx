/**
 * MyBookings page shows the passenger's booking history from the database.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { BookingWithDetails } from '@/lib/scheduleHelpers';
import { formatTime, formatDate } from '@/lib/scheduleHelpers';
import { formatCurrency } from '@/lib/currency';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MapPin, X, RefreshCw, Ticket, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';

const statusColors: Record<string, string> = {
  confirmed: 'bg-success/10 text-success border-success/20',
  completed: 'bg-info/10 text-info border-info/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
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

  const cancelMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      toast.success('Booking cancelled successfully.');
    },
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
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1" onClick={() => toast.info('Rescheduling coming soon.')}>
              <RefreshCw className="h-3.5 w-3.5" /> Reschedule
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => cancelMutation.mutate(booking.id)}
              disabled={cancelMutation.isPending}
            >
              <X className="h-3.5 w-3.5" /> Cancel
            </Button>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 font-heading text-3xl font-bold text-foreground">My Bookings</h1>

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
