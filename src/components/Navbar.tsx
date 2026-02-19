/**
 * Navbar component for the bus booking system.
 * Provides navigation between passenger and admin sections.
 */
import { Link, useLocation } from 'react-router-dom';
import { Bus, User, LayoutDashboard, Ticket, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = location.pathname.startsWith('/admin');

  const passengerLinks = [
    { to: '/', label: 'Search', icon: Bus },
    { to: '/my-bookings', label: 'My Bookings', icon: Ticket },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/buses', label: 'Buses', icon: Bus },
    { to: '/admin/bookings', label: 'Bookings', icon: Ticket },
  ];

  const links = isAdmin ? adminLinks : passengerLinks;

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Bus className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-heading text-xl font-bold text-foreground">
            BusGo
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link key={link.to} to={link.to}>
              <Button
                variant={location.pathname === link.to ? 'secondary' : 'ghost'}
                size="sm"
                className="gap-2"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Button>
            </Link>
          ))}
        </div>

        {/* Right side actions */}
        <div className="hidden items-center gap-2 md:flex">
          {isAdmin ? (
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-2">
                <Bus className="h-4 w-4" /> Passenger View
              </Button>
            </Link>
          ) : (
            <Link to="/admin">
              <Button variant="outline" size="sm" className="gap-2">
                <LayoutDashboard className="h-4 w-4" /> Admin
              </Button>
            </Link>
          )}
          <Link to="/login">
            <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <User className="h-4 w-4" /> Login
            </Button>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border bg-card md:hidden"
          >
            <div className="flex flex-col gap-1 p-4">
              {links.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}>
                  <Button
                    variant={location.pathname === link.to ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-2"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Button>
                </Link>
              ))}
              <div className="mt-2 border-t border-border pt-2">
                <Link to={isAdmin ? '/' : '/admin'} onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full gap-2">
                    {isAdmin ? <Bus className="h-4 w-4" /> : <LayoutDashboard className="h-4 w-4" />}
                    {isAdmin ? 'Passenger View' : 'Admin Panel'}
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
