import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  html,
  body {
    padding: 0;
    margin: 0;
    font-size: 62.5%;
    min-height: 1450px;

    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
    Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;

    background: rgb(236, 233, 168);
    background: linear-gradient(
      180deg,
      rgba(236, 233, 168, 1) 0%,
      rgba(228, 198, 227, 1) 57%,
      rgba(188, 205, 254, 1) 76%,
      rgba(188, 205, 254, 0) 96%,
      rgba(255, 255, 255, 1) 100%
    );
    background-repeat: no-repeat;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  * {
    box-sizing: border-box;
  }
 

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
      monospace;
  }
`;

export default GlobalStyle;
