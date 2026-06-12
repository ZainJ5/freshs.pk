/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Images are served directly by nginx from /public (with caching). The
    // Next.js optimizer is disabled so uploaded images (logos, products, etc.)
    // are served as-is and appear immediately without needing a rebuild.
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'encrypted-tbn0.gstatic.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
    ],
  },
};

export default nextConfig;
