import React, { useState } from 'react';

import { StateFrom } from 'xstate';
import Pause from '../../assets/svg/controls/pause.svg';
import Play from '../../assets/svg/controls/play.svg';
import StartOver from '../../assets/svg/controls/start-over.svg';
import StepForward from '../../assets/svg/controls/step-forward.svg';
import Stop from '../../assets/svg/controls/stop.svg';
import {
  AppMachineContext,
  AppMachineEvent,
  AppMachineEventId,
} from '../../statechart/appMachineTypes';
import { Keyboard } from '../Keyboard/Keyboard';
import {
  ControlButton,
  ControlsContainer,
  ControlsGroup,
  FlashingControlButton,
  Prompt,
} from './Controls.css';
import { appMachine } from '../../statechart/app.machine';

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: any;
  sendControlEvent: (event: AppMachineEvent) => void;
}

const iconFillColor = '#2563EB';
const iconFillDisabledColor = '#D3D3D3';
// const iconFillInitializingColor = '#72B0FF';

const getIconFillColor = (enabled = false) =>
  enabled ? iconFillColor : iconFillDisabledColor;

export const Controls = ({ state, sendControlEvent }: Props) => {
  const [flashStepForward, setFlashStepForward] = useState(false);

  const keyHandlers = {
    keydown: (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        if (state.can({ type: 'controls.step.forward' })) {
          setFlashStepForward(true);
          setTimeout(() => setFlashStepForward(false), 200);
          sendControlEvent({ type: 'controls.step.forward' });
        }
      }
    },
    keyup: (event: KeyboardEvent) => {
      switch (event.key) {
        case ' ':
        case 'Enter': {
          if (state.can({ type: 'controls.play' })) {
            sendControlEvent({ type: 'controls.play' });
          }
          if (state.can({ type: 'controls.pause' })) {
            sendControlEvent({ type: 'controls.pause' });
          }
          if (state.can({ type: 'app.restart' })) {
            sendControlEvent({ type: 'app.restart' });
          }
          break;
        }

        case 'ArrowLeft': {
          if (state.can({ type: 'app.restart' })) {
            sendControlEvent({ type: 'app.restart' });
          }
          break;
        }
        case 'Escape': {
          if (state.can({ type: 'controls.stop' })) {
            sendControlEvent({ type: 'controls.stop' });
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
    const type = id as AppMachineEventId;
    const eventObj = { type } as AppMachineEvent;
    sendControlEvent(eventObj);
  };

  const renderStateControls = (state: StateFrom<typeof appMachine>) => {
    const canStartOver = state.can({ type: 'app.restart' });
    const canPlay = state.can({ type: 'controls.play' });
    const canPause = state.can({ type: 'controls.pause' });
    const canStop = state.can({ type: 'controls.stop' });
    const canStepForward = state.can({ type: 'controls.step.forward' });

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
              id="app.restart"
              onClick={handleClick}
              disabled={!canStartOver}
              title="Restart (ENTER)"
            >
              <StartOver fill={getIconFillColor(canStartOver)} />
            </ControlButton>
          ) : (
            <ControlButton
              id="controls.stop"
              onClick={handleClick}
              disabled={!canStop}
              title="Stop (ESC)"
            >
              <Stop fill={getIconFillColor(canStop)} />
            </ControlButton>
          )}
          {canPause ? (
            <ControlButton
              id="controls.pause"
              onClick={handleClick}
              disabled={!canPause}
              title="Pause (SPACE)"
            >
              <Pause fill={getIconFillColor(canPause)} />
            </ControlButton>
          ) : (
            <ControlButton
              id="controls.play"
              onClick={handleClick}
              disabled={!canPlay}
              title="Play (ENTER)"
            >
              <Play fill={getIconFillColor(canPlay)} />
            </ControlButton>
          )}
          <FlashingControlButton
            id="controls.step.forward"
            onClick={handleClick}
            disabled={!canStepForward}
            title="Step Forward (RIGHT ARROW)"
            $animate={flashStepForward}
          >
            <StepForward fill={getIconFillColor(canStepForward)} />
          </FlashingControlButton>
        </ControlsGroup>
        {state.matches({
          Generating: 'Initializing',
        }) ? (
          <Prompt>Press ENTER to start</Prompt>
        ) : null}
      </div>
    );
  };

  return <ControlsContainer>{renderStateControls(state)}</ControlsContainer>;
};
