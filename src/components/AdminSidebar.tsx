/**
 * Vertical, collapsible sidebar for the admin panel.
 * Uses shadcn Sidebar (offcanvas) so it stays hidden until toggled.
 */
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Bus,
  Calendar,
  Ticket,
  Package,
  Settings,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/buses', label: 'Buses', icon: Bus },
  { to: '/admin/schedules', label: 'Schedules', icon: Calendar },
  { to: '/admin/bookings', label: 'Bookings', icon: Ticket },
  { to: '/admin/parcels', label: 'Parcels', icon: Package },
  { to: '/admin/send-parcel', label: 'Register Parcel', icon: Package },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

const AdminSidebar = () => {
  const { pathname } = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Bus className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-heading text-lg font-bold text-foreground">Admin</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminLinks.map((link) => (
                <SidebarMenuItem key={link.to}>
                  <SidebarMenuButton asChild isActive={pathname === link.to}>
                    <NavLink
                      to={link.to}
                      className="flex items-center gap-2"
                      onClick={() => {
                        if (isMobile) {
                          setOpenMobile(false);
                        }
                      }}
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
