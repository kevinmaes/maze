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
    const startOver = state.can(AppMachineEventId.START_OVER);
    const play = state.can(AppMachineEventId.PLAY);
    const pause = state.can(AppMachineEventId.PAUSE);
    const stop = state.can(AppMachineEventId.STOP);
    const stepForward = state.can(AppMachineEventId.STEP_FORWARD);

    return (
      <ControlsGroup>
        {startOver ? (
          <ControlButton
            id={AppMachineEventId.START_OVER}
            onClick={handleClick}
            disabled={!startOver}
          >
            <StartOver fill={getIconFillColor(startOver)} />
          </ControlButton>
        ) : (
          <ControlButton
            id={AppMachineEventId.STOP}
            onClick={handleClick}
            disabled={!stop}
          >
            <Stop fill={getIconFillColor(stop)} />
          </ControlButton>
        )}

        {play ? (
          <ControlButton
            id={AppMachineEventId.PLAY}
            onClick={handleClick}
            disabled={!play}
          >
            <Play fill={getIconFillColor(play)} />
          </ControlButton>
        ) : (
          <ControlButton
            id={AppMachineEventId.PAUSE}
            onClick={handleClick}
            disabled={!pause}
          >
            <Pause fill={getIconFillColor(pause)} />
          </ControlButton>
        )}

        <ControlButton
          id={AppMachineEventId.STEP_FORWARD}
          onClick={handleClick}
          disabled={!stepForward}
        >
          <StepForward fill={getIconFillColor(stepForward)} />
        </ControlButton>
      </ControlsGroup>
    );
  };

  return <ControlsContainer>{renderStateControls(state)}</ControlsContainer>;
};
