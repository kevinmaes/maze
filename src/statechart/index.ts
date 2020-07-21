import { Machine, assign } from 'xstate';
import Grid from '../generation/Grid';
// const grid = new Grid();
// const startCell = grid.start();

export const machine = Machine(
  {
    id: 'maze-generation',
    initial: 'initializing',
    context: {
      // canvas: null,
      settings: {
        gridColumns: 5,
        gridRows: 5,
      },
      grid: null,
      // currentCell: startCell,
      stack: [],
    },
    states: {
      initializing: {
        // onEntry: ['createCanvas']
        onEntry: ['createGrid'],
        on: {
          START: 'seeking',
        },
      },
      seeking: {
        onEntry: ['pushToStack', 'getNeighboringCells', 'pickNextCell'],
        after: {
          SEEK_INTERVAL: [
            {
              cond: 'isDeadEnd',
              target: 'backtracking',
            },
            { target: 'seeking' },
          ],
        },
      },
      backtracking: {
        onEntry: ['popFromStack'],
        on: {
          '': [
            {
              cond: 'isAtStart',
              target: 'complete',
            },
            {
              target: 'seeking',
            },
          ],
        },
      },
      complete: {},
    },
  },
  {
    guards: {
      isDeadEnd: (ctx) => {
        console.log('isDeadEnd');
        return false;
      },
      isAtStart: (ctx) => {
        console.log('isAtStart');
        return false;
      },
    },
    actions: {
      createGrid: (ctx, event) => {
        console.log('createGrid fn');
        return assign({
          grid: ({ settings: { gridColumns, gridRows } }) =>
            new Grid({ cols: gridColumns, rows: gridRows }),
        });
      },
      pushToStack: (ctx, event) => {
        console.log('pushToStack', ctx, event);
      },
      popFromStack: (ctx, event) => {
        console.log('popFromStack', event);
      },
      getNeighboringCells: (ctx, event) => {
        console.log('getNeighboringCells', event);
      },
      pickNextCell: (ctx, event) => {
        console.log('pickNextCell', event);
      },
    },
    delays: {
      SEEK_INTERVAL: (ctx) => {
        return 10000;
      },
    },
  }
);
