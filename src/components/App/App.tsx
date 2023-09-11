import Image from 'next/image';
import GlobalStyle from '../../styles/GlobalStyles';
import { Levers } from '../Levers/Levers';
import { Controls } from '../Controls/Controls';
import { Stage } from '../Stage';
import { useActor } from '@xstate/react';
import { appMachine } from '../../statechart/app.machine';
import { AppContainer, Footer, ImageHolder, Link, Version } from './App.css';
import { Audio } from '../Audio/Audio';

declare const VERSION: string;

const App = () => {
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

  // useEffect(() => {
  //   const subscription = appActor.subscribe((state) => {
  //     const childMachine = state.children?.generationAlgorithmMachine;
  //     if (childMachine) {
  //       console.log(
  //         'childMachine state value',
  //         childMachine.getSnapshot().value
  //       );
  //     }
  //   });

  //   return subscription.unsubscribe;
  // }, [appActor]); // note: service should never change

  const leversEnabled =
    state.matches('Idle') ||
    state.matches({
      Generating: 'Initializing',
    });

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <h1>Maze Generation</h1>
        <h2>Recursive Backtracker</h2>
        <p>
          <i>Next.js, XState, Canvas, TypeScript</i>
        </p>

        <Levers
          enabled={leversEnabled}
          params={generationParams}
          updateFromLevers={(data: { name: string; value: number }) => {
            send({ type: 'generation.param.set', params: data });
            // Do we need to also INJECT_FPS into algo machine via props?
          }}
        />

        <Controls state={state} sendControlEvent={send} />
        <Audio
          algorithmActor={state.children?.generationAlgorithmMachine}
          generationSessionId={generationSessionId}
        />
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
};

export default App;
