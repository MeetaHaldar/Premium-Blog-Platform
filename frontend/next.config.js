/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Use Next.js image optimization instead of unoptimized
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'ui-avatars.com' }
    ]
  },
  typescript: {
    ignoreBuildErrors: false
  },
  // Disable strict mode in dev — it causes double renders/effects which makes the app feel slow
  reactStrictMode: false,
  // Reduce logging noise
  logging: {
    fetches: { fullUrl: false }
  }
};

module.exports = nextConfig;
