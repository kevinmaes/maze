import Image from 'next/image';
import { assign, sendTo } from 'xstate';
import GlobalStyle from '../../styles/GlobalStyles';
import { Levers } from '../Levers/Levers';
import { Controls } from '../Controls/Controls';
import { Stage } from '../Stage';
import { useActor } from '@xstate/react';
import { appMachine } from '../../statechart/app.machine';
import { AppContainer, ImageHolder, Link, Version } from './App.css';

declare const VERSION: string;

const App = () => {
  let version = 'unknown';
  try {
    version = VERSION;
  } catch (error) {
    console.log('Cannot get version of application.');
  }

  const [appState, send /* appService */] = useActor(appMachine, {
    actions: {
      storeGridRef: assign({
        gridRef: ({ context }) => context.params.gridRef,
      }),

      refreshGenerationSessionId: assign({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        generationSessionId: () => new Date().getTime(),
      }),
      updateGenerationParams: assign({
        generationParams: ({ context, event }: any) => ({
          ...context.generationParams,
          [event.params.name]: event.params.value,
        }),
      }),
      startGenerationAlgorithmMachine: sendTo('generationAlgorithmMachine', {
        type: 'generation.start',
      }),
      playGenerationAlgorithmMachine: sendTo('generationAlgorithmMachine', {
        type: 'controls.play',
      }),
      pauseGenerationAlgorithmMachine: sendTo('generationAlgorithmMachine', {
        type: 'controls.pause',
      }),
      stepGenerationAlgorithmMachine: sendTo('generationAlgorithmMachine', {
        type: 'controls.step.forward',
      }),
    },
    // actors: {
    //   // Can switch between algorithm machines by making this a function
    //   childMachine: generationAlgorithmMachine,
    // },
  });

  const {
    context: { generationParams, generationSessionId },
  } = appState;

  // React.useEffect(() => {
  //   const subscription = appService.subscribe((state) => {
  //     console.log('appState machine value', state.value);

  //     const childMachine = state.children?.generationAlgorithmMachine;
  //     if (childMachine) {
  //       console.log(
  //         'childMachine state value',
  //         (childMachine as any).state.value
  //       );
  //     }
  //   });

  //   return subscription.unsubscribe;
  // }, [appService]); // note: service should never change

  const leversEnabled =
    appState.matches('Idle') ||
    appState.matches({
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

        <Controls state={appState} sendControlEvent={send} />
        <Stage
          width={1000}
          height={1000}
          pixelRatio={1}
          generationParams={generationParams}
          send={send}
          generationSessionId={generationSessionId}
        />

        <footer>
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
        </footer>
      </AppContainer>
    </>
  );
};

export default App;
