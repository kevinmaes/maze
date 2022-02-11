import { createMachine } from 'xstate';
import {
  PlaybackContext,
  PlaybackEvent,
  Typestate,
} from './playbackMachineTypes';

export const machine =
  /** @xstate-layout N4IgpgJg5mDOIC5QAcA2BDAngI3QYwGsA6ASwlTAGIAFAGQEEBNRFAe1hIBcTWA7FkAA9EAFgAcARiIBmaWIAMEsQHYArADZ1EkcvUAaEJkQBaJVOUAmeetXKJ0kQE5181dIC+7g2iy5CpXi4SdFQSAC90bj5KAWR2IL4BYQQxEVUiVUdlR2lNeQc7aQMjBGNpeUciRQs1VXk05WUxHM9vDBx8Yh9MEl4oSgBlABV6ACUhgH0AeQA1AFFR2Pio-iQhRAkJeSIXMRVbZpF1MQtik1URIhELMTctG21HSVaQbr8u9t7+6noAVQG5ksOCskhstjt5Hs1E1HEcTmcEBZVBYqpo5BZYToLDoXm9OkRul9BkMptQgQlVqBkpttrt9jC4adDCYzERLNYnCJxOoMcoPF5Xu13gTPn0Yms4sCeJT1ggaRCoQdYccmSVZNtVBIbGJZHYRNI7LihfjkOgAK6wSA0BjMCXLaWgxHyba6PkSPn5DEHBFKMRXE4SRwWbEe1L8tq+E3my0QYlzagTABiU1GAHUxgARckgtbJcpSW5pCSahQ1Jo+3JXHSNVR1KyNORGyP+U0Wq3DeMTABC9AAwgBpbMO3OIaRKNnKeS6GnKLniBGWIhidTSWuOJSr1Q6sRNjot6NWoeJEcIcRSWQKJRqTTaXQ+rRXaQWaSOZG5exbZS74UQPhUYZjJMswLEeMrJKWRBPJY0KSG47oIhYEgoohORckomhNOIngCrwrAQHAsTGv4ZAUKBjqyCi6hBmYzhck+GgIqY2SQR+4iITc0HhoKzbEL0QQhOEkTDmwUrHlSiBZCiezlFBchjqkjHulImo8sGiErnyfLfiaopQGRJ7GHyGRWCoy62NYL76MypQYi6Kgqho+RIfY2n7m2ED6eJCBPlISK1rY9glkoqgIa4VRjo464nK4zgWOornEL+vBgJ5srqI0GQ6tqt7XEcCHaFUcWpBcwb6hcXF4oQqXJMYWTGZCTQ2JOK7OIxchSE8gbHM0NTbth7hAA */
  createMachine<PlaybackContext, PlaybackEvent, Typestate>({
    context: { mazeId: '' },
    id: 'playback',
    initial: 'idle',
    states: {
      idle: {
        on: {
          PLAY: {
            target: '#playback.initialization',
          },
        },
      },
      initialization: {
        always: {
          target: '#playback.playing',
        },
      },
      playing: {
        always: {
          cond: 'isFinished',
          target: '#playback.done',
        },
        on: {
          START_OVER: {
            target: '#playback.initialization',
          },
          PAUSE: {
            target: '#playback.paused',
          },
          STOP: {
            target: '#playback.idle',
          },
        },
      },
      paused: {
        always: {
          cond: 'isFinished',
          target: '#playback.done',
        },
        on: {
          PLAY: {
            target: '#playback.playing',
          },
          STEP_FORWARD: {
            target: '#playback.paused',
          },
          STEP_BACK: {
            target: '#playback.paused',
          },
        },
      },
      done: {
        on: {
          START_OVER: {
            target: '#playback.initialization',
          },
        },
      },
    },
  });
