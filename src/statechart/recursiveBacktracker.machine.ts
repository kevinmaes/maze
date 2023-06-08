import { createMachine, assign, sendParent } from 'xstate';

import type { IGrid } from '../components/generation/Grid';

import { seek } from '../components/generation/seek';
import { ICell } from '../components/generation/Cell';
import { Ref } from 'react';

export const generationAlgorithmMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QwHZgE4EMAuBLA9igIIA2U+6u2AFgLYCymAxtbmgMTpgBmsAdGwBWYJtgDaABgC6iUAAd8sKgRSyQAD0QBGAEwAWPnokBWAMwB2AJwTLe8xIAc5gGwAaEAE9EAWl3G+TloSzmamdsaW5gC+Ue6oGDgqpOSUNAzMrBxMhNjo+CT8ciSYHpIySCAKSniEapoIxsZafDo65qYR5sYOls56Wu5eCN46lgG2Tg4OjXo6pjrdMXFgaFg1xGQUVHSMLGxg7NkoufmFmACusGBlalXKtRX1Vg58xnqWWl3m77PO5oOIN46PjzCwOIwOZwSPTOUxLEDxNZJTapHYZfaHHJ5Ap8WDYMByPjcCgAd0w6AgNwqd3WdUQUP8xm+plMwWcvSBAOGQWaxmcC30ej5CxhznhiMShGSWzSu0yYD4tEwAC8wN5cBASAcJetcdhyeJpLdFPdVI9tBJmpZTJYPrbglN5m5PIhTM0jNDzDooQ5dLC9HDYgiVgl1tLUek9mg9Qa2FB2Oo8TgFZhuPj0AAKADKAFEcwBpAD6AEkAHIAFRzACUAGpEAAyAEp2DrkSltpH5TH0HgUFAqfITbTzQhWWNfRIwjDWcZ9JYuZ9mqMvl0JF6tO8dOKQ0ipSiO3L9nws2AwABrOPsAeVIcqOkIBymZyvTdaLQdJ1WBfmJeRJmr9d3m3VZJQ2dtZXRaNMAgAA3TAUCYS9rxpO8RzfH8+GcT4bFaRpwW9b9gRMb1iPMBwdDfExgNDNsZTRKMU1g+DEL7BMk3xPhU3TbM8yLMtK1rBtm1bPdwPortoLghC42Q28HlAJ4zACaZ3wDDoHDXHQuSwvhsI-exJ0iQNlhAsN9wghi+AAI2YM9clspCjWpOSzQU7QOgkEEsNGEItFsS1TC5b1TFeCRHCM31BWM4NTNoiND2jGymDsrBkqQrRykHapULchA-BCppvh0RxGmCPQuSdQxH10eZ3x6S1onhFB8AgOA1BEsC6M7fZjWy+SNFdfwpzMdc+jMJlypdYYKJCsJLGMTTwqFKZqN3Tr4sghUlVVdVNTAXrTXvP1Xh-MLfVhH9LC0qbvCFFofy9KxdHsdkQlW0DwwPTbu17KADuHXLHxBPQhQsCixo6f4pt0Tzaquyd+Unb1GpMmjRK6hKFRPc843+nKBoQKFn1MKYN1GBYmg6BcWRBLRhUhN4-m6aKOs+iyJKY6S+zx-r6nm8wWhB60vV6Ew32p2a6f5BmYS6R93rMsTusS2z7LS7nnL61yCffN1Xm9UZbTI4IFxhEEbBZLRISCPkJC3INWfM8Sj24NhcFgahIB57X6nfKE+AdDdRRtUEKumAJnH9VoSfZaE9BiGIgA */
  createMachine({
    tsTypes: {} as import('./recursiveBacktracker.machine.typegen').Typegen0,
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
            type: 'refs.inject';
            params: { gridRef: Ref<IGrid> };
          }
        | {
            type: 'generation.start';
          }
        | {
            type: 'controls.play';
          }
        | {
            type: 'controls.pause';
          }
        | {
            type: 'controls.step.forward';
          }
        | {
            type: 'display.update';
          },
    },
    id: 'generationAlgorithmMachine',
    initial: 'maze-idle',
    states: {
      'maze-idle': {
        on: {
          'generation.start': {
            target: 'starting',
          },
        },
      },
      starting: {
        entry: ['initGeneration', 'visitStartCell', 'pushToStack'],
        after: {
          SEEK_INTERVAL: {
            cond: 'canIPlay',
            target: 'Seeking',
          },
        },
      },
      Seeking: {
        entry: ['findNeighbors', sendParent({ type: 'display.update' })],
        always: {
          target: 'advancing',
        },
      },
      advancing: {
        entry: ['pickNextCell', 'pushToStack'],
        after: {
          SEEK_INTERVAL: {
            cond: 'canIPlay',
            target: 'Seeking',
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
            target: 'Seeking',
          },
        ],
      },
      finished: {
        entry: sendParent({ type: 'generation.finish' }),
      },
    },
    on: {
      'refs.inject': {
        target: '.maze-idle',
      },
      'controls.play': {
        actions: 'play',
        target: '.Seeking',
      },
      'controls.pause': {
        actions: 'pause',
      },
      'controls.step.forward': {
        target: '.Seeking',
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

// const service = interpret(generationAlgorithmMachine).subscribe((state) => {
//   console.log('recursiveBacktrackerMachine:', state.value);
// });

// service.start();
