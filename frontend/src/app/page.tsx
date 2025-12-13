'use client';

import { useRouter } from 'next/navigation';
import { LandingPage } from './components/landing/LandingPage';
import { useAuth } from './context/AuthContext';

export default function Home() {
  const router = useRouter();
  const { currentUser } = useAuth();

  const handleDashboard = () => {
    if (currentUser?.role === 'admin' || currentUser?.role === 'organizer') {
      router.push('/dashboard');
    } else {
      router.push('/events');
    }
  };

  return (
    <LandingPage
      onGetStarted={() => router.push('/signup')}
      onLogin={() => router.push('/login')}
      isLoggedIn={!!currentUser}
      onDashboard={handleDashboard}
    />
  );
}
