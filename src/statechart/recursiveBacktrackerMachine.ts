import { createMachine, assign, sendParent } from 'xstate';

import type { IGrid } from '../components/generation/Grid';

import { seek } from '../components/generation/seek';
import { ICell } from '../components/generation/Cell';
import { Ref } from 'react';

export const generationAlgorithmMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QwHZgE4EMAuBLA9igIIA2U+6u2AFgLYCymAxtbmgHS2YBeYAtLggkwAYgDKAFSIAlCYlAAHfLCoEU8kAA9EfAMwAGAJzsATGYCsARgBshgCyHLu6yesAaEAE9EJ8wA52SwB2YN0-KxN9PycAXxiPVAwcNVJyShoGZlYOWGxMdGwRTVycMHZMADNsDAAKMQBReoBpAH0ASQA5CXrpADUiABkAShFErDxCVIoqOkYWNjKSgo0lFQn1JC0dSzsA-XMg6327IL8TS30TXQ9vBHPrdmidy0MQoP1LqLiEsDRxlLI0wyc2yizAYAA1iIVspVIQNNoEHxXOwggd3n5rNZzLo7C5MTcdOdjGEjH5HK5gpZ-N8QGNkpNAelZlkFuUIAA3TAoJiiGFrNQIolBEzsax2XS6U7vfR2A7mQlIiUBC5hc76XT2ZzmWn09ZTZmZeYcTCc7m8oolarlKq1BrNdpdHr9YajX5JfVMmZG0Hsrk8sD8uEbUCIwyi8zmMyWEyGfTU2UmPyKviOMVmfTYvxBELZyO693-Rlpb0gtkAI2YEOwWCYUKD6yFd2sQXYumeLb8mOzjhTSbsbYl5ylUSCJ10Bb+DOIXuBrLQIk6ACl6gBhCQtaT1ABiYgbgs2iL4QTC7AlhlsJ8xscVvhVbzCESiTgn8TphenBtL89EAAUBkQACa+7woeOi7Po7D6CeOaYnY1J+BqioXKKJhonG5h2PGObvDqb56gCJZzsaf5EAAqg0IEhlsSKRBGRyHNYuiRuYmbXF4iBSq2Bz7JYNjvJYfiSnhPxTp6REsiR4jdL+LTbgA8tIADqMgACJUU2x5Juw4ZYRcfHOOSyF7P21hCQ4LiRoYfhxG+KD4BAcAaARxZApJvpcLwAhCIGmyrMGmnmEcZ64hKlyGFYOZ2LeVhiiKNhhNSQWOJOHqEW5Ppsks2AaWBSLZgEhxGI4jjYriQQphKDyvJKsrQS2TiGK+olpa5hpljk4IQrloaICK5imJcMZmExSZYoqEWBIYcaCbGiHWDYJipUWM4SZlJpmgGPU0Xw4qQTiaHWUEEWnPGKbtroqLBGhx07CcaLWMtn6zu5FZVjWVbbYimLsJhRhOA4VwnH40UcUiujnI8soHCDmEg3xT3iRlHVlEw+C0AowjVF9Pjhm2HanN2t3nZDiFyqccq7PBliI+l7U-jjSJxqKRXTS8Ng4icKZRpd0GxtNEMfCYcq2TEQA */
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
    id: 'generationAlgorithmMachine',
    initial: 'maze-idle',
    states: {
      'maze-idle': {
        on: {
          START: {
            target: 'start',
          },
        },
      },
      start: {
        entry: ['initGeneration', 'visitStartCell', 'pushToStack'],
        after: {
          SEEK_INTERVAL: {
            cond: 'canIPlay',
            target: 'seek',
          },
        },
      },
      seek: {
        entry: ['findNeighbors', sendParent('UPDATE')],
        always: {
          target: 'advance',
        },
      },
      advance: {
        entry: ['pickNextCell', 'pushToStack'],
        after: {
          SEEK_INTERVAL: {
            cond: 'canIPlay',
            target: 'seek',
          },
        },
        always: {
          cond: 'isDeadEnd',
          target: 'backtrack',
        },
      },
      backtrack: {
        entry: 'popFromStack',
        always: [
          {
            cond: 'isBackAtStart',
            target: 'complete',
          },
          {
            target: 'seek',
          },
        ],
      },
      complete: {
        entry: sendParent('DONE'),
      },
    },
    on: {
      INJECT_REFS: {
        target: '.maze-idle',
      },
      PLAY: {
        actions: 'play',
        target: '.seek',
      },
      PAUSE: {
        actions: 'pause',
      },
      STEP_FORWARD: {
        target: '.seek',
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
