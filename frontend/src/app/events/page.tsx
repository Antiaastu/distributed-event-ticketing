'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import { UserDashboardScreen } from '../components/screens/UserDashboardScreen';
import { TicketClassSelectionModal } from '../components/events/TicketClassSelectionModal';
import { Event } from '../types';

export default function Events() {
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const { events, setSelectedEvent, setSelectedTicketClass } = useEvents();
  const [showClassModal, setShowClassModal] = useState(false);
  const [selectedEventForBooking, setSelectedEventForBooking] = useState<Event | null>(null);

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
    }
  }, [currentUser, router]);

  if (!currentUser) return null;

  const handleNavigate = (section: string) => {
    if (section === 'dashboard') router.push('/events');
    else if (section === 'myevents') router.push('/my-events');
    else if (section === 'mytickets') router.push('/my-tickets');
    else if (section === 'settings') router.push('/settings');
  };

  const handleSelectEvent = (event: Event) => {
    setSelectedEventForBooking(event);
    setShowClassModal(true);
  };

  const handleClassSelect = (ticketClass: string, price: number) => {
    if (selectedEventForBooking) {
      setSelectedEvent(selectedEventForBooking);
      setSelectedTicketClass(ticketClass);
      setShowClassModal(false);
      router.push('/seat-selection');
    }
  };

  return (
    <>
      <UserDashboardScreen
        userEmail={currentUser.email}
        userRole={currentUser.role}
        onLogout={logout}
        activeSection="dashboard"
        onNavigate={handleNavigate}
        events={events}
        onSelectEvent={handleSelectEvent}
      />
      {showClassModal && selectedEventForBooking && (
        <TicketClassSelectionModal
          event={selectedEventForBooking}
          onClose={() => setShowClassModal(false)}
          onSelectClass={handleClassSelect}
        />
      )}
    </>
  );
}
