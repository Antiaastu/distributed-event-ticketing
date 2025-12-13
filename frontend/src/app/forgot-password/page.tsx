'use client';

import { useRouter } from 'next/navigation';
import { ForgotPasswordPage } from '../components/auth/ForgotPasswordPage';

export default function ForgotPassword() {
  const router = useRouter();

  return (
    <ForgotPasswordPage 
      onBackToLogin={() => router.push('/login')} 
    />
  );
}
