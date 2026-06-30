/**
 * Authentication context providing user session state,
 * login, signup, and logout functions throughout the app.
 */
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'passenger' | 'admin' | 'cashier' | 'manager';

export const normalizeRole = (role?: string | null): UserRole => {
  const normalized = (role ?? 'passenger').trim().toLowerCase();
  if (normalized === 'admin') return 'admin';
  if (normalized === 'cashier') return 'cashier';
  if (normalized === 'manager') return 'manager';
  return 'passenger';
};

export const isStaffRole = (role?: string | null) => {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === 'admin' || normalizedRole === 'cashier' || normalizedRole === 'manager';
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: UserRole;
  isAdmin: boolean;
  isStaff: boolean;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; isAdmin: boolean; isStaff: boolean; role: UserRole }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>('passenger');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStaff, setIsStaff] = useState(false);

  const checkUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to load user role:', error);
      const fallback = { role: 'passenger' as UserRole, isAdmin: false, isStaff: false };
      setRole(fallback.role);
      setIsAdmin(fallback.isAdmin);
      setIsStaff(fallback.isStaff);
      return fallback;
    }

    const roles = (data ?? []).map((entry) => normalizeRole(entry.role));
    const normalizedRole = roles.includes('admin')
      ? 'admin'
      : roles.includes('manager')
        ? 'manager'
        : roles.includes('cashier')
          ? 'cashier'
          : 'passenger';

    const result = {
      role: normalizedRole,
      isAdmin: normalizedRole === 'admin',
      isStaff: isStaffRole(normalizedRole),
    };

    setRole(result.role);
    setIsAdmin(result.isAdmin);
    setIsStaff(result.isStaff);
    return result;
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => {
            void checkUserRole(session.user.id);
          }, 0);
        } else {
          setRole('passenger');
          setIsAdmin(false);
          setIsStaff(false);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        void checkUserRole(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone: phone || '' },
        emailRedirectTo: window.location.origin,
      },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    let result = { error: error as Error | null, isAdmin: false, isStaff: false, role: 'passenger' as UserRole };

    if (!error && data.session?.user) {
      result = await checkUserRole(data.session.user.id);
    }

    return result;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole('passenger');
    setIsAdmin(false);
    setIsStaff(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, role, isAdmin, isStaff, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
