'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '../layout/Sidebar';
import { SettingsPage } from '../layout/SettingsPage';
import { Plus } from 'lucide-react';
import { StatsOverview } from './dashboard/StatsOverview';
import { EventsList } from './dashboard/EventsList';
import { EventAnalytics } from './dashboard/EventAnalytics';
import { CreateEventModal } from './CreateEventModal';
import { EditEventModal } from './EditEventModal';
import { toast } from 'sonner';

interface Event {
  ID: number;
  title: string;
  description: string;
  date: string;
  location: string;
  total_seats: number;
  available_seats: number;
  organizer_id: number;
  available_normal?: number;
  available_vip?: number;
  available_vvip?: number;
}

interface Booking {
  ID: number;
  user_id: number;
  event_id: number;
  seat_count: number;
  total_amount: number;
  status: string;
  CreatedAt: string;
  user_email?: string; // Assuming backend might send this or we need to fetch it
}

interface OrganizerDashboardProps {
  userEmail: string;
  onLogout: () => void;
}

export function OrganizerDashboard({ userEmail, onLogout }: OrganizerDashboardProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventSales, setEventSales] = useState<Booking[]>([]);
  const [loadingSales, setLoadingSales] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  const EVENT_API_URL = 'http://localhost:8080/api/events';
  const BOOKING_API_URL = 'http://localhost:8080/api/bookings';

  const [totalBooked, setTotalBooked] = useState(0);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${EVENT_API_URL}/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setEvents(data || []);
      } else {
        toast.error('Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalSales = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${BOOKING_API_URL}/organizer/sales`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        const sales = data.sales || [];
        // Calculate total booked seats from confirmed sales only
        const total = sales
          .filter((booking: Booking) => booking.status === 'confirmed')
          .reduce((acc: number, curr: Booking) => acc + curr.seat_count, 0);
        setTotalBooked(total);
      }
    } catch (error) {
      console.error('Error fetching total sales:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchTotalSales();
  }, []);

  const handleCreateEvent = async (eventData: any) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${EVENT_API_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
      });

      if (res.ok) {
        toast.success('Event created successfully');
        fetchEvents();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Error creating event');
    }
  };

  const handleUpdateEvent = async (eventId: number, updates: any) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${EVENT_API_URL}/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (res.ok) {
        toast.success('Event updated successfully');
        fetchEvents();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update event');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Error updating event');
    }
  };

  const handleViewStats = async (event: Event) => {
    setSelectedEvent(event);
    setLoadingSales(true);
    try {
      const token = localStorage.getItem('access_token');
      // Corrected URL to match booking-service route: /api/organizer/sales/:eventId
      const res = await fetch(`${BOOKING_API_URL}/organizer/sales/${event.ID}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setEventSales(data.sales || []);
      } else {
        toast.error('Failed to fetch sales data');
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoadingSales(false);
    }
  };

  // Calculate total stats
  const totalEvents = events.length;
  const totalSeats = events.reduce((acc, curr) => acc + curr.total_seats, 0);
  // const totalBooked = events.reduce((acc, curr) => acc + (curr.total_seats - curr.available_seats), 0);

  return (
    <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Sidebar 
        userEmail={userEmail} 
        userRole="organizer"
        onLogout={onLogout} 
        activeSection={activeSection}
        onNavigate={setActiveSection}
      />
      
      <main className="flex-1 p-8 overflow-y-auto">
        {activeSection === 'settings' ? (
          <SettingsPage userEmail={userEmail} />
        ) : (
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Organizer Dashboard</h1>
                <p className="text-[var(--muted-foreground)]">Manage your events and track performance</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                <Plus className="w-5 h-5" />
                Create Event
              </button>
            </div>

            <StatsOverview totalEvents={totalEvents} totalSeats={totalSeats} totalBooked={totalBooked} />

            <EventsList 
              events={events} 
              loading={loading} 
              onEdit={(event) => {
                setEditingEvent(event);
                setShowEditModal(true);
              }}
              onViewStats={handleViewStats}
            />

            {selectedEvent && (
              <EventAnalytics 
                selectedEvent={selectedEvent}
                eventSales={eventSales}
                loadingSales={loadingSales}
                onClose={() => setSelectedEvent(null)}
              />
            )}

          </div>
        )}
      </main>

      {showCreateModal && (
        <CreateEventModal 
          onClose={() => setShowCreateModal(false)} 
          onCreate={handleCreateEvent} 
        />
      )}

      {showEditModal && editingEvent && (
        <EditEventModal
          event={editingEvent}
          onClose={() => {
            setShowEditModal(false);
            setEditingEvent(null);
          }}
          onUpdate={handleUpdateEvent}
        />
      )}
    </div>
  );
}