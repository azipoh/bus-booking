/**
 * BusCard component displays a bus schedule in search results.
 * Works with real database data shape.
 */
import { Link } from 'react-router-dom';
import { Clock, Wifi, Plug, Utensils, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ScheduleWithDetails } from '@/lib/scheduleHelpers';
import { formatTime, calcDuration } from '@/lib/scheduleHelpers';
import { motion } from 'framer-motion';

interface BusCardProps {
  schedule: ScheduleWithDetails;
  index: number;
}

const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  WiFi: Wifi,
  'Charging Port': Plug,
  Snacks: Utensils,
  Entertainment: Monitor,
};

const BusCard = ({ schedule, index }: BusCardProps) => {
  const { buses: bus, routes: route } = schedule;
  const depTime = formatTime(schedule.departure_time);
  const arrTime = formatTime(schedule.arrival_time);
  const duration = calcDuration(schedule.departure_time, schedule.arrival_time);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="group rounded-xl border border-border bg-card p-5 shadow-soft transition-all hover:shadow-elevated"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Bus info */}
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h3 className="font-heading text-lg font-bold text-foreground">{bus.name}</h3>
            <Badge variant="secondary" className="text-xs">{bus.bus_type}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{bus.registration_number}</p>
        </div>

        {/* Timing */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="font-heading text-xl font-bold text-foreground">{depTime}</p>
            <p className="text-xs text-muted-foreground">{route.origin}</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {duration}
            </div>
            <div className="h-px w-20 bg-border" />
            {route.distance_km && (
              <p className="text-xs text-muted-foreground">{route.distance_km} km</p>
            )}
          </div>
          <div className="text-center">
            <p className="font-heading text-xl font-bold text-foreground">{arrTime}</p>
            <p className="text-xs text-muted-foreground">{route.destination}</p>
          </div>
        </div>

        {/* Amenities */}
        <div className="flex flex-col items-start gap-2 lg:items-center">
          <div className="flex gap-2">
            {(bus.amenities || []).slice(0, 4).map((amenity) => {
              const Icon = amenityIcons[amenity];
              return Icon ? (
                <div key={amenity} title={amenity} className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" />
                </div>
              ) : null;
            })}
          </div>
        </div>

        {/* Fare & book */}
        <div className="flex items-center gap-4 lg:flex-col lg:items-end lg:gap-2">
          <div className="text-right">
            <p className="font-heading text-2xl font-bold text-foreground">${schedule.fare}</p>
            <p className="text-xs text-muted-foreground">{schedule.available_seats} seats left</p>
          </div>
          <Link to={`/select-seat/${schedule.id}`}>
            <Button className="bg-accent font-heading font-semibold text-accent-foreground shadow-accent hover:bg-accent/90">
              Select Seat
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default BusCard;
