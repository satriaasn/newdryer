/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Turbopack is optional, but for now let's use standard webpack on Vercel
  // unless explicitly requested.
}

module.exports = nextConfig
