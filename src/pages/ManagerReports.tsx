import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Loader2 } from 'lucide-react';

const ManagerReports = () => {
  const { data: parcels = [], isLoading } = useQuery({
    queryKey: ['manager-reports'],
    queryFn: async () => {
      const { data, error } = await supabase.from('parcels').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const total = parcels.length;
  const delivered = parcels.filter((item: any) => item.status === 'delivered').length;
  const inTransit = parcels.filter((item: any) => item.status === 'in_transit').length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-foreground">Branch Reports</h1>
        <p className="text-sm text-muted-foreground">A simple branch-level overview for managers.</p>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Total Parcels</CardTitle>
            </CardHeader>
            <CardContent><div className="text-3xl font-bold">{total}</div></CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Delivered</CardTitle>
            </CardHeader>
            <CardContent><div className="text-3xl font-bold text-success">{delivered}</div></CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>In Transit</CardTitle>
            </CardHeader>
            <CardContent><div className="text-3xl font-bold text-info">{inTransit}</div></CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ManagerReports;
