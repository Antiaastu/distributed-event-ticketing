'use client';

import { Star } from 'lucide-react';

export function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Music Enthusiast',
      content: 'Best ticketing platform I\'ve ever used! The seat selection is so smooth and intuitive.',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Event Organizer',
      content: 'TicketHub has transformed how we sell tickets. The interface is beautiful and easy to use.',
      rating: 5,
    },
    {
      name: 'Emily Davis',
      role: 'Theater Fan',
      content: 'I love how I can see exactly which seats are available. Makes booking so much easier!',
      rating: 5,
    },
  ];

  return (
    <div className="bg-[var(--secondary)] py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="mb-4">Loved by Thousands</h2>
          <p className="text-xl text-[var(--muted-foreground)]">
            See what our customers have to say
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="p-6 bg-[var(--card)] rounded-2xl border border-[var(--border)] hover:shadow-xl transition-all"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[var(--primary)] text-[var(--primary)]" />
                ))}
              </div>
              <p className="text-[var(--foreground)] mb-4">{testimonial.content}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-full flex items-center justify-center text-white">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm">{testimonial.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}