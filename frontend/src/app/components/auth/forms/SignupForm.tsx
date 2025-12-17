'use client';

import { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Check, FileText, Briefcase } from 'lucide-react';

interface SignupFormProps {
  onSwitchToLogin: () => void;
  onSuccess: (email: string) => void;
}

export function SignupForm({ onSwitchToLogin, onSuccess }: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'user' | 'organizer'>('user');
  const [document, setDocument] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (role === 'organizer' && !document) {
      setError('Please upload a verification document');
      return;
    }

    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('role', role);
      if (role === 'organizer' && document) {
        formData.append('document', document);
      }

      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      onSuccess(email);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRequirements = [
    { met: password.length >= 6, text: 'At least 6 characters' },
    { met: /[A-Z]/.test(password), text: 'One uppercase letter' },
    { met: /[0-9]/.test(password), text: 'One number' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Role Selection */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setRole('user')}
          className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
            role === 'user'
              ? 'border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)]'
              : 'border-[var(--border)] hover:border-[var(--muted-foreground)] text-[var(--muted-foreground)]'
          }`}
        >
          <User className="w-6 h-6" />
          <span className="font-medium">User</span>
        </button>
        <button
          type="button"
          onClick={() => setRole('organizer')}
          className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
            role === 'organizer'
              ? 'border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)]'
              : 'border-[var(--border)] hover:border-[var(--muted-foreground)] text-[var(--muted-foreground)]'
          }`}
        >
          <Briefcase className="w-6 h-6" />
          <span className="font-medium">Organizer</span>
        </button>
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block mb-2 text-sm">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
            placeholder="you@example.com"
          />
        </div>
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block mb-2 text-sm">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-12 pr-12 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
            placeholder="Create a strong password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {/* Password Requirements */}
        {password && (
          <div className="mt-3 space-y-2">
            {passwordRequirements.map((req, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  req.met ? 'bg-[var(--primary)] text-white' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                }`}>
                  {req.met && <Check className="w-3 h-3" />}
                </div>
                <span className={req.met ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'}>
                  {req.text}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Password Field */}
      <div>
        <label htmlFor="confirmPassword" className="block mb-2 text-sm">
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full pl-12 pr-12 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
            placeholder="Confirm your password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Document Upload (Organizer Only) */}
      {role === 'organizer' && (
        <div className="animate-fadeIn">
          <label htmlFor="document" className="block mb-2 text-sm">
            Verification Document
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)] flex items-center justify-center">
              <FileText className="w-full h-full" />
            </div>
            <input
              id="document"
              type="file"
              onChange={(e) => setDocument(e.target.files?.[0] || null)}
              className="w-full pl-12 pr-4 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--primary)]/10 file:text-[var(--primary)] hover:file:bg-[var(--primary)]/20"
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </div>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Please upload a valid ID or business license (PDF, JPG, PNG)
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Terms */}
      <p className="text-xs text-[var(--muted-foreground)]">
        By creating an account, you agree to our{' '}
        <a href="#" className="text-[var(--primary)] hover:text-[var(--accent)]">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="#" className="text-[var(--primary)] hover:text-[var(--accent)]">
          Privacy Policy
        </a>
      </p>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Creating account...
          </div>
        ) : (
          'Create Account'
        )}
      </button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border)]"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-[var(--card)] text-[var(--muted-foreground)]">
            Already have an account?
          </span>
        </div>
      </div>

      {/* Login Link */}
      <button
        type="button"
        onClick={onSwitchToLogin}
        className="w-full py-4 bg-[var(--secondary)] text-[var(--foreground)] rounded-xl hover:bg-[var(--muted)] transition-all border border-[var(--border)]"
      >
        Log In
      </button>
    </form>
  );
}