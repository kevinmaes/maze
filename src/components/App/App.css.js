import styled from 'styled-components';

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  max-width: 400px;
  height: 200px;
  justify-content: space-evenly;
  margin: auto;
`;

export const ReplayButton = styled.button`
  width 200px;
  height: 30px;
  margin: 0 auto;
  border-radius: 5px;
  border-color: #ddd;
  cursor: pointer;
  color: white;
  font-weight: bold;
  background-color: #333;
  text-transform: uppercase;
`;
