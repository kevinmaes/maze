import React from 'react';
import logo from './logo.svg';
import './App.css';
// import Stage from './components/stage/Stage';
import { P5Stage } from './components/p5Stage/P5Stage';

const App: React.FC = () => {
  return (
    <div className="App">
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}
      <P5Stage width={1000} height={1000} />
    </div>
  );
};

export default App;
