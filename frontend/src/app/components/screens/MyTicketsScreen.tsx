import { Sidebar } from '../layout/Sidebar';
import { MyTickets } from '../events/MyTickets';
import { Booking, UserRole } from '../../types';

interface MyTicketsScreenProps {
  userEmail: string;
  userRole: UserRole;
  onLogout: () => void;
  activeSection: string;
  onNavigate: (section: string) => void;
  bookings: Booking[];
}

export function MyTicketsScreen({
  userEmail,
  userRole,
  onLogout,
  activeSection,
  onNavigate,
  bookings
}: MyTicketsScreenProps) {
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
          <MyTickets bookings={bookings} />
        </div>
      </main>
    </div>
  );
}
