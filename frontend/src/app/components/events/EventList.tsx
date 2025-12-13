'use client';

import { Calendar, MapPin, Clock, Users, ChevronRight, Sparkles } from 'lucide-react';
import { Event } from '../../types';

interface EventListProps {
  events: Event[];
  onSelectEvent: (event: Event) => void;
}

export function EventList({ events, onSelectEvent }: EventListProps) {
  if (!events) {
    return <div className="text-center py-12">Loading events...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2">Browse Events</h2>
        <p className="text-[var(--muted-foreground)]">Select an event to book your tickets</p>
      </div>

      {events.length === 0 ? (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-[var(--muted)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-[var(--muted-foreground)]" />
          </div>
          <h4 className="mb-2">No Events Available</h4>
          <p className="text-[var(--muted-foreground)]">Check back later for upcoming events</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {events.map(event => (
            <div
              key={event.id}
              className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden hover:shadow-xl transition-all group"
            >
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Event Image/Icon */}
                  <div className="w-full sm:w-32 h-32 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="mb-1 truncate">{event.name}</h4>
                        <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">
                          {event.description}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[var(--secondary)] rounded-lg flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-4 h-4 text-[var(--primary)]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-[var(--muted-foreground)]">Date</p>
                          <p className="text-sm truncate">{event.date}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[var(--secondary)] rounded-lg flex items-center justify-center flex-shrink-0">
                          <Clock className="w-4 h-4 text-[var(--primary)]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-[var(--muted-foreground)]">Time</p>
                          <p className="text-sm truncate">{event.time}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[var(--secondary)] rounded-lg flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-4 h-4 text-[var(--primary)]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-[var(--muted-foreground)]">Venue</p>
                          <p className="text-sm truncate">{event.venue}</p>
                        </div>
                      </div>
                    </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="flex items-center gap-4">
                            <span className="text-[var(--muted-foreground)]">
                              From <span className="text-[var(--primary)]">${event.basePrice}</span>
                            </span>
                            <span className="text-[var(--muted-foreground)]">
                              <Users className="w-4 h-4 inline mr-1" />
                              {event.availableSeats} / {event.totalSeats} available
                            </span>
                          </div>
                          <div className="flex gap-3 text-xs text-[var(--muted-foreground)] pl-1">
                            <span>Normal: {event.availableNormal ?? '-'}</span>
                            <span>VIP: {event.availableVIP ?? '-'}</span>
                            <span>VVIP: {event.availableVVIP ?? '-'}</span>
                          </div>
                        </div>

                      <button
                        onClick={() => onSelectEvent(event)}
                        className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
                      >
                        Book Tickets
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
