'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginPage } from '../components/auth/LoginPage';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const router = useRouter();
  const { login, currentUser, isLoading } = useAuth();

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

  const handleLogin = async () => {
    const user = await login();
    if (user) {
      if (user.role === 'admin' || user.role === 'organizer') {
        router.push('/dashboard');
      } else {
        router.push('/events');
      }
    }
  };

  return (
    <LoginPage
      onLogin={handleLogin}
      onBackToHome={() => router.push('/')}
      onSwitchToSignup={() => router.push('/signup')}
      onForgotPassword={() => router.push('/forgot-password')}
    />
  );
}
