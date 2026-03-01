import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    // Check if we have the recovery token in the URL hash
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setValid(true);
    } else {
      // Also listen for auth state change for recovery
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setValid(true);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password updated successfully!');
      navigate('/');
    }
  };

  if (!valid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-center">
          <p className="text-muted-foreground">Invalid or expired reset link.</p>
          <Button onClick={() => navigate('/forgot-password')} className="mt-4">
            Request new link
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Bus className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="mt-4 font-heading text-2xl font-bold text-foreground">Set New Password</h1>
          <p className="mt-1 text-sm text-muted-foreground">Enter your new password below</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-elevated">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input type="password" placeholder="New password (min 6 chars)" className="bg-background pl-10" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input type="password" placeholder="Confirm new password" className="bg-background pl-10" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-primary font-heading font-semibold text-primary-foreground hover:bg-primary/90">
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
