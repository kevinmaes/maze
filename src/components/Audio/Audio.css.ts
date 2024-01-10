import styled from 'styled-components';
import { ControlButton } from '../Controls/Controls.css';

export const AudioForm = styled.form`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 300px;
  margin: 0 auto 5px auto;
`;

export const Select = styled.select`
  border: 1px solid #e9e9e9;
  border-radius: 5;
  margin-bottom: 1rem;
  padding: 0.4rem 0.8rem;
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
