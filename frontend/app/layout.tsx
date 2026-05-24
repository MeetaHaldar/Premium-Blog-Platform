import type { Metadata } from 'next';
import { AuthProvider } from '@/store/authContext';
import { ThemeProvider } from '@/store/themeContext';
import { LocaleProvider } from '@/store/localeContext';
import Navbar from '@/components/Common/Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@/styles/globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Premium Blog Platform',
    template: '%s | Premium Blog Platform'
  },
  description: 'Discover, read, and share premium content from expert writers. Quality blogs on technology, business, and more.',
  keywords: ['blog', 'premium', 'articles', 'technology', 'writing', '博客', '文章'],
  authors: [{ name: 'Premium Blog Platform' }],
  creator: 'Premium Blog Platform',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'zh_CN',
    url: siteUrl,
    siteName: 'Premium Blog Platform',
    title: 'Premium Blog Platform',
    description: 'Discover, read, and share premium content from expert writers.',
    images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: 'Premium Blog Platform' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Premium Blog Platform',
    description: 'Discover, read, and share premium content from expert writers.',
    images: [`${siteUrl}/og-image.png`]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 }
  },
  alternates: {
    canonical: siteUrl,
    languages: { 'en-US': `${siteUrl}/en`, 'zh-CN': `${siteUrl}/zh` }
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect for LCP — Cloudinary images load faster */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://ui-avatars.com" />
        {/* DNS prefetch for API */}
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'} />
      </head>
      <body className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
        <ThemeProvider>
          <LocaleProvider>
            <AuthProvider>
              <Navbar />
              <main>{children}</main>
              <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} theme="colored" />
            </AuthProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
