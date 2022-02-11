import { createMachine } from 'xstate';
import {
  PlaybackContext,
  PlaybackEvent,
  Typestate,
} from './playbackMachineTypes';

export const machine = createMachine<PlaybackContext, PlaybackEvent, Typestate>(
  {
    context: {
      mazeId: '',
    },
    id: 'playback',
    initial: 'idle',
    states: {
      idle: {},
      playing: {},
      paused: {},
    },
  }
);
