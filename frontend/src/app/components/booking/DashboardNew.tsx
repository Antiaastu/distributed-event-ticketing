'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '../layout/Sidebar';
import { EventInfoCard } from '../events/EventInfoCard';
import { SeatMap } from './SeatMap';
import { Seat } from '../../types';
import { SeatLegend } from './SeatLegend';
import { CartPanel } from './CartPanel';
import { Event } from '../../types';
import { ArrowLeft } from 'lucide-react';

interface DashboardNewProps {
  userEmail: string;
  event: Event;
  ticketClass: string;
  onCheckout: (seats: Seat[]) => void;
  onLogout: () => void;
  onBack: () => void;
  onNavigate: (section: string) => void;
}

export function DashboardNew({ userEmail, event, ticketClass, onCheckout, onLogout, onBack, onNavigate }: DashboardNewProps) {
  const [seats, setSeats] = useState<Seat[]>([]);

  useEffect(() => {
    const loadSeats = async () => {
      const initialSeats: Seat[] = [];
      
      // Determine seats and price based on class
      let totalSeats = event.seatsNormal;
      let price = event.priceNormal;
      
      if (ticketClass === 'vip') {
        totalSeats = event.seatsVIP;
        price = event.priceVIP;
      } else if (ticketClass === 'vvip') {
        totalSeats = event.seatsVVIP;
        price = event.priceVVIP;
      }

      // Calculate rows and cols (approximate)
      const seatsPerRow = 10;
      const rows = Math.ceil(totalSeats / seatsPerRow);
      
      for (let row = 1; row <= rows; row++) {
        for (let number = 1; number <= seatsPerRow; number++) {
          if (initialSeats.length >= totalSeats) break;

          initialSeats.push({
            id: `${ticketClass}-${row}-${number}`,
            row,
            number,
            status: 'available',
            price
          });
        }
      }

      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`http://localhost:3002/api/bookings/event/${event.id}/seats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const bookedSeats = data.seats || [];
          // Create a map of seat ID to status
          const seatStatusMap = new Map(bookedSeats.map((s: any) => [s.id, s.status]));

          initialSeats.forEach(seat => {
            if (seatStatusMap.has(seat.id)) {
              seat.status = seatStatusMap.get(seat.id) as any;
            }
          });
        }
      } catch (error) {
        console.error('Failed to fetch booked seats:', error);
      }
      
      setSeats(initialSeats);
    };

    loadSeats();
  }, [event, ticketClass]);

  const handleSeatClick = (seatId: string) => {
    setSeats(prevSeats => 
      prevSeats.map(seat => {
        if (seat.id === seatId) {
          return {
            ...seat,
            status: seat.status === 'selected' ? 'available' : 'selected'
          };
        }
        return seat;
      })
    );
  };

  const handleRemoveSeat = (seatId: string) => {
    setSeats(prevSeats => 
      prevSeats.map(seat => 
        seat.id === seatId ? { ...seat, status: 'available' as const } : seat
      )
    );
  };

  const selectedSeats = seats.filter(seat => seat.status === 'selected');

  const handleCheckoutClick = () => {
    if (selectedSeats.length > 0) {
      onCheckout(selectedSeats);
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar 
        userEmail={userEmail} 
        onLogout={onLogout} 
        activeSection="dashboard" 
        onNavigate={onNavigate}
      />

      <main className="flex-1 w-full overflow-x-hidden">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Events
          </button>

          {/* Page Header */}
          <div className="mb-6 sm:mb-8">
            <h2 className="mb-2">Select Your Seats</h2>
            <p className="text-[var(--muted-foreground)]">
              {ticketClass.toUpperCase()} Section - Choose your perfect seats
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <EventInfoCard event={event} />

              <SeatLegend />

              <SeatMap seats={seats} onSeatClick={handleSeatClick} />
            </div>

            {/* Sidebar Cart - Desktop */}
            <div className="hidden lg:block">
              <CartPanel
                selectedSeats={selectedSeats}
                onRemoveSeat={handleRemoveSeat}
                onCheckout={handleCheckoutClick}
              />
            </div>
          </div>

          {/* Mobile Cart - Fixed Bottom */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--card)] border-t border-[var(--border)] shadow-2xl z-30 max-h-[60vh] overflow-y-auto">
            <CartPanel
              selectedSeats={selectedSeats}
              onRemoveSeat={handleRemoveSeat}
              onCheckout={handleCheckoutClick}
            />
          </div>
        </div>
      </main>
    </div>
  );
}