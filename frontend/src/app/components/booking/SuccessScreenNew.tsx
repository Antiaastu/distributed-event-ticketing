'use client';

import { CheckCircle, Download, Mail, Home, Sparkles, Calendar, MapPin, Clock } from 'lucide-react';
import { Seat } from '../../types';
import { useTheme } from '../providers/ThemeProvider';

interface SuccessScreenNewProps {
  selectedSeats: Seat[];
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  onBackToHome: () => void;
}

export function SuccessScreenNew({ 
  selectedSeats, 
  eventName,
  eventDate,
  eventTime,
  eventVenue,
  onBackToHome 
}: SuccessScreenNewProps) {
  const { theme, mounted } = useTheme();
  const effectiveTheme = mounted ? theme : 'light';
  const total = selectedSeats.reduce((sum, seat) => sum + seat.price, 0) * 1.1;

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      effectiveTheme === 'dark' 
        ? 'bg-gradient-to-br from-[#0a192f] via-[#112240] to-[#0a192f]' 
        : 'bg-gradient-to-br from-emerald-50 via-white to-green-50'
    }`}>
      <div className="max-w-3xl w-full animate-fadeIn">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10 p-6 sm:p-8 md:p-12 text-center border-b border-[var(--border)]">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl pulse-glow">
              <CheckCircle className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
            </div>
            <h2 className="mb-3">Booking Confirmed!</h2>
            <p className="text-[var(--muted-foreground)]">
              Your tickets are ready. We&apos;ve sent the confirmation to your email.
            </p>
          </div>

          {/* Booking Details */}
          <div className="p-6 sm:p-8 md:p-12">
            <div className="bg-gradient-to-br from-[var(--primary)]/5 to-[var(--accent)]/5 rounded-2xl p-4 sm:p-6 mb-6 border border-[var(--border)]">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[var(--primary)]" />
                <h4>Event Information</h4>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[var(--muted-foreground)]">Event</p>
                    <p className="truncate">{eventName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-[var(--card)] rounded-xl">
                    <Calendar className="w-5 h-5 text-[var(--primary)] flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-[var(--muted-foreground)]">Date</p>
                      <p className="text-sm truncate">{eventDate}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-[var(--card)] rounded-xl">
                    <Clock className="w-5 h-5 text-[var(--primary)] flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-[var(--muted-foreground)]">Time</p>
                      <p className="text-sm truncate">{eventTime}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-[var(--card)] rounded-xl">
                    <MapPin className="w-5 h-5 text-[var(--primary)] flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-[var(--muted-foreground)]">Venue</p>
                      <p className="text-sm truncate">{eventVenue}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Seats */}
              <div className="border-t border-[var(--border)] pt-4">
                <p className="text-sm text-[var(--muted-foreground)] mb-3">Your Seats</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSeats.map(seat => (
                    <div
                      key={seat.id}
                      className="px-4 py-2 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-lg shadow-md"
                    >
                      <span className="text-sm">
                        {String.fromCharCode(64 + seat.row)}{seat.number}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-[var(--border)] pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span>Total Paid</span>
                  <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
                    ${total.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <button className="flex items-center justify-center gap-3 px-6 py-4 bg-[var(--secondary)] hover:bg-[var(--muted)] rounded-xl transition-all border border-[var(--border)]">
                <Download className="w-5 h-5 text-[var(--primary)]" />
                <span>Download Tickets</span>
              </button>
              <button className="flex items-center justify-center gap-3 px-6 py-4 bg-[var(--secondary)] hover:bg-[var(--muted)] rounded-xl transition-all border border-[var(--border)]">
                <Mail className="w-5 h-5 text-[var(--primary)]" />
                <span>Email Tickets</span>
              </button>
            </div>

            <button
              onClick={onBackToHome}
              className="w-full py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">
            🎉 Your booking reference has been sent to your email
          </p>
        </div>
      </div>
    </div>
  );
}