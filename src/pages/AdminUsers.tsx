/**
 * AdminUsers — admins create branch staff (managers & cashiers) and see existing staff.
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, Loader2, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
type Branch = Tables<'branches'>;
interface StaffRow {
  user_id: string;
  role: string;
  full_name: string | null;
  phone: string | null;
  branch_id: string | null;
}
const AdminUsers = () => {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'manager' | 'cashier' | ''>('');
  const [branchId, setBranchId] = useState('');
  const { data: branches = [] } = useQuery({
    queryKey: ['admin-branches'],
    queryFn: async () => {
      const { data, error } = await supabase.from('branches').select('*').order('name');
      if (error) throw error;
      return (data as Branch[]) || [];
    },
  });
  const branchName = (id: string | null) => branches.find((b) => b.id === id)?.name ?? '—';
  const { data: staff = [], isLoading } = useQuery({
    queryKey: ['admin-staff'],
    queryFn: async () => {
      const { data: roleRows, error } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('role', ['manager', 'cashier']);
      if (error) throw error;
      const ids = (roleRows ?? []).map((r) => r.user_id);
      if (ids.length === 0) return [] as StaffRow[];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, phone, branch_id')
        .in('id', ids);
      const profMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
      return (roleRows ?? []).map((r) => {
        const p: any = profMap.get(r.user_id) || {};
        return { user_id: r.user_id, role: r.role, full_name: p.full_name ?? null, phone: p.phone ?? null, branch_id: p.branch_id ?? null };
      }) as StaffRow[];
    },
  });
  const create = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: { email, password, full_name: fullName, phone, role, branch_id: branchId },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-staff'] });
      toast.success('Staff account created');
      setDialogOpen(false);
      setFullName(''); setEmail(''); setPhone(''); setPassword(''); setRole(''); setBranchId('');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to create staff account'),
  });
  const handleCreate = () => {
    if (!fullName || !email || !password || !role || !branchId) {
      toast.error('Fill all required fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    create.mutate();
  };
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Staff & Users</h1>
            <p className="text-sm text-muted-foreground">{staff.length} branch staff</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={branches.length === 0}
                title={branches.length === 0 ? 'Create a branch first' : undefined}
              >
                <UserPlus className="h-4 w-4" /> New Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-heading">Create Branch Staff</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Full Name *</label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Email *</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="staff@busgo.cm" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Phone</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+237..." />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Temporary Password *</label>
                  <Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Role *</label>
                    <Select value={role} onValueChange={(v) => setRole(v as 'manager' | 'cashier')}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="cashier">Cashier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Branch *</label>
                    <Select value={branchId} onValueChange={setBranchId}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleCreate} disabled={create.isPending} className="w-full bg-primary text-primary-foreground">
                  {create.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Staff Account
                </Button>
                <p className="text-xs text-muted-foreground">
                  Share the email and temporary password with the staff member. They can change it later.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : staff.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
            <Users className="mx-auto mb-3 h-8 w-8 opacity-40" />
            No branch staff yet. Create managers and cashiers and assign them to a branch.
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card shadow-soft">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Branch</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((s) => (
                  <TableRow key={`${s.user_id}-${s.role}`}>
                    <TableCell className="font-medium">{s.full_name || '—'}</TableCell>
                    <TableCell>{s.phone || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={s.role === 'manager' ? 'default' : 'secondary'} className="capitalize">{s.role}</Badge>
                    </TableCell>
                    <TableCell>{branchName(s.branch_id)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </motion.div>
        )}
      </div>
    </div>
  );
};
export default AdminUsers;
