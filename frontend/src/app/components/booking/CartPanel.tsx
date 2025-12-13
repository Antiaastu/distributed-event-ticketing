import { ShoppingCart, Trash2, ChevronRight, Ticket } from 'lucide-react';
import { Seat } from '../../types';

interface CartPanelProps {
  selectedSeats: Seat[];
  onRemoveSeat: (seatId: string) => void;
  onCheckout: () => void;
}

export function CartPanel({ selectedSeats, onRemoveSeat, onCheckout }: CartPanelProps) {
  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl sticky top-4">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-lg flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4>Your Cart</h4>
            <p className="text-xs text-[var(--muted-foreground)]">{selectedSeats.length} seat(s) selected</p>
          </div>
        </div>

        {selectedSeats.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-[var(--muted)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-8 h-8 text-[var(--muted-foreground)]" />
            </div>
            <p className="text-[var(--muted-foreground)] mb-2">No seats selected</p>
            <p className="text-sm text-[var(--muted-foreground)]">
              Click on available seats to add them
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6 max-h-80 overflow-y-auto">
              {selectedSeats.map(seat => (
                <div
                  key={seat.id}
                  className="flex items-center justify-between p-4 bg-[var(--secondary)] rounded-xl border border-[var(--border)] hover:border-[var(--primary)] transition-all group"
                >
                  <div className="flex-1">
                    <p className="text-sm mb-1">
                      Row {String.fromCharCode(64 + seat.row)}, Seat {seat.number}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
                        ${seat.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveSeat(seat.id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-[var(--border)] pt-4 mb-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Service Fee</span>
                <span>${(totalPrice * 0.1).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                <span>Total</span>
                <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
                  ${(totalPrice * 1.1).toFixed(2)}
                </div>
              </div>
            </div>

            <button
              onClick={onCheckout}
              className="w-full py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}