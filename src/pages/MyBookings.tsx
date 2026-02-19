/**
 * MyBookings page shows the passenger's booking history.
 * Allows viewing, cancelling, and rescheduling bookings.
 */
import { useState } from 'react';
import { sampleBookings, type Booking } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MapPin, Calendar, Clock, X, RefreshCw, Ticket } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  confirmed: 'bg-success/10 text-success border-success/20',
  completed: 'bg-info/10 text-info border-info/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
};

const MyBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>(sampleBookings);

  // Cancel a booking
  const handleCancel = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' as const } : b))
    );
    toast.success('Booking cancelled successfully.');
  };

  // Reschedule (simulated)
  const handleReschedule = (id: string) => {
    toast.info('Rescheduling feature: In production, this would open a date picker to select a new travel date.');
  };

  const filterBookings = (status?: string) =>
    status ? bookings.filter((b) => b.status === status) : bookings;

  const BookingCard = ({ booking, index }: { booking: Booking; index: number }) => (
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
        <Badge className={`border ${statusColors[booking.status]} capitalize`}>
          {booking.status}
        </Badge>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="font-heading text-lg font-bold text-foreground">{booking.departureTime}</p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" /> {booking.source}
          </div>
        </div>
        <div className="text-center text-muted-foreground">→</div>
        <div className="text-right">
          <p className="font-heading text-lg font-bold text-foreground">{booking.arrivalTime}</p>
          <div className="flex items-center justify-end gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" /> {booking.destination}
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-lg bg-muted p-3">
        <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Bus</p>
            <p className="font-medium text-foreground">{booking.busName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Date</p>
            <p className="font-medium text-foreground">{booking.date}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Seats</p>
            <p className="font-medium text-foreground">{booking.seatNumbers.join(', ')}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Fare</p>
            <p className="font-heading font-bold text-accent">${booking.totalFare}</p>
          </div>
        </div>
      </div>

      {booking.status === 'confirmed' && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => handleReschedule(booking.id)}
          >
            <RefreshCw className="h-3.5 w-3.5" /> Reschedule
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => handleCancel(booking.id)}
          >
            <X className="h-3.5 w-3.5" /> Cancel
          </Button>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 font-heading text-3xl font-bold text-foreground">My Bookings</h1>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
            <TabsTrigger value="confirmed">
              Confirmed ({filterBookings('confirmed').length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({filterBookings('completed').length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({filterBookings('cancelled').length})
            </TabsTrigger>
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
      </div>
    </div>
  );
};

export default MyBookings;
