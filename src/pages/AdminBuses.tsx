/**
 * AdminBuses page for managing the bus fleet from the database.
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Pencil, Trash2, Bus as BusIcon, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

type DbBus = Tables<'buses'>;

const AdminBuses = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBus, setEditingBus] = useState<DbBus | null>(null);
  const [formName, setFormName] = useState('');
  const [formRegNum, setFormRegNum] = useState('');
  const [formType, setFormType] = useState('AC');
  const [formSeats, setFormSeats] = useState('40');

  const { data: busList = [], isLoading } = useQuery({
    queryKey: ['admin-buses'],
    queryFn: async () => {
      const { data, error } = await supabase.from('buses').select('*').order('name');
      if (error) throw error;
      return data as DbBus[];
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (bus: Partial<DbBus> & { name: string; registration_number: string }) => {
      if (editingBus) {
        const { error } = await supabase.from('buses').update(bus).eq('id', editingBus.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('buses').insert(bus);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-buses'] });
      toast.success(editingBus ? 'Bus updated' : 'Bus added');
      setDialogOpen(false);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('buses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-buses'] });
      toast.success('Bus removed');
    },
  });

  const openAdd = () => {
    setEditingBus(null);
    setFormName(''); setFormRegNum(''); setFormType('AC'); setFormSeats('40');
    setDialogOpen(true);
  };

  const openEdit = (bus: DbBus) => {
    setEditingBus(bus);
    setFormName(bus.name); setFormRegNum(bus.registration_number); setFormType(bus.bus_type); setFormSeats(String(bus.total_seats));
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formName || !formRegNum) { toast.error('Please fill all fields'); return; }
    upsertMutation.mutate({
      name: formName,
      registration_number: formRegNum,
      bus_type: formType,
      total_seats: parseInt(formSeats),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Manage Buses</h1>
            <p className="text-sm text-muted-foreground">{busList.length} buses in fleet</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAdd} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus className="h-4 w-4" /> Add Bus
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-heading">{editingBus ? 'Edit Bus' : 'Add New Bus'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input placeholder="Bus Name" value={formName} onChange={(e) => setFormName(e.target.value)} />
                <Input placeholder="Registration Number" value={formRegNum} onChange={(e) => setFormRegNum(e.target.value)} />
                <Select value={formType} onValueChange={setFormType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Volvo AC">Volvo AC</SelectItem>
                    <SelectItem value="AC Sleeper">AC Sleeper</SelectItem>
                    <SelectItem value="AC">AC</SelectItem>
                    <SelectItem value="Non-AC">Non-AC</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="number" placeholder="Total Seats" value={formSeats} onChange={(e) => setFormSeats(e.target.value)} />
                <Button onClick={handleSave} disabled={upsertMutation.isPending} className="w-full bg-primary text-primary-foreground">
                  {upsertMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {editingBus ? 'Update Bus' : 'Add Bus'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {busList.map((bus, i) => (
              <motion.div key={bus.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="shadow-soft">
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary"><BusIcon className="h-5 w-5" /></div>
                        <div>
                          <h3 className="font-heading font-bold text-foreground">{bus.name}</h3>
                          <p className="text-xs text-muted-foreground">{bus.registration_number}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{bus.bus_type}</Badge>
                    </div>
                    <div className="mb-3 flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{bus.total_seats} seats</span>
                      <Badge variant={bus.is_active ? 'default' : 'destructive'} className="text-xs">
                        {bus.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => openEdit(bus)}>
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Button>
                      <Button
                        variant="outline" size="sm"
                        className="gap-1 text-destructive hover:bg-destructive/10"
                        onClick={() => deleteMutation.mutate(bus.id)}
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

export default AdminBuses;
