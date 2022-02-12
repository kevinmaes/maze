import { useMachine } from '@xstate/react';

import { useTypesafeActions } from '../../hooks/useTypesafeActions';
import { AppState } from './types';
import { Actions, reducer } from './reducer';
import {
  AppContainer,
  Form,
  P,
  ReplayButton,
  Footer,
  Link,
  Image,
} from './App.css';
import { Controls } from '../Controls/Controls';
import twitterLogo from '../../assets/images/twitter-logo-transparent.png';
import Stage from '../Stage';
import { machine } from '../../statechart/playbackMachine';
import {
  PlaybackMachineStateType,
  EventId,
} from '../../statechart/playbackMachineTypes';

const FPS_DEFAULT = 30;
const BORDER_WEIGHT_DEFAULT = 2;
const GRID_SIZE_DEFAULT = 15;

const APP_WIDTH = window.innerWidth;
const APP_HEIGHT = window.innerHeight;

const CellSize = {
  DEFAULT: 20,
  MIN: 10,
  MAX: 25,
};

const initialState: AppState = {
  playRequestTS: 0,
  fps: FPS_DEFAULT,
  cellSize: CellSize.DEFAULT,
  borderWeight: BORDER_WEIGHT_DEFAULT,
  gridColumns: GRID_SIZE_DEFAULT,
  gridRows: GRID_SIZE_DEFAULT,
  settingsChanging: false,
};

const App = () => {
  // eslint-disable-next-line
  const [{ value }, send] = useMachine(machine);

  const stateValue: PlaybackMachineStateType =
    value as PlaybackMachineStateType;

  const [state, actions] = useTypesafeActions<AppState, typeof Actions>(
    reducer,
    initialState,
    Actions
  );

  console.log({ stateValue });

  const sendEventFromControl = (eventId: EventId) => {
    send(eventId);
  };

  return (
    <AppContainer>
      <h1>Maze Generation</h1>
      <h2>Recursive Backtracker</h2>
      <p>
        <i>React, XState, Canvas, TypeScript</i>
      </p>
      <Form>
        <P>
          <label>FPS ({state.fps})</label>
          <input
            type="range"
            name="fps"
            value={state.fps}
            min="5"
            max="60"
            step={5}
            onMouseDown={() => actions.setSettingsChanging(true)}
            onMouseUp={() => actions.setSettingsChanging(false)}
            onChange={({ target: { value } }) => {
              actions.setFPS(parseInt(value, 10));
            }}
          />
        </P>
        <P>
          <label>Cell Size ({state.cellSize})</label>
          <input
            type="range"
            name="cellSize"
            value={state.cellSize}
            min={CellSize.MIN}
            max={CellSize.MAX}
            step={5}
            onMouseDown={() => actions.setSettingsChanging(true)}
            onMouseUp={() => actions.setSettingsChanging(false)}
            onChange={({ target: { value } }) =>
              actions.setCellSize(parseInt(value, 10))
            }
          />
        </P>
        <P>
          <label>Border Weight ({state.borderWeight})</label>
          <input
            type="range"
            name="borderWeight"
            value={state.borderWeight}
            min="1"
            max="10"
            onMouseDown={() => actions.setSettingsChanging(true)}
            onMouseUp={() => actions.setSettingsChanging(false)}
            onChange={({ target: { value } }) =>
              actions.setBorderWeight(parseInt(value, 10))
            }
          />
        </P>
        <P>
          <label>Grid Columns ({state.gridColumns})</label>
          <input
            type="range"
            name="gridColumns"
            value={state.gridColumns}
            min="2"
            max="25"
            onMouseDown={() => actions.setSettingsChanging(true)}
            onMouseUp={() => actions.setSettingsChanging(false)}
            onChange={({ target: { value } }) =>
              actions.setGridColumns(parseInt(value, 10))
            }
          />
        </P>
        <P>
          <label>Grid Rows ({state.gridRows})</label>
          <input
            type="range"
            name="gridRows"
            value={state.gridRows}
            min="2"
            max="25"
            onMouseDown={() => actions.setSettingsChanging(true)}
            onMouseUp={() => actions.setSettingsChanging(false)}
            onChange={({ target: { value } }) =>
              actions.setGridRows(parseInt(value, 10))
            }
          />
        </P>
        <ReplayButton
          onClick={(event) => {
            event.preventDefault();
            actions.createPlayRequest(new Date().getTime());
          }}
        >
          Replay
        </ReplayButton>
      </Form>
      <Controls
        currentPlaybackState={stateValue}
        onControlClick={sendEventFromControl}
      />
      <Stage
        playRequestTS={state.playRequestTS}
        width={APP_WIDTH}
        height={APP_HEIGHT}
        fps={state.fps}
        cellSize={state.cellSize}
        borderWeight={state.borderWeight}
        gridColumns={state.gridColumns}
        gridRows={state.gridRows}
        pixelRatio={1}
        settingsChanging={Boolean(state.settingsChanging)}
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
