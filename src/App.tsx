import React from 'react';
import debounce from 'lodash/debounce';

import logo from './logo.svg';
import './App.css';
import Stage from './components/stage/Stage';
import useDebounce from '../src/components/hooks/useDebounce';

const FPS_DEFAULT = 60;
const CELL_SIZE_DEFAULT = 25;
const BORDER_WEIGHT_DEFAULT = 1;

const DEBOUNCE_MS = 500;

const App: React.FC = () => {
  const [fps, setFPS] = React.useState(FPS_DEFAULT);
  const [cellSize, setCellSize] = React.useState(CELL_SIZE_DEFAULT);
  const [borderWeight, setBorderWeight] = React.useState(BORDER_WEIGHT_DEFAULT);

  const debouncedFPS = useDebounce(fps, DEBOUNCE_MS);
  const debouncedCellSize = useDebounce(cellSize, DEBOUNCE_MS);
  const debouncedBorderWeight = useDebounce(borderWeight, DEBOUNCE_MS);

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
      <form>
        <label>
          FPS
          <input
            type="range"
            name="fps"
            value={fps}
            min="1"
            max="60"
            onChange={({ target: { value } }) => setFPS(parseInt(value, 10))}
          />
        </label>
        <label>
          Cell Size
          <input
            type="number"
            name="cellSize"
            value={cellSize}
            onChange={({ target: { value } }) =>
              setCellSize(parseInt(value, 10))
            }
          />
        </label>
        <label>
          Border Weight
          <input
            type="number"
            name="borderWeight"
            value={borderWeight}
            onChange={({ target: { value } }) =>
              setBorderWeight(parseInt(value, 10))
            }
          />
        </label>
      </form>
    </div>
  );
};

export default App;
