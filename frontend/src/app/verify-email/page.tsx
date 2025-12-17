'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

function VerifyEmailContent() {
  const router = useRouter();
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verify = async () => {
      const token = searchParams.get('token');
      const email = searchParams.get('email');

      if (!token || !email) {
        setStatus('error');
        setMessage('Invalid verification link.');
        return;
      }

      try {
        const response = await fetch('http://localhost:8080/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, code: token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('Email verified successfully! Logging you in...');
          
          if (data.access_token) {
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
            
            // Auto login
            const user = await login();
            
            setTimeout(() => {
              if (user?.role === 'admin' || user?.role === 'organizer') {
                router.push('/dashboard');
              } else {
                router.push('/events');
              }
            }, 1500);
          } else {
            setTimeout(() => {
              router.push('/login');
            }, 3000);
          }
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed.');
        }
      } catch {
        setStatus('error');
        setMessage('An error occurred during verification.');
      }
    };

    verify();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        {status === 'verifying' && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Verifying...</h2>
            <p className="text-gray-500 dark:text-gray-400">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Verified!</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{message}</p>
            <Link
              href="/?screen=login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors w-full"
            >
              Go to Login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Verification Failed</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{message}</p>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-xl font-semibold transition-colors w-full"
            >
              Return Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
