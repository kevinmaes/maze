import { createMachine, interpret, assign } from 'xstate';
import type {
  MazeGenerationContext,
  MazeGenerationEvent,
  Typestate,
} from './types';

import Grid from '../generation/Grid';
import type { GridMethods } from '../generation/Grid';

import { seek } from '../generation/seek';
import { Cell, CellMethods } from '../generation/Cell';

export const machine = createMachine<
  MazeGenerationContext,
  MazeGenerationEvent,
  Typestate
>(
  {
    id: 'maze-generation',
    strict: false,
    initial: 'idle',
    context: {
      settings: {
        gridColumns: 0,
        gridRows: 0,
        startIndex: 0,
        pathId: 'abc',
        fps: 3,
      },
      grid: undefined,
      currentCell: undefined,
      unvisitedNeighbors: [],
      stack: [],
    },
    states: {
      idle: {
        on: {
          INJECT_REFS: { target: 'start' },
        },
      },
      start: {
        entry: [
          () => {
            console.log('------------ START -------------');
          },
          'initGeneration',
          'pushToStack',
        ],
        after: {
          SEEK_INTERVAL: { target: 'seek' },
        },
      },
      seek: {
        // entry: ['findNeighbors'],
        entry: [
          assign(({ grid, currentCell }) => {
            // console.log('finding neighbors');
            const unvisitedNeighbors = (
              grid as GridMethods
            ).getUnvisitedNeighbors(currentCell);
            // console.log('unvisited', unvisitedNeighbors);
            return { unvisitedNeighbors };
            // return {
            //   unvisitedNeighbors: (grid as GridMethods).getUnvisitedNeighbors(
            //     currentCell
            //   ),
            // };
          }),
        ],
        always: [{ target: 'advance' }],
      },
      advance: {
        always: [{ target: 'backtrack', cond: 'isDeadEnd' }],
        entry: ['pickNextCell', 'pushToStack'],
        after: {
          // 1000: { target: 'seek' },
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
      initGeneration: assign(({ settings }, { gridRef, fps }: any) => {
        // console.log('initGeneration fps', fps);
        const newSettings = {
          ...settings,
          gridColumns: gridRef.current.cols,
          gridRows: gridRef.current.rows,
          fps,
        };
        const currentCell = gridRef.current.getStartCell();
        // console.log('currentCell (start)', currentCell);

        return {
          settings: newSettings,
          grid: gridRef.current,
          currentCell,
        };
      }),

      //     return {
      //       grid: gridRef.current,
      //       currentCell: gridRef.current.getStartCell(),
      //     };
      //   }
      // ),

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
        // console.log('action: pushToStack', currentCell);
        if (currentCell) {
          stack.push(currentCell);
        }
        // console.log('stack length', stack.length);
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
      SEEK_INTERVAL: ({ settings: { fps } }) => {
        return 1000 / fps;
      },
    },
  }
);

const service = interpret(machine).onTransition((state) => {
  const currentCell = state.context.currentCell as CellMethods;
  console.log(`state: ${state.value}, cell index: ${currentCell.getIndex()}`);
});

// service.start();

// // Listen for restart.
// document.getElementById('restart').addEventListener('click', () => {
//   service.send('RESTART');
// });
