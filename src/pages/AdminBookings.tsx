/**
 * AdminBookings page displays all bookings for admin review.
 * Shows a table of all passenger bookings with filtering.
 */
import { useState } from 'react';
import { sampleBookings, type Booking } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Download } from 'lucide-react';
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

  // Expand sample data for demo
  const allBookings: Booking[] = [
    ...sampleBookings,
    {
      id: 'bk4', passengerName: 'Jane Smith', passengerEmail: 'jane@example.com', passengerPhone: '+1987654321',
      scheduleId: 's2', busName: 'StarCoach Premium', operator: 'Star Coaches',
      source: 'New York', destination: 'Boston', date: '2026-02-20',
      departureTime: '08:30', arrivalTime: '12:45', seatNumbers: ['D1'],
      totalFare: 65, status: 'confirmed', bookingDate: '2026-02-19', pnr: 'PNR6721340',
    },
    {
      id: 'bk5', passengerName: 'Mike Johnson', passengerEmail: 'mike@example.com', passengerPhone: '+1122334455',
      scheduleId: 's6', busName: 'BlueLine Express', operator: 'BlueLine Travels',
      source: 'Seattle', destination: 'Portland', date: '2026-02-20',
      departureTime: '10:00', arrivalTime: '13:15', seatNumbers: ['B3', 'B4'],
      totalFare: 80, status: 'pending', bookingDate: '2026-02-19', pnr: 'PNR9182736',
    },
  ];

  const filtered = allBookings.filter(
    (b) =>
      b.passengerName.toLowerCase().includes(search.toLowerCase()) ||
      b.pnr.toLowerCase().includes(search.toLowerCase()) ||
      b.source.toLowerCase().includes(search.toLowerCase()) ||
      b.destination.toLowerCase().includes(search.toLowerCase())
  );

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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-border bg-card shadow-soft"
        >
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
                      <p className="font-medium">{b.passengerName}</p>
                      <p className="text-xs text-muted-foreground">{b.passengerEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>{b.source} → {b.destination}</TableCell>
                  <TableCell>{b.date}</TableCell>
                  <TableCell className="text-sm">{b.busName}</TableCell>
                  <TableCell>{b.seatNumbers.join(', ')}</TableCell>
                  <TableCell className="font-heading font-bold">${b.totalFare}</TableCell>
                  <TableCell>
                    <Badge className={`capitalize ${statusColors[b.status]}`}>{b.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminBookings;
