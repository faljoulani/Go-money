/** @type {import('next').NextConfig} */

const path = require('path');

const cspHeader = `
    script-src https://cdn.insight.sitefinity.com https://dec.azureedge.net https://player.vimeo.com/api/player.js https://www.youtube.com/iframe_api *.googleapis.com 'unsafe-eval' 'unsafe-inline' 'self';
    style-src https://cdn.insight.sitefinity.com https://dec.azureedge.net *.googleapis.com 'self' 'unsafe-inline';
    img-src https://cdn.insight.sitefinity.com https://dec.azureedge.net https://*.frontify.com https://*.cloudinary.com 'self' data: blob:;
    connect-src https://*.insight.sitefinity.com https://*.dec.sitefinity.com 'self';
    font-src fonts.gstatic.com 'self' data:;
    default-src 'self'`;

module.exports = {
  webpack: (config, options) => {
    config.resolve['alias']['@widgetregistry'] = path.resolve(__dirname, 'src/app/widget-registry');
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
  skipTrailingSlashRedirect: true,
  output: process.env.SF_BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
  // Skip ESLint during production builds to avoid formatting/lint failures blocking builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Avoid requiring sharp at runtime/build for next/image
  images: {
    unoptimized: true,
  },
  experimental: {
    proxyTimeout: 60000,
    // Turn off Lightning CSS optimization to avoid native module issues
    optimizeCss: false,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
          // Enable back/forward cache by allowing caching
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      // Cache static assets
      {
        source: '/assets/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/icons/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/logo.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache fonts
      {
        source: '/assets/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Allow bfcache for pages
      {
        source: '/en/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/ar/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
};
