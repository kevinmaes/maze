import { assign, setup } from 'xstate';
import {
  type RecursiveBacktrackerState,
  recursiveBacktracker,
} from '../maze/algorithms/recursiveBacktracker';
import type { Maze } from '../maze/types';
import type { AlgorithmGenerationParams } from '../types';

export const recursiveBacktrackerMachine = setup({
  types: {} as {
    context: {
      canPlay: boolean;
      // The untouched maze to generate from; `generation` holds progress.
      maze: Maze;
      generation: RecursiveBacktrackerState | null;
    } & AlgorithmGenerationParams;
    input: {
      canPlay: boolean;
      fps: number;
      maze: Maze;
    };
    output: Maze;
    events:
      | { type: 'generation.start' }
      | { type: 'controls.play' }
      | { type: 'controls.pause' }
      | { type: 'controls.step.forward' };
  },
  guards: {
    'can play': ({ context }) => context.canPlay,
    'maze is complete': ({ context: { generation } }) =>
      generation !== null && recursiveBacktracker.isDone(generation),
  },
  actions: {
    startGeneration: assign({
      generation: ({ context }) =>
        recursiveBacktracker.init(context.maze, { now: Date.now() }),
    }),
    stepGeneration: assign({
      generation: ({ context: { generation } }) =>
        generation &&
        recursiveBacktracker.step(generation, { now: Date.now() }),
    }),
  },
  delays: {
    seekWait: ({ context: { fps } }) => 1000 / fps,
  },
}).createMachine({
  id: 'recursiveBacktracker',
  context: ({ input }) => ({
    generation: null,
    ...input,
  }),
  initial: 'Generation Idle',
  output: ({ context }) => context.generation?.maze ?? context.maze,
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
      entry: 'startGeneration',
      after: {
        seekWait: {
          guard: ({ context }) => context.canPlay,
          target: 'Seeking',
        },
      },
    },
    // Each entry advances one cell, backtracking first when at a dead end.
    Seeking: {
      entry: 'stepGeneration',
      always: {
        guard: 'maze is complete',
        target: 'Finished',
      },
      after: {
        seekWait: {
          guard: 'can play',
          target: 'Seeking',
          reenter: true,
        },
      },
    },
    Finished: {
      type: 'final',
    },
  },
});
