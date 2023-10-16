import {
  FooterContainer,
  ImageHolder,
  Link,
  Technologies,
  Version,
  VersionContainer,
} from './Footer.css';
import ReactLogo from '../../assets/svg/technologies/react-logo.svg';
import TypeScriptLogo from '../../assets/svg/technologies/typescript-logo.svg';
import CanvasLogo from '../../assets/svg/technologies/canvas-logo.svg';
import XStateLogo from '../../assets/svg/technologies/xstate-logo.svg';
import StatelyLogo from '../../assets/svg/logos/stately-logo-black-nobg.svg';
import GitHub from '../../assets/svg/logos/github.svg';
import Image from 'next/image';

declare const VERSION: string;

export function Footer() {
  let version = 'unknown';
  try {
    version = VERSION;
  } catch (error) {
    console.log('Cannot get version of application.');
  }

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
          href="https://github.com/kevinmaes/maze"
          target="_blank"
          rel="noreferrer"
        >
          <ImageHolder>
            <GitHub />
          </ImageHolder>
          <Version>v{version}</Version>
        </Link>
        <Link
          className="App-link"
          href="https://stately.ai/registry/editor/e1573b28-f815-4571-8017-6e4743a0f370"
          target="_blank"
          rel="noreferrer"
        >
          <ImageHolder>
            <StatelyLogo />
          </ImageHolder>
        </Link>
        <Link
          className="App-link"
          href="https://twitter.com/kvmaes"
          target="_blank"
          rel="noreferrer"
        >
          <ImageHolder>
            <Image
              className="App-footer-image"
              src={'/images/twitter-logo-transparent.png'}
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