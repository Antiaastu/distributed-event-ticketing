'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import { UserDashboardScreen } from '../components/screens/UserDashboardScreen';

export default function Settings() {
  const router = useRouter();
  const { currentUser, logout, isLoading } = useAuth();
  const { events, setSelectedEvent } = useEvents();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, isLoading, router]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!currentUser) return null;

  const handleNavigate = (section: string) => {
    if (section === 'dashboard') router.push('/events');
    else if (section === 'myevents') router.push('/my-events');
    else if (section === 'mytickets') router.push('/my-tickets');
    else if (section === 'settings') router.push('/settings');
  };

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event);
    router.push('/seat-selection');
  };

  return (
    <UserDashboardScreen
      userEmail={currentUser.email}
      userRole={currentUser.role}
      onLogout={logout}
      activeSection="settings"
      onNavigate={handleNavigate}
      events={events}
      onSelectEvent={handleSelectEvent}
    />
  );
}
