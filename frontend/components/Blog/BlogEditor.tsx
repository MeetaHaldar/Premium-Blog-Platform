'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { blogAPI, uploadAPI } from '@/services/api';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Upload, X, ImageIcon } from 'lucide-react';

const RichTextEditor = dynamic(() => import('./RichTextEditor'), { ssr: false });

const blogSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  language: z.string().default('en'),
  status: z.enum(['draft', 'published']),
  isPremium: z.boolean().default(false),
  price: z.number().optional()
});

type BlogFormData = z.infer<typeof blogSchema>;

interface BlogEditorProps {
  initialData?: any;
  isEditing?: boolean;
}

export default function BlogEditor({ initialData, isEditing = false }: BlogEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState(initialData?.content || '');
  const [contentError, setContentError] = useState('');
  const [featuredImage, setFeaturedImage] = useState<string>(initialData?.featuredImage || '');
  const [imagePreview, setImagePreview] = useState<string>(initialData?.featuredImage || '');
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: initialData
      ? { title: initialData.title, description: initialData.description, language: initialData.language, status: initialData.status, isPremium: initialData.isPremium, price: initialData.price }
      : { status: 'draft', isPremium: false, language: 'en' }
  });

  const isPremium = watch('isPremium');

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    setImageError('');

    try {
      setImageUploading(true);
      const response = await uploadAPI.uploadImage(file);
      setFeaturedImage(response.data.url);
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      setImagePreview('');
      setFeaturedImage('');
      const msg = error.response?.data?.message || error.message || 'Image upload failed';
      setImageError(msg);
      toast.error(msg);
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = () => {
    setFeaturedImage('');
    setImagePreview('');
    setImageError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = async (data: BlogFormData) => {
    if (!content || content === '<p></p>') {
      setContentError('Content is required');
      return;
    }
    if (!featuredImage) {
      setImageError('Featured image is required');
      return;
    }
    setContentError('');
    setImageError('');

    try {
      setIsLoading(true);
      const blogData = { ...data, content, featuredImage };
      if (isEditing) {
        await blogAPI.updateBlog(initialData._id, blogData);
        toast.success('Blog updated successfully');
      } else {
        await blogAPI.createBlog(blogData);
        toast.success('Blog created successfully');
      }
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save blog');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Blog Title</label>
        <input type="text" {...register('title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter blog title" />
        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea {...register('description')} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Brief description of your blog" />
        {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
      </div>

      {/* Featured Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleImageChange}
          className="hidden"
          id="featured-image-input"
        />

        {imagePreview ? (
          <div className="relative rounded-lg overflow-hidden border border-gray-300">
            <img src={imagePreview} alt="Preview" className="w-full h-56 object-cover" />
            {imageUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm">Uploading to Cloudinary...</p>
                </div>
              </div>
            )}
            {!imageUploading && (
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
              >
                <X size={16} />
              </button>
            )}
            {featuredImage && !imageUploading && (
              <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                ✓ Uploaded to Cloudinary
              </div>
            )}
          </div>
        ) : (
          <label
            htmlFor="featured-image-input"
            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
          >
            <ImageIcon size={32} className="text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 font-medium">Click to upload image</p>
            <p className="text-xs text-gray-400 mt-1">JPEG, PNG, GIF, WebP — max 5MB</p>
            <div className="mt-3 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
              <Upload size={16} /> Choose File
            </div>
          </label>
        )}

        {imageError && <p className="mt-1 text-sm text-red-500">{imageError}</p>}
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
        <RichTextEditor content={content} onChange={setContent} />
        {contentError && <p className="mt-1 text-sm text-red-500">{contentError}</p>}
      </div>

      {/* Language & Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
          <select {...register('language')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select {...register('status')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      {/* Premium toggle */}
      <div className="space-y-4">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" {...register('isPremium')} className="w-4 h-4 text-blue-600 rounded" />
          <span className="text-sm font-medium text-gray-700">Make this a premium blog</span>
        </label>
        {isPremium && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
            <input type="number" {...register('price', { valueAsNumber: true })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="99" min="1" />
          </div>
        )}
      </div>

      <button type="submit" disabled={isLoading || imageUploading} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium">
        {isLoading ? 'Saving...' : imageUploading ? 'Waiting for image upload...' : isEditing ? 'Update Blog' : 'Create Blog'}
      </button>
    </form>
  );
}
