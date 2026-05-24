import type { Metadata } from 'next';
import BlogPageClient from './BlogPageClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.vercel.app';

// ISR — revalidate every 60 seconds
export const revalidate = 60;

async function getBlog(slug: string) {
  try {
    const res = await fetch(`${API_URL}/blogs/${slug}`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.blog || null;
  } catch {
    return null;
  }
}

// Dynamic Open Graph metadata per blog
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const blog = await getBlog(params.slug);

  if (!blog) {
    return {
      title: 'Blog Not Found',
      description: 'The requested blog post could not be found.'
    };
  }

  const description = blog.description || blog.content?.replace(/<[^>]+>/g, '').slice(0, 160);
  const imageUrl = blog.featuredImage || `${siteUrl}/og-image.png`;
  const url = `${siteUrl}/blog/${params.slug}`;

  return {
    title: blog.title,
    description,
    authors: [{ name: blog.createdBy?.name || blog.authorName }],
    openGraph: {
      type: 'article',
      url,
      title: blog.title,
      description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: blog.title }],
      publishedTime: blog.createdAt,
      modifiedTime: blog.updatedAt,
      authors: [blog.createdBy?.name || blog.authorName],
      tags: [blog.language, blog.isPremium ? 'premium' : 'free']
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.title,
      description,
      images: [imageUrl]
    },
    alternates: { canonical: url }
  };
}

// Pre-generate popular blog pages at build time
export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_URL}/blogs?limit=20&status=published`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.blogs || []).map((b: any) => ({ slug: b.slug }));
  } catch {
    return [];
  }
}

export default function SingleBlogPage({ params }: { params: { slug: string } }) {
  return <BlogPageClient slug={params.slug} />;
}
