module.exports = {
  webpack(config, { webpack }) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    config.plugins.push(
      new webpack.DefinePlugin({
        VERSION: JSON.stringify(require('./package.json').version),
      })
    );

    return config;
  },
  images: {
    disableStaticImages: true,
  },
