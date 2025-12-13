import { Sparkles } from 'lucide-react';
import { Seat } from '../../../types';

interface OrderSummaryProps {
  items: { id: string; label: string; sublabel: string; price: number }[];
  subtotal: number;
  serviceFee: number;
  total: number;
}

export function OrderSummary({ items, subtotal, serviceFee, total }: OrderSummaryProps) {
  return (
    <div className="bg-gradient-to-br from-[var(--primary)]/10 via-[var(--card)] to-[var(--accent)]/10 border border-[var(--border)] rounded-2xl p-4 sm:p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-[var(--primary)]" />
        <h4>Order Summary</h4>
      </div>

      <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
        {items.map(item => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 sm:p-4 bg-[var(--card)] rounded-xl border border-[var(--border)]"
          >
            <div>
              <p className="text-sm mb-1">
                {item.label}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">{item.sublabel}</p>
            </div>
            <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
              ${item.price.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--border)] pt-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--muted-foreground)]">Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--muted-foreground)]">Service Fee (10%)</span>
          <span>${serviceFee.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
          <span>Total</span>
          <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
            ${total.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
