import { createMachine, ContextFrom, log } from 'xstate';
import {
  GenerationParams,
  AppMachineContext,
  AppMachineEvent,
} from './appMachineTypes';
import { generationAlgorithmMachine } from './recursiveBacktrackerMachine';

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
  /** @xstate-layout N4IgpgJg5mDOIC5QEMAOqDEBlAogFQH0BxHAORwCUBBPASQHlSCAFK6gWQG0AGAXUVCoA9rACWAF1FCAdgJABPRAFoALNwBsAOgDs27gFYATOv0BmAIwrth8wBoQAD0Tnz3U5vUuDK0yb379AF9A+zRUTVEIABswDFpSACkcAGFCChwAMSwefiQQYTFJGTknBCVTfXNNQwAOCvNKlXMATkNre0UytubNBu5m7X1tGvVm5vN1YND0TRhpMAAnZElpKAwAVWYAERocHLkCiSlZPNLXAI8vfR8-A30O5RVrnX9jM0trcymQMNmweaWKzWW0Yez4BxER2Kp2cd0u5xuQzuDzK+m4hheBjeFisNm+vzmi2WolWEWkR2QUVEAC8SWtmAAZKgATX2eUORROoE6SiM1VchlMhhUNTRxnUNXspSUDS0JgllWaNSaam4NXxM0JgLpmlQUWQ8jpGFY61wbMEkM5ch5ug8zVMauFDTUzQCUsQphqVUM13UTXUfsMA2aGvCWuJpL1BqNWDw9GY5vyluOJQ9Xuqvv9geDKJlPrtDpqTuu-QCob+AIjUF1yAArrBIMamazwezk9Duco+TZ0UKRWKAyZ3QhXNxtPDvL4kWWQj9Nf8iUCa-XG7H44mOSmYSPuGOJ9cp-57gplKP+b3haL0QHtOXw0vUHWGxBsHgcMwCBl6BQAOpsLYbu2XKOLCe6eAih7IieZRnj2gqXgO6i3rOvwQDIsSxmwhD0AAapQgGFFuoClKY46jPa3AtOYpgqKMlEqCirgqJopitOobSUYY3CIsEs7SEIEBwHIYQQoRHYgaidS9M0TTok8bTmEWub6M03AZux5jaAKYrqihMyRDEolQsB0pmPo0mycKRhaUp0HlC01TKleWkDNx1x3gu2qrEZVrbqoFiaGoKlFoKFjqBUuY+u4AY1P0Y6VBMAYeZWS4khSVK0t5bZiSZyieu4QVKoYoUTBFdndgKfZXuKunTGGnlVrq+qGllFo5amqJqcVZijEKXEOm0x42mRFFFk0JaukEen1SlOqPiuEA+UREmxWpMnyrRLTgZK5UYnBVWISY5ZofMS3idKDQYuYwrjBKU4OmMjH6DU1QiqYDr9MMKhWLxgRAA */
  createMachine({
    types: {
      typegen: {} as import('./appMachine.typegen').Typegen0,
      context: {} as AppMachineContext,
      events: {} as AppMachineEvent,
      actors: {} as {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        childMachine: any;
      },
    },
    context: initialAppMachineContext,
    id: 'app',
    initial: 'idle',
    states: {
      idle: {
        on: {
          INJECT_REFS: {
            actions: ['storeGridRef'],
            target: 'generating',
          },
        },
      },
      generating: {
        initial: 'initializing',
        invoke: {
          id: 'generationAlgorithmMachine',
          // src: 'childMachine',
          src: generationAlgorithmMachine,
          // @ts-expect-error This is not yet types in xstate beta.
          input: ({ context }) => {
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
                fps: context.generationParams.fps,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                grid: (context.gridRef as any).current,
                pathId: context.generationSessionId.toString(),
              };

            return childContext;
          },
        },
        on: {
          // Empty action but necessary.
          UPDATE: {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            actions: [() => {}],
          },
          DONE: {
            target: 'done',
          },
        },
        states: {
          initializing: {
            on: {
              PLAY: {
                target: 'playing',
              },
            },
          },
          playing: {
            entry: [log('playing state'), 'startGenerationAlgorithmMachine'],
            on: {
              PAUSE: {
                actions: ['pauseGenerationAlgorithmMachine'],
                target: 'paused',
              },
              STOP: {
                actions: ['refreshGenerationSessionId'],
                target: '#app.idle',
              },
            },
          },
          paused: {
            on: {
              PLAY: {
                actions: ['playGenerationAlgorithmMachine'],
                target: 'playing',
              },
              STOP: {
                actions: ['refreshGenerationSessionId'],
                target: '#app.idle',
              },
              STEP_FORWARD: {
                actions: ['stepGenerationAlgorithmMachine'],
              },
            },
          },
        },
      },
      done: {
        on: {
          START_OVER: {
            actions: ['refreshGenerationSessionId'],
            target: 'idle',
          },
        },
      },
    },
    on: {
      SET_GENERATION_PARAM: {
        actions: ['updateGenerationParams'],
        target: '#app.idle',
      },
    },
  });

// const service = interpret(appMachine).subscribe((state) => {
//   console.log('appMachine:', state.value);
// });

// service.start();
