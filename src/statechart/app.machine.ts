import { EventFrom, StateFrom, assign, createMachine, sendTo } from 'xstate';
import { generationAlgorithmMachine } from './recursiveBacktracker.machine';
import { IGrid } from '../components/generation/Grid';
import { GenerationParams } from '../types';

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
  /** @xstate-layout N4IgpgJg5mDOIC5QEMAOqDEMB2YBOyALgJYD22AdKsgQLYWxiEDaADALqKiqmzEnkuIAB6IAtAE4ATBIoSAHAGZWU+QDYA7Gplr5AGhABPcQBYJrCgEZ50xRICsa1pZP2HAX3cG0qCgEkIABswDDwwADNYCmJsACswAGMWDiEePgFsIVEEMQ0TCykTeVZFJzc1ZSkDYxzFe0sKVXtFE1VLR3qNe09vdAoAcTBcAhJsKAwIYlhUQORDCgBXVAgiMDZOJBA0-jJMzez5KQ1G+w1WIqk61i7q8Qk1CkUtdQlS+XlLKXsTHpAfAaG+CIMXGOCBGQo4RiUwAFutUrwdoJ9ognIoKHlFJ9LPd6vl7LccporEoZE8ZBJ2q1fv9BsNgWN-NgdshAsQAF4gjAJciEPCkQJRGZzeGbbYZLLiRSFRrqLR1NSWVgVEyEsSXCzKLquSylLTNGl9OngkEUAAKs0MXJ52D5AqFyAWjFF3EREpRCEu8goNnaxSelicrHs+iM4i+snaCg+wY0l3aikNvmNI1NFrm1t5-MFDEIpFQLq2bt2kpyGnRNg0SnMEar5bVLhMFCKTg+Wle10OSYB9NGUHNjsYEG5WftVEthfFJY9hSbrW+dm0rkqGjVdQaTRabQ6li63ZTDP7ZsHkBHtuzUVgeYLKTFxeRoGyuQrEirdhUbjrijVJge7UDgalLu7wSD8Xh-EagKpoyx5OqeNp2jmV5gL44SkHgADuNAQJO957I+qK-o8oHKtolzSholhrnYjRPNIyrSI40rdOB-wACLkCE-xhFeNDJBsrrpNOBE5K8Dzlsoai6JcUhqA4hLtM2ujyGcaghsUnSJr82CkBAcBCD4CJCQ+Ih3PITYSaRhzSnJBJhjkbhSI0JjtLojgVLo3YBMERlIvhpk5OoFifnUNi6OcZhrqojxYmiahmHYUj7lBh6+e6IliM03pKqcXRYuZSirvZmXnBiFSfBUXTmGYajJb2pp+MyJCshyIJpcJAViGYFg5RoeXWEUpRqhqjzXN89R6mpWm9MmKV9ualptXexn+U+nzopYLh9dKyisMURzDc0GISNIr5aJ8fUqHVJowSeEDtSZ2SOLI5UOM4qiycNpSNMqLjWOYr67rVrF9BxuAPatqL2D1hxxlIUiBqdVT2Yo3qtLJrAKF8ypmGBnhAA */
  createMachine(
    {
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
              params: { grid: IGrid };
            }
          | { type: 'display.update' }
          | { type: 'generation.finish' };
      },
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
          on: {
            'grid.inject': {
              actions: 'storeGrid',
              target: 'Generating',
            },
          },
        },
        Generating: {
          initial: 'Initializing',
          invoke: {
            id: 'generationAlgorithmMachine',
            src: generationAlgorithmMachine,
            input: ({ context }) => {
              return {
                canPlay: true,
                fps: context.generationParams.fps,
                grid: context.grid,
                pathId: context.generationSessionId.toString(),
              };
            },
          },
          on: {
            // TODO: Find out why this bug exists where the absence of listening to this 'display.update' event
            // Causes the UI to not update during the generation state.
            'display.update': {},
            'generation.finish': {
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
              entry: 'startGenerationAlgorithmMachine',
              on: {
                'controls.pause': {
                  actions: 'pauseGenerationAlgorithmMachine',
                  target: 'Paused',
                },
                'controls.stop': {
                  actions: 'refreshGenerationSessionId',
                  target: '#app.Idle',
                },
              },
            },
            Paused: {
              on: {
                'controls.play': {
                  actions: 'playGenerationAlgorithmMachine',
                  target: 'Playing',
                },
                'controls.stop': {
                  actions: 'refreshGenerationSessionId',
                  target: '#app.Idle',
                },
                'controls.step.forward': {
                  actions: 'stepGenerationAlgorithmMachine',
                },
              },
            },
          },
        },
        Done: {
          on: {
            'app.restart': {
              actions: 'refreshGenerationSessionId',
              target: '#app.Idle',
            },
          },
        },
      },
      on: {
        'generation.param.set': {
          actions: ['updateGenerationParams'],
          target: '#app.Idle',
        },
      },
    },
    {
      actions: {
        storeGrid: assign({
          grid: ({ context, event }) => {
            if ('params' in event && 'grid' in event.params) {
              return event.params.grid;
            }
            return context.grid;
          },
        }),
        refreshGenerationSessionId: assign({
          generationSessionId: () => new Date().getTime(),
        }),
        updateGenerationParams: assign({
          generationParams: ({ context, event }) => {
            if (
              'params' in event &&
              'name' in event.params &&
              'value' in event.params
            ) {
              return {
                ...context.generationParams,
                [event.params.name]: event.params.value,
              };
            }
            return context.generationParams;
          },
        }),
        startGenerationAlgorithmMachine: sendTo('generationAlgorithmMachine', {
          type: 'generation.start',
        }),
        playGenerationAlgorithmMachine: sendTo('generationAlgorithmMachine', {
          type: 'controls.play',
        }),
        pauseGenerationAlgorithmMachine: sendTo('generationAlgorithmMachine', {
          type: 'controls.pause',
        }),
        stepGenerationAlgorithmMachine: sendTo('generationAlgorithmMachine', {
          type: 'controls.step.forward',
        }),
      },
      actors: {
        generationAlgorithmMachine,
      },
    }
  );

export type AppMachineState = StateFrom<typeof appMachine>;
export type AppMachineEvent = EventFrom<typeof appMachine>;
