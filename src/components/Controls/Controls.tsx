import React from 'react';

import { ReactComponent as StartOver } from '../../assets/images/controls/start-over.svg';
import { ReactComponent as Play } from '../../assets/images/controls/play.svg';
import { ReactComponent as Stop } from '../../assets/images/controls/stop.svg';
import { ReactComponent as Pause } from '../../assets/images/controls/pause.svg';
import { ReactComponent as StepForward } from '../../assets/images/controls/step-forward.svg';
import { ReactComponent as StepBack } from '../../assets/images/controls/step-back.svg';
import { ControlButton } from './Controls.css';

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
            <ControlButton>
              <StartOver />
            </ControlButton>
            <ControlButton>
              <Play />
            </ControlButton>
            <ControlButton>
              <Stop />
            </ControlButton>
          </>
        );
      case 'initialization':
        return (
          <>
            <ControlButton>
              <StartOver />
            </ControlButton>
            <ControlButton>
              <Pause />
            </ControlButton>
            <ControlButton>
              <Stop />
            </ControlButton>
          </>
        );
      case 'playing':
        return (
          <>
            <ControlButton>
              <StartOver />
            </ControlButton>
            <ControlButton>
              <Pause />
            </ControlButton>
            <ControlButton>
              <Stop />
            </ControlButton>
          </>
        );
      case 'paused':
        return (
          <>
            <ControlButton>
              <StepBack />
            </ControlButton>
            <ControlButton>
              <Play />
            </ControlButton>
            <ControlButton>
              <StepForward />
            </ControlButton>
          </>
        );
      case 'done':
        return (
          <>
            <ControlButton>
              <StartOver />
            </ControlButton>
            <ControlButton>
              <Play />
            </ControlButton>
            <ControlButton>
              <Stop />
            </ControlButton>
          </>
        );

      default:
        return <>Can not load controls</>;
    }
  };

  return <>{renderStateControls(currentStateValue)}</>;
};
