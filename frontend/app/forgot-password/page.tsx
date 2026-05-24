'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { authAPI } from '@/services/api';
import { toast } from 'react-toastify';
import Link from 'next/link';

const schema = z.object({ email: z.string().email('Invalid email') });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      await authAPI.forgotPassword(data);
      setSent(true);
      toast.success('Reset link sent to your email');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password</h2>
        {sent ? (
          <div className="text-center py-8">
            <p className="text-green-600 font-medium mb-4">Reset link sent! Check your email.</p>
            <Link href="/login" className="text-blue-600 hover:underline">Back to Login</Link>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">Enter your email to receive a password reset link.</p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" {...register('email')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="john@example.com" />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
              </div>
              <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition">
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            <p className="mt-4 text-center text-sm">
              <Link href="/login" className="text-blue-600 hover:underline">Back to Login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
