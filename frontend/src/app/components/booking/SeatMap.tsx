import { Armchair } from 'lucide-react';
import { Seat, SeatStatus } from '../../types';

interface SeatMapProps {
  seats: Seat[];
  onSeatClick: (seatId: string) => void;
}

export function SeatMap({ seats, onSeatClick }: SeatMapProps) {
  const rows = Array.from(new Set(seats.map(s => s.row))).sort((a, b) => a - b);

  const getSeatColor = (status: SeatStatus) => {
    switch (status) {
      case 'available':
        return 'bg-[var(--seat-available)] hover:bg-[var(--seat-available)]/80 cursor-pointer hover:scale-110';
      case 'selected':
        return 'bg-[var(--seat-selected)] hover:bg-[var(--seat-selected)]/80 cursor-pointer shadow-lg shadow-[var(--seat-selected)]/30';
      case 'locked':
        return 'bg-[var(--seat-locked)] cursor-not-allowed opacity-60';
      case 'sold':
        return 'bg-[var(--seat-sold)] cursor-not-allowed opacity-40';
    }
  };

  const isClickable = (status: SeatStatus) => {
    return status === 'available' || status === 'selected';
  };

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 md:p-8 shadow-xl">
      {/* Stage Indicator */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-[var(--primary)] text-white py-4 px-6 rounded-2xl text-center mx-auto max-w-md shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          <span className="relative uppercase tracking-[0.3em] text-lg">Stage</span>
        </div>
        <div className="h-2 bg-gradient-to-b from-[var(--primary)]/30 to-transparent rounded-b-lg"></div>
      </div>

      {/* Seat Grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="space-y-2">
            {rows.map(row => {
              const rowSeats = seats.filter(s => s.row === row).sort((a, b) => a.number - b.number);
              return (
                <div key={row} className="flex items-center gap-2 justify-center">
                  {/* Row Label */}
                  <div className="w-10 text-center flex-shrink-0">
                    <div className="inline-flex items-center justify-center w-8 h-8 bg-[var(--muted)] rounded-lg">
                      <span className="text-sm">{String.fromCharCode(64 + row)}</span>
                    </div>
                  </div>

                  {/* Seats */}
                  <div className="flex gap-1 md:gap-2">
                    {rowSeats.map((seat, index) => {
                      const showAisle = index === Math.floor(rowSeats.length / 2);
                      return (
                        <div key={seat.id} className="flex gap-1 md:gap-2">
                          {showAisle && <div className="w-4 md:w-8"></div>}
                          <button
                            onClick={() => isClickable(seat.status) && onSeatClick(seat.id)}
                            disabled={!isClickable(seat.status)}
                            className={`w-8 h-8 md:w-11 md:h-11 rounded-lg border-2 border-white/20 transition-all flex items-center justify-center ${getSeatColor(seat.status)} ${
                              seat.status === 'selected' ? 'ring-2 ring-[var(--seat-selected)] scale-110' : ''
                            }`}
                            title={`Row ${String.fromCharCode(64 + row)}, Seat ${seat.number} - $${seat.price}`}
                          >
                            <Armchair className="w-4 h-4 md:w-6 md:h-6 opacity-80" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Row Label (Right) */}
                  <div className="w-10 text-center flex-shrink-0">
                    <div className="inline-flex items-center justify-center w-8 h-8 bg-[var(--muted)] rounded-lg">
                      <span className="text-sm">{String.fromCharCode(64 + row)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}