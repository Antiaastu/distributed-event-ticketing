'use client';

import { ChevronRight } from 'lucide-react';
import { useTheme } from '../../providers/ThemeProvider';

interface CTASectionProps {
  onGetStarted: () => void;
}

export function CTASection({ onGetStarted }: CTASectionProps) {
  const { theme, mounted } = useTheme();
  const effectiveTheme = mounted ? theme : 'light';

  return (
    <div className={effectiveTheme === 'dark' 
      ? 'bg-gradient-to-br from-[#0a192f] via-[#112240] to-[#0a192f] py-20' 
      : 'bg-gradient-to-br from-emerald-50 via-white to-green-50 py-20'
    }>
      <div className="container mx-auto px-4 text-center">
        <h2 className="mb-4">Ready to Get Started?</h2>
        <p className="text-xl text-[var(--muted-foreground)] mb-8 max-w-2xl mx-auto">
          Join TicketHub today and experience hassle-free event ticketing
        </p>
        <button
          onClick={onGetStarted}
          className="px-8 py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 mx-auto pulse-glow"
        >
          Create Your Account
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}