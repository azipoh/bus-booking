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
    if (selectedSeats.includes(seat.id)) 
      return 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 border-2 border-emerald-400';
    if (seat.status === 'booked') 
      return 'bg-gray-300 text-gray-500 cursor-not-allowed border-2 border-gray-300';
    if (seat.status === 'locked') 
      return 'bg-amber-200 text-amber-700 cursor-not-allowed border-2 border-amber-300';
    return 'bg-white text-gray-700 border-2 border-blue-400 hover:border-blue-500 hover:shadow-md hover:shadow-blue-200 cursor-pointer';
  };

  return (
    <div className="rounded-xl bg-slate-100 p-6">
      {/* Front of Bus */}
      <div className="mb-6 flex items-center justify-center">
        <div className="rounded-full bg-blue-600 px-6 py-1.5 text-sm font-bold text-white shadow-sm">
          🚌 Front of Bus
        </div>
      </div>

      {/* Steering Wheel */}
      <div className="mb-4 flex justify-end pr-2">
        <div className="h-8 w-8 rounded-full border-2 border-slate-300 bg-slate-200" />
      </div>

      {/* Seats */}
      <div className="space-y-2">
        {Object.entries(rows).map(([rowIndex, rowSeats]) => (
          <div key={rowIndex} className="flex items-center justify-center gap-2">
            {rowSeats.map((seat, colIndex) => (
              <div key={seat.id} className="flex items-center">
                {/* Aisle gap in the middle */}
                {colIndex === 2 && <div className="w-8" />}
                <motion.button
                  whileHover={seat.status === 'available' ? { scale: 1.15 } : {}}
                  whileTap={seat.status === 'available' ? { scale: 0.9 } : {}}
                  onClick={() => seat.status === 'available' && onSeatClick(seat.id)}
                  disabled={seat.status !== 'available' && !selectedSeats.includes(seat.id)}
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-lg text-xs font-bold transition-all duration-200',
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

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded border-2 border-blue-400 bg-white" />
          <span className="text-slate-600 font-medium">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-emerald-500 border-2 border-emerald-400" />
          <span className="text-slate-600 font-medium">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-gray-300 border-2 border-gray-300" />
          <span className="text-slate-600 font-medium">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-amber-200 border-2 border-amber-300" />
          <span className="text-slate-600 font-medium">Locked</span>
        </div>
      </div>
    </div>
  );
};

export default SeatMap;