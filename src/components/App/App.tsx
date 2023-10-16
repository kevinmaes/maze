import Image from 'next/image';
import GlobalStyle from '../../styles/GlobalStyles';
import { Levers } from '../Levers/Levers';
import { Controls } from '../Controls/Controls';
import { Stage } from '../Stage';
import { useActor } from '@xstate/react';
import { appMachine } from '../../statechart/app.machine';
import ReactLogo from '../../assets/svg/technologies/react-logo.svg';
import TypeScriptLogo from '../../assets/svg/technologies/typescript-logo.svg';
import CanvasLogo from '../../assets/svg/technologies/canvas-logo.svg';
import XStateLogo from '../../assets/svg/technologies/xstate-logo.svg';
import GitHub from '../../assets/svg/logos/github.svg';
import {
  AppContainer,
  Footer,
  ImageHolder,
  Link,
  Technologies,
  Version,
  VersionContainer,
} from './App.css';
import { Audio } from '../Audio/Audio';
import Head from 'next/head';
import { useEffect } from 'react';

declare const VERSION: string;

export default function App() {
  let version = 'unknown';
  try {
    version = VERSION;
  } catch (error) {
    console.log('Cannot get version of application.');
  }

  const [state, send] = useActor(appMachine);
  const {
    context: { generationParams, generationSessionId },
  } = state;

  useEffect(() => {
    function ignoreSpace(e: KeyboardEvent) {
      if (e.key == ' ' && e.target == document.body) {
        e.preventDefault();
      }
    }
    window.addEventListener('keydown', ignoreSpace);
    return () => window.removeEventListener('keydown', ignoreSpace);
  }, []);

  return (
    <>
      <Head>
        <title>Maze Generation</title>
      </Head>
      <GlobalStyle />
      <AppContainer>
        <h1>Maze Generation</h1>
        <h2>Recursive Backtracker</h2>
        <Levers
          enabled={state.hasTag('levers enabled')}
          params={generationParams}
          updateFromLevers={(data: { name: string; value: number }) => {
            send({ type: 'generation.param.set', params: data });
            // Do we need to also INJECT_FPS into algo machine via props?
          }}
        />
        <Audio
          algorithmActor={state.children?.generationAlgorithmMachine}
          generationSessionId={generationSessionId}
        />
        <Controls state={state} sendControlEvent={send} />
        <Stage
          width={1000}
          height={1000}
          pixelRatio={1}
          generationParams={generationParams}
          send={send}
          generationSessionId={generationSessionId}
        />

        <Footer>
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
        </Footer>
      </AppContainer>
    </>
  );
}
