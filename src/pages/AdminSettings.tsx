/**
 * Admin Settings page for changing password and viewing profile.
 */
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, User, Mail, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const AdminSettings = () => {
  const { user } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 font-heading text-3xl font-bold text-foreground">Admin Settings</h1>

        <div className="space-y-6">
          {/* Profile Info */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="shadow-soft">
              <CardHeader><CardTitle className="font-heading text-base">Profile Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Full Name</p>
                    <p className="font-medium text-foreground">{user?.user_metadata?.full_name || 'Admin'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground">{user?.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Change Password */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="shadow-soft">
              <CardHeader><CardTitle className="font-heading text-base">Change Password</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="New Password (min 6 chars)"
                      className="bg-background pl-10"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="Confirm New Password"
                      className="bg-background pl-10"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Default Credentials Notice */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-warning/30 bg-warning/5 shadow-soft">
              <CardContent className="p-5">
                <p className="text-sm font-medium text-warning">⚠️ Security Reminder</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  If you're using the default admin credentials, please change your password immediately for security.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
