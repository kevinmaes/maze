import { createMachine, assign, interpret, sendParent } from 'xstate';
import {
  MazeGenerationContext,
  MazeGenerationEvent,
  Typestate,
  MazeGenerationEventId,
} from './recursiveBacktrackerTypes';

import type { IGrid } from '../components/generation/Grid';

import { seek } from '../components/generation/seek';
import { ICell } from '../components/generation/Cell';

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
        entry: ['initGeneration', 'visitStartCell', 'pushToStack'],
        after: {
          SEEK_INTERVAL: {
            cond: (ctx) => ctx.canPlay,
            target: '#generationAlgorithmMachine.seek',
          },
        },
      },
      seek: {
        entry: ['findNeighbors', sendParent(MazeGenerationEventId.UPDATE)],
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
            cond: (ctx) => ctx.canPlay,
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
        entry: [sendParent(MazeGenerationEventId.DONE)],
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
      isDeadEnd: ({ eligibleNeighbors }: MazeGenerationContext) =>
        eligibleNeighbors.length === 0,
      isBackAtStart: ({ stack }: MazeGenerationContext) => stack.length === 0,
    },
    actions: {
      initGeneration: assign<MazeGenerationContext, MazeGenerationEvent>({
        currentCell: (ctx: MazeGenerationContext) =>
          (ctx.grid as IGrid).getStartCell(),
      }),
      visitStartCell: (ctx: MazeGenerationContext) => {
        const currentCell = (ctx.grid as IGrid).getStartCell();
        return currentCell.visit(null, ctx.pathId);
      },
      play: assign({ canPlay: (_) => true }),
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
      SEEK_INTERVAL: ({ fps }: MazeGenerationContext) => {
        return 1000 / fps;
      },
    },
  });

const service = interpret(generationAlgorithmMachine).onTransition((state) => {
  console.log('recursiveBacktrackerMachine:', state.value);
});

service.start();
