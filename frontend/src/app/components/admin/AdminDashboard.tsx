'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '../layout/Sidebar';
import { Plus } from 'lucide-react';
import { StatsGrid } from './dashboard/StatsGrid';
import { PendingOrganizers } from './dashboard/PendingOrganizers';
import { AllBookings } from './dashboard/AllBookings';
import { AllUsers } from './dashboard/AllUsers';
import { AuditLogs } from './dashboard/AuditLogs';
import { Event, Booking } from '../../types';
import { AddEventModal } from './AddEventModal';
import { EventManagement } from './EventManagement';
import { SettingsPage } from '../layout/SettingsPage';

interface AdminDashboardProps {
  userEmail: string;
  onLogout: () => void;
  events: Event[];
  bookings: Booking[];
  onAddEvent: (event: Omit<Event, 'id'>) => void;
  onDeleteEvent: (eventId: string) => void;
}

interface User {
  id: number;
  email: string;
  role: string;
  approval_status: string;
  created_at: string;
}

interface AuditLog {
  id: number;
  action: string;
  details: string;
  created_at: string;
  user_id: number;
}

export function AdminDashboard({ 
  userEmail, 
  onLogout, 
  events, 
  bookings,
  onAddEvent,
  onDeleteEvent 
}: AdminDashboardProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'bookings' | 'organizers' | 'users' | 'audit-logs'>('overview');
  const [isRestoring, setIsRestoring] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  
  const [pendingOrganizers, setPendingOrganizers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  const API_URL = 'http://localhost:8080/api/auth';

  useEffect(() => {
    const storedTab = localStorage.getItem('adminActiveTab');
    if (storedTab) {
      setActiveTab(storedTab as any);
    }
    setIsRestoring(false);
  }, []);

  useEffect(() => {
    if (!isRestoring) {
      localStorage.setItem('adminActiveTab', activeTab);
    }
  }, [activeTab, isRestoring]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [organizersRes, usersRes, logsRes] = await Promise.all([
        fetch(`${API_URL}/admin/organizers/pending`, { headers }),
        fetch(`${API_URL}/admin/users`, { headers }),
        fetch(`${API_URL}/admin/audit-logs`, { headers })
      ]);

      if (organizersRes.ok) setPendingOrganizers(await organizersRes.json());
      if (usersRes.ok) setAllUsers(await usersRes.json());
      if (logsRes.ok) setAuditLogs(await logsRes.json());

    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'dashboard') {
      fetchAdminData();
    }
  }, [activeSection, activeTab]);

  const handleApproveOrganizer = async (userId: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/admin/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ user_id: userId })
      });

      if (res.ok) {
        fetchAdminData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to approve organizer:', error);
    }
  };

  const handleRejectOrganizer = async (userId: number) => {
    if (!confirm('Are you sure you want to reject this organizer?')) return;
    
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/admin/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ user_id: userId })
      });

      if (res.ok) {
        fetchAdminData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to reject organizer:', error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/admin/users`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ user_id: userId })
      });

      if (res.ok) {
        fetchAdminData(); // Refresh data
      } else {
        console.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const enrichedBookings = bookings.map(booking => {
    const user = allUsers.find(u => u.id.toString() === booking.userId);
    return {
      ...booking,
      userEmail: user ? user.email : booking.userEmail
    };
  });

  const confirmedBookings = enrichedBookings.filter(b => b.status === 'confirmed');
  const totalRevenue = confirmedBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
  const totalTicketsSold = confirmedBookings.reduce((sum, booking) => sum + booking.seats.length, 0);

  if (isRestoring) return null;

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar 
        userEmail={userEmail} 
        onLogout={onLogout} 
        activeSection={activeSection} 
        onNavigate={setActiveSection}
        userRole="admin"
      />

      <main className="flex-1 w-full overflow-x-hidden">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeSection === 'dashboard' && (
            <>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                <div>
                  <h2 className="mb-2">Admin Dashboard</h2>
                  <p className="text-[var(--muted-foreground)]">Manage system, users, and events</p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Event
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {['overview', 'events', 'bookings', 'organizers', 'users', 'audit-logs'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap capitalize ${
                      activeTab === tab
                        ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white'
                        : 'bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--muted)]'
                    }`}
                  >
                    {tab.replace('-', ' ')}
                  </button>
                ))}
              </div>

              {/* Content */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <StatsGrid 
                    eventsCount={events.length}
                    usersCount={allUsers.length}
                    pendingCount={pendingOrganizers.length}
                    totalRevenue={totalRevenue}
                  />

                  <PendingOrganizers 
                    pendingOrganizers={pendingOrganizers}
                    onApprove={handleApproveOrganizer}
                    onReject={handleRejectOrganizer}
                    onViewAll={() => setActiveTab('organizers')}
                    preview={true}
                  />
                </div>
              )}

              {activeTab === 'events' && (
                <EventManagement 
                  events={events} 
                  bookings={enrichedBookings}
                  onDeleteEvent={onDeleteEvent}
                />
              )}

              {activeTab === 'bookings' && (
                <AllBookings bookings={enrichedBookings} />
              )}

              {activeTab === 'organizers' && (
                <PendingOrganizers 
                  pendingOrganizers={pendingOrganizers}
                  onApprove={handleApproveOrganizer}
                  onReject={handleRejectOrganizer}
                />
              )}

              {activeTab === 'users' && (
                <AllUsers users={allUsers} onDeleteUser={handleDeleteUser} />
              )}

              {activeTab === 'audit-logs' && (
                <AuditLogs logs={auditLogs} />
              )}
            </>
          )}

          {activeSection === 'settings' && <SettingsPage userEmail={userEmail} />}
        </div>
      </main>

      {showAddModal && (
        <AddEventModal
          onClose={() => setShowAddModal(false)}
          onAdd={onAddEvent}
          userEmail={userEmail}
        />
      )}
    </div>
  );
}
