'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { authAPI } from '@/services/api';
import { useAuth } from '@/store/authContext';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password is required')
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(data);
      const token = response.data.token;

      // Store in localStorage for API interceptor
      localStorage.setItem('token', token);
      // Also store in cookie so Next.js middleware can protect routes
      document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

      setUser(response.data.user);
      toast.success('Logged in successfully');
      // Use a small delay to ensure state is updated before navigation
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Sign In</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input type="email" {...register('email')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="john@example.com" />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input type="password" {...register('password')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="••••••••" />
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition">
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <div className="mt-4 space-y-2 text-center text-sm">
          <Link href="/forgot-password" className="text-blue-600 hover:underline block">Forgot Password?</Link>
          <p className="text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:underline font-medium">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
