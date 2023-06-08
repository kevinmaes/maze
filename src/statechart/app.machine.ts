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
  /** @xstate-layout N4IgpgJg5mDOIC5QEMAOqDEMB2YBOyALgJYD22AdKsgQLYWxiEDaADALqKiqmzEnkuIAB6JWAGhABPMQF9ZktKgoBJCABswGFdgBWYAMaEABHjAAzWG05IQPPgOxDRCALQA2VgFYKATncAzKwA7KyeAIysrABMAZIybgEAHEkUwb7B4VkBwdFJXgHyiugUAOJguAQk2FAYAKqoEERg1kL2-GROti4S0nIKIEplFfhExDUYACLkLRxtvB2C3WLx-cXK5ZVjNarYHcjqxABe47UG5IR4pOqwVOrIUq227Y7OK30IrEWDJZuj1VAKAAFe5SU4Yc7YS7XW7UACujCe3AWr2Wn1Wn2+Qz+VVOwNB4Mh0JuDEIpFQSLsKM6b3RHy+A2xI1xOyByARkAhFyuJNQoMpLxpaN6CQZ62GWwBwPZjAgXKhPNusDJFLmz2pS1APQxYp+G2Z20BbI5cuVYGU5lIeAA7jQIAKNV0tYhXMF3OEKO53L5WAF3El3F5YgAWYMY1zB1gUcIBSMxf1eLzB-3BLxYkrTXAYIZmZU0Fhq5EOIXOtwB9xpApeTKhd3BvIY8KZaPhJO+qLB3xeXzReQDbCkCBwIRKebFzUiF2RaI+bud3wx6vuYNu8MrivRVOJ4NecIB1id9zp5RqTRjxZOyduDLBChz3wLgJL9fhgJ5CgBALhTx+zsBHvHhK-ynOeqKlq4SSsL4nrer6-qBiGYYfK44S+AEnpZOkT57mEy6ATihq7PshwnDUoEllerheCE0beFkXbBMmSR7hi-j4QaUogg8IHquOl4uFRNGRLuqHVkxLEfLEUbBkkOQPjOqYBpu7GSnixqyuRE4CdRt7CfRYn+hJCTBlkfgiawSSpr4oYPoBmZgJp-EuomPh6aJjGGUkGJzhQwaxj6kFNnBfayEAA */
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
          'refs.inject': {
            actions: ['storeGridRef'],
            target: 'Generating',
          },
        },
      },
      Generating: {
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
            target: 'Done',
          },
        },
        states: {
          Initializing: {
            on: {
              'controls.play': {
                target: 'Playing',
              },
            },
          },
          Playing: {
            onEntry: 'startGenerationAlgorithmMachine',
            on: {
              'controls.pause': {
                actions: ['pauseGenerationAlgorithmMachine'],
                target: 'Paused',
              },
              'controls.stop': {
                actions: ['refreshGenerationSessionId'],
                target: '#app.Idle',
              },
            },
          },
          Paused: {
            on: {
              'controls.play': {
                actions: ['playGenerationAlgorithmMachine'],
                target: 'Playing',
              },
              'controls.stop': {
                actions: ['refreshGenerationSessionId'],
                target: '#app.Idle',
              },
              'controls.step.forward': {
                actions: ['stepGenerationAlgorithmMachine'],
              },
            },
          },
        },
      },
      Done: {
        on: {
          'app.restart': {
            actions: ['refreshGenerationSessionId'],
            target: 'Idle',
          },
        },
      },
    },
    on: {
      'generation.param.set': {
        actions: ['updateGenerationParams'],
        target: 'Idle',
      },
    },
  });

// const service = interpret(appMachine).subscribe((state) => {
//   console.log('appMachine:', state.value);
// });

// service.start();
