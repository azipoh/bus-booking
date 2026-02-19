/**
 * SearchResults page displays available buses for a given route and date.
 * Reads query params (from, to, date) and filters mock schedules.
 */
import { useSearchParams, Link } from 'react-router-dom';
import { schedules } from '@/data/mockData';
import BusCard from '@/components/BusCard';
import SearchForm from '@/components/SearchForm';
import { ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const date = searchParams.get('date') || '';

  const [sortBy, setSortBy] = useState<'price' | 'departure' | 'rating'>('price');

  // Filter schedules matching the route (case-insensitive)
  const results = useMemo(() => {
    let filtered = schedules.filter(
      (s) =>
        s.route.source.toLowerCase() === from.toLowerCase() &&
        s.route.destination.toLowerCase() === to.toLowerCase()
    );

    // If no exact match, show all schedules as demo
    if (filtered.length === 0) filtered = schedules;

    // Sort
    return [...filtered].sort((a, b) => {
      if (sortBy === 'price') return a.fare - b.fare;
      if (sortBy === 'departure') return a.departureTime.localeCompare(b.departureTime);
      return b.bus.rating - a.bus.rating;
    });
  }, [from, to, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      {/* Search bar at top */}
      <div className="border-b border-border bg-card py-4">
        <div className="container mx-auto px-4">
          <SearchForm />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link to="/" className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to search
            </Link>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              {from} → {to}
            </h1>
            <p className="text-sm text-muted-foreground">
              {date} • {results.length} buses found
            </p>
          </div>

          {/* Sort options */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Sort by:</span>
            {(['price', 'departure', 'rating'] as const).map((s) => (
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

        {/* Results */}
        <div className="space-y-4">
          {results.map((schedule, i) => (
            <BusCard key={schedule.id} schedule={schedule} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
