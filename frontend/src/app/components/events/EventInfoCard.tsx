import { Calendar, Clock, MapPin, Sparkles } from 'lucide-react';
import { Event } from '../../types';

interface EventInfoCardProps {
  event: Event;
}

export function EventInfoCard({ event }: EventInfoCardProps) {
  return (
    <div className="bg-gradient-to-br from-[var(--primary)]/10 via-[var(--card)] to-[var(--accent)]/10 border border-[var(--border)] rounded-2xl p-6 shadow-xl overflow-hidden relative">
      {/* Decorative element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] opacity-10 rounded-full -mr-16 -mt-16"></div>
      
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-[var(--primary)]" />
          <span className="text-sm text-[var(--primary)]">Featured Event</span>
        </div>
        
        <h3 className="mb-4">{event.name}</h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-[var(--card)] rounded-xl border border-[var(--border)]">
            <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[var(--muted-foreground)]">Date</p>
              <p className="text-sm truncate">{event.date}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-[var(--card)] rounded-xl border border-[var(--border)]">
            <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[var(--muted-foreground)]">Time</p>
              <p className="text-sm truncate">{event.time}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-[var(--card)] rounded-xl border border-[var(--border)]">
            <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[var(--muted-foreground)]">Venue</p>
              <p className="text-sm truncate">{event.venue}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}