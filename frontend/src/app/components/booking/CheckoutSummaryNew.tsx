'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { OrderSummary } from './checkout/OrderSummary';
import { EventDetails } from './checkout/EventDetails';
import { PaymentForm } from './checkout/PaymentForm';
import { Seat } from '../../types';
import { Sidebar } from '../layout/Sidebar';

interface CheckoutSummaryNewProps {
  selectedSeats?: Seat[];
  ticketDetails?: { ticketClass: string; price: number; quantity: number };
  eventId: number;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  userId: number;
  userEmail: string;
  onBack: () => void;
  onPaymentComplete: () => void;
  onLogout: () => void;
}

export function CheckoutSummaryNew({ 
  selectedSeats, 
  ticketDetails,
  eventId,
  eventName,
  eventDate,
  eventTime,
  eventVenue,
  userId,
  userEmail, 
  onBack, 
  onLogout 
}: CheckoutSummaryNewProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  let subtotal = 0;
  let items: { id: string; label: string; sublabel: string; price: number }[] = [];

  if (ticketDetails) {
    subtotal = ticketDetails.price * ticketDetails.quantity;
    items.push({
      id: 'ticket-1',
      label: `${ticketDetails.ticketClass.toUpperCase()} Ticket`,
      sublabel: `Quantity: ${ticketDetails.quantity}`,
      price: subtotal
    });
  } else if (selectedSeats) {
    subtotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    items = selectedSeats.map(seat => {
      const ticketClass = seat.id.split('-')[0].toUpperCase();
      return {
        id: seat.id,
        label: `Row ${String.fromCharCode(64 + seat.row)}, Seat ${seat.number}`,
        sublabel: `${ticketClass} Ticket`,
        price: seat.price
      };
    });
  }

  const serviceFee = subtotal * 0.1;
  const total = subtotal + serviceFee;

  let ticketClassDisplay = '';
  if (ticketDetails) {
    ticketClassDisplay = ticketDetails.ticketClass.toUpperCase();
  } else if (selectedSeats && selectedSeats.length > 0) {
    ticketClassDisplay = selectedSeats[0].id.split('-')[0].toUpperCase();
  }

  const handlePayment = async (e: React.FormEvent, firstName: string, lastName: string) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      // 1. Create Booking
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('No access token found');
        setIsProcessing(false);
        return;
      }

      const seatCount = ticketDetails ? ticketDetails.quantity : (selectedSeats ? selectedSeats.length : 0);

      const bookingResponse = await fetch('http://localhost:8080/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          event_id: eventId,
          seat_count: seatCount,
          amount: total,
          seats: selectedSeats
        }),
      });

      if (!bookingResponse.ok) {
        const errorData = await bookingResponse.json();
        console.error('Booking creation failed:', errorData);
        setIsProcessing(false);
        return;
      }

      const bookingData = await bookingResponse.json();
      console.log('Booking created:', bookingData);
      const bookingId = bookingData?.booking?.id || bookingData?.booking?.ID;

      if (!bookingId) {
        console.error('Booking ID missing in response', bookingData);
        setIsProcessing(false);
        return;
      }

      // 2. Initialize Payment
      const response = await fetch('http://localhost:8080/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_id: bookingId,
          user_id: userId,
          amount: total,
          email: userEmail,
          first_name: firstName,
          last_name: lastName
        }),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.checkout_url;
      } else {
        const errorData = await response.json();
        console.error('Payment initialization failed:', errorData);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar userEmail={userEmail} onLogout={onLogout} activeSection="dashboard" />

      <main className="flex-1 w-full overflow-x-hidden">
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Seat Selection
          </button>

          <h2 className="mb-6 sm:mb-8">Complete Your Booking</h2>

          <div className="grid lg:grid-cols-5 gap-4 sm:gap-6">
            {/* Order Summary - 2 columns */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <OrderSummary 
                items={items}
                subtotal={subtotal}
                serviceFee={serviceFee}
                total={total}
              />

              <EventDetails 
                eventName={eventName}
                eventDate={eventDate}
                eventTime={eventTime}
                eventVenue={eventVenue}
                ticketClass={ticketClassDisplay}
              />
            </div>

            {/* Payment Form - 3 columns */}
            <div className="lg:col-span-3">
              <PaymentForm 
                total={total}
                isProcessing={isProcessing}
                onSubmit={handlePayment}
                initialFirstName={userEmail.split('@')[0]}
                initialLastName="User"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}