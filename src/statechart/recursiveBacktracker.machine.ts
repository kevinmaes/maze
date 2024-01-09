import { assign, createMachine } from 'xstate';

import type { IGrid } from '../components/generation/Grid';

import { ICell } from '../components/generation/Cell';
import { seek } from '../components/generation/seek';
import { AlgorithmGenerationParams } from '../types';

interface AlgorithmContext extends AlgorithmGenerationParams {
  canPlay: boolean;
  currentCell: ICell | undefined;
  eligibleNeighbors: ICell[];
  grid: IGrid;
  pathId: string;
  stack: ICell[];
  startIndex: number;
}

export const generationAlgorithmMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QwHZgE4EMAuBLA9igIIA2U+6u2AFgLYCymAxtbmgMROHbr4mwA6AA4lMATwDaABgC6iUEPywqBFPJAAPRAEYArAN0AmAGwBOUwHYAHABYLxm8YDMV3QBoQYxAFpthmwJWFoZWLrqW4bp6AL7RHqgYOKqk5JQ0DMysHFwoPHyCQpgArrBg0nJIIIrKeITqWggmhoE2VlbaLi7aUqYeXgg2dgJONrpW-iMuFoOx8WBoWLXEZBRUdIwsbGCc3Lz8ArDYYEICAGYUAO6Y6BDl6tUqdZUNZoEWTqbGQWNOTg7unh82k+BhsUlaNmBthMul0sxACUWyRWaXWmS2AgA4vNEksAAQASQgJG2iKShAO2Gu2DulQeS3qPjsTgMxmCejso0Mej6PmcBn8IWcxn83V+xnhZKWKVW6Q2WTAAgJKBUmBIuAAXmwoOwNIccIrMKcjugABQAZQAopaANIAfQJADkACqWgBKADUiAAZACU7ClyNSawymzQSpVeDVmu1tIUSkeameQOmgScUmMukcUlC0ykTl5CH5zlslisxnzUjFkpxSMIMtRoYVAnNYDAAGttew41UEwzkwh01IWm0bKZBsDdFXjIX7MNgcZtBZ7FObE4awtyctg3L0eGiBAAG6YFBMLs9+mqRlFpz6UzaNnpkZcseziwCKTTf66P75+8SuIEVrLcGxDeUMQPY9Ty7PUqSOAQjRNC1rXtJ1XU9H1-UDesUTAvdFUgk8zxQKALz7K8B25KwBG0Wxl0FQYrHHGxC28X5Ak-CsK0hZdRlMDdcSDWU0TDRUACFmHbHhJPPWR7nIp5QAaUwQgET5ugfKtDCzfxCwfFlFykfx7wsZj8wEutt2EpsMQkpgpKwezz20Cp4xqCilMQexmlMKRdGsT52nGGdAUaPQBGCCxaIcUxywsHTYkAlB8AgOB1GwqzG3AtB5PcxTNB8LNhwfExwT0SwPl6ULvBCFloV8np-I+EILJA3Dd1ErFgPxIkSVyxNr28RxqJ6Ywxua0Jx20VjtDXAQxviyxTCiB94qsVrpXakTm2VVV1S1Ej+v7TyECGlSaJFbjyvecxC204Y10+FT7GcHiALmTdNp3baMVbDttSOjyCoQCxhy+Zd2irSFlvGQsXGGJwXqYvwpw+GwNqErL8IEQjoMOukFKTE6bG5UFRnilxmUmOHqN+JH720v90cAjLQI65s7IcmT8bcgaB1sbQ1JUtol0GUyVMLKIEY6d4fxGH9-DhFnusxvDOoAMTYXBYGoSBAfyhogmHH87FBlwSxcO7XGGd5wUsQxZd0ADYiAA */
  createMachine({
    types: {} as {
      context: AlgorithmContext;
      input: {
        canPlay: boolean;
        fps: number;
        grid: IGrid;
        pathId: string;
      };
      events:
        | {
            type: 'generation.start';
          }
        | {
            type: 'controls.play';
          }
        | {
            type: 'controls.pause';
          }
        | {
            type: 'controls.step.forward';
          }
        | {
            type: 'display.update';
          };
    },
    id: 'generationAlgorithmMachine',
    context: ({ input }) => ({
      currentCell: undefined,
      eligibleNeighbors: [],
      stack: [],
      startIndex: 0,
      ...input,
    }),
    initial: 'Generation Idle',
    on: {
      'controls.play': {
        actions: 'play',
        target: '.Seeking',
      },
      'controls.pause': {
        actions: 'pause',
      },
      'controls.step.forward': {
        target: '.Seeking',
      },
    },
    states: {
      'Generation Idle': {
        on: {
          'generation.start': {
            target: 'Initializing',
          },
        },
      },
      Initializing: {
        entry: ['setCurrentCellToStartCell', 'pushToStack'],
        after: {
          SEEK_INTERVAL: {
            guard: 'playing is allowed',
            target: 'Seeking',
          },
        },
      },
      Seeking: {
        entry: ['findNeighbors', 'draw'],
        always: {
          target: 'Advancing',
        },
      },
      Advancing: {
        entry: ['pickNextCell', 'pushToStack'],
        after: {
          SEEK_INTERVAL: {
            guard: 'playing is allowed',
            target: 'Seeking',
          },
        },
        always: {
          guard: 'reached a dead end',
          target: 'Backtracking',
        },
      },
      Backtracking: {
        entry: 'popFromStack',
        always: [
          {
            guard: 'back at the start',
            target: 'Finished',
          },
          {
            target: 'Seeking',
          },
        ],
      },
      Finished: {
        type: 'final',
      },
    },
  }).provide({
    guards: {
      'playing is allowed': ({ context }) => context.canPlay,
      'reached a dead end': ({ context: { eligibleNeighbors } }) =>
        eligibleNeighbors.length === 0,
      'back at the start': ({ context: { stack } }) => stack.length === 0,
    },
    actions: {
      draw: ({ context: { grid } }) => grid.draw(),
      setCurrentCellToStartCell: assign({
        currentCell: ({ context }) =>
          context.grid.visitStartCell(context.pathId),
      }),
      play: assign({ canPlay: true }),
      pause: assign({ canPlay: false }),
      findNeighbors: assign({
        eligibleNeighbors: ({ context: { grid, currentCell } }) =>
          grid.getNeighbors(currentCell as ICell),
      }),
      pickNextCell: assign(({ context: { grid, pathId, currentCell } }) => ({
        currentCell: seek({
          grid,
          pathId,
          current: currentCell as ICell,
        }),
      })),
      pushToStack: assign(({ context: { stack, currentCell } }) => {
        if (currentCell) {
          return {
            stack: [...stack, currentCell],
          };
        }
        return {};
      }),
      popFromStack: assign(({ context: { stack } }) => {
        const prevCell = stack.pop();
        prevCell?.setAsBacktrack();
        return { stack: [...stack], currentCell: prevCell };
      }),
    },
    delays: {
      SEEK_INTERVAL: ({ context: { fps } }) => 1000 / fps,
    },
  });
