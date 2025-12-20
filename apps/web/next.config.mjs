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
}

export default withNextIntl(nextConfig);
