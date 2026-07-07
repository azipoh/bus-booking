/**
 * Vertical, collapsible sidebar for the staff panel.
 * Links are shown based on the signed-in user's role.
 */
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Bus, Calendar, Ticket, Package, Settings,
  Building2, Users, BarChart3,
} from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';

type Link = { to: string; label: string; icon: typeof Bus };

const AdminSidebar = () => {
  const { pathname } = useLocation();
  const { isAdmin, isManager, isCashier } = useAuth();
  const { setOpenMobile } = useSidebar();

  const links: Link[] = [];
  if (isAdmin) {
    links.push(
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/admin/branches', label: 'Branches', icon: Building2 },
      { to: '/admin/users', label: 'Staff & Users', icon: Users },
      { to: '/admin/buses', label: 'Buses', icon: Bus },
      { to: '/admin/schedules', label: 'Schedules', icon: Calendar },
      { to: '/admin/bookings', label: 'Bookings', icon: Ticket },
      { to: '/admin/parcels', label: 'Parcels', icon: Package },
      { to: '/admin/send-parcel', label: 'Register Parcel', icon: Package },
      { to: '/admin/settings', label: 'Settings', icon: Settings },
    );
  } else {
    if (isManager) {
      links.push(
        { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/admin/schedules', label: 'Schedules', icon: Calendar },
        { to: '/admin/buses', label: 'Buses', icon: Bus },
        { to: '/admin/branch-report', label: 'Branch Report', icon: BarChart3 },
        { to: '/admin/parcels', label: 'Parcels', icon: Package },
      );
    }
    if (isCashier) {
      links.push(
        { to: '/admin/send-parcel', label: 'Register Parcel', icon: Package },
        { to: '/admin/parcels', label: 'Parcels', icon: Package },
      );
    }
  }

  // De-duplicate (a user may hold both manager and cashier roles)
  const seen = new Set<string>();
  const uniqueLinks = links.filter((l) => (seen.has(l.to) ? false : (seen.add(l.to), true)));

  const roleLabel = isAdmin ? 'Admin' : isManager ? 'Manager' : isCashier ? 'Cashier' : 'Staff';

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Bus className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-heading text-lg font-bold text-foreground">{roleLabel}</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {uniqueLinks.map((link) => (
                <SidebarMenuItem key={link.to}>
                  <SidebarMenuButton asChild isActive={pathname === link.to}>
                    <NavLink
                      to={link.to}
                      className="flex items-center gap-2"
                      onClick={() => setOpenMobile(false)}
                    >
                      <link.icon className="h-4 w-4" />
                      <span>{link.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
