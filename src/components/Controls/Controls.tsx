import React, { useState } from 'react';

import {
  AppMachineContext,
  AppMachineEvent,
  AppMachineEventId,
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
import { Keyboard } from '../Keyboard/Keyboard';
import { Key } from '../Keyboard/Key';
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
  const [flashStepForward, setFlashStepForward] = useState(false);

  const keyHandlers = {
    keydown: (event: KeyboardEvent) => {
      if (event.key === Key.ARROW_RIGHT) {
        if (state.can({ type: 'STEP_FORWARD' })) {
          setFlashStepForward(true);
          setTimeout(() => setFlashStepForward(false), 200);
          onControlClick('STEP_FORWARD');
        }
      }
    },
    keyup: (event: KeyboardEvent) => {
      switch (event.key) {
        case Key.SPACE:
        case Key.ENTER: {
          if (state.can('PLAY')) {
            onControlClick('PLAY');
          }
          if (state.can('PAUSE')) {
            onControlClick('PAUSE');
          }
          if (state.can({ type: 'START_OVER' })) {
            onControlClick('START_OVER');
          }
          break;
        }

        case Key.ARROW_LEFT: {
          if (state.can({ type: 'START_OVER' })) {
            onControlClick('START_OVER');
          }
          break;
        }
        case Key.ESCAPE: {
          if (state.can('STOP')) {
            onControlClick('STOP');
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
    const canStartOver = state.can({ type: 'START_OVER' });
    const canPlay = state.can('PLAY');
    const canPause = state.can('PAUSE');
    const canStop = state.can('STOP');
    const canStepForward = state.can({ type: 'STEP_FORWARD' });

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
              id={'START_OVER'}
              onClick={handleClick}
              disabled={!canStartOver}
              title="Restart (ENTER)"
            >
              <StartOver fill={getIconFillColor(canStartOver)} />
            </ControlButton>
          ) : (
            <ControlButton
              id={'STOP'}
              onClick={handleClick}
              disabled={!canStop}
              title="Stop (ESC)"
            >
              <Stop fill={getIconFillColor(canStop)} />
            </ControlButton>
          )}
          {canPause ? (
            <ControlButton
              id={'PAUSE'}
              onClick={handleClick}
              disabled={!canPause}
              title="Pause (SPACE)"
            >
              <Pause fill={getIconFillColor(canPause)} />
            </ControlButton>
          ) : (
            <ControlButton
              id={'PLAY'}
              onClick={handleClick}
              disabled={!canPlay}
              title="Play (ENTER)"
            >
              <Play fill={getIconFillColor(canPlay)} />
            </ControlButton>
          )}
          <FlashingControlButton
            id={'STEP_FORWARD'}
            onClick={handleClick}
            disabled={!canStepForward}
            title="Step Forward (RIGHT ARROW)"
            animate={flashStepForward}
          >
            <StepForward fill={getIconFillColor(canStepForward)} />
          </FlashingControlButton>
        </ControlsGroup>
        {state.matches({
          generating: 'initializing',
        }) ? (
          <Prompt>Press ENTER to start</Prompt>
        ) : null}
      </div>
    );
  };

  return <ControlsContainer>{renderStateControls(state)}</ControlsContainer>;
};
