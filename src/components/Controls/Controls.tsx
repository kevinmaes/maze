import React from 'react';

import { AppMachineEventId } from '../../statechart/appMachineTypes';
import StartOver from '../../assets/svg/controls/start-over.svg';
import Play from '../../assets/svg/controls/play.svg';
import Stop from '../../assets/svg/controls/stop.svg';
import Pause from '../../assets/svg/controls/pause.svg';
import StepForward from '../../assets/svg/controls/step-forward.svg';
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
const iconFillDisabledColor = '#D3D3D3';
// const iconFillInitializingColor = '#72B0FF';

const getIconFillColor = (enabled = false) =>
  enabled ? iconFillColor : iconFillDisabledColor;

export const Controls = ({ state, onControlClick }: Props) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const {
      currentTarget: { id },
    } = event;
    onControlClick(id);
  };

  const renderStateControls = (state: any) => {
    const canStartOver = state.can(AppMachineEventId.START_OVER);
    const canPlay = state.can(AppMachineEventId.PLAY);
    const canPause = state.can(AppMachineEventId.PAUSE);
    const canStop = state.can(AppMachineEventId.STOP);
    const canStepForward = state.can(AppMachineEventId.STEP_FORWARD);

    return (
      <ControlsGroup>
        {canStartOver ? (
          <ControlButton
            id={AppMachineEventId.START_OVER}
            onClick={handleClick}
            disabled={!canStartOver}
            title="Restart"
          >
            <StartOver fill={getIconFillColor(canStartOver)} />
          </ControlButton>
        ) : (
          <ControlButton
            id={AppMachineEventId.STOP}
            onClick={handleClick}
            disabled={!canStop}
            title="Stop"
          >
            <Stop fill={getIconFillColor(canStop)} />
          </ControlButton>
        )}

        {canPause ? (
          <ControlButton
            id={AppMachineEventId.PAUSE}
            onClick={handleClick}
            disabled={!canPause}
            title="Pause"
          >
            <Pause fill={getIconFillColor(canPause)} />
          </ControlButton>
        ) : (
          <ControlButton
            id={AppMachineEventId.PLAY}
            onClick={handleClick}
            disabled={!canPlay}
            title="Play"
          >
            <Play fill={getIconFillColor(canPlay)} />
          </ControlButton>
        )}

        <ControlButton
          id={AppMachineEventId.STEP_FORWARD}
          onClick={handleClick}
          disabled={!canStepForward}
          title="Step Next"
        >
          <StepForward fill={getIconFillColor(canStepForward)} />
        </ControlButton>
      </ControlsGroup>
    );
  };

  return <ControlsContainer>{renderStateControls(state)}</ControlsContainer>;
};
