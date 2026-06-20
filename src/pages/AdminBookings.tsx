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
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">All Bookings</h1>
            <p className="text-sm text-muted-foreground">{total} bookings found</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, PNR, email..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-64 bg-background pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Export
            </Button>
          </div>
        </div>

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
                  {bookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                        No bookings found
                      </TableCell>
                    </TableRow>
                  ) : (
                    bookings.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-heading font-semibold">{b.pnr}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{b.passenger_name}</p>
                            <p className="text-xs text-muted-foreground">{b.passenger_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{b.schedules.routes.origin} → {b.schedules.routes.destination}</TableCell>
                        <TableCell>{formatDate(b.schedules.departure_time)}</TableCell>
                        <TableCell className="text-sm">{b.schedules.buses.name}</TableCell>
                        <TableCell>{b.seat_numbers.join(', ')}</TableCell>
                        <TableCell className="font-heading font-bold">{formatCurrency(Number(b.total_fare))}</TableCell>
                        <TableCell>
                          <Badge className={`capitalize ${statusColors[b.status] || ''}`}>{b.status}</Badge>
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