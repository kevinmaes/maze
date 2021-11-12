import { Machine, interpret, assign } from 'xstate';
import { inspect } from '@xstate/inspect';

import Grid from './Grid';
import { seek } from './seek';

inspect({
  url: 'https://statecharts.io/inspect',
  iframe: false,
  // iframe: () => document.querySelector("iframe[data-xstate]")
});

export const machine = Machine(
  {
    id: 'maze-generation',
    initial: 'start',
    context: {
      settings: {
        gridColumns: 3,
        gridRows: 3,
        startIndex: 0,
        pathId: 'abc',
      },
      grid: null,
      currentCell: null,
      unvisitedNeighbors: [],
      stack: [],
    },
    states: {
      start: {
        entry: ['createGrid', 'pickStartCell', 'pushToStack'],
        after: {
          SEEK_INTERVAL: { target: 'seek' },
        },
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
      isDeadEnd: ({ unvisitedNeighbors }) => {
        return unvisitedNeighbors.length === 0;
      },
      isBackAtStart: ({ stack }) => {
        return stack.length === 0;
      },
    },
    actions: {
      createGrid: assign(
        ({ settings: { gridColumns, gridRows, startIndex } }) => ({
          grid: new Grid({
            cols: gridColumns,
            rows: gridRows,
            startIndex: startIndex,
          }),
        })
      ),
      pickStartCell: assign(({ grid }) => ({
        currentCell: grid.getStartCell(),
      })),
      findNeighbors: assign(({ grid, currentCell }) => ({
        unvisitedNeighbors: grid.getUnvisitedNeighbors(currentCell),
      })),
      pickNextCell: assign(({ settings, grid, currentCell }) => ({
        currentCell: seek({
          grid,
          pathId: settings.pathId,
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
        console.log(`  (backtrack to cell index: ${prevCell.index})`);
        return { stack, currentCell: prevCell };
      }),
    },
    delays: {
      SEEK_INTERVAL: 100,
    },
  }
);

const service = interpret(machine, { devTools: true }).onTransition((state) => {
  console.log(
    `state: ${state.value}, cell index: ${state.context.currentCell.index}`
  );
});

service.start();

// Listen for restart.
document.getElementById('restart').addEventListener('click', () => {
  console.log('-------------------------');
  service.send('RESTART');
});
