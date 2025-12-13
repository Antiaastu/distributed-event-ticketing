import { useState } from 'react';
import { CreditCard, Lock, User } from 'lucide-react';

interface PaymentFormProps {
  total: number;
  isProcessing: boolean;
  onSubmit: (e: React.FormEvent, firstName: string, lastName: string) => void;
  initialFirstName?: string;
  initialLastName?: string;
}

export function PaymentForm({ total, isProcessing, onSubmit, initialFirstName = '', initialLastName = '' }: PaymentFormProps) {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e, firstName, lastName);
  };

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-lg flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4>Payment Details</h4>
          <p className="text-xs text-[var(--muted-foreground)]">Complete your purchase securely with Chapa</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block mb-2 text-sm">
              First Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all"
                placeholder="John"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="lastName" className="block mb-2 text-sm">
              Last Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all"
                placeholder="Doe"
                required
              />
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Pay ${total.toFixed(2)}
              </>
            )}
          </button>
          <p className="text-xs text-center text-[var(--muted-foreground)] mt-4">
            You will be redirected to Chapa to complete your payment securely.
          </p>
        </div>
      </form>
    </div>
  );
}
