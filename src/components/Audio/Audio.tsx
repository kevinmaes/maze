import { useEffect, useRef, useState } from 'react';
import useSound from 'use-sound';
import { frequencies, diatonicScales, arpegios } from './notes';
import { ActorRefFrom } from 'xstate';
import { generationAlgorithmMachine } from '../../statechart/recursiveBacktracker.machine';
import { audioOptions } from './audioOptions';
import { Toggle } from './Audio.css';

interface Props {
  algorithmActor: ActorRefFrom<typeof generationAlgorithmMachine>;
  generationSessionId: number;
}

export const Audio = ({ algorithmActor, generationSessionId }: Props) => {
  const [isArpeggio, toggleArpeggio] = useState(false);

  const selectedAudio = audioOptions[0];
  const prevColumnIndexRef = useRef<number>(0);
  const prevRowIndexRef = useRef<number>(0);
  const prevFrequencyIndexRef = useRef<number>(
    // diatonicScales.c.major.indexOf(selectedAudio.startFrequency)
    (isArpeggio ? arpegios : diatonicScales).c.major.indexOf(
      selectedAudio.startFrequency
    )
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
  // const note = diatonicScales.c.major[frequencyIndex];
  const note = (isArpeggio ? arpegios : diatonicScales).c.major[frequencyIndex];
  const frequency = frequencies[note];
  const playbackRate = frequency / frequencies[selectedAudio.startFrequency];

  useEffect(() => {
    // prevFrequencyIndexRef.current = diatonicScales.c.major.indexOf(
    prevFrequencyIndexRef.current = (
      isArpeggio ? arpegios : diatonicScales
    ).c.major.indexOf(selectedAudio.startFrequency);
  }, [generationSessionId, selectedAudio.startFrequency, isArpeggio]);

  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  const [play] = useSound(selectedAudio.path, {
    playbackRate,
    volume: isMuted ? 0 : volume,
  });

  play();

  prevColumnIndexRef.current = columnIndex;
  prevRowIndexRef.current = rowIndex;
  prevFrequencyIndexRef.current = frequencyIndex;

  const inputHandlers = {
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      setVolume(event.target.valueAsNumber);
    },
  };

  return (
    <form onSubmit={(event) => event.preventDefault()}>
      <label htmlFor="mute">Mute/Unmute</label>
      <button
        id="mute"
        onClick={() => {
          setIsMuted((prev) => !prev);
        }}
      >
        {isMuted ? 'Unmute' : 'Mute'}
      </button>
      <Toggle
        on={isArpeggio}
        onClick={() => toggleArpeggio((value) => !value)}
      />
      <label htmlFor="volume">Volumne</label>
      <input
        disabled={isMuted}
        type="range"
        name="volumne"
        value={volume}
        min="0"
        max="1"
        step={0.1}
        {...inputHandlers}
      />
    </form>
  );
};
