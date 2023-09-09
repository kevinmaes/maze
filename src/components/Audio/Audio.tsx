import { useRef } from 'react';
import useSound from 'use-sound';
import { frequencies, diatonicScales } from './notes';

interface Props {
  columnIndex: number;
  maxColumnIndex?: number;
  maxRowIndex?: number;
  rowIndex?: number;
}

export const Audio = ({ columnIndex }: Props) => {
  const startFrequency = frequencies['C0'];
  const prevColumnIndexRef = useRef<number>(0);
  const prevFrequencyIndexRef = useRef<number>(
    diatonicScales.c.major.indexOf('C0')
  );
  const increment: number = columnIndex - prevColumnIndexRef.current;
  const frequencyIndex = prevFrequencyIndexRef.current + increment;
  const note = diatonicScales.c.major[frequencyIndex];
  const frequency = frequencies[note];
  const playbackRate = frequency / startFrequency;

  const [play] = useSound('/sounds/marimba-c5.wav', {
    playbackRate,
  });

  play();

  prevColumnIndexRef.current = columnIndex;
  prevFrequencyIndexRef.current = frequencyIndex;

  return null;
};
