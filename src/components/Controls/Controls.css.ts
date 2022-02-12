import styled from 'styled-components';

export const StartOver = styled.button``;
export const Play = styled.button``;
export const Stop = styled.button``;
export const Pause = styled.button``;
export const StepBack = styled.button``;
export const StepForward = styled.button``;

export const ControlsContainer = styled.div`
  width: 200px;
  height: 50px;
  border: 1px solid white;
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.2);
  margin: auto;
`;

export const ControlsGroup = styled.div`
  display: flex;
  width: 150px;
  height: 50px;
  justify-content: space-evenly;
  margin: auto;
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
