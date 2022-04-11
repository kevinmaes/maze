import styled from 'styled-components';

export const StartOver = styled.button``;
export const Play = styled.button``;
export const Stop = styled.button``;
export const Pause = styled.button``;
export const StepBack = styled.button``;
export const StepForward = styled.button``;

export const ControlsContainer = styled.div`
  width: 170px;
  height: 50px;
  border: 1px solid white;
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.2);
  margin: 10px auto;
`;

export const ControlsGroup = styled.div<{ flash?: boolean }>`
  display: flex;
  width: 170px;
  height: 50px;
  justify-content: space-evenly;
  margin: auto auto 5px auto;

  // TODO: Need to tweak this later
  // & button {
  //   animation-name: flash;
  //   animation-iteration-count: 3;
  //   animation-duration: 0.2s;
  //   animation-play-state: ${({ flash }) => (flash ? 'running' : 'paused')};

  //   @keyframes flash {
  //     from {
  //       opacity: 1;
  //     }

  //     to {
  //       opacity: 0;
  //     }
  //   }
  /* } */
`;

export const Prompt = styled.span`
  margin-top: 10px;
  font-size: 0.8em;
  color: gray;
`;

export const ControlButton = styled.button`
  background: transparent;
  border: none;
  height: 50px;
  cursor: pointer;
  margin: 0;
  padding: 0;

  :disabled {
    cursor: auto;
    pointer-events: none;
  }

  :disabled > svg {
    filter: drop-shadow(1px 1px 2px rgb(0 0 0 / 0.4));
  }

  & svg {
    filter: drop-shadow(2px 2px 2px rgb(0 0 0 / 0.4));
  }

  & svg:active {
    filter: drop-shadow(1px 1px 1px rgb(0 0 0 / 0.4));
    transform: translate(1px, 1px);
  }
`;
