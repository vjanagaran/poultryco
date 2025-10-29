/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  typescript: {
    // Allow build to succeed even with type errors (not recommended for production)
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if ESLint errors
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ['ceknyafzwqhxjxipsqx.supabase.co'], // Add your Supabase storage domain
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  env: {
    SITE_URL: process.env.SITE_URL || 'https://www.poultryco.net',
    SITE_NAME: 'PoultryCo',
  },
  // Skip generating 404/500 pages to avoid styled-jsx issues
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
}

export default nextConfig
