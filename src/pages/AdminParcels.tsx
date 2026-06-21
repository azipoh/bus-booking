/**
 * Admin Parcels page for managing all parcels and updating their status.
 * Uses server-side pagination so the list scales as parcels grow.
 * 
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/currency';
import { useDebounce } from '@/hooks/use-debounce';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Loader2 } from 'lucide-react';
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination';
import QueryError from '@/components/QueryError';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  in_transit: 'bg-info/10 text-info',
  delivered: 'bg-success/10 text-success',
};
const PAGE_SIZE = 15;


const AdminParcels = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

   const [page, setPage] = useState(0);
  const debouncedSearch = useDebounce(search.trim(), 350);
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ['admin-parcels', page, debouncedSearch],
    queryFn: async () => {
      let query = supabase
        .from('parcels')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (debouncedSearch) {
        const term = `%${debouncedSearch}%`;
        query = query.or(
          `tracking_code.ilike.${term},sender_name.ilike.${term},recipient_name.ilike.${term},origin.ilike.${term},destination.ilike.${term}`
        );
      }

      const { data, error, count } = await query.range(
        page * PAGE_SIZE,
        page * PAGE_SIZE + PAGE_SIZE - 1
      );

      if (error) throw error;
      return { parcels: data || [], count: count || 0 };
    },
    placeholderData: keepPreviousData,
  });
  const parcels = data?.parcels ?? [];
  const total = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

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

  const onSearchChange = (val: string) => {
    setSearch(val);
    setPage(0);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Manage Parcels</h1>
           <p className="text-sm text-muted-foreground">{total} parcels</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by tracking code, name, city..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-72 bg-background pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : isError ? (
          <QueryError message={(error as Error)?.message} onRetry={() => refetch()} />
        ) : (<>
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
                  {parcels.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                        No parcels found
                      </TableCell>
                    </TableRow>
                  ) : (
                    parcels.map((p) => (
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
                    ))
                  )}
                </TableBody>
                          </Table>
          </motion.div>
          
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Page {page + 1} of {totalPages}{isFetching ? ' · updating…' : ''}
              </p>
              <Pagination className="mx-0 w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      className={page === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      className={page >= totalPages - 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
          </>
        )}    
      </div>
    </div>
  );
};

export default AdminParcels;