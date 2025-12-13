'use client';

import { useState } from 'react';
import { Mail, ArrowLeft, Sparkles } from 'lucide-react';
import { useTheme } from '../providers/ThemeProvider';
import { SignupForm } from './forms/SignupForm';

interface SignupPageProps {
  onSignup?: (email: string) => void;
  onBackToHome: () => void;
  onSwitchToLogin: () => void;
}

export function SignupPage({ onBackToHome, onSwitchToLogin }: SignupPageProps) {
  const { theme, mounted } = useTheme();
  const effectiveTheme = mounted ? theme : 'light';
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState('');

  if (isSuccess) {
    return (
      <div className={`min-h-screen ${effectiveTheme === 'dark' 
        ? 'bg-gradient-to-br from-[#0a192f] via-[#112240] to-[#0a192f]' 
        : 'bg-gradient-to-br from-emerald-50 via-white to-green-50'
      }`}>
        <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
          <div className="bg-[var(--card)] p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-[var(--border)]">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-[var(--foreground)]">Check your email</h2>
            <p className="text-[var(--muted-foreground)] mb-8">
              We&apos;ve sent a verification link to <strong>{email}</strong>. 
              Please click the link to verify your account and log in automatically.
            </p>
            <button
              onClick={onSwitchToLogin}
              className="text-[var(--primary)] hover:underline font-medium"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${effectiveTheme === 'dark' 
      ? 'bg-gradient-to-br from-[#0a192f] via-[#112240] to-[#0a192f]' 
      : 'bg-gradient-to-br from-emerald-50 via-white to-green-50'
    }`}>
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <button
          onClick={onBackToHome}
          className="absolute top-8 left-8 flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        <div className="w-full max-w-md animate-fadeIn">
          {/* Card */}
          <div className="bg-[var(--card)] rounded-3xl shadow-2xl border border-[var(--border)] overflow-hidden">
            {/* Header */}
            <div className="p-8 pb-6 text-center bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="mb-2">Create Account</h2>
              <p className="text-[var(--muted-foreground)]">Join TicketHub today</p>
            </div>

            {/* Form */}
            <div className="p-8 pt-6">
              <SignupForm 
                onSwitchToLogin={onSwitchToLogin}
                onSuccess={(email) => {
                  setEmail(email);
                  setIsSuccess(true);
                }}
              />
            </div>
          </div>

          {/* Security Badge */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--muted-foreground)]">
              🔒 Your data is encrypted and secure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
