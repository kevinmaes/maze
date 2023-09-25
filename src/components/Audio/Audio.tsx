import { useEffect, useRef, useState } from 'react';
import useSound from 'use-sound';
import { getNote, getNoteFrequency, getStartingNoteFrequency } from './notes';
import { ActorRefFrom } from 'xstate';
import { generationAlgorithmMachine } from '../../statechart/recursiveBacktracker.machine';
import { audioOptions } from './audioOptions';
import SoundOn from '../../assets/svg/audio-controls/sound-on.svg';
import SoundOff from '../../assets/svg/audio-controls/sound-off.svg';

import {
  AudioForm,
  Toggle,
  ToggleContainer,
  VolumneContainer,
} from './Audio.css';
import { ControlButton } from '../Controls/Controls.css';
import { HiddenLabel } from '../shared/form.css';

export interface AudioControlButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  id: 'audio.mute';
}
export function AudioControlButton(props: AudioControlButtonProps) {
  const { children, ...rest } = props;
  return <ControlButton {...rest}>{children}</ControlButton>;
}

const iconFillColor = '#2563EB';
const iconFillDisabledColor = '#666';

const getIconFillColor = (enabled = false) => {
  return enabled ? iconFillColor : iconFillDisabledColor;
};

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
  const [isMuted, setIsMuted] = useState(true);

  const [play] = useSound(selectedAudio.path, {
    playbackRate,
    volume: isMuted ? 0 : volume,
  });

  play();

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
        <HiddenLabel htmlFor="audio.mute">Mute/Unmute</HiddenLabel>
        <AudioControlButton
          id="audio.mute"
          onClick={() => {
            setIsMuted((prev) => !prev);
          }}
          title="Toggle sound on/off"
        >
          {isMuted ? (
            <SoundOff fill={getIconFillColor(!isMuted)} />
          ) : (
            <SoundOn fill={getIconFillColor(!isMuted)} />
          )}
        </AudioControlButton>
      </VolumneContainer>
      <ToggleContainer>
        <Toggle
          id="arpeggio"
          $on={isArpeggio}
          onKeyDown={(event) => {
            // Blocks the Enter and Space keys from triggering the toggle
            event.preventDefault();
          }}
          onClick={() => toggleArpeggio((value) => !value)}
        />
        <label htmlFor="arpeggio">{isArpeggio ? 'Arpeggio' : 'Scale'}</label>
      </ToggleContainer>
      {/* <HiddenLabel htmlFor="volume">Volumne</HiddenLabel> */}
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
