/**
 * SeatMap component renders an interactive bus seat layout.
 * Works with the new Seat type from scheduleHelpers.
 */
import type { Seat } from '@/lib/scheduleHelpers';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SeatMapProps {
  seats: Seat[];
  selectedSeats: string[];
  onSeatClick: (seatId: string) => void;
}

const SeatMap = ({ seats, selectedSeats, onSeatClick }: SeatMapProps) => {
  const rows = seats.reduce<Record<number, Seat[]>>((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {});

  const getSeatColor = (seat: Seat) => {
    if (selectedSeats.includes(seat.id)) return 'bg-accent text-accent-foreground shadow-accent';
    if (seat.status === 'booked') return 'bg-muted text-muted-foreground cursor-not-allowed opacity-50';
    if (seat.status === 'locked') return 'bg-warning/20 text-warning cursor-not-allowed';
    return 'bg-card text-foreground border-2 border-border hover:border-accent hover:shadow-soft cursor-pointer';
  };

  return (
    <div className="rounded-xl bg-muted/50 p-6">
      <div className="mb-6 flex items-center justify-center">
        <div className="rounded-full bg-primary/10 px-6 py-1.5 text-sm font-medium text-primary">
          Front of Bus
        </div>
      </div>
      <div className="mb-4 flex justify-end pr-2">
        <div className="h-8 w-8 rounded-full border-2 border-muted-foreground/30" />
      </div>
      <div className="space-y-2">
        {Object.entries(rows).map(([rowIndex, rowSeats]) => (
          <div key={rowIndex} className="flex items-center justify-center gap-2">
            {rowSeats.map((seat, colIndex) => (
              <div key={seat.id} className="flex items-center">
                {colIndex === 2 && <div className="w-8" />}
                <motion.button
                  whileHover={seat.status === 'available' ? { scale: 1.1 } : {}}
                  whileTap={seat.status === 'available' ? { scale: 0.95 } : {}}
                  onClick={() => seat.status === 'available' && onSeatClick(seat.id)}
                  disabled={seat.status !== 'available' && !selectedSeats.includes(seat.id)}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg text-xs font-semibold transition-all duration-200',
                    getSeatColor(seat)
                  )}
                  title={`Seat ${seat.number} - $${seat.price} (${seat.type})`}
                >
                  {seat.number}
                </motion.button>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border-2 border-border bg-card" />
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-accent" />
          <span className="text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-muted opacity-50" />
          <span className="text-muted-foreground">Booked</span>
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
