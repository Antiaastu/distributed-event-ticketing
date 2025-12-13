export type UserRole = 'user' | 'admin' | 'organizer';

export type AppScreen = 'landing' | 'login' | 'signup' | 'forgot-password' | 'verify-email' | 'dashboard' | 'eventSelection' | 'seatSelection' | 'checkout' | 'success' | 'myevents' | 'mytickets';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  totalSeats: number;
  availableSeats: number;
  rows: number;
  seatsPerRow: number;
  basePrice: number;
  organizerId: string;
  organizerName: string;
  
  // New fields
  priceNormal: number;
  priceVIP: number;
  priceVVIP: number;
  seatsNormal: number;
  seatsVIP: number;
  seatsVVIP: number;
  availableNormal: number;
  availableVIP: number;
  availableVVIP: number;
}

export type SeatStatus = 'available' | 'locked' | 'sold' | 'selected';

export interface Seat {
  id: string;
  row: number;
  number: number;
  status: SeatStatus;
  price: number;
}

export interface Booking {
  id: string;
  eventId: string;
  eventName: string;
  userId: string;
  userEmail: string;
  seats: Seat[];
  totalAmount: number;
  bookingDate: string;
  status: 'confirmed' | 'cancelled';
  timestamp?: number;
}
