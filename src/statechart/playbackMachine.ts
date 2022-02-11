import { createMachine } from 'xstate';
import {
  PlaybackContext,
  PlaybackEvent,
  Typestate,
} from './playbackMachineTypes';

export const machine =
  /** @xstate-layout N4IgpgJg5mDOIC5QAcA2BDAngI3QYwGsA6ASwlTAGIBlAFQEEAlWgfQAUAZegTURQHtYJAC4l+AOz4gAHogC0AFgAMANiIqAnAoCsAZgDsARn0bjhhQBoQmeYd2Gih7Qt0AODQCZtG-bo+GAXwCrNCxcQiJQzBJxKEo2egBVagBRKWRBETFJJBl5bSIFLX1tV10-cqUfS2tbJ0LdJWMPDVMi1w6gkIwcfGIomLi6AHk2di5eXIyhUQkpWQRFXQ0ifQ6DDxUXBTLtfSsbBBUCp0NDY5V9ZVcFLa6QKPD+nsHKRhTOHnTM2ZzQBbkHgUDm0Sh2rkMGnWEMMB3kHl0BWW+k22jOVzsrn090efUi6AArrBIG8UtREgBZNJTH7Zea2DxEIEKLyuFRuG52HRwo6uRzs7QIqrKcyaILBEDifgQODpHpPUjkMDfGZ03IAwUrUGbfRbYFY7QqHlyOwrYyg1ybHQKNYuHHyvEDWIqrJzdXwnREDSqLbuQyuJSqXQ1Q4m8qOXRbQxNQz+WMee1hR2E4kQF2-ekIM581oozxKcqmDQqDzGs6M-RKZxQ8F2EvYiW4wjptX-fJ6Ijay56-0lI21RaNPmRvWNLQG8UBIA */
  createMachine<PlaybackContext, PlaybackEvent, Typestate>({
    context: { mazeId: '' },
    id: 'playback',
    initial: 'idle',
    states: {
      idle: {
        on: {
          START_PLAY: {
            target: '#playback.playing',
          },
        },
      },
      playing: {
        on: {
          PAUSE: {
            target: '#playback.paused',
          },
          STOP_PLAY: {
            target: '#playback.idle',
          },
          REPLAY: {
            target: '#playback.playing',
          },
        },
      },
      paused: {
        on: {
          RESUME: {
            target: '#playback.playing',
          },
        },
      },
    },
  });
