import { createMachine, assign, sendParent } from 'xstate';

import type { IGrid } from '../components/generation/Grid';

import { seek } from '../components/generation/seek';
import { ICell } from '../components/generation/Cell';
import { Ref } from 'react';
import Grid from '../components/generation/Grid';

interface Context {
  canPlay: boolean;
  currentCell: ICell | undefined;
  eligibleNeighbors: ICell[];
  fps: number;
  grid: IGrid | undefined;
  pathId: string;
  stack: ICell[];
  startIndex: number;
}

export const generationAlgorithmMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QwHZgE4EMAuBLA9igIIA2U+6u2AFgLYCymAxtbmgHS2YBeYAtLggkwAYgDKAFSIAlCYlAAHfLCoEU8kAA9EfABwBOACzsAjAGZDANgCsABjsAmQ7cNmANCACeOy2ZOmzfQsTa2tDAHYghwBfaI9UDBw1UnJKGgZmVg5YbEx0bBFNHJwwdkwAM2wMAAoxAFE6gGkAfQBJADkJOukANSIAGQBKEQSsPEIUiio6RhY2UuL8jSUVcfUkLR1DXV12azNIh3NrIxNDBw9vBD5LX3ZdBwencMMQ80NY+LA0MeSyKfSsyyCzAYAA1iJlspVIQNNoEPp9OwHA5rA5wuELK5DK5Lj5znsHJYTPoMQ4zLYKTE4iBRkkJv80jNMvMyhAAG6YFBMURQ1ZqOGIV4OdiWXQRckPMyBIKGPHXawmfy2cKWcIqsyhHHhayfWnfRJrSZMjJzDiYDlcnmFYpVMqVGr1JptTrdPpDEYG34M1LTU3Atmc7lgPkw9ageGudi2W5o6wYkyWFWGfTyvTbZE7VFinVnHF6ulGxl+oGsgBGzDB2CwTAhobWguuZyR8Z1KYsllcZhRaZxxh1isxYrMOf2Ba99OIxcBLLQIg6ACk6gBhCTNaR1ABiYnrAo28L4JhjIsM+xx1ks+nJVl0aZe1mRJjJIRRz3045+k+NJdnogACv0RAAJq7rC+46CiZj3OYtxPmiZi6Lct5eDouhhNGSokjq4RocSugfoafy+jOZr-kQACq9SgeGmzXKiuxhA4iK2PoiGBFY4RpuSIqauirwkrogSJh8NKFkRALMqR4hdH+zSbgA8tIADqMgACLUY2h5EqYdj6JSOG2LYT4hGmgnGIOOyXn4T6vLENIoPgEBwBoYk+hJ-qslwvACEIIYbCsYaaUeOKiicfgvGcoT2Gmvgnji6JPoZETEgR3pTsRkkBos2AaeB1yqg+thOGhRJXk4RUxaxoqUvs+w2PolhMalX7TplrKwKCYK5RGEEOLYyLSmiTgdpiCF3oZ7BREm+whJqzVFhlHnmpawbdbR5L9dsrbxoZjUHBcKHXJe-iIoiI47GhViWPN4kmqWHAVrW1aVmt8LmP44RHvo1g7DV5zSmmio8bY4qIUZpw-Tdbl3b+7BMPgtAKMIVSvYgOx7NsRgYuKFgg5xh18IEUHMectzbImRVQ+l7n3X5ijQg2eWHiDljsKeWIXleHbIVcfBBOEk0PGcgTokYdnREAA */
  createMachine({
    tsTypes: {} as import('./recursiveBacktrackerMachine.typegen').Typegen0,
    schema: {
      context: {} as Context,
      events: {} as
        | {
            type: 'INJECT_REFS';
            gridRef: Ref<IGrid>;
          }
        | {
            type: 'START';
          }
        | {
            type: 'PLAY';
          }
        | {
            type: 'PAUSE';
          }
        | {
            type: 'STEP_FORWARD';
          }
        | {
            type: 'UPDATE';
          }
        | {
            type: 'DONE';
          },
    },
    id: 'generationAlgorithmMachine',
    initial: 'maze-idle',
    states: {
      'maze-idle': {
        on: {
          START: {
            target: 'starting',
          },
        },
      },
      starting: {
        entry: ['initGeneration', 'visitStartCell', 'pushToStack'],
        after: {
          SEEK_INTERVAL: {
            cond: 'canIPlay',
            target: 'seeking',
          },
        },
      },
      seeking: {
        entry: [
          'findNeighbors',
          sendParent((ctx: Context) => ({
            type: 'UPDATE',
            data: {
              cursorPosition: {
                columnIndex: ctx.currentCell?.getColumnIndex(),
                rowIndex: ctx.currentCell?.getRowIndex(),
                maxColumnIndex: (ctx.grid as Grid)?.getColumns() - 1,
                maxRowIndex: (ctx.grid as Grid).getRows() - 1,
              },
            },
          })),
        ],
        always: {
          target: 'advancing',
        },
      },
      advancing: {
        entry: ['pickNextCell', 'pushToStack'],
        after: {
          SEEK_INTERVAL: {
            cond: 'canIPlay',
            target: 'seeking',
          },
        },
        always: {
          cond: 'isDeadEnd',
          target: 'backtracking',
        },
      },
      backtracking: {
        entry: 'popFromStack',
        always: [
          {
            cond: 'isBackAtStart',
            target: 'finished',
          },
          {
            target: 'seeking',
          },
        ],
      },
      finished: {
        entry: sendParent('DONE'),
      },
    },
    on: {
      INJECT_REFS: {
        target: '.maze-idle',
      },
      PLAY: {
        actions: 'play',
        target: '.seeking',
      },
      PAUSE: {
        actions: 'pause',
      },
      STEP_FORWARD: {
        target: '.seeking',
      },
    },
  }).withConfig({
    guards: {
      canIPlay: (ctx) => ctx.canPlay,
      isDeadEnd: ({ eligibleNeighbors }) => eligibleNeighbors.length === 0,
      isBackAtStart: ({ stack }) => stack.length === 0,
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
  });

// const service = interpret(generationAlgorithmMachine).onTransition((state) => {
//   console.log('recursiveBacktrackerMachine:', state.value);
// });

// service.start();
