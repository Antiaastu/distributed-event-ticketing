'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEvents } from '../context/EventContext';
import { SuccessScreenNew } from '../components/booking/SuccessScreenNew';

export default function Success() {
  const router = useRouter();
  const { selectedEvent, checkoutSeats, setSelectedEvent, setCheckoutSeats, isEventLoading } = useEvents();

  useEffect(() => {
    if (isEventLoading) return;
    if (!selectedEvent) {
      router.push('/events');
    }
  }, [selectedEvent, router, isEventLoading]);

  if (isEventLoading) return null;
  
  if (!selectedEvent) return null;

  const handleBackToHome = () => {
    setSelectedEvent(null);
    setCheckoutSeats([]);
    router.push('/events');
  };

  return (
    <SuccessScreenNew
      selectedSeats={checkoutSeats}
      eventName={selectedEvent.name}
      eventDate={selectedEvent.date}
      eventTime={selectedEvent.time}
      eventVenue={selectedEvent.venue}
      onBackToHome={handleBackToHome}
    />
  );
}
