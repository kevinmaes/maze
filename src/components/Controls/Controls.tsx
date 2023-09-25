import React, { useState } from 'react';

import Pause from '../../assets/svg/controls/pause.svg';
import Play from '../../assets/svg/controls/play.svg';
import StartOver from '../../assets/svg/controls/start-over.svg';
import StepForward from '../../assets/svg/controls/step-forward.svg';
import Stop from '../../assets/svg/controls/stop.svg';
import { Keyboard } from '../Keyboard/Keyboard';
import {
  ControlButton,
  ControlsContainer,
  ControlsGroup,
  FlashingControlButton,
  HiddenLabel,
  Prompt,
} from './Controls.css';
import {
  AppMachineEvent,
  AppMachineState,
  ControlEvent,
} from '../../statechart/app.machine';

export interface AppControlLabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor: ControlEvent['type'];
}

export interface AppControlButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  id: ControlEvent['type'];
}

export function PlayControlLabel(props: AppControlLabelProps) {
  const { children, ...rest } = props;
  return <HiddenLabel {...rest}>{children}</HiddenLabel>;
}

export function PlayControlButton(props: AppControlButtonProps) {
  const { children, ...rest } = props;
  return <ControlButton {...rest}>{children}</ControlButton>;
}

interface FlashingAppControlButtonProps extends AppControlButtonProps {
  $animate: boolean;
}

function FlashingAppControlButton(props: FlashingAppControlButtonProps) {
  const { children, ...rest } = props;
  return <FlashingControlButton {...rest}>{children}</FlashingControlButton>;
}

interface Props {
  state: AppMachineState;
  sendControlEvent: (event: AppMachineEvent) => void;
}

const iconFillColor = '#2563EB';
const iconFillDisabledColor = '#D3D3D3';
// const iconFillInitializingColor = '#72B0FF';

const getIconFillColor = (enabled = false) =>
  enabled ? iconFillColor : iconFillDisabledColor;

export function Controls({ state, sendControlEvent }: Props) {
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
    const eventObj = { type: id } as AppMachineEvent;
    sendControlEvent(eventObj);
  };

  const renderStateControls = (state: AppMachineState) => {
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
            <>
              <PlayControlLabel htmlFor="app.restart">Restart</PlayControlLabel>
              <PlayControlButton
                id="app.restart"
                onClick={handleClick}
                disabled={!canStartOver}
                title="Restart (ENTER)"
              >
                <StartOver fill={getIconFillColor(canStartOver)} />
              </PlayControlButton>
            </>
          ) : (
            <>
              <PlayControlLabel htmlFor="controls.stop">Stop</PlayControlLabel>
              <PlayControlButton
                id="controls.stop"
                onClick={handleClick}
                disabled={!canStop}
                title="Stop (ESC)"
              >
                <Stop fill={getIconFillColor(canStop)} />
              </PlayControlButton>
            </>
          )}
          {canPause ? (
            <>
              <PlayControlLabel htmlFor="controls.pause">
                Pause
              </PlayControlLabel>
              <PlayControlButton
                id="controls.pause"
                onClick={handleClick}
                disabled={!canPause}
                title="Pause (SPACE)"
              >
                <Pause fill={getIconFillColor(canPause)} />
              </PlayControlButton>
            </>
          ) : (
            <>
              <PlayControlLabel htmlFor="controls.play">Play</PlayControlLabel>
              <PlayControlButton
                id="controls.play"
                onClick={handleClick}
                disabled={!canPlay}
                title="Play (ENTER)"
              >
                <Play fill={getIconFillColor(canPlay)} />
              </PlayControlButton>
            </>
          )}
          <PlayControlLabel htmlFor="controls.step.forward">
            Step forward
          </PlayControlLabel>
          <FlashingAppControlButton
            id="controls.step.forward"
            onClick={handleClick}
            disabled={!canStepForward}
            title="Step Forward (RIGHT ARROW)"
            $animate={flashStepForward}
          >
            <StepForward fill={getIconFillColor(canStepForward)} />
          </FlashingAppControlButton>
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
}
