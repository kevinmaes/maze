import { assign, setup } from 'xstate';
import { ICell } from '../components/generation/Cell';
import type { IGrid } from '../components/generation/Grid';
import { seek } from '../components/generation/seek';
import { AlgorithmGenerationParams } from '../types';

export const recursiveBacktrackerMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QCcwGMCuzYEsBuYAQgIZoDWALsqWWMgMRoD2AdlUwDawB0ADh8QCeAbQAMAXUSheTXBRyspIAB6IAzACZuADgAsozQEZ9agOynNagDQhBiALSmN27hoBsbjYcMBWXz+1tAE4AXxCbVExsfCIaKho6RlZ2Lj5iDFgwMUkkEBk5BRYlVQR7bW9uII0fUWqajScfHxs7UqqgytFRUyqenzU3UVDwkEisXAIScnjyROY2ZE4eWAowXm4AMyZkAHdiZAhspXyceUVckvsNA1ce6sDDIdMfXW0Wh1NRH24zNR9q-RBAJhCLocYxKaUaizZDcADiYBYdGIZxYAAIAJIQDhgegwJHUVHcFb7ChHXInVHFD4WbhdIJuJq6AJdXTWWwOJncf5uKpqIJdQxqNkg0Zg6KTOLQ2iwjEsU44YgcHAALxwLCg9GUJNW3GIG1WyAAFJkwGQAOrEU4ASnoYwlsWm0ro3DlCqVqvVUHJ0lkCvOoEuGiqdNM2jU3nMxn+pnepSaajpGgGalEhiCQTDulF9omjqhCVhAGUwGavfQfXk-VSLohDOHuOnPpnjEKW7o4-YE0mU2mM1nDDnxXnITMZdwAIIQPDEFhocuVymFakIVO6H5uNTaUxubRfbduNmdszrteGapBYU+XcModREdSwuT6ez+carU6sB6g10E2li1WhQtq5hCj4ws+M5zl6i7VsutYII8LgMmm6bdJ8uhBNoGidroybcLu9bVKIbKmEKFh3uCkpOk+o7SguEjHLBAYqOoNxYeU7iHhoDSMp2vimPhmimLhfj-MKVQUQ6tE0WBZALoYOS+gUzGXPWjYMphARuOehjCXxPgCZuDQib4yYYT4YQjCwTAQHASggVRBYwoxylFPB9gZomGaiFhuFdM8O6duU3yboYniDMyEbAiMDn5mOLoIgSKKFJi2JgC5-puYGDhBMylQCr51zdAZbidlyPQDF4PLmBokkPtR4FuvIHpqhqGU1tl8a0txAQ7to165d0ZVBIYrg9ZhUU1NedWgQ144lmWbUUkxWUsaUuhuK4QLmAE-RVAZ7KtF2I1jRe4b+F8bgzY58WwlOkFvlA7VwZ1waGeUjLCYevIBIdnIndxZ2TZd11xc6sLSeQXrPSp6heEm26pmYzg7rGHKlM4Wh-MRwb1gEZGg5D44AGLqjgsAABaQDDq0lJo64WOG-K+KmjOdj0PzY6InjIw0-SWSEQA */
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
      seekWait: ({ context: { fps } }) => 1000 / fps,
    },
  }).createMachine({
    id: 'recursiveBacktracker',
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
          seekWait: {
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
          seekWait: {
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
