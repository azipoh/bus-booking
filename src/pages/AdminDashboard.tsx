/**
 * Admin Dashboard showing key metrics, charts, and recent bookings.
 * Provides an overview of the bus booking system's performance.
 */
import { adminStats, dailyBookingsData, sampleBookings, buses } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Ticket, DollarSign, Bus, Users, TrendingUp,
  BarChart3, Plus, Settings,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const statCards = [
  { label: 'Total Bookings', value: adminStats.totalBookings, today: `+${adminStats.todayBookings} today`, icon: Ticket, color: 'text-info' },
  { label: 'Revenue', value: `$${adminStats.totalRevenue.toLocaleString()}`, today: `+$${adminStats.todayRevenue} today`, icon: DollarSign, color: 'text-success' },
  { label: 'Active Buses', value: adminStats.activeBuses, today: `${adminStats.seatOccupancy}% occupancy`, icon: Bus, color: 'text-accent' },
  { label: 'Passengers', value: adminStats.totalPassengers.toLocaleString(), today: `${adminStats.cancelRate}% cancel rate`, icon: Users, color: 'text-primary' },
];

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage buses, routes, schedules, and bookings</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/buses">
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" /> Add Bus
              </Button>
            </Link>
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" /> Settings
            </Button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="shadow-soft">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="mt-1 font-heading text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{stat.today}</p>
                    </div>
                    <div className={`rounded-lg bg-muted p-2.5 ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* Bookings chart */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-base">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                Daily Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dailyBookingsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="bookings" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue chart */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-base">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyBookingsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`$${value}`, 'Revenue']}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--success))" strokeWidth={2} dot={{ fill: 'hsl(var(--success))' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Fleet & Recent Bookings */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Bus fleet */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="font-heading text-base">Bus Fleet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {buses.map((bus) => (
                  <div key={bus.id} className="flex items-center justify-between rounded-lg bg-muted p-3">
                    <div>
                      <p className="font-medium text-foreground">{bus.name}</p>
                      <p className="text-xs text-muted-foreground">{bus.operator} • {bus.totalSeats} seats</p>
                    </div>
                    <Badge variant="secondary">{bus.type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent bookings */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="font-heading text-base">Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sampleBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between rounded-lg bg-muted p-3">
                    <div>
                      <p className="font-medium text-foreground">{booking.passengerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {booking.source} → {booking.destination} • {booking.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-heading font-bold text-foreground">${booking.totalFare}</p>
                      <Badge className={`text-xs ${booking.status === 'confirmed' ? 'bg-success/10 text-success' : booking.status === 'cancelled' ? 'bg-destructive/10 text-destructive' : 'bg-info/10 text-info'}`}>
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
