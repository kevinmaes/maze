import { createMachine, ContextFrom } from 'xstate';
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
  /** @xstate-layout N4IgpgJg5mDOIC5QEMAOqDEBlAogFQH0BxHAORwCUBBPASQHlSCAFK6gWQG0AGAXUVCoA9rACWAF1FCAdgJAAPRABYATABoQAT0QAOAOwBOAHQA2AMwXzZgIxm9JvQF9HGtKiOiIAGzAZapACkcAGFCChwAMSwefiQQYTFJGTlFBABWdS1dayMlHTSTA24dQu407gMzZ1d0IxhpMAAnZElpKAwAVWYAERocGLkEiSlZONSMvVyTEzTZ7m5DErSNbQQVFTMjfSVF6wMZhb006pA3OrAG5tb27sZ+vkGRYeSxxGsy7iMzHTMVWwMimZuEozCtEEcdEYisCDGkdJU0kpESczvUmi1RG0PNJhsgvKIAF6Y9rMAAyVAAmgM4kMkqNQKlviZTECDD89Nw-n9QVkECDmdZBSolDNrEolNYTNYnC5TrU0VdiUZUF5kJpiRhWB1cNTBE86SlEEyWRV2ZzrNywXySkY0vZKkp5mZKmyZTV3AqMViVWqNVg8PRmLr4vqRoaEO9yl8ftyAdwgSCrXlmXbCmZHfGXfoUfKLujrsrkABXWCQTXkqkPGmhl4Mo028ymuzmy28uEqL6zMVLHT5MzHWWovOK73F0sQbABoNVvWJMOvCMfaO-f6A4E81ZpAwd-JpbszXtpfs5j3Dr1QQslsv+nDMAgRegUADqbG6wdp87ri70VvMkw2sJsiYKgAg4J5GBAMi+P6bCEPQABqlDvjW9IKG8wrMiYEqVL2Up6PCVp6GYzLCqosxATYnLOLK0hCBAcByG4jxzrWaEIAAtCYVqceBng+MxzyoakYoGJM+F6HoIFYWKHJcbyUqQuUZS-CB1hbiobpyqelzngJBoLluVpAjkMxSWyZS2MUA7uucOkFpiuL4kSbR6Z+bGSpMOgWtMth-Ec0zLLy-KmE6RQAdu8ZVIOuZ2UqPrqi51YsUJiAOJ8MbOkcIIFGpSZEUYwobOm3CRvkwrgZ6BaoGOkCuaxwn6FCOgSv28JlCYFRKIR3xGCV+G+c1vZlOBkENHVKURmpzLcCY8I-N5WGwoRW7Rvs5ggUiFRRc4QA */
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
          // @ts-expect-error This is not yet typed in XState beta.
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
            entry: 'startGenerationAlgorithmMachine',
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
