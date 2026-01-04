/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Use 'standalone' for Docker, remove for EC2 direct deployment
  // output: 'standalone', // Disabled for EC2 - use standard build
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.poultryco.net',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

export default nextConfig
