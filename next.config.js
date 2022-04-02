// /** @type {import('next').NextConfig} */

// const withPlugins = require('next-compose-plugins');
// const withSvgr = require('@svgr/webpack');

// const nextConfig = {
//   reactStrictMode: true,
// };

// module.exports = nextConfig;
// module.exports = withPlugins([[withSvgr]], nextConfig);
// module.exports = withPlugins([withSvgr], nextConfig);

////

module.exports = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
};
