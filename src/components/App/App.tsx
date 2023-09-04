import { useMachine } from '@xstate/react';

import Image from 'next/image';

import { assign } from 'xstate';
import { appMachine } from '../../statechart/app.machine';
import { Audio } from '../Audio/Audio';
import { Controls } from '../Controls/Controls';
import { generationAlgorithmMachine } from '../../statechart/recursiveBacktracker.machine';
import { Levers } from '../Levers/Levers';
import { sendTo } from 'xstate/lib/actions';
import { Stage } from '../Stage';
import GlobalStyle from '../../styles/GlobalStyles';
import { AppContainer, Footer, ImageHolder, Link, Version } from './App.css';
import { useEffect, useState } from 'react';

declare const VERSION: string;

const App = () => {
  let version = 'unknown';
  try {
    version = VERSION;
  } catch (error) {
    console.log('Cannot get version of application.');
  }

  const [appState, appSend, appService] = useMachine(appMachine, {
    actions: {
      storeGridRef: assign({
        gridRef: (_, { params }) => params.gridRef,
      }),

      refreshGenerationSessionId: assign({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        generationSessionId: (_) => new Date().getTime(),
      }),
      updateGenerationParams: assign({
        generationParams: ({ generationParams }, { params }) => ({
          ...generationParams,
          [params.name]: params.value,
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
    services: {
      // Can switch between algorithm machines by making this a function
      childMachine: generationAlgorithmMachine,
    },
  });

  const {
    context: { generationParams, generationSessionId },
  } = appState;

  const [position, setPosition] = useState({ columnIndex: 0, rowIndex: 0 });

  useEffect(() => {
    const subscription = appService.subscribe((state) => {
      const childMachine = state.children?.generationAlgorithmMachine;
      if (childMachine) {
        setPosition({
          columnIndex:
            (childMachine as any).state.context.currentCell?.getColumnIndex() ??
            0,
          rowIndex:
            (childMachine as any).state.context.currentCell?.getRowIndex() ?? 0,
        });
      }
    });

    return subscription.unsubscribe;
  }, [appService]); // note: service should never change

  const leversEnabled =
    appState.matches('Idle') ||
    appState.matches({
      Generating: 'Initializing',
    });

  const audioProps = {
    columnIndex: position.columnIndex,
  };

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <h1>Maze Generation</h1>
        <h2>Recursive Backtracker</h2>
        <p>
          <i>Next.js, XState, Canvas, TypeScript</i>
        </p>
        <Audio {...audioProps} />
        <Levers
          enabled={leversEnabled}
          params={generationParams}
          updateFromLevers={(data: { name: string; value: number }) => {
            appSend({ type: 'generation.param.set', params: data });
          }}
        />

        <Controls state={appState} sendControlEvent={appSend} />
        <Stage
          width={1000}
          height={1000}
          pixelRatio={1}
          generationParams={generationParams}
          appSend={appSend}
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
