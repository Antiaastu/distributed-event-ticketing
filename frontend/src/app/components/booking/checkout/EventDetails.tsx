interface EventDetailsProps {
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  ticketClass?: string;
}

export function EventDetails({ eventName, eventDate, eventTime, eventVenue, ticketClass }: EventDetailsProps) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 sm:p-6 shadow-lg">
      <h5 className="mb-4">Event Details</h5>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between gap-2">
          <span className="text-[var(--muted-foreground)]">Event</span>
          <span className="text-right truncate">{eventName}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-[var(--muted-foreground)]">Date</span>
          <span className="text-right truncate">{eventDate}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-[var(--muted-foreground)]">Time</span>
          <span className="text-right truncate">{eventTime}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-[var(--muted-foreground)]">Venue</span>
          <span className="text-right truncate">{eventVenue}</span>
        </div>
        {ticketClass && (
          <div className="flex justify-between gap-2">
            <span className="text-[var(--muted-foreground)]">Ticket Class</span>
            <span className="text-right truncate font-medium text-[var(--primary)]">{ticketClass}</span>
          </div>
        )}
      </div>
    </div>
  );
}
