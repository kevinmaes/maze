import { useActor, useMachine } from '@xstate/react';

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
  const [appState, appSend] = useMachine(appMachine);

  const {
    context: { generationParams },
    children: { child },
  } = appState;
  console.log('child', child);
  // How can this be up 2 date and trigger a re render?
  // See console for state changes in invoked child component
  // const [generationState, generationSend] = useActor(child);

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
