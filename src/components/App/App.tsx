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
  const [state, send] = useMachine(appMachine);

  const { borderWeight, cellSize, fps, gridColumns, gridRows } =
    state.context.generationParams;

  const leversEnabled =
    state.matches(AppMachineState.IDLE) || state.matches(AppMachineState.DONE);

  const sendEventFromControl = (eventId: AppMachineEventId) => {
    send(eventId);
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
        params={state.context.generationParams}
        updateFromLevers={(data: { name: string; value: number }) => {
          send(AppMachineEventId.SET_GENERATION_PARAM, data);
          // Do we need to also INJECT_FPS into algo machine via props?
        }}
      />

      <Controls state={state} onControlClick={sendEventFromControl} />
      <Stage
        width={APP_WIDTH}
        height={APP_HEIGHT}
        fps={fps}
        cellSize={cellSize}
        borderWeight={borderWeight}
        gridColumns={gridColumns}
        gridRows={gridRows}
        pixelRatio={1}
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
