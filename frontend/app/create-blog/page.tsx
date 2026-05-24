'use client';

import { useAuth } from '@/store/authContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import BlogEditor from '@/components/Blog/BlogEditor';

export default function CreateBlogPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  if (isLoading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Create New Blog</h1>
      <div className="bg-white rounded-lg shadow-md p-8">
        <BlogEditor />
      </div>
    </div>
  );
}
