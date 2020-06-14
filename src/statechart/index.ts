import { Machine } from 'xstate';

// const grid = new Grid();
// const startCell = grid.start();

export const machine = Machine(
  {
    id: 'maze-generation',
    initial: 'initializing',
    context: {
      // grid,
      // currentCell: startCell,
      stack: [],
    },
    states: {
      initializing: {
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
      pushToStack: (ctx, event) => {
        console.log('pushToStack', event);
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
        return 2000;
      },
    },
  }
);
