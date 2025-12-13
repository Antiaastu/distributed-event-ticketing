'use client';

import { ArrowLeft, Sparkles } from 'lucide-react';
import { useTheme } from '../providers/ThemeProvider';
import { LoginForm } from './forms/LoginForm';

interface LoginPageProps {
  onLogin: (email: string) => void;
  onBackToHome: () => void;
  onSwitchToSignup: () => void;
  onForgotPassword: () => void;
}

export function LoginPage({ onLogin, onBackToHome, onSwitchToSignup, onForgotPassword }: LoginPageProps) {
  const { theme, mounted } = useTheme();
  const effectiveTheme = mounted ? theme : 'light';
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
              <h2 className="mb-2">Welcome Back!</h2>
              <p className="text-[var(--muted-foreground)]">Log in to your account</p>
            </div>

            {/* Form */}
            <div className="p-8 pt-6">
              <LoginForm 
                onLogin={onLogin}
                onForgotPassword={onForgotPassword}
              />

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--border)]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[var(--card)] text-[var(--muted-foreground)]">
                    Don&apos;t have an account?
                  </span>
                </div>
              </div>

              {/* Sign Up Link */}
              <button
                onClick={onSwitchToSignup}
                className="w-full py-4 bg-[var(--secondary)] text-[var(--foreground)] rounded-xl hover:bg-[var(--muted)] transition-all border border-[var(--border)]"
              >
                Create Account
              </button>
            </div>
          </div>

          {/* Security Badge */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--muted-foreground)]">
              🔒 Secured with enterprise-grade encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
