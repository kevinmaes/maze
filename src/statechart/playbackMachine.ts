import { createMachine } from 'xstate';
import {
  PlaybackContext,
  PlaybackEvent,
  Typestate,
} from './playbackMachineTypes';

export const machine =
  /** @xstate-layout N4IgpgJg5mDOIC5QAcA2BDAngI3QYwGsA6ASwlTAGIAFAGQEEBNRFAe1hIBcTWA7FkAA9EAWgBMARgAMRKQBYAnAGYFAVmkAOJRLFyANCEyixCgGxFtAdg0LLqqVKUrTqgL6uDaLLkKleXEnRUEgAvdG4+SgFkdgC+AWEEMQ1VIg05MVUxR1MlFMsxUwMjBBFtVLlVOSVLSxqpCUs5R3dPDBx8Yi9MEl4oSgBlABV6ACUhgH0AeQA1AFFR6NiI-iQhRCUxSyIFR1UFDWT7eyVVYuMpBTSJVX2pGykqx9NWkG6fLvbe-up6AFUBnMlhwVglEJYGkQmvJsgUpKYMmdDKI6rIlPdLKZdEosdVXu9OkRut9BkMptRgXFVqBEiIdDIHKoago5BoNBDqudSnIJBoiKoCiZLqdkqYXh43u0PkSvn0omsYiCeNT1ggbEo0mKTBlHlklFy5HIiJlqg4JAd5Lk5PipYTkOgAK6wSA0BjMBXLZVghC5czNXLaRpMlRIkriGo7NlSOzqLISapiG3eO2O50QUlzagTABycwAGkNKaC1olDTIxEpEbybg0WVyK-zTAV0uoavYJE2kx1fPanS7hpmJgAhegAYQA0kWvSWNtUiIbLI1FOkMpzkaVUVVpHVTGzKi0JQSe6mXVP4jOfTZ+Zj4U54xzLPXbmkmuiWZkRbou9KIHwqMMxkmWYFjPFVaUUectkNFINAcDRdyKdc5ExY0XFMZRGl2BEnHcCVeFYCA4GiW1fDIChQO9MomyILFDlMaNVCbBMuXEZQLEOCReTvSpJG-QlegCIJQnCac2CVc8aVERiLAyZR2XZbIWUeFiTFSNkbC0XRbFra1DxIz4sG+CiLzqPlYJcPctno6wWNOGQ6kuXlcmUOxdLaZNjz7CBjMkhAqm2MVlEeXkMMcFiChox4FDEGKBQY+4+N8X9eDAHzVWkSRjQXMxd3NWwJANawiAkFRsn2SsxUaJREoINLaRUCQaOSQoGKYzYWMURqt0UMxVFgiEzFw1wgA */
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
          STEP_NEXT: {
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
