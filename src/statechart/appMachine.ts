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
  /** @xstate-layout N4IgpgJg5mDOIC5QEMAOqB0BLCAbMAxAJIByAUgKIDCAKgPoBKFAYgMqKioD2sWALli4A7DiAAeiALQAWAAwAODAEYAnLICsSgMwA2VevlL5AGhABPKVq0AmDAHYHdpbLlPZVuwF9PptJhhCYABOyAJCUNhC-FjIuFgAXljhBAAKADIAggCaoty8AsKiEgiS1qoY8vIqVbIOWi7uJuZS0joY1rLVtXY6VVoqWtLevugYAcGhSRGouMhmU6kZAKqsFLk80YVI4ojSStIYBirW6v3Hg0o6phYlOur27rK9x6p2KtLWwyB+Y2CBIWFprN5slWDQAPIpdb5QQibbFSQ2NoOHQqBxKdQaeR6K7NBDSFTtaz1eTWaQ2IwqAzqL4-cYAqYYVDIACusEgqUyOW2eU2cNAxQ+skOWnUHy0pPU7xUuJuZWUcmsOl6di0dmx8lqtNG9Mm4SZrPZEAIYMh0L5RUQNkUYrUGL2VTsStlliqyh6qIlaP6Wp83x1fwmgINbI5YIoKTozHBDAA6hkGAARc0Ffk7BDyVoYCVnY4fTWyJTXKT7NplfN2IV7ax2Gl+umBhnJJYpRMZGhrHkbVOWhDqHQHd5inTWTVaZy9YsIfYHWvqU4j7F2TqV7X+Rt6qAERPgkidzjd2G9tXCmvLyqk7HKlRTy4HMnyWvWNTVU7yNcYCDCQhghP0cEAGoUAwKZHvCUg6PUDyyLU0jyPOeyqre0izghAzKgoKhGFoa4mhQ9AAOIUHuDDtkQu50CkCYZAAsqBWwChBzgVPBxxvJKzhaFOMgfBU1gdAYTr9COtbeH6QhcBAcCiD8OD4PRaYIqc9yqHsshkuoNZGNY3HjoSo5wZiThoi4YofrqwZJNEsQJFMCm9oi8haBgchSqSxLjpB6jcZp7TOMSD6Ys6771gG-ybkywJ2V2MIMemkiYkSC4DPxjw1t5eKSA4GCegoZL2p087mRuwbMqGED2eBGYwRg7x3AOegykoRg+bYZTqTYhnqcqdzFeFgKVYxJSuC5GjVPxViXKK3HPs5+xGE8lxSmUKgfl+gSDfFGK2EoZJYb0uinJ0N54hiigPlYMFopm0heKFqCbQidyzjBsHwWKShIZlmnIscaJovx-GrmJQA */
  createMachine({
    schema: {
      context: {} as AppMachineContext,
      events: {} as AppMachineEvent,
    },
    tsTypes: {} as import('./appMachine.typegen').Typegen0,
    context: initialAppMachineContext,
    id: 'app',
    initial: 'idle',
    states: {
      idle: {
        on: {
          'Inject refs': {
            actions: ['storeGridRef'],
            target: 'generating',
          },
        },
      },
      generating: {
        initial: 'initializing',
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
              Play: {
                target: 'playing',
              },
            },
          },
          playing: {
            onEntry: 'startGenerationAlgorithmMachine',
            on: {
              Pause: {
                actions: ['pauseGenerationAlgorithmMachine'],
                target: 'paused',
              },
              Stop: {
                actions: ['refreshGenerationSessionId'],
                target: '#app.idle',
              },
            },
          },
          paused: {
            on: {
              Play: {
                actions: ['playGenerationAlgorithmMachine'],
                target: 'playing',
              },
              Stop: {
                actions: ['refreshGenerationSessionId'],
                target: '#app.idle',
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
            target: 'idle',
          },
        },
      },
    },
    on: {
      'Set generation param': {
        actions: ['updateGenerationParams'],
        target: 'idle',
      },
    },
  });

// const service = interpret(appMachine).subscribe((state) => {
//   console.log('appMachine:', state.value);
// });

// service.start();
