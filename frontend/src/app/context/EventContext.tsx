'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Event, Booking, Seat } from '../types';
import { useAuth } from './AuthContext';

interface CheckoutTicket {
  event: Event;
  ticketClass: string;
  price: number;
  quantity: number;
}

interface EventContextType {
  events: Event[];
  bookings: Booking[];
  selectedEvent: Event | null;
  setSelectedEvent: (event: Event | null) => void;
  selectedTicketClass: string | null;
  setSelectedTicketClass: (ticketClass: string | null) => void;
  checkoutSeats: Seat[];
  setCheckoutSeats: (seats: Seat[]) => void;
  checkoutTicket: CheckoutTicket | null;
  setCheckoutTicket: (ticket: CheckoutTicket | null) => void;
  addEvent: (eventData: Omit<Event, 'id'>) => void;
  deleteEvent: (eventId: string) => void;
  addBooking: (booking: Booking) => void;
  isEventLoading: boolean;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedTicketClass, setSelectedTicketClass] = useState<string | null>(null);
  const [checkoutSeats, setCheckoutSeats] = useState<Seat[]>([]);
  const [checkoutTicket, setCheckoutTicket] = useState<CheckoutTicket | null>(null);
  const [isEventLoading, setIsEventLoading] = useState(true);

  // Load state from localStorage on mount
  useEffect(() => {
    const loadState = () => {
      try {
        const storedEvent = localStorage.getItem('selectedEvent');
        if (storedEvent) setSelectedEvent(JSON.parse(storedEvent));

        const storedClass = localStorage.getItem('selectedTicketClass');
        if (storedClass) setSelectedTicketClass(storedClass);

        const storedSeats = localStorage.getItem('checkoutSeats');
        if (storedSeats) setCheckoutSeats(JSON.parse(storedSeats));

        const storedTicket = localStorage.getItem('checkoutTicket');
        if (storedTicket) setCheckoutTicket(JSON.parse(storedTicket));
      } catch (e) {
        console.error("Failed to load state from localStorage", e);
      } finally {
        setIsEventLoading(false);
      }
    };
    loadState();
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (!isEventLoading) {
      if (selectedEvent) localStorage.setItem('selectedEvent', JSON.stringify(selectedEvent));
      else localStorage.removeItem('selectedEvent');
    }
  }, [selectedEvent, isEventLoading]);

  useEffect(() => {
    if (!isEventLoading) {
      if (selectedTicketClass) localStorage.setItem('selectedTicketClass', selectedTicketClass);
      else localStorage.removeItem('selectedTicketClass');
    }
  }, [selectedTicketClass, isEventLoading]);

  useEffect(() => {
    if (!isEventLoading) {
      if (checkoutSeats.length > 0) localStorage.setItem('checkoutSeats', JSON.stringify(checkoutSeats));
      else localStorage.removeItem('checkoutSeats');
    }
  }, [checkoutSeats, isEventLoading]);

  useEffect(() => {
    if (!isEventLoading) {
      if (checkoutTicket) localStorage.setItem('checkoutTicket', JSON.stringify(checkoutTicket));
      else localStorage.removeItem('checkoutTicket');
    }
  }, [checkoutTicket, isEventLoading]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:3003/api/events');
      if (response.ok) {
        const data = await response.json();
        const mappedEvents = data.map((e: any) => ({
          id: e.ID.toString(),
          name: e.title,
          description: e.description,
          date: new Date(e.date).toLocaleDateString(),
          time: new Date(e.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          venue: e.location,
          totalSeats: e.total_seats,
          availableSeats: e.available_seats,
          // Default values for missing fields
          rows: 10, 
          seatsPerRow: Math.ceil(e.total_seats / 10),
          basePrice: e.price_normal || 50, // Use normal price as base
          category: 'General', 
          image: '', 
          
          priceNormal: e.price_normal,
          priceVIP: e.price_vip,
          priceVVIP: e.price_vvip,
          seatsNormal: e.seats_normal,
          seatsVIP: e.seats_vip,
          seatsVVIP: e.seats_vvip,
          availableNormal: e.available_normal,
          availableVIP: e.available_vip,
          availableVVIP: e.available_vvip,
        }));
        setEvents(mappedEvents);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const fetchBookings = async () => {
    if (!currentUser) {
      setBookings([]);
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const endpoint = currentUser.role === 'admin' 
        ? 'http://localhost:3002/api/bookings/all'
        : 'http://localhost:3002/api/bookings/user';

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.bookings) {
          const mappedBookings = data.bookings.map((b: any) => {
            const event = events.find(e => e.id === b.event_id.toString());
            return {
              id: b.ID.toString(),
              eventId: b.event_id.toString(),
              eventName: event ? event.name : "Unknown Event",
              userId: b.user_id.toString(),
              userEmail: currentUser.role === 'admin' ? `User ${b.user_id}` : currentUser.email,
              seats: b.seats ? JSON.parse(b.seats) : Array(b.seat_count).fill({ id: '0', row: 0, number: 0, price: 0 }),
              totalAmount: b.total_amount,
              bookingDate: new Date(b.CreatedAt).toISOString(),
              status: b.status
            };
          });
          setBookings(mappedBookings);
        }
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [currentUser, events]);

  const addEvent = async (eventData: Omit<Event, 'id'>) => {
    try {
      const backendEvent = {
        title: eventData.name,
        description: eventData.description,
        date: new Date(`${eventData.date} ${eventData.time}`).toISOString(),
        location: eventData.venue,
        total_seats: eventData.totalSeats,
        
        price_normal: eventData.priceNormal,
        price_vip: eventData.priceVIP,
        price_vvip: eventData.priceVVIP,
        seats_normal: eventData.seatsNormal,
        seats_vip: eventData.seatsVIP,
        seats_vvip: eventData.seatsVVIP,
      };

      const response = await fetch('http://localhost:3003/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendEvent),
      });
      
      if (response.ok) {
        fetchEvents();
      }
    } catch (error) {
      console.error('Failed to add event:', error);
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`http://localhost:3003/api/events/${eventId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchEvents();
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const addBooking = (booking: Booking) => {
    setBookings([...bookings, booking]);
    // Refresh events to get updated seat counts
    fetchEvents();
  };

  return (
    <EventContext.Provider value={{
      events,
      bookings,
      selectedEvent,
      setSelectedEvent,
      selectedTicketClass,
      setSelectedTicketClass,
      checkoutSeats,
      setCheckoutSeats,
      checkoutTicket,
      setCheckoutTicket,
      addEvent,
      deleteEvent,
      addBooking,
      isEventLoading
    }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
}
