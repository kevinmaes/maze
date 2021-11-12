import { Machine, interpret, assign } from 'xstate';
import { inspect } from '@xstate/inspect';

import Grid from './Grid';
import { seek } from './seek';

inspect({
  url: 'https://statecharts.io/inspect',
  iframe: false,
});

export const machine = Machine(
  {
    id: 'maze-generation',
    initial: 'idle',
    context: {
      settings: {
        gridColumns: 4,
        gridRows: 4,
        startIndex: 0,
      },
      grid: null,
      currentCell: null,
      unvisitedNeighbors: [],
      stack: [],
    },
    states: {
      idle: {
        entry: ['createGrid', 'pickStartCell', 'pushToStack'],
        after: {
          SEEK_INTERVAL: { target: 'seeking' },
        },
      },
      seeking: {
        entry: ['findNeighbors'],
        always: [{ target: 'advancing' }],
      },
      advancing: {
        always: [{ target: 'backtracking', cond: 'isDeadEnd' }],
        entry: ['pickNextCell', 'pushToStack'],
        after: {
          SEEK_INTERVAL: { target: 'seeking' },
        },
      },
      backtracking: {
        entry: ['popFromStack'],
        always: [
          {
            target: 'complete',
            cond: 'isBackAtStart',
          },
          {
            target: 'seeking',
          },
        ],
      },
      complete: {},
    },
  },
  {
    guards: {
      isDeadEnd: ({ unvisitedNeighbors }) => {
        return unvisitedNeighbors.length === 0;
      },
      isBackAtStart: (ctx) => {
        return ctx.stack.length === 0;
      },
    },
    actions: {
      createGrid: assign(({ settings }) => ({
        grid: new Grid({
          cols: settings.gridColumns,
          rows: settings.gridRows,
          startIndex: settings.startIndex,
        }),
      })),
      pickStartCell: assign(({ grid }) => ({
        currentCell: grid.getStartCell(),
      })),
      findNeighbors: assign(({ grid, currentCell }) => ({
        unvisitedNeighbors: grid.getUnvisitedNeighbors(currentCell),
      })),
      pickNextCell: assign(({ grid, currentCell }) => ({
        currentCell: seek({
          grid,
          pathId: 'a',
          current: currentCell,
          startIndex: 0,
        }),
      })),
      pushToStack: assign(({ stack, currentCell }) => {
        if (currentCell) {
          stack.push(currentCell);
        }
        return stack;
      }),
      popFromStack: assign(({ stack }) => {
        const prevCell = stack.pop();
        prevCell.backtrack = true;
        console.log(`  (backtracking to cell index: ${prevCell.index})`);
        return { stack, currentCell: prevCell };
      }),
    },
    delays: {
      SEEK_INTERVAL: (ctx) => {
        return 1;
      },
    },
  }
);

const service = interpret(machine, { devTools: true }).onTransition((state) => {
  console.log(
    `state: ${state.value}, cell index: ${state.context.currentCell.index}`
  );
});

service.start();
