import { Calendar, Ticket, ChevronRight } from 'lucide-react';
import { Booking } from '../../types';

interface MyEventsProps {
  bookings: Booking[];
  onViewTickets: (booking: Booking) => void;
}

export function MyEvents({ bookings, onViewTickets }: MyEventsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2">My Events</h2>
        <p className="text-[var(--muted-foreground)]">Events you&apos;ve booked tickets for</p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-[var(--muted)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-[var(--muted-foreground)]" />
          </div>
          <h4 className="mb-2">No Events Booked</h4>
          <p className="text-[var(--muted-foreground)]">You haven&apos;t booked any events yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map(booking => (
            <div
              key={booking.id}
              className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-all"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Event Icon */}
                <div className="w-full sm:w-20 h-20 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>

                {/* Event Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="mb-2 truncate">{booking.eventName}</h4>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Booking ID: {booking.id.substring(0, 12)}...
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs ${
                      booking.status === 'confirmed'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    }`}>
                      {booking.status}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-[var(--primary)]" />
                      <span>{booking.seats.length} ticket(s)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--muted-foreground)]">Total:</span>
                      <span className="text-[var(--primary)]">${booking.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => onViewTickets(booking)}
                      className="px-4 py-2 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      View Tickets
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
