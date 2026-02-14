import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.central.co.th',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.central.co.th',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    // Exclude packages that use fs.readFileSync at module init from webpack bundling
    serverComponentsExternalPackages: ['vectra', 'gpt-3-encoder'],
  },
  webpack: (config) => {
    config.cache = false;
    return config;
  },
}

export default withNextIntl(nextConfig);
