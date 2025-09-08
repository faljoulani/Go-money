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
        ],
      },
    ];
  },
};
