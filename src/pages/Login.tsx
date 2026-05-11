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
          {/* Sign In / Sign Up tabs */}
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className={`rounded-md py-2 text-sm font-semibold transition-colors ${!isRegister ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className={`rounded-md py-2 text-sm font-semibold transition-colors ${isRegister ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Sign Up
            </button>
          </div>

          {isRegister ? (
            // Registration form
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Full Name" className="bg-background pl-10" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input type="email" placeholder="Email" className="bg-background pl-10" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input type="tel" placeholder="Phone" className="bg-background pl-10" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input type="password" placeholder="Password (min 6 chars)" className="bg-background pl-10" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-accent font-heading font-semibold text-accent-foreground shadow-accent hover:bg-accent/90">
                {loading ? 'Creating...' : 'Create Account'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <button type="button" onClick={() => setIsRegister(false)} className="font-medium text-accent hover:underline">
                  Sign In
                </button>
              </p>
            </form>
          ) : (
            // Login form (single form, no tabs - role is determined server-side)
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input type="email" placeholder="Email" className="bg-background pl-10" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input type="password" placeholder="Password" className="bg-background pl-10" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-primary font-heading font-semibold text-primary-foreground hover:bg-primary/90">
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
              <div className="text-center">
                <Link to="/forgot-password" className="text-sm font-medium text-accent hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <button type="button" onClick={() => setIsRegister(true)} className="font-medium text-accent hover:underline">
                  Sign Up
                </button>
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
