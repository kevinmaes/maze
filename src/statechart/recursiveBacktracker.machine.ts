import { assign, setup } from 'xstate';
import {
  advance,
  backtrack,
  findNeighbors,
  isBackAtStart,
  isDeadEnd,
  type RecursiveBacktrackerState,
  recursiveBacktracker,
} from '../maze/algorithms/recursiveBacktracker';
import type { Maze } from '../maze/types';
import type { AlgorithmGenerationParams } from '../types';

export const recursiveBacktrackerMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QwHZgE4EMAuBLA9igIIA2U+6u2AFgLYCymAxtbmgMROHbr4mwA6AA4lMATwDaABgC6iUEPywqBFPJAAPRAEYArAN0AmAGwBOUwHYAHABYLxm8YDMV3QBoQYxAFpthmwJWFoZWLrqW4bp6AL7RHqgYOKqk5JQ0DMysHFwoPHyCQpgArrBg0nJIIIrKeITqWggmhoE2VlbaLi7aUqYeXgg2dgJONrpW-iMuFoOx8WBoWLXEZBRUdIwsbGCc3Lz8ArDYYEICAGYUAO6Y6BDl6tUqdZUNZoEWTqbGQWNOTg7unh82k+BhsUlaNmBthMul0sxACUWyRWaXWmS2AgA4vNEksAAQASQgJG2iKShAO2Gu2DulQeS3qPjsTgMxmCejso0Mej6PmcBn8IWcxn83V+xnhZKWKVW6Q2WTAAgJKBUmBIuAAXmwoOwNIccIrMKcjugABQAZQAopaANIAfQJADkACqWgBKADUiAAZACU7ClyNSawymzQSpVeDVmu1tIUSkeameQOmgScUmMukcUlC0ykTl5CH5zlslisxnzUjFkpxSMIMtRoYVAnNYDAAGttew41UEwzkwh01IWm0bKZBsDdFXjIX7MNgcZtBZ7FObE4awtyctg3L0eGiBAAG6YFBMLs9+mqRlF9oCbmmfMriuw7Sz4wCZyGblftpswzmDdcSDWU0TDRUD2PU8uz1KkjgEI0TQta17SdV1PR9f1A3rFEQ3lDEIJPM8UCgC8+yvAduSsARtFsZdBUGKxxxsQtvF+QIpHsDNwSXaZwkAuttxApsMQAIWYdseHE89ZHuMinlABpTG0AIlzMcYLG6NpgkLbQHA-IxjC+Rdgj+dc4gRWstwbXC90VMSmAkrAHPPbQKnjGpyIUxBrBZX5-HLLM9GU5jAUaQxh0M8IOK-JceiMWJzJQfAIDgdQsMExs8LQWSPPkzQfCzYddJMbjwnecwWJCFloVcQwjB6OrTDMuZN2lHDdzArFLPxIkSRyxNr28RwqJ6QznFMKrx1fULfDXD82TK0wol0iwxn4qz2tA5tlVVdUtWI-r+y8hAhom6iRQrSEyo+XpQrq4Y10+Cb7GcSF7HWtqdy2jFWw7bVDs8-KEAsCKgmsbplMncZCxcYYnBexi-CnD4bA+4DMtsgQCKgg66TkpNjpsblQVGVaXGZSYYao34EaUur83HNHsK+4Tw3sxypNx9yBoHcth3aUJv3edoXELKI4fCPwTBGKRZdMJmMpszqADE2FwWBqEgAG8oaIJh10EZl3zctOisQsQn0eH0zHYJ3lhCUEqAA */
  setup({
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
      'reached a dead end': ({ context: { generation } }) =>
        generation !== null && isDeadEnd(generation),
      'back at the start': ({ context: { generation } }) =>
        generation !== null && isBackAtStart(generation),
    },
    // Each action applies one pure algorithm transition; nothing is mutated or drawn.
    actions: {
      setCurrentStartCell: assign({
        generation: ({ context }) =>
          recursiveBacktracker.init(context.maze, { now: Date.now() }),
      }),
      findNeighbors: assign({
        generation: ({ context: { generation } }) =>
          generation && findNeighbors(generation),
      }),
      pickNextCell: assign({
        generation: ({ context: { generation } }) =>
          generation && advance(generation, { now: Date.now() }),
      }),
      backtrack: assign({
        generation: ({ context: { generation } }) =>
          generation && backtrack(generation),
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
        entry: 'setCurrentStartCell',
        after: {
          seekWait: {
            guard: ({ context }) => context.canPlay,
            target: 'Seeking',
          },
        },
      },
      Seeking: {
        entry: 'findNeighbors',
        always: [
          { guard: 'reached a dead end', target: 'Backtracking' },
          { target: 'Advancing' },
        ],
      },
      Advancing: {
        entry: 'pickNextCell',
        after: {
          seekWait: {
            guard: 'can play',
            target: 'Seeking',
          },
        },
      },
      Backtracking: {
        entry: 'backtrack',
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
