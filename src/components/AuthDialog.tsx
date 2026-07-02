/**
 * Auth dialog: shows login/signup as a modal overlay so it doesn't push page content.
 */
import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bus, Mail, Lock, User, Phone, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9\s-]{7,20}$/;

type Errors = Partial<Record<'email' | 'password' | 'fullName' | 'phone', string>>;
type Mode = 'login' | 'signup';

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
      <AlertCircle className="h-3 w-3" />
      {message}
    </p>
  ) : null;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: Mode;
}

const AuthDialog = ({ open, onOpenChange, initialMode = 'login' }: Props) => {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>(initialMode);
  const isRegister = mode === 'signup';

  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setTouched({});
      setSubmitted(false);
    }
  }, [open, initialMode]);

  const errors: Errors = useMemo(() => {
    const e: Errors = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!EMAIL_RE.test(email.trim())) e.email = 'Enter a valid email address';
    if (!password) e.password = 'Password is required';
    else if (isRegister && password.length < 6) e.password = 'Password must be at least 6 characters';
    if (isRegister) {
      if (!fullName.trim()) e.fullName = 'Full name is required';
      else if (fullName.trim().length < 2) e.fullName = 'Name must be at least 2 characters';
      if (phone && !PHONE_RE.test(phone.trim())) e.phone = 'Enter a valid phone number';
    }
    return e;
  }, [email, password, fullName, phone, isRegister]);

  const showError = (field: keyof Errors) => (touched[field] || submitted) ? errors[field] : undefined;
  const markTouched = (field: string) => setTouched((t) => ({ ...t, [field]: true }));
  const inputCls = (hasError?: string) =>
    `h-11 bg-background pl-10 ${hasError ? 'border-destructive focus-visible:ring-destructive' : ''}`;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (errors.email || errors.password) return;
    setLoading(true);
    const { error, redirectTo } = await signIn(email, password);
    setLoading(false);
    if (error) toast.error(error.message);
    else {
      toast.success('Logged in successfully!');
      onOpenChange(false);
      navigate(redirectTo);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;
    setLoading(true);
    const { error } = await signUp(email, password, fullName, phone);
    setLoading(false);
    if (error) toast.error(error.message);
    else {
      toast.success('Registration successful! Please check your email to verify your account.');
      setMode('login');
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setTouched({});
    setSubmitted(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-border/70 bg-card/95 p-0 backdrop-blur-sm">
        <DialogTitle className="sr-only">{isRegister ? 'Create account' : 'Sign in'}</DialogTitle>
        <DialogDescription className="sr-only">
          {isRegister ? 'Create your BusGo account' : 'Sign in to your BusGo account'}
        </DialogDescription>

        <div className="p-7">
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-elevated ring-4 ring-primary/10">
              <Bus className="h-6 w-6 text-primary-foreground" />
            </div>
            <h2 className="mt-4 font-heading text-2xl font-bold tracking-tight text-foreground">
              {isRegister ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isRegister ? 'Join BusGo and start booking in minutes' : 'Sign in to continue your journey'}
            </p>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`rounded-lg py-2 text-sm font-semibold transition-all ${!isRegister ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`rounded-lg py-2 text-sm font-semibold transition-all ${isRegister ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
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
              noValidate
              className="space-y-3"
            >
              <div>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Full Name" className={inputCls(showError('fullName'))} value={fullName}
                    onChange={(e) => setFullName(e.target.value)} onBlur={() => markTouched('fullName')} />
                </div>
                <FieldError message={showError('fullName')} />
              </div>
              <div>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="email" placeholder="Email" className={inputCls(showError('email'))} value={email}
                    onChange={(e) => setEmail(e.target.value)} onBlur={() => markTouched('email')} />
                </div>
                <FieldError message={showError('email')} />
              </div>
              <div>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="tel" placeholder="Phone (optional)" className={inputCls(showError('phone'))} value={phone}
                    onChange={(e) => setPhone(e.target.value)} onBlur={() => markTouched('phone')} />
                </div>
                <FieldError message={showError('phone')} />
              </div>
              <div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="password" placeholder="Password (min 6 chars)" className={inputCls(showError('password'))} value={password}
                    onChange={(e) => setPassword(e.target.value)} onBlur={() => markTouched('password')} />
                </div>
                <FieldError message={showError('password')} />
              </div>
              <Button type="submit" disabled={loading} className="h-11 w-full bg-accent font-heading font-semibold text-accent-foreground shadow-accent hover:bg-accent/90">
                {loading ? 'Creating…' : 'Create Account'}
              </Button>
            </motion.form>
          ) : (
            <motion.form
              key="login"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleLogin}
              noValidate
              className="space-y-3"
            >
              <div>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="email" placeholder="Email" className={inputCls(showError('email'))} value={email}
                    onChange={(e) => setEmail(e.target.value)} onBlur={() => markTouched('email')} />
                </div>
                <FieldError message={showError('email')} />
              </div>
              <div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="password" placeholder="Password" className={inputCls(showError('password'))} value={password}
                    onChange={(e) => setPassword(e.target.value)} onBlur={() => markTouched('password')} />
                </div>
                <FieldError message={showError('password')} />
              </div>
              <div className="flex justify-end">
                <Link to="/forgot-password" onClick={() => onOpenChange(false)} className="text-xs font-medium text-accent hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Button type="submit" disabled={loading} className="h-11 w-full bg-primary font-heading font-semibold text-primary-foreground shadow-soft hover:bg-primary/90">
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
            </motion.form>
          )}

          <p className="mt-5 text-center text-xs text-muted-foreground">
            By continuing, you agree to BusGo's Terms & Privacy Policy.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
