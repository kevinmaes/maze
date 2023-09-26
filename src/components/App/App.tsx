import Image from 'next/image';
import GlobalStyle from '../../styles/GlobalStyles';
import { Levers } from '../Levers/Levers';
import { Controls } from '../Controls/Controls';
import { Stage } from '../Stage';
import { useActor } from '@xstate/react';
import { appMachine } from '../../statechart/app.machine';
import { AppContainer, Footer, ImageHolder, Link, Version } from './App.css';
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
        <p>
          <i>React, XState, Canvas, TypeScript</i>
        </p>

        <Levers
          enabled={state.hasTag('levers enabled')}
          params={generationParams}
          updateFromLevers={(data: { name: string; value: number }) => {
            send({ type: 'generation.param.set', params: data });
            // Do we need to also INJECT_FPS into algo machine via props?
          }}
        />

        <Controls state={state} sendControlEvent={send} />
        <Audio algorithmActor={state.children?.generationAlgorithmMachine} />
        <Stage
          width={1000}
          height={1000}
          pixelRatio={1}
          generationParams={generationParams}
          send={send}
          generationSessionId={generationSessionId}
        />

        <Footer>
          <Version>{version}</Version>
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
        </Footer>
      </AppContainer>
    </>
  );
}
