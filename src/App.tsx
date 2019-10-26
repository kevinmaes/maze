import React from 'react';
import logo from './logo.svg';
import './App.css';
import Stage from './components/stage/Stage';

const FPS_DEFAULT = 60;
const CELL_SIZE_DEFAULT = 100;
const BORDER_WEIGHT_DEFAULT = 1;

const App: React.FC = () => {
  const [fps, setFPS] = React.useState(FPS_DEFAULT);
  const [cellSize, setCellSize] = React.useState(CELL_SIZE_DEFAULT);
  const [borderWeight, setBorderWeight] = React.useState(BORDER_WEIGHT_DEFAULT);

  return (
    <div className="App">
      <Stage
        width={500}
        height={500}
        fps={fps}
        cellSize={cellSize}
        borderWeight={borderWeight}
        pixelRatio={1}
      />
      <form>
        <label>
          FPS
          <input
            type="number"
            name="fps"
            value={fps}
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
