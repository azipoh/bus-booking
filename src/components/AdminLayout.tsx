/**
 * Layout wrapper for admin pages: a vertical, hidden-by-default sidebar
 * plus a toggle button to reveal it.
 */
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: Props) => {
  const { isAdmin, isManager } = useAuth();
  const panelLabel = isAdmin ? 'Admin Panel' : isManager ? 'Manager Panel' : 'Staff Panel';

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-[calc(100vh-4rem)] w-full">
        <AdminSidebar />
        <div className="flex-1">
          <header className="flex h-12 items-center gap-2 border-b border-border bg-card/50 px-4">
            <SidebarTrigger />
            <span className="font-heading text-sm font-semibold text-muted-foreground">
              {panelLabel}
            </span>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
