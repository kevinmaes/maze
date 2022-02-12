import styled from 'styled-components';

export const StartOver = styled.button``;
export const Play = styled.button``;
export const Stop = styled.button``;
export const Pause = styled.button``;
export const StepBack = styled.button``;
export const StepForward = styled.button``;

export const ControlsGroup = styled.div`
  display: flex;
  width: 110px;
  justify-content: space-between;
`;

export const ControlButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  margin: 0;

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
