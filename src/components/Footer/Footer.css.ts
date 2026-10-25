import styled from 'styled-components';

export const FooterContainer = styled.footer`
  height: 300px;
  line-height: 30px;
`;

export const Technologies = styled.div`
  display: flex;
  justify-content: space-evenly;
  flex-direction: row;
  align-content: center;
  align-items: center;
  margin: 0 auto;
  width: 180px;
`;

export const VersionContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
  margin: 5px auto;
  width: 300px;
`;

export const Version = styled.h5`
  display: inline;
  margin-left: 4px;
  margin-right: 12px;
  color: #555;
`;

export const Link = styled.a`
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
