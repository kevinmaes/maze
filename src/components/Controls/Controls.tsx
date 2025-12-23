import React, { useState } from 'react';

import { useSelector } from '@xstate/react';
import { EventFrom } from 'xstate';
import Pause from '../../assets/svg/controls/pause.svg';
import Play from '../../assets/svg/controls/play.svg';
import StartOver from '../../assets/svg/controls/start-over.svg';
import StepForward from '../../assets/svg/controls/step-forward.svg';
import Stop from '../../assets/svg/controls/stop.svg';
import {
  appMachine,
  AppMachineContext,
  ControlEvent,
} from '../../statechart/app.machine';
import { Keyboard } from '../Keyboard/Keyboard';
import { HiddenLabel } from '../shared/form.css';
import {
  ControlButton,
  ControlsContainer,
  ControlsGroup,
  FlashingControlButton,
  Prompt,
} from './Controls.css';

export interface PlayControlLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor: ControlEvent['type'];
}

export interface PlayControlButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  id: ControlEvent['type'];
}

export function PlayControlLabel(props: PlayControlLabelProps) {
  const { children, ...rest } = props;
  return <HiddenLabel {...rest}>{children}</HiddenLabel>;
}

export function PlayControlButton(props: PlayControlButtonProps) {
  const { children, ...rest } = props;
  return <ControlButton {...rest}>{children}</ControlButton>;
}

interface FlashingPlayControlButtonProps extends PlayControlButtonProps {
  $animate: boolean;
}

function FlashingAppControlButton(props: FlashingPlayControlButtonProps) {
  const { children, ...rest } = props;
  return <FlashingControlButton {...rest}>{children}</FlashingControlButton>;
}

const iconFillColor = '#2563EB';
const iconFillDisabledColor = '#D3D3D3';
// const iconFillInitializingColor = '#72B0FF';

const getIconFillColor = (enabled = false) =>
  enabled ? iconFillColor : iconFillDisabledColor;

export function Controls() {
  const actorRef = AppMachineContext.useActorRef();
  const state = useSelector(actorRef, (state) => state);

  const [flashStepForward, setFlashStepForward] = useState(false);

  const keyHandlers = {
    keydown: (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        if (state.can({ type: 'controls.step.forward' })) {
          setFlashStepForward(true);
          setTimeout(() => setFlashStepForward(false), 200);
          actorRef.send({ type: 'controls.step.forward' });
        }
      }
    },
    keyup: (event: KeyboardEvent) => {
      switch (event.key) {
        case ' ':
        case 'Enter': {
          if (state.can({ type: 'controls.play' })) {
            actorRef.send({ type: 'controls.play' });
          }
          if (state.can({ type: 'controls.pause' })) {
            actorRef.send({ type: 'controls.pause' });
          }
          if (state.can({ type: 'app.restart' })) {
            actorRef.send({ type: 'app.restart' });
          }
          break;
        }

        case 'ArrowLeft': {
          if (state.can({ type: 'app.restart' })) {
            actorRef.send({ type: 'app.restart' });
          }
          break;
        }
        case 'Escape': {
          if (state.can({ type: 'controls.stop' })) {
            actorRef.send({ type: 'controls.stop' });
          }
          break;
        }
        default:
      }
    },
  };

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    const {
      currentTarget: { id },
    } = event;

    // Prevent state change if button not actually clicked
    // It means it was from a keyboard event while focused (Space or Enter).
    if (event.detail === 0) {
      return;
    }
    const eventObj = { type: id } as EventFrom<typeof appMachine>;
    actorRef.send(eventObj);
  }

  const canStartOver = state.can({ type: 'app.restart' });
  const canPlay = state.can({ type: 'controls.play' });
  const canPause = state.can({ type: 'controls.pause' });
  const canStop = state.can({ type: 'controls.stop' });
  const canStepForward = state.can({ type: 'controls.step.forward' });

  return (
    <ControlsContainer>
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
            <PlayControlLabel htmlFor="controls.pause">Pause</PlayControlLabel>
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
    </ControlsContainer>
  );
}
