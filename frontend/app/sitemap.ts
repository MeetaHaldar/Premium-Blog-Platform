import { MetadataRoute } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.vercel.app';


https: https: export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/blogs`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Dynamic blog pages
  try {
    const res = await fetch(`${API_URL}/blogs?limit=100&status=published`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return staticPages;
    const data = await res.json();
    const blogPages: MetadataRoute.Sitemap = (data.blogs || []).map(
      (blog: any) => ({
        url: `${siteUrl}/blog/${blog.slug}`,
        lastModified: new Date(blog.updatedAt || blog.createdAt),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }),
    );
    return [...staticPages, ...blogPages];
  } catch {
    return staticPages;
  }
}
