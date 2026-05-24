/**
 * TrackParcel page - public tracking by tracking code.
 */
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Package, Search, MapPin, Loader2, CheckCircle2, Truck, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: 'Pending Pickup', color: 'bg-warning/10 text-warning border-warning/20', icon: Clock },
  in_transit: { label: 'In Transit', color: 'bg-info/10 text-info border-info/20', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-success/10 text-success border-success/20', icon: CheckCircle2 },
};

interface Parcel {
  tracking_code: string;
  origin: string;
  destination: string;
  weight_kg: number;
  status: string;
  created_at: string;
  updated_at: string;
}

const TrackParcel = () => {
  const [code, setCode] = useState('');
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) { toast.error('Enter a tracking code'); return; }

    setIsSearching(true);
    setSearched(true);
    try {
      const { data, error } = await supabase
        .rpc('track_parcel', { _tracking_code: code.trim().toUpperCase() })
        .maybeSingle();

      if (error) throw error;
      setParcel(data);
      if (!data) toast.error('No parcel found with that tracking code.');
    } catch (err: any) {
      toast.error(err.message || 'Search failed.');
    } finally {
      setIsSearching(false);
    }
  };

  const sc = parcel ? statusConfig[parcel.status] || statusConfig.pending : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Package className="h-7 w-7" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Track Your Parcel</h1>
            <p className="mt-1 text-muted-foreground">Enter your tracking code to see the current status</p>
          </div>

          <form onSubmit={handleTrack} className="mb-8 flex gap-3">
            <Input
              placeholder="Enter tracking code (e.g. PCL...)"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="h-12 bg-card text-base uppercase"
            />
            <Button type="submit" disabled={isSearching} className="h-12 gap-2 bg-accent px-6 font-heading font-semibold text-accent-foreground">
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Track
            </Button>
          </form>

          {searched && parcel && sc && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Status banner */}
              <div className={`flex items-center gap-3 rounded-xl border p-4 ${sc.color}`}>
                <sc.icon className="h-6 w-6" />
                <div>
                  <p className="font-heading font-bold">{sc.label}</p>
                  <p className="text-xs opacity-80">Last updated: {new Date(parcel.updated_at).toLocaleString()}</p>
                </div>
              </div>

              {/* Details */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-heading text-sm font-bold text-muted-foreground">Tracking Code</span>
                  <span className="font-heading text-lg font-bold tracking-wider text-foreground">{parcel.tracking_code}</span>
                </div>

                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">{parcel.origin}</span>
                  </div>
                  <span className="text-muted-foreground">→</span>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">{parcel.destination}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted p-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Weight</p>
                    <p className="font-medium text-foreground">{parcel.weight_kg} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="font-medium text-foreground">{sc?.label}</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
                <h3 className="mb-3 font-heading text-base font-bold text-foreground">Tracking Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 h-3 w-3 rounded-full bg-success" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Parcel Registered</p>
                      <p className="text-xs text-muted-foreground">{new Date(parcel.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  {(parcel.status === 'in_transit' || parcel.status === 'delivered') && (
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 h-3 w-3 rounded-full bg-info" />
                      <div>
                        <p className="text-sm font-medium text-foreground">In Transit</p>
                        <p className="text-xs text-muted-foreground">Parcel is on the way to {parcel.destination}</p>
                      </div>
                    </div>
                  )}
                  {parcel.status === 'delivered' && (
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 h-3 w-3 rounded-full bg-success" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Delivered</p>
                        <p className="text-xs text-muted-foreground">{new Date(parcel.updated_at).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {searched && !parcel && !isSearching && (
            <div className="py-12 text-center text-muted-foreground">
              No parcel found. Please check your tracking code and try again.
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TrackParcel;
