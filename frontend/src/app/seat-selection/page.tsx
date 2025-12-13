'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import { DashboardNew } from '../components/booking/DashboardNew';

export default function SeatSelection() {
  const router = useRouter();
  const { currentUser, logout, isLoading } = useAuth();
  const { selectedEvent, selectedTicketClass, setCheckoutSeats, isEventLoading } = useEvents();

  useEffect(() => {
    if (isLoading || isEventLoading) return;
    
    if (!currentUser) {
      router.push('/login');
    } else if (!selectedEvent) {
      router.push('/events');
    }
  }, [currentUser, selectedEvent, router, isLoading, isEventLoading]);

  if (isLoading || isEventLoading) return null;
  
  if (!currentUser || !selectedEvent) return null;

  const handleCheckout = (seats: any[]) => {
    setCheckoutSeats(seats);
    router.push('/checkout');
  };

  const handleNavigate = (section: string) => {
    if (section === 'dashboard') router.push('/events');
    else if (section === 'myevents') router.push('/my-events');
    else if (section === 'mytickets') router.push('/my-tickets');
  };

  return (
    <DashboardNew
      userEmail={currentUser.email}
      event={selectedEvent}
      ticketClass={selectedTicketClass || 'normal'}
      onCheckout={handleCheckout}
      onLogout={logout}
      onBack={() => router.push('/events')}
      onNavigate={handleNavigate}
    />
  );
}
