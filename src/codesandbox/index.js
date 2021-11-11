import { Machine, interpret, assign } from 'xstate';
import Grid from './Grid';
import { seek } from './seek';
// const startCell = grid.start();

const settings = {
  gridColumns: 5,
  gridRows: 5,
  startIndex: 0,
};

// const SEEK_INTERVAL = 5000;

// const grid = new Grid({
//   cols: settings.gridColumns,
//   rows: settings.gridRows,
//   startIndex: settings.startIndex
// });
// const startCell = grid.getStartCell();

// console.log({ grid });

console.log('starting');

export const machine = Machine(
  {
    id: 'maze-generation',
    initial: 'idle',
    context: {
      // canvas: null,
      settings,
      grid: null,
      currentCell: null,
      stack: [],
    },
    states: {
      idle: {
        entry: ['createGrid', 'pickStartCell'],
        // entry: ["createGrid"],
        on: {
          START: { target: 'seeking', action: 'createGrid' },
        },
      },
      seeking: {
        // entry: ["pushToStack", "getNeighboringCells", "pickNextCell"]
        entry: ['pickNextCell', 'pushToStack'],
        on: {
          SEEK_NEXT: { target: 'seeking' },
        },
        exit: ['afterSeek'],
      },
      backtracking: {
        entry: ['popFromStack'],
        always: [
          {
            target: 'complete',
            cond: 'isAtStart',
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
      createGrid: assign({
        grid: (ctx, event) => {
          const grid = new Grid({
            cols: settings.gridColumns,
            rows: settings.gridRows,
            startIndex: settings.startIndex,
          });

          return grid;
        },
      }),
      pickStartCell: assign({
        currentCell: ({ grid }) => {
          return grid.getStartCell();
        },
      }),
      pickNextCell: assign({
        currentCell: ({ stack, grid, currentCell }) => {
          console.log('action pickNextCell', currentCell);
          const current = seek({
            grid,
            pathId: 'a',
            current: currentCell,
            startIndex: 0,
            stack,
          });

          console.log('pickNextCell current', current);

          return current;
        },
      }),
      pushToStack: assign({
        stack: ({ stack, grid, currentCell }) => {
          if (currentCell) {
            stack.push(currentCell);
          }

          console.log('action pushToStack', stack.length);
          return stack;
        },
      }),
      popFromStack: (ctx, event) => {
        console.log('popFromStack', event);
      },
      afterSeek: (ctx, event) => {
        console.log('afterSeek', ctx);
      },
    },
    delays: {
      // SEEK_INTERVAL: ctx => {
      //   return 60000;
      // }
    },
  }
);

const service = interpret(machine).onTransition((state) => {
  console.log('state', state.value);
});

service.start();

service.send('START');
setTimeout(() => {
  service.send('SEEK_NEXT');
}, 3000);

// console.log("initialState", machine.initialState, machine.context);
// const s1 = machine.transition("idle", "START");
// console.log("s1", s1.value, s1.context);
