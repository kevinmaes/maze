import styled, { css, keyframes } from 'styled-components';

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

const flash = keyframes`
  from {
    opacity: .8;
    filter: saturate(5);
    filter: blur(1px);
  }
  
  to {
      opacity: 1;
      filter: saturate(0);
      filter: blur(0);
      }
`;

export const FlashingControlButton = styled(ControlButton)<{
  $animate: boolean;
}>`
  animation: ${(props) =>
    props.$animate &&
    css`
      ${flash} 0.3s ease-out
    `};
`;
