import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building2, Users } from 'lucide-react';
import { Loader2 } from 'lucide-react';

const AdminBranchDetail = () => {
  const { branchId } = useParams<{ branchId: string }>();

  const { data: branch, isLoading: branchLoading } = useQuery({
    queryKey: ['admin-branch', branchId],
    queryFn: async () => {
      const { data, error } = await supabase.from('branches').select('*').eq('id', branchId).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: staff = [] } = useQuery({
    queryKey: ['admin-branch-staff', branchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*, auth.users(email, user_metadata)')
        .eq('branch_id', branchId);
      if (error) throw error;
      return data || [];
    },
  });

  if (branchLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Branch not found</p>
          <Link to="/admin"><Button className="mt-4">Back to Dashboard</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        <div className="mt-6 grid gap-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {branch.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium text-foreground">{branch.location}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium text-foreground">
                    {new Date(branch.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Staff Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              {staff.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">No staff assigned to this branch yet</p>
              ) : (
                <div className="space-y-3">
                  {staff.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between rounded-lg bg-muted p-3">
                      <div>
                        <p className="font-medium text-foreground">
                          {member.auth?.users?.user_metadata?.full_name || member.auth?.users?.email}
                        </p>
                        <p className="text-xs text-muted-foreground">{member.auth?.users?.email}</p>
                      </div>
                      <Badge variant="outline" className="capitalize">{member.role}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminBranchDetail;
