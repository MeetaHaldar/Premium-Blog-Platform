import { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/blogs', '/blog/'],
        disallow: ['/dashboard', '/admin', '/profile', '/my-blogs', '/create-blog', '/edit-blog/', '/api/']
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
