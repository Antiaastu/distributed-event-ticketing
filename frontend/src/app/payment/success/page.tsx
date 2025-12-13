'use client';

import { useEffect, useState, Suspense } from 'react';
import { CheckCircle, Home, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function PaymentSuccessContent() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [debugInfo, setDebugInfo] = useState<string>('');
  const searchParams = useSearchParams();
  const txRef = searchParams.get('tx_ref') || searchParams.get('trx_ref');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!txRef) {
        console.error('No transaction reference found in URL');
        setDebugInfo('No transaction reference found in URL. Params: ' + searchParams.toString());
        setStatus('error');
        return;
      }

      try {
        const response = await fetch(`http://localhost:3004/api/payments/verify/${txRef}`);
        if (response.ok) {
          const data = await response.json();
          if (data.payment && data.payment.status === 'success') {
            setStatus('success');
          } else {
            setDebugInfo(JSON.stringify(data));
            setStatus('error');
          }
        } else {
          const errorText = await response.text();
          setDebugInfo(`Server error: ${response.status} - ${errorText}`);
          setStatus('error');
        }
      } catch (error) {
        console.error('Payment verification failed:', error);
        setDebugInfo(`Network error: ${error}`);
        setStatus('error');
      }
    };

    verifyPayment();
  }, [txRef, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        {status === 'verifying' ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Verifying Payment...</h2>
            <p className="text-gray-500 dark:text-gray-400">Please wait while we confirm your transaction.</p>
          </div>
        ) : status === 'success' ? (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Payment Successful!</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Your booking has been confirmed. A confirmation email has been sent to you.
            </p>
            <Link 
              href="/events"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors w-full"
            >
              <Home className="w-5 h-5" />
              Return to Dashboard
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Verification Failed</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              We couldn&apos;t verify your payment. Please contact support if you believe this is an error.
            </p>
            {debugInfo && (
              <div className="mb-6 p-3 bg-gray-100 dark:bg-gray-900 rounded text-xs text-left w-full overflow-auto max-h-32">
                <p className="font-bold text-red-500 mb-1">Debug Info:</p>
                <pre>{debugInfo}</pre>
              </div>
            )}
            <Link 
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-xl font-semibold transition-colors w-full"
            >
              <Home className="w-5 h-5" />
              Return to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
