/**
 * SearchResults page displays available buses for a given route and date.
 * Queries the real database for schedules joined with buses and routes.
 */
import { useSearchParams, Link } from 'react-router-dom';
import SearchForm from '@/components/SearchForm';
import { ArrowLeft, SlidersHorizontal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ScheduleWithDetails } from '@/lib/scheduleHelpers';
import { formatTime, calcDuration } from '@/lib/scheduleHelpers';
import BusCard from '@/components/BusCard';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const date = searchParams.get('date') || '';

  const [sortBy, setSortBy] = useState<'price' | 'departure' | 'rating'>('price');

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ['schedules', from, to, date],
    queryFn: async () => {
      // Only show schedules departing at least 30 min from now
      const minDeparture = new Date(Date.now() + 30 * 60 * 1000).toISOString();

      let query = supabase
        .from('schedules')
        .select('*, buses!inner(*), routes!inner(*)')
        .eq('status', 'active')
        .gt('departure_time', minDeparture);

      if (from) query = query.ilike('routes.origin', `%${from}%`);
      if (to) query = query.ilike('routes.destination', `%${to}%`);
      if (date) {
        query = query.gte('departure_time', `${date}T00:00:00`).lt('departure_time', `${date}T23:59:59`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as unknown as ScheduleWithDetails[]) || [];
    },
  });

  const sorted = useMemo(() => {
    return [...schedules].sort((a, b) => {
      if (sortBy === 'price') return a.fare - b.fare;
      if (sortBy === 'departure') return a.departure_time.localeCompare(b.departure_time);
      return 0; // no rating in DB yet
    });
  }, [schedules, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card py-4">
        <div className="container mx-auto px-4">
          <SearchForm />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link to="/" className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to search
            </Link>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              {from} → {to}
            </h1>
            <p className="text-sm text-muted-foreground">
              {date} • {sorted.length} buses found
            </p>
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Sort by:</span>
            {(['price', 'departure'] as const).map((s) => (
              <Badge
                key={s}
                variant={sortBy === s ? 'default' : 'secondary'}
                className="cursor-pointer capitalize"
                onClick={() => setSortBy(s)}
              >
                {s}
              </Badge>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            No buses found for this route and date.
          </div>
        ) : (
          <div className="space-y-4">
            {sorted.map((schedule, i) => (
              <BusCard key={schedule.id} schedule={schedule} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
