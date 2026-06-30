import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Loader2, Building2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

const AdminBranches = () => {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [managerName, setManagerName] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [managerPassword, setManagerPassword] = useState('');
  const [cashierName, setCashierName] = useState('');
  const [cashierEmail, setCashierEmail] = useState('');
  const [cashierPassword, setCashierPassword] = useState('');

  const { data: branches = [], isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data, error } = await supabase.from('branches').select('*').order('name');
      if (error) throw error;
      return data || [];
    },
  });

  useEffect(() => {
    const ensureTable = async () => {
      const { error } = await supabase.from('branches').select('id').limit(1);
      if (error) {
        await supabase.from('branches').insert({ name: 'Main Branch', location: 'Douala' });
      }
    };
    void ensureTable();
  }, []);

  const createBranchMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.from('branches').insert({ name, location }).select('id').single();
      if (error) throw error;
      return data;
    },
    onSuccess: async (branch) => {
      toast.success('Branch created');
      if (managerEmail && managerPassword) {
        const { data: managerUser, error: managerError } = await supabase.auth.signUp({
          email: managerEmail,
          password: managerPassword,
          options: { data: { full_name: managerName || managerEmail } },
        });
        if (managerError) throw managerError;
        if (managerUser.user?.id) {
          const { error: managerRoleError } = await supabase.from('user_roles').insert({ user_id: managerUser.user.id, role: 'manager', branch_id: branch.id });
          if (managerRoleError) throw managerRoleError;
        }
      }
      if (cashierEmail && cashierPassword) {
        const { data: cashierUser, error: cashierError } = await supabase.auth.signUp({
          email: cashierEmail,
          password: cashierPassword,
          options: { data: { full_name: cashierName || cashierEmail } },
        });
        if (cashierError) throw cashierError;
        if (cashierUser.user?.id) {
          const { error: cashierRoleError } = await supabase.from('user_roles').insert({ user_id: cashierUser.user.id, role: 'cashier', branch_id: branch.id });
          if (cashierRoleError) throw cashierRoleError;
        }
      }
      setName('');
      setLocation('');
      setManagerName('');
      setManagerEmail('');
      setManagerPassword('');
      setCashierName('');
      setCashierEmail('');
      setCashierPassword('');
      qc.invalidateQueries({ queryKey: ['branches'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Branch Management</h1>
          <p className="text-sm text-muted-foreground">Create branches and assign manager or cashier users.</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Create Branch</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input placeholder="Branch name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
            <Input placeholder="Manager full name" value={managerName} onChange={(e) => setManagerName(e.target.value)} />
            <Input placeholder="Manager email" value={managerEmail} onChange={(e) => setManagerEmail(e.target.value)} />
            <Input placeholder="Manager password" type="password" value={managerPassword} onChange={(e) => setManagerPassword(e.target.value)} />
            <Input placeholder="Cashier full name" value={cashierName} onChange={(e) => setCashierName(e.target.value)} />
            <Input placeholder="Cashier email" value={cashierEmail} onChange={(e) => setCashierEmail(e.target.value)} />
            <Input placeholder="Cashier password" type="password" value={cashierPassword} onChange={(e) => setCashierPassword(e.target.value)} />
          </div>
          <Button onClick={() => createBranchMutation.mutate()} disabled={createBranchMutation.isPending || !name || !location}>
            {createBranchMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Create Branch
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : branches.map((branch: any) => (
          <Card key={branch.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{branch.name}</span>
                <Badge variant="outline">{branch.location}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><UserPlus className="h-4 w-4" /> Manager and cashier assignment can be managed from this branch view.</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminBranches;
