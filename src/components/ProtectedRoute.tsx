/**
 * ProtectedRoute component that redirects unauthenticated users to login.
 * Supports admin-only routes and role-restricted routes.
 * Admins always have access. Other users need one of `allowedRoles`.
 */
import { Navigate } from 'react-router-dom';
import { useAuth, AppRole } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  requireAdmin?: boolean;
  /** Roles allowed in addition to admin (admin is always allowed). */
  allowedRoles?: AppRole[];
}

const ProtectedRoute = ({ children, requireAdmin = false, allowedRoles }: Props) => {
  const { user, isAdmin, roles, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />;

  if (allowedRoles && !isAdmin && !allowedRoles.some((r) => roles.includes(r))) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
