'use client';

import { useState } from 'react';
import { X, Calendar, MapPin, Clock, DollarSign, Users } from 'lucide-react';
import { Event } from '../../types';

interface AddEventModalProps {
  onClose: () => void;
  onAdd: (event: Omit<Event, 'id'>) => void;
  userEmail: string;
}

export function AddEventModal({ onClose, onAdd, userEmail }: AddEventModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    venue: '',
    description: '',
    rows: 10,
    seatsPerRow: 15,
    basePrice: 50,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const event: Omit<Event, 'id'> = {
      ...formData,
      totalSeats: formData.rows * formData.seatsPerRow,
      organizerId: userEmail,
      organizerName: userEmail.split('@')[0],
    };

    onAdd(event);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[var(--card)] border-b border-[var(--border)] p-6 flex items-center justify-between">
          <h3>Add New Event</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--muted)] rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block mb-2 text-sm">Event Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
              placeholder="The Midnight Symphony Orchestra"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all resize-none"
              placeholder="Event description..."
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm">
                <Clock className="w-4 h-4 inline mr-1" />
                Time
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm">
              <MapPin className="w-4 h-4 inline mr-1" />
              Venue
            </label>
            <input
              type="text"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              className="w-full px-4 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
              placeholder="Grand Theater - Downtown"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2 text-sm">
                <Users className="w-4 h-4 inline mr-1" />
                Rows
              </label>
              <input
                type="number"
                value={formData.rows}
                onChange={(e) => setFormData({ ...formData, rows: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                min="1"
                max="26"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm">Seats/Row</label>
              <input
                type="number"
                value={formData.seatsPerRow}
                onChange={(e) => setFormData({ ...formData, seatsPerRow: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                min="1"
                max="30"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Base Price
              </label>
              <input
                type="number"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                min="1"
                required
              />
            </div>
          </div>

          <div className="bg-[var(--secondary)] rounded-xl p-4 border border-[var(--border)]">
            <p className="text-sm text-[var(--muted-foreground)]">
              Total Seats: <span className="text-[var(--primary)]">{formData.rows * formData.seatsPerRow}</span>
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-[var(--secondary)] text-[var(--foreground)] rounded-xl hover:bg-[var(--muted)] transition-all border border-[var(--border)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all"
            >
              Add Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
