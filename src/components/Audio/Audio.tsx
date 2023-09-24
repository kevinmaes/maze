import { useEffect, useRef, useState } from 'react';
import useSound from 'use-sound';
import { getNote, getNoteFrequency, getStartingNoteFrequency } from './notes';
import { ActorRefFrom } from 'xstate';
import { generationAlgorithmMachine } from '../../statechart/recursiveBacktracker.machine';
import { audioOptions } from './audioOptions';
import {
  AudioForm,
  Toggle,
  ToggleContainer,
  VolumneContainer,
} from './Audio.css';
import { VolumeIcon, VolumeXIcon } from 'lucide-react';

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
    getStartingNoteFrequency(selectedAudio.startingNote, isArpeggio)
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
  const note = getNote(frequencyIndex, isArpeggio);
  const frequency = getNoteFrequency(note);
  const playbackRate = frequency / getNoteFrequency(selectedAudio.startingNote);

  useEffect(() => {
    prevFrequencyIndexRef.current = getStartingNoteFrequency(
      selectedAudio.startingNote,
      isArpeggio
    );
  }, [generationSessionId, selectedAudio.startingNote, isArpeggio]);

  const [volume /* setVolume */] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  const [play] = useSound(selectedAudio.path, {
    playbackRate,
    volume: isMuted ? 0 : volume,
  });

  try {
    console.log('rate', playbackRate);
    play();
  } catch (e) {
    console.error(e);
  }

  prevColumnIndexRef.current = columnIndex;
  prevRowIndexRef.current = rowIndex;
  prevFrequencyIndexRef.current = frequencyIndex;

  // const inputHandlers = {
  //   onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
  //     setVolume(event.target.valueAsNumber);
  //   },
  // };

  return (
    <AudioForm onSubmit={(event) => event.preventDefault()}>
      <VolumneContainer>
        {/* <label htmlFor="mute">Mute/Unmute</label> */}
        <button
          id="mute"
          onClick={() => {
            setIsMuted((prev) => !prev);
          }}
        >
          {isMuted ? <VolumeXIcon /> : <VolumeIcon />}
        </button>
      </VolumneContainer>
      <ToggleContainer>
        <Toggle
          id="arpeggio"
          on={isArpeggio}
          onClick={() => toggleArpeggio((value) => !value)}
        />
        <label htmlFor="arpeggio">{isArpeggio ? 'Arpeggio' : 'Scale'}</label>
      </ToggleContainer>
      {/* <label htmlFor="volume">Volumne</label> */}
      {/* <input
          disabled={isMuted}
          type="range"
          name="volumne"
          value={volume}
          min="0"
          max="1"
          step={0.1}
          {...inputHandlers}
        /> */}
    </AudioForm>
  );
};
