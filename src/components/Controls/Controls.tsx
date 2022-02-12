import React from 'react';

import {
  PlaybackMachineStateType,
  EventId,
} from '../../statechart/playbackMachineTypes';
import { ReactComponent as StartOver } from '../../assets/images/controls/start-over.svg';
import { ReactComponent as Play } from '../../assets/images/controls/play.svg';
import { ReactComponent as Stop } from '../../assets/images/controls/stop.svg';
import { ReactComponent as Pause } from '../../assets/images/controls/pause.svg';
import { ReactComponent as StepForward } from '../../assets/images/controls/step-forward.svg';
import { ReactComponent as StepBack } from '../../assets/images/controls/step-back.svg';
import {
  ControlsContainer,
  ControlsGroup,
  ControlButton,
} from './Controls.css';

interface Props {
  currentPlaybackState: PlaybackMachineStateType;
  onControlClick: Function;
}

const iconFillColor = '#2563EB';
const iconFillDisabledColor = '#D3D3D3';

export const Controls = ({ currentPlaybackState, onControlClick }: Props) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const {
      currentTarget: { id },
    } = event;
    onControlClick(id);
  };

  const renderStateControls = (currentPlaybackState: string) => {
    switch (currentPlaybackState) {
      case 'idle':
        return (
          <ControlsGroup>
            <ControlButton disabled>
              <StartOver fill={iconFillDisabledColor} />
            </ControlButton>
            <ControlButton id={EventId.PLAY} onClick={handleClick}>
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
            <ControlButton id={EventId.START_OVER} onClick={handleClick}>
              <StartOver fill={iconFillColor} />
            </ControlButton>
            <ControlButton id={EventId.PAUSE} onClick={handleClick}>
              <Pause fill={iconFillColor} />
            </ControlButton>
            <ControlButton id={EventId.STOP} onClick={handleClick}>
              <Stop fill={iconFillColor} />
            </ControlButton>
          </ControlsGroup>
        );
      case 'paused':
        return (
          <ControlsGroup>
            <ControlButton id={EventId.STEP_BACK} onClick={handleClick}>
              <StepBack fill={iconFillColor} />
            </ControlButton>
            <ControlButton id={EventId.PLAY} onClick={handleClick}>
              <Play fill={iconFillColor} />
            </ControlButton>
            <ControlButton id={EventId.STEP_FORWARD} onClick={handleClick}>
              <StepForward fill={iconFillColor} />
            </ControlButton>
          </ControlsGroup>
        );
      case 'done':
        return (
          <ControlsGroup>
            <ControlButton id={EventId.START_OVER} onClick={handleClick}>
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
        return <>Can not load controls</>;
    }
  };

  return (
    <ControlsContainer>
      {renderStateControls(currentPlaybackState)}
    </ControlsContainer>
  );
};
