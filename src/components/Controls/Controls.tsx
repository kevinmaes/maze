import React, { useState } from 'react';

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
  FlashingControlButton,
} from './Controls.css';
import { State } from 'xstate';
import { Keyboard } from '../Keyboard/Keyboard';
import { Key } from '../Keyboard/Key';

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
  const [flashStepForward, setFlashStepForward] = useState(false);

  const keyHandlers = {
    keyup: (event: KeyboardEvent) => {
      switch (event.key) {
        case Key.SPACE:
        case Key.ENTER: {
          if (state.can(AppMachineEventId.PLAY)) {
            onControlClick(AppMachineEventId.PLAY);
          }
          if (state.can(AppMachineEventId.PAUSE)) {
            onControlClick(AppMachineEventId.PAUSE);
          }
          if (state.can(AppMachineEventId.START_OVER)) {
            onControlClick(AppMachineEventId.START_OVER);
          }
          break;
        }
        case Key.ARROW_RIGHT: {
          if (state.can(AppMachineEventId.STEP_FORWARD)) {
            setFlashStepForward(true);
            setTimeout(() => setFlashStepForward(false), 200);
            onControlClick(AppMachineEventId.STEP_FORWARD);
          }
          break;
        }
        case Key.ARROW_LEFT: {
          if (state.can(AppMachineEventId.START_OVER)) {
            onControlClick(AppMachineEventId.START_OVER);
          }
          break;
        }
        case Key.ESCAPE: {
          if (state.can(AppMachineEventId.STOP)) {
            onControlClick(AppMachineEventId.STOP);
          }
          break;
        }
        default:
      }
    },
  };

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
        {typeof window !== 'undefined' && (
          <Keyboard
            eventEmitter={window.document}
            handlers={keyHandlers}
            state={JSON.stringify(state.value)}
          />
        )}
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
          <FlashingControlButton
            id={AppMachineEventId.STEP_FORWARD}
            onClick={handleClick}
            disabled={!canStepForward}
            title="Step Forward (RIGHT ARROW)"
            animate={flashStepForward}
          >
            <StepForward fill={getIconFillColor(canStepForward)} />
          </FlashingControlButton>
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
