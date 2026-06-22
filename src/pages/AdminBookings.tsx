/**
 * Uses server-side pagination so the list scales as bookings grow.
 */
 
import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { BookingWithDetails } from '@/lib/scheduleHelpers';
import { formatDate } from '@/lib/scheduleHelpers';
import { formatCurrency } from '@/lib/currency';
import { useDebounce } from '@/hooks/use-debounce';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination';
import QueryError from '@/components/QueryError';
import { motion } from 'framer-motion';

const statusColors: Record<string, string> = {
  confirmed: 'bg-success/10 text-success',
  completed: 'bg-info/10 text-info',
  cancelled: 'bg-destructive/10 text-destructive',
  pending: 'bg-warning/10 text-warning',
};

const PAGE_SIZE = 15;

const AdminBookings = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const debouncedSearch = useDebounce(search.trim(), 350);

   const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ['admin-bookings', page, debouncedSearch],
    queryFn: async () => {
      let query = supabase
        .from('bookings')
        select('*, schedules(*, buses(*), routes(*))', { count: 'exact' })
        .order('booked_at', { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
      if (debouncedSearch) {
        const term = `%${debouncedSearch}%`;
        query = query.or(`passenger_name.ilike.${term},pnr.ilike.${term},passenger_email.ilike.${term}`);
      }
      const { data, error, count } = await query;

      if (error) throw error;
      return {
        bookings: (data as unknown as BookingWithDetails[]) || [],
        count: count || 0,
      };
    },
  });

  const bookings = data?.bookings ?? [];
  const total = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const onSearchChange = (val: string) => {
    setSearch(val);
    setPage(0);
  };


  return (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto px-4 py-8">
      {/* ... rest of your content ... */}
      
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
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
                {/* ... table body content ... */}
              </TableBody>
            </Table>
          </motion.div>
          {/* ... pagination ... */}
        </>
      )}
    </div>
  </div>
); // 