'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { paymentAPI } from '@/services/api';
import { useAuth } from '@/store/authContext';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [blog, setBlog] = useState<any>(null);

  const sessionId = searchParams?.get('session_id');
  const slug = searchParams?.get('slug');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    if (!sessionId) { setStatus('error'); return; }
    verify();
  }, [authLoading, user, sessionId]);

  const verify = async () => {
    try {
      const response = await paymentAPI.verifySession({ sessionId: sessionId! });
      setBlog(response.data.blog);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <XCircle size={56} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Verification Failed</h1>
          <p className="text-gray-500 mb-6">We couldn&apos;t verify your payment. If you were charged, please contact support.</p>
          <Link href="/blogs" className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition font-medium">
            Browse Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={44} className="text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful!</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          You now have full access to <span className="font-semibold text-gray-700 dark:text-gray-200">{blog?.title || 'the article'}</span>.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href={`/blog/${slug || blog?.slug}`}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition font-semibold"
          >
            Read Full Article
          </Link>
          <Link href="/blogs" className="border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium">
            Browse More
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 size={40} className="animate-spin text-blue-600" /></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
