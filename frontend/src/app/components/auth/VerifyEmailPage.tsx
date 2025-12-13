'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';

interface VerifyEmailPageProps {
  onVerified: () => void;
  onLoginClick: () => void;
}

export function VerifyEmailPage({ onVerified, onLoginClick }: VerifyEmailPageProps) {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'pending_approval'>('verifying');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      const email = searchParams.get('email');

      if (!token || !email) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        const response = await fetch('http://localhost:3001/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, code: token }),
        });

        const data = await response.json();

        if (response.ok) {
          // If no tokens returned, it means pending approval (for organizers)
          if (!data.access_token) {
            setStatus('pending_approval');
            setMessage('Email verified! Your organizer account is pending admin approval. You will be notified once approved.');
            return;
          }

          // Store tokens
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);

          // Check user role and approval status
          try {
            const meResponse = await fetch('http://localhost:3001/api/auth/me', {
              headers: {
                'Authorization': `Bearer ${data.access_token}`
              }
            });
            
            if (meResponse.ok) {
              const userData = await meResponse.json();
              if (userData.role === 'organizer' && userData.approval_status === 'pending') {
                setStatus('pending_approval');
                setMessage('Email verified! Your organizer account is pending admin approval. You will be notified once approved.');
                // Clear tokens so they don't auto-login next time
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                return;
              }
            }
          } catch (err) {
            console.error('Failed to fetch user profile', err);
          }

          setStatus('success');
          setMessage('Email verified successfully! Logging you in...');
          
          // Wait a moment before redirecting
          setTimeout(() => {
            onVerified();
          }, 1000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed');
        }
      } catch {
        setStatus('error');
        setMessage('An error occurred during verification');
      }
    };

    verifyEmail();
  }, [searchParams, onVerified]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
      <div className="bg-[var(--card)] p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-[var(--border)]">
        <div className="flex justify-center mb-6">
          {status === 'verifying' && (
            <Loader2 className="w-16 h-16 text-[var(--primary)] animate-spin" />
          )}
          {status === 'success' && (
            <CheckCircle className="w-16 h-16 text-green-500" />
          )}
          {status === 'error' && (
            <XCircle className="w-16 h-16 text-red-500" />
          )}
          {status === 'pending_approval' && (
            <Clock className="w-16 h-16 text-orange-500" />
          )}
        </div>
        
        <h2 className="text-2xl font-bold mb-4 text-[var(--foreground)]">
          {status === 'verifying' ? 'Verifying Email' : 
           status === 'success' ? 'Verified!' : 
           status === 'pending_approval' ? 'Pending Approval' : 'Verification Failed'}
        </h2>
        
        <p className="text-[var(--muted-foreground)] mb-8">
          {message}
        </p>

        {(status === 'error' || status === 'pending_approval') && (
          <button
            onClick={onLoginClick}
            className="w-full py-3 bg-[var(--primary)] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            Back to Login
          </button>
        )}
      </div>
    </div>
  );
}
