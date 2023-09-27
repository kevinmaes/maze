import { useEffect, useRef, useState } from 'react';
import useSound from 'use-sound';
import { getNextNoteData, getStartingNoteIndex } from './notes';
import { ActorRefFrom } from 'xstate';
import { generationAlgorithmMachine } from '../../statechart/recursiveBacktracker.machine';
import { audioConfigOptions } from './audioOptions';
import SoundOn from '../../assets/svg/audio-controls/sound-on.svg';
import SoundOff from '../../assets/svg/audio-controls/sound-off.svg';

import {
  AudioForm,
  Select,
  StyledAudioControlButton,
  Volume,
  VolumneContainer,
} from './Audio.css';
import { HiddenLabel } from '../shared/form.css';
import { AudioConfig } from './audioOptions';

export interface AudioControlButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  id: 'audio.mute';
}
export function AudioControlButton(props: AudioControlButtonProps) {
  const { children, ...rest } = props;
  return (
    <StyledAudioControlButton {...rest}>{children}</StyledAudioControlButton>
  );
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
  const [audioConfigIndex, selectAudioConfigIndex] = useState(0);
  const audioConfig = audioConfigOptions[audioConfigIndex];
  const startingNoteFrequencyIndex = getStartingNoteIndex(audioConfig);
  const prevColumnIndexRef = useRef<number>(0);
  const prevRowIndexRef = useRef<number>(0);

  const prevFrequencyIndexRef = useRef<number>(startingNoteFrequencyIndex);

  const columnIndex =
    algorithmActor?.getSnapshot().context.currentCell?.getColumnIndex() ?? 0;
  const rowIndex =
    algorithmActor?.getSnapshot().context.currentCell?.getRowIndex() ?? 0;

  const columnChange: number = columnIndex - prevColumnIndexRef.current;
  const rowChange: number = rowIndex - prevRowIndexRef.current;

  const visualIncrement =
    // If only moving one cell at a time, increment by one in either direction
    Math.abs(Math.max(columnChange, rowChange)) <= 1
      ? columnChange || rowChange
      : // Otherwise combine changes in both directions.
        columnChange + rowChange;

  const { nextFrequencyIndex, nextRelativePlaybackRate } = getNextNoteData(
    audioConfig,
    prevFrequencyIndexRef.current,
    visualIncrement
  );

  useEffect(() => {
    prevFrequencyIndexRef.current = startingNoteFrequencyIndex;
  }, [generationSessionId, startingNoteFrequencyIndex]);

  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(true);

  const [play] = useSound(audioConfig.path, {
    playbackRate: nextRelativePlaybackRate,
    volume: isMuted ? 0 : volume,
  });

  play();

  prevColumnIndexRef.current = columnIndex;
  prevRowIndexRef.current = rowIndex;
  prevFrequencyIndexRef.current = nextFrequencyIndex;

  const inputHandlers = {
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      setVolume(event.target.valueAsNumber);
    },
  };

  return (
    <AudioForm
      onKeyDown={(event) => {
        // Blocks the Enter and Space keys from affecting this form's buttons and inputs
        event.preventDefault();
      }}
      onSubmit={(event) => event.preventDefault()}
    >
      <Select
        onChange={(event) => {
          selectAudioConfigIndex(Number(event.target.value));
        }}
      >
        {audioConfigOptions.map((option: AudioConfig, index: number) => {
          return (
            <option key={option.name} value={index}>
              {option.name}
            </option>
          );
        })}
      </Select>
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
        <HiddenLabel htmlFor="volume">Volumne</HiddenLabel>
        <Volume
          disabled={isMuted}
          type="range"
          name="volumne"
          value={volume}
          min="0"
          max="1"
          step={0.1}
          {...inputHandlers}
        />
      </VolumneContainer>
    </AudioForm>
  );
};
