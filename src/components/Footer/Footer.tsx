import GitHub from '../../assets/svg/logos/github.svg?react';
import StatelyLogo from '../../assets/svg/logos/stately-logo-black-nobg.svg?react';
import CanvasLogo from '../../assets/svg/technologies/canvas-logo.svg?react';
import ReactLogo from '../../assets/svg/technologies/react-logo.svg?react';
import TypeScriptLogo from '../../assets/svg/technologies/typescript-logo.svg?react';
import XStateLogo from '../../assets/svg/technologies/xstate-logo.svg?react';
import {
  FooterContainer,
  ImageHolder,
  Link,
  Technologies,
  Version,
  VersionContainer,
} from './Footer.css';

export function Footer() {
  return (
    <FooterContainer>
      <Technologies>
        <ReactLogo />
        <TypeScriptLogo />
        <CanvasLogo />
        <XStateLogo />
      </Technologies>
      <VersionContainer>
        <Link
          className="App-link"
          title="View the maze generation on GitHub"
          href="https://github.com/kevinmaes/maze"
          target="_blank"
          rel="noreferrer"
        >
          <ImageHolder>
            <GitHub />
          </ImageHolder>
          <Version>v{__APP_VERSION__}</Version>
        </Link>
        <Link
          className="App-link"
          title="Maze generation statecharts at Stately Studio"
          href="https://stately.ai/registry/editor/e1573b28-f815-4571-8017-6e4743a0f370?machineId=2629fce3-681d-433d-9aa7-4b572c13c0f8"
          target="_blank"
          rel="noreferrer"
        >
          <ImageHolder style={{ paddingTop: '5px' }}>
            <StatelyLogo />
          </ImageHolder>
        </Link>
        <Link
          className="App-link"
          title="Follow me on Twitter"
          href="https://twitter.com/kvmaes"
          target="_blank"
          rel="noreferrer"
        >
          <ImageHolder>
            <img
              className="App-footer-image"
              src="/images/twitter-logo-transparent.png"
              alt="Twitter logo"
              width="20"
              height="16"
            />
          </ImageHolder>
          @kvmaes
        </Link>
      </VersionContainer>
    </FooterContainer>
  );
}
