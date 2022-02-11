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

export const machine =
  /** @xstate-layout N4IgpgJg5mDOIC5QFsCGAvMBaGA7MATqgC4CWA9rgHSzGoHEDEAHrSWFagGbGFUDKAUUEBpAPoBJAHIAVQQCUAagEEAMolAAHcrFJlKGkM0QBmAOwBWKgEYALADYzJkxfvXHADlsAaEAE9ECwAmGw9rLwBOCwsABnt7DyCIgF9k3zRMHDB8In1qWDAwAGtGQ21dPMNjBFtEqhjrYOsYmNsohIj7XwCELCSQkwiPGLMg2JjzMNT0jGw8QhIKalQIADdUXABjMFKkEHK9JarELDNaqlsgq8tbM+sTGIjuxAiqVwjrIMeTa2sItpSaRAGTm2QWeU4aw22xYbF4nB4fCEokksgUKnUewOlT21SwFk6VCCZns0T+rQizmsz167iszQJZxiFjaZg8nWmwNmWRyi0oVAARqhNkViEQRbstDpDgZcSdfkS3OYImZfiT7K0aY0rOY2V8PCYgoMIq1OSCeeCllRNuRkJoADZgXiMeSCfgyZTyGRlaU40DVe72eqXZkGiwmMNOGlYWzWKgRkauYKJX4xIJm7nzXJLRjSABSggAwjIxK6AGL8H0VI5y3ok+keVUshLmaJBGlBWwxKj2BxueLWO4WEmpIG4cgQOCGc1ZvnUUgQR1VmW4Y51ztUMxxR4aq6tS7RoKkqhDX4qhz3TsTDOZWcQtgMZd+ownQa2eoWcIE5lmSnBaOXDqYQeNEtjBEegw3qCvL3oURRPjW-qBBErwPBMbgtJS9w+P48rxPG4T2H+oxXPYhpQRa2b8is6xbGACGykhtLHkabTEu4USDkEHjRmYZjxl4iTErYbS1BYFF3laQoimKwrwVivqIS+vSfiYm4YVcYF2EMJhakEcaxrEvyfI8XZOBJYJUdQNp2o6vAMautbNK8TZuCGwweLuHbuPGPzsmmEafo4FkwUp2JKXibKvOETYOAalj-rhKnNPGn4TF2WEtIOo7JEAA */
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
