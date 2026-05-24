'use client';

import { useState, useEffect } from 'react';
import { blogAPI } from '@/services/api';
import BlogCard from '@/components/Blog/BlogCard';
import { Search, AlertCircle, RefreshCw } from 'lucide-react';
import { useLocale } from '@/store/localeContext';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { t } = useLocale();

  useEffect(() => {
    fetchBlogs();
  }, [search, page]);

  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await blogAPI.getAllBlogs({ page, limit: 9, search: search || undefined, status: 'published' });
      setBlogs(response.data.blogs || []);
      setTotal(response.data.pagination?.total || 0);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to load blogs';
      setError(msg);
      console.error('Blogs fetch error:', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 dark:text-white">{t.blogs.title}</h1>

        {/* Search */}
        <div className="mb-10 relative">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder={t.blogs.search}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl p-4 mb-8">
            <AlertCircle size={20} className="flex-shrink-0" />
            <span className="flex-1 text-sm">{error}</span>
            <button onClick={fetchBlogs} className="flex items-center gap-1 text-sm font-medium hover:underline">
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {/* Loading skeletons */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm h-96 animate-pulse" />
            ))}
          </div>
        ) : blogs.length === 0 && !error ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-2">
              {search ? `No blogs found for "${search}"` : t.blogs.noBlogs}
            </p>
            {search && (
              <button onClick={() => setSearch('')} className="text-blue-600 hover:underline text-sm mt-2">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {blogs.map((blog: any) => (
                <BlogCard
                  key={blog._id}
                  id={blog._id}
                  title={blog.title}
                  description={blog.description}
                  slug={blog.slug}
                  featuredImage={blog.featuredImage}
                  likesCount={blog.likesCount}
                  isLiked={blog.isLiked}
                  isPremium={blog.isPremium}
                  price={blog.price}
                  createdBy={blog.createdBy}
                />
              ))}
            </div>

            {/* Pagination */}
            {total > 9 && (
              <div className="flex justify-center gap-2 mt-8">
                <button disabled={page === 1} onClick={() => setPage(page - 1)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300">
                  {t.blogs.previous}
                </button>
                <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                  {t.blogs.page} {page} / {Math.ceil(total / 9)}
                </span>
                <button disabled={page * 9 >= total} onClick={() => setPage(page + 1)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300">
                  {t.blogs.next}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
