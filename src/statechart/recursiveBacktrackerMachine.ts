import { createMachine, assign, sendParent } from 'xstate';

import type { IGrid } from '../components/generation/Grid';

import { seek } from '../components/generation/seek';
import { ICell } from '../components/generation/Cell';
import { Ref } from 'react';

export const generationAlgorithmMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QFsCGAvMBaGA7MATqgC4CWA9rgHSzGoHEDEAHrSWFagGbGFUDKAUUEBpAPoBJAHIAVQQCUAagEEAMolAAHcrFJlKGkM0QA2ACwmqARgAMADgDMdgEwBWG1bNWrJgDQgAT0QsBwBOOyo7M2dQr2dzBw8TAF9k-zRMHDB8In1qWDAwAGtGQ21dPMNjBDMHVyobJytXUNCfVwB2GI7-IIQsGIcqZ2c7Oy6TZzMbMzsbV1T0jGw8QhIKalQIADdUXABjMFKkEHK9DargjtmqaJGO1zNrq0TQ3sRQqlcTNucbUIc3lirUWIAyK2yazynB2e0OLDYvE4PD4QlEklkChU6hOZ0qJ2qVgBVBMdlCzm811GoVco3e-ReHSoHVCpP+JhMVgpzQ6oPBWRy60oVAARqh9kViEQJcctDpzgYCcFvMMHqEOg4zG0oh0OiZXPTmvUHLqXPYHM4wqEZnzlgKoRsqPtyMhNAAbMC8RjyQT8GTKeQyMry-GgarW251TyjGZWcb6+m0hrki0xGymhyTBZpMF21a5DaMaQAKUEAGEZGIfQAxfjBioXJX9PX1OMdZoWRwPWn0qY2EkWTkcqzPTopUG4cgQOCGfn5oXUUgQD31hW4S7NqbMmwmdk2EYzaL0gb6qjhIHXTkW6YOW2ZefQtgMVehozBMJmBquOMteYsurOMe0TGnYP6PLS8RhHeEKCo+hRFC+jZhogLSfNcryZiYmodHYBqBMqjS3L80zuFSP7QfaBbClsuwHGAiGKshDKnpaWrOO2Pzfl0djHrqVBOLM9xmFqszZks96QlR1BihKUrighuIhkhb79GE9SzI0nItC0tQPL2tTDOadgcrUXjmLyOZzpJC5Oi67qevRikNoxKnTJ+jz7hybjst+vb-JE9jRi0cZeWYFEPspeLKdUWA4Z8bYdqSJquD2+H9N+-ZRo0mrdG4qSpEAA */
  createMachine({
    schema: {
      context: {} as {
        canPlay: boolean;
        currentCell: ICell | undefined;
        eligibleNeighbors: ICell[];
        fps: number;
        grid: IGrid | undefined;
        pathId: string;
        stack: ICell[];
        startIndex: number;
      },
      events: {} as
        | {
            type: 'INJECT_REFS';
            gridRef: Ref<IGrid>;
          }
        | {
            type: 'START';
          }
        | {
            type: 'PLAY';
          }
        | {
            type: 'PAUSE';
          }
        | {
            type: 'STEP_FORWARD';
          }
        | {
            type: 'UPDATE';
          }
        | {
            type: 'DONE';
          },
    },
    tsTypes: {} as import('./recursiveBacktrackerMachine.typegen').Typegen0,
    id: 'generationAlgorithmMachine',
    initial: 'maze-idle',
    states: {
      'maze-idle': {
        on: {
          START: {
            target: '#generationAlgorithmMachine.start',
          },
        },
      },
      start: {
        entry: ['initGeneration', 'visitStartCell', 'pushToStack'],
        after: {
          SEEK_INTERVAL: {
            cond: 'canIPlay',
            target: '#generationAlgorithmMachine.seek',
          },
        },
      },
      seek: {
        entry: ['findNeighbors', sendParent('UPDATE')],
        always: {
          target: '#generationAlgorithmMachine.advance',
        },
      },
      advance: {
        entry: ['pickNextCell', 'pushToStack'],
        always: {
          cond: 'isDeadEnd',
          target: '#generationAlgorithmMachine.backtrack',
        },
        after: {
          SEEK_INTERVAL: {
            cond: 'canIPlay',
            target: '#generationAlgorithmMachine.seek',
          },
        },
      },
      backtrack: {
        entry: ['popFromStack'],
        always: [
          {
            cond: 'isBackAtStart',
            target: '#generationAlgorithmMachine.complete',
          },
          {
            target: '#generationAlgorithmMachine.seek',
          },
        ],
      },
      complete: {
        entry: [sendParent('DONE')],
      },
    },
    on: {
      INJECT_REFS: {
        target: '#generationAlgorithmMachine.maze-idle',
      },
      PLAY: {
        actions: ['play'],
        target: '#generationAlgorithmMachine.seek',
      },
      PAUSE: {
        actions: ['pause'],
      },
      STEP_FORWARD: {
        target: '#generationAlgorithmMachine.seek',
      },
    },
  }).withConfig({
    guards: {
      canIPlay: (ctx) => ctx.canPlay,
      isDeadEnd: ({ eligibleNeighbors }) => eligibleNeighbors.length === 0,
      isBackAtStart: ({ stack }) => stack.length === 0,
    },
    actions: {
      initGeneration: assign({
        currentCell: (ctx) => (ctx.grid as IGrid).getStartCell(),
      }),
      visitStartCell: (ctx) => {
        const currentCell = (ctx.grid as IGrid).getStartCell();
        return currentCell.visit(null, ctx.pathId);
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      play: assign({ canPlay: (_) => true }),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      pause: assign({ canPlay: (_) => false }),
      findNeighbors: assign({
        eligibleNeighbors: ({ grid, currentCell }) =>
          (grid as IGrid).getEligibleNeighbors(currentCell as ICell),
      }),
      pickNextCell: assign(({ grid, pathId, startIndex, currentCell }) => {
        const verifiedGrid = grid as IGrid;
        return {
          currentCell: seek({
            grid: verifiedGrid,
            pathId,
            current: currentCell as ICell,
            startIndex,
          }),
        };
      }),
      pushToStack: assign(({ stack, currentCell }) => {
        if (currentCell) {
          stack.push(currentCell);
        }
        return { stack };
      }),
      popFromStack: assign(({ stack }) => {
        const prevCell = stack.pop() as ICell;
        prevCell?.setAsBacktrack();
        return { stack, currentCell: prevCell };
      }),
    },
    delays: {
      SEEK_INTERVAL: ({ fps }) => 1000 / fps,
    },
  });

// const service = interpret(generationAlgorithmMachine).onTransition((state) => {
//   console.log('recursiveBacktrackerMachine:', state.value);
// });

// service.start();
