'use client';

import { useAuth } from '@/store/authContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import BlogEditor from '@/components/Blog/BlogEditor';
import { blogAPI } from '@/services/api';
import { toast } from 'react-toastify';

export default function EditBlogPage({ params }: { params: { id: string } }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        // We fetch by getting all my blogs and finding by id
        const response = await blogAPI.getMyBlogs({ limit: 100 });
        const found = response.data.blogs.find((b: any) => b._id === params.id);
        if (!found) { toast.error('Blog not found'); router.push('/dashboard'); return; }
        setBlog(found);
      } catch {
        toast.error('Failed to load blog');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchBlog();
  }, [user, params.id]);

  if (isLoading || loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Edit Blog</h1>
      <div className="bg-white rounded-lg shadow-md p-8">
        {blog && <BlogEditor initialData={blog} isEditing />}
      </div>
    </div>
  );
}
