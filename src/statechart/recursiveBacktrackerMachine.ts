import { createMachine, assign, sendParent } from 'xstate';

import type { IGrid } from '../components/generation/Grid';

import { seek } from '../components/generation/seek';
import { ICell } from '../components/generation/Cell';
import { Ref } from 'react';

export const generationAlgorithmMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QwHZgE4EMAuBLA9igIIA2U+6u2AFgLYCymAxtbmgMQCSAcgFICiAYQAqAfQBK-AGIBlANoAGALqJQAB3ywqBFKpAAPRAGYAjAoB0ANgDsJgJwBWBQA471y0YfWANCACeiAAsztbmzoEO4XYmDpbOlnaeAL5JvqgYODqk5JQ0DMysHAAKADJEAJqKKkggGlp4hHqGCCYm4WEATA5OliaBpg4dlr4BCIGWDuYKRnbO3f1u1kZGKWlgaFgNxGQUVHSMLGxg7EVEAKoy-FV6ddqNNc2tluYmRoEK4+8hNgodI4ghIzmUzWIaBOwdRYOEyrEDpTZZHa5fYFI7sGTCfhFURSADy4gA6kRxAARa41W5bJqIExDUIRLpeOyBax2BStf5jEJhCJRGJxBIdQKw+GZQjZXZ5A6FMDmWiYABeYAAtLgICRjhjicJyepNHddA8gs5nOZInM3EZnF0JsN-Igfi9mc4jB1Ie9rOMResMlsJcj8oc0OZYNhMOg8CgoOx9KGcLLMAAzbAYAAUl34AGlRDxMeIAGpEEoASnYor9SL2gZlIbDEbYUF1tX1VKNCBNkzaRksETevVZgU5NhMVkcwVp7x74O9GzF2xyVelRxDYDAAGsG+wm5SdNSWiygQlmeyjAozyZ3EOXaPIeyvFPXDPfYiF1LUcHMBAAG6YFBMTfbi2u5tiYEyTKCnoKPM1i-F4nLONM5jjC6thuoEHQITCqRwj6CLipWb5Bgm36-v+UYxnGKbmEmKboOm-BZjm3B5oWJZlrhc7+ou77ET+f4NoB9TAaAjxWoE5i2NatgeKhzKct0pouL8LKMm4DgrNh5YvpKKJEeYABGzBrtgWBMBu5GCQae60h0QKOG4t6ejE0Kcmy4n9FB0LdnYR4dE+eHzjp1bLoZZkmUZAEmNUepCfcIk0rZ4lCpCKXTIELJ2qMzi0malhdDZHj9G8KTYSg+AQHAehafhr66TKNxAXFBiIEMHRWLYjguG4HhwfaCBGNYoTzBeNiRMenr+ZxBF1cu8pKqq6pgA1sWGvF-VdE6lhxN2CQ9pEg59Y69jBK67oKJ6liTRWtXBcGcb1lGy1WW2PamilbwuvtHS0kOfRIa8vReBlnoOFd2kBkud2ruZUBPa2a20gozwzJ8UERIk31DlaYQzJCeXnS6j6aRx11BZDvGkQ2cPCc1LR5UCMRsrEtkIcEzhDhEo4Ie4Zjgm8GlrLOpMQzxBlGeFZlUxSjWrbToEXuYPkfPEvyeqCJjwW4UwuNYkSq8s1jOGDNVk6LiZsLgsDUJA1NNY8tmHjB0yvOMHwYa53IdOyrJDEe0KXSVQA */
  createMachine({
    tsTypes: {} as import('./recursiveBacktrackerMachine.typegen').Typegen0,
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
            params: { gridRef: Ref<IGrid> };
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
    id: 'generationAlgorithmMachine',
    initial: 'maze-idle',
    states: {
      'maze-idle': {
        on: {
          START: {
            target: 'starting',
          },
        },
      },
      starting: {
        entry: ['initGeneration', 'visitStartCell', 'pushToStack'],
        after: {
          SEEK_INTERVAL: {
            cond: 'canIPlay',
            target: 'seeking',
          },
        },
      },
      seeking: {
        entry: ['findNeighbors', sendParent('UPDATE')],
        always: {
          target: 'advancing',
        },
      },
      advancing: {
        entry: ['pickNextCell', 'pushToStack'],
        after: {
          SEEK_INTERVAL: {
            cond: 'canIPlay',
            target: 'seeking',
          },
        },
        always: {
          cond: 'isDeadEnd',
          target: 'backtracking',
        },
      },
      backtracking: {
        entry: 'popFromStack',
        always: [
          {
            cond: 'isBackAtStart',
            target: 'finished',
          },
          {
            target: 'seeking',
          },
        ],
      },
      finished: {
        entry: sendParent('DONE'),
      },
    },
    on: {
      INJECT_REFS: {
        target: '.maze-idle',
      },
      PLAY: {
        actions: 'play',
        target: '.seeking',
      },
      PAUSE: {
        actions: 'pause',
      },
      STEP_FORWARD: {
        target: '.seeking',
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
