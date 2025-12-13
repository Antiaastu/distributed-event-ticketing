'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import { CheckoutSummaryNew } from '../components/booking/CheckoutSummaryNew';
import { Booking } from '../types';

export default function Checkout() {
  const router = useRouter();
  const { currentUser, logout, isLoading } = useAuth();
  const { selectedEvent, checkoutSeats, checkoutTicket, addBooking, isEventLoading } = useEvents();

  useEffect(() => {
    if (isLoading || isEventLoading) return;

    if (!currentUser) {
      router.push('/login');
    } else if (!selectedEvent || (checkoutSeats.length === 0 && !checkoutTicket)) {
      router.push('/events');
    }
  }, [currentUser, selectedEvent, checkoutSeats, checkoutTicket, router, isLoading, isEventLoading]);

  if (isLoading || isEventLoading) return null;

  if (!currentUser || !selectedEvent) return null;

  const handlePaymentComplete = () => {
    if (currentUser && selectedEvent) {
      const booking: Booking = {
        id: Date.now().toString(),
        eventId: selectedEvent.id,
        eventName: selectedEvent.name,
        userId: currentUser.id,
        userEmail: currentUser.email,
        seats: checkoutSeats, // This might be empty if using ticket
        totalAmount: checkoutTicket 
            ? checkoutTicket.price * checkoutTicket.quantity * 1.1 
            : checkoutSeats.reduce((sum, seat) => sum + seat.price, 0) * 1.1,
        bookingDate: new Date().toLocaleDateString(),
        status: 'confirmed'
      };

      addBooking(booking);
      router.push('/success');
    }
  };

  return (
    <CheckoutSummaryNew
      selectedSeats={checkoutSeats}
      ticketDetails={checkoutTicket || undefined}
      eventId={parseInt(selectedEvent.id)}
      eventName={selectedEvent.name}
      eventDate={selectedEvent.date}
      eventTime={selectedEvent.time}
      eventVenue={selectedEvent.venue}
      userId={parseInt(currentUser.id)}
      userEmail={currentUser.email}
      onBack={() => router.push('/seat-selection')}
      onPaymentComplete={handlePaymentComplete}
      onLogout={logout}
    />
  );
}
