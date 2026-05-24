'use client';

import { useAuth } from '@/store/authContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { blogAPI } from '@/services/api';
import { toast } from 'react-toastify';
import { Edit, Trash2, Plus } from 'lucide-react';
import ConfirmDialog from '@/components/UI/ConfirmDialog';

export default function MyBlogsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteTitle, setDeleteTitle] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) fetchBlogs();
  }, [user, page]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogAPI.getMyBlogs({ page, limit: 10 });
      setBlogs(response.data.blogs);
      setTotal(response.data.pagination.total);
    } catch {
      toast.error('Failed to fetch blogs');
    } finally {
      setLoading(false);
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
      toast.success('Blog deleted successfully');
      setBlogs(blogs.filter(b => b._id !== deleteId));
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">My Blogs</h1>
        <Link href="/create-blog" className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          <Plus size={20} /> New Blog
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">{Array(5).fill(0).map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />)}</div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          No blogs yet. <Link href="/create-blog" className="text-blue-600 hover:underline">Create one!</Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-700">Title</th>
                <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                <th className="text-left p-4 font-semibold text-gray-700">Likes</th>
                <th className="text-left p-4 font-semibold text-gray-700">Premium</th>
                <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr key={blog._id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-4">
                    <Link href={`/blog/${blog.slug}`} className="font-medium text-blue-600 hover:underline line-clamp-1">{blog.title}</Link>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${blog.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {blog.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{blog.likesCount}</td>
                  <td className="p-4">
                    {blog.isPremium
                      ? <span className="text-yellow-600 font-medium">₹{blog.price}</span>
                      : <span className="text-gray-400">Free</span>}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Link href={`/edit-blog/${blog._id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => confirmDelete(blog._id, blog.title)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {total > 10 && (
            <div className="flex justify-center gap-2 p-4">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50">Previous</button>
              <span className="px-4 py-2 text-gray-600">Page {page} of {Math.ceil(total / 10)}</span>
              <button disabled={page * 10 >= total} onClick={() => setPage(page + 1)} className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50">Next</button>
            </div>
          )}
        </div>
      )}

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
