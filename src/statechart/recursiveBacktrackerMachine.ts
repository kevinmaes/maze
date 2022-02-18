import { createMachine, assign } from 'xstate';
import type {
  MazeGenerationContext,
  MazeGenerationEvent,
  Typestate,
  ICell,
  InjectRefsEvent,
} from './recursiveBacktrackerTypes';

import type { GridMethods } from '../components/generation/Grid';

import { seek } from '../components/generation/seek';
import { Cell } from '../components/generation/Cell';

export const recursiveBacktrakerMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QFsCGAvMBaGA7MATqgC4CWA9rgHSzGoHEDEAHrSWFagGbGFUDKAUUEBpAPoBJAHIAVQQCUAagEEAMolAAHcrFJlKGkM0QA2ACwmqARgAMADgDMdgEwBWG1bNWrJgDQgAT0QsBwBOOyo7M2dQr2dzBw8TAF9k-zRMHDB8In1qWDAwAGtGQ21dPMNjBDMHVyobJytXUNCfVwB2GI7-IIQsGIcqZ2c7Oy6TZzMbMzsbV1T0jGw8QhIKalQIADdUXABjMFKkEHK9DargjtmqaJGO1zNrq0TQ3sRQqlcTNucbUIc3lirUWIAyK2yazynB2e0OLDYvE4PD4QlEklkChU6hOZ0qJ2qVgBVBMdlCzm811GoVco3e-ReHSoHVCpP+JhMVgpzQ6oPBWRy60oVAARqh9kViEQJcctDpzgYCcFvMMHqEOg4zG0oh0OiZXPTmvUHLqXPYHM4wqEZnzlgKoRsqPtyMhNAAbMC8RjyQT8GTKeQyMry-GgarW251TyjGZWcb6+m0hrki0xGymhyTBZpMF21a5DaMaQAKUEAGEZGIfQAxfjBioXJX9PX1OMdZoWRwPWn0qY2EkWTkcqzPTopUG4cgQOCGfn5oXUUgQD31hW4S7NqbMmwmdk2EYzaL0gb6qjhIHXTkW6YOW2ZefQtgMVehozBMJmBquOMteYsurOMe0TGnYP6PLS8RhHeEKCo+hRFC+jZhogLSfNcryZiYmodHYBqBMqjS3L80zuFSP7QfaBbClsuwHGAiGKshDKnpaWrOO2Pzfl0djHrqVBOLM9xmFqszZks96QlR1BihKUrighuIhkhb79GE9SzI0nItC0tQPL2tTDOadgcrUXjmLyOZzpJC5Oi67qevRikNoxKnTJ+jz7hybjst+vb-JE9jRi0cZeWYFEPspeLKdUWA4Z8bYdqSJquD2+H9N+-ZRo0mrdG4qSpEAA */
  createMachine<MazeGenerationContext, MazeGenerationEvent, Typestate>(
    {
      context: {
        currentCell: undefined,
        eligibleNeighbors: [],
        fps: 3,
        grid: undefined,
        pathId: 'abc',
        stack: [],
        startIndex: 0,
      },
      id: 'maze-generation',
      initial: 'idle',
      states: {
        idle: {},
        start: {
          entry: ['initGeneration', 'pushToStack'],
          after: {
            SEEK_INTERVAL: {
              target: '#maze-generation.seek',
            },
          },
        },
        seek: {
          entry: 'findNeighbors',
          always: {
            target: '#maze-generation.advance',
          },
        },
        advance: {
          entry: ['pickNextCell', 'pushToStack'],
          after: {
            SEEK_INTERVAL: {
              target: '#maze-generation.seek',
            },
          },
          always: {
            cond: 'isDeadEnd',
            target: '#maze-generation.backtrack',
          },
        },
        backtrack: {
          entry: 'popFromStack',
          always: [
            {
              cond: 'isBackAtStart',
              target: '#maze-generation.complete',
            },
            {
              target: '#maze-generation.seek',
            },
          ],
        },
        complete: {
          on: {
            RESTART: {
              target: '#maze-generation.start',
            },
          },
        },
      },
      on: {
        INJECT_FPS: {
          target: '#maze-generation.idle',
        },
        INJECT_REFS: {
          target: '#maze-generation.idle',
        },
      },
    },
    {
      guards: {
        isDeadEnd: ({ eligibleNeighbors }: MazeGenerationContext) => {
          return eligibleNeighbors.length === 0;
        },
        isBackAtStart: ({ stack }: MazeGenerationContext) => {
          return stack.length === 0;
        },
      },
      actions: {
        initGeneration: assign((ctx, event) => {
          const gridRef: any = (event as InjectRefsEvent).gridRef;
          const currentCell = gridRef.current.getStartCell();

          return {
            ...ctx,
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
        pickNextCell: assign(({ grid, currentCell }) => ({
          currentCell: seek({
            grid,
            pathId: 'abc',
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
        SEEK_INTERVAL: ({ fps }: MazeGenerationContext) => {
          return 1000 / fps;
        },
      },
    }
  );
