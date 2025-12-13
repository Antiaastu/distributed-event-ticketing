import { Calendar, Users, Ticket } from 'lucide-react';

interface StatsOverviewProps {
  totalEvents: number;
  totalSeats: number;
  totalBooked: number;
}

export function StatsOverview({ totalEvents, totalSeats, totalBooked }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)]">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-[var(--muted-foreground)]">Total Events</p>
            <h3 className="text-2xl font-bold">{totalEvents}</h3>
          </div>
        </div>
      </div>
      <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)]">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-[var(--muted-foreground)]">Total Capacity</p>
            <h3 className="text-2xl font-bold">{totalSeats}</h3>
          </div>
        </div>
      </div>
      <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)]">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-[var(--muted-foreground)]">Total Booked</p>
            <h3 className="text-2xl font-bold">{totalBooked}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
