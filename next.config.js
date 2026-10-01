/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    // Canonical domain is https://www.theutilityhub.online — consolidate link
    // equity by 301-redirecting the apex domain (and any other host variants).
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'theutilityhub.online' }],
        destination: 'https://www.theutilityhub.online/:path*',
        permanent: true,
      },
    ];
  },
};
module.exports = nextConfig;
