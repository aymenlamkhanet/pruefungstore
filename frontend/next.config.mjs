/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const backend = process.env.BACKEND_URL || 'http://localhost:4000'
    return [
      {
        source: '/api/:path*',
        destination: `${backend}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
