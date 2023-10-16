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

export const Footer = styled.footer`
  height: 300px;
  line-height: 30px;
`;

export const Technologies = styled.div`
  display: flex;
  justify-content: space-evenly;
  flex-direction: row;
  align-content: center;
  align-items: center;
  margin: 20px auto;
  width: 150px;
`;

export const VersionContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
  margin: 5px auto;
  width: 195px;
  height: 25px;
`;

export const Version = styled.h5`
  display: inline;
  margin-left: 4px;
  margin-right: 12px;
  color: #555;
`;

export const Link = styled.a`
  width: 180px;
  text-decoration: none;
  line-height: 20px;
  color: #0070f3;
  display: inline;
`;

export const ImageHolder = styled.div`
  display: inline-block;
  vertical-align: middle;
  margin-right: 5px;
`;
