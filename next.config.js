module.exports = {
  webpack(config, { webpack, isServer }) {
    // Support for .svg
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    // Support for .wav
    config.module.rules.push({
      test: /\.(ogg|mp3|wav|mpe?g)$/i,
      exclude: config.exclude,
      use: [
        {
          loader: require.resolve('url-loader'),
          options: {
            limit: config.inlineImageLimit,
            fallback: require.resolve('file-loader'),
            publicPath: `${config.assetPrefix}/_next/static/images/`,
            outputPath: `${isServer ? '../' : ''}static/images/`,
            name: '[name]-[hash].[ext]',
            esModule: config.esModule || false,
          },
        },
      ],
    });

    // Support for loading package.json contents into the app.
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
  compiler: {
    styledComponents: true,
  },
};
