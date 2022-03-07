import { createMachine, assign, interpret, sendParent } from 'xstate';
import {
  MazeGenerationContext,
  MazeGenerationEvent,
  UpdateEvent,
  Typestate,
  ICell,
  ContextGrid,
  MazeGenerationEventId,
} from './recursiveBacktrackerTypes';

import type { GridMethods } from '../components/generation/Grid';

import { seek } from '../components/generation/seek';
import { Cell } from '../components/generation/Cell';

const initialRecursiveBacktrackerMachineContext: MazeGenerationContext = {
  canPlay: false,
  currentCell: undefined,
  eligibleNeighbors: [],
  fps: 3,
  grid: undefined,
  pathId: 'abc',
  stack: [],
  startIndex: 0,
};

export const generationAlgorithmMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QFsCGAvMBaGA7MATqgC4CWA9rgHSzGoHEDEAHrSWFagGbGFUDKAUUEBpAPoBJAHIAVQQCUAagEEAMolAAHcrFJlKGkM0QA2ACwmqARgAMADgDMdgEwBWG1bNWrJgDQgAT0QsBwBOOyo7M2dQr2dzBw8TAF9k-zRMHDB8In1qWDAwAGtGQ21dPMNjBDMHVyobJytXUNCfVwB2GI7-IIQsGIcqZ2c7Oy6TZzMbMzsbV1T0jGw8QhIKalQIADdUXABjMFKkEHK9DargjtmqaJGO1zNrq0TQ3sRQqlcTNucbUIc3lirUWIAyK2yazynB2e0OLDYvE4PD4QlEklkChU6hOZ0qJ2qVgBVBMdlCzm811GoVco3e-ReHSoHVCpP+JhMVgpzQ6oPBWRy60oVAARqh9kViEQJcctDpzgYCcFvMMHqEOg4zG0oh0OiZXPTmvUHLqXPYHM4wqEZnzlgKoRsqPtyMhNAAbMC8RjyQT8GTKeQyMry-GgarW251TyjGZWcb6+m0hrki0xGymhyTBZpMF21a5DaMaQAKUEAGEZGIfQAxfjBioXJX9PX1OMdZoWRwPWn0qY2EkWTkcqzPTopUG4cgQOCGfn5oXUUgQD31hW4S7NqbMmwmdk2EYzaL0gb6qjhIHXTkW6YOW2ZefQtgMVehozBMJmBquOMteYsurOMe0TGnYP6PLS8RhHeEKCo+hRFC+jZhogLSfNcryZiYmodHYBqBMqjS3L80zuFSP7QfaBbClsuwHGAiGKshDKnpaWrOO2Pzfl0djHrqVBOLM9xmFqszZks96QlR1BihKUrighuIhkhb79GE9SzI0nItC0tQPL2tTDOadgcrUXjmLyOZzpJC5Oi67qevRikNoxKnTJ+jz7hybjst+vb-JE9jRi0cZeWYFEPspeLKdUWA4Z8bYdqSJquD2+H9N+-ZRo0mrdG4qSpEAA */
  createMachine<MazeGenerationContext, MazeGenerationEvent, Typestate>({
    context: initialRecursiveBacktrackerMachineContext,
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
        entry: ['initGeneration', 'pushToStack'],
        on: {
          PLAY: {
            actions: ['play'],
            // target: '#generationAlgorithmMachine.seek',
          },
          PAUSE: {
            actions: ['pause'],
          },
        },
        after: {
          SEEK_INTERVAL: {
            target: '#generationAlgorithmMachine.seek',
          },
        },
      },
      seek: {
        entry: ['findNeighbors'],
        always: {
          target: '#generationAlgorithmMachine.advance',
        },
      },
      advance: {
        entry: [
          'pickNextCell',
          'pushToStack',
          sendParent(MazeGenerationEventId.UPDATE),
        ],
        always: {
          cond: 'isDeadEnd',
          target: '#generationAlgorithmMachine.backtrack',
        },
        after: {
          SEEK_INTERVAL: {
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
        type: 'final',
      },
    },
    on: {
      INJECT_REFS: {
        target: '#generationAlgorithmMachine.maze-idle',
      },
    },
  }).withConfig({
    guards: {
      isDeadEnd: ({ eligibleNeighbors }: MazeGenerationContext) => {
        return eligibleNeighbors.length === 0;
      },
      isBackAtStart: ({ stack }: MazeGenerationContext) => {
        return stack.length === 0;
      },
    },
    actions: {
      initGeneration: assign(
        (ctx: MazeGenerationContext, event: MazeGenerationEvent) => {
          const currentCell = (ctx.grid as ContextGrid).getStartCell();

          return {
            ...ctx,
            currentCell,
          };
        }
      ),
      play: assign((ctx) => {
        console.log('child machine received play (assign now)');
        return {
          ...ctx,
          canPlay: true,
        };
      }),
      pause: assign((ctx) => {
        console.log('child machine received pause (assign now)');
        return {
          ...ctx,
          canPlay: false,
        };
      }),
      findNeighbors: assign(({ grid, currentCell }) => ({
        eligibleNeighbors: (grid as GridMethods).getEligibleNeighbors(
          currentCell
        ),
      })),
      // findNeighbors: assign(({ grid, currentCell }) => {
      //   const eligibleNeighbors = (grid as GridMethods).getEligibleNeighbors(
      //     currentCell
      //   );
      //   return {
      //     eligibleNeighbors,
      //   };
      // }),
      pickNextCell: assign(({ grid, pathId, startIndex, currentCell }) => ({
        currentCell: seek({
          grid,
          pathId,
          current: currentCell as Cell,
          startIndex,
        }),
      })),
      // pickNextCell: assign(({ grid, pathId, startIndex, currentCell }) => {
      //   const nextCurrentCell = seek({
      //     grid,
      //     pathId,
      //     current: currentCell as Cell,
      //     startIndex,
      //   });
      //   return {
      //     currentCell: nextCurrentCell,
      //   };
      // }),
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
      SEEK_INTERVAL: ({ fps }: MazeGenerationContext) => {
        return 1000 / fps;
      },
    },
  });

const service = interpret(generationAlgorithmMachine).onTransition((state) => {
  console.log('recursiveBacktrackerMachine:', state.value);
});

service.start();
