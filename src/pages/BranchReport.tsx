/**
 * Manager Branch Report — managers view a performance summary for their own branch:
 * schedules, tickets sold, ticket revenue, and parcels.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/currency';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Ticket, Coins, Package, Loader2, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const BranchReport = () => {
  const { branchId } = useAuth();

  const { data: branch } = useQuery({
    queryKey: ['my-branch', branchId],
    enabled: !!branchId,
    queryFn: async () => {
      const { data } = await supabase.from('branches').select('*').eq('id', branchId!).maybeSingle();
      return data;
    },
  });

  const { data: report, isLoading } = useQuery({
    queryKey: ['branch-report', branchId],
    enabled: !!branchId,
    queryFn: async () => {
      const { data: schedules } = await supabase
        .from('schedules')
        .select('id')
        .eq('branch_id', branchId!);
      const scheduleIds = (schedules ?? []).map((s) => s.id);

      let tickets = 0;
      let revenue = 0;
      if (scheduleIds.length > 0) {
        const { data: bookings } = await supabase
          .from('bookings')
          .select('total_fare, seat_numbers, status')
          .in('schedule_id', scheduleIds);
        (bookings ?? []).forEach((b: any) => {
          if (b.status === 'cancelled') return;
          tickets += Array.isArray(b.seat_numbers) ? b.seat_numbers.length : 1;
          revenue += Number(b.total_fare) || 0;
        });
      }

      const { data: parcels } = await supabase
        .from('parcels')
        .select('fare')
        .eq('branch_id', branchId!);
      const parcelCount = (parcels ?? []).length;
      const parcelRevenue = (parcels ?? []).reduce((sum: number, p: any) => sum + (Number(p.fare) || 0), 0);

      return {
        schedules: scheduleIds.length,
        tickets,
        revenue,
        parcelCount,
        parcelRevenue,
      };
    },
  });

  if (!branchId) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
        You are not assigned to a branch yet. Ask an administrator to assign you to one.
      </div>
    );
  }

  const stats = [
    { label: 'Trips Scheduled', value: report?.schedules ?? 0, icon: Calendar, tone: 'text-primary bg-primary/10' },
    { label: 'Tickets Sold', value: report?.tickets ?? 0, icon: Ticket, tone: 'text-info bg-info/10' },
    { label: 'Ticket Revenue', value: formatCurrency(report?.revenue ?? 0), icon: Coins, tone: 'text-success bg-success/10' },
    { label: 'Parcels', value: report?.parcelCount ?? 0, icon: Package, tone: 'text-accent bg-accent/10' },
    { label: 'Parcel Revenue', value: formatCurrency(report?.parcelRevenue ?? 0), icon: Coins, tone: 'text-warning bg-warning/10' },
    { label: 'Total Revenue', value: formatCurrency((report?.revenue ?? 0) + (report?.parcelRevenue ?? 0)), icon: BarChart3, tone: 'text-primary bg-primary/10' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="font-heading text-3xl font-bold text-foreground">Manager Branch Report</h1>
          <p className="text-sm text-muted-foreground">
            {branch ? `${branch.name} — ${branch.city}` : 'Your branch performance summary'}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="shadow-soft">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.tone}`}>
                      <s.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{s.label}</p>
                      <p className="font-heading text-2xl font-bold text-foreground">{s.value}</p>
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

export default BranchReport;
