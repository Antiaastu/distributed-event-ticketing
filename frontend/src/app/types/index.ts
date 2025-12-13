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
  imageUrl?: string;
  organizerId: string;
  organizerName: string;
  
  // Ticket Class Details
  seatsNormal: number;
  priceNormal: number;
  seatsVIP: number;
  priceVIP: number;
  seatsVVIP: number;
  priceVVIP: number;
  availableNormal?: number;
  availableVIP?: number;
  availableVVIP?: number;
}

export type SeatStatus = 'available' | 'selected' | 'sold' | 'locked';

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
  seats: Array<{
    id: string;
    row: number;
    number: number;
    price: number;
  }>;
  totalAmount: number;
  bookingDate: string;
  status: 'confirmed' | 'cancelled';
}

export type UserRole = 'admin' | 'organizer' | 'user';

export interface User {
  email: string;
  name: string;
  role: UserRole;
  id: string;
}
