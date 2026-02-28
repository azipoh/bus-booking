/**
 * Admin Schedules page for managing trips/schedules.
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import type { ScheduleWithDetails } from '@/lib/scheduleHelpers';
import { formatTime, formatDate, calcDuration } from '@/lib/scheduleHelpers';
import { formatCurrency } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Calendar, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

type DbSchedule = Tables<'schedules'>;
type DbBus = Tables<'buses'>;
type DbRoute = Tables<'routes'>;

const AdminSchedules = () => {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ScheduleWithDetails | null>(null);

  // Form state
  const [formBusId, setFormBusId] = useState('');
  const [formRouteId, setFormRouteId] = useState('');
  const [formDeparture, setFormDeparture] = useState('');
  const [formArrival, setFormArrival] = useState('');
  const [formFare, setFormFare] = useState('');
  const [formSeats, setFormSeats] = useState('40');
  const [formStatus, setFormStatus] = useState('active');

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ['admin-schedules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schedules')
        .select('*, buses(*), routes(*)')
        .order('departure_time', { ascending: false });
      if (error) throw error;
      return (data as unknown as ScheduleWithDetails[]) || [];
    },
  });

  const { data: buses = [] } = useQuery({
    queryKey: ['buses-list'],
    queryFn: async () => {
      const { data } = await supabase.from('buses').select('*').eq('is_active', true).order('name');
      return (data as DbBus[]) || [];
    },
  });

  const { data: routes = [] } = useQuery({
    queryKey: ['routes-list'],
    queryFn: async () => {
      const { data } = await supabase.from('routes').select('*').order('origin');
      return (data as DbRoute[]) || [];
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (schedule: Partial<DbSchedule>) => {
      if (editing) {
        const { error } = await supabase.from('schedules').update(schedule).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('schedules').insert(schedule as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-schedules'] });
      toast.success(editing ? 'Schedule updated' : 'Schedule created');
      setDialogOpen(false);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('schedules').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-schedules'] });
      toast.success('Schedule deleted');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const openAdd = () => {
    setEditing(null);
    setFormBusId(''); setFormRouteId(''); setFormDeparture(''); setFormArrival('');
    setFormFare('5000'); setFormSeats('40'); setFormStatus('active');
    setDialogOpen(true);
  };

  const openEdit = (s: ScheduleWithDetails) => {
    setEditing(s);
    setFormBusId(s.bus_id); setFormRouteId(s.route_id);
    setFormDeparture(new Date(s.departure_time).toISOString().slice(0, 16));
    setFormArrival(new Date(s.arrival_time).toISOString().slice(0, 16));
    setFormFare(String(s.fare)); setFormSeats(String(s.available_seats)); setFormStatus(s.status);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formBusId || !formRouteId || !formDeparture || !formArrival) {
      toast.error('Fill all required fields'); return;
    }
    upsertMutation.mutate({
      bus_id: formBusId,
      route_id: formRouteId,
      departure_time: new Date(formDeparture).toISOString(),
      arrival_time: new Date(formArrival).toISOString(),
      fare: parseFloat(formFare),
      available_seats: parseInt(formSeats),
      status: formStatus,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Manage Schedules</h1>
            <p className="text-sm text-muted-foreground">{schedules.length} trips scheduled</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAdd} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus className="h-4 w-4" /> New Trip
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-heading">{editing ? 'Edit Schedule' : 'Create New Trip'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Bus</label>
                  <Select value={formBusId} onValueChange={setFormBusId}>
                    <SelectTrigger><SelectValue placeholder="Select bus" /></SelectTrigger>
                    <SelectContent>
                      {buses.map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.name} ({b.registration_number})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Route</label>
                  <Select value={formRouteId} onValueChange={setFormRouteId}>
                    <SelectTrigger><SelectValue placeholder="Select route" /></SelectTrigger>
                    <SelectContent>
                      {routes.map((r) => (
                        <SelectItem key={r.id} value={r.id}>{r.origin} → {r.destination}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Departure</label>
                    <Input type="datetime-local" value={formDeparture} onChange={(e) => setFormDeparture(e.target.value)} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Arrival</label>
                    <Input type="datetime-local" value={formArrival} onChange={(e) => setFormArrival(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Fare (FCFA)</label>
                    <Input type="number" value={formFare} onChange={(e) => setFormFare(e.target.value)} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Seats</label>
                    <Input type="number" value={formSeats} onChange={(e) => setFormSeats(e.target.value)} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Status</label>
                    <Select value={formStatus} onValueChange={setFormStatus}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleSave} disabled={upsertMutation.isPending} className="w-full bg-primary text-primary-foreground">
                  {upsertMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editing ? 'Update Schedule' : 'Create Trip'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {schedules.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="shadow-soft">
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <h3 className="font-heading font-bold text-foreground">
                          {s.routes.origin} → {s.routes.destination}
                        </h3>
                        <p className="text-xs text-muted-foreground">{s.buses.name}</p>
                      </div>
                      <Badge variant={s.status === 'active' ? 'default' : s.status === 'cancelled' ? 'destructive' : 'secondary'}>
                        {s.status}
                      </Badge>
                    </div>
                    <div className="mb-3 space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(s.departure_time)} • {formatTime(s.departure_time)} – {formatTime(s.arrival_time)}</span>
                      </div>
                      <div className="flex gap-4">
                        <span>Duration: {calcDuration(s.departure_time, s.arrival_time)}</span>
                        <span>Seats: {s.available_seats}</span>
                      </div>
                      <p className="font-heading text-base font-bold text-foreground">{formatCurrency(Number(s.fare))}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => openEdit(s)}>
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Button>
                      <Button
                        variant="outline" size="sm"
                        className="gap-1 text-destructive hover:bg-destructive/10"
                        onClick={() => deleteMutation.mutate(s.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSchedules;
