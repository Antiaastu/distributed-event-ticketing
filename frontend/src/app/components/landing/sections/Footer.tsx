'use client';

import { Ticket } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[var(--card)] border-t border-[var(--border)] py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-lg flex items-center justify-center">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <span>TicketHub</span>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              Premium event ticketing made simple
            </p>
          </div>
          
          <div>
            <h5 className="mb-4">Product</h5>
            <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
              <li><a href="#" className="hover:text-[var(--primary)] transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-[var(--primary)] transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-[var(--primary)] transition-colors">Security</a></li>
            </ul>
          </div>
          
          <div>
            <h5 className="mb-4">Company</h5>
            <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
              <li><a href="#" className="hover:text-[var(--primary)] transition-colors">About</a></li>
              <li><a href="#" className="hover:text-[var(--primary)] transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-[var(--primary)] transition-colors">Careers</a></li>
            </ul>
          </div>
          
          <div>
            <h5 className="mb-4">Support</h5>
            <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
              <li><a href="#" className="hover:text-[var(--primary)] transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-[var(--primary)] transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-[var(--primary)] transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-[var(--border)] text-center text-sm text-[var(--muted-foreground)]">
          <p>&copy; {new Date().getFullYear()} TicketHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}