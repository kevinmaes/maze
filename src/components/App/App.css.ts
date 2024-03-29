import styled from 'styled-components';

export const AppContainer = styled.div`
  text-align: center;
  font-size: 1.6rem;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  max-width: 400px;
  height: 235px;
  justify-content: space-evenly;
  margin: auto;
`;

export const P = styled.p`
  margin: 0;
`;

export const ReplayButton = styled.button`
  width: 200px;
  height: 35px;
  margin: 20px auto 0 auto;
  border-radius: 5px;
  border-color: transparent;
  cursor: pointer;
  color: white;
  font-weight: bold;
  background-color: #2563eb;
  text-transform: uppercase;
  box-shadow: 2px 2px 15px 1px rgba(0, 0, 0, 0.4);
`;
