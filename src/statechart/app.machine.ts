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
  /** @xstate-layout N4IgpgJg5mDOIC5QEMAOqDEMB2YBOyALgJYD22AdKsgQLYWxiEDaADALqKiqmzEnkuIAB6JWAGhABPMQF9ZktKgoBJCABswGFdgBWYAMaEABHjAAzWG05IQPPgOxDRCALQBmACzuKAdlYAjAAcnoHuAEzhAKyRnpIybl7hFOHuQVEAnO4ZAQBsvhlB7vKK6BQA4mC4BCTYUBgAqqgQRGDWQvb8ZE62LhLScgogShVV+ETEdRgAIuRtHB28XYK9YvGDpcqV1RN1qthdyOrEAF6T9QAK6shS7badjs5rAwisJcNl2+O1UBRXN+cMBdkABXRh3bhLR6rV7rV7vEZfGrnP7XKSAgDKhFIqAhdih3SesJebyGiLGyL2wLBkCBaLxD0JMP6CVJm1GOx+f1BjAgGCxOIZBJWoBcrmCAQorCivncstYnlyQV8UThAQCUQoQXyctYuWliuVUQRnwpu1+1N5GFghDAynMpDwAHcaBAhQ4maLEK5fLlJblchlWO4lbkYl44i9XKEKAEvKxWOElVEooaVSblLNcBgRmYbTQWAt7sKel63Nrcn4ou4ZQF-H7POEgmrfJL1angwnPBlMuF5ENsKQIHAhEpFh6RSJvTlPFWa636wFG82o42Mn468H69EosGM6oNGBx8tS1O3J50huMp4Ze4E53IwkPAF102L7vWxl-Df90jzcfoTLVwglYdcAyDENtXDTxH29F8fD9OssiiYI9VyTxfzNLkdEOY4zjqADPTPVwP1jaV1R7XxDWCOEMlyTDORRf50QI4sJ1PMVSICciXxlaiVwSVJWAoC85QyDJohVbVwl8BjviYnlIEIydONYXwyJQ3iqKVGiXk8dUKB7dVWCNa9uwyfcsyPNiTyJEiUw0ii+J0gTEEyWdvG7EzAn8EN+1kIA */
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
              'playhead.play': {
                target: 'Playing',
              },
            },
          },
          Playing: {
            onEntry: 'startGenerationAlgorithmMachine',
            on: {
              'playhead.pause': {
                actions: ['pauseGenerationAlgorithmMachine'],
                target: 'Paused',
              },
              'playhead.stop': {
                actions: ['refreshGenerationSessionId'],
                target: '#app.Idle',
              },
            },
          },
          Paused: {
            on: {
              'playhead.play': {
                actions: ['playGenerationAlgorithmMachine'],
                target: 'Playing',
              },
              'playhead.stop': {
                actions: ['refreshGenerationSessionId'],
                target: '#app.Idle',
              },
              'step.forward': {
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
