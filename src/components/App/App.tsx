import React, { useState } from 'react';
import { useMachine } from '@xstate/react';

import Image from 'next/image';

import { AppContainer, Footer, Version, Link, ImageHolder } from './App.css';
import { Controls } from '../Controls/Controls';
import { Stage } from '../Stage';
import { appMachine } from '../../statechart/appMachine';
import { Levers } from '../Levers/Levers';
import GlobalStyle from '../../styles/GlobalStyles';
import { assign, sendTo } from 'xstate';
import { generationAlgorithmMachine } from '../../statechart/recursiveBacktrackerMachine';
import { AppMachineEventId } from '../../statechart/appMachineTypes';

declare const VERSION: string;

const App = () => {
  let version = 'unknown';
  try {
    version = VERSION;
  } catch (error) {
    console.log('Cannot get version of application.');
  }

  const [appState, appRaise /* appService */] = useMachine(appMachine, {
    actions: {
      storeGridRef: assign({
        gridRef: ({ event }) => event.gridRef,
      }),

      refreshGenerationSessionId: assign({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        generationSessionId: (_) => new Date().getTime(),
      }),
      updateGenerationParams: assign({
        generationParams: ({ generationParams }, event) => {
          const { name, value } = event;
          return {
            ...generationParams,
            [name]: value,
          };
        },
      }),
      startGenerationAlgorithmMachine: sendTo('generationAlgorithmMachine', {
        type: 'START',
      }),
      playGenerationAlgorithmMachine: sendTo('generationAlgorithmMachine', {
        type: 'PLAY',
      }),
      pauseGenerationAlgorithmMachine: sendTo('generationAlgorithmMachine', {
        type: 'PAUSE',
      }),
      stepGenerationAlgorithmMachine: sendTo('generationAlgorithmMachine', {
        type: 'STEP_FORWARD',
      }),
    },
    actors: {
      // Can switch between algorithm machines by making this a function
      childMachine: generationAlgorithmMachine,
    },
  });

  const [leversAreChanging, setLeversAreChanging] = useState(false);

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
    appState.matches('idle') ||
    appState.matches({
      generating: 'initializing',
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
            appRaise({ type: 'SET_GENERATION_PARAM', ...data });
            // Do we need to also INJECT_FPS into algo machine via props?
          }}
          settingsAreChanging={setLeversAreChanging}
        />

        <Controls state={appState} onControlClick={appRaise} />
        <Stage
          width={1000}
          height={1000}
          pixelRatio={1}
          generationParams={generationParams}
          appRaise={appRaise}
          generationSessionId={generationSessionId}
          paramsAreChanging={leversAreChanging}
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
