import { StateFrom, assign, createMachine, sendParent } from 'xstate';

import type { IGrid } from '../components/generation/Grid';

import { ICell } from '../components/generation/Cell';
import { seek } from '../components/generation/seek';
import { AlgorithmGenerationParams } from '../types';

interface AlgorithmContext extends AlgorithmGenerationParams {
  canPlay: boolean;
  currentCell: ICell | undefined;
  eligibleNeighbors: ICell[];
  grid: IGrid | undefined;
  pathId: string;
  stack: ICell[];
  startIndex: number;
}

export const generationAlgorithmMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QwHZgE4EMAuBLA9igIIA2U+6u2AFgLYCymAxtbmgMTpgBmsAdGwBWYJtgDaABgC6iUAAd8sKgRSyQAD0QBaACwBWAIx8DEgwHY9OgJwAOCRJtmJOgDQgAntoBMXq8as6OubWTs42egC+EW6oGDgqpOSUNAzMrBxMhNjo+CT8ciSY7pIySCAKSniEapoIBnp8el4AbFZWZjY6Zs06zQDM4W6eCFoGXjp8jl42A3rtc4aR0SCxWFXEZBRUdIwsbGDsmSjZufmYAK6wYCVqFcrVZbUtXpM6NjYGAwMmVkOIgWY+H19DZxsCBmZAlEYmA0GsEptkjs0vtDlkcnk+LBsGA5HxuBQAO6YdAQG5lO7rGqIVqTMx9KzNRx6GZ9Hp6P4jAyMxo6MJBWw6Fp6JYwuHxQiJLYpXbpMB8ADisLi6wABABJCAkA6rCUoLHYEniaS3RT3VSPbRdPqNZpmLz1Lr6B0cjzafqNcbTfrNcYmPps6ErZXwyWI7apPZoPjqlDKTAkXAALzYUHY6mxOHlmG4OPQAAoAMoAUWLAGkAPrqgByABViwAlABqRAAMgBKdi69ZSpGRuUxuN4BPJ1Pk+RmqmWkZee18FoOPoSDpeCFszndIHc5oGfRNTpNIPdhFJCOy-Z8QtgMAAa1T7HH5UnKmpCCXEle72sgW5elMzQ3Zot0Zcxuj-HQ+iPEM9V7M8UWjIgIAAN0wFAmHvR9KRfad+gaKwDDtJdgWdawN0BZdej3NkJAZAioPFHtwxleD5UQlC0PvDNDRxPgczzItS0rGt62bNtO2PMNT2YqNWOQ1D0JQKBMOfB5QCeAwbGMTozHtIVAhsAJXDdEYA0mZdmgkCygh0-QrHolUT2lZEZL4AAhZgb2yDyMJNCkVItNTEHCG0HB08ZWhMSwzE5AjNIsmwLLGP8+jMEwdHs0MNik5yB3cphPKwfKMIMUoJ0qbDAoQboXisCQ9A6RkPlBADjJdPh7VShLrASiwhSiZYUHwCA4DUCSsqc-t9lNcrVI0bRLA-AiFyCOZ6TaTktD6Ai+Dtb0XU6T47OWMbYOkgclQYlQNS1MBpvNV9dCZPgJEZZp+isaYGSCDbdxtN6LHaKxDAIiwbAymCmJyi9Y3jRMU0Uu6p0q3QPuMX0rPqdoGV+VqGnBRkPu6fprOacHGOyyboyvW9U0Riq5qqj8mR0j5TAFFkvE5AYgRSt6DKSmiAjJxy+3PBC5I4hG-JmgKGaFIxLH0CwBmtcEuc0gMif5rxkqF47oPJiaxflPKCu8qWyvu6cDr4Nppg+SEujtzlDB5z56T0AN9D6cZRWDS7JKNli+AAMTYXBYGoSA6dm2pHA-T2uicAZ+hmGxOWmPH6WcdpZz6EVSf6oA */
  createMachine({
    types: {
      context: {} as AlgorithmContext,
      events: {} as
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
          },
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
        entry: ['initGeneration', 'visitStartCell', 'pushToStack'],
        after: {
          SEEK_INTERVAL: {
            guard: 'playing is allowed',
            target: 'Seeking',
          },
        },
      },
      Seeking: {
        entry: [
          'findNeighbors',
          sendParent(({ context }) => ({
            type: 'display.update',
            data: {
              cursorPosition: {
                columnIndex: context.currentCell?.getColumnIndex(),
                rowIndex: context.currentCell?.getRowIndex(),
                maxColumnIndex: (context.grid as IGrid)?.getColumns() - 1,
                maxRowIndex: (context.grid as IGrid).getRows() - 1,
              },
            },
          })),
        ],
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
        entry: sendParent({ type: 'generation.finish' }),
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
      initGeneration: assign({
        currentCell: ({ context }) => (context.grid as IGrid).getStartCell(),
      }),
      visitStartCell: ({ context }) => {
        const currentCell = (context.grid as IGrid).getStartCell();
        return currentCell.visit(null, context.pathId);
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      play: assign({ canPlay: true }),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      pause: assign({ canPlay: false }),
      findNeighbors: assign({
        eligibleNeighbors: ({ context }) => {
          const { grid, currentCell } = context;
          return (grid as IGrid).getEligibleNeighbors(currentCell as ICell);
        },
      }),
      pickNextCell: assign(
        ({ context: { grid, pathId, startIndex, currentCell } }) => {
          const verifiedGrid = grid as IGrid;
          return {
            currentCell: seek({
              grid: verifiedGrid,
              pathId,
              current: currentCell as ICell,
              startIndex,
            }),
          };
        }
      ),
      pushToStack: assign(({ context: { stack, currentCell } }) => {
        if (currentCell) {
          stack.push(currentCell);
        }
        return { stack };
      }),
      popFromStack: assign(({ context: { stack } }) => {
        const prevCell = stack.pop() as ICell;
        prevCell?.setAsBacktrack();
        return { stack, currentCell: prevCell };
      }),
    },
    delays: {
      SEEK_INTERVAL: ({ context: { fps } }) => 1000 / fps,
    },
  });
