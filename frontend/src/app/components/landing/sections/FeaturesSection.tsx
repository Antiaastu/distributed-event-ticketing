'use client';

import { Ticket, Calendar, Shield, Zap } from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: <Ticket className="w-8 h-8" />,
      title: 'Easy Booking',
      description: 'Select your seats and book tickets in seconds with our intuitive interface',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure Payment',
      description: 'Your transactions are protected with enterprise-grade security',
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Instant Confirmation',
      description: 'Get your tickets delivered instantly via email after purchase',
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Event Management',
      description: 'Browse and manage all your upcoming events in one place',
    },
  ];

  return (
    <div className="bg-[var(--background)] py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="mb-4">Why Choose TicketHub?</h2>
          <p className="text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto">
            We make event ticketing simple, secure, and enjoyable
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-[var(--card)] rounded-2xl border border-[var(--border)] hover:shadow-xl hover:scale-105 transition-all"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-xl flex items-center justify-center mb-4 text-white">
                {feature.icon}
              </div>
              <h5 className="mb-2">{feature.title}</h5>
              <p className="text-[var(--muted-foreground)]">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}