/**
 * MyParcels page - shows the user's parcels with status tracking.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/currency';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Package, MapPin, Loader2, Clock, Truck, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-warning/10 text-warning border-warning/20' },
  in_transit: { label: 'In Transit', color: 'bg-info/10 text-info border-info/20' },
  delivered: { label: 'Delivered', color: 'bg-success/10 text-success border-success/20' },
};

interface Parcel {
  id: string;
  tracking_code: string;
  sender_name: string;
  recipient_name: string;
  recipient_phone: string;
  origin: string;
  destination: string;
  description: string;
  weight_kg: number;
  fare: number;
  status: string;
  created_at: string;
  updated_at: string;
}

const MyParcels = () => {
  const { user, loading: authLoading } = useAuth();

  const { data: parcels = [], isLoading } = useQuery({
    queryKey: ['my-parcels', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parcels')
        .select('*')
        .eq('sender_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as Parcel[]) || [];
    },
    enabled: !!user,
  });

  if (authLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (!user) return <Navigate to="/login" />;

  const filterParcels = (status?: string) =>
    status ? parcels.filter((p) => p.status === status) : parcels;

  const ParcelCard = ({ parcel, index }: { parcel: Parcel; index: number }) => {
    const sc = statusConfig[parcel.status] || statusConfig.pending;
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08 }}
        className="rounded-xl border border-border bg-card p-5 shadow-soft"
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="font-heading text-sm font-bold text-foreground">{parcel.tracking_code}</span>
          </div>
          <Badge className={`border ${sc.color} capitalize`}>{sc.label}</Badge>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" /> {parcel.origin}
          </div>
          <span className="text-muted-foreground">→</span>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" /> {parcel.destination}
          </div>
        </div>

        <div className="rounded-lg bg-muted p-3">
          <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Recipient</p>
              <p className="font-medium text-foreground">{parcel.recipient_name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Weight</p>
              <p className="font-medium text-foreground">{parcel.weight_kg} kg</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fare</p>
              <p className="font-heading font-bold text-accent">{formatCurrency(Number(parcel.fare))}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="font-medium text-foreground">{new Date(parcel.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {parcel.description && (
          <p className="mt-2 text-xs text-muted-foreground">{parcel.description}</p>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 font-heading text-3xl font-bold text-foreground">My Parcels</h1>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All ({parcels.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({filterParcels('pending').length})</TabsTrigger>
              <TabsTrigger value="in_transit">In Transit ({filterParcels('in_transit').length})</TabsTrigger>
              <TabsTrigger value="delivered">Delivered ({filterParcels('delivered').length})</TabsTrigger>
            </TabsList>

            {['all', 'pending', 'in_transit', 'delivered'].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-4">
                {filterParcels(tab === 'all' ? undefined : tab).length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    No {tab !== 'all' ? tab.replace('_', ' ') : ''} parcels found.
                  </div>
                ) : (
                  filterParcels(tab === 'all' ? undefined : tab).map((p, i) => (
                    <ParcelCard key={p.id} parcel={p} index={i} />
                  ))
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default MyParcels;
