import { Booking } from '../../../types';

interface AllBookingsProps {
  bookings: Booking[];
}

export function AllBookings({ bookings }: AllBookingsProps) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 sm:p-6">
      <h4 className="mb-4">All Bookings</h4>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="px-4 py-3 text-left text-sm">Booking ID</th>
              <th className="px-4 py-3 text-left text-sm">Event</th>
              <th className="px-4 py-3 text-left text-sm">User</th>
              <th className="px-4 py-3 text-left text-sm hidden md:table-cell">Date</th>
              <th className="px-4 py-3 text-left text-sm">Seats</th>
              <th className="px-4 py-3 text-left text-sm">Amount</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(booking => (
              <tr key={booking.id} className="border-b border-[var(--border)] last:border-0">
                <td className="px-4 py-3 text-sm font-mono truncate max-w-[100px]">
                  {booking.id.substring(0, 8)}...
                </td>
                <td className="px-4 py-3 text-sm">{booking.eventName}</td>
                <td className="px-4 py-3 text-sm truncate max-w-[150px]">{booking.userEmail}</td>
                <td className="px-4 py-3 text-sm text-[var(--muted-foreground)] hidden md:table-cell">
                  {booking.bookingDate}
                </td>
                <td className="px-4 py-3 text-sm">{booking.seats.length}</td>
                <td className="px-4 py-3 text-sm text-[var(--primary)]">${booking.totalAmount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
