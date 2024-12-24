import { assign, setup } from 'xstate';
import { ICell } from '../components/generation/Cell';
import type { IGrid } from '../components/generation/Grid';
import { seek } from '../components/generation/seek';
import { AlgorithmGenerationParams } from '../types';

export const generationAlgorithmMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QwHZgE4EMAuBLA9igIIA2U+6u2AFgLYCymAxtbmgMROHbr4mwA6AA4lMATwDaABgC6iUEPywqBFPJAAPRAEYArAN0AmAGwBOUwHYAHABYLxm8YDMV3QBoQYxAFpthmwJWFoZWLrqW4bp6AL7RHqgYOKqk5JQ0DMysHFwoPHyCQpgArrBg0nJIIIrKeITqWggmhoE2VlbaLi7aUqYeXgg2dgJONrpW-iMuFoOx8WBoWLXEZBRUdIwsbGCc3Lz8ArDYYEICAGYUAO6Y6BDl6tUqdZUNZoEWTqbGQWNOTg7unh82k+BhsUlaNmBthMul0sxACUWyRWaXWmS2AgA4vNEksAAQASQgJG2iKShAO2Gu2DulQeS3qPjsTgMxmCejso0Mej6PmcBn8IWcxn83V+xnhZKWKVW6Q2WTAAgJKBUmBIuAAXmwoOwNIccIrMKcjugABQAZQAopaANIAfQJADkACqWgBKADUiAAZACU7ClyNSawymzQSpVeDVmu1tIUSkeameQOmgScUmMukcUlC0ykTl5CH5zlslisxnzUjFkpxSMIMtRoYVAnNYDAAGttew41UEwzkwh01IWm0bKZBsDdFXjIX7MNgcZtBZ7FObE4awtyctg3L0eGiBAAG6YFBMLs9+mqRlF9oCbmmfMriuw7Sz4wCZyGblftpswzmDdcSDWU0TDRUD2PU8uz1KkjgEI0TQta17SdV1PR9f1A3rFEQ3lDEIJPM8UCgC8+yvAduSsARtFsZdBUGKxxxsQtvF+QIpHsDNwSXaZwkAuttxApsMQAIWYdseHE89ZHuMinlABpTG0AIlzMcYLG6NpgkLbQHA-IxjC+Rdgj+dc4gRWstwbXC90VMSmAkrAHPPbQKnjGpyIUxBrBZX5-HLLM9GU5jAUaQxh0M8IOK-JceiMWJzJQfAIDgdQsMExs8LQWSPPkzQfCzYddJMbjwnecwWJCFloVcQwjB6OrTDMuZN2lHDdzArFLPxIkSRyxNr28RwqJ6QznFMKrx1fULfDXD82TK0wol0iwxn4qz2tA5tlVVdUtWI-r+y8hAhom6iRQrSEyo+XpQrq4Y10+Cb7GcSF7HWtqdy2jFWw7bVDs8-KEAsCKgmsbplMncZCxcYYnBexi-CnD4bA+4DMtsgQCKgg66TkpNjpsblQVGVaXGZSYYao34EaUur83HNHsK+4Tw3sxypNx9yBoHcth3aUJv3edoXELKI4fCPwTBGKRZdMJmMpszqADE2FwWBqEgAG8oaIJh10EZl3zctOisQsQn0eH0zHYJ3lhCUEqAA */
  setup({
    types: {} as {
      context: {
        canPlay: boolean;
        currentCell: ICell | undefined;
        eligibleNeighbors: ICell[];
        grid: IGrid;
        pathId: string;
        stack: ICell[];
        startIndex: number;
      } & AlgorithmGenerationParams;
      input: {
        canPlay: boolean;
        fps: number;
        grid: IGrid;
        pathId: string;
      };
      events:
        | { type: 'generation.start' }
        | { type: 'controls.play' }
        | { type: 'controls.pause' }
        | { type: 'controls.step.forward' };
    },
    guards: {
      'can play': ({ context }) => context.canPlay,
      'reached a dead end': ({ context: { eligibleNeighbors } }) =>
        eligibleNeighbors.length === 0,
      'back at the start': ({ context: { stack } }) => stack.length === 0,
    },
    actions: {
      setCurrentStartCell: assign({
        currentCell: ({ context }) =>
          context.grid.visitStartCell(context.pathId),
      }),
      pushToStack: assign({
        stack: ({ context: { stack, currentCell } }) =>
          currentCell ? [...stack, currentCell] : stack,
      }),
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
      drawGrid: ({ context: { grid } }) => grid.draw(),
    },
    delays: {
      SEEK_INTERVAL: ({ context: { fps } }) => 1000 / fps,
    },
  }).createMachine({
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
        actions: assign({ canPlay: true }),
        target: '.Seeking',
      },
      'controls.pause': {
        actions: assign({ canPlay: false }),
      },
      'controls.step.forward': '.Seeking',
    },
    states: {
      'Generation Idle': {
        on: {
          'generation.start': 'Initializing',
        },
      },
      Initializing: {
        entry: ['setCurrentStartCell', 'pushToStack'],
        after: {
          SEEK_INTERVAL: {
            guard: ({ context }) => context.canPlay,
            target: 'Seeking',
          },
        },
      },
      Seeking: {
        entry: ['findNeighbors', 'drawGrid'],
        always: 'Advancing',
      },
      Advancing: {
        entry: ['pickNextCell', 'pushToStack'],
        after: {
          SEEK_INTERVAL: {
            guard: 'can play',
            target: 'Seeking',
          },
        },
        always: {
          guard: 'reached a dead end',
          target: 'Backtracking',
        },
      },
      Backtracking: {
        // Pop from the stack
        entry: assign(({ context: { stack } }) => {
          const prevCell = stack.pop();
          prevCell?.setAsBacktrack();
          return { stack: [...stack], currentCell: prevCell };
        }),
        always: [
          { guard: 'back at the start', target: 'Finished' },
          { target: 'Seeking' },
        ],
      },
      Finished: {
        type: 'final',
      },
    },
  });
