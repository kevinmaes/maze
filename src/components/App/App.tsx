import { useActor } from '@xstate/react';
import Head from 'next/head';
import { useEffect } from 'react';
import { AppMachineContext, appMachine } from '../../statechart/app.machine';
import GlobalStyle from '../../styles/GlobalStyles';
import { Audio } from '../Audio/Audio';
import { Controls } from '../Controls/Controls';
import { Footer } from '../Footer/Footer';
import { Levers } from '../Levers/Levers';
import { Stage } from '../Stage';
import { AppContainer } from './App.css';

export default function App() {
  // const [state, send] = useActor(appMachine);
  // const {
  //   context: { generationParams, generationSessionId },
  // } = state;

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
        <AppMachineContext.Provider>
          <h1>Maze Generation</h1>
          <h2>Recursive Backtracker</h2>
          <Levers />
          <Audio />
          <Controls />
          <Stage width={1000} height={1000} pixelRatio={1} />
          <Footer />
        </AppMachineContext.Provider>
      </AppContainer>
    </>
  );
}
