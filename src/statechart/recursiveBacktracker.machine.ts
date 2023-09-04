import { createMachine, assign, sendParent } from 'xstate';

import type { IGrid } from '../components/generation/Grid';

import { seek } from '../components/generation/seek';
import { ICell } from '../components/generation/Cell';
import { Ref } from 'react';

export const generationAlgorithmMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QwHZgE4EMAuBLA9igIIA2U+6u2AFgLYCymAxtbmgMTpgBmsAdGwBWYJtgDaABgC6iUAAd8sKgRSyQAD0QBaACwBWAIx8DEgwHY9OgJwAOCRJtmJOgDQgAntoBMXq8as6OubWTs42egC+EW6oGDgqpOSUNAzMrBxMhNjo+CT8ciSY7pIySCAKSniEapoIBnp8el4AbFZWZjY6Zs06zQDM4W6eCFoGXjp8jl42A3rtc4aR0SCxWFXEZBRUdIwsbGDsmSjZufmYAK6wYCVqFcrVZbUtXpM6NjYGAwMmVkOIgWY+H19DZxsCBmZAlEYmA0GsEptkjs0vtDlkcnk+LBsGA5HxuBQAO6YdAQG5lO7rGqIVqTMx9KzNRx6GZ9Hp6P4jAyMxo6MJBWw6Fp6JYwuHxQiJLYpXbpMB8ADisLi6wABABJCAkA6rCUoLHYEniaS3RT3VSPbRdPqNZpmLz1Lr6B0cjzafqNcbTfrNcYmPps6ErZXwyWI7apPZoPjqlDKTAkXAALzYUHY6mxOHlmG4OPQAAoAMoAUWLAGkAPrqgByABViwAlABqRAAMgBKdi69ZSpGRuUxuN4BPJ1Pk+RmqmWkZee18FoOPoSDpeCFszndIHc5oGfRNTpNIPdhFJCOy-Z8QtgMAAa1T7HH5UnKmpCCXEle72sgW5elMzQ3Zot0Zcxuj-HQ+iPEM9V7M8UWjIgIAAN0wFAmHvR9KRfad+gaKwDDtJdgWdawN0BZdej3NkJAZAioPFHtwxleD5UQlC0PvDNDRxPgczzItS0rGt62bNtO2PMNT2YqNWOQ1D0JQKBMOfB5QCeAwbGMTozHtIVAhsAJXDdEYA0mZdmgkCygh0-QrHolUT2lZEZL4AAhZgb2yDyMJNCkVItNTEHCG0HB08ZWhMSwzE5AjNIsmwLLGP8+jMEwdHs0MNik5yB3cphPKwfKMIMUoJ0qbDAoQboXisCQ9A6RkPlBADjJdPh7VShLrASiwhSiZYUHwCA4DUCSsqc-t9lNcrVI0bRLA-AiFyCOZ6TaTktD6Ai+Dtb0XU6T47OWMbYOkgclQYlQNS1MBpvNV9dCZPgJEZZp+isaYGSCDbdxtN6LHaKxDAIiwbAymCmJyi9Y3jRMU0Uu6p0q3QPuMX0rPqdoGV+VqGnBRkPu6fprOacHGOyyboyvW9U0Riq5qqj8mR0j5TAFFkvE5AYgRSt6DKSmiAjJxy+3PBC5I4hG-JmgKGaFIxLH0CwBmtcEuc0gMif5rxkqF47oPJiaxflPKCu8qWyvu6cDr4Nppg+SEujtzlDB5z56T0AN9D6cZRWDS7JKNli+AAMTYXBYGoSA6dm2pHA-T2uicAZ+hmGxOWmPH6WcdpZz6EVSf6oA */
  createMachine(
    {
      tsTypes: {} as import('./recursiveBacktracker.machine.typegen').Typegen0,
      schema: {
        context: {} as {
          canPlay: boolean;
          currentCell: ICell | undefined;
          eligibleNeighbors: ICell[];
          fps: number;
          grid: IGrid | undefined;
          pathId: string;
          stack: ICell[];
          startIndex: number;
        },
        events: {} as
          | {
              type: 'refs.inject';
              params: { gridRef: Ref<IGrid> };
            }
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
      initial: 'Generation Idle',
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
              cond: 'playing is allowed',
              target: 'Seeking',
            },
          },
        },
        Seeking: {
          entry: ['findNeighbors', sendParent({ type: 'display.update' })],
          always: {
            target: 'Advancing',
          },
        },
        Advancing: {
          entry: ['pickNextCell', 'pushToStack'],
          after: {
            SEEK_INTERVAL: {
              cond: 'playing is allowed',
              target: 'Seeking',
            },
          },
          always: {
            cond: 'reached a dead end',
            target: 'Backtracking',
          },
        },
        Backtracking: {
          entry: 'popFromStack',
          always: [
            {
              cond: 'back at the start',
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
      on: {
        'refs.inject': {
          target: '.Generation Idle',
        },
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
    },
    {
      guards: {
        'playing is allowed': (ctx) => ctx.canPlay,
        'reached a dead end': ({ eligibleNeighbors }) =>
          eligibleNeighbors.length === 0,
        'back at the start': ({ stack }) => stack.length === 0,
      },
      actions: {
        initGeneration: assign({
          currentCell: (ctx) => (ctx.grid as IGrid).getStartCell(),
        }),
        visitStartCell: (ctx) => {
          const currentCell = (ctx.grid as IGrid).getStartCell();
          return currentCell.visit(null, ctx.pathId);
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        play: assign({ canPlay: (_) => true }),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        pause: assign({ canPlay: (_) => false }),
        findNeighbors: assign({
          eligibleNeighbors: ({ grid, currentCell }) =>
            (grid as IGrid).getEligibleNeighbors(currentCell as ICell),
        }),
        pickNextCell: assign(({ grid, pathId, startIndex, currentCell }) => {
          const verifiedGrid = grid as IGrid;
          return {
            currentCell: seek({
              grid: verifiedGrid,
              pathId,
              current: currentCell as ICell,
              startIndex,
            }),
          };
        }),
        pushToStack: assign(({ stack, currentCell }) => {
          if (currentCell) {
            stack.push(currentCell);
          }
          return { stack };
        }),
        popFromStack: assign(({ stack }) => {
          const prevCell = stack.pop() as ICell;
          prevCell?.setAsBacktrack();
          return { stack, currentCell: prevCell };
        }),
      },
      delays: {
        SEEK_INTERVAL: ({ fps }) => 1000 / fps,
      },
    }
  );

// const service = interpret(generationAlgorithmMachine).subscribe((state) => {
//   console.log('recursiveBacktrackerMachine:', state.value);
// });

// service.start();
