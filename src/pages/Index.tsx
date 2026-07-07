/**
 * Landing page with hero section and bus search form.
 * Features animated statistics and popular routes.
 */
import SearchForm from '@/components/SearchForm';
import { motion } from 'framer-motion';
import { Shield, Clock, MapPin, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/currency';
import heroBus from '@/assets/hero-bus.jpg';
import destYaounde from '@/assets/dest-yaounde.jpg';
import destBuea from '@/assets/dest-buea.jpg';
import destLimbe from '@/assets/dest-limbe.jpg';
import destBamenda from '@/assets/dest-bamenda.jpg';

const features = [
  { icon: Shield, title: 'Secure Booking', desc: 'Encrypted payments & seat locking', color: 'bg-blue-500' },
  { icon: Clock, title: 'Real-time Availability', desc: 'Live seat status updates', color: 'bg-emerald-500' },
  { icon: MapPin, title: 'All Major Cities', desc: 'Douala, Yaoundé, Bamenda & more', color: 'bg-amber-500' },
  { icon: Package, title: 'Parcel Service', desc: 'Send & track parcels nationwide', color: 'bg-purple-500' },
];

const popularRoutes = [
  { from: 'Douala', to: 'Bamenda', price: 6500 },
  { from: 'Douala', to: 'Buea', price: 2500 },
  { from: 'Douala', to: 'Limbe', price: 2000 },
  { from: 'Yaoundé', to: 'Bamenda', price: 6500 },
  { from: 'Buea', to: 'Limbe', price: 1500 },
];

const destinations = [
  { name: 'Yaoundé', tagline: 'The capital on seven hills', image: destYaounde },
  { name: 'Buea', tagline: 'Gateway to Mount Cameroon', image: destBuea },
  { name: 'Limbe', tagline: 'Black sand beaches & ocean views', image: destLimbe },
  { name: 'Bamenda', tagline: 'Scenic highlands & grassfields', image: destBamenda },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBus} alt="Moghamo bus traveling on Cameroon highway" className="h-full w-full object-cover" />
          <div className="absolute inset-0 gradient-hero opacity-85" />
        </div>

        <div className="container relative mx-auto px-4 pb-20 pt-24 md:pb-28 md:pt-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10 text-center"
          >
            <h1 className="mb-4 font-heading text-4xl font-bold text-white md:text-6xl">
              Travel Smarter,{' '}
              <span className="text-amber-400">Book Faster</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-white/70">
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

          {/* Track Parcel CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mx-auto mt-4 flex justify-center gap-3"
          >
            <Link to="/track-parcel">
              <Button className="gap-2 bg-white/20 font-heading font-semibold text-white hover:bg-white/30 border border-white/30">
                <MapPin className="h-4 w-4" /> Track Parcel
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto mt-8 px-4 relative z-10">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex flex-col items-center gap-3 rounded-xl bg-white dark:bg-gray-800 p-5 text-center shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${f.color} text-white shadow-md`}>
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-sm font-bold text-gray-800 dark:text-white">{f.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Top Destinations */}
      <section className="container mx-auto px-4 pt-16">
        <h2 className="mb-2 text-center font-heading text-3xl font-bold text-foreground">
          Top Destinations
        </h2>
        <p className="mb-8 text-center text-muted-foreground">
          Discover where your next journey can take you
        </p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {destinations.map((d, i) => (
            <motion.a
              key={d.name}
              href={`/search?to=${encodeURIComponent(d.name)}&date=${new Date().toISOString().split('T')[0]}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative block overflow-hidden rounded-2xl shadow-soft transition-all hover:shadow-elevated"
            >
              <img
                src={d.image}
                alt={`${d.name}, Cameroon`}
                loading="lazy"
                width={768}
                height={512}
                className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-amber-400" />
                  <h3 className="font-heading text-lg font-bold text-white">{d.name}</h3>
                </div>
                <p className="mt-0.5 text-sm text-white/80">{d.tagline}</p>
              </div>
            </motion.a>
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
              className="group flex items-center justify-between rounded-xl border border-border bg-card p-5 transition-all hover:shadow-elevated hover:border-primary/30"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 text-white shadow-sm">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-heading font-semibold text-foreground">
                    {r.from} → {r.to}
                  </p>
                  <p className="text-sm text-muted-foreground">Multiple departures daily</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-heading text-lg font-bold text-amber-500">from {formatCurrency(r.price)}</p>
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 Moghamo — Online Bus & Parcel Booking System. Cameroon.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;