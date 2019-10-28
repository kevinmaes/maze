import React from 'react';

import './App.css';
import Stage from '../stage/Stage';
import useDebounce from '../hooks/useDebounce';
import { useTypesafeActions } from '../hooks/useTypesafeActions';
import { AppState } from './types';
import { Actions, reducer } from './reducer';
import { Form } from './App.css.js';

const FPS_DEFAULT = 60;
const CELL_SIZE_DEFAULT = 25;
const BORDER_WEIGHT_DEFAULT = 1;

const DEBOUNCE_MS = 500;

const initialState = {
  fps: FPS_DEFAULT,
  cellSize: CELL_SIZE_DEFAULT,
  borderWeight: BORDER_WEIGHT_DEFAULT,
};

const App: React.FC = () => {
  const [state, actions] = useTypesafeActions<AppState, typeof Actions>(
    reducer,
    initialState,
    Actions
  );

  const debouncedFPS = useDebounce(state.fps, DEBOUNCE_MS);
  const debouncedCellSize = useDebounce(state.cellSize, DEBOUNCE_MS);
  const debouncedBorderWeight = useDebounce(state.borderWeight, DEBOUNCE_MS);

  return (
    <div className="App">
      <Stage
        width={500}
        height={500}
        fps={debouncedFPS}
        cellSize={debouncedCellSize}
        borderWeight={debouncedBorderWeight}
        pixelRatio={1}
      />
      <Form>
        <label>
          FPS
          <input
            type="range"
            name="fps"
            value={state.fps}
            min="1"
            max="60"
            onChange={({ target: { value } }) =>
              actions.setFPS(parseInt(value, 10))
            }
          />
        </label>
        <label>
          Cell Size
          <input
            type="range"
            name="cellSize"
            value={state.cellSize}
            min="10"
            max="100"
            onChange={({ target: { value } }) =>
              actions.setCellSize(parseInt(value, 10))
            }
          />
        </label>
        <label>
          Border Weight
          <input
            type="range"
            name="borderWeight"
            value={state.borderWeight}
            min="1"
            max="20"
            onChange={({ target: { value } }) =>
              actions.setBorderWeight(parseInt(value, 10))
            }
          />
        </label>
      </Form>
    </div>
  );
};

export default App;
