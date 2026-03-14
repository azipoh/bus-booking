/**
 * Profile page — passenger personal info, travel history, and loyalty points.
 */
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/currency';
import { formatDate } from '@/lib/scheduleHelpers';
import type { BookingWithDetails } from '@/lib/scheduleHelpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { User, Mail, Phone, Gift, Ticket, MapPin, Loader2, Save, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setEmail(profile.email || '');
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, phone })
        .eq('id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast.success('Profile updated!');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['profile-bookings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, schedules(*, buses(*), routes(*))')
        .eq('user_id', user!.id)
        .order('booked_at', { ascending: false })
        .limit(10);
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

  if (authLoading || profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;

  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const totalTrips = bookings.filter((b) => b.status === 'confirmed' || b.status === 'completed').length;
  const totalSpent = bookings.reduce((sum, b) => sum + Number(b.total_fare), 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <Avatar className="h-20 w-20 text-2xl">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                {initials || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h1 className="font-heading text-3xl font-bold text-foreground">{fullName || 'Passenger'}</h1>
              <p className="text-sm text-muted-foreground">{email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="secondary" className="gap-1">
                  <Ticket className="h-3 w-3" /> {totalTrips} trips
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Gift className="h-3 w-3" /> {totalPoints} points
                </Badge>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Total Trips', value: totalTrips, icon: Ticket, color: 'text-primary' },
              { label: 'Total Spent', value: formatCurrency(totalSpent), icon: MapPin, color: 'text-accent' },
              { label: 'Loyalty Points', value: totalPoints, icon: Gift, color: 'text-success' },
            ].map((stat) => (
              <Card key={stat.label} className="shadow-soft">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className={`rounded-lg bg-muted p-3 ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="font-heading text-xl font-bold text-foreground">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="info" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="info">Personal Info</TabsTrigger>
              <TabsTrigger value="history">Travel History</TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="font-heading">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                      <User className="h-3.5 w-3.5" /> Full Name
                    </label>
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-background" />
                  </div>
                  <div>
                    <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" /> Email
                    </label>
                    <Input value={email} disabled className="bg-muted" />
                    <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" /> Phone
                    </label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+237 6XX XXX XXX" className="bg-background" />
                  </div>
                  <Button
                    onClick={() => updateMutation.mutate()}
                    disabled={updateMutation.isPending}
                    className="gap-2 bg-primary text-primary-foreground"
                  >
                    {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <div className="space-y-4">
                {bookings.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">No travel history yet.</div>
                ) : (
                  bookings.map((b, i) => (
                    <motion.div
                      key={b.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card className="shadow-soft">
                        <CardContent className="flex items-center gap-4 p-4">
                          <div className="rounded-lg bg-muted p-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="font-heading font-bold text-foreground">
                              {b.schedules.routes.origin} → {b.schedules.routes.destination}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(b.schedules.departure_time)} • {b.schedules.buses.name} • Seats: {b.seat_numbers.join(', ')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-heading font-bold text-foreground">{formatCurrency(Number(b.total_fare))}</p>
                            <Badge variant={b.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs capitalize">
                              {b.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
