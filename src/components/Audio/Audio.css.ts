import styled from 'styled-components';

export const Toggle = styled.button<{ on: boolean }>`
  width: 50px;
  height: 25px;
  position: relative;
  border-radius: 25px;
  outline: none;
  background: ${(props) => (props.on ? '#7A9EC0' : 'darkgray')};
  transition: background 0.2s ease-out;
  border: none;
  cursor: pointer;

  &::after {
    content: '';
    position: absolute;
    top: 1px;
    will-change: transform;
    transform: translate(${(props) => (props.on ? 3 : -23)}px);
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
