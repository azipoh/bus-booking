/**
 * SearchForm component - allows passengers to search for buses
 * by source, destination, and travel date.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, ArrowRightLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cities } from '@/data/mockData';
import { motion } from 'framer-motion';

const SearchForm = () => {
  const navigate = useNavigate();
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('2026-02-20');
  const [showSourceSuggestions, setShowSourceSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);

  // Filter cities based on input
  const filteredSourceCities = cities.filter(
    (c) => c.toLowerCase().includes(source.toLowerCase()) && c !== destination
  );
  const filteredDestCities = cities.filter(
    (c) => c.toLowerCase().includes(destination.toLowerCase()) && c !== source
  );

  // Swap source and destination
  const handleSwap = () => {
    setSource(destination);
    setDestination(source);
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (source && destination && date) {
      navigate(`/search?from=${encodeURIComponent(source)}&to=${encodeURIComponent(destination)}&date=${date}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="flex flex-col gap-3 rounded-2xl bg-card p-4 shadow-elevated md:flex-row md:items-end md:p-6">
        {/* Source */}
        <div className="relative flex-1">
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> From
          </label>
          <Input
            placeholder="Enter city"
            value={source}
            onChange={(e) => { setSource(e.target.value); setShowSourceSuggestions(true); }}
            onFocus={() => setShowSourceSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSourceSuggestions(false), 200)}
            className="h-12 border-border bg-background text-base"
          />
          {showSourceSuggestions && source && filteredSourceCities.length > 0 && (
            <div className="absolute top-full z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-border bg-card shadow-elevated">
              {filteredSourceCities.slice(0, 6).map((city) => (
                <button
                  key={city}
                  type="button"
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted"
                  onMouseDown={() => { setSource(city); setShowSourceSuggestions(false); }}
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Swap button */}
        <motion.button
          type="button"
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.3 }}
          onClick={handleSwap}
          className="flex h-12 w-12 shrink-0 items-center justify-center self-end rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted md:mb-0"
        >
          <ArrowRightLeft className="h-4 w-4" />
        </motion.button>

        {/* Destination */}
        <div className="relative flex-1">
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> To
          </label>
          <Input
            placeholder="Enter city"
            value={destination}
            onChange={(e) => { setDestination(e.target.value); setShowDestSuggestions(true); }}
            onFocus={() => setShowDestSuggestions(true)}
            onBlur={() => setTimeout(() => setShowDestSuggestions(false), 200)}
            className="h-12 border-border bg-background text-base"
          />
          {showDestSuggestions && destination && filteredDestCities.length > 0 && (
            <div className="absolute top-full z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-border bg-card shadow-elevated">
              {filteredDestCities.slice(0, 6).map((city) => (
                <button
                  key={city}
                  type="button"
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted"
                  onMouseDown={() => { setDestination(city); setShowDestSuggestions(false); }}
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date */}
        <div className="flex-1">
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" /> Travel Date
          </label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-12 border-border bg-background text-base"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Search button */}
        <Button
          type="submit"
          disabled={!source || !destination}
          className="h-12 gap-2 bg-accent px-8 font-heading text-base font-semibold text-accent-foreground shadow-accent hover:bg-accent/90"
        >
          <Search className="h-4 w-4" />
          Search Buses
        </Button>
      </div>
    </form>
  );
};

export default SearchForm;
