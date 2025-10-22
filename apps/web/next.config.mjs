/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
