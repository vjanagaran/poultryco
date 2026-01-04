/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // output: 'standalone', // Not needed for EC2 deployment
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
