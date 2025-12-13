import { Calendar, MapPin, Edit } from 'lucide-react';

interface Event {
  ID: number;
  title: string;
  description: string;
  date: string;
  location: string;
  total_seats: number;
  available_seats: number;
  organizer_id: number;
  available_normal?: number;
  available_vip?: number;
  available_vvip?: number;
}

interface EventsListProps {
  events: Event[];
  loading: boolean;
  onEdit: (event: Event) => void;
  onViewStats: (event: Event) => void;
}

export function EventsList({ events, loading, onEdit, onViewStats }: EventsListProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Your Events</h2>
      {loading ? (
        <p>Loading events...</p>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-[var(--card)] rounded-2xl border border-[var(--border)]">
          <p className="text-[var(--muted-foreground)]">You haven't created any events yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {events.map(event => (
            <div key={event.ID} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold mb-1">{event.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                    <Calendar className="w-4 h-4" />
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mt-1">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    event.available_seats > 0 
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {event.available_seats > 0 ? 'Active' : 'Sold Out'}
                  </span>
                  <button
                    onClick={() => onEdit(event)}
                    className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    title="Edit Event"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[var(--muted)]/50 p-3 rounded-xl">
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">Available Seats</p>
                  <p className="font-semibold">{event.available_seats} / {event.total_seats}</p>
                  <div className="text-xs text-[var(--muted-foreground)] mt-1 space-y-0.5">
                    <div className="flex justify-between"><span>Normal:</span> <span>{event.available_normal ?? '-'}</span></div>
                    <div className="flex justify-between"><span>VIP:</span> <span>{event.available_vip ?? '-'}</span></div>
                    <div className="flex justify-between"><span>VVIP:</span> <span>{event.available_vvip ?? '-'}</span></div>
                  </div>
                </div>
                <div className="bg-[var(--muted)]/50 p-3 rounded-xl">
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">Booked</p>
                  <p className="font-semibold">{event.total_seats - event.available_seats}</p>
                </div>
              </div>

              <button
                onClick={() => onViewStats(event)}
                className="w-full py-2 bg-[var(--muted)] hover:bg-[var(--muted)]/80 rounded-lg transition-colors text-sm font-medium"
              >
                View Analytics & Transactions
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
