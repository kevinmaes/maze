// module.exports = {
//   stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
//   addons: [
//     '@storybook/addon-actions',
//     '@storybook/addon-links',
//     '@storybook/addon-essentials',
//     '@storybook/preset-create-react-app',
//     'storybook-addon-next-router',
//   ],
//   // framework: '@storybook/react',
//   // core: {
//   //   builder: 'webpack5',
//   // },
//   webpackFinal: (config) => {
//     const fileLoaderRule = config.module.rules.find(
//       (rule) => rule.test && rule.test.test('.svg')
//     );
//     fileLoaderRule.exclude = /\.svg$/;

//     config.module.rules.push({
//       test: /\.svg$/,
//       enforce: 'pre',
//       loader: require.resolve('@svgr/webpack'),
//     });

//     return config;
//   },
// };

module.exports = {
  stories: ['../**/**/*.stories.mdx', '../**/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    'storybook-addon-next-router',
  ],
  webpackFinal: (config) => {
    const fileLoaderRule = config.module.rules.find(
      (rule) => rule.test && rule.test.test('.svg')
    );
    fileLoaderRule.exclude = /\.svg$/;

    config.module.rules.push({
      test: /\.svg$/,
      enforce: 'pre',
      loader: require.resolve('@svgr/webpack'),
    });

    return config;
  },
};
