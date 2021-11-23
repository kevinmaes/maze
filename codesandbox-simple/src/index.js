import { createMachine, interpret, assign } from 'xstate';
import { inspect } from '@xstate/inspect';

import Grid from './Grid';

inspect({
  url: 'https://statecharts.io/inspect',
  iframe: false,
  // iframe: () => document.querySelector("iframe[data-xstate]")
});

export const machine = createMachine(
  {
    id: 'maze-generation-recursive-backtracker',
    initial: 'start',
    context: {
      settings: {
        gridColumns: 2,
        gridRows: 2,
        startIndex: 0,
      },
      grid: null,
      currentCell: null,
      unvisitedNeighbors: [],
      stack: [],
    },
    states: {
      start: {
        entry: [
          () => {
            console.log('------------ START -------------');
          },
          'createGrid',
          'pickStartCell',
          'pushToStack',
        ],
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

      pickNextCell: assign(({ grid, currentCell }) => {
        const next = grid.pickNeighbor(currentCell);

        // If next cell is found, mark it as visited.
        if (next) {
          next.visit();
        }

        return { currentCell: next };
      }),
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
      SEEK_INTERVAL: 1,
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
  service.send('RESTART');
});
