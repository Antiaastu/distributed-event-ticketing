import { Download, Mail, QrCode, Ticket } from 'lucide-react';
import { Booking } from '../../types';

interface MyTicketsProps {
  bookings: Booking[];
}

export function MyTickets({ bookings }: MyTicketsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2">My Tickets</h2>
        <p className="text-[var(--muted-foreground)]">All your purchased tickets</p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-[var(--muted)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Ticket className="w-8 h-8 text-[var(--muted-foreground)]" />
          </div>
          <h4 className="mb-2">No Tickets</h4>
          <p className="text-[var(--muted-foreground)]">You don&apos;t have any tickets yet</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map(booking => (
            <div
              key={booking.id}
              className="bg-gradient-to-br from-[var(--primary)]/5 to-[var(--accent)]/5 border-2 border-[var(--border)] rounded-2xl overflow-hidden"
            >
              {/* Ticket Header */}
              <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white p-4 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="mb-2 truncate">{booking.eventName}</h4>
                    <p className="text-sm text-white/80">
                      Booked on {booking.bookingDate}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center flex-shrink-0">
                    <QrCode className="w-8 h-8" />
                  </div>
                </div>
              </div>

              {/* Ticket Details */}
              <div className="p-4 sm:p-6">
                <div className="mb-4">
                  <p className="text-sm text-[var(--muted-foreground)] mb-3">Your Seats</p>
                  <div className="flex flex-wrap gap-2">
                    {booking.seats.map(seat => (
                      <div
                        key={seat.id}
                        className="px-4 py-2 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-lg shadow-md"
                      >
                        <span className="text-sm">
                          Row {seat.row} • Seat {seat.number}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pt-4 border-t border-[var(--border)]">
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)] mb-1">Total Amount Paid</p>
                    <p className="text-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
                      ${booking.totalAmount.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => window.open(`http://localhost:8080/api/notifications/tickets/${booking.id}/pdf`, '_blank')}
                      className="px-4 py-2 bg-[var(--secondary)] hover:bg-[var(--muted)] rounded-xl transition-all flex items-center justify-center gap-2 border border-[var(--border)]"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button className="px-4 py-2 bg-[var(--secondary)] hover:bg-[var(--muted)] rounded-xl transition-all flex items-center justify-center gap-2 border border-[var(--border)]">
                      <Mail className="w-4 h-4" />
                      Email
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
