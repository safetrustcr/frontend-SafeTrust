'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { KeyRound } from 'lucide-react';
import Buildings from '@/components/auth/ui/Buildings';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import InvalidResetToken from '@/components/auth/InvalidResetToken';

function ResetPasswordContent() {
  const [isValidToken, setIsValidToken] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        return;
      }

      try {
        const response = await fetch(`/api/auth/validate-reset-token?token=${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Invalid token');
        }

        setIsValidToken(true);
      } catch (error) {
        setIsValidToken(false);
      }
    };

    validateToken();
  }, [token]);

  const handleResetPassword = async (password: string) => {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword: password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to reset password');
    }

    // Redirect to login after 3 seconds
    setTimeout(() => {
      router.push('/login');
    }, 3000);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <Buildings />
      {!token || !isValidToken ? (
        <InvalidResetToken />
      ) : (
        <div className="relative z-10 w-full max-w-sm space-y-6 text-center">
          <div className="flex justify-center">
            <div className="bg-[#2857B8] p-3 rounded-full">
              <KeyRound className="h-10 w-10 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="text-gray-500 text-sm">Enter your new password below</p>

          <ResetPasswordForm 
            onSubmit={handleResetPassword}
            isValidToken={isValidToken}
          />
        </div>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
} 