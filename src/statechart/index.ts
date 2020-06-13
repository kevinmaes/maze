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
        on: {
          NEXT: [
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
        return false;
      },
    },
  }
);
