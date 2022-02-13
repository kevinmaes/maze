import React from 'react';

import {
  PlaybackMachineStateType,
  EventId,
  PlaybackMachineState,
} from '../../statechart/appMachineTypes';
import { ReactComponent as StartOver } from '../../assets/images/controls/start-over.svg';
import { ReactComponent as Play } from '../../assets/images/controls/play.svg';
import { ReactComponent as Stop } from '../../assets/images/controls/stop.svg';
import { ReactComponent as Pause } from '../../assets/images/controls/pause.svg';
import { ReactComponent as StepForward } from '../../assets/images/controls/step-forward.svg';
import {
  ControlsContainer,
  ControlsGroup,
  ControlButton,
} from './Controls.css';

interface Props {
  state: any;
  onControlClick: Function;
}

const iconFillColor = '#2563EB';
const iconFillInitializingColor = '#72B0FF';
const iconFillDisabledColor = '#D3D3D3';

export const Controls = ({ state, onControlClick }: Props) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const {
      currentTarget: { id },
    } = event;
    onControlClick(id);
  };

  const renderStateControls = (state: any) => {
    switch (true) {
      case state.matches(PlaybackMachineState.IDLE):
        return (
          <ControlsGroup>
            <ControlButton
              id={EventId.START_OVER}
              onClick={handleClick}
              disabled
            >
              <StartOver fill={iconFillDisabledColor} />
            </ControlButton>
            <ControlButton id={EventId.STOP} onClick={handleClick} disabled>
              <Stop fill={iconFillDisabledColor} />
            </ControlButton>
            <ControlButton id={EventId.PLAY} onClick={handleClick}>
              <Play fill={iconFillColor} />
            </ControlButton>
            <ControlButton
              id={EventId.STEP_FORWARD}
              onClick={handleClick}
              disabled
            >
              <StepForward fill={iconFillDisabledColor} />
            </ControlButton>
          </ControlsGroup>
        );
      case state.matches(PlaybackMachineState.INITIALIZATION):
        return (
          <ControlsGroup flash>
            <ControlButton
              id={EventId.START_OVER}
              onClick={handleClick}
              disabled
            >
              <StartOver fill={iconFillInitializingColor} />
            </ControlButton>
            <ControlButton id={EventId.STOP} onClick={handleClick} disabled>
              <Stop fill={iconFillInitializingColor} />
            </ControlButton>
            <ControlButton id={EventId.PAUSE} onClick={handleClick} disabled>
              <Pause fill={iconFillInitializingColor} />
            </ControlButton>
            <ControlButton
              id={EventId.STEP_FORWARD}
              onClick={handleClick}
              disabled
            >
              <StepForward fill={iconFillDisabledColor} />
            </ControlButton>
          </ControlsGroup>
        );
      case state.matches('generation.playing'):
        return (
          <ControlsGroup>
            <ControlButton id={EventId.START_OVER} onClick={handleClick}>
              <StartOver fill={iconFillColor} />
            </ControlButton>
            <ControlButton id={EventId.STOP} onClick={handleClick}>
              <Stop fill={iconFillColor} />
            </ControlButton>
            <ControlButton id={EventId.PAUSE} onClick={handleClick}>
              <Pause fill={iconFillColor} />
            </ControlButton>
            <ControlButton
              id={EventId.STEP_FORWARD}
              onClick={handleClick}
              disabled
            >
              <StepForward fill={iconFillDisabledColor} />
            </ControlButton>
          </ControlsGroup>
        );
      case state.matches('generation.paused'):
        return (
          <ControlsGroup>
            <ControlButton
              id={EventId.START_OVER}
              onClick={handleClick}
              disabled
            >
              <StartOver fill={iconFillDisabledColor} />
            </ControlButton>
            <ControlButton id={EventId.STOP} onClick={handleClick} disabled>
              <Stop fill={iconFillDisabledColor} />
            </ControlButton>
            <ControlButton id={EventId.PLAY} onClick={handleClick}>
              <Play fill={iconFillColor} />
            </ControlButton>
            <ControlButton id={EventId.STEP_FORWARD} onClick={handleClick}>
              <StepForward fill={iconFillColor} />
            </ControlButton>
          </ControlsGroup>
        );
      case state.matches(PlaybackMachineState.DONE):
        return (
          <ControlsGroup>
            <ControlButton id={EventId.START_OVER} onClick={handleClick}>
              <StartOver fill={iconFillColor} />
            </ControlButton>
            <ControlButton id={EventId.STOP} onClick={handleClick} disabled>
              <Stop fill={iconFillDisabledColor} />
            </ControlButton>
            <ControlButton id={EventId.PLAY} onClick={handleClick} disabled>
              <Play fill={iconFillDisabledColor} />
            </ControlButton>
            <ControlButton
              id={EventId.STEP_FORWARD}
              onClick={handleClick}
              disabled
            >
              <StepForward fill={iconFillDisabledColor} />
            </ControlButton>
          </ControlsGroup>
        );

      default:
        return <>Can not load controls</>;
    }
  };

  return <ControlsContainer>{renderStateControls(state)}</ControlsContainer>;
};
