'use client';

import { useState } from 'react';
import { Mail, Lock, ArrowLeft, Key, CheckCircle } from 'lucide-react';
import { useTheme } from '../providers/ThemeProvider';

interface ForgotPasswordPageProps {
  onBackToLogin: () => void;
}

export function ForgotPasswordPage({ onBackToLogin }: ForgotPasswordPageProps) {
  const { theme, mounted } = useTheme();
  const effectiveTheme = mounted ? theme : 'light';
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to request password reset');

      setSuccessMessage('Reset code sent to your email');
      setStep('reset');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!code || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, new_password: newPassword }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to reset password');

      setSuccessMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        onBackToLogin();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${effectiveTheme === 'dark' 
      ? 'bg-gradient-to-br from-[#0a192f] via-[#112240] to-[#0a192f]' 
      : 'bg-gradient-to-br from-emerald-50 via-white to-green-50'
    }`}>
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <button
          onClick={onBackToLogin}
          className="absolute top-8 left-8 flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Login
        </button>

        <div className="w-full max-w-md animate-fadeIn">
          <div className="bg-[var(--card)] rounded-3xl shadow-2xl border border-[var(--border)] overflow-hidden">
            <div className="p-8 pb-6 text-center bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Key className="w-8 h-8 text-white" />
              </div>
              <h2 className="mb-2">Forgot Password</h2>
              <p className="text-[var(--muted-foreground)]">
                {step === 'request' ? 'Enter your email to receive a reset code' : 'Enter the code and your new password'}
              </p>
            </div>

            <div className="p-8 pt-6">
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {successMessage && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-500">
                  <CheckCircle className="w-5 h-5" />
                  <p className="text-sm font-medium">{successMessage}</p>
                </div>
              )}

              {step === 'request' ? (
                <form onSubmit={handleRequestReset} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block mb-2 text-sm font-medium">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-[var(--input)] border border-[var(--border)] focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent outline-none transition-all"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white font-semibold rounded-xl shadow-lg shadow-[var(--primary)]/25 hover:shadow-xl hover:shadow-[var(--primary)]/40 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Code'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div>
                    <label htmlFor="code" className="block mb-2 text-sm font-medium">Reset Code</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
                      <input
                        id="code"
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-[var(--input)] border border-[var(--border)] focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent outline-none transition-all"
                        placeholder="Enter code"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="block mb-2 text-sm font-medium">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
                      <input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-[var(--input)] border border-[var(--border)] focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent outline-none transition-all"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
                      <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-[var(--input)] border border-[var(--border)] focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent outline-none transition-all"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white font-semibold rounded-xl shadow-lg shadow-[var(--primary)]/25 hover:shadow-xl hover:shadow-[var(--primary)]/40 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
