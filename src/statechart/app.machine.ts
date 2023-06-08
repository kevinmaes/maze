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
  /** @xstate-layout N4IgpgJg5mDOIC5QEMAOqDEMB2YBOyALgJYD22AdKsgQLYWxiEDaADALqKiqmzEnkuIAB6IAtAE4ATBIoSAHAGZWU+QDYA7Gplr5AGhABPcQBYJrCgEZ50xRICsa1pZP2HAX3cG0qCgEkIABswDDwwADNYCmJsACswAGMWDiEePgFsIVEEMQ0TCykTeVZFJzc1ZSkDYxzFe0sKVXtFE1VLR3qNe09vdAoAcTBcAhJsKAwAVVQIIjA2TiQQNP4yTMXs+SkNRvsNViKpOtYu6vEJNQpFLXUJUvl5Syl7Ex6QHwGh-CIY8YARcjmKUWywyWUQaiKVluJmUxyk7UU+iM4ns9goSns6g0MnK+w0r3eg2G3zG-mwK2QgWIAC8fhgEuRCHhSIEoqhAshDPNUrwVoJ1uJFIVGliKo5LKwKiZTjlDhZlF1XJZSlpmgS+kSvqMoBQAAocwx0hnYJkstnIACujG5wN5oIFCEO8nREnaxSulicrExMrET1k7QUD292MUCPVvk1Ix+eoNRsZzNZDEIpFQNu4dtWYJyGkULo0SnM-oLud9LhMFCKTgeWlux02EY+xO1estjAg9ITZqoBvTS0z-NA2UKFdazzs2lclQ0vrqDSaLTaHUsXUbUZJOt1bcgnZNiaisBTaaBGfSWYduTzNgLdhUbhLil9Jgu7U9ntKK-uEheXjeGs+0akluVo7sappJoeYC+OEpB4AA7jQEB9iC55DuCz6XN+kraIcQoaJYs52I0VzSJK0iOEK3S-u8-y4Bg7xhIeNDJAsp58msaE5LcFy5soai6IcUhqA4MrtJWujyHsaiYsUnSKJ4v7YKQEBwEIPg8meg4iGc8gVrx2GbEKwn2L6bhSI0JiBkJ+ysKwCiNgEwQaex2ZiOoFj3nUNi6PsZizqolxhk4pRmHYUhrgBG7OfanFiM0zoSrsXRhrpSgzsiOT2PsFBaGGSr2IUhyWBFzYxn45IkJSNI-NFqHaTkZgWIlGjJdYRSlL6cqXMczz1Cq0nydR-6lUBcZjLVWnZGIjx5pYLgtUKsLFFsnXNDlEjSBILVqI8LUqCVWoxsB7YTRx9WOLIFSWA4ziqEJnWlI0kouNY5hbSuaiNrRYCndm0lNZs2JSPCwkyFUGWIpWwNOAoTySmYP6eEAA */
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
