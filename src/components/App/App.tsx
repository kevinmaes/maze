import GlobalStyle from '../../styles/GlobalStyles';
import { Levers } from '../Levers/Levers';
import { Controls } from '../Controls/Controls';
import { Stage } from '../Stage';
import { useActor } from '@xstate/react';
import { appMachine } from '../../statechart/app.machine';
import { AppContainer } from './App.css';
import { Audio } from '../Audio/Audio';
import Head from 'next/head';
import { useEffect } from 'react';
import { Footer } from '../Footer/Footer';

export default function App() {
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
        <Footer />
      </AppContainer>
    </>
  );
}
