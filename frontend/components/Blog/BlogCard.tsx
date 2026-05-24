'use client';

import { Heart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { blogAPI } from '@/services/api';
import { toast } from 'react-toastify';

interface BlogCardProps {
  id: string;
  title: string;
  description: string;
  slug: string;
  featuredImage: string;
  likesCount: number;
  isLiked?: boolean;
  isPremium?: boolean;
  price?: number;
  createdBy: { name: string; avatar?: string } | null;
}

export default function BlogCard({ id, title, description, slug, featuredImage, likesCount, isLiked = false, isPremium, price, createdBy }: BlogCardProps) {
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(likesCount);
  const [isLoading, setIsLoading] = useState(false);

  // Guard against null createdBy (deleted user or populate failure)
  const author = createdBy || { name: 'Unknown', avatar: undefined };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await blogAPI.toggleLike(id);
      setLiked(response.data.isLiked);
      setLikeCount(response.data.likesCount);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Please login to like');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Link href={`/blog/${slug}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition overflow-hidden cursor-pointer h-full flex flex-col border border-gray-100 dark:border-gray-700">
        <div className="relative h-48 w-full overflow-hidden bg-gray-200 dark:bg-gray-700">
          <Image src={featuredImage} alt={title} fill className="object-cover hover:scale-105 transition" />
          {isPremium && (
            <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
              Premium ₹{price}
            </span>
          )}
        </div>
        <div className="p-6 flex flex-col flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{title}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 flex-1">{description}</p>
          <div className="flex items-center space-x-2 mb-4">
            <img
              src={author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&background=2563eb&color=fff`}
              alt={author.name}
              className="w-8 h-8 rounded-full"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">{author.name}</span>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
            <button onClick={handleLike} disabled={isLoading} className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-red-500 transition disabled:opacity-50">
              <Heart size={20} className={liked ? 'fill-red-500 text-red-500' : ''} />
              <span className="text-sm">{likeCount}</span>
            </button>
            <span className="text-blue-600 font-medium text-sm hover:underline">Read More →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
