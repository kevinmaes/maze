// import '../src/index.css';

// import GlobalStyle from '../src/styles/GlobalStyle';

// export const parameters = {
//   actions: { argTypesRegex: '^on[A-Z].*' },
//   controls: {
//     matchers: {
//       color: /(background|color)$/i,
//       date: /Date$/,
//     },
//   },
// };

import React from 'react';
import { addDecorator } from '@storybook/react';
// import { initializeWorker, mswDecorator } from 'msw-storybook-addon';
// import { ThemeProvider } from 'styled-components';
import * as NextImage from 'next/image';
import GlobalStyle from '../src/styles/GlobalStyles';
// import theme from '../src/styles/theme';
// import { useStore } from '../src/redux/store';
import { RouterContext } from 'next/dist/shared/lib/router-context';

// Init MSW
// https://storybook.js.org/addons/msw-storybook-addon
// initializeWorker();
// addDecorator(mswDecorator);

// Fix for NextJS Image component to render in storybook
// https://github.com/vercel/next.js/issues/18393#issuecomment-783269086
// const OriginalNextImage = NextImage.default;
// Object.defineProperty(NextImage, 'default', {
//   configurable: true,
//   value: (props) => <OriginalNextImage {...props} unoptimized />,
// });

export const parameters = {
  actions: { argTypesRegex: '^(on|handle)[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  options: {
    storySort: {
      order: ['Style Guide', 'UI Components', 'Components', 'Pages'],
    },
  },
  nextRouter: {
    Provider: RouterContext.Provider,
  },
};

export const decorators = [
  (Story, ctx) => {
    // const store = useStore(
    //   ctx.parameters ? ctx.parameters.initialReduxState : undefined
    // );

    return (
      <>
        <GlobalStyle />
        <Story />
      </>
    );
  },
];
