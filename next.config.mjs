/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['xsgames.co', 'i.imgur.com', 'supabase.co'],
  },
  experimental: {
    serverActions: true,
  },
}

export default nextConfig
