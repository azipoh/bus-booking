import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Loader2 } from 'lucide-react';

const ManagerBranch = () => {
  const { data: branches = [], isLoading } = useQuery({
    queryKey: ['manager-branches'],
    queryFn: async () => {
      const { data, error } = await supabase.from('branches').select('*').order('name');
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-foreground">Branch Overview</h1>
        <p className="text-sm text-muted-foreground">Track the branch details assigned to this manager.</p>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {branches.map((branch: any) => (
            <Card key={branch.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{branch.name}</span>
                  <Badge variant="outline">{branch.location}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" /> Branch is ready for schedule and report management.
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManagerBranch;
