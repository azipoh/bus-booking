/**
 * Landing page with hero section and bus search form.
 * Features animated statistics and popular routes.
 */
import SearchForm from '@/components/SearchForm';
import { motion } from 'framer-motion';
import { Shield, Clock, MapPin, Users, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/currency';
import heroBus from '@/assets/hero-bus.jpg';

const features = [
  { icon: Shield, title: 'Secure Booking', desc: 'Encrypted payments & seat locking' },
  { icon: Clock, title: 'Real-time Availability', desc: 'Live seat status updates' },
  { icon: MapPin, title: 'All Major Cities', desc: 'Douala, Yaoundé, Bamenda & more' },
  { icon: Package, title: 'Parcel Service', desc: 'Send & track parcels nationwide' },
];

const popularRoutes = [
  { from: 'Douala', to: 'Yaoundé', price: 5000 },
  { from: 'Douala', to: 'Bamenda', price: 6000 },
  { from: 'Douala', to: 'Buea', price: 2000 },
  { from: 'Douala', to: 'Limbe', price: 2000 },
  { from: 'Yaoundé', to: 'Bamenda', price: 7000 },
  { from: 'Buea', to: 'Limbe', price: 1500 },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBus} alt="Bus on highway" className="h-full w-full object-cover" />
          <div className="absolute inset-0 gradient-hero opacity-85" />
        </div>

        <div className="container relative mx-auto px-4 pb-20 pt-24 md:pb-28 md:pt-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10 text-center"
          >
            <h1 className="mb-4 font-heading text-4xl font-bold text-primary-foreground md:text-6xl">
              Travel Smarter,{' '}
              <span className="text-accent">Book Faster</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-primary-foreground/70">
              Skip the queues. Find buses, compare fares, pick your seat, and book
              your ticket — all in seconds. Now with parcel delivery!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mx-auto max-w-5xl"
          >
            <SearchForm />
          </motion.div>

          {/* Send Parcel CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mx-auto mt-4 flex justify-center gap-3"
          >
            <Link to="/send-parcel">
              <Button variant="outline" className="gap-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Package className="h-4 w-4" /> Send a Parcel
              </Button>
            </Link>
            <Link to="/track-parcel">
              <Button variant="outline" className="gap-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <MapPin className="h-4 w-4" /> Track Parcel
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto -mt-8 px-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex flex-col items-center gap-2 rounded-xl bg-card p-5 text-center shadow-soft"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-sm font-bold text-foreground">{f.title}</h3>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Popular Routes */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-8 text-center font-heading text-3xl font-bold text-foreground">
          Popular Routes
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popularRoutes.map((r, i) => (
            <motion.a
              key={`${r.from}-${r.to}`}
              href={`/search?from=${encodeURIComponent(r.from)}&to=${encodeURIComponent(r.to)}&date=${new Date().toISOString().split('T')[0]}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className="group flex items-center justify-between rounded-xl border border-border bg-card p-5 transition-all hover:shadow-elevated"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-heading font-semibold text-foreground">
                    {r.from} → {r.to}
                  </p>
                  <p className="text-sm text-muted-foreground">Multiple departures daily</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-heading text-lg font-bold text-accent">from {formatCurrency(r.price)}</p>
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 BusGo — Online Bus & Parcel Booking System. Cameroon.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
