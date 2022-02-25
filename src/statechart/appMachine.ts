import { createMachine, assign, send } from 'xstate';
import {
  GenerationParams,
  AppMachineContext,
  AppMachineEvent,
  Typestate,
} from './appMachineTypes';
import { generationAlgorithmMachine } from './recursiveBacktrackerMachine';
import { InjectRefsEvent } from './recursiveBacktrackerTypes';

const FPS_DEFAULT = 60;
const BORDER_WEIGHT_DEFAULT = 2;
const GRID_SIZE_DEFAULT = 15;

const CellSize = {
  DEFAULT: 20,
  MIN: 10,
  MAX: 25,
};

const defaultGenerationParams: GenerationParams = {
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
  generationAlgorithmRef: undefined,
};

export const appMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMAOqB0BLCAbMAxAAoAyAggJqKioD2sWALlrQHbUgAeiAtAKwAmAAwYAnAA5RAdiEBmcbIAs4gGyyVAGhABPRH0WixKlePGKBUyZL4BfG1rSYYrMACdkzVlGysmWZLhYAF5YXgScsIweYBjIAGaMbhgAkgByyQAqAPppGQCiAEoAamQkHHQMzGwc3Ag8sg0YQorKBkISfLL6fFq6CALiUhgDwgrSJgCMAgIqdg7oGM5uHqHeqLjI2qvEZACqAMp55fR+1UhcvBMTGCqKUgKKQnKycnwTsgK9iAPiGBNSd0GKiEnUEsjmIEcizALncnjWGy2YX2GQA8kRjpUWOxzrVZBM+DdzC0QXxRHchACvggWooMFIJuTbh8hOJ3rN7JCFks4asMOtNtsUWQCtlUUVCpjTjjQLUeBYhl1RFcPi1ROrRNTprIbtJJEIVAJRJ0pLZOVCeSsvPzEdspVUZRcEPjCbcHo8+GSKVSdIgCSJ5DNRO18QyDBCLTDlvD+cgAK6wSDEchUc4VaU1RAiSn+oGyKQvUzSKRah4YMkg8kCPjiSlSNQR7lR3nW1DxxMQAgovJELIAMVRBQA6iKACL27GZhATITXAmmPgqfSWcR8etaxriCzkhm3UQvcHmpuwq1rdtJidnWWIF1E92kneUxRa6Tlt51w2f8wc+ZOZunggIDYGJQgAN1oABrGJLQdMhcCgWhXCYAALABbABZZAAGNkNCMBL0dPECTvElPUfH0+lUekJAMU0zBJQ9fwwICXC7DIRTFCUCgIqd+GEMRJBkeQlFUdRqR4K4VAwRR-iEbUjUXNdG1QAg0gAKTyABhbICjyPt9h43FeE6EQJGkOQFGUNRNF9BAVHrYYawkdpBE-UQ7E5VhaAgOAOChHB8EM68aTLAxjAEJQjRMURPlsxdrhkcwawmYx7PuZToRPGNQj8AJglWIKnR4ZRCTMoTLNEmy+gsARpP0aYVQZOQBAymC+QFJEoEKuUriGRQ1AGJ57naetZBfQknimFL9xrPgnkUVr-xjNsE0gbq-UUCb8UUfE1DuD5yWpF5apkgQJg9KZhDmhajz-LKCrTE4HV4ubDDKiyROs6kHM6f4zvVGZ7mVDKWPwx6sSvJ1bikp5lSkGRFwNMlqRnOkmTZYEjVDBRlPWupPTRwSPqssTbPlWcMHkQ1tRnBr9A8mwgA */
  createMachine<AppMachineContext, AppMachineEvent, Typestate>(
    {
      context: initialAppMachineContext,
      schema: {
        context: {} as AppMachineContext,
        events: {} as AppMachineEvent,
      },
      id: 'app',
      initial: 'idle',
      states: {
        idle: {
          on: {
            PLAY: {
              target: '#app.generating',
            },
          },
        },
        generating: {
          invoke: {
            id: 'generationAlgorithmMachine',
            // src: 'childMachine',
            src: generationAlgorithmMachine,
            autoForward: true,
            data: {
              currentCell: undefined,
              eligibleNeighbors: [],
              fps: 3,
              grid: (ctx: AppMachineContext) => ctx.gridRef,
              pathId: 'abc',
              stack: [],
              startIndex: 0,
            },
            onDone: [
              {
                target: '#app.done',
              },
            ],
          },
          onEntry: send('START', { to: 'generationAlgorithmMachine' }),
        },
        // initial: 'initializing',
        // states: {
        //   initializing: {
        //     entry: 'startChildMachine',
        //     // invoke: {
        //     //   id: 'generationAlgorithmMachine',
        //     //   // src: 'childMachine',
        //     //   src: generationAlgorithmMachine,
        //     //   onDone: [
        //     //     {
        //     //       target: '#app.done',
        //     //     },
        //     //   ],
        //     // },
        //     // entry: 'initializingEntry',
        //     // after: {
        //     //   INIT_INTERVAL: {
        //     //     target: '#app.generating.playing',
        //     //   },
        //     // },
        //   },
        //   playing: {
        //     // entry: 'startChildMachine',
        //     always: {
        //       cond: 'isFinished',
        //       target: '#app.done',
        //     },
        //     on: {
        //       PAUSE: {
        //         target: '#app.generating.paused',
        //       },
        //       STOP: {
        //         target: '#app.idle',
        //       },
        //       START_OVER: {
        //         target: '#app.generating.initializing',
        //       },
        //     },
        //   },
        //   paused: {
        //     always: {
        //       cond: 'isFinished',
        //       target: '#app.done',
        //     },
        //     on: {
        //       PLAY: {
        //         target: '#app.generating.playing',
        //       },
        //       STEP_FORWARD: {
        //         target: '#app.generating.paused',
        //       },
        //     },
        //   },
        // },
        // },
        done: {
          on: {
            START_OVER: {
              target: '#app.generating',
            },
          },
        },
      },
      on: {
        INJECT_REFS: {
          actions: ['storeGridRef'],
        },
      },
    },
    {
      guards: {
        isFinished: (context: AppMachineContext) => false,
      },
      actions: {
        storeGridRef: assign<AppMachineContext, any>(
          (_, event: InjectRefsEvent) => {
            return {
              gridRef: event.gridRef,
            };
          }
        ),
      },
      // services: {
      //   childMachine: () => {
      //     console.log('service childMachine');
      //     // Can switch between algorithm machines by checking context here.
      //     return generationAlgorithmMachine;
      //   },
      // },
      delays: {
        INIT_INTERVAL: () => {
          return 1000;
        },
      },
    }
  );
