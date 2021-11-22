import React from 'react';

import './App.css';
// import Stage from '../stage/Stage';
import Stage from '../xstate/stage';
import { useTypesafeActions } from '../hooks/useTypesafeActions';
import { AppState } from './types';
import { Actions, reducer } from './reducer';
import { Form } from './App.css.js';

const FPS_DEFAULT = 60;
const BORDER_WEIGHT_DEFAULT = 1;
const GRID_SIZE_DEFAULT = 3;

const APP_WIDTH = 800;
const APP_HEIGHT = 600;

const CellSize = {
  DEFAULT: 20,
  MIN: 5,
  MAX: 100,
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
  const [state, actions] = useTypesafeActions<AppState, typeof Actions>(
    reducer,
    initialState,
    Actions
  );

  return (
    <div className="App">
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
      <Form>
        <label>
          FPS ({state.fps})
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
        </label>
        <label>
          Cell Size ({state.cellSize})
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
        </label>
        <label>
          Border Weight ({state.borderWeight})
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
        </label>
        <label>
          Grid Columns ({state.gridColumns})
          <input
            type="range"
            name="gridColumns"
            value={state.gridColumns}
            min="2"
            max="50"
            onMouseDown={() => actions.setSettingsChanging(true)}
            onMouseUp={() => actions.setSettingsChanging(false)}
            onChange={({ target: { value } }) =>
              actions.setGridColumns(parseInt(value, 10))
            }
          />
        </label>
        <label>
          Grid Rows ({state.gridRows})
          <input
            type="range"
            name="gridRows"
            value={state.gridRows}
            min="2"
            max="50"
            onMouseDown={() => actions.setSettingsChanging(true)}
            onMouseUp={() => actions.setSettingsChanging(false)}
            onChange={({ target: { value } }) =>
              actions.setGridRows(parseInt(value, 10))
            }
          />
        </label>
        <button
          onClick={(event) => {
            event.preventDefault();
            actions.createPlayRequest(new Date().getTime());
          }}
        >
          Replay
        </button>
      </Form>
    </div>
  );
};

export default App;
