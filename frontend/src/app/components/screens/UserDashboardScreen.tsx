import { Sidebar } from '../layout/Sidebar';
import { EventList } from '../events/EventList';
import { SettingsPage } from '../layout/SettingsPage';
import { Event, UserRole } from '../../types';

interface UserDashboardScreenProps {
  userEmail: string;
  userRole: UserRole;
  onLogout: () => void;
  activeSection: string;
  onNavigate: (section: string) => void;
  events: Event[];
  onSelectEvent: (event: Event) => void;
}

export function UserDashboardScreen({
  userEmail,
  userRole,
  onLogout,
  activeSection,
  onNavigate,
  events,
  onSelectEvent
}: UserDashboardScreenProps) {
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
          {activeSection === 'dashboard' && <EventList events={events} onSelectEvent={onSelectEvent} />}
          {activeSection === 'settings' && <SettingsPage userEmail={userEmail} />}
        </div>
      </main>
    </div>
  );
}
