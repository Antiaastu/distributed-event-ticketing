'use client';

import { X, Check } from 'lucide-react';
import { Event } from '../../types';

interface TicketClassSelectionModalProps {
  event: Event;
  onClose: () => void;
  onSelectClass: (ticketClass: string, price: number) => void;
}

export function TicketClassSelectionModal({ event, onClose, onSelectClass }: TicketClassSelectionModalProps) {
  const classes = [
    { 
      id: 'normal', 
      name: 'Normal', 
      price: event.priceNormal, 
      available: event.availableNormal ?? 0 
    },
    { 
      id: 'vip', 
      name: 'VIP', 
      price: event.priceVIP, 
      available: event.availableVIP ?? 0 
    },
    { 
      id: 'vvip', 
      name: 'VVIP', 
      price: event.priceVVIP, 
      available: event.availableVVIP ?? 0 
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <h2 className="text-xl font-semibold">Select Ticket Class</h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--muted)] rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {classes.map((cls) => (
            <button
              key={cls.id}
              disabled={cls.available <= 0}
              onClick={() => onSelectClass(cls.id, cls.price)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                cls.available > 0
                  ? 'border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--muted)]'
                  : 'border-[var(--border)] opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="text-left">
                <div className="font-medium">{cls.name}</div>
                <div className="text-sm text-[var(--muted-foreground)]">
                  {cls.available > 0 ? `${cls.available} seats left` : 'Sold Out'}
                </div>
              </div>
              <div className="font-semibold text-lg">
                ${cls.price}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
