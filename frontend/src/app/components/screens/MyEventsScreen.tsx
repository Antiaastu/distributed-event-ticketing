import { Sidebar } from '../layout/Sidebar';
import { MyEvents } from '../events/MyEvents';
import { Booking, UserRole } from '../../types';

interface MyEventsScreenProps {
  userEmail: string;
  userRole: UserRole;
  onLogout: () => void;
  activeSection: string;
  onNavigate: (section: string) => void;
  bookings: Booking[];
  onViewTickets: () => void;
}

export function MyEventsScreen({
  userEmail,
  userRole,
  onLogout,
  activeSection,
  onNavigate,
  bookings,
  onViewTickets
}: MyEventsScreenProps) {
  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar 
        userEmail={userEmail} 
        userRole={userRole}
        onLogout={onLogout}
        activeSection={activeSection}
        onNavigate={onNavigate}
      />
      <main className="flex-1 w-full overflow-x-hidden">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <MyEvents 
            bookings={bookings}
            onViewTickets={onViewTickets}
          />
        </div>
      </main>
    </div>
  );
}
