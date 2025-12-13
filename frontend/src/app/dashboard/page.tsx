'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { OrganizerDashboard } from '../components/organizer/OrganizerDashboard';

export default function Dashboard() {
  const router = useRouter();
  const { currentUser, logout, isLoading } = useAuth();
  const { events, bookings, addEvent, deleteEvent } = useEvents();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push('/login');
    } else if (!isLoading && currentUser && currentUser.role === 'user') {
      router.push('/events');
    }
  }, [currentUser, isLoading, router]);

  if (isLoading) return null;

  if (!currentUser) return null;

  if (currentUser.role === 'admin') {
    return (
      <AdminDashboard
        userEmail={currentUser.email}
        onLogout={logout}
        events={events}
        bookings={bookings}
        onAddEvent={addEvent}
        onDeleteEvent={deleteEvent}
      />
    );
  }

  if (currentUser.role === 'organizer') {
    return (
      <OrganizerDashboard
        userEmail={currentUser.email}
        onLogout={logout}
      />
    );
  }

  return null;
}
