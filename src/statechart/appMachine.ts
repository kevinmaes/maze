import { createMachine, assign, send, interpret } from 'xstate';
import {
  GenerationParams,
  AppMachineContext,
  AppMachineEvent,
  Typestate,
  AppMachineEventId,
  SetGenerationParamEvent,
  AppMachineState,
} from './appMachineTypes';
import { generationAlgorithmMachine } from './recursiveBacktrackerMachine';
import {
  InjectRefsEvent,
  MazeGenerationEventId,
} from './recursiveBacktrackerTypes';

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
  createMachine<AppMachineContext, AppMachineEvent, Typestate>({
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
          [AppMachineEventId.INJECT_REFS]: {
            actions: ['storeGridRef'],
            target: AppMachineState.GENERATING,
          },
        },
      },
      [AppMachineState.GENERATING]: {
        initial: AppMachineState.INITIALIZING,
        invoke: {
          id: 'generationAlgorithmMachine',
          src: 'childMachine',
          data: (ctx) => {
            return {
              canPlay: true,
              currentCell: undefined,
              eligibleNeighbors: [],
              fps: ctx.generationParams.fps,
              grid: (ctx.gridRef as any).current,
              pathId: 'abc',
              stack: [],
              startIndex: 0,
            };
          },
        },
        on: {
          [MazeGenerationEventId.UPDATE]: {
            actions: ['receiveChildUpdate'],
          },
          [MazeGenerationEventId.DONE]: {
            target: 'done',
          },
        },
        states: {
          [AppMachineState.INITIALIZING]: {
            on: {
              PLAY: {
                target: AppMachineState.PLAYING,
              },
            },
          },
          [AppMachineState.PLAYING]: {
            onEntry: 'startGenerationAlgorithmMachine',
            on: {
              PAUSE: {
                actions: ['pauseGenerationAlgorithmMachine'],
                target: AppMachineState.PAUSED,
              },
              STOP: {
                actions: ['refreshGenerationSessionId'],
                target: '#app.idle',
              },
            },
          },
          [AppMachineState.PAUSED]: {
            entry: [
              (ctx: AppMachineContext) => {
                // console.log('ctx', ctx);
              },
            ],
            on: {
              PLAY: {
                actions: ['playGenerationAlgorithmMachine'],
                target: AppMachineState.PLAYING,
              },
              STEP_FORWARD: {
                actions: ['stepGenerationAlgorithmMachine'],
              },
            },
          },
        },
      },
      done: {
        entry: () => console.log('appMachine done'),
        on: {
          START_OVER: {
            actions: ['refreshGenerationSessionId'],
            target: AppMachineState.IDLE,
          },
        },
      },
    },
    on: {
      [AppMachineEventId.SET_GENERATION_PARAM]: {
        actions: ['updateGenerationParams'],
        target: AppMachineState.IDLE,
      },
    },
  }).withConfig({
    actions: {
      storeGridRef: assign<AppMachineContext, any>(
        (_, event: InjectRefsEvent) => {
          return {
            gridRef: event.gridRef,
          };
        }
      ),
      refreshGenerationSessionId: assign<AppMachineContext, AppMachineEvent>({
        generationSessionId: () => new Date().getTime(),
      }),
      updateGenerationParams: assign<AppMachineContext, AppMachineEvent>({
        generationParams: ({ generationParams }, event) => {
          const { name, value } = event as SetGenerationParamEvent;
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
      receiveChildUpdate: () => {},
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

const service = interpret(appMachine).onTransition((state) => {
  console.log('appMachine:', state.value);
});

service.start();
