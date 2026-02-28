/**
 * Admin Parcels page for managing all parcels and updating their status.
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/currency';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Loader2, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  in_transit: 'bg-info/10 text-info',
  delivered: 'bg-success/10 text-success',
};

const AdminParcels = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: parcels = [], isLoading } = useQuery({
    queryKey: ['admin-parcels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parcels')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('parcels').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-parcels'] });
      toast.success('Parcel status updated');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const filtered = parcels.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.tracking_code.toLowerCase().includes(q) ||
      p.sender_name.toLowerCase().includes(q) ||
      p.recipient_name.toLowerCase().includes(q) ||
      p.origin.toLowerCase().includes(q) ||
      p.destination.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Manage Parcels</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} parcels</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by tracking code, name, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-72 bg-background pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card shadow-soft">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking Code</TableHead>
                  <TableHead>Sender</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Fare</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-heading font-semibold">{p.tracking_code}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{p.sender_name}</p>
                        <p className="text-xs text-muted-foreground">{p.sender_phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{p.recipient_name}</p>
                        <p className="text-xs text-muted-foreground">{p.recipient_phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>{p.origin} → {p.destination}</TableCell>
                    <TableCell>{p.weight_kg} kg</TableCell>
                    <TableCell className="font-heading font-bold">{formatCurrency(Number(p.fare))}</TableCell>
                    <TableCell>
                      <Badge className={`capitalize ${statusColors[p.status] || ''}`}>
                        {p.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={p.status}
                        onValueChange={(val) => updateStatusMutation.mutate({ id: p.id, status: val })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_transit">In Transit</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                        </SelectContent>
                      </Select>
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

export default AdminParcels;
