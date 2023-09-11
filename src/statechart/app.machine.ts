import { EventFrom, assign, createMachine, sendTo } from 'xstate';
import { generationAlgorithmMachine } from './recursiveBacktracker.machine';
import { Ref } from 'react';
import { IGrid } from '../components/generation/Grid';
import { GenerationParams } from '../types';

const FPS_DEFAULT = 30;
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
          gridRef: Ref<IGrid> | undefined;
          generationSessionId: number;
        };
        events:
          | ControlEvent
          | {
              type: 'generation.param.set';
              params: { name: string; value: number };
            }
          | {
              type: 'refs.inject';
              params: { gridRef: Ref<IGrid> };
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
        gridRef: undefined,
        generationSessionId: new Date().getTime(),
      },
      id: 'app',
      initial: 'Idle',
      states: {
        Idle: {
          on: {
            'refs.inject': {
              actions: 'storeGridRef',
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
              if (context.gridRef && 'current' in context.gridRef) {
                return {
                  canPlay: true,
                  fps: context.generationParams.fps,
                  grid: context.gridRef.current,
                  pathId: context.generationSessionId.toString(),
                };
              }

              return undefined;
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
        storeGridRef: assign({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          gridRef: ({ event }: any) => event.params.gridRef,
        }),
        refreshGenerationSessionId: assign({
          generationSessionId: () => new Date().getTime(),
        }),
        updateGenerationParams: assign({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          generationParams: ({ context, event }: any) => ({
            ...context.generationParams,
            [event.params.name]: event.params.value,
          }),
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

export type AppMachineEvent = EventFrom<typeof appMachine>;
