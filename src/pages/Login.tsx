/**
 * Login page with tabs for passenger and admin login.
 * Also includes a registration form with real authentication.
 */
import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Bus, Mail, Lock, User, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp } = useAuth();
  const [isRegister, setIsRegister] = useState(location.pathname === '/signup');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsRegister(location.pathname === '/signup');
  }, [location.pathname]);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Logged in successfully!');
      navigate('/');
    }
  };

  // Register handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(email, password, fullName, phone);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Registration successful! Please check your email to verify your account.');
      setIsRegister(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,hsl(var(--primary)/0.08),transparent_60%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-elevated ring-4 ring-primary/10">
              <Bus className="h-7 w-7 text-primary-foreground" />
            </div>
          </Link>
          <h1 className="mt-5 font-heading text-3xl font-bold tracking-tight text-foreground">
            {isRegister ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isRegister ? 'Join BusGo and start booking in minutes' : 'Sign in to continue your journey'}
          </p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/80 p-7 shadow-elevated backdrop-blur-sm">
          {/* Sign In / Sign Up tabs */}
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className={`rounded-lg py-2.5 text-sm font-semibold transition-all ${!isRegister ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className={`rounded-lg py-2.5 text-sm font-semibold transition-all ${isRegister ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Sign Up
            </button>
          </div>

          {isRegister ? (
            <motion.form
              key="register"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleRegister}
              className="space-y-3.5"
            >
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Full Name" className="h-11 bg-background pl-10" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="email" placeholder="Email" className="h-11 bg-background pl-10" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="tel" placeholder="Phone" className="h-11 bg-background pl-10" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="password" placeholder="Password (min 6 chars)" className="h-11 bg-background pl-10" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button type="submit" disabled={loading} className="h-11 w-full bg-accent font-heading font-semibold text-accent-foreground shadow-accent transition-transform hover:bg-accent/90 active:scale-[0.99]">
                {loading ? 'Creating…' : 'Create Account'}
              </Button>
              <p className="pt-1 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <button type="button" onClick={() => navigate('/login')} className="font-semibold text-accent hover:underline">
                  Sign In
                </button>
              </p>
            </motion.form>
          ) : (
            <motion.form
              key="login"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleLogin}
              className="space-y-3.5"
            >
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="email" placeholder="Email" className="h-11 bg-background pl-10" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="password" placeholder="Password" className="h-11 bg-background pl-10" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs font-medium text-accent hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Button type="submit" disabled={loading} className="h-11 w-full bg-primary font-heading font-semibold text-primary-foreground shadow-soft transition-transform hover:bg-primary/90 active:scale-[0.99]">
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
              <p className="pt-1 text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <button type="button" onClick={() => navigate('/signup')} className="font-semibold text-accent hover:underline">
                  Sign Up
                </button>
              </p>
            </motion.form>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing, you agree to BusGo's Terms & Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
