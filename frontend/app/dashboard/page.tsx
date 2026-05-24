'use client';

import { useAuth } from '@/store/authContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, BookOpen, Heart, ShoppingBag, Trash2, Edit, User } from 'lucide-react';
import { blogAPI } from '@/services/api';
import { toast } from 'react-toastify';
import ConfirmDialog from '@/components/UI/ConfirmDialog';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [myBlogs, setMyBlogs] = useState<any[]>([]);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteTitle, setDeleteTitle] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) fetchMyBlogs();
  }, [user]);

  const fetchMyBlogs = async () => {
    try {
      const response = await blogAPI.getMyBlogs({ limit: 5 });
      setMyBlogs(response.data.blogs);
    } catch {
      console.error('Failed to fetch blogs');
    } finally {
      setBlogsLoading(false);
    }
  };

  const confirmDelete = (id: string, title: string) => {
    setDeleteId(id);
    setDeleteTitle(title);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await blogAPI.deleteBlog(deleteId);
      toast.success('Blog deleted');
      setMyBlogs(myBlogs.filter(b => b._id !== deleteId));
    } catch {
      toast.error('Failed to delete blog');
    } finally {
      setDeleting(false);
      setDeleteId(null);
      setDeleteTitle('');
    }
  };

  if (isLoading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-10 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=2563eb&color=fff&size=64`}
            alt={user?.name}
            className="w-14 h-14 rounded-full border-2 border-blue-100 object-cover"
          />
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user?.name}!</h1>
            <p className="text-gray-500 text-sm">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/profile" className="flex items-center gap-2 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition">
            <User size={16} /> Profile
          </Link>
          <Link href="/create-blog" className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition">
            <Plus size={18} /> Create Blog
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
            <BookOpen size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">My Blogs</p>
            <p className="text-3xl font-bold">{myBlogs.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
            <Heart size={24} className="text-red-500" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Likes</p>
            <p className="text-3xl font-bold">{myBlogs.reduce((acc, b) => acc + b.likesCount, 0)}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
            <ShoppingBag size={24} className="text-green-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Purchased</p>
            <p className="text-3xl font-bold">—</p>
          </div>
        </div>
      </div>

      {/* Recent blogs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Recent Blogs</h2>
          <Link href="/my-blogs" className="text-blue-600 hover:underline text-sm font-medium">View All →</Link>
        </div>
        {blogsLoading ? (
          <div className="space-y-4">{Array(3).fill(0).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}</div>
        ) : myBlogs.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p className="mb-4">No blogs yet.</p>
            <Link href="/create-blog" className="text-blue-600 hover:underline">Create your first blog</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {myBlogs.map((blog) => (
              <div key={blog._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{blog.title}</p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs mr-2 ${blog.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{blog.status}</span>
                    {blog.likesCount} likes
                  </p>
                </div>
                <div className="flex gap-1 ml-4">
                  <Link href={`/edit-blog/${blog._id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit size={15} /></Link>
                  <button onClick={() => confirmDelete(blog._id, blog.title)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Blog"
        message={`Are you sure you want to delete "${deleteTitle}"? This action cannot be undone.`}
        confirmLabel={deleting ? 'Deleting...' : 'Delete'}
        onConfirm={handleDelete}
        onCancel={() => { setDeleteId(null); setDeleteTitle(''); }}
      />
    </div>
  );
}
