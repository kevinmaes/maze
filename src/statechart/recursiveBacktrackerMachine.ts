import { createMachine, assign } from 'xstate';
import type {
  MazeGenerationContext,
  MazeGenerationEvent,
  Typestate,
  ICell,
} from './types';

import type { GridMethods } from '../components/generation/Grid';

import { seek } from '../components/generation/seek';
import { Cell } from '../components/generation/Cell';

export const recursiveBacktrakerMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QFsCGAvMBaGA7MATqgC4CWA9rgHSzGoHEDEAHrSWFagGbGFUDKAUUEBpAPoBJAHIAVQQCUAagEEAMolAAHcrFJlKGkM0QA2ACwmqARgAMADgDMdgEwBWG1bNWrJgDQgAT0QsBwBOOyo7M2dQr2dzBw8TAF9k-zRMHDB8In1qWDAwAGtGQ21dPMNjBDMHVyobJytXUNCfVwB2GI7-IIQsGIcqZ2c7Oy6TZzMbMzsbV1T0jGw8QhIKalQIADdUXABjMFKkEHK9DargjtmqaJGO1zNrq0TQ3sRQqlcTNucbUIc3lirUWIAyK2yazynB2e0OLDYvE4PD4QlEklkChU6hOZ0qJ2qVgBVBMdlCzm811GoVco3e-ReHSoHVCpP+JhMVgpzQ6oPBWRy60oVAARqh9kViEQJcctDpzgYCcFvMMHqEOg4zG0oh0OiZXPTmvUHLqXPYHM4wqEZnzlgKoRsqPtyMhNAAbMC8RjyQT8GTKeQyMry-GgarW251TyjGZWcb6+m0hrki0xGymhyTBZpMF21a5DaMaQAKUEAGEZGIfQAxfjBioXJX9PX1OMdZoWRwPWn0qY2EkWTkcqzPTopUG4cgQOCGfn5oXUUgQD31hW4S7NqbMmwmdk2EYzaL0gb6qjhIHXTkW6YOW2ZefQtgMVehozBMJmBquOMteYsurOMe0TGnYP6PLS8RhHeEKCo+hRFC+jZhogLSfNcryZiYmodHYBqBMqjS3L80zuFSP7QfaBbClsuwHGAiGKshDKnpaWrOO2Pzfl0djHrqVBOLM9xmFqszZks96QlR1BihKUrighuIhkhb79GE9SzI0nItC0tQPL2tTDOadgcrUXjmLyOZzpJC5Oi67qevRikNoxKnTJ+jz7hybjst+vb-JE9jRi0cZeWYFEPspeLKdUWA4Z8bYdqSJquD2+H9N+-ZRo0mrdG4qSpEAA */
  createMachine<MazeGenerationContext, MazeGenerationEvent, Typestate>(
    {
      context: {
        settings: {
          gridColumns: 0,
          gridRows: 0,
          startIndex: 0,
          pathId: 'abc',
          fps: 3,
        },
        grid: undefined,
        currentCell: undefined,
        eligibleNeighbors: [],
        stack: [],
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
        INJECT_REFS: {
          target: '#maze-generation.start',
        },
      },
    },
    {
      guards: {
        isDeadEnd: ({ eligibleNeighbors }) => {
          return eligibleNeighbors.length === 0;
        },
        isBackAtStart: ({ stack }) => {
          return stack.length === 0;
        },
      },
      actions: {
        initGeneration: assign(({ settings }, { gridRef, fps }: any) => {
          const newSettings = {
            ...settings,
            gridColumns: gridRef.current.cols,
            gridRows: gridRef.current.rows,
            fps,
          };
          const currentCell = gridRef.current.getStartCell();

          return {
            settings: newSettings,
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
        pickNextCell: assign(({ settings, grid, currentCell }) => ({
          currentCell: seek({
            grid,
            pathId: settings.pathId,
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
        SEEK_INTERVAL: ({ settings: { fps } }) => {
          return 1000 / fps;
        },
      },
    }
  );
