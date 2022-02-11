import React from 'react';
interface Props {
  currentStateValue: string; // Lock this down to the known state types.
}

const controlRenderers = {
  idle: () => {},
  initialization: () => {},
  playing: () => {},
  paused: () => {},
  done: () => {},
};

export const Controls = ({ currentStateValue = 'idle' }: Props) => {
  const renderStateControls = (currentStateValue: string) => {
    switch (currentStateValue) {
      case 'idle':
        return (
          <>
            <button>Start Over</button>
            <button>Play</button>
            <button>Stop</button>
          </>
        );
      case 'initialization':
        return (
          <>
            <button>Start Over</button>
            <button>Pause</button>
            <button>Stop</button>
          </>
        );
      case 'playing':
        return (
          <>
            <button>Start Over</button>
            <button>Pause</button>
            <button>Stop</button>
          </>
        );
      case 'paused':
        return (
          <>
            <button>Step Back</button>
            <button>Play</button>
            <button>Step Forward</button>
          </>
        );
      case 'done':
        return (
          <>
            <button>Start Over</button>
            <button>Play</button>
            <button>Stop</button>
          </>
        );

      default:
        return (
          <>
            <button>Start Over</button>
            <button>Play</button>
            <button>Stop</button>
          </>
        );
    }
  };

  return <>{renderStateControls(currentStateValue)}</>;
};
