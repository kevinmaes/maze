import { useEffect, useRef } from 'react';
import useSound from 'use-sound';
import { frequencies, diatonicScales } from './notes';
import { ActorRefFrom } from 'xstate';
import { generationAlgorithmMachine } from '../../statechart/recursiveBacktracker.machine';

const audioOptions: Array<{
  name: string;
  startFrequency: keyof typeof frequencies;
  path: string;
}> = [
  {
    name: 'Marimba 1',
    startFrequency: 'C3',
    path: '/sounds/Ensoniq-ESQ-1-Marimba-C3.wav',
  },
  {
    name: 'Marimba 2',
    startFrequency: 'C5',
    path: '/sounds/marimba-c5.wav',
  },
  {
    name: 'Synth 1',
    startFrequency: 'C1',
    path: '/sounds/Casio-CZ-5000-Synth-Bass-C1.wav',
  },
];

interface Props {
  algorithmActor: ActorRefFrom<typeof generationAlgorithmMachine>;
  generationSessionId: number;
}

export const Audio = ({ algorithmActor, generationSessionId }: Props) => {
  const selectedAudio = audioOptions[0];
  const prevColumnIndexRef = useRef<number>(0);
  const prevRowIndexRef = useRef<number>(0);
  const prevFrequencyIndexRef = useRef<number>(
    diatonicScales.c.major.indexOf(selectedAudio.startFrequency)
  );

  const columnIndex =
    algorithmActor?.getSnapshot().context.currentCell?.getColumnIndex() ?? 0;
  const rowIndex =
    algorithmActor?.getSnapshot().context.currentCell?.getRowIndex() ?? 0;

  const columnChange: number = columnIndex - prevColumnIndexRef.current;
  const rowChange: number = rowIndex - prevRowIndexRef.current;

  const increment =
    // If only moving one cell at a time, increment by one in either direction
    Math.abs(Math.max(columnChange, rowChange)) <= 1
      ? columnChange || rowChange
      : // Otherwise combine changes in both directions.
        columnChange + rowChange;
  const frequencyIndex = prevFrequencyIndexRef.current + increment;
  const note = diatonicScales.c.major[frequencyIndex];
  const frequency = frequencies[note];
  const playbackRate = frequency / frequencies[selectedAudio.startFrequency];

  useEffect(() => {
    prevFrequencyIndexRef.current = diatonicScales.c.major.indexOf(
      selectedAudio.startFrequency
    );
  }, [generationSessionId, selectedAudio.startFrequency]);

  const [play] = useSound(selectedAudio.path, {
    playbackRate,
  });

  play();

  prevColumnIndexRef.current = columnIndex;
  prevRowIndexRef.current = rowIndex;
  prevFrequencyIndexRef.current = frequencyIndex;

  return null;
};
