interface Booking {
  ID: number;
  user_id: number;
  event_id: number;
  seat_count: number;
  total_amount: number;
  status: string;
  CreatedAt: string;
  user_email?: string;
}

interface Event {
  ID: number;
  title: string;
}

interface EventAnalyticsProps {
  selectedEvent: Event;
  eventSales: Booking[];
  loadingSales: boolean;
  onClose: () => void;
}

export function EventAnalytics({ selectedEvent, eventSales, loadingSales, onClose }: EventAnalyticsProps) {
  return (
    <div className="mt-8 border-t border-[var(--border)] pt-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Analytics: {selectedEvent.title}</h2>
        <button 
          onClick={onClose}
          className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          Close Analytics
        </button>
      </div>

      {loadingSales ? (
        <p>Loading sales data...</p>
      ) : (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[var(--card)] p-4 rounded-xl border border-[var(--border)]">
              <p className="text-sm text-[var(--muted-foreground)]">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                ${eventSales
                  .filter(sale => sale.status === 'confirmed')
                  .reduce((acc, curr) => acc + curr.total_amount, 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-[var(--card)] p-4 rounded-xl border border-[var(--border)]">
              <p className="text-sm text-[var(--muted-foreground)]">Total Tickets Sold</p>
              <p className="text-2xl font-bold">
                {eventSales
                  .filter(sale => sale.status === 'confirmed')
                  .reduce((acc, curr) => acc + curr.seat_count, 0)}
              </p>
            </div>
            <div className="bg-[var(--card)] p-4 rounded-xl border border-[var(--border)]">
              <p className="text-sm text-[var(--muted-foreground)]">Average Order Value</p>
              <p className="text-2xl font-bold">
                ${(() => {
                  const confirmedSales = eventSales.filter(sale => sale.status === 'confirmed');
                  return confirmedSales.length > 0 
                    ? (confirmedSales.reduce((acc, curr) => acc + curr.total_amount, 0) / confirmedSales.length).toFixed(2) 
                    : '0.00';
                })()}
              </p>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden">
            <div className="p-4 border-b border-[var(--border)]">
              <h3 className="font-semibold">Recent Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[var(--muted)]/50 text-[var(--muted-foreground)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Booking ID</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">User ID</th>
                    <th className="px-4 py-3 font-medium">Seats</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {eventSales.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-[var(--muted-foreground)]">
                        No transactions found for this event.
                      </td>
                    </tr>
                  ) : (
                    eventSales.map(sale => (
                      <tr key={sale.ID} className="hover:bg-[var(--muted)]/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs">{sale.ID}</td>
                        <td className="px-4 py-3">
                          {new Date(sale.CreatedAt).toLocaleDateString()} {new Date(sale.CreatedAt).toLocaleTimeString()}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">{sale.user_id}</td>
                        <td className="px-4 py-3">{sale.seat_count}</td>
                        <td className="px-4 py-3 font-medium">${sale.total_amount.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            {sale.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
