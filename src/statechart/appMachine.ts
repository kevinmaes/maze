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
  /** @xstate-layout N4IgpgJg5mDOIC5QEMAOqDEBlMAXABDAHZgBOyuAlgPZH6rLkC2A2gAwC6ioq1slVWtxAAPRAFoArNIB0ARjaS5cgJySA7ABYAbAA45ugDQgAnhM27NMyboBMu3dpUrbm2yq0BfT8bSoZlBAANmAYAJJEAFZgAMYEpGAAZrDsXEggvPyCRMJiCOIAzJoFMupsBprlBba2kjWaxmb5RbYytgW6kioFKnLa6iq6Bd6+6DLEZBSURFAYAKqoEBRgqcKZAjQ56Xni7SWSPboqmupdznKako3mltZ2Dk4ubh6aIyB+42Ak5FQzGAAitBWnDWfA2Qm2iGUkm0MgK6jkSl0WiURWu+VsbBKxVcvV6ihU-V0bw+Ex+0ygASIG2QQUoAC8KRgAApBZAmVbpdbZXJQtjqGRE9qaVTaAoHBqmcwKGQ6SxsdzaSRsCwqEljMlTGYyVBskxM5nIACusGBaR4YJ5kIQ2ixMksBUUSjkjtscnR4mK2JqF3FiI8jmGPneGq+k1+lN17KZWFw1FQnItWU2vIQ7la2jk6k6WizGickqauwGcPh6m0rlOzlc2nV-k1EZ1xtNEBZesTGUtKettpUcPLRyKCPFhI9B326iKBT0Yt0WNewdJYfJ2oYJsg2DjCZBXK7ENAeWRJSx2k0xWHFmRHpqsI6FeqOkRtiVQdG9eXWsjzY3sbAqHwiTUKQADujAQB23LdgefL8oKFZDBcjgnAYY7KKUk5KvebgqpIdYyBAQKbowBDUAAbmQEF7ls0EIEeMgnme8IupeRhSvkygChoKjlFoZRnjoQbBkQ1AQHAwh+KCyb7qIEi2iUCjOmoWh6ChbHiOoWjWIqljFOUFa2HhgQhJJ4LUTJ+QWJIpSqJck5sPZjqFhIBSqG0lidPyqh8bhi6ht8n4mVaNHiAoVhKAibAuJ0BgSh6egCoocjtGUyJsEcC5vp8-mNtMNJ0oyMyBVB5lSLC4UKFFSKxWpIpsLKeiVDCyhui5eENhSOp6hSRXSXkrjYvZeKHO0qgel6MiEuUMIudOjVtR+jZri2PVmXk3QCu0YrOPBLntGNMpyo1mZJS6WJ4QRJAram0J9mw2jHU1tTcbYHrHIKtT2GlDjlsocjeN4QA */
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
          Update: {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            actions: [() => {}],
          },
          Done: {
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
