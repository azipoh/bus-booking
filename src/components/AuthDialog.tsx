/**
 * Auth dialog: shows login/signup as a modal overlay so it doesn't push page content.
 */
import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bus, Mail, Lock, User, Phone, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9\s-]{7,20}$/;

// ADDED: Strong password regex patterns
const PASSWORD_RULES = {
  minLength: 8,
  hasUpperCase: /[A-Z]/,
  hasLowerCase: /[a-z]/,
  hasNumber: /\d/,
  hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/,
};

type Errors = Partial<Record<'email' | 'password' | 'confirmPassword' | 'fullName' | 'phone', string>>;
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
  const [mode, setMode] = useState<Mode>(initialMode);
  const isRegister = mode === 'signup';

  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // ADDED
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false); // ADDED
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // ADDED

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setTouched({});
      setSubmitted(false);
      setEmail('');
      setPassword('');
      setConfirmPassword(''); // ADDED
      setFullName('');
      setPhone('');
    }
  }, [open, initialMode]);

  // ADDED: Password strength validation function
  const validatePassword = (password: string): string | null => {
    if (!password) return 'Password is required';
    if (password.length < PASSWORD_RULES.minLength) {
      return `Password must be at least ${PASSWORD_RULES.minLength} characters`;
    }
    if (!PASSWORD_RULES.hasUpperCase.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!PASSWORD_RULES.hasLowerCase.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!PASSWORD_RULES.hasNumber.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!PASSWORD_RULES.hasSpecialChar.test(password)) {
      return 'Password must contain at least one special character';
    }
    return null;
  };

  const errors: Errors = useMemo(() => {
    const e: Errors = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!EMAIL_RE.test(email.trim())) e.email = 'Enter a valid email address';
    
    // UPDATED: Password validation for both login and signup
    if (!password) {
      e.password = 'Password is required';
    } else if (isRegister) {
      const passwordError = validatePassword(password);
      if (passwordError) e.password = passwordError;
    }
    
    // ADDED: Confirm password validation
    if (isRegister) {
      if (!confirmPassword) {
        e.confirmPassword = 'Please confirm your password';
      } else if (password !== confirmPassword) {
        e.confirmPassword = 'Passwords do not match';
      }
      
      if (!fullName.trim()) e.fullName = 'Full name is required';
      else if (fullName.trim().length < 2) e.fullName = 'Name must be at least 2 characters';
      if (phone && !PHONE_RE.test(phone.trim())) e.phone = 'Enter a valid phone number';
    }
    return e;
  }, [email, password, confirmPassword, fullName, phone, isRegister]);

  const showError = (field: keyof Errors) => (touched[field] || submitted) ? errors[field] : undefined;
  const markTouched = (field: string) => setTouched((t) => ({ ...t, [field]: true }));
  const inputCls = (hasError?: string) =>
    `h-11 bg-background pl-10 pr-10 ${hasError ? 'border-destructive focus-visible:ring-destructive' : ''}`;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (errors.email || errors.password) return;
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) toast.error(error.message);
    else {
      toast.success('Logged in successfully!');
      onOpenChange(false);
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

  // ADDED: Password strength indicator component
  const PasswordStrengthIndicator = ({ password }: { password: string }) => {
    if (!password) return null;
    
    const checks = [
      { label: '8+ characters', passed: password.length >= PASSWORD_RULES.minLength },
      { label: 'Uppercase letter', passed: PASSWORD_RULES.hasUpperCase.test(password) },
      { label: 'Lowercase letter', passed: PASSWORD_RULES.hasLowerCase.test(password) },
      { label: 'Number', passed: PASSWORD_RULES.hasNumber.test(password) },
      { label: 'Special character', passed: PASSWORD_RULES.hasSpecialChar.test(password) },
    ];

    const passedCount = checks.filter(c => c.passed).length;
    const strengthPercent = (passedCount / checks.length) * 100;
    
    let strengthColor = 'bg-destructive';
    if (passedCount >= 3) strengthColor = 'bg-yellow-500';
    if (passedCount >= 5) strengthColor = 'bg-green-500';

    return (
      <div className="mt-2 space-y-2">
        <div className="h-1.5 w-full rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all duration-300 ${strengthColor}`}
            style={{ width: `${strengthPercent}%` }}
          />
        </div>
        <div className="grid grid-cols-2 gap-1">
          {checks.map((check, i) => (
            <div key={i} className="flex items-center gap-1 text-xs">
              <div className={`h-1.5 w-1.5 rounded-full ${check.passed ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
              <span className={check.passed ? 'text-green-600' : 'text-muted-foreground'}>
                {check.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
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
              
              {/* UPDATED: Password field with show/hide toggle */}
              <div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password (min 8 chars, uppercase, number, special char)" 
                    className={inputCls(showError('password'))} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} 
                    onBlur={() => markTouched('password')} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FieldError message={showError('password')} />
                {/* ADDED: Password strength indicator (only shows when typing) */}
                {password && <PasswordStrengthIndicator password={password} />}
              </div>

              {/* ADDED: Confirm Password field */}
              <div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="Confirm Password" 
                    className={inputCls(showError('confirmPassword'))} 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    onBlur={() => markTouched('confirmPassword')} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FieldError message={showError('confirmPassword')} />
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
            By continuing, you agree to Moghamo's Terms & Privacy Policy.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;