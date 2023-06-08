import { createMachine, ContextFrom } from 'xstate';
import {
  GenerationParams,
  AppMachineContext,
  AppMachineEvent,
} from './appMachineTypes';
import { generationAlgorithmMachine } from './recursiveBacktracker.machine';

const FPS_DEFAULT = 30;
const BORDER_WEIGHT_DEFAULT = 2;
const GRID_SIZE_DEFAULT = 15;

const CellSize = {
  DEFAULT: 20,
  MIN: 10,
  MAX: 25,
};

export const defaultGenerationParams: GenerationParams = {
  borderWeight: BORDER_WEIGHT_DEFAULT,
  cellSize: CellSize.DEFAULT,
  fps: FPS_DEFAULT,
  gridColumns: GRID_SIZE_DEFAULT,
  gridRows: GRID_SIZE_DEFAULT,
};

const initialAppMachineContext: AppMachineContext = {
  mazeId: '',
  generationParams: defaultGenerationParams,
  gridRef: undefined,
  generationSessionId: new Date().getTime(),
};

export const appMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMAOqDEBlMAXABDAHZgBOyuAlgPZH6rLkC2A2gAwC6ioq1slVWtxAAPRAFoArNIB0ARjaS5cgJySA7ABYAbAA45ugDQgAnhM27NMyboBMu3dpUrbm2yq0BfT8bSoZAJIQADZgGAFEAFZgAMYEpGAAZrDsXEggvPyCRMJiCOIAzJoFMupsBprlBba2kjWaxmb5RbYytgW6kioFKnLa6iq6Bd6+6DLEZBSURFAYAKqoEBRgqcKZAjQ56Xni7SWSPboqmupdznKako3mltZ2Dk4ubh6aIyB+42Ak5FQzGAAitBWnDWfA2Qm2iGUkm0MgK6jkSl0WiURWu+VsbBKxVcvV6ihU-V0bw+Ex+0ygMmmG2QwUoAC8KRgAArBZAmVbpdbZXJQtjqGRE9qaVTaAoHBqmcwKGQ6SxsdzaSRsCwqEljMlTGYyVnspnM5AAV1gwLSPDBPMhCDY6LY6v8mt+lN1JiZWFw1FQnPNWU2vOttvtn2+WspDGNkBZbI5IK5Fr9Vu0bBUcPUem6Jzk4sJ6KkBX26iKBT0Yt0WNePneGq+kydMnDJog2A9XtjPvBW1AeWRJSx2k0xQRRQc6lzNVhHW07Vc2kRtiVw0rpJr5O1Dcj7rAqHwiWopAA7owIN6MvGIV2+fzBVOhhdHJmjFL8ko5KVC0qpy0VZIgxAgc3GAIagADcyBPbkEwvBAexkPsB3hLMLAcXNlAFDQVHKLQygHHRF0rIhqAgOBhD8UFfXPUQJCTEoFBfNQtD0Axc3ULRrEVRxanhWxVCDIJQjIjt-XECxJFKVRLkLNgpIKFVcwKVQ2ksTp+VUbCfyXasQydATLSg8QFCsJQEWTewkQlXM9AFRQ5HaI4FH7Xog0dCkqSIGk6UZGYdMgyjn1hIyFBcToDHMp9hJlOVKhhZRuPkpyV1DHVowpbyKJ2GFrDkYygrMtEn0JeKtJc9cIFSztfO6AV2jFZwb3k9pcxFNhZT0KLZxsrMsV-IEyv9aEUzYbR2ui2oMNsXNjkFWp7DYBxkXauRvG8IA */
  createMachine({
    schema: {
      context: {} as AppMachineContext,
      events: {} as AppMachineEvent,
    },
    tsTypes: {} as import('./app.machine.typegen').Typegen0,
    context: initialAppMachineContext,
    id: 'app',
    initial: 'Idle',
    states: {
      Idle: {
        on: {
          'Inject refs': {
            actions: ['storeGridRef'],
            target: 'generating',
          },
        },
      },
      generating: {
        initial: 'Initializing',
        invoke: {
          id: 'generationAlgorithmMachine',
          src: 'childMachine',
          data: (ctx) => {
            const defaultChildMachineContext = {
              canPlay: true,
              currentCell: undefined,
              eligibleNeighbors: [],
              stack: [],
              startIndex: 0,
            };

            const childContext: ContextFrom<typeof generationAlgorithmMachine> =
              {
                ...defaultChildMachineContext,
                fps: ctx.generationParams.fps,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                grid: (ctx.gridRef as any).current,
                pathId: ctx.generationSessionId.toString(),
              };

            return childContext;
          },
        },
        on: {
          // Empty action but necessary.
          Update: {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            actions: [() => {}],
          },
          Done: {
            target: 'done',
          },
        },
        states: {
          Initializing: {
            on: {
              Play: {
                target: 'Playing',
              },
            },
          },
          Playing: {
            onEntry: 'startGenerationAlgorithmMachine',
            on: {
              Pause: {
                actions: ['pauseGenerationAlgorithmMachine'],
                target: 'Paused',
              },
              Stop: {
                actions: ['refreshGenerationSessionId'],
                target: '#app.Idle',
              },
            },
          },
          Paused: {
            on: {
              Play: {
                actions: ['playGenerationAlgorithmMachine'],
                target: 'Playing',
              },
              Stop: {
                actions: ['refreshGenerationSessionId'],
                target: '#app.Idle',
              },
              'Step forward': {
                actions: ['stepGenerationAlgorithmMachine'],
              },
            },
          },
        },
      },
      done: {
        on: {
          'Start over': {
            actions: ['refreshGenerationSessionId'],
            target: 'Idle',
          },
        },
      },
    },
    on: {
      'Set generation param': {
        actions: ['updateGenerationParams'],
        target: 'Idle',
      },
    },
  });

// const service = interpret(appMachine).subscribe((state) => {
//   console.log('appMachine:', state.value);
// });

// service.start();
