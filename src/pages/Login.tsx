/**
 * Login page with tabs for passenger and admin login.
 * Also includes a registration form.
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bus, Mail, Lock, User, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const Login = () => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);

  // Login handler (simulated)
  const handleLogin = (e: React.FormEvent, role: 'passenger' | 'admin') => {
    e.preventDefault();
    toast.success(`Logged in as ${role}!`);
    navigate(role === 'admin' ? '/admin' : '/');
  };

  // Register handler (simulated)
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Registration successful! You can now log in.');
    setIsRegister(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Bus className="h-7 w-7 text-primary-foreground" />
            </div>
          </Link>
          <h1 className="mt-4 font-heading text-2xl font-bold text-foreground">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isRegister ? 'Sign up to start booking' : 'Sign in to your account'}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-elevated">
          {isRegister ? (
            // Registration form
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Full Name" className="bg-background pl-10" required />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input type="email" placeholder="Email" className="bg-background pl-10" required />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input type="tel" placeholder="Phone" className="bg-background pl-10" required />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input type="password" placeholder="Password" className="bg-background pl-10" required />
              </div>
              <Button type="submit" className="w-full bg-accent font-heading font-semibold text-accent-foreground shadow-accent hover:bg-accent/90">
                Create Account
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <button type="button" onClick={() => setIsRegister(false)} className="font-medium text-accent hover:underline">
                  Sign In
                </button>
              </p>
            </form>
          ) : (
            // Login tabs
            <Tabs defaultValue="passenger">
              <TabsList className="mb-4 w-full">
                <TabsTrigger value="passenger" className="flex-1">Passenger</TabsTrigger>
                <TabsTrigger value="admin" className="flex-1">Admin</TabsTrigger>
              </TabsList>

              {(['passenger', 'admin'] as const).map((role) => (
                <TabsContent key={role} value={role}>
                  <form onSubmit={(e) => handleLogin(e, role)} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="Email"
                        className="bg-background pl-10"
                        defaultValue={role === 'admin' ? 'admin@busgo.com' : ''}
                        required
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="Password"
                        className="bg-background pl-10"
                        defaultValue={role === 'admin' ? 'admin123' : ''}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full bg-primary font-heading font-semibold text-primary-foreground hover:bg-primary/90">
                      Sign In as {role === 'admin' ? 'Admin' : 'Passenger'}
                    </Button>
                  </form>
                </TabsContent>
              ))}

              <p className="mt-4 text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <button type="button" onClick={() => setIsRegister(true)} className="font-medium text-accent hover:underline">
                  Sign Up
                </button>
              </p>
            </Tabs>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
