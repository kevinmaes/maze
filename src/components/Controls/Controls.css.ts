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
  }
`;
