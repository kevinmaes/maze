import styled from 'styled-components';
import { ControlButton } from '../Controls/Controls.css';

export const AudioForm = styled.form`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 300px;
  margin: 0 auto 5px auto;
`;

export const VolumneContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin-right: 10px;
`;

export const StyledAudioControlButton = styled(ControlButton)`
  padding: 0 12px 0 14px;
`;

export const Volume = styled.input`
  margin-right: 15px;
`;

export const ToggleContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  min-width: 120px;
  margin-right: 15px;
`;

export const Toggle = styled.button<{ $on: boolean }>`
  width: 50px;
  height: 25px;
  position: relative;
  border-radius: 25px;
  outline: none;
  background: ${(props) => (props.$on ? '#7A9EC0' : 'darkgray')};
  transition: background 0.2s ease-out;
  border: none;
  cursor: pointer;
  margin-right: 10px;

  &::after {
    content: '';
    position: absolute;
    top: 1px;
    will-change: transform;
    transform: translate(${(props) => (props.$on ? 3 : -23)}px);
    transition: transform 0.2s ease-out;
    width: 22px;
    height: 22px;
    background: white;
    box-shadow: 2px 2px 2px gray;
    border: none;
    outline: none;
    border-radius: 50%;
  }
`;
