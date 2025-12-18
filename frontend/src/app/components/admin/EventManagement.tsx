import { Trash2, Users, Ticket, Calendar } from 'lucide-react';
import { Event, Booking } from '../../types';

interface EventManagementProps {
  events: Event[];
  bookings: Booking[];
  onDeleteEvent: (eventId: string) => void;
}

export function EventManagement({ events, bookings, onDeleteEvent }: EventManagementProps) {
  const getEventStats = (eventId: string) => {
    const eventBookings = bookings.filter(b => b.eventId === eventId && b.status === 'confirmed');
    const ticketsSold = eventBookings.reduce((sum, b) => sum + b.seats.length, 0);
    const revenue = eventBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    return { bookings: eventBookings.length, ticketsSold, revenue };
  };

  return (
    <div className="space-y-4">
      {events.length === 0 ? (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-12 text-center">
          <Calendar className="w-16 h-16 text-[var(--muted-foreground)] mx-auto mb-4" />
          <h4 className="mb-2">No Events Yet</h4>
          <p className="text-[var(--muted-foreground)]">Click &quot;Add Event&quot; to create your first event</p>
        </div>
      ) : (
        events.map(event => {
          const stats = getEventStats(event.id);
          // Use availableSeats directly from backend (event_db)
          const seatsLeft = event.availableSeats;

          return (
            <div
              key={event.id}
              className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <h4 className="mb-2 truncate">{event.name}</h4>
                  <div className="flex flex-wrap gap-3 text-sm text-[var(--muted-foreground)]">
                    <span>{event.date}</span>
                    <span>•</span>
                    <span>{event.time}</span>
                    <span>•</span>
                    <span className="truncate">{event.venue}</span>
                  </div>
                </div>
                <button
                  onClick={() => onDeleteEvent(event.id)}
                  className="self-start px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-[var(--secondary)] rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Ticket className="w-4 h-4 text-[var(--primary)]" />
                    <p className="text-xs text-[var(--muted-foreground)]">Bookings</p>
                  </div>
                  <p className="text-lg sm:text-xl">{stats.bookings}</p>
                </div>

                <div className="bg-[var(--secondary)] rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-[var(--primary)]" />
                    <p className="text-xs text-[var(--muted-foreground)]">Sold</p>
                  </div>
                  <p className="text-lg sm:text-xl">{stats.ticketsSold}</p>
                </div>

                <div className="bg-[var(--secondary)] rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-orange-500" />
                    <p className="text-xs text-[var(--muted-foreground)]">Available</p>
                  </div>
                  <p className="text-lg sm:text-xl">{seatsLeft}</p>
                  <div className="text-[10px] text-[var(--muted-foreground)] mt-1 space-y-0.5">
                    <div className="flex justify-between"><span>N:</span> <span>{event.availableNormal ?? '-'}</span></div>
                    <div className="flex justify-between"><span>V:</span> <span>{event.availableVIP ?? '-'}</span></div>
                    <div className="flex justify-between"><span>VV:</span> <span>{event.availableVVIP ?? '-'}</span></div>
                  </div>
                </div>

                <div className="bg-[var(--secondary)] rounded-xl p-3 sm:p-4">
                  <p className="text-xs text-[var(--muted-foreground)] mb-2">Revenue</p>
                  <p className="text-lg sm:text-xl text-[var(--primary)] truncate">${stats.revenue.toFixed(2)}</p>
                </div>
              </div>

              {/* Registrations */}
              {stats.bookings > 0 && (
                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  <p className="text-sm mb-3">Recent Registrations</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {bookings
                      .filter(b => b.eventId === event.id && b.status === 'confirmed')
                      .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
                      .slice(0, 10)
                      .map(booking => (
                        <div
                          key={booking.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-(--secondary) rounded-lg text-sm"
                        >
                          <div className="flex flex-col">
                            <span className="truncate font-medium">{booking.userEmail}</span>
                            <span className="text-xs text-(--muted-foreground)">
                              {new Date(booking.bookingDate).toLocaleDateString()} 
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-(--muted-foreground)">
                            <span>{booking.seats.length} seat(s)</span>
                            <span className="text-(--primary)">${booking.totalAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
