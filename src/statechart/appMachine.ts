import { createMachine, assign, send } from 'xstate';
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
  /** @xstate-layout N4IgpgJg5mDOIC5QEMAOqB0BLCAbMAxAAoAyAggJqKioD2sWALlrQHbUgAeiAtAKwAmAAwYAnAA5RAdiEBmcbIAs4gGyyVAGhABPRH0WixKlePGKBUyZL4BfG1rSYYrMACdkzVlGysmWZLhYAF5YXgScsIweYBjIAGaMbhgAkgByyQAqAPppGQCiAEoAamQkHHQMzGwc3Ag8sg0YQorKBkISfLL6fFq6CALiUhgDwgrSJgCMAgIqdg7oGM5uHqHeqLjI2qvEZACqAMp55fR+1UhcvBMTGCqKUgKKQnKycnwTsgK9iAPiGBNSd0GKiEnUEsjmIEcizALncnjWGy2YX2GQA8kRjpUWOxzrVZBM+DdzC0QXxRHchACvggWooMFIJuTbh8hOJ3rN7JCFks4asMOtNtsUWQCtlUUVCpjTjjQLUeBYhl1RFcPi1ROrRNTprIbtJJEIVAJRJ0pLZOVCeSsvPzEdspVUZRcEPjCbcHo8+GSKVSdIgCSJ5DNRO18QyDBCLTDlvD+cgAK6wSDEchUc4VaU1RAiSn+oGyKQvUzSKRah4YMkg8kCPjiSlSNQR7lR3nW1DxxMQAgovJELIAMVRBQA6iKACL27GZhATITXAmmPgqfSWcR8etaxriCzkhm3UQvcHmpuwq1rdtJidnWWIF1E92kneUxRa6Tlt51w2f8wc+ZOZunggIDYGJQgAN1oABrGJLQdMhcCgWhXCYAALABbABZZAAGNkNCMBL0dPECTvElPUfH0+lUekJAMU0zBJQ9fwwICXC7DIRTFCUCgIqd+GEMRJBkeQlFUdRqR4K4VAwRR-iEbUjUXNdG1QAg0gAKTyABhbICjyPt9h43FeE6EQJGkOQFGUNRNF9BAVHrYYawkdpBE-UQ7E5VhaAgOAOChHB8EM68aTLAxjAEJQjRMURPlsxdrhkcwawmYx7PuZToRPGNQj8AJglWIKnR4ZRCTMoTLNEmy+gsARpP0aYVQZOQBAymC+QFJEoEKuUriGRQ1AGJ57naetZBfQknimFL9xrPgnkUVr-xjNsE0gbq-UUCb8UUfE1DuD5yWpF5apkgQJg9KZhDmhajz-LKCrTE4HV4ubDDKiyROs6kHM6f4zvVGZ7mVDKWPwx6sSvJ1bikp5lSkGRFwNMlqRnOkmTZYEjVDBRlPWupPTRwSPqssTbPlWcMHkQ1tRnBr9A8mwgA */
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
          src: 'childMachine',
          data: (ctx) => ({
            canPlay: true,
            currentCell: undefined,
            eligibleNeighbors: [],
            fps: ctx.generationParams.fps,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            grid: (ctx.gridRef as any).current,
            pathId: 'abc',
            stack: [],
            startIndex: 0,
          }),
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
            onEntry: 'startGenerationAlgorithmMachine',
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
        target: 'idle',
      },
    },
  }).withConfig({
    actions: {
      storeGridRef: assign({
        gridRef: (_, { gridRef }) => gridRef,
      }),
      refreshGenerationSessionId: assign({
        generationSessionId: () => new Date().getTime(),
      }),
      updateGenerationParams: assign({
        generationParams: ({ generationParams }, event) => {
          const { name, value } = event;
          return {
            ...generationParams,
            [name]: value,
          };
        },
      }),
      startGenerationAlgorithmMachine: send('START', {
        to: 'generationAlgorithmMachine',
      }),
      playGenerationAlgorithmMachine: send('PLAY', {
        to: 'generationAlgorithmMachine',
      }),
      pauseGenerationAlgorithmMachine: send('PAUSE', {
        to: 'generationAlgorithmMachine',
      }),
      stepGenerationAlgorithmMachine: send('STEP_FORWARD', {
        to: 'generationAlgorithmMachine',
      }),
    },
    services: {
      childMachine: () => {
        // Can switch between algorithm machines by checking context here.
        return generationAlgorithmMachine;
      },
    },
    delays: {
      INITIALIZATION_DELAY: () => {
        return 3000;
      },
    },
  });

// const service = interpret(appMachine).onTransition((state) => {
//   console.log('appMachine:', state.value);
// });

// service.start();
