/**
 * Authentication context providing user session state,
 * login, signup, logout, plus role & branch info throughout the app.
 */
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'manager' | 'cashier' | 'user';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** true while the signed-in user's roles/branch are still being fetched */
  rolesLoading: boolean;
  roles: AppRole[];
  branchId: string | null;
  isAdmin: boolean;
  isManager: boolean;
  isCashier: boolean;
  /** admin, manager or cashier — anyone who can access the staff panel */
  isStaff: boolean;
  /** the best landing page for the current user's role */
  panelHome: string;
  refreshRoles: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; redirectTo: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [branchId, setBranchId] = useState<string | null>(null);

  // Load the user's roles and branch assignment.
  // Roles and branch are fetched independently so a failure in one
  // (e.g. a database missing the branch_id column) never blocks the other.
  const loadRolesAndBranch = useCallback(async (userId: string): Promise<AppRole[]> => {
    setRolesLoading(true);
    let loadedRoles: AppRole[] = [];
    try {
      for (let attempt = 0; attempt < 3; attempt++) {
        const { data: roleRows, error: roleErr } = await supabase
          .from('user_roles').select('role').eq('user_id', userId);

        if (!roleErr && roleRows && roleRows.length > 0) {
          loadedRoles = roleRows.map((r) => r.role) as AppRole[];
          break;
        }

        if (roleErr) console.error('Failed to load roles:', roleErr.message);
        if (attempt < 2) await new Promise((res) => setTimeout(res, 250));
      }

      setRoles(loadedRoles);

      try {
        const { data: profile } = await supabase
          .from('profiles').select('branch_id').eq('id', userId).maybeSingle();
        setBranchId((profile as { branch_id: string | null } | null)?.branch_id ?? null);
      } catch (err) {
        console.error('Failed to load branch:', err);
        setBranchId(null);
      }
    } finally {
      setRolesLoading(false);
    }

    return loadedRoles;
  }, []);

  const refreshRoles = useCallback(async () => {
    if (user) await loadRolesAndBranch(user.id);
  }, [user, loadRolesAndBranch]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Defer to avoid Supabase client deadlock inside the callback
        setTimeout(() => loadRolesAndBranch(session.user.id), 0);
      } else {
        setRoles([]);
        setBranchId(null);
        setRolesLoading(false);
      }
      setLoading(false);
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadRolesAndBranch(session.user.id);
      } else {
        setRolesLoading(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadRolesAndBranch]);

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
    if (error || !data.user) return { error: error as Error | null, redirectTo: '/' };

    // Load the user's roles immediately so we can redirect staff members correctly.
    const userRoles = await loadRolesAndBranch(data.user.id);
    const redirectTo = userRoles.includes('admin')
      ? '/admin'
      : userRoles.includes('manager')
        ? '/admin'
        : userRoles.includes('cashier')
          ? '/admin/parcels'
          : '/';
    return { error: null, redirectTo };
  };


  const signOut = async () => {
    await supabase.auth.signOut();
    setRoles([]);
    setBranchId(null);
  };

  const isAdmin = roles.includes('admin');
  const isManager = roles.includes('manager');
  const isCashier = roles.includes('cashier');
  const isStaff = isAdmin || isManager || isCashier;
  const panelHome = isAdmin ? '/admin' : isManager ? '/admin' : isCashier ? '/admin/parcels' : '/';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        rolesLoading,
        roles,
        branchId,
        isAdmin,
        isManager,
        isCashier,
        isStaff,
        panelHome,
        refreshRoles,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
