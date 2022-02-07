import { createMachine, assign } from 'xstate';
import type {
  MazeGenerationContext,
  MazeGenerationEvent,
  Typestate,
  ICell,
} from './types';

import type { GridMethods } from '../components/generation/Grid';

import { seek } from '../components/generation/seek';
import { Cell } from '../components/generation/Cell';

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
      eligibleNeighbors: [],
      stack: [],
    },
    on: {
      INJECT_REFS: { target: 'start' },
    },
    states: {
      idle: {},
      start: {
        entry: [
          () => {
            console.log('------------ START -------------');
          },
          'initGeneration',
          'pushToStack',
        ],
        // after: {
        //   SEEK_INTERVAL: { target: 'seek' },
        // },
      },
      seek: {
        entry: ['findNeighbors'],
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
      isDeadEnd: ({ eligibleNeighbors }) => {
        return eligibleNeighbors.length === 0;
      },
      isBackAtStart: ({ stack }) => {
        return stack.length === 0;
      },
    },
    actions: {
      initGeneration: assign(({ settings }, { gridRef, fps }: any) => {
        const newSettings = {
          ...settings,
          gridColumns: gridRef.current.cols,
          gridRows: gridRef.current.rows,
          fps,
        };
        const currentCell = gridRef.current.getStartCell();

        return {
          settings: newSettings,
          grid: gridRef.current,
          currentCell,
          stack: [],
        };
      }),
      findNeighbors: assign(({ grid, currentCell }) => ({
        eligibleNeighbors: (grid as GridMethods).getEligibleNeighbors(
          currentCell
        ),
      })),
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
        const prevCell = stack.pop() as ICell;
        prevCell?.setAsBacktrack();
        // console.log(`  (backtrack to cell index: ${prevCell?.getIndex()})`);
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
