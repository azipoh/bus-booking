/**
 * ProtectedRoute component that redirects unauthenticated users to login.
 * Optionally checks for staff access.
 */
import { Navigate } from 'react-router-dom';
import { useAuth, type UserRole } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireStaff?: boolean;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, requireAdmin = false, requireStaff = false, allowedRoles }: Props) => {
  const { user, role, isAdmin, isStaff, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />;
  if (requireStaff && !isStaff) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
