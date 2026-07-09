/**
 * Navbar component for the bus booking system.
 * Shows auth state and role-based navigation.
 */
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bus, User, Ticket, Menu, X, LogOut, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import AuthDialog from '@/components/AuthDialog';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isStaff, panelHome, signOut, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const isAdminRoute = location.pathname.startsWith('/admin');

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const passengerLinks = [
  { to: '/', label: 'Search', icon: Bus },
  { to: '/track-parcel', label: 'Track Parcel', icon: MapPin, iconColor: 'text-amber-500' },
  ...(user ? [
    { to: '/my-bookings', label: 'My Bookings', icon: Ticket },
    { to: '/profile', label: 'Profile', icon: User },
  ] : []),
];

  const links = isAdminRoute ? [] : passengerLinks;

  const handleSignOut = async () => {
    await signOut();
    toast.success('Logged out');
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Bus className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-heading text-xl font-bold text-foreground">Moghamo</span>
        </Link>

        {/* Desktop Pill Navigation */}
<div className="hidden md:flex items-center">
  <nav className="flex items-center gap-0.5 rounded-full bg-muted p-1">
    {links.map((link) => {
      const isActive = location.pathname === link.to;
      return (
        <Link key={link.to} to={link.to}>
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              isActive
                ? 'bg-white dark:bg-gray-700 text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-gray-700/50'
            }`}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </div>
        </Link>
      );
    })}
  </nav>
</div>

        <div className="hidden items-center gap-2 md:flex">
          {/* Removed Staff Panel button: admins now go straight to admin routes */}
          {!loading && (user ? (
            <Button size="sm" variant="outline" className="gap-2" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          ) : (
            <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => openAuth('login')}>
              <User className="h-4 w-4" /> Login
            </Button>
          ))}
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            className="absolute left-0 right-0 top-full overflow-hidden border-t border-border bg-card/95 backdrop-blur-lg shadow-lg md:hidden"
          >
            <div className="flex flex-col gap-1 p-4">
              {links.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}>
                  <Button variant={location.pathname === link.to ? 'secondary' : 'ghost'} className="w-full justify-start gap-2">
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Button>
                </Link>
              ))}
              <div className="mt-2 border-t border-border pt-2">
                {/* Mobile: Staff Panel removed */}
                {user ? (
                  <Button variant="outline" className="w-full gap-2" onClick={() => { handleSignOut(); setMobileOpen(false); }}>
                    <LogOut className="h-4 w-4" /> Logout
                  </Button>
                ) : (
                  <Button className="w-full gap-2 bg-primary text-primary-foreground" onClick={() => { setMobileOpen(false); openAuth('login'); }}>
                    <User className="h-4 w-4" /> Login
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} initialMode={authMode} />
    </nav>
  );
};

export default Navbar;
