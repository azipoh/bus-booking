/**
 * AdminBranches — admins create and manage company branches (offices).
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Building2, MapPin, Phone, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

type Branch = Tables<'branches'>;

const AdminBranches = () => {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);

  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [isActive, setIsActive] = useState(true);

  const { data: branches = [], isLoading } = useQuery({
    queryKey: ['admin-branches'],
    queryFn: async () => {
      const { data, error } = await supabase.from('branches').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data as Branch[]) || [];
    },
  });

  const upsert = useMutation({
    mutationFn: async () => {
      const payload = { name, city, address: address || null, phone: phone || null, is_active: isActive };
      if (editing) {
        const { error } = await supabase.from('branches').update(payload).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('branches').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-branches'] });
      toast.success(editing ? 'Branch updated' : 'Branch created');
      setDialogOpen(false);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('branches').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-branches'] });
      toast.success('Branch deleted');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const openAdd = () => {
    setEditing(null);
    setName(''); setCity(''); setAddress(''); setPhone(''); setIsActive(true);
    setDialogOpen(true);
  };

  const openEdit = (b: Branch) => {
    setEditing(b);
    setName(b.name); setCity(b.city); setAddress(b.address || ''); setPhone(b.phone || ''); setIsActive(b.is_active);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!name || !city) { toast.error('Name and city are required'); return; }
    upsert.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Branches</h1>
            <p className="text-sm text-muted-foreground">{branches.length} branch(es)</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAdd} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus className="h-4 w-4" /> New Branch
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-heading">{editing ? 'Edit Branch' : 'Create Branch'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Branch Name *</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Douala Central" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">City *</label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Douala" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Address</label>
                  <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street / landmark" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Phone</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+237..." />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <span className="text-sm text-foreground">Active</span>
                  <Switch checked={isActive} onCheckedChange={setIsActive} />
                </div>
                <Button onClick={handleSave} disabled={upsert.isPending} className="w-full bg-primary text-primary-foreground">
                  {upsert.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editing ? 'Update Branch' : 'Create Branch'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : branches.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
            No branches yet. Create your first branch to start assigning staff.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {branches.map((b, i) => (
              <motion.div key={b.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="shadow-soft">
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <h3 className="font-heading font-bold text-foreground">{b.name}</h3>
                      </div>
                      <Badge variant={b.is_active ? 'default' : 'secondary'}>{b.is_active ? 'Active' : 'Inactive'}</Badge>
                    </div>
                    <div className="mb-4 space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> {b.city}{b.address ? ` — ${b.address}` : ''}</div>
                      {b.phone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {b.phone}</div>}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => openEdit(b)}>
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Button>
                      <Button
                        variant="outline" size="sm"
                        className="gap-1 text-destructive hover:bg-destructive/10"
                        onClick={() => { if (confirm('Delete this branch?')) del.mutate(b.id); }}
                        disabled={del.isPending}
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

export default AdminBranches;
