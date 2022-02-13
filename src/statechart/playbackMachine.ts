import { createMachine } from 'xstate';
import {
  PlaybackContext,
  PlaybackEvent,
  Typestate,
} from './playbackMachineTypes';

export const machine =
  /** @xstate-layout N4IgpgJg5mDOIC5QAcA2BDAngI3QYwGsA6ASwlTAGIAFAGQEEBNRFAe1hIBcTWA7FkAA9EAFhEB2IgFYpADgAMANgCc4gIxS1I5YsUAaEJkQBaAEzaisgMynZIqeLEiryteIC+7g2iy5CpXi4SdFQSAC90bj5KQVhOSLAidAAzTjAAJyIASQA5LIAVAH1c-IBRACUANXpaAWR2IL4BYQRxFSJTeXFbcRkrcStFKQMjBGN+yTVzZWdxVSklNU9vDBx8Yh9MEl4oSgBlfPpyooB5Soq6hqj+JCFENstbZR6reTUlcVkRkynTaREuhIVGp+qYrMsQJs-BtVttdtR6ABVPalS4ca7Ne6KR6yZ6yAZvD5fQyINTWIjKKQiKYAgavVymCFQ9ZETZw-b5E7UNGNG6gFoPWRPF6ExSfb5jaaWGx2BxOFxuJmraGs2E7Sg8jG3AXYoW4kXvMXE0amRR-AHOeQzXRSUyMryQ5Us5DoACusEgNAYzFu9XRPD5dwQal0FPxVnstueclsEqm8iIg2UzzmYrcmkUSt8zrdHogHNK1EKADETuUAOpHAAimoDmIQptkREBUlcXUUsnexsQHcTVhkIkUg8+tnBDuZ-hd7s9B0LhQAQvQAMIAaVrTW1iFsIgpynkQtMDnMIeUEp3vRBC0GJ-sijHK2zk9znvXgZaYkkMgUKnUmm0uglZQrETTo1BBQZ5CsWQhWULM1n8CA+CoA4jlOc5ylfes2mUDouh6PoBiGOMxCId51HbDtTE+TwHV4VgIDgOonX8MgKEwzcG2UJsGTtfouOTTRxAlMwRCbeRDwjbp7GTeR9zglVtiCEJwkiOtfSuNT+UQZNz2g3FZDkKk730ElJRcIgzTsKirH7JQhnvR1HxhLA4XYrSxjIxNZIMxQ3CFW9TGE-sm1xLjdFUC97QfeCNmfCA3KDHoiAkKRfL3USyTsONBgpNRVBEQ8Bh0O0pHkllEN4MAEpaIdgIUQY007YriKkXL7DaS0wNkzNx2Yghqp+Kw1C8-dUr88xUsC0zjHsBMrWpAq9zFakPBooA */
  createMachine<PlaybackContext, PlaybackEvent, Typestate>(
    {
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
          after: {
            INIT_INTERVAL: {
              target: '#playback.playing',
            },
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
    },
    {
      guards: {
        isFinished: (context, event) => false,
      },
      delays: {
        INIT_INTERVAL: () => {
          return 1000;
        },
      },
    }
  );
