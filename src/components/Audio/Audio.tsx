import { useSelector } from '@xstate/react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import useSound from 'use-sound';
import SoundOff from '../../assets/svg/audio-controls/sound-off.svg?react';
import SoundOn from '../../assets/svg/audio-controls/sound-on.svg?react';
import { AppMachineContext } from '../../statechart/app.machine';
import { HiddenLabel } from '../shared/form.css';
import {
  AudioForm,
  StyledAudioControlButton,
  Toggle,
  ToggleContainer,
  Volume,
  VolumneContainer,
} from './Audio.css';
import { audioOptions } from './audioOptions';
import { getNote, getNoteFrequency, getStartingNoteFrequency } from './notes';

interface AudioControlButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  id: 'audio.mute';
}
function AudioControlButton(props: AudioControlButtonProps) {
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

export function Audio() {
  const actorRef = AppMachineContext.useActorRef();
  const { algorithmActor, generationSessionId } = useSelector(
    actorRef,
    (state) => ({
      algorithmActor: state.children?.generationAlgorithm,
      generationSessionId: state.context.generationSessionId,
    })
  );

  const [isArpeggio, toggleArpeggio] = useState(false);

  const selectedAudio = audioOptions[0];
  const prevColumnIndexRef = useRef<number>(0);
  const prevRowIndexRef = useRef<number>(0);
  const startingNoteFrequency = getStartingNoteFrequency(
    selectedAudio.startingNote,
    isArpeggio
  );
  const prevFrequencyIndexRef = useRef<number>(startingNoteFrequency);

  // biome-ignore lint/correctness/useExhaustiveDependencies: generationSessionId resets the note on each new maze, see #1663
  useEffect(() => {
    prevFrequencyIndexRef.current = startingNoteFrequency;
  }, [generationSessionId, startingNoteFrequency]);

  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [play] = useSound(selectedAudio.path, {
    playbackRate,
    volume: isMuted ? 0 : volume,
  });

  play();

  const inputHandlers = {
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      setVolume(event.target.valueAsNumber);
    },
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: extra deps go away with the actor subscription rework, see #1663
  useEffect(() => {
    algorithmActor?.subscribe((state) => {
      // Only reinitialize audio values if restarting the maze generation
      if (state.matches('Initializing')) {
        prevColumnIndexRef.current = 0;
        prevRowIndexRef.current = 0;
        prevFrequencyIndexRef.current = startingNoteFrequency;
        return;
      }

      const columnIndex = state.context.currentCell?.getColumnIndex() ?? 0;
      const rowIndex = state.context.currentCell?.getRowIndex() ?? 0;
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
      const playbackRate =
        frequency / getNoteFrequency(selectedAudio.startingNote);

      setPlaybackRate(playbackRate);

      prevColumnIndexRef.current = columnIndex;
      prevRowIndexRef.current = rowIndex;
      prevFrequencyIndexRef.current = frequencyIndex;
    });
  }, [
    algorithmActor,
    isArpeggio,
    play,
    startingNoteFrequency,
    setPlaybackRate,
    selectedAudio.startingNote,
  ]);

  return (
    <AudioForm
      onKeyDown={(event) => {
        // Blocks the Enter and Space keys from affecting this form's buttons and inputs
        event.preventDefault();
      }}
      onSubmit={(event) => event.preventDefault()}
    >
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
          data-testid="audio-volume"
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
      <ToggleContainer>
        <Toggle
          id="arpeggio"
          $on={isArpeggio}
          onClick={() => toggleArpeggio((value) => !value)}
        />
        <label htmlFor="arpeggio">{isArpeggio ? 'Arpeggio' : 'Scale'}</label>
      </ToggleContainer>
    </AudioForm>
  );
}
