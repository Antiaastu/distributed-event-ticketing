'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import { MyEventsScreen } from '../components/screens/MyEventsScreen';

export default function MyEvents() {
  const router = useRouter();
  const { currentUser, logout, isLoading } = useAuth();
  const { bookings } = useEvents();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, isLoading, router]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!currentUser) return null;

  const userBookings = bookings.filter(b => b.userEmail === currentUser.email);

  const handleNavigate = (section: string) => {
    if (section === 'dashboard') router.push('/events');
    else if (section === 'myevents') router.push('/my-events');
    else if (section === 'mytickets') router.push('/my-tickets');
    else if (section === 'settings') router.push('/settings');
  };

  return (
    <MyEventsScreen
      userEmail={currentUser.email}
      userRole={currentUser.role}
      onLogout={logout}
      activeSection="myevents"
      onNavigate={handleNavigate}
      bookings={userBookings}
      onViewTickets={() => router.push('/my-tickets')}
    />
  );
}
