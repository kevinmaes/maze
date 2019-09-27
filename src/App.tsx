import React from 'react';
import logo from './logo.svg';
import './App.css';
import Stage from './components/stage/Stage';

const App: React.FC = () => {
  return (
    <div className="App">
      <Stage width={1000} height={1000} />
    </div>
  );
};

export default App;
