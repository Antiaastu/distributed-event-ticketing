'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SignupPage } from '../components/auth/SignupPage';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const router = useRouter();
  const { currentUser, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && currentUser) {
      if (currentUser.role === 'admin' || currentUser.role === 'organizer') {
        router.push('/dashboard');
      } else {
        router.push('/events');
      }
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || currentUser) return null;

  return (
    <SignupPage
      onSignup={() => router.push('/login')}
      onBackToHome={() => router.push('/')}
      onSwitchToLogin={() => router.push('/login')}
    />
  );
}
