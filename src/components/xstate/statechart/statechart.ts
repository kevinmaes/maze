import { createMachine, interpret, assign } from 'xstate';
import { inspect } from '@xstate/inspect';
import type {
  MazeGenerationContext,
  MazeGenerationEvent,
  Typestate,
} from './types';

import Grid from '../generation/Grid';
import type { GridMethods } from '../generation/Grid';

import { seek } from '../generation/seek';
import { Cell, CellMethods } from '../generation/Cell';

inspect({
  url: 'https://statecharts.io/inspect',
  iframe: false,
  // iframe: () => document.querySelector("iframe[data-xstate]")
});

export const machine = createMachine<
  MazeGenerationContext,
  MazeGenerationEvent,
  Typestate
>(
  {
    id: 'maze-generation',
    strict: false,
    initial: 'start',
    context: {
      settings: {
        gridColumns: 3,
        gridRows: 3,
        startIndex: 0,
        pathId: 'abc',
      },
      grid: undefined,
      currentCell: undefined,
      unvisitedNeighbors: [],
      stack: [],
    },
    states: {
      start: {
        entry: [
          () => {
            console.log('------------ START -------------');
          },
          'initGrid',
          // 'pickStartCell',
          'pushToStack',
        ],
        after: {
          SEEK_INTERVAL: { target: 'seek' },
        },
      },
      seek: {
        // entry: ['findNeighbors'],
        entry: [
          assign(({ grid, currentCell }) => ({
            unvisitedNeighbors: (grid as GridMethods).getUnvisitedNeighbors(
              currentCell
            ),
          })),
        ],
        always: [{ target: 'advance' }],
      },
      advance: {
        always: [{ target: 'backtrack', cond: 'isDeadEnd' }],
        entry: ['pickNextCell', 'pushToStack'],
        after: {
          SEEK_INTERVAL: { target: 'seek' },
        },
      },
      backtrack: {
        entry: ['popFromStack'],
        always: [
          {
            target: 'complete',
            cond: 'isBackAtStart',
          },
          {
            target: 'seek',
          },
        ],
      },
      complete: {
        on: {
          RESTART: 'start',
        },
      },
    },
  },
  {
    guards: {
      isDeadEnd: ({ unvisitedNeighbors }) => {
        return unvisitedNeighbors.length === 0;
      },
      isBackAtStart: ({ stack }) => {
        return stack.length === 0;
      },
    },
    actions: {
      // createGrid: assign(
      //   ({ settings: { gridColumns, gridRows, startIndex } }) => ({
      //     grid: new Grid({
      //       cols: gridColumns,
      //       rows: gridRows,
      //       startIndex: startIndex,
      //     }),
      //   })
      // ),
      // pickStartCell: assign(({ grid }) => ({
      //   currentCell: grid.getStartCell(),
      // })),

      initGrid: assign(
        ({ settings: { gridColumns, gridRows, startIndex } }) => {
          const grid = new Grid({
            cols: gridColumns,
            rows: gridRows,
            startIndex: startIndex,
          });

          return {
            grid,
            currentCell: grid.getStartCell(),
          };
        }
      ),

      // pickStartCell: assign(({ grid }, event) => {
      //   // if (event.type !== 'RESTART') {
      //   //   return;
      //   // }
      //   return {
      //     currentCell: grid?.getStartCell(),
      //   };
      // }),
      // findNeighbors: assign(({ grid, currentCell }) => ({
      //   unvisitedNeighbors: grid.getUnvisitedNeighbors(currentCell),
      // })),
      pickNextCell: assign(({ settings, grid, currentCell }) => ({
        currentCell: seek({
          grid,
          pathId: settings.pathId,
          current: currentCell as Cell,
          startIndex: 0,
        }),
      })),
      pushToStack: assign(({ stack, currentCell }) => {
        if (currentCell) {
          stack.push(currentCell);
        }
        return { stack };
      }),
      popFromStack: assign(({ stack }) => {
        const prevCell = stack.pop() as CellMethods;
        prevCell?.setAsBacktrack();
        console.log(`  (backtrack to cell index: ${prevCell?.getIndex()})`);
        return { stack, currentCell: prevCell };
      }),
    },
    delays: {
      SEEK_INTERVAL: 100,
    },
  }
);

// const service = interpret(machine, { devTools: true }).onTransition((state) => {
//   console.log(
//     `state: ${state.value}, cell index: ${state.context.currentCell.index}`
//   );
// });

// service.start();

// // Listen for restart.
// document.getElementById('restart').addEventListener('click', () => {
//   service.send('RESTART');
// });
