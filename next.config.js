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

  // webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
  //   // Important: return the modified config

  // return config;
  //   return {
  //     ...config,
  //     // plugins: [
  //     //   new webpack.DefinePlugin({
  //     //     VERSION: '1.2.3', //JSON.stringify(require('./package.json').version),
  //     //   }),
  //     // ],
  //     // module: {
  //     //   plugins: [
  //     //     new webpack.DefinePlugin({
  //     //       VERSION: JSON.stringify(require('./package.json').version),
  //     //     }),
  //     //   ],
  //     // },
  //   };
  // },
};
