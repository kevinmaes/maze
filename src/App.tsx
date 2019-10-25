import React from 'react';
import logo from './logo.svg';
import './App.css';
import Stage from './components/stage/Stage';

const App: React.FC = () => {
  const [fps, setFPS] = React.useState(60);
  console.log({ fps });
  return (
    <div className="App">
      <Stage width={500} height={500} fps={fps} pixelRatio={1} />
      <form>
        <input
          type="number"
          name="fps"
          value={fps}
          onChange={({ target: { value } }) => setFPS(parseInt(value, 10))}
        />
      </form>
    </div>
  );
};

export default App;
