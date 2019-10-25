import React from 'react';
import logo from './logo.svg';
import './App.css';
import Stage from './components/stage/Stage';

const App: React.FC = () => {
  return (
    <div className="App">
      <Stage width={500} height={500} fps={60} />
    </div>
  );
};

export default App;
