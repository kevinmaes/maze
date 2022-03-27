import React from 'react';

import { AppMachineEventId } from '../../statechart/appMachineTypes';
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
          >
            <StartOver fill={getIconFillColor(canStartOver)} />
          </ControlButton>
        ) : (
          <ControlButton
            id={AppMachineEventId.STOP}
            onClick={handleClick}
            disabled={!canStop}
          >
            <Stop fill={getIconFillColor(canStop)} />
          </ControlButton>
        )}

        {canPause ? (
          <ControlButton
            id={AppMachineEventId.PAUSE}
            onClick={handleClick}
            disabled={!canPause}
          >
            <Pause fill={getIconFillColor(canPause)} />
          </ControlButton>
        ) : (
          <ControlButton
            id={AppMachineEventId.PLAY}
            onClick={handleClick}
            disabled={!canPlay}
          >
            <Play fill={getIconFillColor(canPlay)} />
          </ControlButton>
        )}

        <ControlButton
          id={AppMachineEventId.STEP_FORWARD}
          onClick={handleClick}
          disabled={!canStepForward}
        >
          <StepForward fill={getIconFillColor(canStepForward)} />
        </ControlButton>
      </ControlsGroup>
    );
  };

  return <ControlsContainer>{renderStateControls(state)}</ControlsContainer>;
};
