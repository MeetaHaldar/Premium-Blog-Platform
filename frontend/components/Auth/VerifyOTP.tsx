'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { authAPI } from '@/services/api';
import { toast } from 'react-toastify';
import { useRouter, useSearchParams } from 'next/navigation';

const otpSchema = z.object({ otp: z.string().length(6, 'OTP must be 6 digits') });
type OTPFormData = z.infer<typeof otpSchema>;

export default function VerifyOTP() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get('email') || '';
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(300);

  const { register, handleSubmit, formState: { errors } } = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema)
  });

  useEffect(() => {
    const interval = setInterval(() => setTimer((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, []);

  const onSubmit = async (data: OTPFormData) => {
    try {
      setIsLoading(true);
      await authAPI.verifyOTP({ email, otp: data.otp });
      toast.success('Email verified successfully');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setResendLoading(true);
      await authAPI.resendOTP({ email });
      setTimer(300);
      toast.success('OTP resent to your email');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify Email</h2>
        <p className="text-gray-600 mb-6">We sent a 6-digit code to {email}</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">OTP Code</label>
            <input type="text" {...register('otp')} maxLength={6} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest" placeholder="000000" />
            {errors.otp && <p className="mt-1 text-sm text-red-500">{errors.otp.message}</p>}
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition">
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-4">
            Didn&apos;t receive code?{' '}
            {timer > 0 ? (
              <span className="text-blue-600 font-medium">Resend in {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</span>
            ) : (
              <button onClick={handleResendOTP} disabled={resendLoading} className="text-blue-600 hover:underline disabled:text-gray-400">
                {resendLoading ? 'Sending...' : 'Resend OTP'}
              </button>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
