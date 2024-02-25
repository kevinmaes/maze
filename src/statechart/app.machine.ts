import { EventFrom, StateFrom, assign, sendTo, setup } from 'xstate';
import { IGrid } from '../components/generation/Grid';
import { GenerationParams } from '../types';
import { generationAlgorithmMachine } from './recursiveBacktracker.machine';

const FPS_DEFAULT = 20;
const BORDER_WEIGHT_DEFAULT = 2;
const GRID_SIZE_DEFAULT = 15;

const CellSize = {
  DEFAULT: 20,
  MIN: 10,
  MAX: 25,
};

export type ControlEvent =
  | { type: 'controls.play' }
  | { type: 'controls.stop' }
  | { type: 'controls.pause' }
  | { type: 'controls.step.forward' }
  | { type: 'app.restart' };

export const appMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMAOqDEMB2YBOyALgJYD22AdKsgQLYWxiEDaADALqKiqmzEnkuIAB6IAtAE4ATAFYKADgDMAdgCMAFgnr1i1hMUyANCACe49fIBsFVZZk6Z8mTMXblMgL4fjaVBQCSEAA2YFh4xBAUxNgAVmAAxiwcQjx8AthCoghiyoqqFBIyrMqsUvIWZVLqxmbZipbKFNrqUqzqqspSqi7KXj7oFADiYLgEJNhQGBDkYFHYAG6kANazOPhEZNgAgkFQpOGEABa0ALLI8YfRYGycSCCp-JuZiCqNMiUGdupFWq414nYKFIpGopAZlJYNMpet4QL4hiN1uMoAFsI9kEFiAAvaKTeLkQh4UhBWBUILIEw3FK8R6CO5ZMSKKpAqwQz6qViWP6mcRg1gUXTub6qeoQlx9OEDYajDYTCgABXJJlxGHx2EJxNJ1AArowqXcHulnghVK0KCUrJZIapVPpLP9srIpAUmaxbaV5LYvhL4dKkbiFUqVWqNSSGIRSKh9dwaUb6eJFPJnaV6vo2kn3PIHWINPIKFbWI5Tcp1AXtD6pYixgH5chdZBVQSiWHUEro-dY094yaQebCxyyvJynZOtmDPzCpZikLivopBW-H7q3La-WII31c3SbAI1HkgbO3TQAylBRZ+plBIuZYJBDodnofmJKUZN0GjIJPJpAuETLkQq60YdcQy3cMwD8AAzfYAHcaAgdtDS7Y9EB0PNvgkT9vj0DpnGUMcigKGRISkSFE0caR1B-AARGYMHhPA4EIGgkluGM0iQkRxDtAonQsTRFDTVQHVLAUGlYUp9A-NpKIlbBSAgOAhF8al2KPTjskwniZCqcp9EE7MP3yeRC3qDRtPqMof0CEIVNpDJuzEKx+Q-XJyMsYztAkMcygFPIp3qfjv1hX0q1lKBbLjZDshcPMOXedw8nKJQ8J5aK2gFV9WDyTlPS0SwfyXMLUXRTEcQmCKOIZTR+Ti6EXFUJL6mzPkBWKexX1FOxFAK0L-0VClcQqtSGVNRQbChXI+VYYyQWalxzQwqRbwhYsSnnYLKz-GtAMgIb7Kiz4KHsdwMNZEEimqVKxDBOQXHseQTtfW1tOomY9uNFpGnEp6X1kS1FGE27unsLKJDfRMSy8LwgA */
  setup({
    types: {} as {
      context: {
        mazeId: string;
        generationParams: GenerationParams;
        grid: IGrid | null;
        generationSessionId: number;
      };
      events:
        | ControlEvent
        | {
            type: 'generation.param.set';
            params: { name: string; value: number };
          }
        | {
            type: 'grid.inject';
            grid: IGrid;
          };
    },
    actions: {
      drawGrid: ({ context }) => context.grid?.draw(),
    },
    actors: {
      generationAlgorithmMachine,
    },
  }).createMachine({
    context: {
      mazeId: '',
      generationParams: {
        borderWeight: BORDER_WEIGHT_DEFAULT,
        cellSize: CellSize.DEFAULT,
        fps: FPS_DEFAULT,
        gridColumns: GRID_SIZE_DEFAULT,
        gridRows: GRID_SIZE_DEFAULT,
      },
      grid: null,
      generationSessionId: new Date().getTime(),
    },
    id: 'app',
    initial: 'Idle',
    states: {
      Idle: {
        tags: 'levers enabled',
        entry: assign({
          generationSessionId: () => new Date().getTime(),
        }),
        on: {
          'grid.inject': {
            actions: [
              assign({
                grid: ({ event }) => event.grid,
              }),
              'drawGrid',
            ],
            target: 'Generating',
          },
        },
      },
      Generating: {
        initial: 'Initializing',
        invoke: {
          id: 'generationAlgorithmMachine',
          src: 'generationAlgorithmMachine',
          input: ({ context }) => {
            if (!context.grid) {
              throw new Error('Grid is not available');
            }
            return {
              canPlay: true,
              fps: context.generationParams.fps,
              grid: context.grid,
              pathId: context.generationSessionId.toString(),
            };
          },
          onDone: {
            target: 'Done',
          },
        },
        states: {
          Initializing: {
            tags: 'levers enabled',
            on: {
              'controls.play': {
                target: 'Playing',
              },
            },
          },
          Playing: {
            entry: sendTo('generationAlgorithmMachine', {
              type: 'generation.start',
            }),
            on: {
              'controls.pause': {
                actions: sendTo('generationAlgorithmMachine', {
                  type: 'controls.pause',
                }),
                target: 'Paused',
              },
              'controls.stop': {
                target: '#app.Idle',
              },
            },
          },
          Paused: {
            on: {
              'controls.play': {
                actions: sendTo('generationAlgorithmMachine', {
                  type: 'controls.play',
                }),
                target: 'Playing',
              },
              'controls.stop': {
                target: '#app.Idle',
              },
              'controls.step.forward': {
                actions: sendTo('generationAlgorithmMachine', {
                  type: 'controls.step.forward',
                }),
              },
            },
          },
        },
      },
      Done: {
        entry: 'drawGrid',
        on: {
          'app.restart': {
            target: '#app.Idle',
          },
        },
      },
    },
    on: {
      'generation.param.set': {
        actions: [
          assign({
            generationParams: ({ context, event }) => ({
              ...context.generationParams,
              [event.params.name]: event.params.value,
            }),
          }),
        ],
        target: '#app.Idle',
      },
    },
  });

export type AppMachineState = StateFrom<typeof appMachine>;
export type AppMachineEvent = EventFrom<typeof appMachine>;
