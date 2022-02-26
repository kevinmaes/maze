import React from 'react';
import { useMachine } from '@xstate/react';

import { AppContainer, Footer, Link, Image } from './App.css';
import { Controls } from '../Controls/Controls';
import twitterLogo from '../../assets/images/twitter-logo-transparent.png';
import { Stage } from '../Stage';
import { appMachine } from '../../statechart/appMachine';
import {
  AppMachineEventId,
  AppMachineState,
} from '../../statechart/appMachineTypes';
import { Levers } from '../Levers/Levers';

const APP_WIDTH = window.innerWidth;
const APP_HEIGHT = window.innerHeight;

const App = () => {
  // eslint-disable-next-line
  const [appState, appSend, appService] = useMachine(appMachine);

  const {
    context: { generationParams },
  } = appState;

  React.useEffect(() => {
    const subscription = appService.subscribe((state) => {
      console.log('appState machine value', state.value);

      const childMachine = state.children?.generationAlgorithmMachine;
      if (childMachine) {
        console.log(
          'childMachine state value',
          (childMachine as any).state.value
        );
      }
    });

    return subscription.unsubscribe;
  }, [appService]); // note: service should never change

  const leversEnabled =
    appState.matches(AppMachineState.IDLE) ||
    appState.matches(AppMachineState.DONE);

  const sendEventFromControl = (eventId: AppMachineEventId) => {
    appSend(eventId);
  };

  return (
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
        width={APP_WIDTH}
        height={APP_HEIGHT}
        pixelRatio={1}
        generationParams={generationParams}
        appSend={appSend}
      />
      <Footer>
        <Link
          className="App-link"
          href="https://twitter.com/kvmaes"
          target="_blank"
          rel="noreferrer"
        >
          <Image
            className="App-footer-image"
            src={twitterLogo}
            alt="Twitter logo"
            width="20"
            height="16"
          />
          @kvmaes
        </Link>
      </Footer>
    </AppContainer>
  );
};

export default App;
