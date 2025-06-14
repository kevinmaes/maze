import { createActorContext } from '@xstate/react';
import { assign, sendTo, setup } from 'xstate';
import { IGrid } from '../components/generation/Grid';
import { GenerationParams } from '../types';
import { recursiveBacktrackerMachine } from './recursiveBacktracker.machine';

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
  /** @xstate-layout N4IgpgJg5mDOIC5QEMAOqDEMB2YBOyALgJYD22AdKsgQLYWxiEDaADALqKiqmzEnkuIAB6IAtAE4ArKwpSAHPIAsEgIxSJ8gGwB2CRIA0IAJ7iVWijqkAmVUqWtrUrauvKAvu6NpUFAJIQADZgWHjEEBTE2ABWYADGLBxCPHwC2EKiCGI6rDoU8tYAzDolGloKdkamWYX6+bUlWkqF1ppShYWe3ugUAOJguAQk2FAYEORgkdgAbqQA1pM4+ERk2ACCgVCkYYQAFrRsnEggKfyrGYjNqhSshTb6LsVuEjpVZvIUWq1ublqFjqpWFIuiAfH0BsthlB-NgzshAsQAF5RUZxciEPCkQKwKiBZDGQ7JXhnQTHTJiVp5KQ6P7aViqCQdbRaN5ZaxaWSaaS5eQSZr-VSdLygnr9QYrEYUAAKeOMKIwaOwGKxOOoAFdGITjqc0hcEK5ZDlmS5VAzCiyTOInNYKIzrPSJI55KotOUlCCwWLISjpbL5YrldiGIRSKgtdxibqyeI7koKMUpM4lEUHK15K9LVkGR9k9YdHcFFJ1H8dB7RRChj6pcgNZAFejMUHULLwydI+do-q85YgYC3IolOUdNZWWI7pznLkrA49C0y74vZXJdXaxB60rGzjYCGw0lte3SaByfJCjc9Eo9H8tC9dBnqtk8tfHEXnFYudZ5+DxVDpTXGGuA03YMwF8AAzbYAHcaAgVsdQ7I9LkKHMNE0JQZDUKxqVHcdbWcVxHnkBQJGsd1hTBAARCYMDBPA4EIGhEiOCNUngkRxDUU9HFyQFHSBItVFZU0KCcGl5FYXImkvJRVE8YVsFICA4CEHwiRYw82KyfQPgUZQ1A0bQ9EMTMxAUU9GT5aSOj5fMZLInoAmCVSSXSTtJCKeN2UFIph15WxsK+SxiMdLRCOcAdSO6BcKwlKAnKjBCshkOMi1YFRlHpV1E0KUclGUfIih4tx6QUP5P0XGKYThBFkRGOLWPJNCLBStKHBdcp2lHTzhKy-4LyQ81SzsqLvyrP1av3NSXISsRXFPU0L3zIpxLEvNOvaQKgsaVwSkcMrop-Fd-zq9TMjuJqLxQgy8ySzq7jkWN0w0fjpA-IaKEo3BjqmjS0LjJxCPNQpVDEjlB1ZawbRpbbcgqVhiJpWT3CAA */
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
            generationParam: { name: string; value: number };
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
      generationAlgorithm: recursiveBacktrackerMachine,
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
            actions: [assign({ grid: ({ event }) => event.grid }), 'drawGrid'],
            target: 'Generating',
          },
        },
      },
      Generating: {
        initial: 'Initializing',
        invoke: {
          id: 'generationAlgorithm',
          src: 'generationAlgorithm',
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
          onDone: 'Done',
        },
        states: {
          Initializing: {
            tags: 'levers enabled',
            on: {
              'controls.play': 'Playing',
            },
          },
          Playing: {
            entry: sendTo('generationAlgorithm', {
              type: 'generation.start',
            }),
            on: {
              'controls.pause': {
                actions: sendTo('generationAlgorithm', {
                  type: 'controls.pause',
                }),
                target: 'Paused',
              },
              'controls.stop': '#app.Idle',
            },
          },
          Paused: {
            on: {
              'controls.play': {
                actions: sendTo('generationAlgorithm', {
                  type: 'controls.play',
                }),
                target: 'Playing',
              },
              'controls.stop': '#app.Idle',
              'controls.step.forward': {
                actions: sendTo('generationAlgorithm', {
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
          'app.restart': '#app.Idle',
        },
      },
    },
    on: {
      'generation.param.set': {
        actions: assign({
          generationParams: ({ context, event: { generationParam } }) => ({
            ...context.generationParams,
            [generationParam.name]: generationParam.value,
          }),
        }),
        target: '#app.Idle',
      },
    },
  });

export const AppMachineContext = createActorContext(appMachine);
