/**
 * AdminBookings page displays all bookings from the database.
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { BookingWithDetails } from '@/lib/scheduleHelpers';
import { formatTime, formatDate } from '@/lib/scheduleHelpers';
import { formatCurrency } from '@/lib/currency';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const statusColors: Record<string, string> = {
  confirmed: 'bg-success/10 text-success',
  completed: 'bg-info/10 text-info',
  cancelled: 'bg-destructive/10 text-destructive',
  pending: 'bg-warning/10 text-warning',
};

const AdminBookings = () => {
  const [search, setSearch] = useState('');

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, schedules(*, buses(*), routes(*))')
        .order('booked_at', { ascending: false });
      if (error) throw error;
      return (data as unknown as BookingWithDetails[]) || [];
    },
  });

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    return (
      b.passenger_name.toLowerCase().includes(q) ||
      b.pnr.toLowerCase().includes(q) ||
      b.schedules.routes.origin.toLowerCase().includes(q) ||
      b.schedules.routes.destination.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">All Bookings</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} bookings found</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, PNR, route..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64 bg-background pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Export
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card shadow-soft">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PNR</TableHead>
                  <TableHead>Passenger</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Bus</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>Fare</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-heading font-semibold">{b.pnr}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{b.passenger_name}</p>
                        <p className="text-xs text-muted-foreground">{b.passenger_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{b.schedules.routes.origin} → {b.schedules.routes.destination}</TableCell>
                    <TableCell>{formatDate(b.schedules.departure_time)}</TableCell>
                    <TableCell className="text-sm">{b.schedules.buses.name}</TableCell>
                    <TableCell>{b.seat_numbers.join(', ')}</TableCell>
                    <TableCell className="font-heading font-bold">{formatCurrency(Number(b.total_fare))}</TableCell>
                    <TableCell>
                      <Badge className={`capitalize ${statusColors[b.status] || ''}`}>{b.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminBookings;
