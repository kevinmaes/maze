import React from 'react';

import { ReactComponent as StartOver } from '../../assets/images/controls/start-over.svg';
import { ReactComponent as Play } from '../../assets/images/controls/play.svg';
import { ReactComponent as Stop } from '../../assets/images/controls/stop.svg';
import { ReactComponent as Pause } from '../../assets/images/controls/pause.svg';
import { ReactComponent as StepForward } from '../../assets/images/controls/step-forward.svg';
import { ReactComponent as StepBack } from '../../assets/images/controls/step-back.svg';
import { ControlsGroup, ControlButton } from './Controls.css';

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

const iconFillColor = '#006400';
const iconFillDisabledColor = '#D3D3D3';

export const Controls = ({ currentStateValue = 'idle' }: Props) => {
  const renderStateControls = (currentStateValue: string) => {
    switch (currentStateValue) {
      case 'idle':
        return (
          <ControlsGroup>
            <ControlButton disabled>
              <StartOver fill={iconFillDisabledColor} />
            </ControlButton>
            <ControlButton>
              <Play fill={iconFillColor} />
            </ControlButton>
            <ControlButton disabled>
              <Stop fill={iconFillDisabledColor} />
            </ControlButton>
          </ControlsGroup>
        );
      case 'initialization':
        return (
          <ControlsGroup>
            <ControlButton disabled>
              <StartOver fill={iconFillDisabledColor} />
            </ControlButton>
            <ControlButton disabled>
              <Pause fill={iconFillDisabledColor} />
            </ControlButton>
            <ControlButton disabled>
              <Stop fill={iconFillDisabledColor} />
            </ControlButton>
          </ControlsGroup>
        );
      case 'playing':
        return (
          <ControlsGroup>
            <ControlButton>
              <StartOver fill={iconFillColor} />
            </ControlButton>
            <ControlButton>
              <Pause fill={iconFillColor} />
            </ControlButton>
            <ControlButton>
              <Stop fill={iconFillColor} />
            </ControlButton>
          </ControlsGroup>
        );
      case 'paused':
        return (
          <ControlsGroup>
            <ControlButton>
              <StepBack fill={iconFillColor} />
            </ControlButton>
            <ControlButton>
              <Play fill={iconFillColor} />
            </ControlButton>
            <ControlButton>
              <StepForward fill={iconFillColor} />
            </ControlButton>
          </ControlsGroup>
        );
      case 'done':
        return (
          <ControlsGroup>
            <ControlButton>
              <StartOver fill={iconFillColor} />
            </ControlButton>
            <ControlButton disabled>
              <Play fill={iconFillDisabledColor} />
            </ControlButton>
            <ControlButton disabled>
              <Stop fill={iconFillDisabledColor} />
            </ControlButton>
          </ControlsGroup>
        );

      default:
        return <ControlsGroup>Can not load controls</ControlsGroup>;
    }
  };

  return <>{renderStateControls(currentStateValue)}</>;
};
