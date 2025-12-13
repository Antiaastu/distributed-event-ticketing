'use client';

import { Ticket, ChevronRight, Moon, Sun, Sparkles } from 'lucide-react';
import { useTheme } from '../../providers/ThemeProvider';

interface HeroSectionProps {
  onGetStarted: () => void;
  onLogin: () => void;
  isLoggedIn?: boolean;
  onDashboard?: () => void;
}

export function HeroSection({ onGetStarted, onLogin, isLoggedIn, onDashboard }: HeroSectionProps) {
  const { theme, toggleTheme, mounted } = useTheme();
  const effectiveTheme = mounted ? theme : 'light';

  const stats = [
    { value: '1M+', label: 'Tickets Sold' },
    { value: '50K+', label: 'Happy Customers' },
    { value: '500+', label: 'Events Monthly' },
    { value: '99.9%', label: 'Uptime' },
  ];

  return (
    <div className={effectiveTheme === 'dark' 
      ? 'bg-gradient-to-br from-[#0a192f] via-[#112240] to-[#0a192f]' 
      : 'bg-gradient-to-br from-emerald-50 via-white to-green-50'
    }>
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-xl flex items-center justify-center shadow-lg">
              <Ticket className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="hidden sm:block">
              <h4 className="text-[var(--foreground)]">TicketHub</h4>
              <p className="text-xs text-[var(--muted-foreground)]">Premium Events</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 sm:p-3 rounded-xl bg-[var(--card)] hover:bg-[var(--muted)] transition-all border border-[var(--border)]"
            >
              {effectiveTheme === 'dark' ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" />
              )}
            </button>
            {isLoggedIn ? (
              <button
                onClick={onDashboard}
                className="px-4 py-2 sm:px-6 sm:py-3 rounded-xl text-[var(--foreground)] hover:bg-[var(--muted)] transition-all text-sm sm:text-base font-medium"
              >
                Dashboard
              </button>
            ) : (
              <button
                onClick={onLogin}
                className="px-4 py-2 sm:px-6 sm:py-3 rounded-xl text-[var(--foreground)] hover:bg-[var(--muted)] transition-all text-sm sm:text-base"
              >
                Log In
              </button>
            )}
            <button
              onClick={isLoggedIn ? onDashboard : onGetStarted}
              className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all text-sm sm:text-base"
            >
              {isLoggedIn ? 'Go to Dashboard' : 'Get Started'}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--card)] rounded-full mb-6 border border-[var(--border)]">
            <Sparkles className="w-4 h-4 text-[var(--primary)]" />
            <span className="text-sm text-[var(--muted-foreground)]">Welcome to the Future of Event Ticketing</span>
          </div>

          <h1 className="mb-6 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
            Book Your Perfect Seat in Seconds
          </h1>
          
          <p className="text-xl text-[var(--muted-foreground)] mb-8 max-w-2xl mx-auto">
            Experience the easiest way to discover events, select your ideal seats, and secure tickets with confidence. Join thousands of happy customers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={isLoggedIn ? onDashboard : onGetStarted}
              className="px-8 py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 pulse-glow"
            >
              {isLoggedIn ? 'Go to Dashboard' : 'Start Booking Now'}
              <ChevronRight className="w-5 h-5" />
            </button>
            {!isLoggedIn && (
              <button
                onClick={onLogin}
                className="px-8 py-4 bg-[var(--card)] text-[var(--foreground)] rounded-xl hover:bg-[var(--muted)] transition-all border border-[var(--border)]"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-[var(--border)]">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="mb-2 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}