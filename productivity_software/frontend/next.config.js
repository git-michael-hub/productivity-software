/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable SWC and disable Babel
  swcMinify: true,
  experimental: {
    serverActions: true,
    forceSwcTransforms: true // Force SWC transforms
  },
  // Ignore attribute warnings from browser extensions like Grammarly
  compiler: {
    reactRemoveProperties: { properties: ['^data-new-gr-c-s-check-loaded$', '^data-gr-ext-installed$'] }
  },
  // Proxy configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*'  // Proxy API requests to Django backend
      }
    ];
  }
};

module.exports = nextConfig;
