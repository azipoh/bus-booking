/**
 * Admin Dashboard showing key metrics and recent bookings from the database.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { BookingWithDetails } from '@/lib/scheduleHelpers';
import { formatDate } from '@/lib/scheduleHelpers';
import { formatCurrency } from '@/lib/currency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Ticket, DollarSign, Bus, Users, Plus, Settings, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  // Fetch aggregate stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [bookingsRes, busesRes] = await Promise.all([
        supabase.from('bookings').select('id, total_fare, status, seat_numbers'),
        supabase.from('buses').select('id, is_active'),
      ]);
      const bookings = bookingsRes.data || [];
      const buses = busesRes.data || [];

      const totalBookings = bookings.length;
      const totalRevenue = bookings.reduce((s, b) => s + Number(b.total_fare), 0);
      const activeBuses = buses.filter((b) => b.is_active).length;
      const totalPassengers = bookings.reduce((s, b) => s + (b.seat_numbers?.length || 0), 0);
      const cancelledCount = bookings.filter((b) => b.status === 'cancelled').length;
      const cancelRate = totalBookings > 0 ? ((cancelledCount / totalBookings) * 100).toFixed(1) : '0';

      return { totalBookings, totalRevenue, activeBuses, totalPassengers, cancelRate };
    },
  });

  // Recent bookings
  const { data: recentBookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['admin-recent-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, schedules(*, buses(*), routes(*))')
        .order('booked_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return (data as unknown as BookingWithDetails[]) || [];
    },
  });

  // Bus fleet
  const { data: buses = [] } = useQuery({
    queryKey: ['admin-fleet'],
    queryFn: async () => {
      const { data } = await supabase.from('buses').select('*').eq('is_active', true).limit(5);
      return data || [];
    },
  });

  const statCards = [
    { label: 'Total Bookings', value: stats?.totalBookings ?? '—', sub: '', icon: Ticket, color: 'text-info' },
    { label: 'Revenue', value: stats ? formatCurrency(stats.totalRevenue) : '—', sub: '', icon: DollarSign, color: 'text-success' },
    { label: 'Active Buses', value: stats?.activeBuses ?? '—', sub: '', icon: Bus, color: 'text-accent' },
    { label: 'Passengers', value: stats?.totalPassengers?.toLocaleString() ?? '—', sub: `${stats?.cancelRate || 0}% cancel rate`, icon: Users, color: 'text-primary' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage buses, routes, schedules, and bookings</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/buses"><Button variant="outline" className="gap-2"><Plus className="h-4 w-4" /> Add Bus</Button></Link>
            <Button variant="outline" className="gap-2"><Settings className="h-4 w-4" /> Settings</Button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="shadow-soft">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="mt-1 font-heading text-2xl font-bold text-foreground">
                        {statsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stat.value}
                      </p>
                      {stat.sub && <p className="mt-1 text-xs text-muted-foreground">{stat.sub}</p>}
                    </div>
                    <div className={`rounded-lg bg-muted p-2.5 ${stat.color}`}><stat.icon className="h-5 w-5" /></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Fleet & Recent Bookings */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-soft">
            <CardHeader><CardTitle className="font-heading text-base">Bus Fleet</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {buses.map((bus) => (
                  <div key={bus.id} className="flex items-center justify-between rounded-lg bg-muted p-3">
                    <div>
                      <p className="font-medium text-foreground">{bus.name}</p>
                      <p className="text-xs text-muted-foreground">{bus.registration_number} • {bus.total_seats} seats</p>
                    </div>
                    <Badge variant="secondary">{bus.bus_type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader><CardTitle className="font-heading text-base">Recent Bookings</CardTitle></CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : (
                <div className="space-y-3">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between rounded-lg bg-muted p-3">
                      <div>
                        <p className="font-medium text-foreground">{booking.passenger_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {booking.schedules.routes.origin} → {booking.schedules.routes.destination} • {formatDate(booking.schedules.departure_time)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-heading font-bold text-foreground">{formatCurrency(Number(booking.total_fare))}</p>
                        <Badge className={`text-xs ${booking.status === 'confirmed' ? 'bg-success/10 text-success' : booking.status === 'cancelled' ? 'bg-destructive/10 text-destructive' : 'bg-info/10 text-info'}`}>
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
