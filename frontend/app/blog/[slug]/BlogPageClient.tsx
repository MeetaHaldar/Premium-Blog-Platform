'use client';

import { useEffect, useState, Suspense } from 'react';
import { blogAPI, paymentAPI } from '@/services/api';
import { useAuth } from '@/store/authContext';
import { useLocale } from '@/store/localeContext';
import { Heart, Calendar, User, Lock, Crown, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

function getTextPreview(html: string, maxChars = 100): string {
  const stripped = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (stripped.length <= maxChars) return stripped;
  return stripped.slice(0, maxChars).replace(/\s+\S*$/, '') + '...';
}

function BlogContent({ slug }: { slug: string }) {
  const [blog, setBlog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const { user } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => { fetchBlog(); }, [slug]);

  useEffect(() => {
    if (searchParams?.get('payment') === 'cancelled') toast.info('Payment was cancelled.');
  }, [searchParams]);

  const fetchBlog = async () => {
    try {
      setIsLoading(true);
      const response = await blogAPI.getBlogBySlug(slug);
      const b = response.data.blog;
      setBlog(b);
      setHasPurchased(response.data.hasPurchased);
      setLikeCount(b.likesCount);
      if (user && b.likedBy) {
        setLiked(b.likedBy.some((id: any) => id.toString() === user.id || id === user.id));
      }
    } catch { toast.error('Failed to load blog'); }
    finally { setIsLoading(false); }
  };

  const handleLike = async () => {
    if (!user) { router.push('/login'); return; }
    try {
      const response = await blogAPI.toggleLike(blog._id);
      setLiked(response.data.isLiked);
      setLikeCount(response.data.likesCount);
    } catch { toast.error('Failed to like blog'); }
  };

  const handleBuyWithStripe = async () => {
    if (!user) { router.push(`/login?redirect=/blog/${slug}`); return; }
    try {
      setPaymentLoading(true);
      const response = await paymentAPI.createCheckoutSession({ blogId: blog._id });
      if (response.data.url) window.location.href = response.data.url;
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Payment failed');
      setPaymentLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-4">
        <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        {Array(6).fill(0).map((_, i) => <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />)}
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg mb-4">{t.blog.notFound}</p>
        <Link href="/blogs" className="text-blue-600 hover:underline">{t.blog.browseAll}</Link>
      </div>
    );
  }

  const isAuthor = blog.createdBy?._id === user?.id || blog.createdBy?.id === user?.id;
  const canReadFull = !blog.isPremium || hasPurchased || isAuthor;
  const preview = getTextPreview(blog.content, 100);
  const authorName = blog.createdBy?.name || blog.authorName || 'Author';
  const authorAvatar = blog.createdBy?.avatar || blog.authorAvatar || '';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Featured Image — next/image for LCP optimization */}
      <div className="relative h-80 w-full rounded-xl overflow-hidden mb-8 bg-gray-100 dark:bg-gray-800">
        <Image
          src={blog.featuredImage}
          alt={blog.title}
          fill
          priority          // LCP hint — load this image first
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 896px"
        />
        {blog.isPremium && (
          <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-yellow-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow">
            <Crown size={14} /> {t.blogs.premium}
          </div>
        )}
      </div>

      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">{blog.title}</h1>

      {/* Meta */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200 dark:border-gray-700 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Image
            src={authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=2563eb&color=fff`}
            alt={authorName}
            width={44}
            height={44}
            className="rounded-full border-2 border-blue-100 object-cover"
          />
          <div>
            <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
              <User size={13} className="text-gray-400" /> {authorName}
            </p>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Calendar size={13} /> {new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
        <button
          onClick={handleLike}
          title={liked ? 'Unlike' : 'Like'}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border transition ${liked ? 'border-red-300 bg-red-50 dark:bg-red-900/20 text-red-500' : 'border-gray-200 dark:border-gray-600 text-gray-500 hover:border-red-300 hover:text-red-500'}`}
        >
          <Heart size={18} className={liked ? 'fill-red-500' : ''} />
          <span className="font-medium">{likeCount}</span>
        </button>
      </div>

      {/* Content */}
      {canReadFull ? (
        <div className="prose prose-lg dark:prose-invert max-w-none prose-a:text-blue-600"
          dangerouslySetInnerHTML={{ __html: blog.content }} />
      ) : (
        <div>
          <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">{preview}</p>
          <div className="h-16 bg-gradient-to-b from-transparent to-white dark:to-gray-950 -mt-4 pointer-events-none" />
          <div className="mt-2 rounded-2xl border border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-900/20 dark:to-gray-900 p-8 text-center shadow-sm">
            <div className="w-14 h-14 bg-yellow-100 dark:bg-yellow-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={28} className="text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t.blog.premiumArticle}</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{t.blog.unlockFull}</p>
            <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
              {[t.blog.fullAccess, t.blog.oneTime, t.blog.lifetime].map(f => (
                <span key={f} className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-full">
                  <CheckCircle size={13} className="text-green-500" /> {f}
                </span>
              ))}
            </div>
            {user ? (
              <button onClick={handleBuyWithStripe} disabled={paymentLoading}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-10 py-3.5 rounded-xl hover:bg-blue-700 disabled:bg-gray-400 transition font-semibold text-lg shadow-md">
                <Crown size={20} />
                {paymentLoading ? t.blog.redirecting : `${t.blog.buyNow} — ₹${blog.price}`}
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-500 text-sm">{t.blog.signInToBuy}</p>
                <Link href={`/login?redirect=/blog/${blog.slug}`}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-10 py-3.5 rounded-xl hover:bg-blue-700 transition font-semibold text-lg">
                  {t.blog.signInToBuy} — ₹{blog.price}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BlogPageClient({ slug }: { slug: string }) {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
      <BlogContent slug={slug} />
    </Suspense>
  );
}
