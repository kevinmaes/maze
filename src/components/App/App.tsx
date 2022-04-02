import React from 'react';
import { useMachine } from '@xstate/react';

import { AppContainer, Footer, Version, Link, Image } from './App.css';
import { Controls } from '../Controls/Controls';
import twitterLogo from '../../assets/images/twitter-logo-transparent.png';
import { Stage } from '../Stage';
import { appMachine } from '../../statechart/appMachine';
import {
  AppMachineEventId,
  AppMachineState,
} from '../../statechart/appMachineTypes';
import { Levers } from '../Levers/Levers';
import GlobalStyle from '../../styles/GlobalStyles';

// const APP_WIDTH = window.innerWidth;
// const APP_HEIGHT = window.innerHeight;

const App = () => {
  // eslint-disable-next-line
  const [appState, appSend, appService] = useMachine(appMachine);

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
    appState.matches(AppMachineState.IDLE) ||
    appState.matches({
      [AppMachineState.GENERATING]: AppMachineState.INITIALIZING,
    });

  const sendEventFromControl = (eventId: AppMachineEventId) => {
    appSend(eventId);
  };

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <h1>Maze Generation</h1>
        <h2>Recursive Backtracker</h2>
        <p>
          <i>React, XState, Canvas, TypeScript</i>
        </p>
        <Levers
          enabled={leversEnabled}
          params={generationParams}
          updateFromLevers={(data: { name: string; value: number }) => {
            appSend(AppMachineEventId.SET_GENERATION_PARAM, data);
            // Do we need to also INJECT_FPS into algo machine via props?
          }}
        />

        <Controls state={appState} onControlClick={sendEventFromControl} />

        <Stage
          width={1000}
          height={1000}
          pixelRatio={1}
          generationParams={generationParams}
          appSend={appSend}
          generationSessionId={generationSessionId}
        />

        <Footer>
          <Version>v0.2.0</Version>
          {/* <Link
          className="App-link"
          href="https://twitter.com/kvmaes"
          target="_blank"
          rel="noreferrer"
        >
          <Image
            className="App-footer-image"
            src={'../../assets/images/twitter-logo-transparent.png'}
            alt="Twitter logo"
            width="20"
            height="16"
          />
          @kvmaes
        </Link> */}
        </Footer>
      </AppContainer>
    </>
  );
};

export default App;
