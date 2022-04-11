import React from 'react';

import {
  AppMachineContext,
  AppMachineEvent,
  AppMachineEventId,
  AppMachineState,
} from '../../statechart/appMachineTypes';
import StartOver from '../../assets/svg/controls/start-over.svg';
import Play from '../../assets/svg/controls/play.svg';
import Stop from '../../assets/svg/controls/stop.svg';
import Pause from '../../assets/svg/controls/pause.svg';
import StepForward from '../../assets/svg/controls/step-forward.svg';
import {
  ControlsContainer,
  ControlsGroup,
  ControlButton,
  Prompt,
} from './Controls.css';
import { State } from 'xstate';

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: any;
  onControlClick: (eventId: AppMachineEventId) => void;
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
    // Prevent state change if button not actually clicked
    // It means it was from a keyboard event while focused (Space or Enter).
    if (event.detail === 0) {
      return;
    }
    onControlClick(id as AppMachineEventId);
  };

  const renderStateControls = (
    state: State<AppMachineContext, AppMachineEvent>
  ) => {
    const canStartOver = state.can(AppMachineEventId.START_OVER);
    const canPlay = state.can(AppMachineEventId.PLAY);
    const canPause = state.can(AppMachineEventId.PAUSE);
    const canStop = state.can(AppMachineEventId.STOP);
    const canStepForward = state.can(AppMachineEventId.STEP_FORWARD);

    return (
      <div>
        <ControlsGroup>
          {canStartOver ? (
            <ControlButton
              id={AppMachineEventId.START_OVER}
              onClick={handleClick}
              disabled={!canStartOver}
              title="Restart (ENTER)"
            >
              <StartOver fill={getIconFillColor(canStartOver)} />
            </ControlButton>
          ) : (
            <ControlButton
              id={AppMachineEventId.STOP}
              onClick={handleClick}
              disabled={!canStop}
              title="Stop (ESC)"
            >
              <Stop fill={getIconFillColor(canStop)} />
            </ControlButton>
          )}
          {canPause ? (
            <ControlButton
              id={AppMachineEventId.PAUSE}
              onClick={handleClick}
              disabled={!canPause}
              title="Pause (SPACE)"
            >
              <Pause fill={getIconFillColor(canPause)} />
            </ControlButton>
          ) : (
            <ControlButton
              id={AppMachineEventId.PLAY}
              onClick={handleClick}
              disabled={!canPlay}
              title="Play (ENTER)"
            >
              <Play fill={getIconFillColor(canPlay)} />
            </ControlButton>
          )}
          <ControlButton
            id={AppMachineEventId.STEP_FORWARD}
            onClick={handleClick}
            disabled={!canStepForward}
            title="Step Next (RIGHT ARROW)"
          >
            <StepForward fill={getIconFillColor(canStepForward)} />
          </ControlButton>
        </ControlsGroup>
        {state.matches({
          [AppMachineState.GENERATING]: AppMachineState.INITIALIZING,
        }) ? (
          <Prompt>Press ENTER to start</Prompt>
        ) : null}
      </div>
    );
  };

  return <ControlsContainer>{renderStateControls(state)}</ControlsContainer>;
};
